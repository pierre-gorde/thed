# 08 — Plan de passage en production

> 26/11/2026. La maquette « Thed · Merch » est validée ([07](./07-base-merch.md)). Ce doc fixe l'archi et l'ordre des étapes.
> **Statut : à valider par Pierre. Le dev ne démarre pas avant.**

## Ce qui est déjà décidé

- Shopify headless : catalogue, stock, panier, checkout et commandes dans Shopify. Merch relié à la fiche Spotify (canal Spotify). Stripe écarté.
- Concerts : API Bandsintown (profil Thed à créer par Théo ou Pej).
- Dernière sortie : API Spotify si un compte Premium porte l'app, sinon Apple (iTunes lookup, sans clé).
- Mobile first, pensé pour les navigateurs intégrés d'Instagram et TikTok.
- Base visuelle : `prototypes/04-merch-simple.html`.

## Nouveauté depuis le cadrage : Hydrogen 2026-10

Le doc de cadrage opposait Next.js et Hydrogen. Ce n'est plus un choix exclusif :

- **Hydrogen 2026-10 est sorti le 14/10/2026** : réécrit avec Vercel, il marche avec n'importe quel framework JS. Starters officiels : **React Router** et **Next.js** ([Shopify](https://hydrogen.shopify.dev/updates)).
- Hébergement libre, « y compris Oxygen, toujours gratuit » (même source).
- Hydrogen 2026-04 et avant = « legacy », Shopify recommande de migrer. → On démarre directement en 2026-10.
- Oxygen marche sur les boutiques de dev depuis le 03/08/2026, mais les URL de preview demandent une connexion à la boutique ([changelog](https://shopify.dev/changelog/oxygen-is-now-available-on-development-stores)).

## Choix d'archi à valider

| # | Sujet | Reco | Alternative | Coût |
| --- | --- | --- | --- | --- |
| 1 | Framework | **Hydrogen 2026-10, starter React Router**, TypeScript | Hydrogen 2026-10, starter Next.js | 0 € dans les deux cas |
| 2 | Hébergement | **Oxygen** (inclus dans Shopify, previews par branche) | Next.js sur Vercel Pro, Netlify ou Cloudflare (Oxygen + Next.js non confirmé) | 0 € / Vercel Pro 20 $/mois |
| 3 | Boutique | **Dev sur une boutique de dev gratuite**, puis **vraie boutique créée au nom de l'asso juste avant le lancement** (offre 1 €/mois pendant 3 mois) | Créer la boutique de l'asso dès maintenant | 0 € pendant le dev, puis 3 × 1 €, puis 27 €/mois |
| 4 | Contenus modifiables (bandeau d'annonce, vidéo d'intro, lien live session) | **Metaobjects Shopify** : tout se modifie dans l'admin Shopify | En dur dans le code | 0 € |
| 5 | Vidéos et photos | **Fichiers Shopify** (CDN inclus, modifiables par eux) | Dans le repo | 0 € |
| 6 | Dernière sortie | **Apple** (sans clé, sans compte) + lien vers la page Spotify. Passage à Spotify plus tard si Théo a Premium | Spotify tout de suite (Théo crée l'app) | 0 € |
| 7 | Animations | CSS + **GSAP** (gratuit, plugins compris). Pas de 3D au départ | — | 0 € |
| 8 | Domaine | **Pas de domaine au départ** : URL Oxygen gratuite rendue publique, lien dans la bio Insta. Pas de travail SEO (sans `noindex`) | Acheter un domaine | 0 € / ~10-15 €/an |

### Pourquoi ces recos

1-2. **React Router sur Oxygen** : la voie native de Shopify, hébergement gratuit déjà payé par le plan Basic, previews par PR, zéro compte en plus à gérer. La maquette n'a pas de 3D, donc l'argument React Three Fiber de Next.js ne pèse plus. Next.js reste possible si Pierre le préfère pour le confort, mais l'hébergement devient une question (Oxygen + Next.js non documenté, Vercel Hobby interdit l'usage commercial).

3. **Boutique de dev, puis boutique de l'asso au lancement** (décision Pierre, 26/11) :
   - Pendant le dev : boutique de dev gratuite (Dev Dashboard de Pierre). Oxygen y marche, previews derrière connexion à la boutique.
   - Juste avant le lancement : Pierre crée la vraie boutique au nom de THED PRODUCTION (documents de l'asso à prévoir). Elle profite de l'offre d'arrivée (3 jours gratuits, puis 1 €/mois pendant 3 mois sur Basic, relevé le 23/11). On y importe le catalogue (CSV produits + metaobjects, ~1-2 h) et on y rebranche le storefront.
   - Pourquoi pas tout de suite : l'offre à 1 € s'écoulerait pendant le dev. Et pendant l'essai gratuit de 3 jours, Oxygen ne permet aucun environnement public ([doc Shopify](https://shopify.dev/docs/storefronts/headless/legacy/hydrogen/fundamentals)) : le site ne peut être public qu'une fois le plan Basic choisi.
   - Écarté : la boutique « client transfer », qui perd l'offre d'arrivée au transfert.

4-5. **Tout dans Shopify** : Théo et Pej n'ont qu'un seul back-office (produits, stock, photos, textes). Les dates viennent de Bandsintown, rien à saisir.

6. **Apple d'abord** : aucune clé, aucune démarche. La clé Spotify exige que l'app soit créée par un compte Spotify **auditeur** Premium (developer.spotify.com), pas par le compte Spotify for Artists. Si Théo a Premium, il crée l'app en 5 min et on bascule.

8. **Sans domaine** : sur Basic, Oxygen autorise 1 environnement public, avec une URL générée automatiquement (longue, format à confirmer). Suffit pour un lien en bio. Le checkout reste sur `{boutique}.myshopify.com`. Un domaine peut s'ajouter plus tard sans rien recoder (il faudra juste changer le lien Insta).

## Archi en une image

```
Fan (Insta / TikTok / Spotify)
  │
  ▼
URL Oxygen (domaine plus tard) ── Hydrogen 2026-10 (React Router) sur Oxygen
  │          ├─ Storefront API : produits, photos, stock, panier, metaobjects
  │          ├─ Bandsintown (serveur, cache 1 h) : concerts
  │          └─ Spotify ou Apple (serveur, cache 1 h) : dernière sortie
  ▼
{boutique}.myshopify.com ── Checkout Shopify (paiement, livraison, e-mails)
                     └─ Commandes → app Shopify sur le téléphone de Théo / Pej
Spotify (onglet Merch) ── canal Spotify dans Shopify → liens vers /products/…
```

- Les pages produit gardent l'URL Shopify standard `/products/{handle}` : un lien venant de Spotify ou d'ailleurs tombe juste.
- L'ancienne boutique `*.myshopify.com` redirige vers le site via le thème de redirection Shopify ([doc](https://shopify.dev/docs/storefronts/headless/hydrogen/migrate/redirect-traffic)).
- Clés d'API (Bandsintown, Spotify) côté serveur uniquement, en variables d'environnement Oxygen.

## Plan d'attaque

| Étape | Contenu | Qui |
| --- | --- | --- |
| 0. Setup | Compte Dev Dashboard, boutique de dev, canal Hydrogen, lien repo ↔ Oxygen, projet Hydrogen 2026-10 dans le repo, CI (lint, types, build) | Pierre (comptes) + Claude (code) |
| 1. Catalogue | T-shirt (S/M/L/XL, 90 pièces), poster A1 (200), photos, prix provisoires, metaobjects « Réglages du site » | Claude, photos de Pej |
| 2. Front | Portage de la maquette : accueil, fiche produit, panier en tiroir, concerts Bandsintown, dernière sortie, live session, pages légales | Claude |
| 3. Checkout | Livraison France (Colissimo / Mondial Relay), retrait en main propre, « expédié sous 7 jours », CGV, mentions légales, « TVA non applicable » à valider | Claude + Pierre |
| 4. Recette | Tests sur vrais téléphones depuis Insta et TikTok, perf, accessibilité, commandes de test de bout en bout | Pierre + Claude |
| 5. Lancement | Boutique de l'asso créée (Basic à 1 €/mois 3 mois), import du catalogue, URL Oxygen publique, Shopify Payments, canal Spotify + Spotify for Artists, clé Bandsintown, thème de redirection, Shopify POS pour le stand | Pierre + Théo/Pej |

Les étapes 0 à 4 se font sans payer Shopify. À l'étape 5 : 1 €/mois pendant 3 mois, puis Basic à 27 €/mois en annuel (36 € en mensuel).

## Ce qu'il faut côté Théo / Pej (sans jargon)

- Créer le profil Thed sur Bandsintown for Artists. Bloquant pour les vraies dates (la maquette tourne sur des dates de démo d'ici là).
- Photos des produits (t-shirt à plat et porté, poster accroché).
- Au lancement : les documents de l'asso (pour la boutique et les paiements), et l'accès Spotify for Artists.
- Optionnel : si Théo a Spotify Premium sur son compte perso, créer une app sur developer.spotify.com.

## Réponses de Pierre (26/11)

- Boutique : créée au nom de l'asso, pour profiter de l'offre à 1 €. → Au lancement, dev sur boutique gratuite d'ici là (choix 3).
- Spotify Premium : Pierre n'en a pas. → Apple (choix 6).
- Domaine : pas de domaine au départ, coût minimum, pas de recherche de référencement, pas de `noindex` (choix 8).

## Reste à valider

- Choix 1, 2, 4, 5, 7.
