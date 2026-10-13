#!/usr/bin/env bash
# Lighthouse mobile, plusieurs passes par chemin, rapport à la MÉDIANE (par score de performance).
#   bash scripts/qa/lh.sh <baseURL> <dossierSortie> /chemin1 /chemin2 …
# Variables : LH_RUNS (3 par défaut), CHROME_PATH (/opt/pw-browsers/chromium par défaut).
# Le binaire lighthouse vient du cache npx (npx --yes lighthouse@13).
set -uo pipefail
BASE=${1:?baseURL}; OUT=${2:?sortie}; shift 2; mkdir -p "$OUT"
RUNS=${LH_RUNS:-3}; export CHROME_PATH=${CHROME_PATH:-/opt/pw-browsers/chromium}
for p in "$@"; do
  n=$(echo "$p" | sed 's#^/$#accueil#; s#^/##; s#[/?&=]#_#g')
  for i in $(seq 1 "$RUNS"); do
    npx --yes lighthouse@13 "$BASE$p" --only-categories=performance,seo,accessibility,best-practices \
      --output=json --output-path="$OUT/$n.run$i.json" \
      --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" --quiet >/dev/null 2>&1 \
      || echo "échec lighthouse $p passe $i" >&2
  done
done
python3 - "$OUT" "$RUNS" <<'PY'
import json,glob,os,sys,statistics
out,runs=sys.argv[1],int(sys.argv[2])
groups={}
for f in sorted(glob.glob(os.path.join(out,'*.run*.json'))):
    name=os.path.basename(f).rsplit('.run',1)[0]; groups.setdefault(name,[]).append(f)
print(f"{'page':<40}{'perf':>5}{'a11y':>5}{'bp':>5}{'seo':>5}{'LCP':>8}{'TBT':>8}{'CLS':>7}{'JS':>8}{'CSS':>7}{'total':>8}  (médiane de {runs})")
for name,files in groups.items():
    rows=[]
    for f in files:
        try: d=json.load(open(f))
        except Exception: continue
        c=d['categories']; a=d['audits']
        sc=lambda k: round((c[k]['score'] or 0)*100)
        items=a['network-requests']['details']['items']
        size=lambda t: sum((i.get('transferSize') or 0) for i in items if i.get('resourceType')==t)
        rows.append(dict(perf=sc('performance'),a11y=sc('accessibility'),bp=sc('best-practices'),seo=sc('seo'),
            lcp=a['largest-contentful-paint']['numericValue'],tbt=a['total-blocking-time']['numericValue'],
            cls=a['cumulative-layout-shift']['numericValue'],js=size('Script'),css=size('Stylesheet'),
            tot=sum((i.get('transferSize') or 0) for i in items)))
    if not rows: print(f"{name:<40} aucune passe valide"); continue
    rows.sort(key=lambda r:r['perf']); m=rows[len(rows)//2]
    print(f"{name:<40}{m['perf']:>5}{m['a11y']:>5}{m['bp']:>5}{m['seo']:>5}{m['lcp']/1000:>7.2f}s{m['tbt']:>6.0f}ms{m['cls']:>7.3f}{m['js']/1024:>6.0f}Ko{m['css']/1024:>5.0f}Ko{m['tot']/1024:>6.0f}Ko")
    json.dump(m,open(os.path.join(out,name+'.median.json'),'w'),indent=1)
PY
