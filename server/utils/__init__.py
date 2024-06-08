import json
import os
import shutil

import redis
import requests
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

_secrets_path = os.environ.get("SECRETS_PATH", "data/secrets.json")
_redis_host = os.environ.get("REDIS_HOST", "127.0.0.1")
_redis_db_index = int(os.environ.get("REDIS_DB_INDEX", "3"))

if not os.path.isfile(_secrets_path):
    shutil.copy("secrets_example.json", _secrets_path)

with open(_secrets_path, "r") as f:
    secrets = json.loads(f.read())


rdb = redis.Redis(host=_redis_host,
                  db=_redis_db_index,
                  port=6379,
                  decode_responses=True)

limiter = Limiter(get_remote_address,
                  storage_uri=f"redis://{_redis_host}:6379/{_redis_db_index}",
                  key_prefix="limiter")


def send_notify2(title: str = "", body: str = "", click_url: str = "", urls: dict[str, str] = None, tags: list[str] = None):
    # Not included to FOSS version
    pass
