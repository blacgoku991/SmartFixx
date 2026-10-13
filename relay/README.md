# SmartFixx — relais SMTP v3

Ce relais permet au panel SmartFixx d’envoyer vos campagnes avec votre compte SMTP, y compris lorsque votre navigateur est fermé. Il utilise Node.js et Nodemailer, TLS obligatoire et la vérification des certificats. Il ne contourne aucun filtre et ne garantit pas la boîte de réception.

## Installation sur un VPS avec Docker

1. Décompressez ce dossier sur votre VPS.
2. Copiez `.env.example` en `.env`.
3. Ouvrez le panel : https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/admin?tab=campaigns
4. Dans « Réglages d’envoi », générez une clé de liaison. Copiez-la dans `SMARTFIXX_RELAY_TOKEN` du `.env`. Gardez l’URL HTTPS du site sans chemin dans `SMARTFIXX_SITE_URL`.
5. Depuis le dossier du relais, lancez :

```bash
chmod 600 .env
docker compose up -d --build
```

L’installation télécharge les dépendances et l’image Node officielles. Aucun port entrant n’est nécessaire. Le VPS doit pouvoir sortir vers le panel en HTTPS et vers le serveur SMTP choisi sur le port 465, 587 ou 2525. Le relais refuse les destinations SMTP privées, locales ou réservées.

Le service redémarre automatiquement. Son volume `smartfixx-receipts` conserve les résultats non synchronisés. Ne supprimez pas ce volume pendant une campagne.

Pour consulter l’état :

```bash
docker compose logs --tail=30
```

Pour arrêter les envois, utilisez « Pause » dans le panel. Pour arrêter également le relais :

```bash
docker compose stop
```

Un message déjà transmis peut se terminer. Les logs ne contiennent ni mot de passe SMTP, ni clé DKIM, ni liste de contacts.

## Alternative sans Docker

Avec Node.js 22 ou ultérieur :

```bash
npm ci --omit=dev
npm start
```

Configurez le même `.env`. Cette commande reste active dans le terminal ; pour un VPS de production, utilisez Docker ou un gestionnaire de services. Le dossier `data` doit être persistant et accessible en écriture seulement à l’utilisateur du relais.

## Configurer et envoyer depuis le panel

1. Saisissez le serveur SMTP, le port, l’identifiant, le mot de passe, l’expéditeur et l’adresse de réponse. Utilisez un compte autorisé à envoyer avec ce domaine. Les secrets sont chiffrés à l’enregistrement dans le panel.
2. Choisissez une cadence et un plafond journalier compatibles avec votre prestataire. Les valeurs initiales sont 30 secondes entre messages et 100 réservations par journée UTC. Les réservations et les tests comptent dans le plafond ; une réservation interrompue peut rester comptée.
3. Demandez « Tester la connexion SMTP ». Le relais vérifie le réseau, TLS et l’authentification sans envoyer de message. Ce test ne prouve pas que l’expéditeur sera accepté.
4. Vérifiez SPF, DKIM et DMARC. La lecture DNS constate la présence d’enregistrements ; elle ne vérifie pas l’authentification effective de vos messages.
5. Créez une campagne. Le template SmartFixx est intégré, avec images PNG, HTML/CSS adapté aux emails et une version texte. Personnalisez l’objet, le titre et la proposition. Choisissez le modèle visuel ou le modèle sobre. Le bouton ouvre les services du site. Les variables `{{prenom}}` et `{{entreprise}}` sont disponibles dans l’objet, le titre et la proposition.
6. Envoyez un test à votre propre adresse puis vérifiez son rendu, l’expéditeur et les en-têtes d’authentification chez le destinataire.
7. Collez vos adresses (une par ligne), chargez un fichier TXT, ou importez votre CSV professionnel (50 000 contacts maximum). Les colonnes reconnues sont `email`, `prenom`, `entreprise`, `source`, `consentement_mesure`, `preuve_consentement`. La source peut être renseignée globalement. Les doublons par campagne et les exclusions sont ignorés. La mesure est désactivée sans accord préalable documenté.
8. Vérifiez le récapitulatif, puis lancez ou programmez la campagne. Gardez le relais actif. Le contenu et les destinataires sont verrouillés au premier lancement.
9. Le journal à droite affiche les 40 derniers états de la campagne, tests compris, actualisés toutes les cinq secondes. Les codes SMTP, le code étendu et l’étape sont affichés si le serveur les fournit. Une explication et une action conseillée accompagnent les refus. Ce journal montre les derniers états conservés, pas une capture exhaustive de chaque échange SMTP. Consultez aussi les acceptations SMTP, ouvertures et clics détectés, demandes réellement envoyées sur le site et STOP. Le rapport CSV inclut le Message-ID pour rechercher un envoi chez votre fournisseur.

