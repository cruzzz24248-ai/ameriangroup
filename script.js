(() => {
  /* ============ CONFIGURACIÓN: editá solo esto ============ */
  const CONFIG = {
    whatsapp: '5493511234567',            // solo números, con código de país
    whatsappLabel: '+54 9 351 123 4567',  // cómo se muestra
    email: 'hola@amerian.group',
    instagram: 'amerian.group',
    // Logos de clientes. Si "logo" queda vacío se muestra el nombre en texto.
    // Cada { name: '', logo: '' } es un lugar vacío. Completá logo (ruta de la imagen) o name (texto).
    // Los logos se muestran con sus colores originales, sin cambios por modo claro/oscuro.
    clientes: [
      { inline: 'amby-house' },   // logo en SVG (ver logos.js): letras negras pasan a blanco en modo oscuro
      { name: 'Pintegral', logo: 'img/logos/pintegral.png' }, { name: '', logo: '' }, { name: '', logo: '' },
      { name: '', logo: '' }, { name: '', logo: '' }, { name: '', logo: '' }, { name: '', logo: '' }
    ]
  };
  /* ========================================================= */

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
                  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  const STR = {
    es: { menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', toDark: 'Cambiar a modo oscuro', toLight: 'Cambiar a modo claro',
          fill: 'Completá los campos marcados para poder enviar.', opening: 'Abriendo WhatsApp…',
          msg: (n, e, m) => `Hola Amerian, soy ${n} (${e}). ${m}` },
    en: { menuOpen: 'Open menu', menuClose: 'Close menu', toDark: 'Switch to dark mode', toLight: 'Switch to light mode',
          fill: 'Please complete the highlighted fields.', opening: 'Opening WhatsApp…',
          msg: (n, e, m) => `Hi Amerian, I'm ${n} (${e}). ${m}` }
  };

  // Datos de contacto y clientes
  $$('[data-wa]').forEach(a => a.href = `https://wa.me/${CONFIG.whatsapp}`);
  $$('[data-wa-label]').forEach(s => s.textContent = CONFIG.whatsappLabel);
  $$('[data-mail]').forEach(a => { a.href = `mailto:${CONFIG.email}`; a.textContent = CONFIG.email; });
  $$('[data-ig]').forEach(a => { a.href = `https://instagram.com/${CONFIG.instagram}`; a.textContent = `Instagram @${CONFIG.instagram}`; });
  const logos = CONFIG.clientes.map(c => `<span class="lg${c.logo || c.name || c.inline ? '' : ' slot'}">${c.inline && window.LOGOS && window.LOGOS[c.inline] ? window.LOGOS[c.inline] : c.logo ? `<img src="${c.logo}" alt="${c.name}" loading="lazy">` : (c.name || '')}</span>`).join('');
  $('#clients').innerHTML = `<div>${logos}${logos}</div>`;

  /* ---------- Idioma (automático por navegador, manual con ES/EN) ---------- */
  $$('[data-i18n]').forEach(el => el.dataset.es = el.innerHTML);
  const desc = $('meta[name=description]'), esDesc = desc.content;
  let lang = root.lang === 'en' ? 'en' : 'es';
  /* ---------- Títulos: cada palabra sube al aparecer ---------- */
  function splitHeadings() {
    if (reduce) return;
    $$('h2').forEach(h2 => {
      let i = 0;
      (function walk(node) {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const f = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(t => {
              if (!t) return;
              if (/^\s+$/.test(t)) { f.append(t); return; }
              const w = document.createElement('span'), s = document.createElement('span');
              w.className = 'w'; s.textContent = t; s.style.setProperty('--i', i++); w.append(s); f.append(w);
            });
            n.replaceWith(f);
          } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
        });
      })(h2);
    });
  }

  const setLang = (l, save) => {
    lang = l; root.lang = l; if (save) store.set('lang', l);
    $$('[data-i18n]').forEach(el => { el.innerHTML = l === 'en' ? (window.EN[el.dataset.i18n] ?? el.dataset.es) : el.dataset.es; });
    desc.content = l === 'en' ? window.EN.desc : esDesc;
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
    syncLabels(); splitHeadings(); requestAnimationFrame(updateInd);
  };
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang, true)));

  /* ---------- Tema (sigue al sistema hasta que alguien lo toca) ---------- */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const setTheme = (t, save) => { root.dataset.theme = t; if (save) store.set('theme', t); syncLabels(); };
  mq.addEventListener('change', e => { if (!store.get('theme')) setTheme(e.matches ? 'dark' : 'light'); });
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true)));

  const btn = $('#menuBtn'), ov = $('#overlay'), nav = $('#nav');
  function syncLabels() {
    const s = STR[lang], open = ov.classList.contains('open');
    const txt = root.dataset.theme === 'dark' ? s.toLight : s.toDark;
    $$('[data-theme-toggle]').forEach(b => b.setAttribute('aria-label', txt));
    $$('[data-theme-label]').forEach(l => l.textContent = txt);
    btn.setAttribute('aria-label', open ? s.menuClose : s.menuOpen);
  }

  /* ---------- Menú ---------- */
  const setMenu = open => {
    ov.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('lock', open);
    btn.setAttribute('aria-expanded', open);
    ov.setAttribute('aria-hidden', !open);
    ov.toggleAttribute('inert', !open);
    syncLabels();
  };
  btn.addEventListener('click', () => setMenu(!ov.classList.contains('open')));
  ov.addEventListener('click', e => (e.target === ov || e.target.closest('a')) && setMenu(false));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  matchMedia('(min-width:901px)').addEventListener('change', e => e.matches && setMenu(false));

  /* ---------- Scroll: nav, progreso, botón flotante ---------- */
  const bar = $('#progress'), wa = $('#waFloat');
  const onScroll = () => {
    nav.classList.toggle('stuck', scrollY > 20);
    const max = root.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? scrollY / max : 0);
    wa.classList.toggle('show', scrollY > 700);
  };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Acordeón ---------- */
  $$('.acc button').forEach(b => b.addEventListener('click', () => {
    const li = b.parentElement, open = !li.classList.contains('open');
    $$('.acc li').forEach(l => { l.classList.remove('open'); l.firstElementChild.setAttribute('aria-expanded', false); });
    li.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
  }));

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Hero: el punto sigue al cursor + inclinación 3D ---------- */
  const art = $('#art'), dot = $('#dot'), hbg = $('.hero-bg');
  if (art && !reduce && fine) {
    let nx = 0, ny = 0, x = 0, y = 0;
    addEventListener('pointermove', e => { nx = e.clientX / innerWidth - .5; ny = e.clientY / innerHeight - .5; });
    (function loop() {
      x += (nx - x) * .08; y += (ny - y) * .08;
      dot.setAttribute('transform', `translate(${(x * 220).toFixed(1)} ${(y * 220).toFixed(1)})`);
      hbg.style.setProperty('--px', (x * 2).toFixed(3)); hbg.style.setProperty('--py', (y * 2).toFixed(3));
      const sy = Math.min(scrollY, innerHeight) * .05;
      art.style.transform = `translateY(${sy.toFixed(1)}px) perspective(1100px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Formulario -> WhatsApp ---------- */
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form)); let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) { note.textContent = STR[lang].fill; return; }
    note.textContent = STR[lang].opening;
    open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(STR[lang].msg(d.nombre, d.email, d.mensaje))}`, '_blank');
    form.reset();
  });

  /* ---------- Sección activa en el nav ---------- */
  const ind = $('.ind'), linkEls = $$('.links a');
  let activeId = null;
  function updateInd() {
    const a = linkEls.find(l => l.getAttribute('href') === '#' + activeId);
    linkEls.forEach(l => l.classList.toggle('active', l === a));
    if (!a) { ind.style.opacity = 0; return; }
    ind.style.setProperty('--x', a.offsetLeft + 'px'); ind.style.setProperty('--w', a.offsetWidth + 'px'); ind.style.opacity = 1;
  }
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { activeId = e.target.id; updateInd(); } }),
    { rootMargin: '-45% 0px -54% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
  addEventListener('resize', updateInd);
  document.fonts && document.fonts.ready.then(updateInd);

  /* ---------- Aparición escalonada y contadores ---------- */
  $$('[data-stagger]').forEach(p => [...p.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const n = +e.target.dataset.count, t0 = performance.now();
    (function f(t) { const p = Math.min((t - t0) / 1100, 1); e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .6 });
  $$('[data-count]').forEach(n => { if (!reduce) { n.textContent = '0'; co.observe(n); } });

  /* ---------- Solo con mouse: cursor, botones imán, foco de luz ---------- */
  if (fine && !reduce) {
    const cur = document.createElement('div'); cur.className = 'cursor'; document.body.append(cur);
    let px = -100, py = -100, cx = px, cy = py, s = 1, ts = 1;
    addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY; cur.classList.add('on');
      const hit = e.target.closest('a,button,summary,input,textarea,label');
      ts = hit ? 1.9 : 1; cur.classList.toggle('big', !!hit);
      const t = e.target.closest('.card,blockquote,form');
      if (t) { const r = t.getBoundingClientRect(); t.style.setProperty('--sx', e.clientX - r.left + 'px'); t.style.setProperty('--sy', e.clientY - r.top + 'px'); }
    });
    root.addEventListener('mouseleave', () => cur.classList.remove('on'));
    (function loop() {
      cx += (px - cx) * .2; cy += (py - cy) * .2; s += (ts - s) * .2;
      cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${s.toFixed(3)})`;
      requestAnimationFrame(loop);
    })();
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
        b.style.setProperty('--tx', (e.clientX - r.left - r.width / 2) * .22 + 'px'); b.style.setProperty('--ty', (e.clientY - r.top - r.height / 2) * .3 + 'px'); });
      b.addEventListener('pointerleave', () => { b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); });
    });
  }

  /* ---------- Intro con el logo (una vez por sesión) ---------- */
  const intro = $('#intro');
  let seen = null; try { seen = sessionStorage.getItem('intro'); } catch (e) {}
  if (!intro || seen || reduce) { intro && intro.remove(); root.classList.add('ready'); }
  else {
    try { sessionStorage.setItem('intro', '1'); } catch (e) {}
    setTimeout(() => { intro.classList.add('out'); root.classList.add('ready'); }, 1500);
    setTimeout(() => intro.remove(), 2600);
  }

  setLang(lang, false);
  setTheme(root.dataset.theme || (mq.matches ? 'dark' : 'light'), false);
})();
