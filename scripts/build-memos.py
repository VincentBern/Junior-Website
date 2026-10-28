#!/usr/bin/env python3
"""Build the memo pages of junior.coach from memos-src/*.md.

    python3 scripts/build-memos.py          # (re)build fr/memos/, en/memos/ and sitemap-memos.xml
    python3 scripts/build-memos.py --check  # exit 1 if the built files are not up to date

Standard library only. One source file holds a memo in French and in English;
CLAUDE.md (section 8) gives the format and the rules. Files whose name starts
with "_" (the template) are skipped. The built files must never be edited by hand.
"""
import datetime as dt
import html
import json
import os
import re
import shutil
import sys

try:
    from zoneinfo import ZoneInfo
    QUEBEC = ZoneInfo("America/Toronto")
except Exception:  # no tz database: fall back to Eastern Standard Time
    QUEBEC = dt.timezone(dt.timedelta(hours=-5))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "memos-src")
SITE = "https://www.junior.coach"
UMAMI_ID = "924edbc6-ce17-4213-b2d0-e719cdc3e5aa"
FONTS = ("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,80..100,400..800"
         "&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap")
MARKER = "Built by scripts/build-memos.py"
LANGS = ("fr", "en")
OTHER = {"fr": "en", "en": "fr"}
LINKEDIN = "https://www.linkedin.com/company/getjunior-coach/"
INSTAGRAM = "https://www.instagram.com/getjunior.coach/"

# Everything a memo page says around the memo itself. French is the source.
T = {
    "fr": {
        "locale": "fr_CA", "inlang": "fr-CA",
        "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
                   "septembre", "octobre", "novembre", "décembre"],
        "section": "Mémos", "all": "TOUS LES MÉMOS", "switch": "EN",
        "eyebrow": "Mémo", "to": "À", "to_v": "Dirigeants de PME", "from": "De",
        "from_v": "Luc Goudreault, fondateur de Junior", "subject": "Objet", "canevas": "Canevas",
        "date": "Date", "brief": "En bref", "related": "Autres mémos",
        "job": "Aviseur d'entreprise",
        "author_role": "Aviseur d'entreprise et fondateur de Junior",
        "author_bio": "Plus de 12 ans à diriger des entreprises, en hypercroissance notamment, "
                      "et deux ventes d'entreprise auxquelles il a contribué. eMBA de l'Université Laval.",
        "author_site": "https://www.lucgoudreault.com/fr/",
        "ai": "Rédigé avec l'aide de l'IA, révisé par Luc Goudreault.",
        "pitch": "Junior (junior.coach) est un aviseur en stratégie et en commercialisation qui travaille "
                 "dans le Claude ou le ChatGPT que vous utilisez déjà. Un mois d'aviseur, pour le prix "
                 "d'une heure de consultation.",
        "soon": "Le diagnostic Junior ouvre bientôt au public.",
        "cta_wait": "Être avisé de l'ouverture →", "cta_home": "Découvrir Junior →",
        "post": "Ce mémo prolonge <a href=\"{url}\">une publication de Junior sur LinkedIn</a>.",
        "follow": "Suivre Junior sur <a href=\"{li}\">LinkedIn</a> et <a href=\"{ig}\">Instagram</a>.",
        "home": "Accueil", "terms": ("conditions.html", "Conditions d'utilisation"),
        "privacy": ("confidentialite.html", "Confidentialité"),
        "list_title": "Mémos",
        "list_lede": "Des réponses courtes aux questions que se posent les dirigeants de PME, en stratégie "
                     "et en commercialisation. Rédigés avec l'aide de l'IA, révisés par Luc Goudreault.",
        "list_desc": "Les mémos de Junior : des réponses courtes aux questions que se posent les dirigeants "
                     "de PME, en stratégie et en commercialisation.",
        "empty": "Le premier mémo paraîtra sous peu.",
        "image_alt": "Junior : l'aviseur que vous engageriez, si vous en aviez les moyens.",
    },
    "en": {
        "locale": "en_CA", "inlang": "en-CA",
        "months": ["January", "February", "March", "April", "May", "June", "July", "August",
                   "September", "October", "November", "December"],
        "section": "Memos", "all": "ALL MEMOS", "switch": "FR",
        "eyebrow": "Memo", "to": "To", "to_v": "Small business leaders", "from": "From",
        "from_v": "Luc Goudreault, founder of Junior", "subject": "Subject", "canevas": "Canevas",
        "date": "Date", "brief": "In short", "related": "More memos",
        "job": "Business advisor",
        "author_role": "Business advisor and founder of Junior",
        "author_bio": "More than 12 years leading companies, including through hypergrowth, "
                      "and two company sales he contributed to. eMBA from Université Laval.",
        "author_site": "https://www.lucgoudreault.com/en/",
        "ai": "Written with the help of AI, reviewed by Luc Goudreault.",
        "pitch": "Junior (junior.coach) is a strategy and commercialization advisor that works inside "
                 "the Claude or ChatGPT you already use. A month with your advisor, for the price of "
                 "one hour of consulting.",
        "soon": "The Junior diagnostic opens to the public soon.",
        "cta_wait": "Notify me when it opens →", "cta_home": "Discover Junior →",
        "post": "This memo expands on <a href=\"{url}\">a Junior post on LinkedIn</a>.",
        "follow": "Follow Junior on <a href=\"{li}\">LinkedIn</a> and <a href=\"{ig}\">Instagram</a>.",
        "home": "Home", "terms": ("terms.html", "Terms of use"), "privacy": ("privacy.html", "Privacy"),
        "list_title": "Memos",
        "list_lede": "Short answers to the questions small business leaders ask about strategy and "
                     "commercialization. Written with the help of AI, reviewed by Luc Goudreault.",
        "list_desc": "Junior's memos: short answers to the questions small business leaders ask about "
                     "strategy and commercialization.",
        "empty": "The first memo is coming soon.",
        "image_alt": "Junior: the advisor you'd hire if you could afford one.",
    },
}

