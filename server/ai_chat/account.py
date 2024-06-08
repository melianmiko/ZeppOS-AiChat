import json
from datetime import date

from utils import rdb

DEFAULT_LIMITS = {
    "total": 30,
    "text": 30,
    "voice": 20,
}


class DeviceAccount:
    # TODO: Migrate to PostgresSQL
    def __init__(self, uuid: str):
        self.uuid = uuid
        self.daily_limits = DEFAULT_LIMITS
        self.data = {}                          # type: dict[str, any]
        try:
            self.data = json.loads(rdb.get(f"ai:account:{uuid}"))
        except (json.JSONDecodeError, TypeError):
            pass

        # Reset day if required
        today = str(date.today())
        if self.data.get("today_date") != today:
            self.data["today"] = {}
            self.data["today_date"] = today
            self._save()

    def can_send_message(self, msg_type: str):
        total_used = self.data["today"].get("total") or 0
        type_used = self.data["today"].get(msg_type) or 0
        return total_used < self.daily_limits["total"] and type_used < self.daily_limits[msg_type]

    def increase_message_send(self, msg_type: str):
        self.data["today"] = {
            **(self.data["today"]),
            "total": (self.data["today"].get("total") or 0) + 1,
            msg_type: (self.data["today"].get(msg_type) or 0) + 1,
        }
        self.data["total"] = (self.data.get("total") or 0) + 1
        self._save()
        return self.data["total"]

    def _save(self):
        # print("Write account", self.uuid, "data", self.data)
        rdb.set(f"ai:account:{self.uuid}", json.dumps(self.data))
