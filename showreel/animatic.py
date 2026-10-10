"""Animatic MP4: the cut list as a playable video — thumbnails/placeholders in the clip slots,
every alpha MOV composited at its placement time, and the music. Run: python3 -I animatic.py"""
import csv, os, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
S = os.path.dirname(HERE)
MOV = os.path.join(S, "package", "Showreel_Graphics_Alpha")
TH = os.path.join(HERE, "th")
OUT = os.path.join(HERE, "animatic")
os.makedirs(OUT, exist_ok=True)
W, H, FPS, P, D = 1920, 1080, 30, 0.52245, 8.96
B = lambda k: D + k * P
BOLD = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
if not os.path.exists(BOLD):
    BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def thumb(name, portrait=False):
    im = Image.open(os.path.join(TH, name + ".jpg")).convert("RGB")
    if portrait:  # shorts thumbnails are 4:3 with the 9:16 frame in the middle
        w, h = im.size; cw = h * 9 // 16
        im = im.crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h))
    else:
        w, h = im.size; ch = w * 9 // 16
        im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))
    return im

def land(name):
    return thumb(name).resize((W, H), Image.LANCZOS)

def port(names):
    names = list(names) if isinstance(names, (list, tuple)) else [names]
    bg = thumb(names[0], True).resize((W, W * 16 // 9)).crop((0, (W * 16 // 9 - H) // 2, W, (W * 16 // 9 - H) // 2 + H)).filter(ImageFilter.GaussianBlur(40))
    bg = Image.eval(bg, lambda v: int(v * 0.45))
    if len(names) == 1:
        fr = thumb(names[0], True).resize((608, 1080), Image.LANCZOS); bg.paste(fr, ((W - 608) // 2, 0))
    else:
        bg = Image.new("RGB", (W, H), (10, 10, 10))
        for i, n in enumerate(names):
            fr = thumb(n, True).resize((480, 853), Image.LANCZOS); bg.paste(fr, (180 + i * 540, 84))
    return bg

def placeholder(title):
    im = Image.new("RGB", (W, H), (22, 22, 20)); d = ImageDraw.Draw(im)
    for x in range(-H, W, 48):
        d.line([(x, H), (x + H, 0)], fill=(28, 28, 26), width=20)
    f1, f2 = ImageFont.truetype(BOLD, 110), ImageFont.truetype(MONO, 30)
    d.text((W // 2, H // 2 - 30), title, font=f1, fill=(242, 242, 236), anchor="mm")
    d.text((W // 2, H // 2 + 70), "YOUR FOOTAGE GOES HERE", font=f2, fill=(214, 245, 59), anchor="mm")
    return im

BLACK = Image.new("RGB", (W, H), (10, 10, 10))
cache = {}
def frame(key):
    if key in cache: return cache[key]
    kind, arg = key
    im = {"black": lambda a: BLACK, "land": land, "port": port, "trio": port, "ph": placeholder}[kind](arg)
    path = os.path.join(OUT, f"f{len(cache):03d}.png"); im.save(path); cache[key] = path
    return path

MAP = [("Claude Cowork", ("land", "cowork")), ("Workstatus ·", ("land", "workstatus")), ("Boost", ("ph", "Boost Productivity")),
       ("AI Product Readiness", ("land", "aiready")), ("TestMu", ("trio", ("tm1", "tm2", "tm3"))), ("LLMOps", ("port", "llmops")),
       ("Engagement", ("port", "engage")), ("ValueCoders", ("port", "vcreel")), ("Nivve", ("ph", "Nivve")), ("Wellora", ("ph", "Wellora")),
       ("PixelCrayons brand", ("ph", "PixelCrayons")), ("PixelCrayons ad", ("ph", "PixelCrayons ad")), ("Nike", ("ph", "Nike · Concept")),
       ("AI-generated", ("ph", "AI-Generated Film")), ("Foundr", ("land", "foundr")), ("RCB", ("land", "criccult")),
       ("Satinder", ("port", "sartaaj")), ("Readers", ("ph", "Readers Book Club"))]
SUBS = {"250+ projects": [("land", "cowork"), ("land", "workstatus")], "20+ brands": [("ph", "Nike · Concept"), ("ph", "PixelCrayons")],
        "3 yrs": [("land", "criccult"), ("port", "sartaaj")],
        "Best-of, one beat each": [("port", "tm1"), ("land", "foundr"), ("ph", "AI-Generated Film"), ("ph", "Wellora"), ("land", "cowork"),
                                   ("port", "llmops"), ("ph", "Nivve"), ("ph", "Readers Book Club"), ("port", "engage"), ("land", "criccult")]}

segs = []  # (frame key, seconds)
for r in csv.DictReader(open(os.path.join(HERE, "cutlist.csv"))):
    t0, t1, title = float(r["in (s)"]), float(r["out (s)"]), r["clip / graphic"]
    if r["type"] == "gfx":
        if title.startswith("Chapter 0") and segs:   # previous shot runs under the transition's first 0.35 s
            k, d = segs[-1]; segs[-1] = (k, d + 0.35); segs.append((("black", None), t1 - t0 - 0.35)); continue
        segs.append((("black", None), t1 - t0)); continue
    if title in SUBS:
        parts = SUBS[title]; step = (t1 - t0) / len(parts)
        segs += [((k, a if not isinstance(a, tuple) else list(a)), step) for k, a in parts]; continue
    key = next(v for m, v in MAP if title.startswith(m) or m in title)
    segs.append(((key[0], list(key[1]) if isinstance(key[1], tuple) else key[1]), t1 - t0))

with open(os.path.join(OUT, "base.txt"), "w") as f:
    for key, dur in segs:
        k = (key[0], tuple(key[1]) if isinstance(key[1], list) else key[1])
        p = frame(k) if k[0] != "trio" else frame(k)
        f.write(f"file '{p}'\nduration {dur:.4f}\n")
    f.write(f"file '{p}'\n")
cache_fix = None
total = B(76)
subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(OUT, "base.txt"),
                "-vf", f"fps={FPS},format=yuv420p", "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "16", os.path.join(OUT, "base.mp4")], check=True)

# graphics track from the placement list (wipes appear several times)
place = [(float(r["timeline in (s)"]), r["file"]) for r in csv.DictReader(open(os.path.join(HERE, "graphics_placement.csv")))]
order = lambda f: (f.startswith("09_hud"), f.startswith("08"), f)  # HUD last (top), end card near top
place.sort(key=lambda p: order(p[1]))
args = ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", os.path.join(OUT, "base.mp4"),
        "-loop", "1", "-t", "4", "-i", os.path.join(S, "build", "bgs", "montage.jpg")]
for t, f in place:
    args += ["-itsoffset", f"{t:.3f}", "-i", os.path.join(MOV, f)]
na = 2 + len(place)
args += ["-ss", "9.035", "-t", f"{total:.3f}", "-i", os.path.join(S, "src", "envy.wav")]
fc, last = [], "[0:v]"
for i, (t, f) in enumerate(place):
    idx = i + 2
    if f == "01b_title_matte.mov":   # footage-in-letters preview: montage keyed by the matte's alpha
        fc.append(f"[1:v]scale={W}:{H},format=rgba,fps={FPS}[mont];[{idx}:v]format=rgba,alphaextract[ma];[mont][ma]alphamerge[mfill]")
        fc.append(f"{last}[mfill]overlay=eof_action=pass:format=auto[v{i}]")
    else:
        fc.append(f"{last}[{idx}:v]overlay=eof_action=pass:format=auto[v{i}]")
    last = f"[v{i}]"
fc.append(f"{last}format=yuv420p[vout]")
fc.append(f"[{na}:a]volume=-1.5dB,afade=t=in:d=0.3,afade=t=out:st={total - 3:.2f}:d=3[aout]")
args += ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]", "-t", f"{total:.3f}", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart",
         os.path.join(HERE, "Showreel_2025_Animatic.mp4")]
subprocess.run(args, check=True)
print("done", os.path.getsize(os.path.join(HERE, "Showreel_2025_Animatic.mp4")) // 1024 // 1024, "MB")
