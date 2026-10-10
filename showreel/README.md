# Showreel 2025 — video build

Renders the 1920×1080 showreel MP4 (≈49 s, 30 fps) from an HTML/GSAP composition, frame by frame.
Cuts are locked to the beat grid of the music ("Envy" by AGST, Epidemic Sound): intro over the build,
three chapters (Motion design · Short-form · Cinematic) over the drop, numbers, then the end card.

Inputs (not committed — too large): put the source videos and `envy.wav` in a `src/` folder next to the
build folder: `dubai.mp4`, `jaypee.mp4`, `cheese_factory.mp4`, `cf_miniature.mp4`, `frappik.mp4`.

```bash
# from a build folder that contains these three files
cp node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2 inter.woff2
cp node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2 mono.woff2
cp node_modules/gsap/dist/gsap.min.js .
python3 plan.py --extract          # writes plan.json + extracts each shot's frames to f/<id>/
python3 -m http.server 8765 &      # reel.html loads plan.json and frames over http
node render.mjs out.mp4            # or: node render.mjs stillsDir "10,20,30" for test stills
```

To re-cut: change the source in-points or beat positions in `plan.py` (one beat = 0.52245 s, beat 0 = the
drop), and the type/animation in `reel.html`.

## Graphics package (alpha MOVs for editing with your own footage)
`graphics.html` holds every overlay (title + track matte, name, word flashes, four chapter transitions, wipe,
letterbox, lower-thirds from `lowerthirds.json`, rolling numbers, end card, full-length HUD).
`render_pkg.mjs <outDir> [prores|qtrle|png]` renders each one as a 1920×1080 30 fps MOV with alpha.
`cutlist.csv` is the shot-by-shot edit and `graphics_placement.csv` the in-point of every MOV.
