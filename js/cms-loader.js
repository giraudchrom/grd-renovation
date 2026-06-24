const BASE = '/_data';

async function get(path) {
  try {
    const r = await fetch(path);
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

function setText(sel, val) {
  if (val == null) return;
  document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
}

function buildCard(p, delay) {
  const labels = { facade: 'Façade', toiture: 'Toiture', murs: 'Murs intérieurs' };
  const label = labels[p.category] || p.category;
  return `<article class="project-card reveal reveal--scale reveal--delay-${delay}" data-category="${p.category}">
      <div class="ba-slider" data-ba-slider aria-label="Avant/après — ${p.title}" role="img">
        <div class="ba-slider__after">
          <img src="${p.image_after}" alt="${p.image_after_alt || ''}" loading="lazy">
          <span class="ba-slider__label">Après</span>
        </div>
        <div class="ba-slider__before">
          <img src="${p.image_before}" alt="${p.image_before_alt || ''}" loading="lazy">
          <span class="ba-slider__label">Avant</span>
        </div>
        <div class="ba-slider__handle" aria-hidden="true">
          <div class="ba-slider__line"></div>
          <div class="ba-slider__circle">↔</div>
        </div>
      </div>
      <div class="project-card__info">
        <span class="project-card__category">${label}</span>
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__desc">${p.description}</p>
      </div>
    </article>`;
}

async function init() {
  const grid      = document.getElementById('projectsGrid');
  const isService = !!document.getElementById('toiture');
  const isAbout   = !!document.querySelector('.about-intro__text');
  const isHome    = !!document.querySelector('.stats-bar');

  const fetches = [get(`${BASE}/site.json`)];
  if (grid)      fetches.push(get(`${BASE}/realisations.json`));
  if (isService) fetches.push(get(`${BASE}/services.json`));
  if (isAbout)   fetches.push(get(`${BASE}/about.json`));
  if (isHome)    fetches.push(get(`${BASE}/home.json`));

  const results = await Promise.all(fetches);
  let i = 0;
  const site = results[i++];

  // ── Sitewide : téléphone & email ────────────────────────────────────────
  if (site) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = `tel:${site.phone_raw}`;
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = `mailto:${site.email}`;
      if (a.textContent.trim().includes('@')) a.textContent = site.email;
    });
    document.querySelectorAll('[data-cms="phone"]').forEach(el => {
      el.textContent = site.phone;
    });
  }

  // ── Réalisations : reconstruire la grille ────────────────────────────────
  if (grid) {
    const data = results[i++];
    if (data && Array.isArray(data.projects)) {
      const noResults = document.getElementById('noResults');
      grid.querySelectorAll('.project-card').forEach(c => c.remove());
      const delays = [1, 2, 3];
      data.projects.forEach((p, idx) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = buildCard(p, delays[idx % 3]);
        grid.insertBefore(tmp.firstElementChild, noResults);
      });
      const counter = document.getElementById('projectCount');
      if (counter) counter.textContent = data.projects.length;
    }
  }

  // ── Services : descriptions + listes ────────────────────────────────────
  if (isService) {
    const s = results[i++];
    if (s) {
      setText('[data-cms="toiture_description"]', s.toiture_description);
      setText('[data-cms="facade_description"]',  s.facade_description);
      setText('[data-cms="murs_description"]',    s.murs_description);

      ['toiture', 'facade', 'murs'].forEach(key => {
        const ul = document.querySelector(`[data-cms-list="${key}_prestations"]`);
        const items = s[`${key}_prestations`];
        if (ul && Array.isArray(items)) {
          ul.innerHTML = items.map(item => {
            const text = typeof item === 'string' ? item : (item.value || '');
            return `<li>${text}</li>`;
          }).join('');
        }
      });
    }
  }

  // ── À propos : textes ────────────────────────────────────────────────────
  if (isAbout) {
    const a = results[i++];
    if (a) {
      setText('[data-cms="hero_subtitle"]', a.hero_subtitle);
      setText('[data-cms="intro_p1"]',      a.intro_p1);
      setText('[data-cms="intro_p2"]',      a.intro_p2);
      setText('[data-cms="intro_p3"]',      a.intro_p3);
      setText('[data-cms="quote"]',         a.quote);
    }
  }

  // ── Accueil : chiffres clés ──────────────────────────────────────────────
  if (isHome) {
    const h = results[i++];
    if (h) {
      document.querySelectorAll('[data-cms-stat]').forEach(el => {
        const field = el.getAttribute('data-cms-stat');
        const val   = h[field];
        if (val != null) {
          const suffix = el.getAttribute('data-suffix') || '';
          el.setAttribute('data-target', val);
          el.textContent = val + suffix;
        }
      });
    }
  }

  window.dispatchEvent(new CustomEvent('cms:ready'));
}

init().catch(() => window.dispatchEvent(new CustomEvent('cms:ready')));
