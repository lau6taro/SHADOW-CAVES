/* =====================================================
   CAVES OF SHADOWS — script.js
   Tower Defense Medieval Landing Page
   ShadowForge Studios 2025
   ===================================================== */

'use strict';

/* =====================================================
   0. DATOS DEL JUEGO — Personajes
   ===================================================== */
const CHARACTERS = [
  {
    id: 'seraphis',
    name: 'Seraphis',
    role: 'Archimago',
    emoji: '🧙',
    color: '#9b5de5',
    desc: 'El último archimago de la Torre de Cristal. Domina las runas ancestrales con una precisión mortal. Su mente es tan peligrosa como cualquier espada.',
    stats: { Poder: 95, Velocidad: 50, Defensa: 40, Magia: 100 },
    ability: { icon: '✨', name: 'Tormenta de Runas', color: '#9b5de5' },
  },
  {
    id: 'valdra',
    name: 'Valdra',
    role: 'Comandante de Hierro',
    emoji: '⚔️',
    color: '#c9a227',
    desc: 'Veterana de las Guerras del Norte. Ninguna horda ha cruzado las murallas que ella defiende. Su escudo ha resistido cien batallas.',
    stats: { Poder: 80, Velocidad: 60, Defensa: 98, Magia: 30 },
    ability: { icon: '🛡', name: 'Muro Indestructible', color: '#c9a227' },
  },
  {
    id: 'nyxara',
    name: 'Nyxara',
    role: 'Exploradora de Sombras',
    emoji: '🏹',
    color: '#00d4ff',
    desc: 'Criada en las cavernas del norte, conoce el lenguaje de las sombras. Sus flechas nunca fallan y llegan antes que el sonido.',
    stats: { Poder: 85, Velocidad: 100, Defensa: 35, Magia: 55 },
    ability: { icon: '💨', name: 'Flecha del Vacío', color: '#00d4ff' },
  },
  {
    id: 'gorath',
    name: 'Gorath',
    role: 'Guardián de Piedra',
    emoji: '🪨',
    color: '#ff2d78',
    desc: 'Un golem antiguo despertado por el Equinoccio Roto. Su cuerpo es pura roca volcánica y su lealtad al reino es absoluta e inquebrantable.',
    stats: { Poder: 70, Velocidad: 20, Defensa: 100, Magia: 60 },
    ability: { icon: '🌋', name: 'Golpe Sísmico', color: '#ff2d78' },
  },
  {
    id: 'malachar',
    name: 'Malachar',
    role: 'El Eterno — ⚠ Secreto',
    emoji: '💀',
    color: '#00f5a0',
    desc: 'Un ser de otra era. Ni vivo ni muerto. Portador del Fragmento Oscuro. Solo puede ser invocado con el código SHADOWGUARD al inicio del juego.',
    stats: { Poder: 100, Velocidad: 90, Defensa: 80, Magia: 100 },
    ability: { icon: '🌑', name: 'Consumir Sombra', color: '#00f5a0' },
  },
];

/* =====================================================
   1. UTILIDADES
   ===================================================== */

/**
 * Selector corto
 * @param {string} sel
 * @param {Element} [ctx=document]
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Añade/quita clase según condición
 */
const toggleClass = (el, cls, force) => el?.classList.toggle(cls, force);

/**
 * Retardo en ms (Promise)
 */
const delay = ms => new Promise(r => setTimeout(r, ms));

/* =====================================================
   2. CURSOR PERSONALIZADO
   ===================================================== */
const initCursor = () => {
  const cursor = $('#cursor');
  const trail  = $('#cursorTrail');
  if (!cursor || !trail) return;

  // Solo en dispositivos con puntero preciso
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mx = 0, my = 0;
  let tx = 0, ty = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Trail con lerp suave
  const animateTrail = () => {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    raf = requestAnimationFrame(animateTrail);
  };
  raf = requestAnimationFrame(animateTrail);

  // Escalar al hacer hover en elementos interactivos
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="tab"], [tabindex]')) {
      cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
      trail.style.opacity = '0.7';
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [role="tab"], [tabindex]')) {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      trail.style.opacity = '0.4';
    }
  });
};

