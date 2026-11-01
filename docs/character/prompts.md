# Character prompts (ChatGPT, free)

Make all images in ONE ChatGPT chat so the character stays the same.
Save every result as PNG into `docs/character/raw/` with the file name shown.
I cut, size and convert them to WebP for the site.

## Step 1: master design (attach `public/img/photo.webp`)

```
Turn the man in this photo into a stylised illustrated character for my portfolio website.
Keep his likeness: swept-back dark hair with volume on top, thin round metal-frame glasses,
short beard and moustache, warm brown skin. Outfit: open dark espresso-brown shirt over a cream t-shirt.
Over-ear headphones, cream with saffron (#E8A13A) ear cushions, resting on his head.
Style: clean modern illustration with soft matte shading, slightly oversized head (about 1:4 body ratio),
friendly expressive eyes, crisp edges. Not a glossy 3D render, not anime, no outlines thicker than 2px.
Scene: he sits at a small wooden editing desk, front view, working on a plain silver laptop with no logo.
A tiny saffron clapperboard sticker on the laptop lid. Desk edge runs across the bottom of the frame.
Framing: waist up behind the desk, centred, head in the upper third, lots of empty space around him.
Transparent background, PNG, 1024x1024. No text, no watermark.
```
Save as `00_master.png`. If the likeness is off, say what to fix and regenerate before going on.

## Step 2: poses (same chat, one message each)

Start every message with:
```
Same character, same outfit, same desk, same laptop, same camera, same scale and position,
transparent background, 1024x1024. Only change:
```
Then add one line:

| File | Only change |
|---|---|
| `01_work.png` | eyes down on the laptop, typing, calm focused smile |
| `02_blink.png` | exactly like 01_work but eyes closed (a blink) |
| `03_look_left.png` | head and eyes turned to HIS right (our left), curious raised eyebrow, hands still on keyboard |
| `04_look_right.png` | head and eyes turned to HIS left (our right), curious raised eyebrow, hands still on keyboard |
| `05_caught.png` | headphones pulled down around his neck, surprised happy face, pointing straight at the viewer |
| `06_wave.png` | looking at the viewer, big smile, one hand raised in a wave |

## Checklist before sending
- Same face, glasses, hair and clothes in every image. The character lives in the hero only.
- Desk and laptop in the same place in every image (so poses swap without a jump).
- Background is transparent (checkerboard in ChatGPT's preview), not white.
