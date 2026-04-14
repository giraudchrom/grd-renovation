/**
 * animations.js — Scroll reveal avec IntersectionObserver
 * GRD Rénovation
 */

export function initAnimations() {
  // Un seul observer pour toutes les classes reveal (performance)
  const revealSelector = '.reveal, .reveal--left, .reveal--right, .reveal--scale, .reveal--fade';
  const elements = document.querySelectorAll(revealSelector);

  if (!elements.length) return;

  // Vérification support (tous navigateurs modernes)
  if (!('IntersectionObserver' in window)) {
    // Fallback : rendre tous les éléments visibles immédiatement
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Observer une seule fois par élément
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));

  // -------------------------------------------------------------------------
  // Boutons flottants — masquer quand le footer est visible
  // -------------------------------------------------------------------------
  const floatingCta = document.getElementById('floatingCta');
  const footer = document.getElementById('siteFooter');

  if (floatingCta && footer) {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          floatingCta.classList.toggle('is-hidden', entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    footerObserver.observe(footer);
  }
}
