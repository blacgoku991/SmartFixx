#!/usr/bin/env python3
"""Audit SEO d'une variante servie : python3 scripts/qa/seo-audit.py <baseURL> [--chemins /a,/b]
Pour chaque URL du sitemap (ou la liste --chemins) : code HTTP, titre ≤ 65 caractères, description de
120 à 160, h1 unique, canonique absolue https://smartfixx.fr, og:image absolue, types JSON-LD, doublons
de titre et de description. Puis maillage : liens internes entrants par page, comptés hors <footer>
(crawl des pages du sitemap), avec la liste des pages qui en reçoivent moins de 2.
Code de sortie 1 si une page est en défaut (le maillage est un rapport, pas un échec)."""
import sys, re, html, json, urllib.request, urllib.error
from collections import defaultdict
B = sys.argv[1].rstrip("/")
only = None
if "--chemins" in sys.argv:
    only = sys.argv[sys.argv.index("--chemins") + 1].split(",")
def fetch(p):
    try:
        r = urllib.request.urlopen(B + p, timeout=30); return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception:
        return "ERR", ""
_, sm = fetch("/sitemap.xml")
urls = re.findall(r"<loc>(.*?)</loc>", sm)
paths = only or [u.replace("https://smartfixx.fr", "") or "/" for u in urls]
print(f"sitemap : {len(urls)} URL ; audit de {len(paths)} chemin(s)")
norm = lambda p: (p.split("#")[0].split("?")[0].rstrip("/") or "/")
bad = 0; seen_t = {}; seen_d = {}; inbound = defaultdict(set); pages = {}
for p in paths:
    code, t = fetch(p); pages[p] = t
    title = html.unescape((re.search(r"<title>(.*?)</title>", t, re.S) or [None, ""])[1]).strip()
    desc = html.unescape((re.search(r'<meta name="description" content="(.*?)"', t, re.S) or [None, ""])[1])
    canon = (re.search(r'<link rel="canonical" href="(.*?)"', t) or [None, ""])[1]
    og = (re.search(r'<meta property="og:image" content="(.*?)"', t) or [None, ""])[1]
    h1 = len(re.findall(r"<h1[\s>]", t))
    types = []
    for block in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', t, re.S):
        try:
            d = json.loads(block)
            for node in (d.get("@graph", [d]) if isinstance(d, dict) else d):
                ty = node.get("@type") if isinstance(node, dict) else None
                if ty: types += ty if isinstance(ty, list) else [ty]
        except Exception:
            types.append("ILLISIBLE")
    f = []
    if code != 200: f.append(f"HTTP {code}")
    if not title or len(title) > 65: f.append(f"titre {len(title)}")
    if not (120 <= len(desc) <= 160): f.append(f"desc {len(desc)}")
    if h1 != 1: f.append(f"h1={h1}")
    if not canon.startswith("https://smartfixx.fr"): f.append(f"canonique «{canon}»")
    if not og.startswith("https://smartfixx.fr/"): f.append("og:image absente ou relative")
    if title in seen_t: f.append(f"titre dupliqué avec {seen_t[title]}")
    if desc and desc in seen_d: f.append(f"description dupliquée avec {seen_d[desc]}")
    if not types: f.append("pas de JSON-LD")
    if "ILLISIBLE" in types: f.append("JSON-LD illisible")
    for forbidden in ("LocalBusiness", "ProfessionalService", "FAQPage"):
        if forbidden in types: f.append(f"type interdit {forbidden}")
    seen_t[title] = p; seen_d[desc] = p
    if f: bad += 1
    print(f"  {'✗' if f else '✓'} {p:<46} [{','.join(sorted(set(types)))}] {'; '.join(f)}")
# Maillage interne hors pied de page
for p, t in pages.items():
    body = re.sub(r"<footer\b.*?</footer>", "", t, flags=re.S)
    for href in re.findall(r'<a\b[^>]*href="(/[^"]*)"', body):
        target = norm(html.unescape(href))
        if target != norm(p): inbound[target].add(norm(p))
print("\nLiens entrants hors pied (pages du sitemap) :")
weak = []
for p in paths:
    n = len(inbound.get(norm(p), ()))
    print(f"  {n:>3}  {p}")
    if n < 2: weak.append(p)
print("\nPages avec moins de 2 liens entrants hors pied :", ", ".join(weak) if weak else "aucune")
print(f"\n{bad} page(s) en défaut sur {len(paths)}")
sys.exit(1 if bad else 0)
