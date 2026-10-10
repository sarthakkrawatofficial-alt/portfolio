"""Shot plan for the showreel, locked to the music's beat grid.

Writes plan.json (read by reel.html) and extracts each shot's frames to f/<id>/0001.jpg…
Run:  python3 -I plan.py [--extract]
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "src")
FPS = 30
P = 0.52245          # beat length (s) — 64 beats between the drop (17.995) and the breakdown (51.432)
D = 8.96             # reel time of the drop
MUSIC_DROP = 17.995  # music time of the drop
OFFSET = MUSIC_DROP - D

def B(k):  # reel time of beat k (k=0 is the drop)
    return round(D + k * P, 4)

LAND = (1920, 1080)
VERT = (608, 1080)

shots = []
def shot(id, src, t_in, k0, beats, kind="land", **extra):
    w, h = LAND if kind == "land" else VERT
    start, end = B(k0), B(k0 + beats)
    shots.append(dict(id=id, src=src, t_in=t_in, kind=kind, w=w, h=h, start=start, dur=round(end - start, 4), k0=k0, beats=beats, **extra))

# 01 — Motion design (EstateWithShivam · Dubai Maritime City)
dubai = [6.0, 26.0, 51.0, 86.5, 117.0, 161.0, 187.3, 206.0, 233.5, 300.9, 354.0, 491.5]
framed = {3, 7}
for i, t in enumerate(dubai):
    shot(f"d{i+1:02d}", "dubai.mp4", t, 2 + i * 2, 2, framed=(i in framed))

# 02 — Short-form
shot("t1", "cheese_factory.mp4", 5.0, 28, 4, "vert", slot=0)
shot("t2", "cf_miniature.mp4", 4.0, 28, 4, "vert", slot=1)
shot("t3", "frappik.mp4", 0.5, 28, 4, "vert", slot=2)
shot("c1", "cheese_factory.mp4", 16.6, 32, 4, "vert")
for i, (t, col) in enumerate([(0.5, "#F2C200"), (2.5, "#2E7D32"), (8.5, "#D3242B"), (12.3, "#D3242B")]):
    shot(f"f{i+1}", "frappik.mp4", t, 36 + i, 1, "vert", bg=col)

# 03 — Cinematic (Jaypee Greens)
for i, t in enumerate([8.0, 16.0, 37.0, 48.0, 89.0, 225.0, 240.0, 268.0]):
    shot(f"j{i+1}", "jaypee.mp4", t, 42 + i * 2, 2)

# quick-fire under the numbers
for i, (src, t, kind) in enumerate([("dubai.mp4", 126.0, "land"), ("jaypee.mp4", 0.5, "land"), ("dubai.mp4", 456.0, "land"),
                                     ("jaypee.mp4", 270.0, "land"), ("dubai.mp4", 372.0, "land"), ("jaypee.mp4", 3.0, "land")]):
    shot(f"q{i+1}", src, t, 58 + i, 1, kind)

END_BEAT = 76
plan = dict(fps=FPS, P=P, D=D, offset=OFFSET, duration=B(END_BEAT), shots=shots)
json.dump(plan, open(os.path.join(HERE, "plan.json"), "w"), indent=1)
print(f"duration {plan['duration']}s · music offset {OFFSET:.3f}s · {len(shots)} shots")

if "--extract" in sys.argv:
    for s in shots:
        out = os.path.join(HERE, "f", s["id"])
        os.makedirs(out, exist_ok=True)
        n = int(s["dur"] * FPS) + 8
        vf = f"fps={FPS},scale={s['w']}:{s['h']}:force_original_aspect_ratio=increase,crop={s['w']}:{s['h']}"
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-ss", str(s["t_in"]), "-i", os.path.join(SRC, s["src"]),
                        "-frames:v", str(n), "-vf", vf, "-q:v", "3", os.path.join(out, "%04d.jpg")], check=True)
        s["n"] = len(os.listdir(out))
        print(s["id"], s["n"], "frames")
    json.dump(plan, open(os.path.join(HERE, "plan.json"), "w"), indent=1)
