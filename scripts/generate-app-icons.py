#!/usr/bin/env python3

from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Pillow is required to generate app icons. Install it with `python3 -m pip install pillow`.") from exc


ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
ANDROID_RES_DIR = ROOT / "android" / "app" / "src" / "main" / "res"
OUTPUT_BACKGROUND = "#FFF8EE"
ROLE_IMAGE_NAMES = {
    "groom": "예비신랑.png",
    "bride": "예비신부.png",
}
ANDROID_SQUARE_SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}
ANDROID_FOREGROUND_SIZES = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def crop_role_portrait(name: str) -> Image.Image:
    image = Image.open(PUBLIC_DIR / name).convert("RGBA")
    width, height = image.size
    crop_size = int(min(width * 0.72, height * 0.72))
    left = int((width - crop_size) / 2)
    top = int(height * 0.08)
    box = (left, top, left + crop_size, top + crop_size)
    return image.crop(box)


def resize_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    source_ratio = image.width / image.height
    target_ratio = size[0] / size[1]

    if source_ratio > target_ratio:
        resized_height = size[1]
        resized_width = round(resized_height * source_ratio)
    else:
        resized_width = size[0]
        resized_height = round(resized_width / source_ratio)

    resized = image.resize((resized_width, resized_height), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - size[0]) // 2)
    top = max(0, (resized.height - size[1]) // 2)
    return resized.crop((left, top, left + size[0], top + size[1]))


def circle_crop(image: Image.Image, size: int) -> Image.Image:
    portrait = resize_cover(image, (size, size))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(portrait, (0, 0), mask)
    return result


def add_shadow(base: Image.Image, diameter: int, center: tuple[int, int], blur: int) -> None:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    x, y = center
    half = diameter / 2
    draw.ellipse((x - half, y - half + diameter * 0.04, x + half, y + half + diameter * 0.04), fill=(132, 92, 68, 50))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow)


def draw_heart(draw: ImageDraw.ImageDraw, center: tuple[int, int], size: float, fill: tuple[int, int, int, int]) -> None:
    cx, cy = center
    radius = size * 0.24
    draw.ellipse((cx - radius - radius * 0.75, cy - radius, cx - radius * 0.75, cy + radius), fill=fill)
    draw.ellipse((cx - radius * 0.25, cy - radius, cx + radius * 1.25, cy + radius), fill=fill)
    draw.polygon(
        [
            (cx - size * 0.52, cy + radius * 0.15),
            (cx + size * 0.52, cy + radius * 0.15),
            (cx, cy + size * 0.7),
        ],
        fill=fill,
    )


def draw_background(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), OUTPUT_BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    center = size / 2
    for y in range(size):
        distance = abs(y - center) / max(center, 1)
        mix = max(0.0, min(1.0, 1.0 - distance * 0.85))
        red = round(255 * (1 - mix) + 253 * mix)
        green = round(248 * (1 - mix) + 236 * mix)
        blue = round(238 * (1 - mix) + 228 * mix)
        draw.line((0, y, size, y), fill=(red, green, blue, 255))

    orb_size = size * 0.78
    orb_box = (
        center - orb_size / 2,
        center - orb_size / 2,
        center + orb_size / 2,
        center + orb_size / 2,
    )
    draw.ellipse(orb_box, fill=(255, 242, 230, 255))
    return canvas


def create_foreground(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    portraits = {
        role: crop_role_portrait(filename)
        for role, filename in ROLE_IMAGE_NAMES.items()
    }
    portrait_size = int(size * 0.43)
    centers = {
        "groom": (int(size * 0.36), int(size * 0.52)),
        "bride": (int(size * 0.64), int(size * 0.52)),
    }

    for role in ("groom", "bride"):
        add_shadow(canvas, portrait_size, centers[role], max(2, round(size * 0.015)))
        framed = Image.new("RGBA", (portrait_size, portrait_size), (0, 0, 0, 0))
        framed_draw = ImageDraw.Draw(framed)
        framed_draw.ellipse((0, 0, portrait_size - 1, portrait_size - 1), fill=(255, 255, 255, 238))
        inner = circle_crop(portraits[role], int(portrait_size * 0.88))
        offset = (portrait_size - inner.width) // 2
        framed.alpha_composite(inner, (offset, offset))
        position = (centers[role][0] - portrait_size // 2, centers[role][1] - portrait_size // 2)
        canvas.alpha_composite(framed, position)

    draw = ImageDraw.Draw(canvas)
    draw_heart(draw, (size // 2, int(size * 0.31)), size * 0.14, (245, 127, 165, 255))
    draw.ellipse((size * 0.17, size * 0.28, size * 0.22, size * 0.33), fill=(246, 181, 58, 220))
    draw.ellipse((size * 0.79, size * 0.68, size * 0.84, size * 0.73), fill=(102, 180, 220, 220))
    return canvas


def create_master_icon(size: int, round_mask: bool = False) -> Image.Image:
    background = draw_background(size)
    foreground = create_foreground(size)
    background.alpha_composite(foreground)

    if round_mask:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
        rounded = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        rounded.paste(background, (0, 0), mask)
        return rounded

    return background


def save_png(image: Image.Image, path: Path, size: int) -> None:
    ensure_parent(path)
    image.resize((size, size), Image.Resampling.LANCZOS).save(path, format="PNG")


def write_favicon(master_icon: Image.Image) -> None:
    favicon_path = PUBLIC_DIR / "favicon.ico"
    ensure_parent(favicon_path)
    master_icon.save(
        favicon_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )


def write_web_icons(master_icon: Image.Image) -> None:
    write_favicon(master_icon)
    save_png(master_icon, PUBLIC_DIR / "favicon-32x32.png", 32)
    save_png(master_icon, PUBLIC_DIR / "apple-touch-icon.png", 180)
    save_png(master_icon, PUBLIC_DIR / "icon-512.png", 512)


def write_android_icons(master_icon: Image.Image, round_icon: Image.Image, foreground: Image.Image) -> None:
    for density, size in ANDROID_SQUARE_SIZES.items():
        res_dir = ANDROID_RES_DIR / f"mipmap-{density}"
        save_png(master_icon, res_dir / "ic_launcher.png", size)
        save_png(round_icon, res_dir / "ic_launcher_round.png", size)

    for density, size in ANDROID_FOREGROUND_SIZES.items():
        res_dir = ANDROID_RES_DIR / f"mipmap-{density}"
        save_png(foreground, res_dir / "ic_launcher_foreground.png", size)


def write_background_xml() -> None:
    output = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFF8EE</color>
</resources>
"""
    path = ANDROID_RES_DIR / "values" / "ic_launcher_background.xml"
    ensure_parent(path)
    path.write_text(output, encoding="utf8")


def main() -> None:
    master_icon = create_master_icon(1024)
    round_icon = create_master_icon(1024, round_mask=True)
    foreground = create_foreground(1024)

    write_web_icons(master_icon)
    write_android_icons(master_icon, round_icon, foreground)
    write_background_xml()


if __name__ == "__main__":
    main()
