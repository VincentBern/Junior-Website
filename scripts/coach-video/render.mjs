import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
// Renders the coach walkthrough video. Run from this folder:
//   node render.mjs stills   -> key frames in stills/
//   node render.mjs video    -> 900 frames in frames/, then:
//   ffmpeg -framerate 30 -i frames/%04d.jpg -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart ../../assets/video/junior-coach-fr.mp4
// canevas.json comes from VincentBern/junior content/canevas (names, effort, dependencies).
import fs from 'fs';
const dir = process.cwd();
const html = fs.readFileSync('coach.html', 'utf8').replace('__CANEVAS__', fs.readFileSync('canevas.json', 'utf8'));
fs.writeFileSync('coach.built.html', html);
const mode = process.argv[2] || 'stills';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
page.on('pageerror', e => console.error('PAGEERR', e.message));
await page.goto('file://' + dir + '/coach.built.html');
await page.evaluate(() => window.ready);
if (mode === 'stills') {
  fs.mkdirSync('stills', { recursive: true });
  const ts = (process.argv[3] || '1.5,2.3,6,10.5,12.3,15.5,19,20.8,24,27.5,29.5').split(',').map(Number);
  for (const t of ts) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: `stills/t${t}.png` }); }
} else {
  fs.rmSync('frames', { recursive: true, force: true }); fs.mkdirSync('frames');
  const fps = 30, dur = 30;
  for (let i = 0; i < fps * dur; i++) {
    await page.evaluate(t => window.seek(t), i / fps);
    await page.screenshot({ path: `frames/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
}
await browser.close();
