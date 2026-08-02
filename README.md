# GRD Rénovation — site vitrine

Site vitrine statique pour GRD Rénovation, artisan spécialisé en toiture, façade et rénovation de murs intérieurs (région Centre-Val de Loire). Déployé en production sur **[grdrenovation.fr](https://www.grdrenovation.fr)**.

## Stack

Site 100% statique : **HTML/CSS/JS vanilla**, aucun framework, aucun bundler, aucune étape de build. Le JS utilise des modules ES natifs (`<script type="module">`).

Le contenu éditable (accueil, à propos, services, réalisations, coordonnées) est chargé au runtime depuis des fichiers JSON dans `_data/` via `js/cms-loader.js` (`fetch('/_data/....json')`), et injecté dans les éléments marqués `data-cms="..."`.

## Structure

```
index.html, about.html, services.html, realisations.html,
contact.html, mentions-legales.html   # pages du site
css/                                   # base.css, layout.css, components.css, animations.css, pages/*.css
js/                                    # main.js (point d'entrée), nav.js, form.js, cms-loader.js, ...
_data/                                 # contenu éditable : site.json, home.json, about.json, services.json, realisations.json
img/chantiers/                         # photos avant/après des chantiers
admin/                                 # interface Decap CMS pour le client
netlify.toml                           # config de déploiement Netlify
tests/                                 # tests Playwright (voir plus bas)
```

## Lancer en local

Pas de `npm install` requis pour le site lui-même. Il faut cependant le servir via un vrai serveur HTTP (pas en ouvrant les fichiers `file://`), car le contenu est chargé via `fetch('/_data/...')`, qui échoue sous `file://`.

```bash
npx serve .
# ou
python3 -m http.server
```

## Déploiement

Le site est déployé sur **Netlify** :
- `netlify.toml` définit `publish = "."` (toute la racine du repo est publiée telle quelle).
- Un push sur `main` (GitHub) déclenche le déploiement Netlify.
- Aucune CI/CD (pas de `.github/workflows`) : les tests Playwright (voir plus bas) sont à lancer manuellement avant de merger.

## Contenu éditable par le client (CMS)

Le client édite lui-même le contenu via **`/admin`** (Decap CMS, ex-Netlify CMS), authentifié avec Netlify Identity + git-gateway (config : `admin/config.yml`). Chaque modification passe par un commit git sur `main` qui écrit dans `_data/*.json` :
- `site.json` — téléphone, email, Instagram
- `home.json`, `about.json`, `services.json`, `realisations.json` — contenu des pages

Le contenu (tarifs, zone d'intervention, etc.) est géré au quotidien par le client lui-même — ce n'est pas un contenu que le code doit garder synchronisé.

## Formulaire de contact (Web3Forms)

Logique dans [js/form.js](js/form.js) :
- Validation côté client (nom, email, téléphone) avant envoi.
- Envoi en `POST` vers `https://api.web3forms.com/submit` avec une clé d'accès Web3Forms.
- La clé (`WEB3FORMS_KEY`, [js/form.js:11](js/form.js#L11)) est codée en dur dans le JS client — c'est normal pour Web3Forms, dont les clés d'accès sont conçues pour être publiques côté client (il n'y a donc pas de variable d'environnement à configurer).
- **Fallback automatique** : si l'appel réseau échoue (erreur réseau ou `success: false`), le formulaire bascule silencieusement sur un lien `mailto:grdrenov@gmail.com` et affiche quand même le message de succès. Donc en cas de souci avec la clé Web3Forms ou l'API, l'utilisateur ne voit jamais d'erreur — à garder en tête en cas de "je ne reçois plus rien" côté client (vérifier d'abord si les mails passent par le fallback mailto).

## Tests

Tests e2e minimaux (Playwright) :
- [tests/contact-form.spec.js](tests/contact-form.spec.js) — formulaire de contact : soumission valide (appel réseau vers Web3Forms intercepté, aucun vrai envoi) et validation côté client sur formulaire vide.
- [tests/pages-smoke.spec.js](tests/pages-smoke.spec.js) — charge chaque page publique et vérifie l'absence d'erreurs console et de ressources cassées (404/403...). C'est ce test qui a détecté et permis de corriger une vidéo hero cassée (hotlink Pexels expiré, remplacé par l'image statique `img/chantiers/hero-accueil.jpeg`).

```bash
npm install
npx playwright install --with-deps chromium
npm test
```

Voir [tests/contact-form.spec.js](tests/contact-form.spec.js).

## Notes / points de vigilance

Points repérés en explorant le repo, à corriger via le CMS ou par un point avec le client — rien n'a été modifié automatiquement :

- **Copyright figé à "© 2025"** dans tous les footers.
- **`mentions-legales.html`** : "Dernière mise à jour : octobre 2025".
- **Forme juridique incohérente** : `about.html`/`about.json` mentionnent une "SARL", `mentions-legales.html` indique "Entreprise individuelle".
- **Zone d'intervention** ([contact.html:157](contact.html#L157)) : liste "Région Centre, Loir-et-Cher, Cher, Indre, Eure-et-Loir, Loiret" — "Région Centre" apparaît à la place du département "Indre-et-Loire" (probable copier-coller), alors que [index.html:467](index.html#L467) a la bonne liste des 6 départements.
- **Domaine** : le code référence uniquement `grdrenovation.fr` (canonical, `robots.txt`, JSON-LD) — à vérifier si `grdrenovation.com` doit aussi être pris en compte/redirigé.
- **JSON-LD invalide** ([index.html](index.html), bloc `application/ld+json`) : une virgule finale dans `itemListElement` rend ce bloc invalide (échoue au parsing JSON), ce qui casse les données structurées pour les moteurs de recherche. Bug technique, pas un problème de contenu — à corriger côté code.
