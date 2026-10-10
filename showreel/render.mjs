// node render.mjs <out.mp4> [stillTimesCsv]  — renders reel.html frame by frame and muxes the music
import { chromium } from "/home/user/portfolio/node_modules/playwright/index.mjs";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
const [, , out, stills] = process.argv;
const plan = JSON.parse(readFileSync(new URL("./plan.json", import.meta.url)));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("pageerror", e.message));
await page.goto("http://127.0.0.1:8765/reel.html");
await page.waitForFunction(() => window.ready === true);
if (stills) {
  for (const t of stills.split(",").map(Number)) {
    await page.evaluate((t) => window.renderAt(t), t);
    await page.screenshot({ path: `${out}/s_${t.toFixed(2).padStart(6, "0")}.jpg`, type: "jpeg", quality: 80 });
  }
  await b.close(); process.exit(0);
}
const total = Math.round(plan.duration * plan.fps);
const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(plan.fps), "-c:v", "mjpeg", "-i", "-",
  "-ss", String(plan.offset), "-t", String(plan.duration), "-i", "../src/envy.wav",
  "-filter_complex", `[1:a]volume=-1.5dB,afade=t=in:d=0.4,afade=t=out:st=${(plan.duration - 3).toFixed(2)}:d=3[a]`,
  "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(plan.fps),
  "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", "-shortest", out], { stdio: ["pipe", "inherit", "inherit"] });
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.renderAt(t), f / plan.fps);
  const buf = await page.screenshot({ type: "jpeg", quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 150 === 0) console.log(`frame ${f}/${total} · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await b.close();
console.log("done", out);
