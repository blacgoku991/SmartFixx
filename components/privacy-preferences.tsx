'use client';
/* Bouton « Gérer la mesure d'audience » du pied de page : il rouvre le panneau de consentement par
   l'événement 'smartfixx-privacy' qu'écoute AudienceMeasurement. Module à part : importé depuis
   components/audience-measurement.tsx, il faisait charger par chaque page publique une seconde copie du
   composant de consentement et de ses dépendances (environ 3,5 Ko gzip), déjà présentes dans le morceau du
   layout racine. */
export function PrivacyPreferences(){return <button type="button" className="privacy-settings" onClick={()=>window.dispatchEvent(new Event('smartfixx-privacy'))}>Gérer la mesure d’audience</button>}
