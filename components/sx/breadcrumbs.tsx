import CampaignLink from "@/components/campaign-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/seo";
/* Fil d'Ariane visible ET JSON-LD BreadcrumbList identique (serveur uniquement, JsonLd porte le nonce
   sur le VPS). items = la suite du fil SANS l'accueil, qui est ajouté en tête ; le dernier élément est la
   page courante. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Accueil", path: "/" }, ...items];
  return (
    <nav className="sx-breadcrumbs" aria-label="Fil d'Ariane">
      <ol>
        {all.map((item, i) => (
          <li key={item.path + i}>
            {i === all.length - 1 ? <span aria-current="page">{item.name}</span> : <CampaignLink href={item.path}>{item.name}</CampaignLink>}
          </li>
        ))}
      </ol>
      <JsonLd data={breadcrumb(items)} />
    </nav>
  );
}
