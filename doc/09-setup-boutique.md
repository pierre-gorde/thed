# 09 — Créer la boutique et brancher le site

> 26/11/2026. À faire par Pierre (comptes et paiements). Le code est prêt : il tourne sur des produits de démo (mock.shop) tant que la boutique n'est pas branchée.
> Les intitulés de l'admin Shopify peuvent bouger un peu : se fier au sens de chaque étape.

## 1. Créer la boutique (10 min)

1. Sur [shopify.com/fr](https://www.shopify.com/fr), démarrer l'essai gratuit.
   - E-mail : celui de l'asso si possible (ex. mgmt.thed@gmail.com), sinon le tien. On ajoutera Théo et Pej comme membres du personnel.
   - Nom de boutique : « Thed ». L'adresse technique sera `xxx.myshopify.com` (elle sert au paiement).
2. Paramètres > Détails de la boutique : THED PRODUCTION, adresse du siège (48 rue Jean-Pierre Timbaud, 92400 Courbevoie), devise EUR.
3. Avant la fin des 3 jours : choisir le plan **Basic** (offre 1 €/mois pendant 3 mois). Sans ça, le site ne peut pas être public.

## 2. Installer le canal Hydrogen et relier le repo (10 min)

1. Admin Shopify > Canaux de vente > ajouter **Hydrogen** ([apps.shopify.com/hydrogen](https://apps.shopify.com/hydrogen)).
2. Hydrogen > Créer une vitrine > **relier un repo GitHub existant** > `pierre-gorde/thed`, branche de production `main`.
   - Shopify ajoute un fichier de déploiement dans `.github/workflows/` (par PR ou commit). Me prévenir : je vérifie qu'il appelle bien `npm run deploy` (le build sort dans `dist/client` et `dist/server`).
   - Chaque PR aura sa preview Oxygen (privée, visible une fois connecté à la boutique).
3. Hydrogen > la vitrine > Environnements : laisser la production en **privé** jusqu'au lancement.

## 3. Brancher ton poste (5 min, optionnel)

Dans le dossier du repo :

```bash
npm install
npx shopify hydrogen link      # choisir la vitrine créée à l'étape 2
npx shopify hydrogen env pull  # écrit le .env avec les clés de la boutique
npm run dev                    # http://localhost:3000
```

Sans `.env`, `npm run dev` tourne sur les produits de démo (`cp .env.example .env` puis décommenter `MOCK_SHOP=1`).

## 4. Paiements (au lancement)

- Paramètres > Paiements > **Shopify Payments** : infos de l'asso (SIRET 101 374 411 00011, RNA W922022966), représentant légal (pièce d'identité), IBAN de l'asso.
- Mention « TVA non applicable » : à valider avec leur compta avant d'ouvrir.

## 5. Accès

- Paramètres > Utilisateurs : ajouter Théo et Pej (gestion des produits, commandes, stock).
- Me donner accès en collaborateur ou un token d'API admin seulement si tu veux que je crée le catalogue directement dans la boutique. Sinon je te prépare un CSV à importer.

## Ensuite (côté Claude)

- Catalogue : t-shirt PLDV (S/M/L/XL, 90 pièces), poster A1 (200), photos, prix provisoires.
- Metaobject « Réglages du site » : bandeau d'annonce, vidéo d'intro, lien live session.
- Portage de la maquette `prototypes/04-merch-simple.html` dans `app/`.
