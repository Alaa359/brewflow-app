# BrewFlow — Plan de réalisation

Application de gestion pour café/restaurant : vendre un plat décrémente automatiquement le stock des ingrédients de sa recette.

## Stack technique

| Couche          | Choix                                                               |
| --------------- | ------------------------------------------------------------------- |
| Framework       | Next.js 14+ (App Router) + TypeScript                               |
| Base de données | PostgreSQL 17 (déjà installé : `C:\Program Files\PostgreSQL\17`)    |
| ORM             | Prisma                                                              |
| UI              | shadcn/ui + Tailwind CSS                                            |
| i18n            | next-intl (FR / EN / AR + RTL)                                      |
| 3D              | Three.js + React Three Fiber (backgrounds animés : burger, café...) |
| PDF             | @react-pdf/renderer (tickets + rapports)                            |
| QR Code         | qrcode.react                                                        |
| Auth            | NextAuth.js (login/password, rôles)                                 |
| Paiement        | Stripe (EUR/USD) + Cash + stock logiciel en TND                     |

## Environnement

- Node.js v24.13.1 ✅
- npm 11.8.0 ✅
- PostgreSQL 17.11 — service `postgresql-x64-17` en cours d'exécution ✅
- psql : `C:\Program Files\PostgreSQL\17\bin\psql.exe`
- Docker absent → pas utilisé

---

## Schéma de la base de données

```
User ──▶ Establishment ──▶ Ingredient (stock, seuil, coût) ──▶ RecipeIngredient ──▶ Dish ──▶ Category
              │                                                                       │
              ├──▶ Table (QR code) ──▶ Order ──▶ OrderItem ──▶ Dish
              │                          │
              ├──▶ StockEntry (réapprovisionnement fournisseur) ──▶ Ingredient
              ├──▶ Payment (CASH / STRIPE)
              └──▶ Shift (planning hebdomadaire) ──▶ User
```

| Table            | Champs clés                                                                                 | Relations                                         |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| User             | name, email, passwordHash, role (ADMIN/SERVER/KITCHEN), establishmentId                     | → Establishment                                   |
| Establishment    | name, address, phone, timezone                                                              | ← tout le reste                                   |
| Category         | name, sortOrder, establishmentId                                                            | → Establishment, ← Dish                           |
| Ingredient       | name, unit (KG/L/PIECE), currentStock, minThreshold, costPerUnit, imageUrl, establishmentId | → Establishment, ← RecipeIngredient, ← StockEntry |
| Dish             | name, description, price (TND), categoryId, imageUrl, isActive, establishmentId             | → Category, ← RecipeIngredient, ← OrderItem       |
| RecipeIngredient | quantityNeeded, dishId, ingredientId                                                        | → Dish, → Ingredient                              |
| StockEntry       | quantityAdded, supplierName, date, ingredientId, userId                                     | → Ingredient, → User                              |
| Table            | number, qrCode, establishmentId                                                             | → Establishment, ← Order                          |
| Order            | tableId, status, totalAmount, paymentMethod, userId, createdAt                              | → Table, → User, ← OrderItem, ← Payment           |
| OrderItem        | orderId, dishId, quantity, unitPrice                                                        | → Order, → Dish                                   |
| Payment          | orderId, method, amount, transactionId, status                                              | → Order                                           |
| Shift            | userId, dayOfWeek, startTime, endTime, establishmentId                                      | → User, → Establishment                           |

---

## Règles métier critiques

### Transaction de vente atomique

```
BEGIN (SERIALIZABLE)
  1. Vérifier le stock de tous les ingrédients de la recette du plat vendu
  2. Un stock insuffisant ? → ROLLBACK + message d'erreur précis
  3. Sinon → INSERT order + order_item + UPDATE ingredients (décrément)
COMMIT
```

- Deux ventes simultanées sur un stock limite → PostgreSQL sérialise, la 2e échoue proprement.
- Jamais de vente validée si un ingrédient manque.

### Calcul de marge

```
Coût de revient  = Σ(quantité_ingredient × coût_unitaire)
Marge brute      = prix_vente − coût_revient
Marge %          = (marge_brute / prix_vente) × 100
```

---

## Découpage en étapes

### Étape 1 — Fondation du projet

- Initialiser le projet Next.js 14+ / TypeScript (`create-next-app`)
- Installer et configurer Tailwind CSS + shadcn/ui
- Configurer ESLint, Prettier
- Vérifier le build (`npm run build` OK)

### Étape 2 — Base de données & Prisma

- Créer la base PostgreSQL `brewflow`
- Configurer Prisma avec le schéma complet (toutes les tables)
- Créer la première migration et la pousser
- Fichier `prisma/seed.ts` avec données de démo

### Étape 3 — Authentification & rôles

- Configurer NextAuth (credentials, login / mot de passe)
- 3 rôles : ADMIN, SERVER, KITCHEN, rattachés à un Establishment
- Layouts protégés par rôle (admin → dashboard, serveur → caisse, cuisinier → cuisine)
- Pages login / register

