/* Réalisations affichées par la primitive <Realisations>. Seules les entrées published:true sont rendues.
   Aucune référence client inventée : Rangvia et Rydar Drive sont des produits du propriétaire, publiés
   seulement avec ses captures et sa validation (décision n° 1). Le libellé de l'entrée smartfixx est à
   valider par le propriétaire (décision n° 2). Plan B du lot 10 : captures du site servi avec des données
   FICTIVES (demandes « Démonstration Dupont », « Démonstration Martin »… créées par l'API sur une base de
   recette), en AVIF et WebP 480/768/1200 dans public/media/realisations/<base>-<largeur>.<ext>. La carte
   affiche la première image dans le cadre étiqueté « badge ». */
export type RealisationImage={src:string;base?:string;alt:string;width:number;height:number};
export type Realisation={
  id:'smartfixx'|'rangvia'|'rydar';
  published:boolean;
  title:string;
  summary:string;
  role:string;
  /* Mention obligatoire sous la carte. */
  note:string;
  tags:string[];
  /* Sans capture, la carte affiche une maquette en DOM étiquetée « Démonstration ». */
  images?:RealisationImage[];
  /* Étiquette du cadre de la capture (« Démonstration » par défaut). */
  badge?:string;
  mockup:'requests-board'|'none';
  url?:string;
};
export const realisations:Realisation[]=[
  {id:'smartfixx',published:true,title:'Ce site et son tableau de suivi des demandes',
   summary:'Le site que vous parcourez : pages lisibles sur mobile, formulaire court relié à une base de données, et un tableau de suivi où chaque demande arrive avec sa référence.',
   role:'Conçu, construit et maintenu par moi.',
   note:'Captures de démonstration, avec des données fictives.',
   tags:['Site vitrine','Formulaire relié','Tableau de suivi'],mockup:'requests-board',badge:'Démonstration',
   images:[
     {src:'/media/realisations/panel-768.webp',base:'panel',width:1440,height:900,
      alt:'Capture de démonstration du tableau de suivi : cinq demandes fictives (Démonstration Dupont, Martin, Leroy, Bernard et Petit), avec leur besoin, leur statut « Nouvelle », leur date et leur référence.'},
     {src:'/media/realisations/accueil-768.webp',base:'accueil',width:1440,height:900,
      alt:'Capture de démonstration de la page d’accueil de SmartFixx en thème sombre : titre « Création et refonte de sites internet », bouton « Parler de mon projet » et numéro de téléphone.'},
     {src:'/media/realisations/creation-768.webp',base:'creation',width:1440,height:900,
      alt:'Capture de démonstration de la page Création de site internet de SmartFixx en thème sombre.'},
   ]},
  {id:'rangvia',published:false,title:'Rangvia',summary:'',role:'Produit conçu et développé par moi — pas une référence client.',note:'En attente des captures et de la validation du propriétaire.',tags:[],mockup:'none'},
  {id:'rydar',published:false,title:'Rydar Drive',summary:'',role:'Produit conçu et développé par moi — pas une référence client.',note:'En attente des captures et de la validation du propriétaire.',tags:[],mockup:'none'},
];
export const publishedRealisations=()=>realisations.filter(r=>r.published);
