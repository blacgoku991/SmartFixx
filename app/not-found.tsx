import Link from "next/link";
import { LegalLayout } from "@/components/legal-layout";
export default function NotFound(){return <LegalLayout title="Cette page s’est éloignée de la cible." eyebrow="ERREUR 404"><p className="lead">Le lien demandé n’existe pas ou n’est plus disponible.</p><Link className="button button-primary" href="/">Revenir à l’accueil</Link></LegalLayout>}
