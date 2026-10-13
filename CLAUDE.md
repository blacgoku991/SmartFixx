# Reprise SmartFixx — consignes du propriétaire

## Demande

Le propriétaire demande de repartir de cette version complète réalisée avec ChatGPT, de refaire le design, puis de créer une VSL motion design pour promouvoir SmartFixx. ChatGPT accompagne la stratégie SEO et Ads. Le brief concret est dans `docs/BRIEF_DESIGN_VSL.md`, les priorités d'acquisition dans `docs/SEO_ADS.md`.

## Base de travail

- Partir du dernier `main` de `blacgoku991/SmartFixx`, dans une nouvelle branche.
- L'ancienne branche Claude et la branche de sauvegarde représentent une autre application : ne pas les fusionner pour restaurer son architecture.
- La racine est la source Sites/Vinext. Pour le VPS, `vps/prepare.py` génère Next.js + SQLite à partir de cette source et des overlays. Lire le README avant d'exécuter des commandes.
- Préserver l'administration, la connexion propriétaire, les API, la persistance, l'emailing et les désinscriptions pendant la refonte.
- Ne pas remplacer les formulaires fonctionnels par une simulation ou un envoi uniquement côté navigateur.
- Préserver les contrôles d'origine, les validations serveur, les limites de requêtes et les autorisations. Le HTML éditable des emails doit rester nettoyé et prévisualisé dans un iframe isolé.
- Préserver les campagnes déjà lancées, leurs états, les liens signés, les préférences de suivi et le volume de reçus SMTP. Aucun envoi de campagne n'est demandé dans le cadre du design.
- Le domaine de production attendu de la variante VPS est `https://smartfixx.fr`. Ne pas publier les canoniques `chatgpt.site` sur ce domaine.
- Garder les URL publiques utiles et prévoir une redirection ciblée si une URL change. Pas de redirection globale des anciennes pages vers l'accueil.
- N'inventer ni avis, ni références clients, ni volumes de ventes, ni prix validés, ni classement Google garanti.
- Ne pas versionner de données clients, exports CRM, secrets ou configurations SMTP.

## Résultat attendu

Un design complet, lisible et rapide sur mobile, une page orientée création/refonte de site avec un formulaire simple réellement connecté, puis les exports vidéo et leur projet source éditable. Vérifier la navigation, le formulaire, l'administration, les liens des emails et le comportement mobile. Préciser les tests réellement exécutés et les points restant à vérifier sur le VPS.

Le transfert GitHub n'autorise pas implicitement un remplacement immédiat de la production. Préparer la livraison et son retour arrière ; utiliser les consignes de déploiement explicitement données par le propriétaire dans la session active.
