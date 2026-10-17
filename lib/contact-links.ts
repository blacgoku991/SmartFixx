/* Téléphone et email publics, sans le reste de l'identité légale : PhoneLink (components/sx/actions.tsx) est
   rendu par l'en-tête et la barre d'appel, composants clients de toutes les pages ; importer
   lib/site-identity y ajoutait SIREN, siège, zones et drapeaux (environ 0,6 Ko gzip). Source unique :
   lib/site-identity.ts reprend ces valeurs. PHONE_DISPLAY sépare les paires par U+00A0. */
export const PHONE_DISPLAY=['06','18','74','51','80'].join(' ');
export const PHONE_E164='+33618745180';
export const EMAIL='contact@smartfixx.fr';
export const telHref=`tel:${PHONE_E164}`;
export const mailHref=`mailto:${EMAIL}`;
