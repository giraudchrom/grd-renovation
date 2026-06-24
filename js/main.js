/**
 * main.js — Point d'entrée, initialisation de tous les modules
 * GRD Rénovation
 *
 * Utilise les ES Modules natifs (type="module" dans le HTML)
 * Compatible avec tous les navigateurs modernes (2018+)
 */

import { initNav }        from './nav.js';
import { initAnimations } from './animations.js';
import { initCounters }   from './counter.js';
import { initBeforeAfter} from './before-after.js';
import { initForm }       from './form.js';
import { initFilter }     from './filter.js';

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & menu mobile (toutes les pages)
  initNav();

  // Animations scroll reveal (toutes les pages)
  initAnimations();

  // Compteurs animés (page accueil)
  initCounters();

  // Formulaire de contact + accordéons services
  initForm();

  // Slider avant/après + filtres (page réalisations)
  // Attend cms:ready si la grille est gérée par le loader, sinon démarre direct
  const grid = document.getElementById('projectsGrid');
  if (grid) {
    let ran = false;
    const run = () => { if (ran) return; ran = true; initBeforeAfter(); initFilter(); };
    window.addEventListener('cms:ready', run, { once: true });
    setTimeout(run, 3000); // fallback si le fetch échoue
  } else {
    initBeforeAfter();
    initFilter();
  }

  // Smooth scroll pour les ancres internes
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Smooth scroll pour les ancres inter-pages (ex: services.html#toiture)
  // Déclenché automatiquement si l'URL a un hash au chargement
  if (window.location.hash) {
    const targetEl = document.querySelector(window.location.hash);
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
});
