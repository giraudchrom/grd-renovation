/**
 * nav.js — Navigation mobile, scroll-shrink header, active state
 * GRD Rénovation
 */

export function initNav() {
  const header     = document.getElementById('siteHeader');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileMenuClose');

  if (!header) return;

  // -------------------------------------------------------------------------
  // 1. SCROLL-SHRINK HEADER
  // -------------------------------------------------------------------------
  let ticking = false;
  const SCROLL_THRESHOLD = 80;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > SCROLL_THRESHOLD;
        // Ne pas modifier si c'est déjà un header "solid" (pages intérieures)
        if (!header.classList.contains('site-header--solid')) {
          header.classList.toggle('scrolled', scrolled);
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // -------------------------------------------------------------------------
  // 2. MENU MOBILE
  // -------------------------------------------------------------------------
  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Bloquer le scroll
    // Focus sur le premier lien du menu
    const firstLink = mobileMenu.querySelector('.mobile-menu__link');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Fermer avec ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Fermer au clic sur un lien du menu
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.mobile-menu__link') : [];
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fermer au clic hors du menu (overlay)
  mobileMenu && mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // -------------------------------------------------------------------------
  // 3. ACTIVE STATE selon l'URL courante
  // -------------------------------------------------------------------------
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const allNavLinks = document.querySelectorAll('.site-nav__link, .mobile-menu__link, .footer-nav a');

  allNavLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    // Correspondance directe ou racine → index.html
    if (
      linkPath === currentPath ||
      (currentPath === '' && linkPath === 'index.html') ||
      (currentPath === '/' && linkPath === 'index.html')
    ) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
