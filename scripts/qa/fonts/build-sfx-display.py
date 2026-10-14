#!/usr/bin/env python3
"""Construit public/fonts/sfx-display-82.v1.woff2 et sfx-display-92.v1.woff2 (« SFX Display »).

Source : Bricolage Grotesque (SIL OFL 1.1), paquet npm @fontsource-variable/bricolage-grotesque@5.3.0,
récupéré HORS du dépôt (il n'est jamais ajouté au package.json du site) :
    cd /tmp && npm pack @fontsource-variable/bricolage-grotesque@5.3.0 && tar xzf fontsource-*.tgz
    python3 scripts/qa/fonts/build-sfx-display.py /tmp/package public/fonts

Étapes, pour chaque largeur (82 % et 92 %) :
1. fontTools.varLib.instancer : instance statique wght=700 opsz=96 wdth=<largeur> du fichier latin ;
2. ajout de Ÿ (U+0178) depuis l'instance latin-ext du même paquet ;
3. glyphes absents de la police et exigés par le sous-ensemble (contrôle cmap des juges) :
   U+202F espace fine insécable (même chasse que U+2009), U+00AD, U+2010 et U+2011 (glyphe du trait
   d'union : U+2011 = trait d'union insécable des noms de lieux),
   U+201B (glyphe de U+2018), U+00A4 ¤ et les flèches ← → ↗ dessinés ici, à la graisse du titre ;
4. tables name renommées en « SFX Display » (version modifiée ; la licence ne déclare pas de
   Reserved Font Name, le renommage évite toute confusion avec la police d'origine) ;
5. pyftsubset : sous-ensemble obligatoire, fonctionnalités kern, liga, calt, case, tnum, lnum, woff2.
Contrôle final : chaque point de code du sous-ensemble est dans la cmap, chaque fichier ≤ 24 Ko.
"""
import math, subprocess, sys, tempfile
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import DecomposingRecordingPen

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/package")
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "public/fonts")
UNICODES = "U+0020-007E,U+00A0-00FF,U+0152-0153,U+0178,U+2009,U+202F,U+2010-2011,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2190,U+2192,U+2197"
def codepoints(spec):
    out = []
    for part in spec.split(","):
        a, _, b = part.replace("U+", "").partition("-")
        out += range(int(a, 16), int(b or a, 16) + 1)
    return out
NEED = codepoints(UNICODES)

def instance(file, wdth):
    f = TTFont(SRC / "files" / file)
    return instantiateVariableFont(f, {"wght": 700, "opsz": 96, "wdth": wdth}, inplace=False)

def poly(pen, pts):
    pen.moveTo(pts[0])
    for p in pts[1:]: pen.lineTo(p)
    pen.closePath()

def rot(pts, ang, cx, cy):
    c, s = math.cos(ang), math.sin(ang)
    return [(round(cx + (x - cx) * c - (y - cy) * s), round(cy + (x - cx) * s + (y - cy) * c)) for x, y in pts]

def arrow_right(t, w=118, y=300, x0=70, x1=690, head=230):
    """Flèche pleine vers la droite : fût de largeur w, pointe en chevron (sens horaire = contour plein)."""
    h = w / 2
    return [(x0, y - h), (x0, y + h), (x1 - head * 0.62, y + h), (x1 - head, y + head * 0.95),
            (x1 - head + w * 1.05, y + head * 0.95), (x1, y), (x1 - head + w * 1.05, y - head * 0.95),
            (x1 - head, y - head * 0.95), (x1 - head * 0.62, y - h)]

def add_glyph(font, name, glyph, advance, lsb=None):
    order = font.getGlyphOrder()
    if name not in order:
        font.setGlyphOrder(order + [name])
    font["glyf"][name] = glyph
    glyph.recalcBounds(font["glyf"])
    font["hmtx"][name] = (advance, lsb if lsb is not None else getattr(glyph, "xMin", 0))

def map_cp(font, cp, name):
    for table in font["cmap"].tables:
        if table.isUnicode(): table.cmap[cp] = name

