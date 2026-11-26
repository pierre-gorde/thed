# 03 — Options techniques compatibles Spotify

> Relevé le 23/11/2026. Seules les options qui gardent le merch sur la fiche Spotify sont listées.
>
> **Mise à jour 26/11/2026** : Shopify headless retenu (option B). Depuis Hydrogen 2026-10 (14/10/2026), Hydrogen marche aussi avec Next.js : B et C ne s'opposent plus. Archi finale et boutique de dev gratuite : voir [08](./08-plan-production.md).

## La règle de base

Spotify n'affiche du merch que via son **canal de vente Shopify** ([Spotify](https://artists.spotify.com/en/merch), [support](https://support.spotify.com/us/artists/article/publishing-merch-from-shopify-to-spotify/)). Donc :

- Produits, stock, commandes et paiement vivent **dans Shopify**, quoi qu'il arrive.
- Le canal Spotify s'installe dans l'admin Shopify et se lie au compte Spotify for Artists (accès admin requis).
- Jusqu'à 250 articles publiés, 2 épinglés en haut de l'onglet Merch, mise en ligne en moins d'1 h.
- **Le front (ce que voit le fan) est libre.** C'est là que les options diffèrent.

## Prix Shopify

Source : [shopify.com/fr/tarifs](https://www.shopify.com/fr/tarifs), relevé le 23/11/2026.

| Plan | Annuel | Mensuel | Frais carte en ligne (Shopify Payments) | Boutique headless |
| --- | --- | --- | --- | --- |
| **Basic** | 27 €/mois | 36 €/mois | 1,5 % + 0,25 € | 1 incluse |
| Grow | 79 €/mois | 105 €/mois | 1,3 % + 0,25 € | 1 incluse |

- Essai : 3 jours gratuits, puis 1 €/mois pendant 3 mois.
- Sans Shopify Payments (ex. PayPal seul) : +2 % de frais de transaction Shopify.
- Exemple : un t-shirt à 30 € payé par carte coûte 0,70 € de frais.
- **Starter (5 $/mois)** : plus ouvert aux nouvelles boutiques et sans boutique en ligne ([help Shopify](https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan?locale=en)). Écarté.
- **Agentic (0 €/mois)** : fait pour vendre sur les IA, sans boutique en ligne ni Oxygen. Compatibilité Spotify non documentée. Écarté sauf preuve du contraire.

**Plancher réaliste : Shopify Basic, 324 €/an** (annuel) ou 432 €/an (mensuel).

## Les 4 options

| | A. Thème Shopify custom | B. Hydrogen sur Oxygen | C. Next.js headless | D. Astro headless |
| --- | --- | --- | --- | --- |
| Front | Liquid + JS (GSAP, Three.js) | React Router (framework officiel Shopify) | Next.js + React Three Fiber | Astro + îlots JS |
| Hébergement | Inclus dans Shopify | Oxygen, gratuit avec un plan payant ([source](https://apps.shopify.com/hydrogen)) | Vercel, Netlify ou Cloudflare | Netlify ou Cloudflare |
| Coût en plus de Shopify | 0 € | 0 € | 0 € à ~20 $/mois (voir plus bas) | 0 € |
| Scène 3D continue entre les pages | Non, la page recharge | Oui | Oui | Difficile |
| Effet waouh possible | Moyen | Fort | Fort | Moyen à fort |
| Effort dev | Faible | Élevé | Élevé | Moyen |
| Confort dev pour Pierre (TS) | Faible (Liquid) | Bon | Très bon | Bon |
| Admin client | Éditeur de thème Shopify | Produits dans Shopify, contenus via metaobjects | Idem | Idem |
| Lien Spotify | Natif | Canal Spotify dans l'admin | Idem | Idem |

### Hébergement de l'option C

- **Vercel Hobby** : gratuit, mais pensé pour l'usage perso. De mémoire, ses CGU excluent l'usage commercial : à vérifier avant de mettre une boutique dessus.
- **Vercel Pro** : 20 $/mois par développeur ([Vercel](https://vercel.com/docs/plans/hobby)).
- **Netlify ou Cloudflare** : offres gratuites qui acceptent un site commercial, à confirmer au moment du choix.

## Point technique à valider avant de choisir B, C ou D

Quand un fan clique sur un produit dans Spotify, il est envoyé vers une page produit Shopify. En headless, on ne sait pas encore si Spotify pointe vers :

- la boutique en ligne Shopify (qu'il faudrait alors garder avec un thème minimal qui redirige vers notre front),
- ou directement vers le checkout.

À tester sur une boutique d'essai (1 € pendant 3 mois) avant de coder quoi que ce soit.

## Ce qui ne bouge pas, quelle que soit l'option

- **Concerts** : Shotgun pousse déjà les dates vers Spotify ([Shotgun](https://support-pro.shotgun.live/hc/en-us/articles/31955056295058-Display-your-event-on-Spotify-Bandsintown-Songkick)). Sur le site, les dates sont saisies dans Shopify (metaobjects) avec un lien vers la billetterie. Pas d'API Shotgun publique trouvée.
- **Navigateurs in-app** (Insta, TikTok) :
  - vidéo en MP4 H.264, `autoplay muted playsinline`, avec une image de secours ;
  - pas d'embed YouTube en arrière-plan ;
  - WebGL avec détection de capacité et version 2D de secours ;
  - pas de dépendance aux cookies ni à Apple Pay ;
  - tests sur de vrais téléphones depuis un lien en bio ([Master.dev](https://blog.master.dev/the-pitfalls-of-in-app-browsers/), [link.boo](https://link.boo/help/video-not-autoplaying-in-tiktok)).
- **Domaine** : environ 10 à 15 €/an pour un .fr ou un .com (ordre de grandeur, prix non relevé).

## Coût annuel estimé

| Option | Shopify Basic (annuel) | Hébergement | Domaine | Total / an |
| --- | --- | --- | --- | --- |
| A. Thème custom | 324 € | 0 € | ~12 € | **~336 €** |
| B. Hydrogen / Oxygen | 324 € | 0 € | ~12 € | **~336 €** |
| C. Next.js (Netlify ou Cloudflare) | 324 € | 0 € | ~12 € | **~336 €** |
| C. Next.js (Vercel Pro) | 324 € | ~220 € | ~12 € | **~556 €** |
| D. Astro | 324 € | 0 € | ~12 € | **~336 €** |

Plus les frais de paiement (1,5 % + 0,25 € par commande) et l'expédition (voir [04](./04-logistique-merch.md)).
