// Zgoda na cookies + mapy Google ładowane dopiero po zgodzie
(() => {
  const KEY = 'limarCookieConsent';
  const cssHref = (document.querySelector('link[rel=stylesheet][href*="style.css"]') || {}).getAttribute?.('href') || 'css/style.css';
  const prefix = cssHref.startsWith('../') ? '../' : '';
  const maps = [...document.querySelectorAll('iframe.map-frame[data-src]')];

  const loadMaps = () => maps.forEach(f => {
    if (!f.src) f.src = f.dataset.src;
    const ph = f.previousElementSibling;
    if (ph && ph.classList.contains('map-placeholder')) ph.remove();
    f.style.display = '';
  });

  const addPlaceholders = () => maps.forEach(f => {
    f.style.display = 'none';
    const ph = document.createElement('div');
    ph.className = 'map-placeholder';
    ph.innerHTML = `<p>Mapa Google załaduje się po Twojej zgodzie — Google może wtedy zapisać własne pliki cookies.</p>
      <button class="btn btn-primary" type="button">Załaduj mapę</button>`;
    ph.querySelector('button').addEventListener('click', () => {
      f.src = f.dataset.src;
      f.style.display = '';
      ph.remove();
    });
    f.parentNode.insertBefore(ph, f);
  });

  const consent = localStorage.getItem(KEY);
  if (consent === 'all') {
    loadMaps();
  } else if (consent === 'necessary') {
    addPlaceholders();
  } else {
    addPlaceholders();
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Ustawienia prywatności');
    banner.innerHTML = `
      <h2>🍪 Prywatność i cookies</h2>
      <p>Ta strona nie śledzi użytkowników. Jedyne cookies pochodzą z map Google z dojazdem —
      załadujemy je tylko za Twoją zgodą. Szczegóły w <a href="${prefix}polityka-prywatnosci/">polityce prywatności</a>.</p>
      <div class="cookie-actions">
        <button class="btn btn-primary" type="button" data-consent="all">Akceptuję</button>
        <button class="btn btn-outline" type="button" data-consent="necessary">Tylko niezbędne</button>
      </div>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('show'), 80);
    banner.querySelectorAll('[data-consent]').forEach(b => b.addEventListener('click', () => {
      localStorage.setItem(KEY, b.dataset.consent);
      if (b.dataset.consent === 'all') loadMaps();
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
    }));
  }
})();

// Nawigacja mobilna
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  const setNav = open => {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.classList.toggle('nav-locked', open);
  };
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));
}

// Delikatne pojawianie się elementów przy przewijaniu
const revealTargets = document.querySelectorAll(
  '.card, .feature, .review, .score, .split > *, .gallery-grid a, .contact-card, .price-table, .faq details'
);
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .1, rootMargin: '0px 0px -5% 0px' });
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });
  // Bezpiecznik: gdyby observer nie zadziałał, po 4 s pokaż wszystko
  setTimeout(() => revealTargets.forEach(el => el.classList.add('in')), 4000);
}

// Lightbox galerii
const galleryLinks = [...document.querySelectorAll('.gallery-grid a')];
if (galleryLinks.length) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Zamknij">×</button>
    <button class="lb-prev" aria-label="Poprzednie">‹</button>
    <img alt="Podgląd zdjęcia">
    <button class="lb-next" aria-label="Następne">›</button>`;
  document.body.appendChild(lb);

  const img = lb.querySelector('img');
  let current = 0;

  const show = i => {
    current = (i + galleryLinks.length) % galleryLinks.length;
    img.src = galleryLinks[current].href;
    lb.classList.add('open');
  };
  const close = () => lb.classList.remove('open');

  galleryLinks.forEach((a, i) =>
    a.addEventListener('click', e => { e.preventDefault(); show(i); })
  );
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}
