# 02 — Besoin du projet

> Mis à jour le 23/11/2026. Sources : groupe WhatsApp « site thed » (créé le 16/11/2026), échanges avec Pierre.

## L'ambition

Pas un « e-commerce simple ». Un **site d'artiste** qui plonge dans l'univers de Thed, avec un effet waouh que Théo et Pej n'imaginent pas possible. Pas de deadline : la qualité de l'expérience passe avant tout.

On livre 1 à 3 propositions de concept, **dans une étape suivante**. Ce doc ne fixe que le cadre.

## Ce que le site doit faire

1. **Vendre le merch** : posters et t-shirts, stock déjà produit.
2. **Pousser le merch sur la fiche Spotify** de Thed. Obligatoire, donc Shopify obligatoire (voir [03](./03-options-techniques.md)).
3. **Montrer les concerts** à venir, et garder une trace des concerts passés.
4. **Faire entrer dans l'univers** de Thed (voir [01](./01-adn-thed.md)).

## Contraintes

| Contrainte | Conséquence |
| --- | --- |
| Trafic surtout mobile, depuis Instagram et TikTok | Le site est pensé pour le navigateur intégré d'Insta et TikTok d'abord, desktop ensuite |
| Navigateurs in-app : moteur souvent en retard, cookies séparés, pas d'Apple Pay garanti | Budget perf serré, vidéo `muted playsinline`, fallback 2D si WebGL est trop lourd |
| Spotify ↔ merch obligatoire | Catalogue et stock dans Shopify, quel que soit le front |
| Coût récurrent bas, idéalement quasi gratuit | Chaque option est chiffrée. Pierre tranche, le prix ne décide pas seul |
| Le client doit pouvoir mettre à jour dates et produits | Admin simple (Shopify ou CMS léger), pas de code pour ajouter une date |

## Le merch

- **200 posters** (visuel de l'EP, fichier print `poster bon.pdf` de 237 Mo).
- **90 t-shirts** : 20 S, 25 M, 25 L, 20 XL.
  - Devant : avion en papier + « PLDV » au marqueur.
  - Dos : oiseau sur un avion en papier, titre de l'EP, tracklist, « Allez, t'as juste à sauter dans le vide. », signature THED.
- Stock déjà reçu par Théo et Pej. L'expédition n'est pas encore pensée : voir [04](./04-logistique-merch.md).
- Prix de vente : inconnus.

## Les concerts

- Billetterie actuelle : [Shotgun](https://shotgun.live/fr/events/thed).
- Shotgun pousse déjà les dates sur Spotify, Bandsintown et Songkick dès que Thed est dans le line-up. Rien à coder pour ça.
- Le site doit lister les dates avec un lien vers la billetterie, et archiver les dates passées (photos, vidéos).

## Ce qui a été dit, et ce qu'on en garde

| Demande | Qui | On garde ? |
| --- | --- | --- |
| E-commerce simple | Pej | Non, on vise un site d'artiste |
| Shop type [Oxmo Puccino](https://www.oxmo.net/fr-fr/merch-s-1498.htm) | Théo | Non comme direction artistique. Juste un exemple de shop qui fonctionne |
| Vidéo plein écran en arrivant | Pej | Pas comme contrainte. Le concept décidera |
| Espace tournée | Pej | Oui, c'est dans le besoin (concerts) |
| Merch sur Spotify | Pej | Oui, obligatoire |
| Domaine type shop.thed.com | Pierre / Pej | À trancher. Aucun domaine possédé aujourd'hui |

## Questions ouvertes pour Théo et Pej

- Prix des posters et des t-shirts ?
- Qui a l'accès admin à Spotify for Artists ? Quel distributeur ?
- Entité vendeuse : THED PRODUCTION ? SIRET, TVA, adresse pour les mentions légales.
- Qui expédie, depuis où, en combien de jours ? France seule ou Europe ?
- Vente aussi au stand merch des concerts ?
- Qui met à jour les dates et les produits après la mise en ligne ?
- Liste des concerts passés, avec photos et vidéos.
- Droits d'utilisation des photos et vidéos (photographes, réalisateurs à créditer).
- Budget et prise en charge des coûts récurrents (Shopify, domaine, hébergement).
