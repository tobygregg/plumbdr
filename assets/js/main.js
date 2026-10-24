/* ============================================================
   The Plumb Doctor — site behaviour
   Sections: header · mobile menu · hero patient · treatments tabs
             check-up ticks · gallery + lightbox
             booking form · mobile call bar
   ============================================================ */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: goes solid once you scroll ---------- */
  const header = $('#site-header');
  const onScrollHeader = () => {
    const solid = window.scrollY > 24;
    header.classList.toggle('bg-scrubs/90', solid);
    header.classList.toggle('backdrop-blur-md', solid);
    header.classList.toggle('shadow-[0_8px_24px_-16px_rgba(7,53,86,.5)]', solid);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menu-btn');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('#mb-top').style.transform = open ? 'rotate(45deg)' : '';
    $('#mb-bot').style.transform = open ? 'rotate(-45deg)' : '';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Hero patient: poorly → treating → healthy ---------- */
  const patient = $('#patient');
  const tempVal = $('#temp-val');
  let tempRaf = 0;

  const setState = (state) => {
    patient.classList.remove('is-poorly', 'is-treating', 'is-healthy');
    patient.classList.add(`is-${state}`);
  };
  const countTemp = (from, to, ms) => {
    cancelAnimationFrame(tempRaf);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      tempVal.textContent = `${Math.round(from + (to - from) * eased)}°C`;
      if (t < 1) tempRaf = requestAnimationFrame(step);
    };
    tempRaf = requestAnimationFrame(step);
  };
  // One loop: poorly (3s) → treating (2.4s) → healthy (7s) → eases back to poorly and repeats.
  // Every state change is a cross-fade in the CSS, so the reset is smooth rather than a jump.
  const LOOP = { poorly: 3000, treating: 2400, healthy: 7000 };
  let loopTimer = 0;
  const runLoop = () => {
    setState('poorly');
    loopTimer = setTimeout(() => {
      setState('treating');
      loopTimer = setTimeout(() => {
        setState('healthy');
        countTemp(12, 68, 1400);
        loopTimer = setTimeout(() => {
          countTemp(68, 12, 1100);
          runLoop();
        }, LOOP.healthy);
      }, LOOP.treating);
    }, LOOP.poorly);
  };
  if (reduceMotion) {
    setState('healthy');
    tempVal.textContent = '68°C';
  } else {
    tempVal.textContent = '12°C';
    runLoop();
  }

  /* ---------- "In view" helper (runs once per element) ---------- */
  const onceInView = (el, cb, threshold = 0.5) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { cb(); io.disconnect(); }
    }, { threshold });
    io.observe(el);
  };
  onceInView($('#chart'), () => $('#chart').classList.add('is-ticked'), 0.35);

  /* ---------- Treatments: tabs swap the prescription pad ---------- */
  const tabs = $$('#rx-tabs [role="tab"]');
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on && !reduceMotion) {
        panel.classList.remove('rx-enter');
        void panel.offsetWidth;
        panel.classList.add('rx-enter');
      }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- Any "book" link pre-fills the form's "What do you need?" dropdown ---------- */
  const problem = $('#problem');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-book]');
    if (!link || !problem) return;
    const want = link.dataset.book;
    const opt = [...problem.options].find((o) => o.text === want);
    if (opt) problem.value = opt.value || opt.text;
  });

  /* ---------- Case notes slider (native swipe + arrows + dots) ---------- */
  const track = $('#cases');
  const slides = $$('.case-slide', track);
  const dotsWrap = $('#case-dots');
  const prevBtns = $$('.case-prev');
  const nextBtns = $$('.case-next');
  $$('.case-count', track).forEach((el, i) => { el.textContent = `Case ${i + 1} of ${slides.length}`; });
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'h-3 w-3 rounded-full bg-navy/20 transition-all duration-300';
    d.setAttribute('aria-label', `Show case ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = $$('button', dotsWrap);
  let active = 0;
  const goTo = (i) => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, i))];
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const syncSlider = () => {
    const x = track.scrollLeft;
    let best = 0;
    slides.forEach((s, i) => {
      if (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x)) best = i;
    });
    active = best;
    dots.forEach((d, i) => {
      const on = i === active;
      d.classList.toggle('bg-navy', on);
      d.classList.toggle('w-8', on);
      d.classList.toggle('bg-navy/20', !on);
      d.setAttribute('aria-current', on ? 'true' : 'false');
    });
    prevBtns.forEach((b) => { b.disabled = active === 0; });
    nextBtns.forEach((b) => { b.disabled = active === slides.length - 1; });
  };
  let syncRaf = 0;
  track.addEventListener('scroll', () => { cancelAnimationFrame(syncRaf); syncRaf = requestAnimationFrame(syncSlider); }, { passive: true });
  window.addEventListener('resize', syncSlider);
  prevBtns.forEach((b) => b.addEventListener('click', () => goTo(active - 1)));
  nextBtns.forEach((b) => b.addEventListener('click', () => goTo(active + 1)));
  syncSlider();

  /* ---------- Gallery lightbox ---------- */
  const cases = $$('.case');
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-cap');
  let current = 0;
  let lastFocus = null;
  const show = (i) => {
    current = (i + cases.length) % cases.length;
    const c = cases[current];
    lbImg.src = c.dataset.full;
    lbImg.alt = $('img', c).alt;
    lbCap.textContent = c.dataset.caption;
  };
  const openLb = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lb-close').focus();
  };
  const closeLb = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };
  cases.forEach((c, i) => c.addEventListener('click', () => openLb(i)));
  $('#lb-close').addEventListener('click', closeLb);
  $('#lb-prev').addEventListener('click', () => show(current - 1));
  $('#lb-next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // swipe on phones
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Mobile call bar: appears once you're past the hero ---------- */
  const callBar = $('#call-bar');
  const hero = $('#top');
  const contact = $('#contact');
  if (callBar && 'IntersectionObserver' in window) {
    let pastHero = false;
    let atContact = false;
    const update = () => callBar.classList.toggle('is-shown', pastHero && !atContact);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(([e]) => { atContact = e.isIntersecting; update(); }, { threshold: 0.2 }).observe(contact);
  }

  /* ---------- Booking form (FormSubmit AJAX) ---------- */
  const form = $('#book-form');
  const status = $('#form-status');
  const done = $('#form-done');
  const setStatus = (msg) => {
    status.textContent = msg;
    status.className = 'mt-5 rounded-xl bg-coral/10 px-4 py-3 text-[15px] font-semibold text-coral-dark';
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Add your name, phone number, what you need and a few words about the job, then send again.");
      return;
    }
    const btn = $('button[type=submit]', form);
    const label = $('.btn-label', btn);
    btn.disabled = true;
    label.textContent = 'Sending…';
    try {
      const endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === 'false') throw new Error(json.message || 'Send failed');
      form.classList.add('hidden');
      done.classList.remove('hidden');
      done.focus();
    } catch (err) {
      setStatus("That didn't send. Check your connection and try again, or call 07839 100911.");
      btn.disabled = false;
      label.textContent = 'Send to The Plumb Doctor';
    }
  });
})();
