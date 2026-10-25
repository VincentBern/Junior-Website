# CLAUDE.md : site web Junior (www.junior.coach)

Site vitrine de **Junior**, un aviseur en stratégie et en commercialisation qui fonctionne dans le Claude ou le ChatGPT du client, payé au mois. Le site a deux rôles : convaincre (pages d'accueil) et faire passer le **diagnostic** (questionnaire → rapport généré par `api.junior.coach`). Le français est la langue de référence; l'anglais en est une traduction fidèle.

## Stack et commandes

- HTML/CSS/JS statique, **aucun build, aucune dépendance npm**. Servi tel quel (GitHub Pages, domaine dans `CNAME`). Ne pas introduire de framework, de bundler ni de `package.json` pour le site.
- Aperçu local : `python3 -m http.server 8000` à la racine, puis `http://localhost:8000/fr/`.
  - Attention : sur `localhost`, `assets/diagnostic.js` appelle l'API sur `http://localhost:8787` (server-remote local). Sans ce serveur, le diagnostic échoue à l'étape du code d'accès. C'est normal.
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
| `fr/confidentialite.html`, `en/privacy.html` | Politique de confidentialité. Le nom de fichier diffère par langue; le contenu reste en parité. |
| `fr/conditions.html`, `en/terms.html` | Conditions d'utilisation. Même règle de parité. |
| `assets/legal.css` | Style des quatre pages légales et des deux pages de liste d'attente, **partagé** par les deux langues. |
| `assets/experiments.js` | Test H1 (repo Junior, §95) : tire une fois par navigateur la variante d'entrée (`diagnostic` ou `attente`), gardée dans `junior_exp_h1_v1`, l'applique aux boutons `data-h1-cta` de l'accueil et l'ajoute aux événements Umami. Interrupteur `H1_ACTIVE`, à `false` tant que le diagnostic n'est pas public. |
| `fr/waitlist.html`, `en/waitlist.html` | « Être avisé de l'ouverture », l'autre bras du test H1 : formulaire avec consentement obligatoire, envoyé à `POST /diagnostics/waitlist`. Même nom de fichier dans les deux langues. |
| `diagnostic-questions/fr.js` | **Généré** depuis le repo Junior. Ne jamais modifier à la main. |
| `diagnostic-questions/en.js` | Traduction anglaise maintenue à la main; même structure exacte que `fr.js`. |
| `scripts/sync-diagnostic-content.py` | Régénère `fr.js` et vérifie que `en.js` a les mêmes dimensions/questions/niveaux. |
| `video/junior-101/` | Vidéo explicative FR 9:16 de 30 s : source HTML, script de rendu, MP4 rendu. |

## Règles non négociables

### 1. Parité FR / EN
- Toute modification de `fr/X.html` se reflète dans `en/X.html` **dans le même commit** (et inversement). Les pages légales sont la seule paire dont les noms de fichier diffèrent (`confidentialite.html` ↔ `privacy.html`, `conditions.html` ↔ `terms.html`) : la règle de parité s'y applique pareillement. Les deux fichiers doivent rester identiques en structure : seuls le texte, les `aria-label`, `lang`, `title`, `meta description` et le lien de langue diffèrent. Seule exception : la note sur le masculin en pied de page de `fr/index.html` (« L'emploi du masculin pour désigner des personnes n'a d'autres fins que celle d'alléger le texte. »), sans équivalent en anglais.
- Vérification rapide de la parité structurelle (les seules différences attendues sont des attributs traduits) :
  `diff <(sed 's/>[^<]*</></g' fr/index.html) <(sed 's/>[^<]*</></g' en/index.html)`
- Le français est la source. On écrit d'abord en FR, puis on traduit en EN avec le même sens, le même ton et la même longueur approximative.
- Toute nouvelle chaîne du diagnostic s'ajoute à `JUNIOR_DIAGNOSTIC_I18N` dans **les deux** pages `diagnostic.html`, avec les mêmes clés.

### 2. Les chiffres doivent concorder partout
Ces valeurs apparaissent en dur à plusieurs endroits. Si l'une change, on les met toutes à jour ensemble :
- **32 outils = 21 (fondations stratégiques) + 11 (machine commerciale)** : `fr|en/index.html` (piliers, livrables), maquette de progression (tableaux `W` à 21 entrées et `cm` à 11 entrées), `video/junior-101/junior101.html`.
- **Diagnostic : 25 questions / 5 dimensions (stratégique), 30 / 8 (commercialisation), 55 / 13 (double)**, et « 25 à 55 questions » : cartes et `offerMeta` dans `fr|en/diagnostic.html`, pied de page des accueils, vidéo. Ces chiffres doivent correspondre au contenu de `diagnostic-questions/*.js`.
- Durées affichées (20–30, 25–35, 45–60 min) : identiques en FR et EN.

### 3. Confidentialité de la méthode
Principe de marque : « Les canevas sont publics. Leurs liens et leur boucle d'apprentissage, non. » (remplace « Les cadres sont publics. Le câblage ne l'est pas. » le 2026-10-12)
- Ne jamais publier sur le site le contenu des cadres, les règles de complétion, le graphe complet ni les noms des canevas qui ne sont pas déjà publics. La maquette de progression ne nomme que les canevas déjà visibles sur la page d'accueil; les autres restent sans nom.
- Le script de synchronisation n'importe jamais `reportInstructions` ni `ctaText` : ils restent côté serveur. Ne pas contourner.
- Le code d'accès testeurs n'est **jamais** écrit dans le code source; il est saisi par l'utilisateur et envoyé en en-tête `x-diagnostic-access-code`.
- Les démos utilisent l'entreprise fictive **Chantio inc.** (logiciel de soumission et de planification de chantier pour entrepreneurs en rénovation résidentielle). Sa fiche complète est dans le repo Junior, `docs/demo/chantio.md` : chiffres, personnes, ton. Elle remplace Cornets Boréal inc. (décision du 2026-10-12, §81 du repo Junior); le guide d'accueil passe aussi à Chantio. Aucune donnée de client réel.

