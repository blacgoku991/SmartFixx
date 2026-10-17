import Link from "@/components/campaign-link";
/* Brand : aussi utilisée par le panel et la page email (classes .brand, .brand-logo, .brand-product du
   contrat legacy). Le nom accessible contient tout le texte visible (label-content-name-mismatch).
   Module sans autre dépendance que CampaignLink : il est importé par l'en-tête public, composant client.
   Logo affiché à 40 px : fichier de 120 px (densité 3), 4,5 Ko au lieu des 14 Ko du logo de 256 px
   (/smartfixx-logo.webp, conservé à son adresse pour le JSON-LD et le panel). React le précharge en tête de
   document : chaque octet de cette requête précède le premier rendu dans la simulation mobile. */
export function Brand() {
  return (
    <Link href="/" className="brand sx-brand" aria-label="SmartFixx par Mohamed, accueil">
      <img className="brand-logo" src="/smartfixx-logo-120.webp" width="40" height="40" alt="" />
      <span className="sx-brand-text"><span className="sx-brand-name">SmartFixx</span><span className="brand-product">par Mohamed</span></span>
    </Link>
  );
}
