# SmartFixx — site, administration et campagnes emailing

Ce dépôt contient la version complète créée avec ChatGPT : site public, demandes de devis, panel propriétaire, statistiques, campagnes emailing, éditeur HTML, suivi et désinscription, relais SMTP et adaptation VPS.

Le contenu de `main` remplace l'ancien site React/Vite travaillé par Claude, à la demande du propriétaire du 13 octobre 2026. La version précédente reste dans l'historique et dans la branche `backup/avant-transfert-chatgpt-20261013`.

## Pour reprendre avec Claude

Lire d'abord [CLAUDE.md](CLAUDE.md), puis :

- [Brief du design et de la VSL](docs/BRIEF_DESIGN_VSL.md)
- [Priorités SEO et acquisition](docs/SEO_ADS.md)
- [État du transfert et de la production](docs/TRANSFERT.md)

Partir de `main`, dans une nouvelle branche. L'ancienne branche `claude/site-ect-repo-setup-2ddopb` appartient à l'ancien site et ne doit pas servir de base.

## Deux environnements, une source applicative

La racine est la source historique Sites : React 19, TypeScript, App Router via Vinext, Cloudflare D1 et authentification propriétaire via Sites. Elle n'est pas une application Vite statique à déployer telle quelle sur Vercel.

`vps/prepare.py` produit la variante Next.js autonome pour le VPS : SQLite persistante, authentification locale, nonce CSP, Docker, Nginx et URL `https://smartfixx.fr`. Les écrans se modifient dans `app/`, `components/` et `lib/` à la racine ; les différences d'hébergement se trouvent dans `vps/overlay/` et `vps/runtime/`.

### Préparer la variante VPS pour travailler localement

Utiliser Node 24 et Python 3. Le dossier de sortie doit être nouveau et extérieur au dépôt :

```bash
python3 vps/prepare.py ../smartfixx-vps-dev
cd ../smartfixx-vps-dev
npm ci
npx next dev --hostname 127.0.0.1
```

Cette copie sert à prévisualiser. Reporter les changements dans les sources racines ou les overlays correspondants, puis régénérer la copie. Elle utilise une base locale vierge ; les identifiants et données du VPS ne sont pas dans GitHub. Ne pas connecter le relais de production à une copie de développement.

La variante VPS impose l'origine `https://smartfixx.fr` aux écritures. Pour les tests des formulaires/authentification, employer les tests HTTP fournis (qui envoient cette origine), ou un environnement de préproduction HTTPS configuré pour ce domaine. Une prévisualisation locale du design n'est pas une validation du formulaire.

### Vérifier la variante VPS

```bash
# Depuis la copie générée
npm run build
# Depuis le dépôt, en adaptant le chemin absolu
SMARTFIXX_TEST_BUILD=/chemin/absolu/smartfixx-vps-dev node --test vps/tests/http.test.mjs
node --test vps/tests/runtime.test.mjs
python3 -m unittest discover -s vps/tests -p '*_test.py'
```

Les tests HTTP emploient une base temporaire et un compte fictif. Ils vérifient les pages, l'accès administrateur, le formulaire et la persistance des campagnes sans envoyer d'emails.

## Repères

| Dossier | Rôle |
| --- | --- |
| `app/`, `components/` | Pages, design, panel, formulaires |
| `lib/` | Services, SEO, sécurité, campagnes, templates |
| `drizzle/` | Migrations de la base |
| `public/` | Logo, illustrations et téléchargements existants |
| `relay/` | Agent SMTP indépendant, reçu d'envoi persistant |
| `vps/` | Adaptation Node/SQLite, Docker, installation et tests |
| `tests/` | Tests de la variante Sites et du contenu emailing |

## Mise en ligne

Ce transfert GitHub ne met pas à jour le VPS. Les déploiements automatiques Vercel sont désactivés par `vercel.json`, car cette source nécessite la bonne adaptation serveur. Les réactiver seulement après avoir choisi et vérifié la cible d'hébergement.

Lire `vps/LISEZ-MOI.md` pour une nouvelle installation. Pour le VPS existant, ne pas relancer l'installation initiale : préserver la base, les secrets, le port réellement utilisé et les reçus du relais. Les archives déjà présentes dans `public/downloads` sont celles de la version de septembre, pas un mécanisme automatique de mise à jour des prochains changements.

Aucun mot de passe, fichier `.env` de production, base clients ou compte SMTP n'est inclus. La validation technique de septembre est documentée dans `docs/TRANSFERT.md` ; elle ne constitue pas un contrôle du serveur actuel.
