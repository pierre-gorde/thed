# Thed — site artiste + merch

Site de Thed (artiste) : vente du merch (t-shirts, posters), concerts à venir, live session, dernière sortie. Pensé pour le mobile, ouvert surtout depuis Instagram et TikTok.

## Où on en est (26/11/2026)

- Maquette validée : « Thed · Merch » → [`prototypes/04-merch-simple.html`](./prototypes/04-merch-simple.html) ([doc/07](./doc/07-base-merch.md)).
- Plan de passage en production à valider : [doc/08](./doc/08-plan-production.md).
- Pas encore de code de production dans ce repo.

## Stack retenue

- **Shopify headless** : produits, stock, panier, checkout, commandes. Merch relié à la fiche Spotify via le canal Spotify de Shopify.
- **Front** : Hydrogen 2026-10 sur Oxygen (hébergement inclus dans Shopify). Framework à confirmer dans [doc/08](./doc/08-plan-production.md).
- **Concerts** : API Bandsintown (alimentée par Shotgun).
- **Dernière sortie** : API Spotify ou Apple, côté serveur.

## Contenu du repo

| Dossier | Contenu |
| --- | --- |
| [`doc/`](./doc/) | Docs projet courtes : ADN, besoin, options techniques, logistique, assets, maquettes, plan de prod |
| [`prototypes/`](./prototypes/) | Maquettes HTML (publiées en Artifacts claude.ai) |

## Coûts récurrents prévus

- Shopify (boutique au nom de l'asso) : 3 jours gratuits, 1 €/mois pendant 3 mois, puis Basic à 27 €/mois en annuel (36 € en mensuel).
- Oxygen, Bandsintown, Spotify / Apple : 0 €.
- Domaine : aucun au départ (URL Oxygen gratuite). ~10-15 €/an si on en prend un plus tard.
