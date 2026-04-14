/**
 * filter.js — Filtrage de la galerie de réalisations
 * GRD Rénovation
 */

export function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const countEl = document.getElementById('projectCount');
  const noResults = document.getElementById('noResults');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Mettre à jour l'état actif
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      let visibleCount = 0;

      projectCards.forEach((card, i) => {
        const category = card.dataset.category;
        const isVisible = filter === 'all' || category === filter;

        if (isVisible) {
          card.removeAttribute('hidden');
          card.classList.remove('is-filtering');
          // Délai échelonné pour l'apparition
          card.style.animationDelay = `${(visibleCount * 0.08).toFixed(2)}s`;
          card.classList.add('is-appearing');
          visibleCount++;

          // Nettoyer la classe après l'animation
          card.addEventListener('animationend', () => {
            card.classList.remove('is-appearing');
          }, { once: true });
        } else {
          card.setAttribute('hidden', '');
        }
      });

      // Mettre à jour le compteur
      if (countEl) countEl.textContent = visibleCount;

      // Afficher le message "aucun résultat" si besoin
      if (noResults) {
        noResults.classList.toggle('is-visible', visibleCount === 0);
      }
    });
  });
}
