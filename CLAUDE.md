# CLAUDE.md

Ce fichier fournit des instructions à Claude Code (claude.ai/code) pour travailler dans ce dépôt.

## Vue d'ensemble

Site vitrine pour **GRD Rénovation**, artisan réel (SARL, SIREN 994 315 968) spécialisé en
toiture, façade et rénovation de murs intérieurs, région Centre-Val de Loire. Ce n'est pas un
gabarit ni une démo : le client existe, le site est en production sur
**[www.grdrenovation.com](https://www.grdrenovation.com)**, et le client édite lui-même son
contenu (réalisations, services, coordonnées) via l'interface CMS `/admin`.

## Stack

100% statique : **HTML/CSS/JS vanilla**, aucun framework, aucun bundler, aucune étape de build.
JS en modules ES natifs. Contenu éditable chargé au runtime depuis `_data/*.json` via
`js/cms-loader.js`. Déployé sur **Netlify** (`netlify.toml`, `publish = "."`), un push sur `main`
déclenche le déploiement. Pas de CI/CD — les tests Playwright se lancent manuellement avant de
merger (voir README).

## Structure

```
index.html, about.html, services.html, realisations.html, contact.html, mentions-legales.html
css/            base.css, layout.css, components.css, animations.css
js/             main.js, nav.js, form.js, cms-loader.js
_data/          contenu éditable (site.json, home.json, about.json, services.json, realisations.json)
admin/          interface Decap CMS (Netlify Identity + git-gateway)
tests/          Playwright — contact-form.spec.js, pages-smoke.spec.js
```

## Commandes

```bash
npm install
npx playwright install --with-deps chromium
npm test   # 16 tests : chromium desktop + mobile-chromium (Pixel 7)
```

## État du projet (dernier bilan)

**Score global : 5,4/10** — site vitrine techniquement solide pour un vrai client déjà en
production (CMS fonctionnel, formulaire de contact fiable avec fallback mailto, débordement
horizontal mobile réel trouvé et corrigé cette passe), mais quasiment aucune visibilité
opérationnelle : pas d'analytics, pas de monitoring d'erreurs/uptime — faute de comptes externes,
pas d'un manque de code. Business (readiness monétisation) et Positionnement marché ne s'appliquent
pas : le client est facturé une fois, il n'est pas en concurrence pour des utilisateurs.

Corrigé le 8 août 2026 (premier passage `project-catchup` sur ce projet) :
- Dependabot (alertes de vulnérabilité + correctifs de sécurité automatiques) activé — était
  désactivé ; `.github/dependabot.yml` ajouté (npm, hebdomadaire).
- **Bug réel** : débordement horizontal fantôme sur mobile (26px sur index/about/services/contact).
  Cause : `.mobile-menu` est `position: fixed`, qui échappe au `overflow-x: hidden` posé sur
  `body` seul (`css/base.css`) — un élément fixed ne respecte que le clipping de `html`. Corrigé en
  ajoutant `overflow-x: hidden` à `html`. Détecté par un nouveau projet Playwright
  `mobile-chromium` + une assertion `scrollWidth`/`clientWidth` — les tests ne couvraient que le
  desktop jusqu'ici malgré 20 media queries dans le CSS.
- 0 CVE (npm audit), 0 secret committé (secretlint), déploiement Netlify vérifié en direct
  conforme au dernier commit (mentions légales : SARL, SIREN, © 2026 — identiques en local et en
  prod).

Quick wins :
- [ ] Content-Security-Policy sur `netlify.toml` — délibérément pas fait cette passe : le site
  charge plusieurs origines tierces réelles (Google Fonts, `unpkg.com` pour Decap CMS,
  `identity.netlify.com`, `api.web3forms.com`), et une CSP mal calibrée peut casser silencieusement
  le CMS que le client utilise au quotidien. À faire avec un vrai test de connexion `/admin` avant
  de merger, pas en aveugle. 🔧

Reste (nécessite un compte externe, 👤) :
- [ ] Analytics de trafic/conversion (Plausible, Fathom ou GA4) — aujourd'hui aucune visibilité sur
  qui visite le site ni quelle page convertit.
- [ ] Monitoring d'erreurs/uptime (Sentry ou un moniteur externe simple) — aucune alerte si le site
  tombe ou si le formulaire de contact bascule silencieusement sur le fallback mailto en continu.

Prompt de reprise :

```
Reprends grd-renovation (github.com/giraudchrom/grd-renovation, clone local dans
~/Documents/CODE-PROJET/Projet terminer /RenovGRD_Officiel — pas ~/Téléchargements/grd-renovation-main,
une copie secondaire moins à jour). Site vitrine réel pour un vrai client (GRD Rénovation, SARL,
SIREN 994315968), en production sur www.grdrenovation.com via Netlify. Premier passage
project-catchup le 8 août 2026 : score 5,4/10. Le code est sain (0 CVE, 0 secret, Dependabot
activé, 16 tests desktop+mobile passants) et un vrai bug de débordement horizontal mobile a été
trouvé et corrigé. Ce qui reste est soit délibérément différé (CSP, à faire avec précaution sur un
site client réel) soit bloqué sur des comptes externes que seul moi peux créer (analytics,
monitoring). Rien d'urgent ni de cassé en prod.
```
