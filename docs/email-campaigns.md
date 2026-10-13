# SmartFixx Reach — préparation et suivi d’emails

L’onglet `/admin?tab=emails` prépare un HTML et un texte par destinataire. Il n’envoie pas d’email : la délivrabilité, les envois effectifs, les rebonds et les réponses relèvent du prestataire de messagerie. « Envoi déclaré » est une déclaration du propriétaire.

## Parcours

1. L’administrateur renseigne l’entreprise, l’adresse professionnelle, l’origine et le code de campagne. Mesure facultative désactivée par défaut ; son activation exige une référence de consentement préalable.
2. L’export contrôle à nouveau la liste d’opposition. Chaque HTML contient des liens uniques au destinataire. Ne pas partager un export personnalisé avec plusieurs destinataires.
3. Le bouton « Découvrir les services » ouvre /services. Le code de campagne accompagne les liens internes jusqu’au formulaire, sans identifiant individuel ni stockage de navigation. Seul un formulaire /api/devis complet et validé crée une demande avec les coordonnées fournies. Les anciens liens /email/interest redirigent aussi vers les services ; l’ancien POST interest renvoie 410 sans créer de demande.
4. Les ouvertures et clics détectés sont facultatifs, ne démarrent qu’après déclaration d’envoi et ne prouvent aucune lecture humaine. Les chargements HEAD sont exclus.
5. STOP ajoute l’adresse normalisée à une exclusion globale, bloque la préparation et l’export, et retire la mesure. Les anciennes mesures sont supprimées. Les réponses STOP doivent être ajoutées manuellement. Exporter le CSV pour les appliquer aussi au prestataire d’envoi, y compris aux messages déjà programmés.

## Protection

- Les API `/api/admin/email-*` utilisent le même contrôle propriétaire que les demandes. Les mutations de navigateur vérifient strictement Origin et les tailles de corps. Requêtes SQL préparées et limites temporaires de cadence.
- Les liens sont des capacités HMAC-SHA256 signées avec `RATE_LIMIT_SECRET`, une portée distincte par action et un UUID aléatoire. Aucune adresse email dans les URL. Garder cette clé stable : la remplacer invalide les liens des emails déjà exportés. Ne pas l’exposer au client.
- Aucun GET ne confirme l’intérêt ni ne désinscrit. Le chargement d’image et la redirection peuvent seulement enregistrer le premier signal autorisé, après déclaration d’envoi.
- Les pages de lien et les API email ont `no-store`, `noindex` et `Referrer-Policy: no-referrer`. Les pages ne révèlent pas les coordonnées du destinataire. L’aperçu admin ne contient aucun lien individuel actif et aucun pixel ; l’iframe est sandboxée.
- Le POST `/api/email/unsubscribe?token=...` suit RFC 8058 : corps `application/x-www-form-urlencoded` avec `List-Unsubscribe=One-Click`, capacité signée dédiée au STOP, sans cookie ni Origin requis. Les en-têtes doivent être configurés et signés avec DKIM chez le prestataire. Un GET ne désinscrit pas.
- Le consentement au suivi retiré pour une adresse ne peut pas être réactivé depuis le formulaire avec une ancienne preuve. Les anciens liens ne recommencent pas à mesurer.

## Conservation et limites

Fiches de campagne consultables 365 jours ; mesures limitées aux 90 jours suivant la préparation et exclues des rapports au-delà. Nettoyage progressif lors des préparations, sans planificateur autonome. Les demandes confirmées ont leur propre expiration de 365 jours. Les exclusions conservent l’email, la date et le motif pour empêcher les sollicitations ultérieures. Le STOP reste utilisable après expiration tant que sa fiche existe ; après nettoyage, la page propose l’email STOP comme solution de repli.

Un lien transféré reste associé au destinataire original. Les caches, préchargements et protections de messagerie rendent ouvertures et clics approximatifs. Les anciens intérêts confirmés restent historiques. Les nouveaux compteurs de demandes correspondent aux formulaires reçus avec le code de campagne, sans prétendre identifier chaque visiteur ni prouver une vente. La liste d’exclusion ne peut pas annuler un fichier déjà téléchargé ou un envoi programmé chez un autre prestataire.

Le dashboard compte les envois par fiche et les signaux/intérêts/oppositions par adresse distincte dans la sélection. Ces compteurs ne forment pas un entonnoir de lecture individuel.

## Validation

`node --test tests/production-security.test.mjs` après la construction de production exécute les parcours contre un Worker Miniflare et une D1 éphémères, en appliquant les migrations du projet. Aucun email n’est envoyé et aucune donnée de test n’est injectée en production.

Références :
- https://www.cnil.fr/fr/faq-recommandation-pixels-courriers-electroniques
- https://support.google.com/mail/answer/81126?hl=fr

## Espace Campagnes simplifié

La liste permet de rechercher une campagne et filtrer son état. La préparation comporte trois étapes : Message (modèle et aperçu), Contacts (coller, TXT ou CSV, choix explicite de la source), Envoyer (test personnel sans import, programmation et confirmation). Les réglages SMTP et le journal réel sont disponibles dans des volets. Résultats présente les acceptations SMTP, clics autorisés et demandes reçues ; ces dernières sont calculées depuis quote_requests par code de campagne et excluent les demandes expirées. Un clic seul ne produit aucune demande. Le formulaire public accepte plusieurs besoins dans un seul projet.

## Envoi v3, contrôles et apparence

Le relais v3 réutilise un pool SMTP, pace les départs et réserve de petits lots dans une session exclusive. Le panel conserve les quotas et revérifie chaque départ. Les contrôles périodiques sont des cibles techniques séparées, créées après les seuils d’acceptation et protégées par un index unique. La pause libère les réservations non commencées ; la reprise exclut les succès et les incertitudes. Les modes visuel et sobre gardent STOP et la destination du site. Le thème clair/sombre est une préférence locale ; les états de campagnes restent en D1.
