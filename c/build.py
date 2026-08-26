#!/usr/bin/env python3
"""
build — generates every page under /variants/c/ from one shell.

Run:  python3 build.py

Why a generator. The gate's one-edit test asks "make every primary button a
different colour, how many places do I edit?" With twelve hand-written pages the
answer is twelve. Here the shell (head, header, drawer, footer, scripts) is
defined once, every page supplies only its own <main>, and the answer is one.

Nothing here is a framework. It is a dict of pages and a string template, and it
writes plain static HTML that GitHub Pages serves directly.
"""
import html
import os
import re

SITE = "https://off-plate.github.io/variants/c/"

# ── the shell ───────────────────────────────────────────────────────────────
# `up` is the relative path back to c/ from the page's own directory, so every
# link and asset works whether the page sits at c/ or c/novinky/gema/.
SHELL = """<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#FFFFFF">
<meta property="og:type" content="{ogtype}">
<meta property="og:locale" content="{oglocale}">
<meta property="og:site_name" content="Off-Plate">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{site}img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{up}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{up}icon-180.png">
<link rel="manifest" href="{up}manifest.webmanifest">
<link rel="preload" href="{up}fonts/sora-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{up}fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{up}fonts.css"><!-- slop-lint-ignore: Inter + Sora are the locked Off-Plate brand faces, BRAND.md -->
<link rel="stylesheet" href="{up}site.css">
{head_extra}</head>
<body>

<a class="skip" href="#main">{skip}</a>

<header class="header" id="header">
  <div class="wrap header-in">
    <a class="brand" href="{up}" translate="no"><span class="brand__toggle" aria-hidden="true"><i></i></span>off plate</a>
    <nav class="nav" aria-label="{navlabel}">
{navlinks}
    </nav>
    <div class="header-right">
      <a class="btn btn--primary" href="{up}kontakt/">{cta}</a>
      <button class="burger" id="burger" type="button" aria-label="{burgeropen}" aria-expanded="false" aria-controls="drawer"><i></i></button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer" hidden>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="{navlabel}">
    <div class="drawer__head">
      <span class="brand" aria-hidden="true"><span class="brand__toggle"><i></i></span>off plate</span>
      <button class="burger" id="burgerClose" type="button" aria-label="{burgerclose}" aria-expanded="true" style="display:flex"><i></i></button>
    </div>
{drawerlinks}
    <a class="btn btn--primary" href="{up}kontakt/" style="margin-top:10px">{cta}</a>
  </div>
</div>

<noscript>
  <nav class="wrap noscript-nav" aria-label="{navlabel}">
{navlinks}
  </nav>
</noscript>

<main id="main">
{main}
</main>

<footer class="footer">
  <div class="wrap footer-in">
    <span class="xs">© 2026 Off-Plate, Praha</span>
    <nav class="xs" aria-label="{footlabel}">
{footlinks}
    </nav>
  </div>
</footer>

<script src="{up}site.js" defer></script>
</body>
</html>
"""

# ── navigation, defined once ────────────────────────────────────────────────
NAV_CS = [("obory/", "Obory"), ("cenik/", "Ceník"),
          ("jak-to-funguje/", "Jak to funguje"), ("novinky/", "Novinky")]
NAV_EN = [("", "Home")]

FOOT_CS = [("novinky/", "Novinky"), ("system/", "Systém"),
           ("en/", "English"), ("img/CREDITS.txt", "Fotografie")]


def nav_html(items, up, current, indent, drawer=False):
    out = []
    for href, label in items:
        cur = ' aria-current="page"' if href == current else ""
        lang = ' lang="en"' if label == "English" else ""
        out.append(f'{indent}<a href="{up}{href}"{cur}{lang}>{label}</a>')
    return "\n".join(out)


def render(page):
    up = page.get("up", "")
    lang = page.get("lang", "cs")
    cs = lang == "cs"
    return SHELL.format(
        lang=lang,
        title=page["title"],
        desc=page["desc"],
        ogtitle=page.get("ogtitle", page["title"]),
        ogtype=page.get("ogtype", "website"),
        oglocale="cs_CZ" if cs else "en_GB",
        canonical=SITE + page["path"],
        site=SITE,
        up=up,
        head_extra=page.get("head_extra", ""),
        skip="Přeskočit na obsah" if cs else "Skip to content",
        navlabel="Hlavní" if cs else "Main",
        footlabel="Patička" if cs else "Footer",
        burgeropen="Otevřít menu" if cs else "Open menu",
        burgerclose="Zavřít menu" if cs else "Close menu",
        cta="Domluvit hovor" if cs else "Book a call",
        navlinks=nav_html(NAV_CS if cs else NAV_EN, up, page.get("current"), "      "),
        drawerlinks=nav_html(NAV_CS if cs else NAV_EN, up, page.get("current"), "    "),
        footlinks=nav_html(FOOT_CS, up, page.get("current"), "      "),
        main=page["main"],
    )


def frag(name):
    """Page bodies live in _src/ so this file stays readable."""
    p = os.path.join("_src", name)
    return open(p, encoding="utf-8").read() if os.path.exists(p) else ""


def article_page(slug, kicker, title, date, lede, body, sources, img=None):
    """One template for all three news articles, so they cannot drift apart."""
    src = "\n".join(
        f'      <p><a href="{u}" rel="nofollow noopener">{html.escape(t)}</a></p>'
        for t, u in sources)
    return {
        "path": f"novinky/{slug}/", "up": "../../", "current": "novinky/",
        "title": f"{re.sub('<[^>]+>', '', title).replace('&nbsp;', ' ')} · Off-Plate",
        "desc": re.sub("<[^>]+>", "", lede).replace("&nbsp;", " ")[:180],
        "ogtype": "article",
        "main": f"""
<article class="section section--tight">
  <div class="wrap">
    <div class="article">
      <p class="post__kicker">{kicker}</p>
      <h1 class="d2" style="margin-top:8px">{title}</h1>
      <p class="post__date mono" style="margin-top:14px">{date}</p>
      <p class="lede" style="margin-top:26px;max-width:100%">{lede}</p>
{body}
      <div class="source">
        <p><strong>Zdroje</strong></p>
{src}
      </div>
      <p style="margin-top:2em"><a href="../">Všechny novinky</a></p>
    </div>
  </div>
</article>
""",
    }


def build(pages):
    for pg in pages:
        out = os.path.join(pg["path"], "index.html") if pg["path"] else "index.html"
        d = os.path.dirname(out)
        if d:
            os.makedirs(d, exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(render(pg))
        print(f"  {out or 'index.html'}  {os.path.getsize(out) // 1024}KB")


if __name__ == "__main__":
    import pages as P
    print("building", len(P.PAGES), "pages")
    build(P.PAGES)
    print("done")
