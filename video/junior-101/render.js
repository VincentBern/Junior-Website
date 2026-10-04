// Renders junior101.html to junior-101-fr-9x16.mp4 (1080x1920, 30 fps, 30 s).
// Usage: node render.js            -> full video
//        node render.js stills 3,12 -> PNG stills at those seconds
// Needs Playwright (with Chromium) and ffmpeg on PATH.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const dir = __dirname, mode = process.argv[2] || 'junior-101-fr-9x16.mp4';
(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1080,height:1920}, deviceScaleFactor:1});
  await p.goto('file://'+dir+'/junior101.html');
  await p.evaluate(()=>window.ready);
  await p.waitForTimeout(500);
  if (mode === 'stills') {
    const ts = (process.argv[3]||'').split(',').map(Number);
    for (const t of ts) { await p.evaluate(t=>seek(t), t); await p.screenshot({path:`${dir}/still_${t.toFixed(1)}.png`}); }
  } else {
    const fps=30, dur=30;
    const ff = spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',`${dir}/${mode}`],{stdio:['pipe','inherit','inherit']});
    for (let i=0;i<fps*dur;i++){
      await p.evaluate(t=>seek(t), i/fps);
      const buf = await p.screenshot({type:'png'});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
