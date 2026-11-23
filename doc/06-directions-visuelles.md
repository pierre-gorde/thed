# 06 — Directions visuelles

> 23/11/2026. Trois prototypes mobiles animés, testables sur téléphone. Indépendants de la stack : tout est faisable en headless (Shopify + Next.js ou Hydrogen).
> Code : dossier [`prototypes/`](../prototypes/). Prix et dates de concert **fictifs**.
> Liens (privés, à partager depuis le menu Partager) : [Le vol](https://claude.ai/artifact/FZoGmHsaibf1JC4SJEdNY2) · [Carnet de vol](https://claude.ai/artifact/WRueCsEk1F5oYPdKRpKRsV) · [Embarquement](https://claude.ai/artifact/1DvCzyjZyEV8pZm7m1rchF).

## Ce qui est commun aux trois

- Mobile first, pensé pour le navigateur intégré d'Instagram et TikTok.
- Les 3 rubriques : l'EP, le merch (t-shirt PLDV + poster), les dates.
- Assets réels du Drive : cover, photo de nuit, logo, dessins du t-shirt.
- Bouton « Ajouter » factice : en vrai, panier Shopify (et même produits sur Spotify).

## 1. Le vol

- **Idée** : on scrolle et on décolle. Du sol volcanique noir au ciel bleu, puis aux étoiles. Le planeur de la cover vole devant nous.
- **Matière** : photo + 3D légère (Three.js), ciel en dégradé, nuages, étoiles.
- **Rubriques** : la tracklist devient des repères d'altitude, le merch flotte dans le ciel, les dates sont des étoiles.
- **Effet waouh** : fort. **Risque** : le plus lourd des trois (WebGL), il faut une version de secours.

## 2. Carnet de vol

- **Idée** : le cahier d'écolier de la « première leçon ». Feuille à grands carreaux, marge rouge, dessins au marqueur du merch.
- **Matière** : dessin, papier, scotch. Les traits se dessinent au scroll. Un avion en papier suit le doigt.
- **Rubriques** : « Exercice 1 : écoute », « Exercice 2 : habille-toi », « Exercice 3 : viens au concert ».
- **Bonus** : mini-jeu, on lance l'avion en papier, on marque des mètres.
- **Effet waouh** : moyen à fort, très « Thed ». **Risque** : faible, léger et rapide.

## 3. Embarquement

- **Idée** : l'EP est un vol. Carte d'embarquement, tableau des départs à palettes, boutique « duty free ».
- **Matière** : photo de nuit au flash, typo d'aéroport, palettes qui claquent.
- **Rubriques** : la carte d'embarquement = l'EP, le tableau des départs = les dates, le duty free = le merch.
- **Effet waouh** : moyen, très lisible. **Risque** : faible. Se recycle à chaque sortie (nouveau « vol »).

## Retours de Pierre et V2 (23/11, 16h30)

| Proto | Retour | V2 |
| --- | --- | --- |
| Le vol | Pas mal, mais l'avion fait maquette | Planeur 3D refait (vrais profils d'aile, T-tail, reflets du ciel), vu de trois quarts. Intro vidéo live (Thed face à la foule) qui se fond dans le ciel. Extrait de la live session dans l'EP |
| Carnet de vol | Moche, trop école primaire, trop collé à la DA de l'EP | **Abandonné** |
| Embarquement | DA bien, mais métaphore aéroport trop poussée | Métaphore retirée (plus de carte d'embarquement ni de duty free). On garde la nuit, la typo mono et le tableau à palettes pour les dates. Intro vidéo live + live session |

Vidéos : extraits de `bon.mp4` (9 s, live) et `réél_1.mp4` (7 s, live session), coupés et compressés en H.264 sans son (~1 Mo chacun). Sources hors repo (`_videos/`, ignoré par git).

Leçon : ne pas coller littéralement à l'EP. Le site doit tenir aux prochaines sorties.

## Choix : Embarquement (23/11, 16h48)

V3 :
- Avion en papier blanc qui descend avec le scroll, trace en pointillés.
- Lecteur de l'EP lié à « 01 · L'EP » : on touche un titre, ça joue, l'EP tourne en boucle. Mini-lecteur en bas quand on quitte la section. L'avion et la cover bougent avec le son.
- T-shirt : slider d'images (devant / dos), options = tailles seulement.
- Footer : ligne Spotify, Apple Music, Deezer, YouTube.

Son de démo : la live session. En vrai : les 6 MP3 de l'EP (à demander à Théo), hébergés avec le site (~30 Mo, gratuit).

## V4 (23/11, 17h)

- Son auto : démarre au bout de 2 s ou au premier scroll, en crescendo (4 s). Les navigateurs mobiles bloquent le son tant qu'on n'a pas touché l'écran : dans ce cas il démarre au premier toucher. Bouton « Son » dans la barre du haut pour couper.
- Paroles fictives qui défilent mot à mot dans le lecteur (à remplacer par les vraies).
- Ciel : nuit étoilée en haut, aube en bas de page.
- T-shirt en 3D (Three.js chargé seulement près de la boutique), on le tourne au doigt. Sans WebGL : le slider reste.
- Poster : le vrai visuel (A1 paysage).

## Retours de Pej (23/11, 17h18) et deux versions en parallèle

Pej veut plus simple, « vraiment un site de merch » (réf. : boutique Shopify classique, fond blanc, bandeau photo live, grille produits). Ses points :
- merch en premier sous la vidéo ;
- largeur max plus grande sur ordi ;
- live session : lien YouTube intégré dans le site ;
- cards merch : 2 photos (survol), à plat sur fond blanc ; poster : accroché + fond blanc (photos de Pej d'ici mi-semaine) ;
- l'avion en curseur.

Décision de Pierre (23/11, 22h40) : garder les deux pour comparer.
- **Merch simple** (`prototypes/04-merch-simple.html`) : https://claude.ai/artifact/AewBbwE5cNTVj18AQMTcAK, conforme à la demande de Pej.
- **Embarquement V5** : on ne prend que les retours utiles. Shop en premier, vraie mise en page ordi (EP en 2 colonnes avec lecteur collant, live en 2 colonnes, titres plus grands, menu), poster à plat / au mur, l'avion suit la souris sur ordi.

Vidéo d'intro : dans le navigateur Instagram (ou en mode économie d'énergie), la vidéo peut refuser de se lancer. Une photo est maintenant posée dessous, la vidéo n'apparaît qu'une fois lancée, et on retente au premier toucher.

## Dates et Shotgun

- Shotgun n'a pas d'API publique ni de widget (vérifié le 23/11).
- Shotgun pousse déjà les dates sur Spotify, Bandsintown et Songkick.
- Option 1 (zéro saisie) : lire les dates depuis l'API Bandsintown. Gratuit. **Choisie par Pierre (23/11).** Vérif du 23/11 : aucune page Bandsintown trouvée pour Thed → il faut créer / réclamer le profil sur Bandsintown for Artists (gratuit), puis vérifier que Shotgun y pousse les dates. La clé d'API se demande depuis ce compte artiste.
- Option 2 : saisie à la main dans Shopify (1 min par date) avec le lien Shotgun. Les dates passées basculent toutes seules.

## Idées waouh (à trier)

Toutes à 0 € de coût récurrent.

| Idée | Effet | Effort |
| --- | --- | --- |
| Écran « Touchez pour embarquer » : un tap lance la vidéo **et** la musique (le son est bloqué sans geste sur mobile) | Fort | Faible |
| Avion à attraper : on le touche, il fait un looping ; le lancer jusqu'en bas débloque un code merch | Fort | Moyen |
| Paroles synchronisées dans le lecteur, mot à mot | Fort | Moyen (paroles + calage) |
| Carte à partager en story Insta / TikTok (cover + titre écouté + « j'ai embarqué ») | Fort, viral | Moyen |
| Ciel qui passe de la nuit à l'aube au fil du scroll, étoiles en bas de page | Moyen | Faible |
| Tableau des dates : compte à rebours du prochain concert, « COMPLET » qui claque en rouge | Moyen | Faible |
| T-shirt en 3D qu'on tourne au doigt | Moyen | Moyen |
| Vibration légère sur les palettes et « Ajouter » (Android) | Faible | Faible |

## À trancher

- Les idées waouh à garder.
- À montrer à Théo et Pej une fois le choix fait de notre côté.
