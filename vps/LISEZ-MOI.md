# SmartFixx — installation complète sur le VPS

Le site, les formulaires, le panel, les statistiques et la file de campagnes tournent sur ce VPS. Aucun compte ChatGPT n’est utilisé pour administrer cette version. L’adresse canonique et les nouveaux liens sont `https://smartfixx.fr`.

La section Hébergement des mentions légales décrit le serveur privé administré par SmartFixx. Complétez-la avec le nom et les coordonnées exactes de votre fournisseur VPS : ces informations ne sont pas disponibles dans ce projet.

## Installation

Prérequis : Ubuntu avec Docker Compose, Nginx et un certificat HTTPS valide déjà configuré pour smartfixx.fr. Prévoir environ 2 Go de mémoire et 5 Go de disque libre pour la construction. Les DNS restent inchangés.

Si le certificat existant couvre seulement `*.smartfixx.fr`, il ne couvre pas `smartfixx.fr`. Créez un certificat distinct pour le site public avec Certbot, sans remplacer le certificat des sous-domaines. Les deux noms publics doivent déjà pointer vers ce VPS et le port 80 doit être accessible :

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx --cert-name smartfixx-public \
  -d smartfixx.fr -d www.smartfixx.fr \
  --deploy-hook 'nginx -t && systemctl reload nginx'
```

Certbot demande une adresse email et l’acceptation de ses conditions si nécessaire. Le plugin Nginx ajoute temporairement les réponses de validation puis les retire. Continuez seulement après la réussite de la création du certificat. L’installateur détecte `/etc/letsencrypt/live/smartfixx-public/fullchain.pem` et `privkey.pem`, vérifie la couverture des noms, puis utilise ces chemins uniquement pour les hôtes publics. Le certificat wildcard existant reste affecté aux sous-domaines. Le hook recharge Nginx après les renouvellements réussis ; le renouvellement repose sur la planification Certbot du VPS.

1. Mettez les campagnes du panel actuel en pause. Arrêtez le relais dans `/opt/smartfixx-relay/SmartFixx-relais-SMTP` avec `sudo docker compose stop` et attendez la synchronisation des reçus.
2. Pour conserver les données du panel hébergé, ouvrez `/admin/transfert-vps` sur ce panel. Téléchargez l’export et conservez sa clé séparément. Copiez le fichier sur le VPS avec SFTP/SCP. Ce transfert ne récupère pas les données de l’ancien site présent dans `/opt/smartfixx` : ses fichiers seront sauvegardés, ses éventuelles bases externes nécessitent leur propre sauvegarde.
3. Décompressez le paquet complet puis lancez `sudo bash install.sh`. Entrez le chemin du fichier de données si vous en avez un, sa clé, votre adresse de connexion et un nouveau mot de passe de 16 caractères minimum. N’envoyez ces secrets à personne.
4. Le script sauvegarde les fichiers de l’ancien site et Nginx, construit le nouveau site, vérifie la base et le démarrage, puis bascule les seuls hôtes publics SmartFixx. S’il trouve uniquement `saas.smartfixx.fr *.smartfixx.fr`, il ajoute des blocs explicites pour `smartfixx.fr` et `www.smartfixx.fr` : les blocs SaaS et génériques sont conservés. Le certificat doit couvrir les deux noms publics. Les autres configurations partagées ou sans chemins de certificats explicites restent refusées avant modification. L’ancien processus n’est pas détruit ; il reste disponible pour le retour arrière.
5. Le relais présent dans `/opt/smartfixx-relay/SmartFixx-relais-SMTP` est mis à jour et raccordé automatiquement en conservant sa clé et ses reçus. Connectez-vous à https://smartfixx.fr/admin. Vérifiez un formulaire, le panel, le test SMTP et les désinscriptions avant de reprendre une campagne.

## Relais SMTP

Le relais existant doit rester arrêté pendant le transfert afin de ne pas envoyer depuis deux bases. Les emails déjà acceptés restent marqués comme tels si vous importez l’export.

L’installateur remplace uniquement l’adresse du panel dans `.env`, conserve la clé du relais et l’associe au nouveau panel, même si vous partez sur une base vide. Si le relais est installé ailleurs, cette étape est manuelle : remplacez `SMARTFIXX_SITE_URL` par `https://smartfixx.fr` et associez sa clé dans le nouveau panel. Ne supprimez jamais le volume de reçus.

Le dossier `relay` du paquet contient le relais v3. Vous pouvez l’installer à la place du code de l’ancien relais, en conservant son `.env` et son volume de données, puis exécuter `sudo docker compose up -d --build` depuis le dossier du relais. La connexion SMTP doit être validée à nouveau sur le nouveau panel. Les contrôles et compteurs repris sont conservés ; aucune campagne ne reprend toute seule après un transfert.

Les emails déjà envoyés avec des liens `chatgpt.site` restent liés à l’ancien panel. Gardez ces liens actifs et l’ancien panel en pause. La redirection de ces routes vers le VPS doit être activée après la bascule pour centraliser les nouvelles désinscriptions et mesures ; tant que ce n’est pas fait, réconciliez les nouvelles exclusions avant tout nouvel envoi. Une migration de base est un instantané, pas une synchronisation continue.

## Exploitation

Depuis `/opt/smartfixx-vps/current` :

```bash
sudo docker compose ps
sudo docker compose logs --tail=40
sudo docker compose exec -T web node runtime/cli.mjs backup
```

La base SQLite est conservée dans `/opt/smartfixx-vps/data`, indépendamment des conteneurs. La commande de sauvegarde crée une copie SQLite cohérente dans `data/backups`. Ces sauvegardes contiennent des données personnelles, les secrets de chiffrement et les identifiants hachés : conservez-les avec accès restreint, et copiez-les régulièrement sur un autre support protégé. Les fichiers SQLite ne doivent jamais être servis par Nginx.

Pour changer le mot de passe, envoyez à `node runtime/cli.mjs owner` deux lignes sur l’entrée standard : l’adresse puis le nouveau mot de passe. La réinitialisation invalide toutes les sessions. Aucun écran d’inscription public n’existe.

Pour revenir à l’ancien site : `sudo bash /opt/smartfixx-vps/current/rollback.sh`. Cela restaure uniquement les configurations Nginx sauvegardées ; cela ne fusionne pas les données reçues après la bascule. Mettez d’abord les campagnes en pause et arrêtez le relais. Ne supprimez pas `/opt/smartfixx` avant d’avoir vérifié la nouvelle installation et vos sauvegardes.

## Sécurité et limites

La connexion utilise scrypt (N=131072, r=8, p=1), un cookie Secure/HttpOnly/SameSite Strict, des sessions de 8 heures stockées hachées côté serveur, des limites de tentatives et une vérification d’origine. Les en-têtes d’identité ChatGPT fournis par un visiteur sont ignorés. Le port applicatif est limité à 127.0.0.1, Nginx termine HTTPS, et le conteneur s’exécute sans privilèges root. Gardez Ubuntu, Docker, Nginx et les dépendances à jour. Ces contrôles ne remplacent pas un audit complet.

L’application ne peut pas garantir le classement Gmail, un débit AWS donné ou un rang Google. Les anciennes URL de l’ancien site doivent être inventoriées avant de définir les redirections SEO utiles ; aucune redirection globale des pages inconnues vers l’accueil n’est ajoutée.
