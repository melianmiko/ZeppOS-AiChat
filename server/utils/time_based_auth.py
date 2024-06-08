from array import array
from math import floor
from time import time

from flask import request

from utils import secrets


def _check_auth():
    key_arr = secrets["app_secret"]
    auth = request.headers.get("Authorization")
    if auth is None or "Token" not in auth:
        return {"result": False, "error": "Please, update application."}, 401

    try:
        token = int(auth.split(" ")[1])
        assert token == get_tba_token(key_arr)
    except (ValueError, AssertionError):
        return {"result": False, "error": "Validation failed, ensure that date and time are valid."}, 401


def with_authorization(_func):
    def _inner(*args, **kwargs):
        _check_auth()
        return _func(*args, **kwargs)
    _inner.__name__ = _func.__name__
    return _inner


def with_authorization_async(_func):
    async def _inner(*args, **kwargs):
        _check_auth()
        return await _func(*args, **kwargs)
    _inner.__name__ = _func.__name__
    return _inner


def get_tba_token(key_arr):
    key_arr[0] = floor(time() / 60 / 60)
    return crc32(key_arr)


def make_crc32_table(polynom=0xD5828281):
    table = array("L")
    for i in range(256):
        fwd = i
        for j in range(8, 0, -1):
            if (fwd & 1) == 1:
                fwd = (fwd >> 1) ^ polynom
            else:
                fwd >>= 1
        table.append(fwd & 0xffffffff)
    return table


default_table = make_crc32_table()


def crc32(arr, table=default_table):
    crc = 0xffffffff
    for c in arr:
        crc = (crc >> 8) ^ table[(crc ^ c) & 0xff]
    return crc ^ 0xffffffff
