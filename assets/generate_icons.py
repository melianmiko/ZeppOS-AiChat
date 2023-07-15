from PIL import Image, ImageDraw
from pathlib import Path
import io
import requests
import os
import subprocess

MUI_ICONS_BASE_URL = "https://github.com/google/material-design-icons/raw/master/symbols/web"

MENU_ICONS = {
	"settings.png": ("settings", "#FFFFFF"),
	"message.png": ("chat", "#FFFFFF"),
	"dialog.png": ("forum", "#FFFFFF"),
	"font_size.png": ("format_size", "#FFFFFF"),
	"about.png": ("info", "#FFFFFF"),
	"keyboard.png": ("keyboard", "#FFFFFF"),
	"privacy.png": ("privacy_tip", "#FF9900"),
}

def main():
	build_menu("common/menu_24", 24)
	build_menu("common/menu_32", 32)


def get_material_symbol(name, size):
	url = f"{MUI_ICONS_BASE_URL}/{name}/materialsymbolsoutlined/{name}_48px.svg"
	r = requests.get(url)
	with open("temp.svg", "wb") as f:
		f.write(r.content)
	subprocess.Popen(["inkscape", f"--export-width={size}",
								  f"--export-type=png",
								  f"--export-background-opacity=0"
								  f"--export-filename=temp.png",
								  "temp.svg"]).wait()
	img = Image.open("temp.png")
	os.remove("temp.svg")
	os.remove("temp.png")
	return img


def build_menu(target, out_size):
	out_dir = Path(target)
	out_dir.mkdir(exist_ok=True)
	for filename in MENU_ICONS:
		print(f"Processing {filename} for {target}")
		icon_name, color = MENU_ICONS[filename]
		mask = get_material_symbol(icon_name, out_size)
		icon = colorize(mask, color)
		icon.save(out_dir / filename)


# ------------------------------------------------------------

def spawn_color_image(size: tuple[int, int], color: str):
    return Image.new("RGBA", size, color=color)


def colorize(mask: Image.Image, color: str):
    fg = Image.new("RGBA", mask.size, color=color)

    mask = mask.convert("RGBA")
    mask_data = mask.getdata()
    fg_data = fg.getdata()

    img_data = list()
    for a, mask_pixel in enumerate(mask_data):
        img_data.append((fg_data[a][0],
                         fg_data[a][1],
                         fg_data[a][2],
                         round(fg_data[a][3] / 255 * mask_pixel[3])))

    # noinspection PyTypeChecker
    fg.putdata(img_data)

    return fg


main()

