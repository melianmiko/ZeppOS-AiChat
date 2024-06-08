import json

from utils import rdb


def is_overloaded():
    if rdb.exists("ai:queue_lock"):
        return True
    elif rdb.llen(f"ai:queue") > 80:
        rdb.set("ai:queue_lock", 1)
        rdb.expire("ai:queue_lock", 1200)
        return True
    else:
        return False


def get_server_message(account_usage):
    if rdb.llen(f"ai:queue") > 40:
        server_message = {"role": "system", "content": "Note: current server load is very high, so handling of your "
                                                       "message may take some time..."}
    elif account_usage % 20 == 0:
        server_message = {"role": "donate", "content": "Like this app? We're paying for servers to provide "
                                                       "this service to you for free. Consider to make a donations: "
                                                       "https://mmk.pw/en/donate"}
    else:
        server_message = None

    return server_message


def write_new_user_message(context_id, new_message):
    root = f"ai:{context_id}"
    new_length = rdb.rpush(root, json.dumps(new_message))
    if new_length == 1:
        rdb.expire(root, 3600 * 2)

    rdb.delete(f"{root}:partial")
    rdb.set(f"{root}:lock", "true")
    rdb.expire(f"{root}:lock", 3600 * 2)

    rdb.rpush(f"ai:queue", str(context_id))
    rdb.expire(f"ai:queue", 3600 * 2)
