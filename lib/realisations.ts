/* Réalisations affichées par la primitive <Realisations>. Seules les entrées published:true sont rendues.
   Aucune référence client inventée : Rangvia et Rydar Drive sont des produits du propriétaire, publiés
   seulement avec ses captures et sa validation (décision n° 1). Le libellé de l'entrée smartfixx est à
   valider par le propriétaire (décision n° 2). Les images viennent au lot 10 (public/media/realisations). */
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
  mockup:'requests-board'|'none';
  url?:string;
};
export const realisations:Realisation[]=[
  {id:'smartfixx',published:true,title:'Ce site et son tableau de suivi des demandes',
   summary:'Le site que vous parcourez : pages lisibles sur mobile, formulaire court relié à une base de données, et un tableau de suivi où chaque demande arrive avec sa référence.',
   role:'Conçu, construit et maintenu par moi.',
   note:'Captures de démonstration, avec des données fictives.',
   tags:['Site vitrine','Formulaire relié','Tableau de suivi'],mockup:'requests-board'},
  {id:'rangvia',published:false,title:'Rangvia',summary:'',role:'Produit conçu et développé par moi — pas une référence client.',note:'En attente des captures et de la validation du propriétaire.',tags:[],mockup:'none'},
  {id:'rydar',published:false,title:'Rydar Drive',summary:'',role:'Produit conçu et développé par moi — pas une référence client.',note:'En attente des captures et de la validation du propriétaire.',tags:[],mockup:'none'},
];
export const publishedRealisations=()=>realisations.filter(r=>r.published);
