export function ownerMatches(user:{id:string;email:string}|null, ownerEmail:unknown):boolean {
  return !!user?.id && typeof ownerEmail === "string" && ownerEmail.trim().length>0 && user.email.trim().toLowerCase()===ownerEmail.trim().toLowerCase();
}
export const statusLabels={new:"Nouveau",in_progress:"En cours",quoted:"Devis envoyé",won:"Gagné",archived:"Archivé"} as const;
export type RequestStatus=keyof typeof statusLabels;
export const statuses=Object.keys(statusLabels) as RequestStatus[];
