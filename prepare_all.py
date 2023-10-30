from pathlib import Path
from PIL import Image
import json
import shutil
import os

project = Path(".").resolve()
common_assets = project / "assets" / "common"
library_assets = project / "lib" / "mmk" / "assets"
low_ram_devices = ["band-7", "mi-band-7"]

target_icon_size = {
  "gts-4-mini": 80,
  "mi-band-7": 100,
  "band-7": 100,
  "t-rex-ultra": 124,
  "gtr-mini": 124,
  "bip-5": 124,
  "active": 248,
  "active_edge": 248,
  "balance": 248,
  "gtr-4": 248,
  "gts-4": 124,
  "falcon": 80,
  "cheetah": 124,
  "cheetah-pro": 124,
  "cheetah-square": 124,
  "gtr-3-pro": 92,
  "gtr-3": 86,
  "gts-3": 92,
  "t-rex-2": 86,
}

pages = [
  "HomeScreen",
  "KeyboardScreen",
  "ChatViewScreen",
  "SettingsScreen",
  "AboutScreen",
  "ScreenBoardSetup",
  "PrivacyWarningScreen",
  "FontSetupScreen",
  "DonateScreen",
]

module = {
  "app-side": {
    "path": "app-side/index"
  },
  "setting": {
    "path": "setting/index"
  }
}

app_icon_src = Image.open(common_assets / "icon.png")
app_icon = Image.new("RGB", app_icon_src.size, color="#000000")
app_icon.paste(app_icon_src)
about_icon = app_icon.copy()
about_icon.thumbnail((100, 100))

with open("app.json", "r") as f:
  app_json = json.load(f)


# Prepare assets
for target_id in app_json["targets"]:
  icon_size = 32
  qr_file = "qr_normal.png"

  if target_id in low_ram_devices:
    icon_size = 24
    qr_file = "qr_small.png"

  assets_dir = project / "assets" / target_id
  if assets_dir.is_dir():
    shutil.rmtree(assets_dir)
  assets_dir.mkdir()

  # App icon
  app_icon_size = target_icon_size[target_id]
  icon_item = app_icon.copy()
  icon_item.thumbnail((app_icon_size, app_icon_size))
  icon_item.save(assets_dir / "icon.png")

  # Misc files
  about_icon.save(assets_dir / "icon_about.png")
  shutil.copytree(common_assets / f"menu_{icon_size}", assets_dir / "menu")
  shutil.copytree(library_assets / "screen_board", assets_dir / "screen_board")

  shutil.copy(common_assets / qr_file, assets_dir / "qr.png")

  # App.json
  app_json["targets"][target_id]["module"] = {
    "page": {
      "pages": [f"page/{i}" for i in pages]
    },
    **module
  }

with open("app.json", "w") as f:
  f.write(json.dumps(app_json, indent=2, ensure_ascii=False))
