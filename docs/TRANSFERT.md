# Transfert vers GitHub — 13 octobre 2026

## Provenance

- Source récupérée : projet Sites SmartFixx, version 15, commit `dcc0a184494bddc904194468b282054ab812596e`.
- Cette version contient le travail réalisé dans cette discussion jusqu'au 16 septembre : site multi-services, panel, relais, correctif de statistiques et nouvel email à blocs éditables.
- Ancien GitHub `main` : `d00f2afcf49ba1c9600d841a94c3982a90629f0e` (design « Signal », 6 octobre).
- Branche de sauvegarde prévue : `backup/avant-transfert-chatgpt-20261013`.
- Transfert par remplacement de l'arborescence de `main`, avec un commit descendant de l'ancien `main` : aucun effacement de l'historique.
- Ajouts propres à cette reprise : ce README, CLAUDE.md, les briefs et la désactivation des déploiements Vercel automatiques.

## Ce que GitHub contient

Les 300 fichiers suivis de la version Sites d'origine, à l'exception du README remplacé par la documentation de reprise (son contenu original est conservé dans `docs/README_SITES_ORIGINAL.md`), plus les nouveaux documents. Les assets et les archives d'installation existantes sont inclus.

La copie ne contient pas les données du VPS. Les modifications que le propriétaire aurait effectuées directement sur le serveur après cette version ne sont pas connues et ne sont pas prétendues synchronisées.

## Dernier état connu du VPS, à revérifier avant toute bascule

- Application : `/opt/smartfixx-vps/current`, anciennement liée à `releases/20260915T173128Z`.
- Port public applicatif derrière Nginx : `127.0.0.1:3101` ; le modèle `vps/compose.yaml` utilise initialement 3100. Conserver le port réellement en production lors d'une mise à jour.
- Base : `/opt/smartfixx-vps/data/smartfixx.sqlite`.
- Relais : `/opt/smartfixx-relay/SmartFixx-relais-SMTP`.
- L'ancien site sur le port 3100 et les sous-domaines SaaS étaient conservés.
- Certificat public : `/etc/letsencrypt/live/smartfixx-public/`.
- Le correctif statistiques ajoute `CF-Connecting-IP $remote_addr` au proxy Nginx public. Préserver ce paramètre et le modèle de confiance du proxy.
- Aucun accès SSH à la production n'a été utilisé pour ce transfert. Aucun certificat, DNS, base, compte SMTP ou campagne n'a été modifié.

## Validation

Lors de la livraison du 16 septembre : compilation Sites et Next.js VPS réussie ; tests du HTML, des liens de services, du nettoyage de contenu, de la compatibilité des anciens messages, de l'import de contacts et tests HTTP VPS réussis. Le transfert d'octobre garde le code applicatif identique ; sa vérification porte sur la concordance des fichiers GitHub avec la source récupérée et sur l'absence de fichiers de données ou secrets de production.

Les archives `public/downloads` ne contiennent pas les futurs changements de design. Après modification, préparer et vérifier une nouvelle livraison ; ne pas considérer l'archive historique comme un export automatique du dernier GitHub.
