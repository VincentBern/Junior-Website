// Renders a kit video page to MP4 (1080x1920, or 1920x1080 with <body data-size="1920x1080">; 30 fps) or to PNG stills.
//   node video/_kit/render.js video/junior-102            -> video/junior-102/<data-out>.mp4
//   node video/_kit/render.js video/junior-102 3,12.5,29  -> still_<t>.png in that folder
// The page's <body> carries data-duration (seconds) and data-out (file name, no extension).
// Needs Playwright (with Chromium) and ffmpeg on PATH.
const path = require('path');
const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  const dir = path.resolve(process.argv[2]);
  const stills = process.argv[3];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(dir, 'index.html'));
  const size = await p.evaluate(() => document.body.dataset.size || '1080x1920');
  const [w, h] = size.split('x').map(Number);
  await p.setViewportSize({ width: w, height: h });
  await p.evaluate(() => window.ready);
  await p.waitForTimeout(500);
  if (stills) {
    for (const t of stills.split(',').map(Number)) {
      await p.evaluate(t => seek(t), t);
      const out = path.join(dir, `still_${t.toFixed(1)}.png`);
      await p.screenshot({ path: out });
      console.log(out);
    }
  } else {
    const { dur, name } = await p.evaluate(() => ({ dur: +document.body.dataset.duration, name: document.body.dataset.out }));
    const fps = 30, out = path.join(dir, name + '.mp4');
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < fps * dur; i++) {
      await p.evaluate(t => seek(t), i / fps);
      const buf = await p.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(out);
  }
  await b.close();
})();
