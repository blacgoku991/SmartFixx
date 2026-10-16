import { Layer, PlateFrame, T } from "./plate";
/* Planche « formulaire → tableur → contrôle humain → notification » (automatisation), cas fictif.
   Récit (6,4 s, une fois) : les quatre étapes se posent ; une demande (point ambre) part du formulaire,
   entre dans le tableur, descend jusqu'au contrôle humain qui s'allume, puis rejoint la notification.
   Chaque flèche se trace juste avant le passage (calque qui grandit depuis son origine). La branche
   « erreur » reste visible : une étape qui échoue déclenche une alerte et une reprise à la main.
   Le point est un calque plein cadre déplacé en pourcentage (translate) : composité. État final : point
   masqué, notification allumée. */
function Arrow({ d, head }: { d: string; head: string }) {
  return <><path className="sv-p-flow" d={d} /><path className="sv-p-head" d={head} /></>;
}
export function AutoPlate() {
  return (
    <PlateFrame kind="auto" heading="Flux automatisé">
      <Layer className="sv-au-n sv-au-n1" svg={<>
        <rect className="sv-p-card" x="16" y="50" width="136" height="76" rx="12" />
        <rect className="sv-p-field" x="30" y="84" width="108" height="12" rx="4" />
        <rect className="sv-p-field" x="30" y="102" width="72" height="12" rx="4" />
        <rect className="sv-p-btn" x="108" y="102" width="30" height="12" rx="4" />
      </>}>
        <T x={30} y={73} c="sv-tx--b">Formulaire</T>
      </Layer>
      <Layer className="sv-au-n sv-au-n2" svg={<>
        <rect className="sv-p-card" x="208" y="50" width="136" height="76" rx="12" />
        <rect className="sv-p-sheet" x="222" y="82" width="108" height="34" rx="3" />
        <path className="sv-p-cells" d="M222 93.3H330M222 104.6H330M249 82V116M276 82V116M303 82V116" />
        <rect className="sv-p-newcell" x="222" y="104.6" width="108" height="11.4" />
      </>}>
        <T x={222} y={73} c="sv-tx--b">Tableur</T>
      </Layer>
      <Layer className="sv-au-n sv-au-n3" svg={<>
        <rect className="sv-p-card sv-p-card--signal" x="208" y="200" width="136" height="76" rx="12" />
        <rect className="sv-p-yes" x="292" y="238" width="40" height="24" rx="7" />
      </>}>
        <T x={222} y={226} c="sv-tx--b">Contrôle</T>
        <T x={222} y={246} c="sv-tx--b">humain</T>
        <T x={222} y={266} c="sv-tx--muted">{"Valider ?"}</T>
        <T x={312} y={255} a="m" c="sv-tx--on">Oui</T>
      </Layer>
      <Layer className="sv-au-n sv-au-n4" svg={<>
        <rect className="sv-p-card" x="16" y="200" width="136" height="76" rx="12" />
        <path className="sv-p-bell" d="M38 238A6 6 0 0 1 44 244V249L47 253H29L32 249V244A6 6 0 0 1 38 238ZM35.5 255A2.5 2.5 0 0 0 40.5 255" />
      </>}>
        <T x={30} y={226} c="sv-tx--b">Notification</T>
        <T x={54} y={254} c="sv-tx--muted">À traiter</T>
      </Layer>
      <Layer className="sv-au-a sv-au-a1" svg={<Arrow d="M152 88H202" head="M196 82L203 88L196 94" />} />
      <Layer className="sv-au-a sv-au-a2" svg={<Arrow d="M276 126V194" head="M270 188L276 195L282 188" />} />
      <Layer className="sv-au-a sv-au-a3" svg={<Arrow d="M208 238H158" head="M164 232L157 238L164 244" />} />
      <Layer className="sv-au-err" svg={<>
        <path className="sv-p-errlink" d="M276 163H260" />
        <rect className="sv-p-err" x="22" y="140" width="238" height="46" rx="10" />
      </>}>
        <T x={34} y={159} c="sv-tx--b sv-tx--danger">{"Une étape échoue ?"}</T>
        <T x={34} y={177} c="sv-tx--muted">Alerte, reprise à la main</T>
      </Layer>
      <Layer className="sv-au-lit sv-au-lit2" svg={<rect className="sv-p-halo sv-p-halo--accent" x="206" y="48" width="140" height="80" rx="13" />} />
      <Layer className="sv-au-lit sv-au-lit3" svg={<rect className="sv-p-halo" x="206" y="198" width="140" height="80" rx="13" />} />
      <Layer className="sv-au-lit sv-au-lit4" svg={<rect className="sv-p-halo" x="14" y="198" width="140" height="80" rx="13" />} />
      <Layer className="sv-au-dot" svg={<>
        <circle className="sv-p-dot-glow" cx="152" cy="88" r="14" />
        <circle className="sv-p-dot" cx="152" cy="88" r="7" />
      </>} />
    </PlateFrame>
  );
}
