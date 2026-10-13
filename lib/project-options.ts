export const budgets={a_definir:"À définir ensemble",moins_1000:"Moins de 1 000 €",de_1000_3000:"1 000 à 3 000 €",de_3000_10000:"3 000 à 10 000 €",plus_10000:"Plus de 10 000 €"};
export const timelines={flexible:"Pas de date imposée",un_mois:"Dans le mois",trois_mois:"Dans les 3 mois",plus_tard:"Plus tard"};
export function cleanCampaign(value:unknown){return typeof value==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(value)?value:"site";}
