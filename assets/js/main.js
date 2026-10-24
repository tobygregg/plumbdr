/* ============================================================
   The Plumb Doctor — site behaviour
   Sections: header · mobile menu · hero patient · rhyme drips
             symptom checker · check-up ticks · gallery + lightbox
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
  let timers = [];
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
  const runCheckUp = () => {
    timers.forEach(clearTimeout);
    timers = [];
    if (reduceMotion) { setState('healthy'); tempVal.textContent = '68°C'; return; }
    setState('poorly');
    tempVal.textContent = '12°C';
    timers.push(setTimeout(() => setState('treating'), 2600));
    timers.push(setTimeout(() => { setState('healthy'); countTemp(12, 68, 1400); }, 4900));
  };
  runCheckUp();
  $('#replay')?.addEventListener('click', runCheckUp);

  /* ---------- "In view" helper (runs once per element) ---------- */
  const onceInView = (el, cb, threshold = 0.5) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { cb(); io.disconnect(); }
    }, { threshold });
    io.observe(el);
  };
  onceInView($('#rhyme'), () => $('#rhyme').classList.add('is-dripping'));
  onceInView($('#chart'), () => $('#chart').classList.add('is-ticked'), 0.35);

  /* ============================================================
     SYMPTOM CHECKER
     EDIT: one entry per button in the SYMPTOM CHECKER section.
     "book" must match an option in the form's "What's the problem?" list.
     ============================================================ */
  const SYMPTOMS = {
    'no-heat': {
      complaint: 'No heating or hot water',
      diagnosis: 'The boiler has gone into lockout, the controls are playing up, or the oil tank has run dry.',
      aid: [
        'Check the programmer is on and the thermostat is turned up.',
        "Check the oil tank gauge. An empty tank is more common than you'd think.",
        "If there's a lockout light, press reset once. If it locks out again, leave it and call us. Repeated resets can make things worse.",
      ],
      treatment: 'A breakdown visit to find the fault and fix it.',
      book: 'No heating or hot water',
    },
    'cold-top': {
      complaint: 'Radiators cold at the top',
      diagnosis: 'Air trapped in the radiator.',
      aid: [
        'Turn the heating off and let the radiators cool.',
        'Open the bleed valve with a radiator key until water comes out, then close it.',
        'If your boiler has a pressure gauge, check it afterwards. Most sealed systems sit around 1 to 1.5 bar when cold.',
      ],
      treatment: "If it keeps coming back, there may be a leak or a pump problem. We'll track it down.",
      book: 'Radiators cold at the top',
    },
    'cold-bottom': {
      complaint: 'Radiators cold at the bottom',
      diagnosis: 'Sludge has built up inside and is blocking the flow.',
      aid: ['Not one for DIY, sorry. The sludge needs flushing out of the whole system.'],
      treatment: 'A system flush, plus a magnetic filter to stop it coming back.',
      book: 'Radiators cold at the bottom',
    },
    noise: {
      complaint: 'Banging, gurgling or kettling',
      diagnosis: 'Air in the system, sludge or limescale in the boiler, or a tired pump.',
      aid: ['Bleeding the radiators often cures gurgling caused by air.', 'Make a note of when it happens: heating on, hot water on, or both.'],
      treatment: 'A proper look, then a flush, descale or new pump, whatever the cause is.',
      book: 'Banging, gurgling or kettling',
    },
    pressure: {
      complaint: 'Pressure keeps dropping',
      diagnosis: 'A small leak somewhere, or an expansion vessel that has lost its charge.',
      aid: ['Look around radiator valves and any pipework you can see for damp spots or drips.', 'Note how quickly it drops. It helps with the diagnosis.'],
      treatment: 'Find and fix the leak, or recharge or replace the expansion vessel.',
      book: 'Pressure keeps dropping',
    },
    drip: {
      complaint: 'Dripping tap',
      diagnosis: 'A worn washer or cartridge.',
      aid: ['Turn off the isolation valve on the pipe under the sink (a quarter turn with a flat screwdriver) to stop the drip for now.'],
      treatment: "A new washer or cartridge, or a new tap if it's past saving.",
      book: 'Dripping tap',
    },
    leak: {
      complaint: 'Leak or burst pipe',
      diagnosis: 'This one needs sorting today.',
      aid: [
        'Turn the water off at the stopcock. It is often under the kitchen sink.',
        'Switch the heating and boiler off.',
        "Keep away from electrics near the water. If water is getting into sockets or lights, turn the electricity off at the fuse box if it's safe to reach.",
        'Catch what you can with buckets and towels.',
      ],
      treatment: 'Ring us now on 07839 100911.',
      book: 'Leak or burst pipe',
      urgent: true,
    },
    service: {
      complaint: 'Not serviced this year',
      diagnosis: 'Overdue for its annual check-up.',
      aid: ['Nothing to do but book in.'],
      treatment: 'An annual boiler service.',
      book: 'Annual boiler service',
    },
    fumes: {
      complaint: 'Smell of fumes, or the CO alarm is going off',
      diagnosis: 'Possible carbon monoxide or a flue problem. Treat it as an emergency.',
      aid: [
        'Turn the appliance off if you can do it straight away.',
        'Open doors and windows.',
        'Get everyone out into fresh air.',
        'If anyone has a headache, dizziness, sickness or breathlessness, call 999.',
        "Don't use the appliance again until it has been checked.",
      ],
      treatment: "Once everyone's safe, call us to inspect it before it's used again.",
      book: 'Something else',
      emergency: true,
    },
  };

  const chips = $$('[data-symptom]');
  const rx = {
    head: $('#rx-head'), body: $('#rx-body'), complaint: $('#rx-complaint'), diagnosis: $('#rx-diagnosis'),
    aidLabel: $('#rx-aid-label'), aid: $('#rx-aid'), treatment: $('#rx-treatment'), book: $('#rx-book'),
  };
  const bullet = (emergency) =>
    `<svg class="mt-[3px] h-[18px] w-[18px] shrink-0 ${emergency ? 'text-coral-dark' : 'text-pulse-dark'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;

  const showSymptom = (id, animate = true) => {
    const s = SYMPTOMS[id];
    if (!s) return;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.symptom === id)));
    rx.complaint.textContent = s.complaint;
    rx.diagnosis.textContent = s.diagnosis;
    rx.aidLabel.textContent = s.emergency ? 'Do this now' : 'First aid you can try now';
    rx.aid.innerHTML = s.aid.map((a) => `<li class="flex gap-2.5">${bullet(s.emergency)}<span></span></li>`).join('');
    $$('li span', rx.aid).forEach((span, i) => { span.textContent = s.aid[i]; });
    rx.treatment.textContent = s.treatment;
    rx.head.classList.toggle('bg-navy', !s.emergency && !s.urgent);
    rx.head.classList.toggle('bg-coral-dark', !!s.emergency);
    rx.head.classList.toggle('bg-navy-600', !!s.urgent);
    if (s.emergency || s.urgent) {
      rx.book.textContent = 'Call 07839 100911';
      rx.book.href = 'tel:+447839100911';
      rx.book.removeAttribute('data-book');
    } else {
      rx.book.textContent = 'Book this treatment';
      rx.book.href = '#contact';
      rx.book.dataset.book = s.book;
    }
    if (animate && !reduceMotion) {
      rx.body.classList.remove('rx-enter');
      void rx.body.offsetWidth;
      rx.body.classList.add('rx-enter');
    }
  };
  chips.forEach((c) => c.addEventListener('click', () => showSymptom(c.dataset.symptom)));
  showSymptom('no-heat', false);

  /* ---------- Any "book" link pre-fills the form's problem dropdown ---------- */
  const problem = $('#problem');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-book]');
    if (!link || !problem) return;
    const want = link.dataset.book;
    const opt = [...problem.options].find((o) => o.text === want);
    if (opt) problem.value = opt.value || opt.text;
  });

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
      setStatus("Add your name, phone number, what the problem is and a few words about it, then send again.");
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
