import asyncio
import json

import redis.exceptions

from ai_chat_handler.tools import gemini_generate_response
from utils import statistics
from utils.asyncio import rdb
from utils.log_tools import create_logger

MAX_TOKEN_PER_MESSAGE = 600
PARTIAL_LENGTH = 50
COUNT_THREADS = 12

_crash_log = create_logger("ai_chat_handler")


def convert_role(role):
    # TODO: Change role types in device app and drop that shit
    if role == "assistant":
        return "model"
    return role


def msg2content(msg):
    part = {
        "text": msg["content"]
    } if "type" not in msg else {
        "inlineData": {
            "data": msg["content"],
            "mimeType": msg["type"]
        }
    }

    return {
        "parts": [part],
        "role": convert_role(msg["role"])
    }


async def handle_request(context_id):
    root = f"ai:{context_id}"

    # Build previous messages stack
    messages = []
    for msg in await rdb.lrange(root, 0, -1):
        msg = json.loads(msg)
        if msg["role"] == "error":
            continue
        content = msg2content(msg)
        messages.append(content)
    if messages is None or len(messages) == 0:
        return

    # Start stream read
    current_part = ""
    current_role = "assistant"
    finish_reason = None
    last_send_len = 0
    data = {}
    async for data in gemini_generate_response(messages):
        # Parse chunks
        if "error" in data:
            if data["error"]["status"] != "INTERNAL":
                _crash_log.info(f"Gemini error: {json.dumps(data)}")
            current_role = "assistant"
            current_part = data["error"].get("message", "Gemini-side error")
            finish_reason = "ERROR"
            await statistics.increase_split_async("ai_chat", "error")
        elif "candidates" in data:
            candidates = data["candidates"]
            for candidate in candidates:
                if "finishReason" in candidate:
                    finish_reason = candidate["finishReason"]
                if "content" in candidate:
                    for part in candidate["content"]["parts"]:
                        current_part += part["text"]
        else:
            await statistics.increase_split_async("ai_chat", "error")
            raise Exception(f"Got unknown stream block {data}")

        # Push to client
        if len(current_part) - last_send_len > PARTIAL_LENGTH:
            await rdb.rpush(f"ai:{context_id}:partial", json.dumps({
                "role": current_role,
                "content": f"{current_part}...",
                "finish_reason": None
            }))
            last_send_len = len(current_part)

    # Count used tokens
    count_used = 0
    if "usageMetadata" in data and "totalTokenCount" in data["usageMetadata"]:
        count_used = data["usageMetadata"]["totalTokenCount"]
    await statistics.increase_split_async("ai_chat", "gemini_tokens_used", count_used)

    # Task complete, push all to log
    return {
        "role": current_role,
        "content": current_part,
        "finish_reason": finish_reason,
        "index": await rdb.llen(root)
    }


async def handler(name: str):
    print(f"Starting handler coro {name}...")
    while True:
        try:
            _, context_id = await rdb.blpop("ai:queue")
        except redis.exceptions.ConnectionError:
            _crash_log.info(f"{name}: Can't connect to redis, sleep for 5s and retry...")
            await statistics.increase_split_async("ai_chat", "error")
            await asyncio.sleep(5)
            continue

        root = f"ai:{context_id}"

        # noinspection PyBroadException
        try:
            full_message = await handle_request(context_id)
        except Exception:
            _crash_log.exception("Unknown error")
            full_message = {
                "role": "error",
                "content": "Server-side error",
                "finish_reason": "stop",
                "index": await rdb.llen(root),
            }

        # Write full message, cleanup
        full_message = json.dumps(full_message)
        await rdb.rpush(root, full_message)
        await rdb.delete(f"{root}:partial")
        await rdb.rpush(f"{root}:partial", full_message)
        await rdb.expire(f"{root}:partial", 3600)
        await rdb.delete(f"{root}:lock")

        # Statistics
        await statistics.increase_split_async("ai_chat", "requests_handled")


async def main():
    handlers = [asyncio.create_task(handler(f"handler{i}")) for i in range(COUNT_THREADS)]
    await asyncio.gather(*handlers)


if __name__ == "__main__":
    asyncio.run(main())