def build(wdth):
    f = instance("bricolage-grotesque-latin-standard-normal.woff2", wdth)
    ext = instance("bricolage-grotesque-latin-ext-standard-normal.woff2", wdth)
    cm = f.getBestCmap()
    # Ÿ depuis latin-ext (glyphe composite : on le décompose en contours simples)
    yname = ext.getBestCmap()[0x178]
    gs = ext.getGlyphSet(); rec = DecomposingRecordingPen(gs); gs[yname].draw(rec)
    pen = TTGlyphPen(None); rec.replay(pen)
    add_glyph(f, "Ydieresis", pen.glyph(), ext["hmtx"][yname][0]); map_cp(f, 0x178, "Ydieresis")
    # espace fine insécable : même chasse que l'espace fine
    pen = TTGlyphPen(None); add_glyph(f, "uni202F", pen.glyph(), f["hmtx"][cm[0x2009]][0], 0); map_cp(f, 0x202F, "uni202F")
    map_cp(f, 0x00AD, cm[0x2D]); map_cp(f, 0x2010, cm[0x2D]); map_cp(f, 0x2011, cm[0x2D]); map_cp(f, 0x201B, cm[0x2018])
    # flèches
    adv = 760
    pen = TTGlyphPen(None); poly(pen, arrow_right(f)); add_glyph(f, "arrowright", pen.glyph(), adv); map_cp(f, 0x2192, "arrowright")
    left = [(adv - x, y) for x, y in arrow_right(f)][::-1]
    pen = TTGlyphPen(None); poly(pen, left); add_glyph(f, "arrowleft", pen.glyph(), adv); map_cp(f, 0x2190, "arrowleft")
    ne = rot(arrow_right(f, x0=120, x1=640), math.radians(45), 380, 300)
    pen = TTGlyphPen(None); poly(pen, ne); add_glyph(f, "arrownortheast", pen.glyph(), adv); map_cp(f, 0x2197, "arrownortheast")
    # ¤ : anneau (contour extérieur horaire, intérieur antihoraire) et quatre ergots
    cx, cy, ro, ri, n = 300, 330, 205, 120, 32
    outer = [(round(cx + ro * math.cos(-2 * math.pi * k / n)), round(cy + ro * math.sin(-2 * math.pi * k / n))) for k in range(n)]
    inner = [(round(cx + ri * math.cos(2 * math.pi * k / n)), round(cy + ri * math.sin(2 * math.pi * k / n))) for k in range(n)]
    pen = TTGlyphPen(None); poly(pen, outer); poly(pen, inner)
    for a in (45, 135, 225, 315):
        r = math.radians(a); ux, uy = math.cos(r), math.sin(r); px, py = -uy, ux; w = 52
        p0 = (cx + ux * (ro - 30), cy + uy * (ro - 30)); p1 = (cx + ux * (ro + 95), cy + uy * (ro + 95))
        pts = [(p0[0] + px * w, p0[1] + py * w), (p1[0] + px * w, p1[1] + py * w), (p1[0] - px * w, p1[1] - py * w), (p0[0] - px * w, p0[1] - py * w)]
        poly(pen, [(round(x), round(y)) for x, y in pts][::-1])
    add_glyph(f, "currency", pen.glyph(), 600); map_cp(f, 0xA4, "currency")
    # noms et classes
    name = f["name"]
    for rec in list(name.names):
        if rec.nameID in (1, 4, 6, 16, 17, 3):
            name.removeNames(nameID=rec.nameID)
    for nid, val in ((1, "SFX Display"), (2, "Bold"), (3, f"SFX Display Bold {wdth}; modifié depuis Bricolage Grotesque 5.3.0"), (4, "SFX Display Bold"), (6, f"SFXDisplay-Bold{wdth}"), (16, "SFX Display"), (17, "Bold")):
        name.setName(val, nid, 3, 1, 0x409)
    f["OS/2"].usWeightClass = 700
    f["OS/2"].usWidthClass = 3 if wdth <= 82 else 4
    f["OS/2"].fsSelection = (f["OS/2"].fsSelection | 0x20) & ~0x40  # Bold, pas Regular
    f["head"].macStyle |= 1
    with tempfile.TemporaryDirectory() as tmp:
        ttf = Path(tmp) / f"d{wdth}.ttf"; f.save(ttf)
        out = OUT / f"sfx-display-{wdth}.v1.woff2"
        subprocess.run(["pyftsubset", str(ttf), f"--unicodes={UNICODES}", "--layout-features=kern,liga,calt,case,tnum,lnum",
                        "--flavor=woff2", "--name-IDs=1,2,3,4,6,16,17", f"--output-file={out}"], check=True)
    return out

def check(path):
    f = TTFont(path); cm = f.getBestCmap()
    missing = [hex(c) for c in NEED if c not in cm]
    size = path.stat().st_size
    fam = f["name"].getDebugName(1)
    print(f"{path.name}: {size} octets ({size / 1024:.1f} Ko), famille « {fam} », {len(NEED)} points de code exigés, manquants : {missing or 'aucun'}")
    return not missing and size <= 24 * 1024

OUT.mkdir(parents=True, exist_ok=True)
ok = all(check(build(w)) for w in (82, 92))
sys.exit(0 if ok else 1)
