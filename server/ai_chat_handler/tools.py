import asyncio
import json

import aiohttp
from python_socks import ProxyConnectionError, ProxyError

from utils import statistics
from utils.log_tools import create_logger
from utils.token_rotation_tools import AskGeminiRestart, generator_with_gemini_token, process_gemini_status

log = create_logger("gemini_connection")
default_model = "gemini-1.5-flash-latest"


@generator_with_gemini_token
async def gemini_generate_response(messages, token, token_index, proxy):
    """
    Send request to Gemini with one of available API keys and get response lines

    :param messages: User content

    :param token: Provided by wrapper, do not add
    :param proxy: Provided by wrapper, do not add
    :param token_index: Provided by wrapper, do not add

    :return: Generator of strings
    """
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/{default_model}:streamGenerateContent"
           f"?key={token}")

    headers = {
        "Content-Type": "application/json",
        "Connection": "keep-alive"
    }

    body = {
        "contents": messages,
    }

    try:
        async with aiohttp.ClientSession(connector=proxy) as session:
            async with session.post(url, headers=headers, json=body) as response:
                user_feedback = await process_gemini_status(response, token)
                if user_feedback:
                    yield user_feedback
                    return

                index = 0
                package = b""
                async for line in response.content:
                    if index == 0 and len(package) == 0:
                        line = line[1:]
                    if line == b",\r\n" or line == b"]":
                        yield json.loads(package.decode("utf8"))
                        package = b""
                        index += 1
                    else:
                        package += line

    except (ProxyConnectionError, ProxyError):
        log.info(f"Proxy connection failed, index={token_index}. Retry in 5s...")
        statistics.increase_split("ai_chat", "error")
        await asyncio.sleep(5)
        raise AskGeminiRestart
    except (aiohttp.ClientError, ConnectionResetError) as e:
        log.info(f"Gemini Connection failed error={e}. Retry in 5s...")
        statistics.increase_split("ai_chat", "error")
        await asyncio.sleep(5)
        raise AskGeminiRestart
