# BrewFlow — Gestion complète de café & restaurant

Application de gestion d'établissement « café & restaurant » : encaissement (POS), stocks, cuisine et menu client par QR code. Interface multilingue (Français / English / العربية, RTL inclus) et paiement par carte via Stripe.

## Fonctionnalités

- **Caisse (POS)** — panier, vente en espèces, monnaie rendue, paiement par carte (Stripe), tickets PDF
- **Commandes client** — menu QR code par table : le client commande, la commande part directement en cuisine
- **Cuisine** — tableau Kanban : à préparer / en préparation / prête, badge « Client » pour les commandes envoyées depuis la table
- **Stocks** — recettes et ingrédients, déductions automatiques à la vente (transaction sérialisable : une seule vente gagne en cas de concurrence), seuils d'alerte, historique des entrées
- **Planning** — planification des plats par semaine, avec vérification du stock disponible
- **Rapports** — ventes, recettes et marges
- **Rôles** — Admin, Serveur, Cuisinier (un serveur peut cumuler les rôles)
- **i18n** — français (défaut), anglais, arabe (RTL)

## Pile technique

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) — `next 16.3.5`, React 19
- [Prisma 7](https://www.prisma.io) + PostgreSQL (driver `@prisma/adapter-pg`)
- [next-intl](https://next-intl.dev) pour l'internationalisation
- shadcn/ui (Radix) + Tailwind CSS 4, icônes lucide-react
- sonner pour les toasts, `@react-pdf/renderer` pour les tickets
- Stripe (paiement par carte)

## Prérequis

- Node.js 20+ et npm
- PostgreSQL 14+ (le projet est conçu pour tourner sur le même serveur, voir `recover-pg.ps1`)

## Installation locale

```bash
npm install
```

Puis configurer les variables d'environnement :

```bash
Copy-Item .env.example .env
# ou : cp .env.example .env
```

Variables requises :

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | oui | URL de connexion PostgreSQL |
| `SESSION_SECRET` | oui | Secret des sessions (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | oui | URL publique de l'application (voir « Déploiement ») |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | non | Clés Stripe (requises seulement pour le paiement par carte) |
| `STRIPE_TND_PER_UNIT` | non | Conversion TND → EUR pour la facturation Stripe (la compta interne reste en TND) |

Créer la base de données puis appliquer le schéma et insérer les données de démonstration :

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Comptes de démonstration (mot de passe `password123`) :
`admin@brewflow.tn`, `serveur@brewflow.tn`, `cuisinier@brewflow.tn`.

## Commandes

```bash
npm run dev     # développement
npm run lint    # ESLint
npm run build   # build de production
npm run start   # lancement du build (après npm run build)
```

## Déploiement en production (Windows)

1. **Build** : `npm run build` (le build compile aussi le client Prisma vers `src/generated`).
2. **Variables** : créer `.env.production` (mêmes variables que `.env`, avec la vraie URL publique et les vraies clés Stripe).
3. **Base de données** : `npx prisma migrate deploy` sur le serveur.
4. **Lancer le serveur** :

```powershell
npm run start   # sur le port 3000 par défaut
```

### Service durable (optionnel mais recommandé)

Installer [NSSM](https://nssm.cc) pour exécuter `next start` comme un service Windows, avec redémarrage automatique :

```powershell
nssm install BrewFlow "C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next" start
nssm set BrewFlow AppDirectory C:\brewflow
nssm set BrewFlow AppEnvironmentExtra DATABASE_URL=... SESSION_SECRET=... NEXT_PUBLIC_APP_URL=...
nssm set BrewFlow AppStdout C:\brewflow\brewflow.log
nssm set BrewFlow AppStderr C:\brewflow\brewflow-error.log
nssm start BrewFlow
```

> PostgreSQL peut être démarré de la même façon (service `postgresql`). Si le mot de passe superutilisateur PostgreSQL est perdu, `recover-pg.ps1` (racine du projet, à lancer en administrateur) réinitialise l'authentification locale et recrée les mot de passe postgres / brewflow.

### HTTPS avec Caddy (recommandé)

Caddy gère automatiquement les certificats TLS. Reverser les requêtes vers l'application : dans `Caddyfile` :

```
mon-domaine.com {
    reverse_proxy localhost:3000
}
```

Puis `caddy run && caddy reload` (service Windows via NSSM également possible).

## Points à connaître

- **QR codes** : les codes QR des tables sont générés avec `window.location.origin`, ils sont donc valides quel que soit le domaine déployé (localhost en dev, le domaine public en production). À (re)imprimer une fois le domaine définitif en place. Le token (`qrCode`) est stable : il n'est attribué qu'à la création de la table et régénéré uniquement par le bouton explicite « Régénérer » — afficher la page Tables ou la fenêtre QR ne change rien.
- **Stripe** : pas de webhook — le retour se fait sur `GET /api/stripe/return` après le checkout. Le bouton « Carte » n'apparaît au POS que si les clés Stripe sont configurées (`STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). En mode test, aucune carte réelle n'est débitée.
- **Stocks** : les quantités sont en `Decimal` ; les seuils (`minThreshold`) déclenchent l'alerte « stock insuffisant » à l'encaissement.
- **i18n** : la langue de l'utilisateur est persistée ; le contenu est traduit dans `src/messages/`.
- **Warning navigateur `THREE.Clock deprecated`** : connu et inoffensif — il vient de `@react-three/fiber` (v9, dernière stable) qui instancie `THREE.Clock` en interne, déprécié depuis three r183. Aucun usage direct de `Clock` dans le code (on lit `state.clock.elapsedTime` exposé par R3F). Disparaîtra au passage à R3F v10.

## Licence

Projet privé — BrewFlow.