#!/usr/bin/env python3
"""Monogramme S de SmartFixx (favicon.svg), produit sans IA.

Le S est le glyphe de SFX Display (Bricolage Grotesque, OFL 1.1, face 92 % de public/fonts), extrait en
contour vectoriel par fontTools : même lettre que les titres du site. Carré arrondi nuit (--sx-bg vers
--sx-indigo), S en --sx-text, trait ambre --sx-signal sous la lettre (le trait du mot-clé des H1).
Monogramme à valider par le propriétaire (décision n° 8) ; il remplace la flèche de l'ancien favicon.

    python3 -I scripts/og/monogram.py <dépôt>      # écrit <dépôt>/public/favicon.svg
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
font = TTFont(root / 'public/fonts/sfx-display-92.v1.woff2')
glyphs = font.getGlyphSet(); name = font.getBestCmap()[ord('S')]
bp = BoundsPen(glyphs); glyphs[name].draw(bp); x0, y0, x1, y1 = bp.bounds

BOX = 48          # viewBox
H = 27            # hauteur du S dans la boîte
TOP = 7.5         # haut du S
s = H / (y1 - y0)
w = (x1 - x0) * s
dx = (BOX - w) / 2 - x0 * s
dy = TOP + y1 * s  # retournement vertical : y' = dy - y * s

pen = SVGPathPen(glyphs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
glyphs[name].draw(TransformPen(pen, (s, 0, 0, -s, dx, dy)))
path = pen.getCommands()

bar_y = TOP + H + 3.2
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'
    '<defs><linearGradient id="n" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="#0D1638"/><stop offset=".62" stop-color="#070B18"/><stop offset="1" stop-color="#2A2370"/>'
    '</linearGradient></defs>'
    '<rect width="48" height="48" rx="11" fill="url(#n)"/>'
    f'<path fill="#EEF2FB" d="{path}"/>'
    f'<rect x="{(BOX - w) / 2 + 1:.2f}" y="{bar_y:.2f}" width="{w - 2:.2f}" height="3.4" rx="1.7" fill="#FFB648"/>'
    '</svg>\n'
)
(root / 'public/favicon.svg').write_text(svg)
print(f'favicon.svg : {len(svg)} o, S {w:.1f} × {H} dans {BOX} × {BOX}')