### 4. Positionnement et vocabulaire
Le ton est celui d'un cabinet de conseil sobre, pas d'un SaaS. À respecter dans tout texte :
- Junior, c'est **un mois d'aviseur, pour le prix d'une heure de consultation**. Il se paie au mois, sans engagement : ne jamais laisser croire le contraire (l'ancienne formule « un mandat, pas un abonnement » a été retirée le 2026-10-12 pour cette raison). Éviter « plateforme », « app », « essai gratuit », « utilisateurs ». Dire **aviseur**, jamais « conseiller ». Junior est au masculin.
- Dire **stratégie go-to-market**, jamais « aller-marché » (décision de Luc, 2026-10-13). Le terme anglais reste tel quel dans le texte français, comme ICP.
- Junior fonctionne **dans le Claude ou le ChatGPT que le client utilise déjà**. « Vous travaillez avec Junior. Vous ne travaillez jamais dans Junior. »
- Les données du client restent chez lui; seule la question part, seul le livrable revient. Formulations **neutres sur l'environnement** : pas de « votre machine », « votre disque », « votre ordinateur ».
- Le client possède 100 % des livrables; tout s'ouvre encore s'il arrête. Métaphore de l'architecte et des plans.
- Glossaire FR → EN : aviseur → advisor · mandat → mandate · canevas → *canevas* (conservé tel quel en anglais) · outils → tools · livrable → deliverable · moteur de cohérence → coherence engine · graphe de dépendances → dependency graph · stratégie go-to-market → go-to-market · proposition de valeur → value proposition · À revoir → Revisit · Prêt / En cours / À faire / Verrouillé → Ready / In progress / To do / Locked · Planification stratégique / Commercialisation → Strategic planning / Commercialization (noms des suites) · noms d'outils de la maquette : ICP + Proposition de valeur → ICP + Value proposition · Audit concurrentiel → Competitive audit · Parcours client → Customer journey · Prix → Pricing · Cycle de vente → Sales cycle · Suivi → Tracking · Indicateurs → KPIs. Dans la page anglaise, la maquette nomme les suites et les outils en anglais (décision de Luc, 2026-10-25), comme les publications anglaises.
- Le site **vouvoie** le visiteur. Dans les maquettes du produit (carte de progression, portail, messages de Junior dans la conversation), Junior **tutoie**. C'est voulu.
- Typographie française (usage québécois) : guillemets « » avec espaces insécables, espace avant le deux-points, **pas** d'espace avant `?`, `!` et `;`, « 23 h 47 », « 60 % ».
- **Jamais de tiret cadratin**, nulle part (texte, `aria-label`, chaînes JS, commentaires), en FR comme en EN. On reformule avec un point, une virgule, un deux-points ou des parenthèses. Dans les légendes et les intitulés, le séparateur est le point médian « · ».

