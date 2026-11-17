# -*- coding: utf-8 -*-
"""生成 1200x630 的生日祝福分享卡片。

用法：python tools/make-share-card.py
输出：assets/share-card.png
"""
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "share-card.png")

FONT_CANDIDATES = [
    "C:/Windows/Fonts/STKAITI.TTF",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/msyh.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
]


def load_font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def main():
    random.seed(20261117)

    grad = Image.new("RGB", (1, H))
    px = grad.load()
    for y in range(H):
        t = y / (H - 1)
        px[0, y] = (int(4 + 18 * t), int(6 + 14 * t), int(16 + 42 * t))
    img = grad.resize((W, H), Image.BILINEAR).convert("RGBA")

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W * 0.12, -H * 0.55, W * 0.88, H * 0.72], fill=(255, 176, 64, 26))
    gd.ellipse([-W * 0.25, H * 0.15, W * 0.55, H * 1.5], fill=(255, 92, 138, 22))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    for _ in range(150):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.choice([1, 1, 1, 2])
        alpha = random.randint(40, 170)
        draw.ellipse([x, y, x + r, y + r], fill=(255, 255, 255, alpha))

    gold = (255, 214, 102, 255)
    soft = (232, 234, 246, 235)
    muted = (168, 172, 200, 210)

    f_small = load_font(26)
    f_title = load_font(140)
    f_sub = load_font(34)
    f_bottom = load_font(24)

    def center(text, font, cy, fill):
        box = draw.textbbox((0, 0), text, font=font)
        x = (W - (box[2] - box[0])) / 2 - box[0]
        y = cy - (box[3] - box[1]) / 2 - box[1]
        draw.text((x, y), text, font=font, fill=fill)

    center("H A P P Y   B I R T H D A Y", f_small, 82, gold)
    center("生日快乐", f_title, 205, gold)
    center("有一份特别的礼物，等你亲手打开", f_sub, 312, soft)

    cx = W // 2
    draw.ellipse([cx - 168, 540, cx + 168, 574], fill=(212, 216, 232, 90))
    draw.rounded_rectangle([cx - 132, 506, cx + 132, 544], radius=16, fill=(255, 183, 77, 255))
    draw.rounded_rectangle([cx - 104, 472, cx + 104, 508], radius=15, fill=(255, 213, 79, 255))
    draw.rounded_rectangle([cx - 74, 442, cx + 74, 473], radius=14, fill=(255, 236, 179, 255))
    draw.rounded_rectangle([cx - 7, 398, cx + 7, 444], radius=6, fill=(211, 84, 0, 255))
    draw.ellipse([cx - 11, 368, cx + 11, 402], fill=(255, 138, 0, 235))
    draw.ellipse([cx - 6, 379, cx + 6, 399], fill=(255, 241, 118, 255))

    center("许愿  ·  吹蜡烛  ·  拆礼物", f_bottom, 600, muted)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print("saved:", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()