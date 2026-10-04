# Junior 2NN series — 16:9 deep dives (addendum to BRIEF.md)

Read `BRIEF.md` first: every rule there holds (tokens, timeline grammar, red pen as the one recurring character,
one blueprint « méthode » scene, copy rules, render-and-verify loop) except what this page overrides.

## Audience and tone
Partners, investors and Luc (the methodology's author). Same « plan d'architecte » look as the 10X series,
but the 2NN videos explain **how Junior works inside**: architecture, engines, operator tools.
Still silent, still French (Québec), still short sentences on screen. Beautiful, easy to follow, a bit fun.

## Format
- 1920×1080, 30 fps, **exactly 60 s**, silent, French.
- Start from `video/_kit/template-16x9.html` → `video/junior-2NN/index.html`.
  It loads `kit.css` then `kit-16x9.css` (16:9 geometry). Same primitives.
- `<body data-size="1920x1080" data-duration="60" data-out="junior-2NN-fr-16x9">` (`render.js` reads `data-size`).
- Rendering is identical: `NODE_PATH=/opt/node22/lib/node_modules node video/_kit/render.js video/junior-2NN [stills]`.
  The MP4 takes ~3–4 min (1800 frames).

## Layout (16:9)
- Sheet border inset 32 px (in the template). Side margins 120 px. Content zone x 120–1800, y 96–930.
- Eyebrow mono top 104 px: `Junior 2NN · <THÈME>`.
- Headlines 76–108 px, Archivo. Two layouts work well:
  - **split**: headline in a left column (x 120 → ~940, top ~170), figure on the right (x ~1000 → 1800);
  - **stacked**: headline top-left on 1–2 lines, a wide figure below it (y ~420 → 920).
- Cartouche (title block) bottom-right, `.cart`, top 952: `Projet Junior 2NN · Feuille 0n / 0N · Rév. 2026`.
  Optional `.figcap` (red tick + mono caption) bottom-left at the same height, for « Fig. 0n · … » captions.
- Minimum sizes on a 1920 canvas: 17 px mono, 24 px sans. Prefer larger.
- 60 s allows ~6–8 scenes of 6–9 s. One idea per scene. Reading time rule unchanged (≥ 0.3 s per word once shown).

## Closer (55.6 → 60 s), identical across the 2NN series
Keep the template's closer block exactly (logo J••, punchline 2 lines max at 104 px, the « Rien à connecter… » line,
« Faire mon diagnostic → », junior.coach, the fine line). Only the punchline changes.

## Showing the product
The 2NN videos show internal surfaces (/admin, the conversation, the kit, the e2e harness). Redraw them as
**drafting-style figures** faithful to the real UI (real tab names, real column labels, real flow order, taken from
the source in the `junior` repo), not as pixel screenshots. Fictional data only: entreprise « Cornets Boréal inc. »,
people with invented first names, masked keys like `jr_live_••••3f9a`. Never a real customer, email, key, hostname,
GCP project, price or cost figure. Model names (Haiku, Sonnet) are fine.

## Confidentiality (non-negotiable)
- Never show methodology content from `junior/content/`: no prompts, instructions, field definitions, question
  wording or template text. Canevas/tool *names* that appear on the website (`fr/index.html`) are fine; structural
  counts documented in `junior/docs` are fine.
- Respect the data boundary in what you claim: the client's answers stay in the client's own environment (the site
  says « chez vous »); server-remote keeps no answers; progress holds IDs, statuses, counts and dates only.
- No invented features or numbers. If the code does not do it, the video does not say it.
