import os

import aiohttp
from redis.asyncio import Redis

_redis_host = os.environ.get("REDIS_HOST", "127.0.0.1")
_redis_db_index = int(os.environ.get("REDIS_DB_INDEX", "3"))

rdb = Redis(host=_redis_host,
            db=_redis_db_index,
            port=6379,
            decode_responses=True)


async def send_notify(title: str = "", body: str = "", click_url: str = "", urls: dict[str, str] = None,
                      tags: list[str] = None):
    # Not included to FOSS version
    pass
