#!/usr/bin/env python3
"""Contrastes WCAG des jetons --sx- de app/globals.css, dans les deux thèmes.
   python3 scripts/qa/contrast.py [chemin/vers/globals.css]
Lit le bloc :root (sombre par défaut) puis :root[data-theme='light'] (surcharges), résout les var(),
compose les couleurs avec alpha et les pastilles color-mix(couleur 14 %, surface), et vérifie les paires
d'usage ci-dessous : texte ≥ 4,5:1, contrôles et éléments graphiques ≥ 3:1.
Toute nouvelle couleur passe par ce script (systeme-design : « ne jamais ajouter une couleur sans… »)."""
import re, sys
from pathlib import Path
css = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[2] / "app/globals.css").read_text()

def block(selector_re):
    m = re.search(selector_re + r"\s*\{(.*?)\n\}", css, re.S)
    if not m: raise SystemExit(f"bloc introuvable : {selector_re}")
    body = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)
    return dict((k.strip(), v.strip()) for k, v in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body))

dark = block(r":root")
light = {**dark, **block(r":root\[data-theme='light'\]")}

def hexrgb(v):
    v = v.strip()
    if v.startswith("#"):
        h = v[1:]
        if len(h) == 3: h = "".join(c * 2 for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)), (int(h[6:8], 16) / 255 if len(h) == 8 else 1.0)
    m = re.match(r"rgba?\(([^)]+)\)", v)
    if m:
        parts = [p.strip() for p in m.group(1).split(",")]
        return tuple(int(float(p)) for p in parts[:3]), (float(parts[3]) if len(parts) > 3 else 1.0)
    raise ValueError(v)

def resolve(t, name, depth=0):
    v = t[name]
    m = re.fullmatch(r"var\((--[\w-]+)\)", v)
    return resolve(t, m.group(1), depth + 1) if m and depth < 8 else v

def over(fg, bg):
    (r, a), (b, _) = fg, bg
    return tuple(round(r[i] * a + b[i] * (1 - a)) for i in range(3)), 1.0

def lum(rgb):
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (x / 255 for x in rgb)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

def col(t, name, on=None):
    c = hexrgb(resolve(t, name))
    if c[1] < 1 and on is not None: c = over(c, col(t, on))
    return c

def chip(t, color, surface, pct):
    """color-mix(in srgb, color pct%, surface)."""
    c, s = col(t, color, surface)[0], col(t, surface)[0]
    p = pct / 100
    return tuple(round(c[i] * p + s[i] * (1 - p)) for i in range(3))

SURF = ["--sx-bg", "--sx-surface", "--sx-surface-2", "--sx-surface-3"]
def pairs(theme, t):
    out = []
    text_fgs = ["--sx-text", "--sx-text-muted", "--sx-accent", "--sx-success", "--sx-warning", "--sx-danger", "--sx-violet", "--sx-neutral"]
    for fg in text_fgs:
        for bg in SURF: out.append((f"{fg} sur {bg}", col(t, fg, bg)[0], col(t, bg)[0], 4.5))
    # texte discret : métadonnées et placeholders, jamais sur surface-3 (survol)
    for bg in SURF[:3]: out.append((f"--sx-text-faint sur {bg}", col(t, "--sx-text-faint", bg)[0], col(t, bg)[0], 4.5))
    # texte ambre : en sombre partout, en clair sur fonds clairs (#8A4B00)
    for bg in SURF[:3]: out.append((f"--sx-signal-text sur {bg}", col(t, "--sx-signal-text", bg)[0], col(t, bg)[0], 4.5))
    out.append(("--sx-on-accent sur --sx-accent-strong (bouton bleu)", col(t, "--sx-on-accent")[0], col(t, "--sx-accent-strong")[0], 4.5))
    out.append(("--sx-on-accent sur --sx-accent-strong-hover", col(t, "--sx-on-accent")[0], col(t, "--sx-accent-strong-hover")[0], 4.5))
    out.append(("--sx-on-cta sur --sx-cta (CTA principal)", col(t, "--sx-on-cta")[0], col(t, "--sx-cta")[0], 4.5))
    out.append(("--sx-on-cta sur --sx-cta-hover", col(t, "--sx-on-cta")[0], col(t, "--sx-cta-hover")[0], 4.5))
    out.append(("--sx-cta-icon sur --sx-cta (flèche)", col(t, "--sx-cta-icon")[0], col(t, "--sx-cta")[0], 3))
    out.append(("--sx-selection-text sur --sx-selection-bg", col(t, "--sx-selection-text")[0], col(t, "--sx-selection-bg")[0], 4.5))
    for bg in SURF[:3]:
        out.append((f"--sx-cta (contour du CTA) sur {bg}", col(t, "--sx-cta")[0], col(t, bg)[0], 3))
        out.append((f"--sx-line-strong (bordure de champ) sur {bg}", col(t, "--sx-line-strong")[0], col(t, bg)[0], 3))
        out.append((f"--sx-focus (anneau) sur {bg}", col(t, "--sx-focus")[0], col(t, bg)[0], 3))
        out.append((f"--sx-accent-strong (contrôle actif) sur {bg}", col(t, "--sx-accent-strong")[0], col(t, bg)[0], 3))
    # pastilles de statut : texte de la couleur sur color-mix(couleur 14 %, surface)
    for c in ["--sx-accent", "--sx-success", "--sx-warning", "--sx-danger", "--sx-violet"]:
        for s in ["--sx-surface", "--sx-surface-2"]:
            out.append((f"pastille {c} (14 %) sur {s}", col(t, c, s)[0], chip(t, c, s, 14), 4.5))
    pct = float(t["--sx-chip-tint-neutral"].rstrip("%"))
    for s in ["--sx-surface", "--sx-surface-2"]:
        fg = "--sx-text-muted" if theme == "clair" else "--sx-neutral"
        out.append((f"pastille neutre {fg} ({pct:g} %) sur {s}", col(t, fg, s)[0], chip(t, "--sx-neutral", s, pct), 4.5))
    # pastille « Nouvelle » : texte encre sur signal plein
    out.append(("--sx-on-cta sur --sx-signal (pastille Nouvelle)", col(t, "--sx-on-cta" if theme == "sombre" else "--sx-text")[0], col(t, "--sx-signal")[0], 4.5))
    return out

fails = 0
for theme, t in (("sombre", dark), ("clair", light)):
    print("=====", theme)
    for name, fg, bg, need in pairs(theme, t):
        r = ratio(fg, bg); good = r >= need; fails += not good
        print(f"{'OK ' if good else 'XX '} {r:5.2f}:1 (≥{need:g}) {name}")
print("échecs:", fails)
sys.exit(1 if fails else 0)