errors, warnings = [], []


def fail(where, msg):
    errors.append(f"{where}: {msg}")


def warn(where, msg):
    warnings.append(f"{where}: {msg}")


# ---------- text ----------

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def attr(s):
    return esc(s).replace('"', "&quot;")


def typo_fr(s):
    """Quebec French typography: non-breaking space inside « » and before : % $; none before ? ! ;."""
    s = re.sub(r"«\s*", "« ", s)
    s = re.sub(r"\s*»", " »", s)
    s = re.sub(r"(?<=[\w»)])\s*:(?=\s|$)", " :", s)
    s = re.sub(r"(?<=\d)\s*%", " %", s)
    s = re.sub(r"(?<=\d)\s+\$", " $", s)
    s = re.sub(r"[  ]+([?!;])", r"\1", s)
    return s


LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")


def span(s):
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", s)
    return s


def inline(text, lang, where):
    if lang == "fr":
        text = typo_fr(text)
    out, pos = [], 0
    for m in LINK.finditer(text):
        out.append(span(text[pos:m.start()]))
        url = m.group(2)
        if not re.match(r"^(https://|\.\./|#|mailto:)", url):
            fail(where, f"link must be https://, ../, # or mailto: ({url})")
        out.append(f'<a href="{attr(url)}">{span(m.group(1))}</a>')
        pos = m.end()
    out.append(span(text[pos:]))
    return "".join(out)


def plain(md):
    """Markdown to plain text, for word counts and the RSS feed."""
    t = LINK.sub(r"\1", md)
    t = re.sub(r"^#+ |^- |^\d+\. |^> ", "", t, flags=re.M)
    return t.replace("**", "").replace("*", "")


def words(s):
    return len(re.findall(r"[\w’']+", s))