/* =====================================================
   3. PARTÍCULAS DE FONDO
   ===================================================== */
const initParticles = () => {
  const container = $('#particles');
  if (!container) return;

  // Respetar prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COUNT = window.innerWidth < 600 ? 18 : 35;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    // Posición horizontal aleatoria
    const left     = Math.random() * 100;
    const duration = 8 + Math.random() * 20;   // 8s – 28s
    const delayS   = Math.random() * 15;         // 0s – 15s
    const size     = Math.random() > 0.7 ? 3 : 2;

    // Alterna entre colores de acento
    const colors = ['var(--accent-gold)', 'var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-pink)'];
    const color  = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: -${delayS}s;
    `;

    container.appendChild(p);
  }
};

/* =====================================================
   4. HEADER — scroll y navegación activa
   ===================================================== */
const initHeader = () => {
  const header = $('#header');
  if (!header) return;

  // Clase scrolled
  const onScroll = () => {
    toggleClass(header, 'header--scrolled', window.scrollY > 60);
    toggleClass($('#scrollTop'), 'is-visible', window.scrollY > 400);
    $('#scrollTop')?.toggleAttribute('hidden', window.scrollY <= 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Estado inicial

  // Nav activa según sección visible
  const sections = $$('section[id]');
  const navLinks  = $$('.nav__link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.dataset.section === entry.target.id;
          toggleClass(link, 'active', active);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
};

/* =====================================================
   5. MENÚ MÓVIL (hamburguesa)
   ===================================================== */
const initMobileNav = () => {
  const toggle = $('#navToggle');
  const nav    = $('#nav');
  if (!toggle || !nav) return;

  const open  = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    nav.classList.contains('is-open') ? close() : open();
  });

  // Cerrar al hacer clic en un link
  $$('.nav__link').forEach(link => link.addEventListener('click', close));

  // Cerrar al hacer clic fuera
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      close();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
  });
};

/* =====================================================
   6. MODO OSCURO / CLARO  ← DOM #1
   Guarda preferencia en localStorage
   ===================================================== */
const initTheme = () => {
  const btn  = $('#btnTheme');
  const html = document.documentElement;
  const KEY  = 'cos-theme'; // localStorage key

  // Leer preferencia guardada o del sistema
  const saved  = localStorage.getItem(KEY);
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const theme  = saved || system;

  html.setAttribute('data-theme', theme);

  const applyTheme = t => {
    html.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
    btn?.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  };

  applyTheme(theme);

  btn?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Sincronizar con cambio del sistema (sin reload)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
};

/* =====================================================
   7. PERSONALIZAR NOMBRE DEL PROTAGONISTA  ← DOM #2
   El texto del hero cambia en tiempo real
   ===================================================== */
const initProtagonistName = () => {
  const input   = $('#inputProtagonist');
  const btn     = $('#btnSetName');
  const nameEl  = $('#protagonistName');
  if (!input || !btn || !nameEl) return;

  const DEFAULT = 'el Guardián';

  // Aplicar nombre con animación
  const setName = (raw) => {
    const val = raw.trim();
    const name = val.length > 0 ? val : DEFAULT;

    // Micro-animación de salida/entrada
    nameEl.style.opacity = '0';
    nameEl.style.transform = 'translateY(-6px)';

    setTimeout(() => {
      nameEl.textContent = name;
      nameEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      nameEl.style.opacity = '1';
      nameEl.style.transform = 'translateY(0)';
    }, 200);
  };

  // Al hacer clic en el botón
  btn.addEventListener('click', () => setName(input.value));

  // Al presionar Enter en el input
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') setName(input.value);
  });

  // Preview en tiempo real (con debounce ligero)
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => setName(input.value), 400);
  });
};

/* =====================================================
   8. TRAILER / EASTER EGG  ← DOM #3 y DOM #4
   ===================================================== */
const initTrailer = () => {
  const overlay        = $('#trailerOverlay');
  const btnOpen        = $('#btnTrailer');
  const btnClose       = $('#btnCloseTrailer');
  const btnEgg         = $('#btnEasterEgg');
  const eggContent     = $('#easterEggContent');
  const videoBar       = $('#videoBar');
  const videoTimer     = $('#videoTimer');
  if (!overlay || !btnOpen || !btnClose) return;

  let videoInterval = null;
  let seconds = 0;
  const TOTAL = 154; // 2:34

  // Formatear segundos a mm:ss
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // Iniciar "reproducción" falsa
  const startFakeVideo = () => {
    seconds = 0;
    if (videoBar)   videoBar.style.width = '0%';
    if (videoTimer) videoTimer.textContent = `0:00 / ${fmt(TOTAL)}`;

    videoInterval = setInterval(() => {
      seconds = Math.min(seconds + 1, TOTAL);
      const pct = (seconds / TOTAL) * 100;
      if (videoBar)   videoBar.style.width = pct + '%';
      if (videoTimer) videoTimer.textContent = `${fmt(seconds)} / ${fmt(TOTAL)}`;
      if (seconds >= TOTAL) clearInterval(videoInterval);
    }, 1000);
  };

  const stopFakeVideo = () => {
    clearInterval(videoInterval);
    seconds = 0;
  };

  // Abrir overlay (DOM #3)
  const openTrailer = () => {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    // Resetear easter egg
    if (eggContent) eggContent.hidden = true;
    if (btnEgg)     btnEgg.setAttribute('aria-expanded', 'false');
    startFakeVideo();
    // Foco accesible
    setTimeout(() => btnClose?.focus(), 100);
  };

  // Cerrar overlay
  const closeTrailer = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    stopFakeVideo();
    btnOpen?.focus();
  };

  btnOpen.addEventListener('click', openTrailer);
  btnClose.addEventListener('click', closeTrailer);

  // Cerrar al clic en el fondo
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeTrailer();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) closeTrailer();
  });

  // Easter Egg toggle (DOM #4)
  btnEgg?.addEventListener('click', () => {
    const isHidden = eggContent?.hidden;
    if (eggContent) eggContent.hidden = !isHidden;
    btnEgg.setAttribute('aria-expanded', String(isHidden));
  });
};

/* =====================================================
   9. GALERÍA DE PERSONAJES  ← DOM #5
   Clic en miniatura → cambia visor principal
   ===================================================== */
const initCharacters = () => {
  const thumbnailsEl = $('#characterThumbnails');
  const avatarEl     = $('#characterAvatar');
  const infoEl       = $('#characterInfo');
  if (!thumbnailsEl || !avatarEl || !infoEl) return;

  // ── Renderizar miniaturas ──────────────────────────
  CHARACTERS.forEach((char, idx) => {
    const btn = document.createElement('button');
    btn.className   = 'char-thumb';
    btn.role        = 'tab';
    btn.dataset.idx = idx;
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `Ver ${char.name}`);
    btn.style.setProperty('--char-color', char.color);

    btn.innerHTML = `
      <span class="char-thumb__icon" aria-hidden="true">${char.emoji}</span>
      <span class="char-thumb__name">${char.name}</span>
    `;

    btn.addEventListener('click', () => renderCharacter(idx));
    thumbnailsEl.appendChild(btn);
  });

  // ── Renderizar personaje en el visor principal ─────
  const renderCharacter = (idx) => {
    const char = CHARACTERS[idx];
    if (!char) return;

    // Actualizar estado de miniaturas
    $$('.char-thumb', thumbnailsEl).forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });

    // Animación de salida
    avatarEl.style.opacity = '0';
    infoEl.style.opacity   = '0';

    setTimeout(() => {

      // ── Avatar ──────────────────────────────────────
      avatarEl.innerHTML = `
        <div class="char-avatar">
          <div class="char-avatar__bg" style="background: radial-gradient(ellipse at 50% 70%, ${char.color}33 0%, transparent 70%);"></div>
          <span class="char-avatar__icon" aria-hidden="true">${char.emoji}</span>
        </div>
      `;
      // Color del glow del icono
      const icon = avatarEl.querySelector('.char-avatar__icon');
      if (icon) icon.style.filter = `drop-shadow(0 0 24px ${char.color})`;

      // ── Info ─────────────────────────────────────────
      const statsHTML = Object.entries(char.stats).map(([label, val]) => `
        <div class="char-stat">
          <span class="char-stat__label">${label}</span>
          <div class="char-stat__bar">
            <div class="char-stat__fill" style="width:0%; background: linear-gradient(90deg, ${char.color}88, ${char.color});"></div>
          </div>
          <span class="char-stat__value">${val}</span>
        </div>
      `).join('');

      infoEl.innerHTML = `
        <p class="char-info__role" style="color: ${char.color};">${char.role}</p>
        <h3 class="char-info__name">${char.name}</h3>
        <p class="char-info__desc">${char.desc}</p>
        <div class="char-stats" aria-label="Estadísticas de ${char.name}">${statsHTML}</div>
        <div class="char-ability" style="color:${char.ability.color}; border-color:${char.ability.color}55; background:${char.ability.color}0d;">
          <span aria-hidden="true">${char.ability.icon}</span>
          <span>${char.ability.name}</span>
        </div>
      `;

      // Animación de entrada
      avatarEl.style.transition = 'opacity 0.35s ease';
      infoEl.style.transition   = 'opacity 0.35s ease';
      avatarEl.style.opacity    = '1';
      infoEl.style.opacity      = '1';

      // Animar barras de stats con delay
      setTimeout(() => {
        $$('.char-stat__fill', infoEl).forEach((bar, i) => {
          const values = Object.values(char.stats);
          setTimeout(() => {
            bar.style.transition = 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            bar.style.width = values[i] + '%';
          }, i * 80);
        });
      }, 50);

    }, 200);
  };

  // Inicializar con el primer personaje
  renderCharacter(0);

  // Navegación con teclado (←/→) en las miniaturas
  thumbnailsEl.addEventListener('keydown', e => {
    const thumbs = $$('.char-thumb', thumbnailsEl);
    const current = thumbs.findIndex(b => b.getAttribute('aria-selected') === 'true');
    let next = current;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (current + 1) % thumbs.length;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   next = (current - 1 + thumbs.length) % thumbs.length;

    if (next !== current) {
      e.preventDefault();
      thumbs[next].focus();
      renderCharacter(next);
    }
  });
};

/* =====================================================
   10. FORMULARIO DE SUSCRIPCIÓN  ← DOM #6
   Validación + mensaje de éxito (sin recarga)
   ===================================================== */
const initSubscriptionForm = () => {
  const form        = $('#subscriptionForm');
  const btnSub      = $('#btnSubscribe');
  const inputName   = $('#inputName');
  const inputEmail  = $('#inputEmail');
  const inputConsent= $('#inputConsent');
  const nameError   = $('#nameError');
  const emailError  = $('#emailError');
  const consentError= $('#consentError');
  const formSuccess = $('#formSuccess');
  if (!form || !btnSub) return;

  // ── Validadores ───────────────────────────────────
  const validators = {
    name: (val) => {
      if (!val.trim())           return 'El nombre es obligatorio.';
      if (val.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
      if (val.trim().length > 40)return 'Máximo 40 caracteres.';
      return '';
    },
    email: (val) => {
      if (!val.trim()) return 'El correo es obligatorio.';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!re.test(val.trim())) return 'Ingresa un correo válido (ej: tu@correo.com).';
      return '';
    },
    consent: (checked) => {
      if (!checked) return 'Debes aceptar los términos para continuar.';
      return '';
    },
  };

  // ── Mostrar/limpiar error ─────────────────────────
  const showError = (inputEl, errorEl, msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    inputEl?.classList.toggle('is-invalid', !!msg);
    inputEl?.classList.toggle('is-valid',   !msg && inputEl?.value?.length > 0);
  };

  // ── Validar un campo ──────────────────────────────
  const validateField = (field) => {
    if (field === 'name') {
      const err = validators.name(inputName?.value || '');
      showError(inputName, nameError, err);
      return !err;
    }
    if (field === 'email') {
      const err = validators.email(inputEmail?.value || '');
      showError(inputEmail, emailError, err);
      return !err;
    }
    if (field === 'consent') {
      const err = validators.consent(inputConsent?.checked || false);
      showError(null, consentError, err);
      return !err;
    }
    return true;
  };

  // Validación en tiempo real al salir del campo (blur)
  inputName?.addEventListener('blur',  () => validateField('name'));
  inputEmail?.addEventListener('blur', () => validateField('email'));

  // Limpiar error al escribir
  inputName?.addEventListener('input',  () => {
    if (inputName.classList.contains('is-invalid')) validateField('name');
  });
  inputEmail?.addEventListener('input', () => {
    if (inputEmail.classList.contains('is-invalid')) validateField('email');
  });

  // ── Submit ────────────────────────────────────────
  btnSub.addEventListener('click', async () => {
    // Validar todos los campos
    const ok = [
      validateField('name'),
      validateField('email'),
      validateField('consent'),
    ].every(Boolean);

    if (!ok) {
      // Foco en el primer campo con error
      const firstInvalid = form.querySelector('.is-invalid, [aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    // Estado de carga
    btnSub.disabled = true;
    btnSub.innerHTML = '<span class="btn__icon" aria-hidden="true">⏳</span> Inscribiendo...';

    // Simular llamada a servidor (750ms)
    await delay(750);

    // Mostrar éxito
    $$('.form-group', form).forEach(g => g.style.display = 'none');
    btnSub.style.display = 'none';
    if (formSuccess) formSuccess.hidden = false;

    // Actualizar contador de guardianes
    const counterEl = $('#counterValue');
    if (counterEl) {
      const current = parseInt(counterEl.textContent.replace(/,/g, ''), 10) || 11;
      animateCounter(counterEl, current, current + 1, 800);
    }
  });
};

/* =====================================================
   11. CONTADOR ANIMADO
   ===================================================== */
/**
 * Anima un número de `from` a `to` en `duration` ms
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {number} duration
 */
const animateCounter = (el, from, to, duration) => {
  const start  = performance.now();
  const diff   = to - from;

  const step = (now) => {
    const elapsed = Math.min(now - start, duration);
    const progress = elapsed / duration;
    // Easing out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + diff * ease);
    el.textContent = value.toLocaleString('es-ES');
    if (elapsed < duration) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

/* =====================================================
   12. ANIMACIONES DE REVEAL (Intersection Observer)
   ===================================================== */
const initRevealAnimations = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Añadir clase .reveal a elementos que queremos animar
  const targets = [
    '.lore__paragraph',
    '.lore__fact',
    '.feature-card',
    '.social-link',
    '.platform-badge',
  ];

  targets.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      // Delay escalonado por grupos de hasta 4
      const delayClass = `reveal--delay-${(i % 4) + 1}`;
      el.classList.add(delayClass);
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Solo animar una vez
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
};

/* =====================================================
   13. SCROLL TO TOP
   ===================================================== */
const initScrollTop = () => {
  const btn = $('#scrollTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

/* =====================================================
   14. SMOOTH SCROLL para anclas internas
   ===================================================== */
const initSmoothScroll = () => {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = $('#header')?.offsetHeight || 80;
    const top     = target.getBoundingClientRect().top + window.scrollY - headerH;

    window.scrollTo({ top, behavior: 'smooth' });
    // Actualizar URL sin recargar
    history.pushState(null, '', `#${targetId}`);
  });
};

