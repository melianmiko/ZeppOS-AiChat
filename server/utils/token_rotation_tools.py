import asyncio

from aiohttp import ClientResponse
from aiohttp_socks import ProxyConnector

from ai_chat_handler.exceptions import GeminiException
from utils import secrets, rdb, statistics
from utils.asyncio import send_notify
from utils.log_tools import create_logger

log = create_logger("token_rotate_tools")


def _get_api_token(index):
    if index >= len(secrets["gemini_accounts"]):
        return ""
    return secrets["gemini_accounts"][index]['api']


def _get_proxy(index):
    proxy = secrets["gemini_accounts"][index]["proxy"]
    if proxy is None:
        return None
    return ProxyConnector.from_url(proxy)


class AskNewGeminiToken(ValueError):
    pass


class AskGeminiRestart(ValueError):
    pass


def generator_with_gemini_token(_func):
    # noinspection DuplicatedCode
    async def _inner(*args, **kwargs):
        index = 0
        while True:
            token = _get_api_token(index)
            if token == "" and index > 0:
                await asyncio.sleep(2)
                index = 0
                continue
            elif token == "":
                raise Exception("No usable keys found")
            elif rdb.exists(f"ai:rate_limit_reached:{token}"):
                index += 1
                continue

            try:
                async for y in _func(*args, **kwargs, token=token, token_index=index, proxy=_get_proxy(index)):
                    yield y
                break
            except AskNewGeminiToken:
                # log.exception("Catch AskNewGeminiToken")
                index += 1
            except AskGeminiRestart:
                # log.exception("Catch AskGeminiRestart")
                continue

    _inner.__name__ = _func.__name__
    return _inner


def with_gemini_token(_func):
    # noinspection DuplicatedCode
    async def _inner(*args, **kwargs):
        index = 0
        while True:
            token = _get_api_token(index)
            if token == "" and index > 0:
                await asyncio.sleep(2)
                index = 0
                continue
            elif token == "":
                raise Exception("No usable keys found")
            elif rdb.exists(f"ai:rate_limit_reached:{token}"):
                index += 1
                continue

            try:
                return await _func(*args, **kwargs, token=token, proxy=_get_proxy(index))
            except AskNewGeminiToken:
                index += 1
            except AskGeminiRestart:
                continue

    _inner.__name__ = _func.__name__
    return _inner


async def process_gemini_status(response: ClientResponse, token):
    if response.status == 500:
        log.info(f"Gemini status=500, data={await response.json()}")
        await statistics.increase_split_async("ai_chat", "error")
        await asyncio.sleep(10)
        raise AskGeminiRestart()
    elif response.status == 503:
        log.info("Gemini is overloaded, exit")
        await statistics.increase_split_async("ai_chat", "error")
        return (await response.json())[0]
    elif response.status == 429 or response.status == 403:
        body = await response.json()
        if body[0]["error"]["status"] == "RESOURCE_EXHAUSTED":
            rdb.set(f"ai:rate_limit_reached:{token}", 1)
            rdb.expire(f"ai:rate_limit_reached:{token}", 60)
        elif body[0]["error"]["status"] == "PERMISSION_DENIED":
            await send_notify("AIChat Gemini 403", body[0]["error"].get("message"))
            rdb.set(f"ai:rate_limit_reached:{token}", 1)
            rdb.expire(f"ai:rate_limit_reached:{token}", 3600)
        else:
            log.info(f"Unknown 429 status", body["error"]["status"])
            await asyncio.sleep(5)
        raise AskNewGeminiToken()
    elif response.status != 200:
        await statistics.increase_split_async("ai_chat", "error")
        raise GeminiException(f"Unknown status code {response.status}, data {await response.json()}")
