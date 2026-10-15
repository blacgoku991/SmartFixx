/* Téléphone du formulaire court : une seule règle, partagée par le navigateur (aperçu, erreurs) et le serveur
   (validation, clé de limite, anti-doublon). Le résultat normalisé est stocké : deux saisies du même numéro
   (« 06 12 34 56 78 », « +33 6.12.34.56.78 », « 0033612345678 ») donnent la même valeur, donc le même compteur.
   - espaces (y compris insécables), points, tirets et parenthèses retirés ; « 00 » en tête devient « + » ;
   - ^0[1-9]\d{8}$ (numéro français) devient +33 suivi des 9 chiffres ;
   - ^\+33[1-9]\d{8}$ est accepté tel quel ;
   - un numéro international ^\+[1-9]\d{7,14}$ (E.164) est accepté ;
   - tout le reste est invalide (null). */
export function normalizePhone(value: string): string | null {
  let v = value.replace(/[\s  .()\-]/g, "");
  if (v.startsWith("00")) v = "+" + v.slice(2);
  if (/^0[1-9]\d{8}$/.test(v)) return "+33" + v.slice(1);
  if (/^\+33[1-9]\d{8}$/.test(v)) return v;
  if (/^\+33/.test(v)) return null;
  if (/^\+[1-9]\d{7,14}$/.test(v)) return v;
  return null;
}

/* Affichage lisible d'un numéro normalisé (panel) : +33 6 12 34 56 78 → 06 12 34 56 78. */
export function displayPhone(value: string): string {
  const v = value.trim();
  if (/^\+33[1-9]\d{8}$/.test(v)) return ("0" + v.slice(3)).replace(/(\d{2})(?=\d)/g, "$1 ");
  return v;
}
