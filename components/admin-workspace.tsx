/* Panel (lot 6) : point d'entrée de l'administration, rendu par app/admin/page.tsx et sa copie VPS.
   vps/prepare.py remplace, MOT POUR MOT et seulement dans ce fichier, le lien de déconnexion Sites et la
   phrase d'hébergement ci-dessous : ne pas les reformuler, ne pas les couper, ne pas les déplacer dans un
   autre fichier (check_prepare.py et prepare.py échoueraient). Après remplacement, le lien vaut
   « /admin/logout » : c'est ainsi que le shell sait qu'il tourne sur le VPS (connexion /admin/login). */
import { PanelShell } from "./admin-panel/shell";

const SIGNOUT_HREF: string = "/signout-with-chatgpt?return_to=%2Fadmin";
const HOSTING_NOTE: string = "Cette version est publiée sur son adresse Sites. Le rattachement de Smartfixx.fr et la migration de ses anciennes pages restent à effectuer.";

export function AdminWorkspace({ name, initialTab = "overview" }: { name: string; initialTab?: string }) {
  return <PanelShell name={name} initialTab={initialTab} signoutHref={SIGNOUT_HREF} hostingNote={HOSTING_NOTE} vps={SIGNOUT_HREF.startsWith("/admin/")} />;
}
