import os

from redis import Redis
from redis.asyncio import Redis as RedisAsync

rdb_host = os.environ.get("REDIS_HOST", "127.0.0.1")
rdb_index = int(os.environ.get("REDIS_DB_INDEX", "1"))
rdb = Redis(host=rdb_host,
            port=6379,
            db=rdb_index,
            decode_responses=True)
rdb_async = RedisAsync(host=rdb_host,
                       port=6379,
                       db=rdb_index,
                       decode_responses=True)


def increase_split(app, action, count=1, **kwargs):
    # Global
    redis_key = f"prometheus:app_{app}_{action}_total"
    rdb.incrby(redis_key, count)

    # Tags
    for key in kwargs:
        redis_key = f"prometheus:app_{app}_{action}_per_{key}_count"
        redis_key += "{" + str(key) + "=\"" + str(kwargs[key]) + "\"}"
        rdb.incrby(redis_key, count)


async def increase_split_async(app, action, count=1, **kwargs):
    # Global
    redis_key = f"prometheus:app_{app}_{action}_total"
    await rdb_async.incrby(redis_key, count)

    # Tags
    for key in kwargs:
        redis_key = f"prometheus:app_{app}_{action}_per_{key}_count"
        redis_key += "{" + str(key) + "=\"" + str(kwargs[key]) + "\"}"
        await rdb_async.incrby(redis_key, count)


def zepp_uagent2platform(user_agent):
    user_agent = str(user_agent)
    if "okhttp" in user_agent:
        return "Android"
    elif "iOS" in user_agent:
        return "iOS"
    return "Unknown"


def cf_country(headers):
    return "N/A" if "CF-IPCountry" not in headers else headers["CF-IPCountry"]
