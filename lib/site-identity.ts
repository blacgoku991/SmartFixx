/* Identité de SmartFixx : une seule source pour le cartouche, le pied de page, les mentions légales et le
   JSON-LD. Identifiants confirmés par le propriétaire (extrait d'immatriculation fourni le 13/10/2026).
   L'adresse du domicile n'est JAMAIS publiée : seul le siège social (domiciliation) apparaît ; le lieu de
   travail est la ville seule. */
export type Area={'@type':'City'|'AdministrativeArea'|'Country';name:string};
/* PHONE_DISPLAY sépare les paires par U+00A0 (espace insécable) : un test doit utiliser
   /06[\s\u00A0]18[\s\u00A0]74[\s\u00A0]51[\s\u00A0]80/, jamais la chaîne à espaces simples. */
const NBSP='\u00A0';
export const SITE_IDENTITY={
  NAME:'Mohamed',
  BRAND:'SmartFixx',
  LEGAL:'SmartFixx SASU',
  LEGAL_NAME:'SMARTFIXX',
  LEGAL_FORM:'SASU',
  CAPITAL:'50 €',
  SIREN:'943 047 290',
  SIREN_DIGITS:'943047290',
  SIRET:'943 047 290 00011',
  RCS:'943 047 290 R.C.S. Paris',
  VAT:'FR15943047290',
  REGISTERED_ON:'2025-04-11',
  SIEGE:{street:'18 avenue Victoria',postalCode:'75001',city:'Paris',country:'FR',label:'18 avenue Victoria, 75001 Paris',short:'Paris 1er'},
  WORK_BASE:'Asnières-sur-Seine (92)',
  WORK_CITY:'Asnières-sur-Seine',
  PUBLICATION_DIRECTOR:'Mohamed Maatoug',
  /* Hébergeur du VPS : non confirmé par le propriétaire. Ne rien inventer (mentions : « Information en
     cours de mise à jour », point bloquant pour la mise en production). */
  HOST:null as null|{name:string;address:string;phone?:string},
  PHONE_DISPLAY:['06','18','74','51','80'].join(NBSP),
  PHONE_E164:'+33618745180',
  PHONE_SCHEMA:'+33 6 18 74 51 80',
  EMAIL:'contact@smartfixx.fr',
  AREAS:[
    {'@type':'City',name:'Asnières-sur-Seine'},
    {'@type':'AdministrativeArea',name:'Hauts-de-Seine'},
    {'@type':'AdministrativeArea',name:'Île-de-France'},
    {'@type':'Country',name:'France'},
  ] as Area[],
  /* La VSL n'existe pas encore : son emplacement n'apparaît que lorsque la vidéo est livrée. */
  VSL_AVAILABLE:false,
  /* Identifiants légaux (TVA, date d'immatriculation, RCS) confirmés : publiables dans les mentions et le JSON-LD. */
  confirmedLegalIds:true,
  /* Auteur des guides : Person « Mohamed » seulement si le propriétaire l'accepte (décision n° 12). */
  personAuthorAccepted:false,
} as const;
/* Noms de lieux insécables : traits d'union U+2011 (présents dans SFX Display) et espaces insécables. Pour un
   titre ou un texte : nb(SITE_IDENTITY.WORK_CITY) ; en JSX, préférer <Place> (components/sx/place.tsx). */
export const nb=(s:string)=>s.replace(/-/g,'\u2011').replace(/ /g,NBSP);
export const telHref=`tel:${SITE_IDENTITY.PHONE_E164}`;
export const mailHref=`mailto:${SITE_IDENTITY.EMAIL}`;
