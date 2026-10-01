// Section screenshots for design review: `npm run build && npm start`, then `node scripts/screenshots.mjs <outDir>`.
import { chromium } from "playwright";
const OUT = process.argv[2] || "screens-tmp";
const only = process.argv[3]?.split(",");
const sectionsAll = ["top", "marquee", "showreel", "work", "services", "process", "tools", "about", "testimonials", "faq", "contact"];
const palette = ["#1b2a12", "#1a1a1a", "#222", "#0f1a1f", "#1f1f14"];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const sections = only ?? sectionsAll;
for (const [name, vp, mobile] of [["desktop", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 200)); });
  // YouTube is blocked in this sandbox — substitute stand-in frames so layout can be reviewed.
  await page.route(/img\.youtube\.com|youtube-nocookie|youtube\.com/, (route) => {
    const id = route.request().url().split("/vi/")[1]?.split("/")[0] || "x";
    const c = palette[id.charCodeAt(0) % palette.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#555"/></linearGradient><radialGradient id="r" cx=".3" cy=".35" r=".6"><stop offset="0" stop-color="#9a9a9a" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="1280" height="720" fill="url(#g)"/><rect width="1280" height="720" fill="url(#r)"/><text x="640" y="380" font-family="sans-serif" font-size="34" fill="#ffffff55" text-anchor="middle">thumbnail ${id}</text></svg>`;
    if (route.request().resourceType() === "image") return route.fulfill({ contentType: "image/svg+xml", body: svg });
    return route.fulfill({ contentType: "text/html", body: "<body style='background:#111'></body>" });
  });
  await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  for (const s of sections) {
    await page.evaluate((id) => {
      if (id === "marquee") return window.scrollTo(0, window.innerHeight * 0.55);
      const el = document.getElementById(id);
      if (!el) return console.error("missing section " + id + " body=" + document.body.innerText.slice(0, 200));
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + (id === "process" ? window.innerHeight * 0.45 : 0));
    }, s);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${name}-${s}.png` });
  }
  await ctx.close();
}
await browser.close();
