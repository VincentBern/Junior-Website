// Rend video/premiers-pas.html image par image et l'encode en MP4 (1920×1080, 30 i/s).
//   node video/record.mjs                 → assets/premiers-pas.mp4
//   node video/record.mjs --stills 3,12   → captures PNG à ces secondes (vérification)
// Requiert Playwright (Chromium) et ffmpeg.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); } catch { playwright = require("/opt/node22/lib/node_modules/playwright"); }

const here = path.dirname(fileURLToPath(import.meta.url));
const page_url = pathToFileURL(path.join(here, "premiers-pas.html")).href;
const out = path.join(here, "..", "assets", "premiers-pas.mp4");
const FPS = 30;

const args = process.argv.slice(2);
const stillsArg = args.includes("--stills") ? args[args.indexOf("--stills") + 1] : null;

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
await page.goto(page_url, { waitUntil: "networkidle" });
await page.evaluate(() => window.ready);
const END = await page.evaluate(() => window.END);

if (stillsArg) {
  // Le défilement est lissé image par image : on rejoue depuis 0 jusqu'à chaque instant.
  const times = stillsArg.split(",").map(Number).sort((a, b) => a - b);
  let f = 0;
  for (const s of times) {
    for (; f <= Math.round(s * FPS); f++) await page.evaluate((t) => window.render(t), f / FPS);
    const file = path.join(process.env.STILLS_DIR || here, `still-${String(s).replace(".", "_")}.png`);
    await page.screenshot({ path: file });
    console.log(file);
  }
} else {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(END * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: "png" });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 90 === 0) process.stdout.write(`${(f / FPS).toFixed(0)}s `);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c ? j(new Error("ffmpeg " + c)) : r())));
  console.log("\n" + out);
}
await browser.close();
