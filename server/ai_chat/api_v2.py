import json
import random
import uuid

from flask import Blueprint, request

from ai_chat.account import DeviceAccount
from ai_chat.server_config import VOICE_INPUT_COMPATIBILITY, CLIENT_CONFIG, CLIENT_NEWS
from ai_chat.tools import is_overloaded, write_new_user_message, get_server_message
from ai_chat.voice_recognition import zepp_opus_to_wav_base64
from utils import limiter, rdb, statistics
from utils.log_tools import create_logger
from utils.time_based_auth import with_authorization, with_authorization_async

blueprint = Blueprint("api_v2", __name__)
log = create_logger("api_20")


@blueprint.get("/init")
@limiter.limit("1/5 seconds")
@with_authorization
def api_status():
    try:
        assert request.headers.get("Device", None) is not None
    except AssertionError:
        return {"result": False, "error": "Invalid request"}, 400

    device_name, device_id = request.headers.get("Device", "").split(";", 2)
    news = CLIENT_NEWS
    if news["id"] is None:
        news = {**news, "id": random.randint(2000, 5000)}

    result = {
        "result": True,
        "news": news,
        "config": {
            **CLIENT_CONFIG
        }
    }

    if device_id == "0":
        # Generate new UUID
        # TODO: Device join statistics
        result["config"]["device_id"] = str(uuid.uuid4())

    return result, 200


@blueprint.get("/my_limits")
@limiter.limit("1/second")
@with_authorization
def my_limits():
    try:
        assert request.headers.get("Device", None) is not None
    except AssertionError:
        return {"result": False, "error": "Invalid request"}, 400

    device_name, device_id = request.headers.get("Device", "").split(";", 2)
    account = DeviceAccount(device_id)
    return {
        "result": True,
        "usage": account.data["today"],
        "limits": account.daily_limits,
    }


@blueprint.get("/voice/prepare")
@limiter.limit("1/second")
@with_authorization
def prepare_voice_recognition():
    try:
        assert request.headers.get("Device", None) is not None
    except AssertionError:
        return {"result": False, "error": "Invalid request"}, 400

    device_name, device_id = request.headers.get("Device", "").split(";", 2)
    device_firmware = request.headers.get("Device-Firmware", "0.0.0")
    device_firmware = float(device_firmware.rsplit(".", 2)[0])
    account = DeviceAccount(device_id)

    if "voice" in account.data["today"] and account.data["today"]["voice"] >= account.daily_limits["voice"]:
        return {
            "result": False,
            "error": "Daily usage limit reached"
        }, 401
    if device_name not in VOICE_INPUT_COMPATIBILITY:
        log.warning(f"Unknown device tried to use VoiceIME, device_name={device_name}, firmware={device_firmware}")
        return {
            "result": False,
            "error": "Voice input for this device isn't supported now"
        }, 401
    if device_firmware < VOICE_INPUT_COMPATIBILITY[device_name]:
        return {
            "result": False,
            "error": "Update device firmware to use this feature",
            "requiredFirmware": VOICE_INPUT_COMPATIBILITY[device_name]
        }, 401

    return {
        "result": True
    }


@blueprint.route("/chat/<uuid:context_id>/last")
def get_partial(context_id):
    root = f"ai:{context_id}"
    if not rdb.exists(root):
        return {"error": "Chat closed due to timeout"}, 404
    if rdb.get(f"{root}:lock") is None:
        return json.loads(rdb.lindex(root, -1)), 200
    return json.loads(rdb.blpop(f"{root}:partial", 0)[1]), 200


@blueprint.route("/chat", methods=["POST"])
@limiter.limit("1/minute", deduct_when=lambda response: response.status_code != 200)
@limiter.limit("50/day", deduct_when=lambda response: response.status_code != 200)
@with_authorization_async
async def post_message():
    # Ignore requests if server is overloaded
    if is_overloaded():
        statistics.increase_split("ai_chat", "error")
        return {"result": False, "error": "Server is overloaded, try again after ~10 minutes."}, 400

    # Get main parameters
    try:
        device_name, device_id = request.headers.get("Device", ";").split(";", 2)
        context_id = request.headers.get("Context-ID", "")
        assert device_id != "" and device_name != "" and context_id != ""
    except AssertionError:
        return {"result": False, "error": "Invalid request"}, 400

    # Change ContextID, if required
    if context_id == "0":
        context_id = uuid.uuid4()

    # Is chat locked?
    root = f"ai:{context_id}"
    if rdb.get(f"{root}:lock") == "true":
        return {"result": False, "error": "Already processing"}, 400

    # Parse message
    if "text/plain" in request.content_type:
        part = {
            "role": "user",
            "content": request.data.decode("utf-8")
        }
        message_response = part["content"]
        message_type = "text"
    elif "audio/ogg" in request.content_type:
        part = {
            "role": "user",
            "type": "audio/wav",
            "content": await zepp_opus_to_wav_base64(request.data)
        }
        message_response = "[voice data]"
        message_type = "voice"
        statistics.increase_split("ai_chat", "voice_recognize")
    else:
        return {"result": False, "error": "Unknown message type"}, 400

    # Account rate limits
    account = DeviceAccount(device_id)
    if not account.can_send_message(message_type):
        return {"result": False, "error": "Rate limit reached, return later"}, 401

    # Process
    write_new_user_message(context_id, part)
    account_usage = account.increase_message_send(message_type)
    statistics.increase_split("ai_chat", "usage",
                              platform=statistics.zepp_uagent2platform(request.user_agent),
                              country=statistics.cf_country(request.headers),
                              app_version=request.headers.get("X-App-Version", "legacy"),
                              device_name=device_name)

    return {
        "result": True,
        "message": message_response,
        "context_id": context_id,
        "server_message": get_server_message(account_usage)
    }, 200
