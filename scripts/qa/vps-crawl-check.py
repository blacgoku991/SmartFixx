#!/usr/bin/env python3
"""Étend les assertions du test HTTP VPS à TOUTES les URL du sitemap (+ /admin/login).
   python3 scripts/qa/vps-crawl-check.py <baseURL d'une variante VPS servie> [--og-404-ok]
Pour chaque page : 200 sans redirection, exactement un <h1>, chaque <script> porte le nonce de l'en-tête
CSP, aucune mention de chatgpt.site ni « Sites de ChatGPT », une seule balise canonique, absolue en
https://smartfixx.fr, og:image présente et absolue (https://smartfixx.fr/…) et servie en 200, JSON-LD
analysable, aucun lien /admin dans le HTML public, chaîne smartfixx-theme, contrôle « Apparence du site » /
« Activer le mode sombre », en-têtes nosniff et CSP frame-ancestors 'none'.
Vérifie aussi : sitemap en https://smartfixx.fr, robots (Disallow /admin, sitemap smartfixx.fr),
404 réelle pour une URL inconnue, médias exigés par les tests et par les emails déjà envoyés.
Icônes : chaque <link rel="icon" | "apple-touch-icon" | "shortcut icon"> déclarée doit répondre 200.
--og-404-ok : tolère que l'image og:image réponde 404 (avant la livraison de /og-image.png par le lot 7).
--icons-404-ok : tolère que les icônes déclarées par le layout répondent 404 (/icon-192.png,
  /apple-touch-icon.png, /favicon.ico : livrées par le lot 7) ; chaque tolérance produit une note."""
import sys, re, json, urllib.request, urllib.error
args = [a for a in sys.argv[1:] if not a.startswith("--")]
OG_404_OK = "--og-404-ok" in sys.argv
ICONS_404_OK = "--icons-404-ok" in sys.argv
B = args[0].rstrip("/")
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
op = urllib.request.build_opener(NoRedirect)
def get(p):
    try:
        r = op.open(B + p, timeout=30); return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")
bad = 0; notes = []
def ko(msg):
    global bad; bad += 1; print("  ✗", msg)
_, _, sm = get("/sitemap.xml")
locs = re.findall(r"<loc>(.*?)</loc>", sm)
if not locs or any(not u.startswith("https://smartfixx.fr") for u in locs): ko("sitemap : URL hors https://smartfixx.fr")
paths = [u.replace("https://smartfixx.fr", "") or "/" for u in locs]
extra = ["/admin/login"]
og_checked = {}
for p in paths + extra:
    s, h, t = get(p); h = {k.lower(): v for k, v in h.items()}; f = []
    public = not p.startswith("/admin")
    if s != 200: f.append(f"HTTP {s}")
    csp = h.get("content-security-policy", ""); m = re.search(r"'nonce-([^']+)'", csp)
    if not m: f.append("CSP sans nonce")
    else:
        miss = [x for x in re.findall(r"<script\b([^>]*)>", t) if f'nonce="{m.group(1)}"' not in x]
        if miss: f.append(f"{len(miss)} <script> sans nonce")
    if "frame-ancestors 'none'" not in csp: f.append("frame-ancestors")
    if h.get("x-content-type-options") != "nosniff": f.append("nosniff")
    n = len(re.findall(r"<h1[\s>]", t))
    if n != 1: f.append(f"h1={n}")
    if public and "chatgpt.site" in t: f.append("mention chatgpt.site")
    if "Sites de ChatGPT" in t: f.append("mention « Sites de ChatGPT »")
    for i, block in enumerate(re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S)):
        try:
            json.loads(block)
        except Exception as e:
            f.append(f"JSON-LD n°{i + 1} illisible ({e.__class__.__name__})")
    if public:
        cs = re.findall(r'<link rel="canonical" href="([^"]+)"', t)
        if len(cs) != 1: f.append(f"{len(cs)} balise(s) canonical")
        if not cs or not cs[0].startswith("https://smartfixx.fr"): f.append(f"canonique {cs[0] if cs else 'absente'}")
        og = re.findall(r'<meta property="og:image" content="([^"]+)"', t)
        if not og: f.append("og:image absente")
        elif not og[0].startswith("https://smartfixx.fr/"): f.append(f"og:image non absolue ({og[0]})")
        else:
            op_path = og[0].replace("https://smartfixx.fr", "")
            if op_path not in og_checked:
                st, hh, _ = get(op_path); og_checked[op_path] = st
            if og_checked[op_path] != 200:
                if OG_404_OK: notes.append(f"{op_path} → {og_checked[op_path]} (toléré : --og-404-ok)")
                else: f.append(f"og:image {op_path} → {og_checked[op_path]}")
        if re.search(r'href="/admin[/"?#]', t): f.append("lien /admin dans le HTML public")
        for tag in re.findall(r'<link\b[^>]*>', t):
            rel = re.search(r'rel="([^"]+)"', tag); href = re.search(r'href="([^"]+)"', tag)
            if not rel or not href or rel.group(1) not in ("icon", "apple-touch-icon", "shortcut icon"): continue
            ip = href.group(1).replace("https://smartfixx.fr", "").split("?")[0]
            if not ip.startswith("/"): continue
            if ip not in og_checked:
                st, _, _ = get(ip); og_checked[ip] = st
            if og_checked[ip] != 200:
                if ICONS_404_OK: notes.append(f"icône {ip} → {og_checked[ip]} (toléré : --icons-404-ok, livrée au lot 7)")
                else: f.append(f"icône {ip} → {og_checked[ip]}")
    for needle in ("smartfixx-theme", "Apparence du site", "Activer le mode sombre"):
        if needle not in t: f.append(f"« {needle} » absent")
    if f: ko(f"{p} : " + "; ".join(f))
    else: print("  ✓", p)
s, _, r = get("/robots.txt")
if s != 200 or "Disallow: /admin" not in r or "https://smartfixx.fr/sitemap.xml" not in r: ko("robots.txt")
s, _, _ = get("/expertise-inconnue")
if s != 404: ko(f"/expertise-inconnue → {s} (404 attendu, pas de soft-404 ni de redirection globale)")
for a in ["/smartfixx-logo.webp", "/smartfixx-icon.png", "/studio-web.webp", "/studio-automation.webp", "/studio-security.webp", "/email-logo.png", "/email-envelope.png"]:
    s, h, _ = get(a)
    if s != 200 or "image" not in {k.lower(): v for k, v in h.items()}.get("content-type", ""): ko(f"média {a} → {s}")
for n in sorted(set(notes)): print("  ! note :", n)
print(f"\n{bad} écart(s) ; {len(paths)} URL au sitemap")
sys.exit(1 if bad else 0)
