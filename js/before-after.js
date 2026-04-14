/**
 * before-after.js — Slider avant/après drag + touch
 * Technique : clip-path sur l'image "avant" (GPU-composited, zéro layout reflow)
 * GRD Rénovation
 */

function initSlider(container) {
  const beforeEl  = container.querySelector('.ba-slider__before');
  const handleEl  = container.querySelector('.ba-slider__handle');

  if (!beforeEl || !handleEl) return;

  let isDragging = false;
  let currentPct = 50; // Position initiale au centre

  // Appliquer la position
  function setPosition(pct) {
    currentPct = Math.max(0, Math.min(100, pct));
    // clip-path : masquer la partie droite de l'image "avant"
    beforeEl.style.clipPath = `inset(0 ${100 - currentPct}% 0 0)`;
    handleEl.style.left = `${currentPct}%`;
  }

  // Position initiale
  setPosition(50);

  // Calculer le % depuis un événement souris/touch
  function getPct(clientX) {
    const rect  = container.getBoundingClientRect();
    const x     = clientX - rect.left;
    return (x / rect.width) * 100;
  }

  // === SOURIS ===
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
    setPosition(getPct(e.clientX));
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setPosition(getPct(e.clientX));
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = '';
    }
  });

  // === TACTILE ===
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    setPosition(getPct(e.touches[0].clientX));
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    setPosition(getPct(e.touches[0].clientX));
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Accessibilité clavier : flèches gauche/droite sur le handle
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      setPosition(currentPct - 2);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      setPosition(currentPct + 2);
      e.preventDefault();
    }
  });
  container.setAttribute('tabindex', '0');
}

export function initBeforeAfter() {
  const sliders = document.querySelectorAll('[data-ba-slider]');
  sliders.forEach(initSlider);
}