## Délivrabilité et désinscriptions

Utilisez votre domaine authentifié et une audience pertinente. N’augmentez pas brutalement le volume. La réputation, les plaintes, la qualité du fichier, le contenu et le fournisseur influencent la réception. Aucun langage ne supprime ces contraintes. Les politiques du fournisseur SMTP doivent permettre votre usage.

Le relais envoie un message par destinataire, sans Cci collective, avec une partie HTML et texte. Il conserve les liens personnels et les en-têtes `List-Unsubscribe` / `List-Unsubscribe-Post`. Il ne rajoute pas de pixel si le consentement n’est pas documenté.

Votre fournisseur doit signer DKIM, y compris les en-têtes de désinscription. Sinon, l’option « Signer avec ma clé DKIM » du panel permet d’utiliser une clé RSA de 2048 bits minimum et son sélecteur. Publiez la clé publique correspondante dans le DNS avant l’envoi. Le relais n’invente ni SPF, ni DNS, ni adresse d’expédition.

Un STOP bloque les prochaines transmissions. Les adresses refusées avec le code de destinataire inexistant `5.1.1` sont exclues. Les autres refus ne prouvent pas que l’adresse est inexistante. Les rebonds différés, plaintes et réponses ne sont pas récupérés par SMTP : surveillez votre messagerie et votre prestataire, puis ajoutez les exclusions dans le panel. Les envois déjà exportés ou programmés dans un autre outil doivent aussi y être exclus.

Une ouverture est un chargement d’image détecté, pas une lecture prouvée. Les protections et robots des messageries peuvent déclencher ou masquer les mesures. Seul un formulaire du site envoyé volontairement avec ses coordonnées crée une demande de contact. Les emails test n’ont pas de pixel et leurs liens ne créent pas d’intérêt pour un prospect.

## Reprise après coupure

Le panel réserve les envois de façon atomique, y compris si plusieurs connexions se présentent. Le relais écrit un journal avant l’envoi, puis y conserve le résultat jusqu’à sa synchronisation. Une réservation non commencée peut être reprise. Une transmission dont le résultat final est inconnu est marquée « à vérifier » et ne sera pas renvoyée automatiquement : SMTP ne permet pas de garantir exactement une livraison après une coupure ambiguë.

Les refus temporaires connus sont réessayés jusqu’à trois tentatives avec attente progressive. Une incertitude ou cinq échecs consécutifs mettent la campagne en pause. Une erreur d’authentification, de TLS ou de DKIM demande de revalider la configuration. Les échecs confirmés peuvent être remis en attente depuis le panel ; les résultats incertains peuvent être clôturés sans renvoi.

Après un changement SMTP ou une nouvelle clé de liaison, les campagnes actives sont mises en pause. Mettez à jour le `.env` du relais si la clé change, puis redémarrez-le avec `docker compose up -d --force-recreate`.

## Conservation et maintenance

Les données de campagne sont consultables douze mois. La mesure des ouvertures/clics est limitée à 90 jours après préparation. Le nettoyage est progressif lors des opérations de création. Les exclusions sont conservées pour éviter de nouvelles sollicitations. Les reçus locaux acquittés sont supprimés.

Le serveur dérive sa clé de chiffrement depuis son secret `RATE_LIMIT_SECRET`. Conservez-le stable et sauvegardé côté hébergement : le remplacer sans migration invaliderait les liens déjà envoyés et empêcherait de lire la configuration chiffrée. Aucun secret n’est inclus dans cette archive.

Le moteur a été validé sur des données isolées et des messages MIME de test. Aucune connexion à votre fournisseur SMTP ni campagne réelle n’a été exécutée pendant sa création : renseignez vos paramètres, connectez votre VPS puis effectuez votre premier test dans le panel.

Sources officielles :
- https://nodemailer.com/smtp
- https://nodemailer.com/dkim
- https://support.google.com/mail/answer/81126?hl=fr
- https://www.cnil.fr/fr/faq-recommandation-pixels-courriers-electroniques

## Mise à jour depuis le premier relais