### 5. Système visuel « blueprint / dessin technique »
- Polices : Archivo (titres), IBM Plex Sans (texte), IBM Plex Mono (étiquettes, sur-titres), via Google Fonts.
- Palette (jetons CSS) : `--paper #E4E8ED`, `--sheet #F2F5F8`, `--ink #141A22`, `--graphite #5C6673`, `--blueprint #0D3557`, `--blueprint-deep #092740`, `--line #B9C2CC`, `--revision #C42B1C` (rouge de révision : accent unique, réservé aux signalements et au focus). Ces jetons sont **dupliqués** dans `fr/index.html`, `en/index.html`, `assets/diagnostic.css`, `assets/legal.css` et `video/junior-101/junior101.html` : un changement de jeton s'applique aux cinq. Ne pas ajouter de nouvelle couleur sans raison.
- Vernaculaire du dessin technique : cartouche, cotes, « Fig. 0X · titre » en légende, traits fins, coins droits (pas d'arrondis hors maquettes d'interface).
- Chaque figure SVG a une version large (`only-wide`) et une version téléphone redessinée à ~400 unités (`big only-narrow`) pour rester lisible sur mobile. Modifier l'une implique de modifier l'autre, dans les deux langues. Les `aria-label` décrivent la figure et sont traduits.
- Animations : toujours une solution de repli dans `@media (prefers-reduced-motion: reduce)`. Pas de défilement horizontal sur mobile.

### 6. Diagnostic (`assets/diagnostic.js`)
- Style ES5 volontaire (`var`, `function`, IIFE) pour la compatibilité : le conserver.
- Flux : `access → choose → info → questions (une dimension par page) → review → generating → report`. Brouillon et rapport dans `localStorage` (`junior_diagnostic_draft_v2`, `junior_diagnostic_report_v2`, `junior_diagnostic_access_v1`). Si la forme de ces objets change, incrémenter le suffixe de version et nettoyer l'ancienne clé (voir `LEGACY_KEYS`).
- Mode public (§95) : au démarrage, `GET /diagnostics/access` dit si le diagnostic est ouvert; si oui, aucun code n'est demandé. `participant.followUpConsent` (case facultative) part avec le rapport. `participant.companySize` et `participant.companyStage` (deux listes facultatives, ajoutées le 2026-10-16) partent seulement s'ils sont choisis; leurs valeurs doivent correspondre aux énumérations du contrat partagé côté serveur. Un 429 `daily_cap` affiche `T.errors.daily_cap`.
- Contrat API : `POST /diagnostics/report` avec `{ diagnosticKey, participant, answers, notes }`. Les clés de diagnostic (`diagnostic-strategique-v2`, `diagnostic-commercialisation-v3`, `diagnostic-double-v1`) et les préfixes `S-` / `C-` du double doivent correspondre à server-remote. Ne pas les changer sans changement coordonné côté serveur.
- Le rapport (Markdown) passe **toujours** par `DOMPurify.sanitize(marked.parse(...))`. Ne jamais injecter du HTML non assaini; ailleurs, utiliser `textContent`.
- Scripts externes : versions exactes avec `integrity` (SRI). Garder ce standard pour tout nouvel ajout.
- Analytique : Umami (`analytics.junior.coach`), même `data-website-id` sur toutes les pages. Les événements `diagnostic_*` alimentent l'entonnoir : ne pas les renommer sans le signaler.

