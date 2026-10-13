export const emailServices={emailing:'/prospection-emailing',creation:'/creation-site-internet',refonte:'/refonte-site-internet',automatisation:'/automatisation-informatique',developpement:'/developpement-sur-mesure',securite:'/cybersecurite',seo:'/referencement-seo',services:'/services'} as const;
export type EmailService=keyof typeof emailServices;
