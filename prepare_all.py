from pathlib import Path
import json
import shutil
import os

project = Path(".").resolve()
common_assets = project / "assets" / "common"
library_assets = project / "lib" / "mmk" / "assets"
low_ram_devices = ["band-7", "mi-band-7"]

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

  # Misc files
  shutil.copytree(common_assets / f"menu_{icon_size}", assets_dir / "menu")
  shutil.copytree(library_assets / "screen_board", assets_dir / "screen_board")

  shutil.copy(common_assets / "icon.png", assets_dir / "icon.png")
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