La version 2 remonte des diagnostics structurés (code SMTP, code étendu, étape et catégorie). Elle ne remonte jamais la réponse SMTP brute, les identifiants, les défis d’authentification ou le contenu des messages. Les refus déjà enregistrés par le premier relais ne peuvent pas être enrichis rétroactivement. Un nouvel essai explicitement demandé permettra d’obtenir les nouveaux détails.

Le panel accepte toujours le premier relais. L’encart de mise à jour disparaît après le premier contact d’un relais version 2.

Pour l’installation utilisée ici :

```bash
cd /opt/smartfixx-relay
curl -fL https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/downloads/SmartFixx-relais-SMTP.zip -o relais.zip
unzip -o relais.zip
cd /opt/smartfixx-relay/SmartFixx-relais-SMTP
sudo docker compose up -d --build
sudo docker compose logs --tail=20
```

L’archive ne contient pas de fichier `.env` réel : votre clé est conservée. Compose garde le volume de reçus et arrête proprement l’ancien relais avant de recréer le conteneur. Ne lancez pas `down -v`. Une campagne précédemment lancée reprend avec le relais ; mettez-la en pause depuis le panel si vous souhaitez seulement diagnostiquer.

## Cadence et connexions de la version 3

Dans Réglages d’envoi, choisissez le débit souhaité en emails par seconde, la limite de votre fournisseur et le nombre de connexions simultanées (1 à 50). Le débit appliqué est le plus petit des deux débits renseignés. Exemple : 14 emails/s souhaités et 14 autorisés. Les plafonds AWS restent applicables et le débit réellement accepté peut être inférieur. Un quota quotidien du panel est compté par journée UTC ; Amazon SES utilise aussi une fenêtre glissante de 24 heures. Les essais et les contrôles consomment ces quotas.

Les connexions SMTP sont conservées et réutilisées. Un cadenceur partagé espace les départs ; une pause ne provoque pas de rafale de rattrapage. Les lots réservés restent petits, leur capacité respecte le quota restant, et une seule session v3 est active par configuration SMTP. Chaque destinataire est revérifié avant de commencer sa transmission (pause, STOP, validité, révision SMTP). Une mise à jour de cadence n’exige pas de refaire l’authentification SMTP. Le taux réellement observé sur dix secondes figure dans Résultats.

Le pool désactive ses réenvois internes automatiques (`maxRequeues: 0`). Seul le panel remet en attente un refus temporaire connu. Les reçus en cours ne sont jamais synchronisés comme des résultats inconnus pendant que leur transmission est encore active. Après redémarrage, les marqueurs sans résultat final deviennent des résultats à vérifier, sans réexpédition automatique.

## Contrôles périodiques

À l’étape Envoyer, activez les contrôles, saisissez votre propre adresse et le nombre d’emails acceptés entre deux copies. Enregistrez avant le premier lancement. Avec 10 000 succès SMTP et un intervalle de 1 000, dix copies sont préparées, dont une à 10 000. Chaque seuil est unique et persistant. Les copies utilisent le même modèle et le même objet, avec des données de contrôle, sans adresse ou lien personnel d’un prospect. Aucun pixel de suivi n’est inséré dans ces contrôles. Ils sont distincts du nombre de contacts et visibles avec le filtre « Emails de contrôle ».

Vérifiez leur arrivée et leur dossier dans votre boîte. Le relais ne lit pas cette boîte et ne peut pas déduire le classement dans les autres boîtes. L’onglet Publicité de Gmail fait partie de la boîte de réception. Le modèle sobre ne garantit ni Principale ni l’absence de spam.

## Pause, reprise et mise à jour

Pause conserve les succès et remet immédiatement les réservations non commencées dans la file. Les transmissions déjà commencées peuvent se terminer. Vous pouvez revenir deux heures après et reprendre. « Préparer la reprise » remet en attente les échecs et les annulations éligibles ; les succès, les exclusions et les transmissions incertaines ne sont pas renvoyés. Les résultats incertains peuvent être clôturés sans nouvel envoi après vérification auprès du fournisseur.

Pour une installation existante dans /opt/smartfixx-relay/SmartFixx-relais-SMTP, utilisez le script SmartFixx-mettre-a-jour-relais.sh fourni par le panel. Il vérifie l’archive, sauvegarde les fichiers, conserve .env et le volume des reçus, puis reconstruit le conteneur. Le relais annonce sa version 3 dans son journal. Aucun lancement de campagne n’est déclenché par cette mise à jour.