def slugify(s):
    s = s.lower()
    for a, b in (("àâä", "a"), ("éèêë", "e"), ("îï", "i"), ("ôö", "o"), ("ùûü", "u"), ("ç", "c")):
        for ch in a:
            s = s.replace(ch, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def render_body(md, lang, where):
    out = []
    for block in re.split(r"\n\s*\n", md.strip()):
        lines = [ln.rstrip() for ln in block.split("\n") if ln.strip()]
        first = lines[0]
        if first.startswith(("## ", "### ")):
            if len(lines) > 1:
                fail(where, f"a heading stands alone in its block ({first})")
            level = 2 if first.startswith("## ") else 3
            text = first[level + 1:]
            out.append(f'<h{level} id="{slugify(text)}">{inline(text, lang, where)}</h{level}>')
        elif all(ln.startswith("- ") for ln in lines):
            out.append("<ul>\n" + "\n".join(f"<li>{inline(ln[2:], lang, where)}</li>" for ln in lines) + "\n</ul>")
        elif all(re.match(r"\d+\. ", ln) for ln in lines):
            items = [re.sub(r"^\d+\. ", "", ln) for ln in lines]
            out.append("<ol>\n" + "\n".join(f"<li>{inline(i, lang, where)}</li>" for i in items) + "\n</ol>")
        elif all(ln.startswith(">") for ln in lines):
            ps = [re.sub(r"^>\s?", "", ln) for ln in lines]
            body = "\n".join(f"<p>{inline(p, lang, where)}</p>" for p in ps if p)
            out.append(f"<blockquote>\n{body}\n</blockquote>")
        else:
            out.append(f"<p>{inline(' '.join(lines), lang, where)}</p>")
    return "\n".join(out)


def long_date(iso, lang):
    d = dt.date.fromisoformat(iso)
    month = T[lang]["months"][d.month - 1]
    if lang == "fr":
        return f"{'1er' if d.day == 1 else d.day} {month} {d.year}"
    return f"{month} {d.day}, {d.year}"


def rfc822(iso):
    d = dt.datetime.fromisoformat(iso + "T09:00:00").replace(tzinfo=QUEBEC)
    return d.strftime("%a, %d %b %Y %H:%M:%S %z")


def image_size(path):
    """Width and height of a PNG or JPEG, from its header."""
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    if data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                return int.from_bytes(data[i + 7:i + 9], "big"), int.from_bytes(data[i + 5:i + 7], "big")
            i += 2 + int.from_bytes(data[i + 2:i + 4], "big")
    return None


# ---------- sources ----------

def parse(path):
    name = os.path.basename(path)
    raw = open(path, encoding="utf-8").read()
    if "\u2014" in raw or "\u2013" in raw:
        fail(name, "no em dash or en dash, anywhere")
    parts = re.split(r"^=== (fr|en)[ \t]*$", raw, flags=re.M)
    if len(parts) != 5 or parts[1] != "fr" or parts[3] != "en":
        fail(name, "expected a header, then '=== fr', then '=== en'")
        return None
    memo = {"id": name[:-3], "file": name, "fr": {}, "en": {}}
    memo.update(fields(parts[0], name))
    for lang, block in (("fr", parts[2]), ("en", parts[4])):
        if "\n---\n" not in block:
            fail(name, f"{lang}: a '---' line separates the fields from the text")
            return None
        head, body = block.split("\n---\n", 1)
        memo[lang] = fields(head, name)
        memo[lang]["body"] = body.strip()
    return memo


def fields(text, where):
    out = {}
    for ln in text.strip().splitlines():
        if not ln.strip() or ln.lstrip().startswith("#"):
            continue
        if ":" not in ln:
            fail(where, f"not a 'key: value' line ({ln})")
            continue
        k, v = ln.split(":", 1)
        out[k.strip()] = v.strip()
    return out


def check(memo):
    w = memo["file"]
    for k in ("date", "canevas"):
        if not memo.get(k):
            fail(w, f"missing '{k}'")
    for k in ("date", "updated"):
        if memo.get(k):
            try:
                dt.date.fromisoformat(memo[k])
            except ValueError:
                fail(w, f"{k} must be YYYY-MM-DD")
    if " | " not in memo.get("canevas", ""):
        fail(w, "canevas: 'Nom français | English name'")
    counts = {}
    for lang in LANGS:
        m, where = memo[lang], f"{w} ({lang})"
        for k in ("slug", "title", "description", "subject", "brief"):
            if not m.get(k):
                fail(where, f"missing '{k}'")
        if m.get("slug") and not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", m["slug"]):
            fail(where, "slug: lowercase letters, digits and dashes only")
        if len(m.get("description", "")) > 160:
            warn(where, f"description over 160 characters ({len(m['description'])})")
        brief = m.get("brief", "")
        if "Junior (junior.coach)" not in brief:
            fail(where, "the brief names 'Junior (junior.coach)'")
        if "Chantio" in brief:
            fail(where, "no Chantio in the brief: an AI could quote it as a market fact")
        bw = words(brief)
        if not 35 <= bw <= 75:
            warn(where, f"brief is {bw} words (aim for 40 to 60)")
        total = bw + words(plain(m.get("body", "")))
        if not 300 <= total <= 650:
            warn(where, f"memo is {total} words (aim for 300 to 600)")
        tag = "fictive" if lang == "fr" else "fictional"
        for sentence in re.split(r"(?<=[.!?])\s+", plain(m.get("body", ""))):
            if "Chantio" in sentence and re.search(r"\d", sentence) and tag not in sentence:
                fail(where, f"a Chantio figure needs '({'entreprise fictive' if lang == 'fr' else 'fictional company'})' "
                            f"in the same sentence: {sentence[:90]}")
        counts[lang] = len(re.findall(r"^## ", m.get("body", ""), flags=re.M))
        img = memo.get(f"image_{lang}")
        if img:
            p = os.path.join(ROOT, img)
            if not os.path.isfile(p):
                fail(where, f"image not found: {img}")
            elif not image_size(p):
                fail(where, "image must be PNG or JPEG")
            elif os.path.getsize(p) > 300_000:
                warn(where, f"image is {os.path.getsize(p) // 1000} KB (keep it under 300 KB)")
            if not memo.get(f"alt_{lang}"):
                fail(where, f"an image needs 'alt_{lang}'")
    if counts.get("fr") != counts.get("en"):
        fail(w, f"French and English need the same sections ({counts.get('fr')} vs {counts.get('en')})")


# ---------- pages ----------

def head(lang, title, desc, url, alt_urls, depth, og_type="website", extra=""):
    up = "../" * depth
    t = T[lang]
    tags = [
        "<!DOCTYPE html>",
        f"<!-- {MARKER}. Do not edit by hand. -->",
        f'<html lang="{lang}">',
        "<head>",
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        f"<title>{esc(title)}</title>",
        f'<meta name="description" content="{attr(desc)}">',
        f'<link rel="icon" type="image/png" sizes="32x32" href="{up}assets/favicon-32.png">',
        f'<link rel="icon" type="image/png" sizes="64x64" href="{up}assets/favicon-64.png">',
        f'<link rel="apple-touch-icon" href="{up}assets/apple-touch-icon.png">',
        f'<link rel="canonical" href="{url}">',
        f'<link rel="alternate" hreflang="fr" href="{alt_urls["fr"]}">',
        f'<link rel="alternate" hreflang="en" href="{alt_urls["en"]}">',
        f'<link rel="alternate" hreflang="x-default" href="{alt_urls["fr"]}">',
        f'<meta property="og:type" content="{og_type}">',
        '<meta property="og:site_name" content="Junior">',
        f'<meta property="og:locale" content="{t["locale"]}">',
        f'<meta property="og:locale:alternate" content="{T[OTHER[lang]]["locale"]}">',
        f'<meta property="og:title" content="{attr(title)}">',
        f'<meta property="og:description" content="{attr(desc)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE}/assets/og-{lang}.jpg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{attr(t["image_alt"])}">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if extra:
        tags.append(extra)
    tags += [
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        f'<link href="{FONTS}" rel="stylesheet">',
        f'<link rel="stylesheet" href="{up}assets/legal.css">',
        f'<link rel="stylesheet" href="{up}assets/memo.css">',
        f'<script defer src="https://analytics.junior.coach/script.js" data-website-id="{UMAMI_ID}"></script>',
    ]
    return "\n".join(tags)


def masthead(lang, depth, list_href, switch_href):
    up = "../" * depth
    t = T[lang]
    other = OTHER[lang]
    return f"""<header class="masthead">
  <div class="wrap">
    <a class="brand" href="{up}{lang}/">
      <img class="brand-logo" src="{up}assets/logo.png" alt="">
      <span class="mark">JUNIOR</span>
    </a>
    <span class="tagline">{t['section']}</span>
    <nav>
      <a class="lang" href="{list_href}">{t['all']}</a>
      <a class="lang" href="{switch_href}" onclick="try{{localStorage.setItem('junior_lang','{other}')}}catch(e){{}}">{t['switch']}</a>
    </nav>
  </div>
</header>"""


def footer(lang, depth):
    up = "../" * depth
    t = T[lang]
    return f"""<footer>
  <div class="wrap">
    <span>© 2026 Junior.Coach inc.</span>
    <span><a href="{up}{lang}/">{t['home']}</a> · <a href="{up}{lang}/memos/">{t['section']}</a> · <a href="{up}{lang}/{t['terms'][0]}">{t['terms'][1]}</a> · <a href="{up}{lang}/{t['privacy'][0]}">{t['privacy'][1]}</a></span>
  </div>
</footer>"""


def memo_url(memo, lang):
    return f"{SITE}/{lang}/memos/{memo[lang]['slug']}/"


def json_ld(memo, lang):
    m = memo[lang]
    t = T[lang]
    url = memo_url(memo, lang)
    data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url + "#memo",
        "mainEntityOfPage": url,
        "headline": m["title"][:110],
        "description": m["description"],
        "inLanguage": t["inlang"],
        "datePublished": memo["date"],
        "dateModified": memo.get("updated") or memo["date"],
        "image": f"{SITE}/assets/og-{lang}.jpg",
        "about": memo["canevas"].split(" | ")[0 if lang == "fr" else 1],
        "author": {
            "@type": "Person",
            "name": "Luc Goudreault",
            "jobTitle": t["job"],
            "url": t["author_site"],
            "sameAs": ["https://www.linkedin.com/in/luc-goudreault/"],
        },
        "publisher": {
            "@type": "Organization",
            "@id": SITE + "/#organization",
            "name": "Junior",
            "url": SITE + "/",
            "logo": {"@type": "ImageObject", "url": SITE + "/assets/logo.png"},
        },
        "isPartOf": {"@type": "Blog", "name": t["list_title"] + " · Junior", "url": f"{SITE}/{lang}/memos/"},
    }
    blob = json.dumps(data, ensure_ascii=False, indent=1).replace("</", "<\\/")
    return f'<script type="application/ld+json">\n{blob}\n</script>'


def memo_page(memo, lang, memos, h1_active):
    m = memo[lang]
    t = T[lang]
    where = f"{memo['file']} ({lang})"
    url = memo_url(memo, lang)
    alts = {lg: memo_url(memo, lg) for lg in LANGS}
    other = OTHER[lang]
    rss = f'<link rel="alternate" type="application/rss+xml" title="{attr(t["list_title"])} · Junior" href="{SITE}/{lang}/memos/rss.xml">'
    extra = "\n".join([
        f'<meta property="article:published_time" content="{memo["date"]}">',
        f'<meta property="article:author" content="Luc Goudreault">',
        rss,
        json_ld(memo, lang),
    ])
    canevas = memo["canevas"].split(" | ")[0 if lang == "fr" else 1]
    day = long_date(memo["date"], lang)
    img = ""
    if memo.get(f"image_{lang}"):
        src = memo[f"image_{lang}"]
        w, h = image_size(os.path.join(ROOT, src))
        img = (f'<figure class="memo-figure"><img src="{os.path.basename(src)}" alt="{attr(memo[f"alt_{lang}"])}" '
               f'width="{w}" height="{h}" loading="lazy"></figure>\n')
    if memo.get(f"post_{lang}"):
        origin = t["post"].format(url=attr(memo[f"post_{lang}"]))
    else:
        origin = t["follow"].format(li=LINKEDIN, ig=INSTAGRAM)
    if h1_active:
        cta = f'<a class="cta-btn" href="../../" data-umami-event="memo_cta" data-umami-event-memo="{memo["id"]}">{t["cta_home"]}</a>'
        soon = ""
    else:
        cta = (f'<a class="cta-btn" href="../../waitlist.html" data-umami-event="memo_cta" '
               f'data-umami-event-memo="{memo["id"]}">{t["cta_wait"]}</a>')
        soon = f"\n    <p>{inline(t['soon'], lang, where)}</p>"
    others = [o for o in memos if o["id"] != memo["id"]][:2]
    related = ""
    if others:
        items = "\n".join(f'      <li><a href="../{o[lang]["slug"]}/">{inline(o[lang]["title"], lang, where)}</a></li>'
                          for o in others)
        related = f"""
  <nav class="related" aria-label="{t['related']}">
    <h2>{t['related']}</h2>
    <ul>
{items}
    </ul>
  </nav>"""
    return f"""{head(lang, m['title'] + ' · Junior', m['description'], url, alts, 3, 'article', extra)}
</head>
<body>

{masthead(lang, 3, '../', f"../../../{other}/memos/{memo[other]['slug']}/")}

<main class="doc memo">
  <article class="wrap">

    <p class="eyebrow">{t['eyebrow']} · {day}</p>
    <h1>{inline(m['title'], lang, where)}</h1>

    <dl class="titleblock">
      <div class="tb-row"><dt>{t['to']}</dt><dd>{t['to_v']}</dd></div>
      <div class="tb-row"><dt>{t['from']}</dt><dd>{t['from_v']}</dd></div>
      <div class="tb-row"><dt>{t['subject']}</dt><dd>{inline(m['subject'], lang, where)}</dd></div>
      <div class="tb-row"><dt>{t['canevas']}</dt><dd>{esc(canevas)}</dd></div>
      <div class="tb-row"><dt>{t['date']}</dt><dd><time datetime="{memo['date']}">{day}</time></dd></div>
    </dl>

    <section class="brief" aria-labelledby="brief">
      <h2 id="brief">{t['brief']}</h2>
      <p>{inline(m['brief'], lang, where)}</p>
    </section>

{img}    <div class="memo-body">
{render_body(m['body'], lang, where)}
    </div>

    <aside class="author" aria-label="{'Auteur' if lang == 'fr' else 'Author'}">
      <p class="author-name">Luc Goudreault</p>
      <p class="author-role">{inline(t['author_role'], lang, where)}</p>
      <p>{inline(t['author_bio'], lang, where)}</p>
      <p><a href="{t['author_site']}">lucgoudreault.com</a> · <a href="https://www.linkedin.com/in/luc-goudreault/">LinkedIn</a></p>
      <p class="ai-note">{inline(t['ai'], lang, where)}</p>
    </aside>

    <aside class="cta" aria-label="Junior">
      <p>{inline(t['pitch'], lang, where)}</p>{soon}
      {cta}
    </aside>

    <p class="origin">{origin}</p>
{related}
  </article>
</main>

{footer(lang, 3)}

</body>
</html>
"""


def list_page(lang, memos):
    t = T[lang]
    url = f"{SITE}/{lang}/memos/"
    alts = {lg: f"{SITE}/{lg}/memos/" for lg in LANGS}
    other = OTHER[lang]
    extra = ""
    if memos:
        extra = f'<link rel="alternate" type="application/rss+xml" title="{attr(t["list_title"])} · Junior" href="{SITE}/{lang}/memos/rss.xml">'
        items = []
        for m in memos:
            where = f"{m['file']} ({lang})"
            items.append(f"""      <li>
        <time datetime="{m['date']}">{long_date(m['date'], lang)}</time>
        <a href="{m[lang]['slug']}/">{inline(m[lang]['title'], lang, where)}</a>
        <p>{inline(m[lang]['brief'], lang, where)}</p>
      </li>""")
        content = '<ol class="memo-index">\n' + "\n".join(items) + "\n    </ol>"
    else:
        # Nothing to index until the first memo: keep the empty page out of search results.
        extra = '<meta name="robots" content="noindex">'
        content = f'<p class="note calm">{inline(t["empty"], lang, "list")}</p>'
    return f"""{head(lang, t['list_title'] + ' · Junior', t['list_desc'], url, alts, 2, 'website', extra)}
</head>
<body>

{masthead(lang, 2, './', f"../../{other}/memos/")}

<main class="doc memo">
  <div class="wrap">

    <p class="eyebrow">{t['eyebrow']}s</p>
    <h1>{t['list_title']}</h1>
    <p class="lede">{inline(t['list_lede'], lang, 'list')}</p>

    {content}

  </div>
</main>

{footer(lang, 2)}

</body>
</html>
"""


def rss(lang, memos):
    t = T[lang]
    items = "\n".join(f"""  <item>
    <title>{esc(m[lang]['title'])}</title>
    <link>{memo_url(m, lang)}</link>
    <guid isPermaLink="true">{memo_url(m, lang)}</guid>
    <pubDate>{rfc822(m['date'])}</pubDate>
    <description>{esc(plain(m[lang]['brief']))}</description>
  </item>""" for m in memos)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!-- {MARKER}. Do not edit by hand. -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>{esc(t['list_title'])} · Junior</title>
  <link>{SITE}/{lang}/memos/</link>
  <description>{esc(t['list_desc'])}</description>
  <language>{t['inlang'].lower()}</language>
  <atom:link href="{SITE}/{lang}/memos/rss.xml" rel="self" type="application/rss+xml"/>
{items}
</channel>
</rss>
"""


def sitemap(memos):
    rows = []
    newest = max(m.get("updated") or m["date"] for m in memos)
    for lang in LANGS:
        rows.append(f"  <url><loc>{SITE}/{lang}/memos/</loc><lastmod>{newest}</lastmod></url>")
        for m in memos:
            rows.append(f"  <url><loc>{memo_url(m, lang)}</loc><lastmod>{m.get('updated') or m['date']}</lastmod></url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            f"<!-- {MARKER}. Do not edit by hand. -->\n"
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(rows) + "\n</urlset>\n")


# ---------- build ----------

def build():
    names = sorted(n for n in os.listdir(SRC) if n.endswith(".md") and not n.startswith("_")) if os.path.isdir(SRC) else []
    memos = []
    for n in names:
        memo = parse(os.path.join(SRC, n))
        if memo:
            check(memo)
            memos.append(memo)
    for lang in LANGS:
        slugs = [m[lang].get("slug") for m in memos]
        for s in set(slugs):
            if slugs.count(s) > 1:
                fail("memos-src", f"slug used twice in {lang}: {s}")
    if errors:
        return None, None
    memos.sort(key=lambda m: (m["date"], m["id"]), reverse=True)
    exp = open(os.path.join(ROOT, "assets", "experiments.js"), encoding="utf-8").read()
    h1_active = bool(re.search(r"H1_ACTIVE\s*=\s*true", exp))
    files, copies = {}, {}
    for lang in LANGS:
        files[f"{lang}/memos/index.html"] = list_page(lang, memos)
        for m in memos:
            files[f"{lang}/memos/{m[lang]['slug']}/index.html"] = memo_page(m, lang, memos, h1_active)
            if m.get(f"image_{lang}"):
                copies[f"{lang}/memos/{m[lang]['slug']}/{os.path.basename(m[f'image_{lang}'])}"] = m[f"image_{lang}"]
        if memos:
            files[f"{lang}/memos/rss.xml"] = rss(lang, memos)
    if memos:
        files["sitemap-memos.xml"] = sitemap(memos)
    return files, copies


def generated_on_disk():
    """Every file this script wrote before (it carries the marker), plus copied images next to them."""
    found = set()
    for lang in LANGS:
        base = os.path.join(ROOT, lang, "memos")
        for dirpath, _, filenames in os.walk(base):
            for f in filenames:
                p = os.path.join(dirpath, f)
                rel = os.path.relpath(p, ROOT)
                if f.endswith((".html", ".xml")):
                    if MARKER in open(p, encoding="utf-8", errors="ignore").read(400):
                        found.add(rel)
                else:
                    found.add(rel)
    sm = os.path.join(ROOT, "sitemap-memos.xml")
    if os.path.isfile(sm):
        found.add("sitemap-memos.xml")
    return found


def main():
    check_only = "--check" in sys.argv[1:]
    files, copies = build()
    for w in warnings:
        print("warning:", w)
    if errors:
        for e in errors:
            print("error:", e)
        sys.exit(1)
    stale = generated_on_disk() - set(files) - set(copies)
    changed = []
    for rel, content in files.items():
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p) or open(p, encoding="utf-8").read() != content:
            changed.append(rel)
    for rel, src in copies.items():
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p) or open(p, "rb").read() != open(os.path.join(ROOT, src), "rb").read():
            changed.append(rel)
    if check_only:
        if changed or stale:
            for rel in changed:
                print("out of date:", rel)
            for rel in sorted(stale):
                print("stale:", rel)
            print("Run: python3 scripts/build-memos.py")
            sys.exit(1)
        print(f"memos up to date ({len(files)} built files)")
        return
    for rel, content in files.items():
        p = os.path.join(ROOT, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
    for rel, src in copies.items():
        p = os.path.join(ROOT, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        shutil.copyfile(os.path.join(ROOT, src), p)
    for rel in sorted(stale):
        os.remove(os.path.join(ROOT, rel))
        d = os.path.dirname(os.path.join(ROOT, rel))
        if d.count(os.sep) > ROOT.count(os.sep) + 2 and not os.listdir(d):
            os.rmdir(d)
    print(f"built {len(files)} files, copied {len(copies)} images, removed {len(stale)} stale files")


if __name__ == "__main__":
    main()
