# 10 — Gérer le site depuis l'admin Shopify

> 26/11/2026. Tout se modifie dans l'admin Shopify, sans toucher au code. Le site se met à jour tout seul (quelques minutes au plus).
>
> Version simple pour Théo et Pej (non-dev) : [Gérer le site Thed](https://claude.ai/artifact/39EupPSkenTzUrzD1pExEX). Cette page-ci reste la référence technique.
>
> En place dans la boutique : metaobject `reglages_site` / `reglages-du-site` (lien et texte live remplis, médias vides = défauts du site), collection `accueil` (t-shirt, poster, pack), pack 35 € via l'app Shopify Bundles (option « T-shirt … (Size) », affichée « Taille »).

## Produits (Produits)

- **Photos** : 1re photo = celle de la grille, 2e photo = celle qui apparaît au survol (dos du t-shirt, poster accroché…). Format carré conseillé.
- **Badge** sur la carte (« Nouveau », « Tirage limité »…) : ajouter un tag `badge:Nouveau` au produit.
- **Stock** : par taille, dans le tableau des variantes. Un produit à 0 passe en « Épuisé ».
- **Ordre dans la grille** : créer une collection manuelle `accueil` et y ranger les produits dans l'ordre voulu. Sans elle : du plus récent au plus ancien.

## Réglages du site (Contenu > Metaobjects)

Définition à créer une fois : type `reglages_site`, accès Storefront activé, une entrée `reglages-du-site`.

| Champ (clé) | Type | Rôle | Si vide |
| --- | --- | --- | --- |
| `video_intro` | Fichier (vidéo) | Vidéo en haut de page | Vidéo live actuelle |
| `image_intro` | Fichier (image) | Photo affichée si la vidéo ne se lance pas | Aperçu de la vidéo |
| `video_live` | Fichier (vidéo) | Extrait de la live session | Extrait actuel |
| `image_live` | Fichier (image) | Photo sous l'extrait | Aperçu de la vidéo |
| `lien_live` | URL | Bouton « Voir en entier » | Vidéo YouTube actuelle |
| `texte_live` | Texte | Phrase sous la live session | Texte actuel |

## Automatique (rien à faire)

- **Bandeau du haut** : dernière sortie de Thed, lue sur Apple Music toutes les heures.
- **Concerts** : lus sur Bandsintown toutes les heures, une fois la clé ajoutée (variable `BANDSINTOWN_APP_ID` dans Hydrogen > Environnements). Sans clé : dates de démo.

## Pages légales (Paramètres > Politiques)

Livraison, retours, CGV, mentions légales et confidentialité s'affichent sur `/policies/...` (liens du pied de page).
