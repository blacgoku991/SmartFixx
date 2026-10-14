#!/usr/bin/env bash
# Lighthouse mobile, plusieurs passes par chemin, rapport à la MÉDIANE (par score de performance).
#   bash scripts/qa/lh.sh <baseURL> <dossierSortie> /chemin1 /chemin2 …
# Variables : LH_RUNS (3 par défaut), CHROME_PATH (/opt/pw-browsers/chromium par défaut).
# Porte (tour 3 bis) : LH_TBT_MAX (200 ms) et LH_LCP_MAX (2600 ms) s'appliquent aux MÉDIANES PROPRES du TBT et
# du LCP de chaque chemin (et non à la passe médiane par score) ; code de sortie 1 si une page les dépasse.
# Toujours sous « flock /tmp/smartfixx-build.lock » (machine de 4 processeurs, mesures sensibles à la charge).
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
python3 - "$OUT" "$RUNS" "${LH_TBT_MAX:-200}" "${LH_LCP_MAX:-2600}" <<'PY'
import json,glob,os,sys,statistics
out,runs=sys.argv[1],int(sys.argv[2]); tbt_max,lcp_max=float(sys.argv[3]),float(sys.argv[4]); bad=[]
groups={}
for f in sorted(glob.glob(os.path.join(out,'*.run*.json'))):
    name=os.path.basename(f).rsplit('.run',1)[0]; groups.setdefault(name,[]).append(f)
print(f"{'page':<40}{'perf':>5}{'a11y':>5}{'bp':>5}{'seo':>5}{'LCP':>8}{'TBT':>8}{'CLS':>7}{'JS':>8}{'CSS':>7}{'total':>8}  (passe médiane par score, sur {runs}) | médianes propres TBT, LCP")
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
    mt=statistics.median(r['tbt'] for r in rows); ml=statistics.median(r['lcp'] for r in rows)
    ok=mt<=tbt_max and ml<=lcp_max
    if not ok: bad.append(name)
    print(f"{name:<40}{m['perf']:>5}{m['a11y']:>5}{m['bp']:>5}{m['seo']:>5}{m['lcp']/1000:>7.2f}s{m['tbt']:>6.0f}ms{m['cls']:>7.3f}{m['js']/1024:>6.0f}Ko{m['css']/1024:>5.0f}Ko{m['tot']/1024:>6.0f}Ko | TBT {mt:.0f} ms, LCP {ml/1000:.2f} s ({len(rows)} passes : TBT {', '.join(str(round(r['tbt'])) for r in rows)}) {'ok' if ok else 'ÉCHEC'}")
    json.dump(dict(m,tbt_median=mt,lcp_median=ml),open(os.path.join(out,name+'.median.json'),'w'),indent=1)
print(f"porte TBT ≤ {tbt_max:.0f} ms et LCP ≤ {lcp_max/1000:.2f} s (médianes) : " + ("ok" if not bad else "ÉCHEC " + ", ".join(bad)))
sys.exit(1 if bad else 0)
PY
