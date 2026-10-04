// Seekable timeline: render.js calls seek(t) for every frame.
window.seek = (t) => {
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
};
window.ready = (async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  return true;
})();