### 7. Vidéo
- `junior101.html` est la source; le `.mp4` est un rendu. Toute modification de la source (ou d'un chiffre ou d'une formulation qu'elle reprend du site) implique de relancer le rendu et de committer le nouveau MP4.

## Façon de travailler

- Une branche par changement, PR vers `main`; ne pas pousser directement sur `main`.
- Chaque PR demande la relecture de Vince (`VincentBern`) dès son ouverture (reviewer). Règle de Luc du 2026-10-13, aussi valable dans le repo `junior`.
- Messages de commit **en anglais**, à l'impératif, décrivant le changement visible (ex. : `Rename « Le poids » to « L'estimé de temps » on the French homepage`). Le texte FR cité garde ses guillemets « ».
- Descriptions de PR : lisibles par un humain, résumées de façon concise. Pas de dentelle, juste du concret direct : ce qui change et, au besoin, quand fusionner.
- Code, commentaires et noms de variables en anglais; contenu affiché en FR/EN.
- Ne pas committer de fichiers temporaires (images fixes `still_*.png`, exports, `.DS_Store` supplémentaires).
- Ne pas reformater ni « nettoyer » les grands fichiers HTML hors de la portée demandée : les diffs doivent rester lisibles.

### Branches et PR sans collision

Ajouté le 2026-10-13 après le ménage des branches (§84 du repo `junior`), d'après le texte de Vince « Ouvrir une PR sans collision ». Chaque règle corrige un dérapage réel de la semaine. Les appliquer d'office, sans attendre qu'on les demande.

GraphQL de GitHub n'est pas joignable depuis les sessions infonuagiques de Claude Code, donc `gh pr list`, `gh pr view` et `gh pr diff` y échouent. Les commandes ci-dessous passent par l'API REST (`gh api`), qui fonctionne partout.

- **Chaque nouveau sujet repart de `main` à jour**, même si on vient de finir un autre sujet dans la même session : `git checkout main && git pull`, puis `git checkout -b <sujet-court>`. Sans le `git pull`, la branche photographie un `main` périmé.
- **Une PR = une idée = une branche neuve.** Jamais deux sujets dans la même branche, jamais une branche recyclée d'une PR précédente.
- **Avant d'ouvrir la PR, vérifier ce que touchent les autres PR ouvertes**, ici et dans `junior` : `gh api "repos/VincentBern/Junior-Website/pulls?state=open" --jq '.[] | "#\(.number) \(.head.ref)"'`, puis `gh api repos/VincentBern/Junior-Website/pulls/<n>/files --jq '.[].filename'`. Si un fichier se recoupe, le dire à Luc avant d'ouvrir.
- **Une branche fusionnée est morte.** Avant chaque `git push`, vérifier que sa PR n'est pas déjà fusionnée : `gh api "repos/VincentBern/Junior-Website/pulls?state=all&head=VincentBern:<branche>" --jq '.[] | "#\(.number) fusionnée=\(.merged_at != null)"'`. Si elle l'est, ne pas pousser : repartir de `main` à jour dans une branche neuve, même pour un seul mot (c'est ainsi que le correctif `edf5118` est resté orphelin). Avant de supprimer une branche, vérifier que rien n'y a été poussé après la fusion de sa PR.
- **PR ouverte depuis plus d'une journée** : avant la fusion, `git fetch origin && git merge origin/main` dans la branche, et régler les conflits là.
- **Branche de plus de quelques jours** : ne pas se fier au diff de branche, il peut sembler annuler ce qui a été fusionné depuis. Tester la fusion : `git checkout -b essai origin/main`, `git merge origin/<vieille-branche>`, puis `git diff origin/main` montre l'effet net.
- **Dépendances entre les deux repos** : les questions du diagnostic se modifient dans `content/diagnostics/*.yaml` du repo `junior`, puis on régénère `fr.js` (voir « Stack et commandes »). Quand deux PR dépendent l'une de l'autre, même d'un repo à l'autre, écrire l'ordre de fusion dans les deux descriptions (ex. « fusionner junior#10 en même temps »).
- **Fusionner, c'est publier.** GitHub Pages sert `main` directement : pas de CI, pas d'étape de déploiement. Le rappeler à Luc dans la PR.
- **Après la fusion, on ne retouche plus à la branche.** Un oubli repart de `main` à jour, dans une branche neuve.

## Liste de vérification avant de terminer

1. La modification est faite en FR **et** en EN, et le `diff` de structure ne montre que des différences de texte attendues.
2. Les chiffres de la section 2 concordent toujours partout (site, diagnostic, vidéo).
3. Le texte respecte le vocabulaire, le vouvoiement/tutoiement et la typographie de la section 4.
4. Les figures modifiées existent en version large et étroite, avec `aria-label` traduits.
5. Vérifié dans un navigateur à ~375 px et sur grand écran, sans défilement horizontal.
6. Si le contenu du diagnostic a changé : script de synchronisation relancé, `en.js` à jour, sortie « en.js matches fr.js structure ».
7. Branche partie de `main` à jour, un seul sujet, aucune autre PR ouverte ne touche les mêmes fichiers (ou c'est signalé), et toute dépendance à une autre PR est écrite dans la description.
