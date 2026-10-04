# Junior video series — production brief

The reference is `video/junior-101/` (shipped, loved by the client: do not modify it).
Read `video/junior-101/junior101.html` and pull a few frames of `video/junior-101/junior-101-fr-9x16.mp4`
(`ffmpeg -ss 12 -i … -frames:v 1 x.png`) to absorb the style.
Each new video lives in its own folder `video/junior-1NN/` with `index.html` started from `video/_kit/template.html`.

## Format
- 1080×1920, 30 fps, **exactly 30 s**, silent (text on screen carries everything), French.
- Built on `video/_kit/kit.css` + `kit.js`. Video-specific CSS goes in the page's own `<style>`.
- `<body data-duration="30" data-out="junior-1NN-fr-9x16">`.

## Timeline grammar (see kit.css for every primitive)
- Everything is CSS animation with an **absolute** start time `--t` (seconds from 0). No JS-driven animation,
  no `setTimeout`, no randomness: `kit.js` pauses every animation and seeks it per frame.
- Scenes: `<section class="scene" style="--in:Xs"><div class="so" style="--out:Ys">…</div></section>`.
  Next scene's `--in` ≈ previous scene's `--out` (crossfade ~0.2–0.35 s). `class="scene blue wipe"` = blueprint
  sheet wiping up from the bottom (use for the "Junior's method" moment). The closer is `scene dark closer`.
- Primitives: `.fu` fade-up, `.fi` fade-in, `.fo` fade-out, `.sl`/`.sr` slide in, `.pop`, `.stamp` (rotated stamp),
  `.dr` SVG line drawing (needs `pathLength="1"`; `--d` = duration), `.grow` (scaleX from left), `.ul` red underline,
  `.strike` red strike-through, `.recolor` (background from `--from` to `--to`), headline lines `.h .ln > span` rising.
- Element that appears then disappears: nest an outer `.fi` (in) around an inner `.fo` (out).
- Never put two animations on the same property of the same element (the later one's fill overrides the earlier).
- SVG transforms in CSS need `transform-box: fill-box` for scale/rotate origins.
- Moving tokens (packets etc.): custom @keyframes with translate values, `animation: name 1.2s … var(--t) both`.
- Text that changes (a counter, a clock): stack the variants and fade each in/out at its time — no JS.

## Layout rules
- Side margins 80 px. Eyebrow mono at top 200 px: `JUNIOR 1NN · <THÈME>`. Headline starts ~270–300 px.
- Headlines: Archivo `.h`, 92–128 px, max ~4 lines, **one idea per scene**. Every line must fit inside 920 px
  (render a still and look; reflow or shrink if a line touches the margin).
- Important content stays between y=180 and y=1640 (Reels/TikTok UI covers the bottom). The cartouche
  (title block) at top 1748 px: `Projet Junior 1NN · Feuille 0n / 04 · Rév. 2026` on every content scene.
- Sheet border SVG drawn once at t=0 (already in the template).
- Minimum text size: 19 px mono / 30 px sans. Nothing overlapping unless deliberate (stamp, pen marks).

## Visual language
- Tokens only: paper #E4E8ED, sheet #F2F5F8, ink #141A22, graphite #5C6673, blueprint #0D3557, line #B9C2CC,
  revision red #C42B1C; product status colours: prêt #2E7A57, à revoir #B97C12, en cours #2D5BD0, verrouillé #9AA4AE.
- Red = the reviewer's pen: flags, circles, strikes, underlines, stamps. It is the recurring "character": use it for
  the one moment of tension or payoff per scene, not everywhere.
- Drafting vernacular: mono uppercase labels, boxes drawn line by line, dashed boundaries, figure-like captions,
  hand-drawn red loops (bezier paths drawn with `.dr`).
- Fun = motion with intent: dominoes, packets travelling, things crossed out, stamps landing. Never decorative noise.

## Copy
- French (Québec), wording taken from `fr/index.html` whenever possible (read it). Short. No invented product
  features and no invented numbers about Junior. Fictional client data is fine (the site uses « Cornets Boréal inc. »).
- Site typography: « guillemets », no space before ? (« Où j'en suis? »), `·` as separator, `→` for CTAs.
- Reading time: once a line is fully revealed it stays on screen ≥ 0.3 s per word (headlines ≥ 1.5 s).

## Closer (25.6 → 30 s) — identical across the series
Keep the template's closer block exactly; only the headline (2–3 short lines) changes. If a line is too wide at
118 px, reduce that page's closer headline font-size (min 96 px) rather than change the layout.

## Render & verify (mandatory)
```
cd /home/user/Junior-Website
NODE_PATH=/opt/node22/lib/node_modules node video/_kit/render.js video/junior-1NN 2,6,10,14,18,22,25,29   # stills
NODE_PATH=/opt/node22/lib/node_modules node video/_kit/render.js video/junior-1NN                        # mp4 (~1.5 min)
```
Look at every still with the Read tool (combine several with
`ffmpeg -i a.png -i b.png -filter_complex hstack=2,scale=1400:-1 sheet.png` to save views; keep single stills
for detail checks). Check: line overflow, overlaps, unfinished frames, text still animating at its reading moment,
mid-transition frames (sample ~0.15 s after each `--in`). Fix and re-render until clean. Before finishing, delete
`still_*.png` and contact sheets (delete files by name; never `rm -rf` a directory) — only `index.html`, captured
image assets, and the `.mp4` remain. Do not touch any other folder, and do not commit.

## Capturing product screenshots (if your video needs one)
The site's figures are JS-rendered. Use Playwright on `fr/index.html` (`require('playwright')` with the NODE_PATH above):
add class `is-in` to `.reveal, figure`, wait ~1.5 s, scroll the figure into view, remove every `.dim` class (the
narrow-layout stepper dims zones), wait 0.5 s, then `locator('<selector>').screenshot()` at `deviceScaleFactor: 3`
with a 480 px-wide viewport. Fig. 03 = `.chatapp` (already captured as `video/junior-101/chat.png`);
Fig. 04 = the portal figure in section `#suivi` (inspect the markup for its selector). Save into your own folder.
