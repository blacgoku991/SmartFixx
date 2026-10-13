import { CtaBand } from "@/components/sx/cta-band";
/* Alias transitoire : NextStep devient le CtaBand du lot 0, pour les pages pas encore migrées.
   Supprimé au lot 10 s'il n'est plus importé. */
export function NextStep(){return <CtaBand title="Parlons de votre projet" text="Décrivez votre besoin en quelques lignes : je vous recontacte par téléphone ou par email." primaryHref="/contact" primaryLabel="Parler de mon projet" id="next-step-titre"/>}
