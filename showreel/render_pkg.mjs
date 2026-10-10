// node render_pkg.mjs <outDir> <codec: prores|qtrle|png> [only] — renders the alpha MOV package
import { chromium } from "/home/user/portfolio/node_modules/playwright/index.mjs";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
const [, , out, codec = "prores", only] = process.argv;
const LT = JSON.parse(readFileSync(new URL("./lowerthirds.json", import.meta.url)));
const pad = (n) => String(n).padStart(2, "0");
const jobs = [
  ["01_title", "el=title"], ["01b_title_matte", "el=title&matte=1"], ["02_name", "el=name"], ["03_words", "el=words"],
  ["04_chapter_01_ui-grid", "el=chapter&i=0"], ["04_chapter_02_phone-bars", "el=chapter&i=1"], ["04_chapter_03_iris", "el=chapter&i=2"], ["04_chapter_04_cinema-bars", "el=chapter&i=3"],
  ["05_wipe", "el=wipe"], ["06_letterbox_hold", "el=letterbox&i=1"], ["06_letterbox_in-out", "el=letterbox"],
  ...LT.map((l, i) => [`LT_${pad(i + 1)}_${l[0].replace(/[^A-Za-z0-9]+/g, "-").replace(/-$/, "")}`, `el=lower&i=${i}`]),
  ["07_numbers_250", "el=numbers&i=0"], ["07_numbers_20", "el=numbers&i=1"], ["07_numbers_3yrs", "el=numbers&i=2"],
  ["08_end_card", "el=end"], ["09_hud", "el=hud"],
].filter(([n]) => !only || n.startsWith(only));
const enc = {
  prores: ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-vendor", "apl0", "-alpha_bits", "16"],
  qtrle: ["-c:v", "qtrle", "-pix_fmt", "argb"],
  png: ["-c:v", "png", "-pix_fmt", "rgba"],
}[codec];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", (e) => console.error("pageerror", e.message));
for (const [name, qs] of jobs) {
  await page.goto(`http://127.0.0.1:8765/graphics.html?${qs}`);
  await page.waitForFunction(() => window.ready === true);
  const dur = await page.evaluate(() => window.dur);
  const frames = Math.round(dur * 30);
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "png", "-i", "-", ...enc, "-r", "30", `${out}/${name}.mov`], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.renderAt(t), f / 30);
    const buf = await page.screenshot({ type: "png", omitBackground: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(name, frames, "frames");
}
await b.close();
