# 07 — Base retenue : Thed · Merch

> 26/11/2026. Pierre part sur la version « Merch simple » (`prototypes/04-merch-simple.html`) comme base du site.
> Stack : **Shopify headless** (Shopify Basic + Oxygen, merch relié à la fiche Spotify). Stripe écarté.
> Maquette : https://claude.ai/artifact/AewBbwE5cNTVj18AQMTcAK
> Passage en production : [08](./08-plan-production.md).

## Changements V2 (repris d'Embarquement)

- Bandeau d'annonce + header foncés (nuit `#060a14`), menu en mono, panier en pilule.
- Coins arrondis : cartes 12 px, vidéo 18 px, boutons 12 px, fiche produit et panier 18 px.
- Survol sur ordi (souris uniquement) : la carte passe sur la 2e photo de l'article.
- Live session : extrait muet en lecture auto (photo dessous si le navigateur Insta bloque), « Voir en entier » vers YouTube.
- Ordi : concerts et live session côte à côte. Téléphone : concerts d'abord, puis la live session. Menu : Merch, Concerts, Live.

## Concerts : Bandsintown

- Endpoint : `GET https://rest.bandsintown.com/artists/{nom}/events/?app_id=CLE&date=all` (+ `/artists/{nom}/?app_id=CLE` pour le lien « Suivre »).
- Clé : gratuite, une par artiste. Bandsintown for Artists > Settings > General > Get API Key. Pas de demande à faire. Pas de clé publique fournie pour un artiste tiers.
- **Bloquant** : Thed n'a pas encore de profil Bandsintown → à créer / réclamer (Théo ou Pej).
- Shotgun pousse déjà les events sur Bandsintown (partenaire) : une fois le profil créé, rien à saisir en double.
- Site final : appel côté serveur (loader Hydrogen sur Oxygen, cache 1 h), la clé ne part pas dans le navigateur.
- Affichage : à venir (tri croissant) + 3 derniers passés, bascule auto le lendemain. Boutons : Billets / Complet / Me prévenir (lien Bandsintown `trigger=notify_me`). Liste vide → message + lien Suivre.
- Maquette : pas de clé → données de démo (fallback). Même code avec une clé.

## Dernière sortie dans le bandeau

Faisable, en automatique, gratuit.

| Source | Clé | Lien Spotify | Usage |
| --- | --- | --- | --- |
| **Spotify Web API** `GET /v1/artists/{id}/albums?include_groups=album,single` | Oui (app Spotify, Client Credentials) | Oui, lien direct vers la sortie | Site final, côté serveur, cache 1 h |
| Apple (iTunes lookup `id=1663638634&entity=album&sort=recent`) | Non | Non | Maquette (appelable depuis le navigateur) + secours |
| Deezer `api.deezer.com/artist/198140397/albums` | Non | Non | Secours côté serveur (pas appelable depuis le navigateur) |

- Spotify (changelog fév. 2026) : « Get Artist's Albums » toujours dispo en mode développement. Champs retirés : `album_group`, `label`, `popularity`, `available_markets`. `release_date`, `images`, `external_urls` restent.
- Contrainte Spotify : le propriétaire d'une app en mode dev doit avoir **Spotify Premium** (sinon l'app s'arrête). → créer l'app sur un compte Premium (Pierre ?). Sinon Apple + Deezer suffisent, avec un lien vers la page artiste Spotify.
- Tri par date côté code (on ne se fie pas à l'ordre de l'API). Libellé auto : « Nouvel EP / Nouveau single » (< 90 jours) sinon « Dernier … ».

## À faire côté client (questions simples)

- Créer le profil Thed sur Bandsintown for Artists.
- Plus tard : accès Spotify for Artists pour brancher la boutique Shopify.
