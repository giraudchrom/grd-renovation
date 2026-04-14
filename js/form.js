/**
 * form.js — Validation + envoi réel via Web3Forms
 * GRD Rénovation
 *
 * ─── CONFIGURATION WEB3FORMS (1 seule étape) ─────────────────────────────────
 *  1. Aller sur https://web3forms.com
 *  2. Entrer l'adresse : grdrenov@gmail.com
 *  3. Copier la clé reçue et la coller ici :
 * ─────────────────────────────────────────────────────────────────────────────
 */
const WEB3FORMS_KEY = '3c2f002a-b15f-4c7f-befb-e2e56863c2f9';

const CONFIGURED = WEB3FORMS_KEY !== 'VOTRE_CLE_ICI';

// ─── Règles de validation ────────────────────────────────────────────────────
const validators = {
  name: {
    validate: (v) => {
      if (!v.trim()) return 'Veuillez entrer votre nom.';
      if (v.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
      return null;
    }
  },
  email: {
    validate: (v) => {
      if (!v.trim()) return 'Veuillez entrer votre adresse e-mail.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Adresse e-mail invalide.';
      return null;
    }
  },
  phone: {
    validate: (v) => {
      if (!v.trim()) return 'Veuillez entrer votre numéro de téléphone.';
      if (!/^[\d\s\+\(\)\-\.]{10,}$/.test(v.trim())) return 'Numéro de téléphone invalide.';
      return null;
    }
  },
};

function renderFieldState(input, errorEl, errorMsg) {
  if (errorMsg) {
    input.classList.add('is-error');
    input.classList.remove('is-valid');
    if (errorEl) { errorEl.textContent = errorMsg; errorEl.classList.add('is-visible'); }
  } else {
    input.classList.remove('is-error');
    input.classList.add('is-valid');
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('is-visible'); }
  }
}

function validateField(name, value) {
  const rule = validators[name];
  return rule ? rule.validate(value) : null;
}

// ─── Envoi Web3Forms ─────────────────────────────────────────────────────────
async function sendViaWeb3Forms(data) {
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...data })
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur envoi');
  return json;
}

// ─── Fallback mailto ─────────────────────────────────────────────────────────
function sendViaMailto(data) {
  const subject = encodeURIComponent(`Demande de devis — ${data.service || 'GRD Rénovation'}`);
  const body = encodeURIComponent(
    `Nom : ${data.name}\nEmail : ${data.email}\nTéléphone : ${data.phone || 'Non renseigné'}\n` +
    `Service : ${data.service || 'Non précisé'}\n\nMessage :\n${data.message}`
  );
  window.location.href = `mailto:grdrenov@gmail.com?subject=${subject}&body=${body}`;
}

// ─── Init formulaire ─────────────────────────────────────────────────────────
export function initForm() {
  const form      = document.getElementById('contactForm');
  const successEl = document.getElementById('formSuccess');

  if (!form) { initAccordions(); return; }

  const fields = {
    name:    { input: document.getElementById('contactName'),    error: document.getElementById('nameError') },
    email:   { input: document.getElementById('contactEmail'),   error: document.getElementById('emailError') },
    phone:   { input: document.getElementById('contactPhone'),   error: document.getElementById('phoneError') }
  };

  // Validation temps réel
  Object.entries(fields).forEach(([name, { input, error }]) => {
    if (!input) return;
    input.addEventListener('blur', () => renderFieldState(input, error, validateField(name, input.value)));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error') && !validateField(name, input.value)) {
        renderFieldState(input, error, null);
      }
    });
  });

  // Soumission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    Object.entries(fields).forEach(([name, { input, error }]) => {
      if (!input) return;
      const err = validateField(name, input.value);
      renderFieldState(input, error, err);
      if (err) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector('.is-error');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Envoi en cours...'; }

    const serviceSelect = document.getElementById('contactService');
    const serviceLabels = {
      toiture: 'Toiture', facade: 'Façade', murs: 'Murs intérieurs',
      multiple: 'Plusieurs services', autre: 'Autre'
    };
    const serviceVal = serviceSelect ? serviceSelect.value : '';

    const data = {
      name:    fields.name.input.value.trim(),
      email:   fields.email.input.value.trim(),
      phone:   fields.phone.input ? fields.phone.input.value.trim() : '',
      service: serviceLabels[serviceVal] || serviceVal || 'Non précisé',
      message: (document.getElementById('contactMessage') || {}).value?.trim() || '',
      subject: `Nouveau devis GRD Rénovation — ${serviceLabels[serviceVal] || 'Demande générale'}`,
    };

    try {
      if (CONFIGURED) {
        await sendViaWeb3Forms(data);
      } else {
        sendViaMailto(data);
      }
      form.style.display = 'none';
      if (successEl) successEl.classList.add('is-visible');
    } catch (err) {
      console.error('Erreur envoi:', err);
      // Fallback automatique vers mailto
      sendViaMailto(data);
      form.style.display = 'none';
      if (successEl) successEl.classList.add('is-visible');
    }
  });

  initAccordions();
}

// ─── Accordéons services ─────────────────────────────────────────────────────
function initAccordions() {
  const accordions = document.querySelectorAll('[data-accordion]');
  accordions.forEach(accordion => {
    const toggle = accordion.querySelector('.service-accordion__toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const isOpen = accordion.classList.contains('is-open');
      accordions.forEach(a => {
        a.classList.remove('is-open');
        const t = a.querySelector('.service-accordion__toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        accordion.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
