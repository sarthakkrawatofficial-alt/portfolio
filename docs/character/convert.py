"""Raw ChatGPT pose PNGs (docs/character/raw) -> site WebPs (public/img/me).

Each pose gets a 1100px (desktop/retina) and a 600px (phone) WebP. A pose with no raw file
falls back to the work pose so the hero never shows a gap. Run: python3 docs/character/convert.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(ROOT, "raw")
OUT = os.path.join(ROOT, "..", "..", "public", "img", "me")
POSES = {"work": "01_work", "blink": "02_blink", "lookL": "03_look_left", "lookR": "04_look_right",
         "caught": "05_caught", "wave": "06_wave"}

os.makedirs(OUT, exist_ok=True)
for pose, raw in POSES.items():
    fallback = "01_work"
    src = os.path.join(RAW, raw + ".png")
    if not os.path.exists(src):
        src = os.path.join(RAW, fallback + ".png")
    im = Image.open(src).convert("RGBA")
    for size, suffix in ((1100, ""), (600, "-sm")):
        im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, f"{pose}{suffix}.webp"), "WEBP", quality=82, method=6)
    print(pose, "<-", os.path.basename(src))