/* =====================================================
   15. CONTADOR DE LA COMUNIDAD — animación al entrar
   ===================================================== */
const initCommunityCounter = () => {
  const counterEl = $('#counterValue');
  if (!counterEl) return;

  const target = 11;
  counterEl.textContent = '0';

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounter(counterEl, 0, target, 2000);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(counterEl);
};

/* =====================================================
   16. EFECTO PARALLAX LIGERO en el Hero
   ===================================================== */
const initParallax = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // No en touch

  const heroContent = $('.hero__content');
  const towers      = $$('.tower');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroContent && y < window.innerHeight) {
          heroContent.style.transform = `translateY(${y * 0.2}px)`;
          heroContent.style.opacity   = `${1 - y / window.innerHeight * 1.2}`;
        }
        towers.forEach((t, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          t.style.transform = `scaleX(${dir === -1 ? -1 : 1}) translateY(${y * 0.08}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
};

/* =====================================================
   17. HOVER MAGNÉTICO en botones CTA
   ===================================================== */
const initMagneticButtons = () => {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  $$('.btn--primary, .btn--secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
};

/* =====================================================
   18. EFECTO GLITCH en el título SHADOWS (Easter Egg visual)
   ===================================================== */
const initTitleGlitch = () => {
  const shadowsEl = $('.hero__title-shadows');
  if (!shadowsEl) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Glitch aleatorio cada 6-15 segundos
  const scheduleGlitch = () => {
    const wait = 6000 + Math.random() * 9000;
    setTimeout(() => {
      shadowsEl.setAttribute('data-glitch', shadowsEl.textContent);
      shadowsEl.classList.add('glitch-active');
      setTimeout(() => {
        shadowsEl.classList.remove('glitch-active');
        scheduleGlitch();
      }, 600);
    }, wait);
  };

  scheduleGlitch();
};

/* =====================================================
   19. NAVEGACIÓN CON TECLADO en secciones
   ===================================================== */
const initKeyboardNav = () => {
  // Tab trap en el trailer overlay
  const overlay  = $('#trailerOverlay');
  if (!overlay) return;

  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || overlay.hidden) return;

    const focusable = $$('button, input, a, [tabindex]:not([tabindex="-1"])', overlay)
      .filter(el => !el.hidden && el.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
};

/* =====================================================
   20. INICIALIZACIÓN PRINCIPAL
   ===================================================== */
const init = () => {
  // Orden de inicialización
  initTheme();            // 1. Tema (primero, para evitar flash)
  initCursor();           // 2. Cursor
  initParticles();        // 3. Partículas
  initHeader();           // 4. Header / nav activa
  initMobileNav();        // 5. Menú hamburguesa
  initProtagonistName();  // 6. Personalizar nombre (DOM #2)
  initTrailer();          // 7. Trailer + Easter Egg (DOM #3, #4)
  initCharacters();       // 8. Galería de personajes (DOM #5)
  initSubscriptionForm(); // 9. Formulario (DOM #6)
  initCommunityCounter(); // 10. Contador animado
  initRevealAnimations(); // 11. Scroll reveal
  initScrollTop();        // 12. Volver arriba
  initSmoothScroll();     // 13. Smooth scroll
  initParallax();         // 14. Parallax hero
  initMagneticButtons();  // 15. Botones magnéticos
  initTitleGlitch();      // 16. Glitch en título
  initKeyboardNav();      // 17. Tab trap en modal

  console.log(
    '%c⚔ CAVES OF SHADOWS %c— Console del Desarrollador\n%cShadowForge Studios · 2025 · Trabajo Práctico Integrador',
    'color: #c9a227; font-size: 16px; font-weight: bold;',
    'color: #9b5de5; font-size: 14px;',
    'color: #6b5f52; font-size: 11px;'
  );
};

/* =====================================================
   ARRANQUE
   Espera a que el DOM esté listo
   ===================================================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM ya disponible
}

/* =====================================================
   FIN DEL ARCHIVO script.js
   Caves of Shadows — ShadowForge Studios 2025
   ===================================================== */