### Étape 4 — Gestion des ingrédients (CRUD)

- Page liste ingrédients : nom, unité (KG/L/PIECE), stock, seuil min, coût, photo
- Formulaire créer / éditer / supprimer
- Alerte visuelle quand `currentStock < minThreshold`
- Upload de photo par ingrédient

### Étape 5 — Entrées de stock (réapprovisionnement)

- Page / modal « ajouter du stock » : quantité, fournisseur, date
- Historique des entrées (StockEntry)
- Le stock augmente, l'historique se garnit

### Étape 6 — Catégories & plats (CRUD)

- CRUD catégories : entrées, plats, desserts, boissons (+ personnalisables)
- CRUD plats : nom, description, prix TND, catégorie, image, actif/inactif

### Étape 7 — Recettes & calcul de marge

- Éditeur de recette : lister les ingrédients + quantités nécessaires par plat
- Calcul automatique du coût de revient et de la marge (TND + %)
- Afficher marge sur la page plat

### Étape 8 — Caisse POS (noyau)

- Liste simple des plats par catégorie + panier
- Ajouter / retirer des articles, quantité, total TND
- Validation de la vente → transaction atomique (règle critique ci-dessus)
- Gestion des erreurs de stock (« Stock insuffisant : Café — reste 0.5kg, besoin 0.6kg »)
- Historique des ventes du jour

### Étape 9 — Paiement

- Paiement cash : encaissement simple, ticket PDF généré
- Paiement Stripe (EUR/USD) : session de paiement Stripe Checkout
- Enregistrement du Payment (méthode, montant, statut)
- Devise logicielle TND pour la comptabilité interne

### Étape 10 — Tickets PDF

- Template de ticket de caisse avec @react-pdf/renderer
- Téléchargeable / affichable après chaque vente
- Réimpression depuis l'historique des ventes

### Étape 11 — Dashboard admin

- Ventes du jour / semaine / mois
- CA total, nombre de commandes, panier moyen
- Top 5 plats vendus
- Liste des ingrédients sous le seuil

### Étape 12 — Multi-établissements

- Un compte propriétaire, plusieurs Establishments
- Création / gestion des magasins dans l'UI
- Sélecteur d'établissement dans le header
- Isolation des données par `establishmentId`

### Étape 13 — Tables & QR codes

- CRUD tables (numéro, zone)
- Génération d'un QR code unique par table
- Page publique : scan → menu du client → ajout au panier → commande envoyée

### Étape 14 — Commandes client (flux complet)

- La commande client arrive dans le POS (liste « En attente »)
- Statuts : EN_ATTENTE → CONFIRMEE → EN_PREPARATION → PRETE → PAYEE
- Vue cuisinier : commandes en cours, notification visuelle
- La client commande ≠ ne décrémente PAS le stock : la décrémentation n'a lieu qu'à la validation/encaissement

### Étape 15 — Planning employés

- Vue hebdomadaire (lundi → dimanche)
- Shifts : matin / après-midi / soir
- Assignation d'un employé à un créneau
- Gestion des employés (CRUD)

### Étape 16 — Rapports PDF

- CA par période, par catégorie, par plat
- Top plats, marge par plat
- Historique des réapprovisionnements
- Export PDF téléchargeable

### Étape 17 — Backgrounds 3D animés

- Intégration Three.js + React Three Fiber
- Objets 3D animés (burger, tasse de café...) faible opacité en arrière-plan
- Sur toutes les pages, optimisé (lazy-load, performances)

### Étape 18 — i18n complet (FR / EN / AR)

- next-intl : fichiers fr.json, en.json, ar.json
- Sélecteur de langue dans le header
- Support RTL pour l'arabe (mirroring du layout)
- Toutes les pages et messages traduits

### Étape 19 — Polish final

- États vides, chargements, toasts d'erreur/succès
- Tests manuels des flux critiques (vente concurrente, stock limite)
- `npm run build` + `npm run lint` OK
- Instructions de déploiement live (serveur local + accès internet)

---

## Ordre d'exécution

L'ordre des étapes sera défini par le propriétaire du projet avant le lancement. Par défaut recommandé :

```
Étapes 1 → 8  : MVP (3 fonctions essentielles + auth)
Étapes 9 → 11 : Paiment + tickets + dashboard
Étapes 12 → 14 : Multi-établissement + QR/commande client
Étapes 15 → 16 : Planning + rapports
Étapes 17 → 19 : 3D + i18n + polish
```

---

## Données de test (seed)

- **Ingrédients (avec photos)** : riz, poulet, tomate, lait, café, thé, menthe, farine, œufs, huile, sucre, sel...
- **Plats avec recettes** : thé à la menthe, café, croissant, couscous, tajine, burger, jus d'orange...
- **Catégories** : entrées, plats, desserts, boissons
- **Établissements** : 2 magasins de démo
- **Comptes** : admin@brewflow.tn / serveur@brewflow.tn / cuisinier@brewflow.tn
