# CLAUDE.md — site web Junior (www.junior.coach)

Site vitrine de **Junior**, un mandat de conseil en stratégie et en commercialisation qui fonctionne dans le Claude ou le ChatGPT du client. Le site a deux rôles : convaincre (pages d'accueil) et faire passer le **diagnostic** (questionnaire → rapport généré par `api.junior.coach`). Le français est la langue de référence; l'anglais en est une traduction fidèle.

## Stack et commandes

- HTML/CSS/JS statique, **aucun build, aucune dépendance npm**. Servi tel quel (GitHub Pages, domaine dans `CNAME`). Ne pas introduire de framework, de bundler ni de `package.json` pour le site.
- Aperçu local : `python3 -m http.server 8000` à la racine, puis `http://localhost:8000/fr/`.
  - Attention : sur `localhost`, `assets/diagnostic.js` appelle l'API sur `http://localhost:8787` (server-remote local). Sans ce serveur, le diagnostic échoue à l'étape du code d'accès — c'est normal.
- Resynchroniser les questions du diagnostic : `python3 scripts/sync-diagnostic-content.py <chemin/vers/le/repo/junior>` (requiert PyYAML). Ce chemin est celui du repo source Junior (qui contient `content/diagnostics/`), **pas** celui du site; chez Luc : `~/projects/junior`. Toujours le passer explicitement : le défaut `../junior` peut tomber sur un autre dossier sur un disque macOS insensible à la casse (le script refuse alors de s'exécuter).
- Vidéo : `cd video/junior-101 && node render.js` (Playwright + ffmpeg), ou `node render.js stills 3,12` pour des images fixes.

## Carte du repo

| Chemin | Rôle |
|---|---|
| `index.html` | Redirection vers `fr/` ou `en/` (localStorage `junior_lang`, sinon langue du navigateur). |
| `diagnostic.html` | Redirection vers `fr/diagnostic.html`. |
| `fr/index.html`, `en/index.html` | Pages d'accueil. CSS et JS **inline**, fichiers autonomes (~1160 lignes). |
| `fr/diagnostic.html`, `en/diagnostic.html` | Gabarit du diagnostic + chaînes d'interface (`window.JUNIOR_DIAGNOSTIC_I18N`). |
| `assets/diagnostic.js`, `assets/diagnostic.css` | Logique et style du diagnostic, **partagés** par les deux langues. |
| `diagnostic-questions/fr.js` | **Généré** depuis le repo Junior. Ne jamais modifier à la main. |
| `diagnostic-questions/en.js` | Traduction anglaise maintenue à la main; même structure exacte que `fr.js`. |
| `scripts/sync-diagnostic-content.py` | Régénère `fr.js` et vérifie que `en.js` a les mêmes dimensions/questions/niveaux. |
| `video/junior-101/` | Vidéo explicative FR 9:16 de 30 s : source HTML, script de rendu, MP4 rendu. |

## Règles non négociables

### 1. Parité FR / EN
- Toute modification de `fr/X.html` se reflète dans `en/X.html` **dans le même commit** (et inversement). Les deux fichiers doivent rester identiques en structure : seuls le texte, les `aria-label`, `lang`, `title`, `meta description` et le lien de langue diffèrent.
- Vérification rapide de la parité structurelle (les seules différences attendues sont des attributs traduits) :
  `diff <(sed 's/>[^<]*</></g' fr/index.html) <(sed 's/>[^<]*</></g' en/index.html)`
- Le français est la source. On écrit d'abord en FR, puis on traduit en EN avec le même sens, le même ton et la même longueur approximative.
- Toute nouvelle chaîne du diagnostic s'ajoute à `JUNIOR_DIAGNOSTIC_I18N` dans **les deux** pages `diagnostic.html`, avec les mêmes clés.

### 2. Les chiffres doivent concorder partout
Ces valeurs apparaissent en dur à plusieurs endroits. Si l'une change, on les met toutes à jour ensemble :
- **32 outils = 21 (fondations stratégiques) + 11 (machine commerciale)** — `fr|en/index.html` (piliers, livrables), maquette de progression (tableaux `W` à 21 entrées et `cm` à 11 entrées), `video/junior-101/junior101.html`.
- **Diagnostic : 25 questions / 5 dimensions (stratégique), 30 / 8 (commercialisation), 55 / 13 (double)**, et « 25 à 55 questions » — cartes et `offerMeta` dans `fr|en/diagnostic.html`, pied de page des accueils, vidéo. Ces chiffres doivent correspondre au contenu de `diagnostic-questions/*.js`.
- Durées affichées (20–30, 25–35, 45–60 min) : identiques en FR et EN.

### 3. Confidentialité de la méthode
Principe de marque : « Les cadres sont publics. Le câblage ne l'est pas. »
- Ne jamais publier sur le site le contenu des cadres, les règles de complétion, le graphe complet ni les noms des canevas qui ne sont pas déjà publics. La maquette de progression ne nomme que les canevas déjà visibles sur la page d'accueil; les autres restent sans nom.
- Le script de synchronisation n'importe jamais `reportInstructions` ni `ctaText` : ils restent côté serveur. Ne pas contourner.
- Le code d'accès testeurs n'est **jamais** écrit dans le code source; il est saisi par l'utilisateur et envoyé en en-tête `x-diagnostic-access-code`.
- Les démos utilisent l'entreprise fictive **Chantio inc.** (logiciel de soumission et de planification de chantier pour entrepreneurs en rénovation résidentielle). Sa fiche complète est dans le repo Junior, `docs/demo/chantio.md` : chiffres, personnes, ton. Elle remplace Cornets Boréal inc. (décision du 2026-10-12, §80 du repo Junior); le guide d'accueil passe aussi à Chantio. Aucune donnée de client réel.

### 4. Positionnement et vocabulaire
Le ton est celui d'un cabinet de conseil sobre, pas d'un SaaS. À respecter dans tout texte :
- Junior est **un mandat, pas un abonnement**. Éviter « plateforme », « app », « abonnement », « essai gratuit », « utilisateurs ».
- Junior fonctionne **dans le Claude ou le ChatGPT que le client utilise déjà**. « Vous travaillez avec Junior. Vous ne travaillez jamais dans Junior. »
- Les données du client restent chez lui; seule la question part, seul le livrable revient. Formulations **neutres sur l'environnement** : pas de « votre machine », « votre disque », « votre ordinateur ».
- Le client possède 100 % des livrables; tout s'ouvre encore s'il arrête. Métaphore de l'architecte et des plans.
- Glossaire FR → EN : mandat → mandate · canevas → *canevas* (conservé tel quel en anglais) · outils → tools · livrable → deliverable · moteur de cohérence → coherence engine · graphe de dépendances → dependency graph · aller-marché → go-to-market · proposition de valeur → value proposition · À revoir → Revisit · Prêt / En cours / À faire / Verrouillé → Ready / In progress / To do / Locked · Planification stratégique / Commercialisation (noms des suites, conservés en français dans la maquette).
- Le site **vouvoie** le visiteur. Dans les maquettes du produit (carte de progression, portail, messages de Junior dans la conversation), Junior **tutoie** — c'est voulu.
- Typographie française (usage québécois) : guillemets « » avec espaces insécables, espace avant le deux-points, **pas** d'espace avant `?`, `!` et `;`, « 23 h 47 », « 60 % », tiret cadratin —.

### 5. Système visuel « blueprint / dessin technique »
- Polices : Archivo (titres), IBM Plex Sans (texte), IBM Plex Mono (étiquettes, sur-titres), via Google Fonts.
- Palette (jetons CSS) : `--paper #E4E8ED`, `--sheet #F2F5F8`, `--ink #141A22`, `--graphite #5C6673`, `--blueprint #0D3557`, `--blueprint-deep #092740`, `--line #B9C2CC`, `--revision #C42B1C` (rouge de révision : accent unique, réservé aux signalements et au focus). Ces jetons sont **dupliqués** dans `fr/index.html`, `en/index.html`, `assets/diagnostic.css` et `video/junior-101/junior101.html` : un changement de jeton s'applique aux quatre. Ne pas ajouter de nouvelle couleur sans raison.
- Vernaculaire du dessin technique : cartouche, cotes, « Fig. 0X — titre » en légende, traits fins, coins droits (pas d'arrondis hors maquettes d'interface).
- Chaque figure SVG a une version large (`only-wide`) et une version téléphone redessinée à ~400 unités (`big only-narrow`) pour rester lisible sur mobile. Modifier l'une implique de modifier l'autre, dans les deux langues. Les `aria-label` décrivent la figure et sont traduits.
- Animations : toujours une solution de repli dans `@media (prefers-reduced-motion: reduce)`. Pas de défilement horizontal sur mobile.

### 6. Diagnostic (`assets/diagnostic.js`)
- Style ES5 volontaire (`var`, `function`, IIFE) pour la compatibilité : le conserver.
- Flux : `access → choose → info → questions (une dimension par page) → review → generating → report`. Brouillon et rapport dans `localStorage` (`junior_diagnostic_draft_v2`, `junior_diagnostic_report_v2`, `junior_diagnostic_access_v1`). Si la forme de ces objets change, incrémenter le suffixe de version et nettoyer l'ancienne clé (voir `LEGACY_KEYS`).
- Contrat API : `POST /diagnostics/report` avec `{ diagnosticKey, participant, answers, notes }`. Les clés de diagnostic (`diagnostic-strategique-v2`, `diagnostic-commercialisation-v3`, `diagnostic-double-v1`) et les préfixes `S-` / `C-` du double doivent correspondre à server-remote. Ne pas les changer sans changement coordonné côté serveur.
- Le rapport (Markdown) passe **toujours** par `DOMPurify.sanitize(marked.parse(...))`. Ne jamais injecter du HTML non assaini; ailleurs, utiliser `textContent`.
- Scripts externes : versions exactes avec `integrity` (SRI). Garder ce standard pour tout nouvel ajout.
- Analytique : Umami (`analytics.junior.coach`), même `data-website-id` sur toutes les pages. Les événements `diagnostic_*` alimentent l'entonnoir : ne pas les renommer sans le signaler.

### 7. Vidéo
- `junior101.html` est la source; le `.mp4` est un rendu. Toute modification de la source (ou d'un chiffre ou d'une formulation qu'elle reprend du site) implique de relancer le rendu et de committer le nouveau MP4.

## Façon de travailler

- Une branche par changement, PR vers `main`; ne pas pousser directement sur `main`.
- Messages de commit **en anglais**, à l'impératif, décrivant le changement visible (ex. : `Rename « Le poids » to « L'estimé de temps » on the French homepage`). Le texte FR cité garde ses guillemets « ».
- Descriptions de PR : lisibles par un humain, résumées de façon concise. Pas de dentelle, juste du concret direct : ce qui change et, au besoin, quand fusionner.
- Code, commentaires et noms de variables en anglais; contenu affiché en FR/EN.
- Ne pas committer de fichiers temporaires (images fixes `still_*.png`, exports, `.DS_Store` supplémentaires).
- Ne pas reformater ni « nettoyer » les grands fichiers HTML hors de la portée demandée : les diffs doivent rester lisibles.

## Liste de vérification avant de terminer

1. La modification est faite en FR **et** en EN, et le `diff` de structure ne montre que des différences de texte attendues.
2. Les chiffres de la section 2 concordent toujours partout (site, diagnostic, vidéo).
3. Le texte respecte le vocabulaire, le vouvoiement/tutoiement et la typographie de la section 4.
4. Les figures modifiées existent en version large et étroite, avec `aria-label` traduits.
5. Vérifié dans un navigateur à ~375 px et sur grand écran, sans défilement horizontal.
6. Si le contenu du diagnostic a changé : script de synchronisation relancé, `en.js` à jour, sortie « en.js matches fr.js structure ».
