# Showreel 2025 — handoff summary

Paste this into a new chat (or point it at this file) to continue the work.

## Who / what
- Sarthak Rawat — video editor & motion designer (Noida; currently at TestMu AI). Portfolio: https://sarthakkrawatofficial-alt.github.io/portfolio/ (repo `sarthakkrawatofficial-alt/portfolio`, Next.js; work branch `claude/intelligent-ramanujan-se0528`).
- Goal: a professional, very engaging, motion-design-heavy **showreel video about Sarthak** (not just a TestMU AI compilation), in the style of his references: Bohdan Martovskyi 2025, Denis Gimaev 2023, Lukas Mascher 2025, ObiN Studio 2025 — huge kinetic "SHOWREEL" type, fast beat cuts, UI/editorial frames, colour-block frames, ~35–50 s.
- Sarthak edits the final cut himself (Premiere/AE/Resolve) with his own footage, using the graphics package below. Length was left to me: **48.67 s**.

## Footage (on Sarthak's PC)
Claude Cowork (SaaS animation), Workstatus product demo, Boost Productivity with Workstatus, AI Product Readiness (ValueCoders explainer), LLMOps Explained (ValueCoders short), Engagement Signal Detection (PixelCrayons short), ValueCoders reel (thumbnail used: "Workflow Visibility" — unconfirmed), TestMu AI shorts ×3 (YouTube npLqy79MJFg, MZwfcgwrXBs, CIthfrO_W90), Nivve, Wellora, PixelCrayons campaign/brand film/ad edit, Nike motion poster (**personal → label "Concept"**), AI-generated video project, Foundr podcast cinematic trailer, RCB documentary (= CricCult video), Readers Book Club, Satinder Sartaaj India Tour promo.
Also on his Google Drive (link-shared, used for the first test reel): Dubai Maritime City (EstateWithShivam), Jaypee Greens real-estate film, Cheese Factory 2.1, CF Miniature reel, Frappik Reel 1.

## Locked decisions
- Look: black `#0a0a0a` + volt lime `#d6f53b` + off-white `#f5f5f0` (the portfolio's palette); Inter Tight (display, weight ~780, tight tracking) + JetBrains Mono (labels, uppercase, wide tracking).
- Format: 1920×1080, 30 fps, 48.67 s.
- Music: **"Envy" — AGST** (Epidemic Sound, 114 BPM, no vocals). Start the track at **0:09.04**; its drop lands at reel **8.96 s**; 64 beats of drive until the breakdown at 42.40 s (end card). One beat = **0.52245 s**; beat k is at 8.96 + k × 0.52245. Fade the last 3 s. Alternatives offered: "Bricks" (Gettz G), "Unseen" (Elin Piel).
- Client names only where they read well. Lower-thirds are 1.04 s (2 beats); Nivve/Wellora are 1-beat shots → trim their LT to 0.52 s.
- Each chapter has its own transition (no repeated card). Keep the previous shot running 0.35 s under every chapter transition.

## Structure (reel seconds)
| Time | Section |
|---|---|
| 0.00–3.74 | SHOW / REEL title (footage inside the letters via track matte, 4 one-beat clips from 1.65 s) |
| 3.74–6.87 | Name intro "Sarthak / Rawat" + role line |
| 6.87–8.96 | Edit. Motion. Story. Sound. (one per beat, "Story." on lime) |
| 8.96 | Drop → Chapter 01 SaaS & Product (UI-grid transition): Claude Cowork ×3 shots, Workstatus, Boost Productivity, AI Product Readiness |
| 15.23 | Chapter 02 Short-form (phone-bars transition): TestMu ×3 side by side, LLMOps, Engagement Signal, ValueCoders reel, Nivve, Wellora |
| 22.54 | Chapter 03 Brand & Ads (iris transition): PixelCrayons brand film, Nike (Concept), AI film, PixelCrayons ad, Nike |
| 27.77 | Chapter 04 Story & Cinema (cinema bars → 2.39:1 held): Foundr trailer, RCB doc, Sartaaj, Readers Book Club, RCB |
| 34.04–37.17 | Numbers rolling: 250+ projects / 20+ brands / 3 yrs (2 one-beat clips under each) |
| 37.17–42.40 | Best-of finale, one beat per shot (10 shots) |
| 42.40–48.67 | Contact end card "Let's make something / people finish." + sarthakkrawat.official@gmail.com · @sarthakk.create |

Exact shot-by-shot timings, what moment to pick from each source, edit moves (punch-ins, speed ramps, whips) and SFX ideas: `showreel/cutlist.csv`. Exact in-point of every graphic: `showreel/graphics_placement.csv`.

## Delivered so far
- **Graphics package** (sent as 4 zips → unzip into one `Showreel_Graphics_Alpha` folder): 33 alpha MOVs, QuickTime Animation (RGB+alpha), 1920×1080 30 fps — `01_title`, `01b_title_matte`, `02_name`, `03_words`, `04_chapter_01_ui-grid`, `04_chapter_02_phone-bars`, `04_chapter_03_iris`, `04_chapter_04_cinema-bars`, `05_wipe` (cut 0.25 s into it; used at 4 points), `06_letterbox_hold`, `06_letterbox_in-out`, `LT_01…LT_17` lower-thirds, `07_numbers_250/20/3yrs`, `08_end_card`, `09_hud` (full-length overlay: corner brackets, chapter name, timecode, lime beat tick) + cutlist.csv, graphics_placement.csv, README.txt. A ProRes 4444 version can be rendered with `render_pkg.mjs <out> prores` (too big to send from the cloud session).
- **Animatic MP4** (plays anywhere): the whole timeline with music, every graphic placed, thumbnails/placeholders for clips.
- **Storyboard page**: https://claude.ai/artifact/5j8AfaVAkN6taHkWeUBypp (v2).
- **5 s test preview** + `showreel/test_preview.bat` / `.sh` (chapter 04 card → letterbox hold → lower-third → HUD over any local clip with ffmpeg).
- Earlier: a first rendered reel `Sarthak_Rawat_Showreel_2025.mp4` (49 s) from the Drive footage, and a self-playing showreel section on the portfolio site (`src/components/sections/Showreel.tsx`, chapters in `reelChapters` in `src/content/site.ts`).

## Source files (all in `showreel/` on the branch)
`graphics.html` (every overlay; `?el=<name>&i=<n>&lt=<json>`), `lowerthirds.json`, `render_pkg.mjs` (renders MOVs via Playwright + ffmpeg; serve the folder on http://127.0.0.1:8765 first, with `inter.woff2`, `mono.woff2`, `gsap.min.js` copied in — see README), `animatic.py`, `plan.py` / `reel.html` / `render.mjs` (the first Drive-footage reel), `cutlist.csv`, `graphics_placement.csv`, `README.md`.

## Constraints learned
- The cloud session could not reach Sarthak's PC, and YouTube blocks the cloud IP, so final assembly with his footage must run **locally** (Claude Desktop/CLI on his machine, ffmpeg installed).
- MOV alpha files don't play in normal players — preview via the animatic or an NLE.

## Open items
1. Confirm the ValueCoders reel (thumbnail used is "Workflow Visibility"); edit `LT_07` text if different.
2. Match each cut-list row to the real files on his PC, pick in-points per "what to pick", show them for approval.
3. Make a 5 s test with his real clip, then render the full reel: clips on the cut-list timing, MOVs on the placement timing, previous shot +0.35 s under chapter transitions, music from 0:09.04 with a 3 s fade, 1080p H.264.
4. Optional: 9:16 Instagram version; add the final reel to the portfolio's Showreel section.
