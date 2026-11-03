/* =========================================================
   M. A. Trading Corporation Agencies Ltd. — site behaviour
   ========================================================= */

/* ---- Contact settings: change these in one place ---- */
const SITE = {
  whatsapp: '8801XXXXXXXXX',          // international format, digits only (no +)
  email: 'info@matrading-bd.com',
};

(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state + mobile bar ---------- */
  const header = $('.site-header');
  const mobileBar = $('.mobile-bar');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('is-scrolled', y > 8);
    mobileBar && mobileBar.classList.toggle('is-visible', y > 420);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  const burger = $('.burger');
  const drawer = $('#drawer');
  const setNav = (open) => {
    document.documentElement.classList.toggle('nav-open', open);
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { const first = $('a', drawer); first && first.focus({ preventScroll: true }); }
  };
  if (burger && drawer) {
    burger.addEventListener('click', () => setNav(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', drawer).forEach(a => a.addEventListener('click', () => setNav(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setNav(false); burger.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1000) setNav(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const to = parseFloat(el.dataset.count);
    const from = parseFloat(el.dataset.from || 0);
    if (reduceMotion) { el.textContent = to; return; }
    const dur = 1400; const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Process stepper (tabs with autoplay) ---------- */
  $$('[data-process]').forEach(root => {
    const tabs = $$('[role="tab"]', root);
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const DURATION = 6500;
    let idx = 0, t0 = 0, raf = 0, paused = false, visible = false, userTook = false;

    const select = (i, focus) => {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach((t, j) => {
        const on = j === idx;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        const prog = $('.prog', t); if (prog) prog.style.width = '0%';
      });
      if (focus) tabs[idx].focus();
      // keep active tab visible in horizontal scroller (mobile)
      const list = tabs[idx].closest('.process__tabs');
      if (list && list.scrollWidth > list.clientWidth) {
        const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
        const left = tabs[idx].getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - pad;
        list.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      t0 = performance.now();
    };
    const tick = (now) => {
      if (!paused && visible && !userTook) {
        const p = Math.min(1, (now - t0) / DURATION);
        const prog = $('.prog', tabs[idx]); if (prog) prog.style.width = (p * 100) + '%';
        if (p >= 1) select(idx + 1);
      } else { t0 = now - (parseFloat(($('.prog', tabs[idx]) || {}).style?.width || 0) / 100) * DURATION; }
      raf = requestAnimationFrame(tick);
    };
    const stopAuto = () => { userTook = true; $$('.prog', root).forEach(p => p.style.width = '0%'); };

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { stopAuto(); select(i); });
      t.addEventListener('keydown', e => {
        const k = e.key;
        if (['ArrowRight', 'ArrowDown'].includes(k)) { e.preventDefault(); stopAuto(); select(idx + 1, true); }
        if (['ArrowLeft', 'ArrowUp'].includes(k)) { e.preventDefault(); stopAuto(); select(idx - 1, true); }
        if (k === 'Home') { e.preventDefault(); stopAuto(); select(0, true); }
        if (k === 'End') { e.preventDefault(); stopAuto(); select(tabs.length - 1, true); }
      });
    });
    $$('[data-step-next]', root).forEach(b => b.addEventListener('click', () => { stopAuto(); select(idx + 1); }));
    $$('[data-step-prev]', root).forEach(b => b.addEventListener('click', () => { stopAuto(); select(idx - 1); }));
    root.addEventListener('mouseenter', () => paused = true);
    root.addEventListener('mouseleave', () => paused = false);
    root.addEventListener('focusin', () => paused = true);
    root.addEventListener('focusout', () => paused = false);

    if (!reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), { threshold: 0.35 }).observe(root);
      select(0); raf = requestAnimationFrame(tick);
    }
  });

  /* ---------- Document checklist tool ---------- */
  const DOCS = {
    import: {
      base: [
        ['Commercial invoice', 'Signed by the supplier, showing value, quantity and Incoterms (FOB / CFR / CIF).'],
        ['Packing list', 'Marks, numbers, weights and contents of every package.'],
        ['LC / LCAF copy', 'Letter of credit or import authorisation from your bank.'],
        ['IRC', 'Import Registration Certificate of the importer.'],
        ['e-TIN & BIN', 'Tax ID and VAT Business Identification Number.'],
        ['Insurance cover note', 'Marine / transit insurance for the consignment.'],
        ['Authorisation letter', 'Your letter appointing us as C&F agent for this shipment.'],
      ],
      mode: {
        sea: [['Bill of Lading (B/L)', 'Original or telex-released B/L from the shipping line.'], ['Delivery Order (DO)', 'Issued by the shipping line’s local agent — we collect it.']],
        air: [['Air Waybill (AWB)', 'Master / house AWB from the airline or air forwarder.'], ['Airline Delivery Order', 'From the airline’s cargo agent — we collect it.']],
        land: [['Truck receipt / challan', 'Carrier’s transport document from the land port.'], ['Land port manifest', 'Filed by the carrier at the border station.']],
      },
      extra: {
        general: [['Certificate of origin', 'Needed when claiming preferential duty under a trade agreement.']],
        garments: [['Bond licence', 'For bonded-warehouse imports by export-oriented units.'], ['UD (Utilization Declaration)', 'Issued through BGMEA / BKMEA for raw materials.']],
        machinery: [['Capital machinery papers', 'Supporting documents to claim concessionary duty, where eligible.'], ['Technical catalogue', 'Specifications to support the HS classification.']],
        food: [['Health / phytosanitary certificate', 'From the exporting country’s authority for food and plant products.'], ['Radiation test report', 'Required for certain food items — we arrange sampling at the port.']],
        chemical: [['MSDS / SDS', 'Safety data sheet for each chemical product.'], ['Import permit', 'From the relevant authority for controlled or hazardous chemicals.']],
      },
    },
    export: {
      base: [
        ['Commercial invoice', 'Value, quantity and Incoterms agreed with the buyer.'],
        ['Packing list', 'Carton-wise contents, weights and measurements.'],
        ['EXP form', 'Export permit form issued through your bank.'],
        ['ERC', 'Export Registration Certificate of the exporter.'],
        ['Export LC / sales contract', 'The LC or firm contract with the buyer.'],
        ['Authorisation letter', 'Your letter appointing us as C&F agent for this shipment.'],
      ],
      mode: {
        sea: [['Booking / shipping order', 'Space confirmation from the shipping line or forwarder.'], ['Bill of Export', 'Prepared and lodged by us on ASYCUDA World.']],
        air: [['Airline booking', 'Confirmed space with the airline or air forwarder.'], ['Bill of Export', 'Prepared and lodged by us on ASYCUDA World.']],
        land: [['Bill of Export', 'Prepared and lodged by us on ASYCUDA World.'], ['Transport challan', 'Truck and driver details for the border crossing.']],
      },
      extra: {
        general: [['Certificate of origin', 'From EPB or a chamber of commerce, if the buyer requires it.']],
        garments: [['UD / UP', 'Utilization Declaration / Permission from BGMEA or BKMEA.'], ['GSP / REX origin proof', 'For preferential duty in the EU and other markets.']],
        machinery: [['Re-export papers', 'If the machinery was originally imported temporarily.']],
        food: [['Phytosanitary / health certificate', 'From the Plant Quarantine Wing or relevant authority.']],
        chemical: [['MSDS & DG declaration', 'Dangerous-goods declaration for hazardous cargo.']],
      },
    },
  };
  const LABELS = { import: 'Import', export: 'Export', sea: 'Sea', air: 'Air', land: 'Land', general: 'General cargo', garments: 'Garments & textiles', machinery: 'Machinery', food: 'Food & agro', chemical: 'Chemicals' };

  $$('[data-checklist]').forEach(root => {
    const list = $('[data-cl-list]', root);
    const title = $('[data-cl-title]', root);
    const count = $('[data-cl-count]', root);
    const send = $('[data-cl-send]', root);
    const val = (n) => ($(`input[name="${n}"]:checked`, root) || {}).value;
    let current = [];
    const render = () => {
      const d = val('dir'), m = val('mode'), c = val('cargo');
      const set = DOCS[d];
      const items = [
        ...set.base.map(x => [...x, false]),
        ...set.mode[m].map(x => [...x, false]),
        ...(set.extra[c] || []).map(x => [...x, true]),
      ];
      current = items;
      title.textContent = `${LABELS[d]} · ${LABELS[m]} · ${LABELS[c]}`;
      count.textContent = `${items.length} documents`;
      list.innerHTML = '';
      items.forEach(([name, note, extra], i) => {
        const li = document.createElement('li');
        if (extra) li.className = 'is-extra';
        li.style.animationDelay = (i * 0.03) + 's';
        const wrap = document.createElement('div');
        const s = document.createElement('strong'); s.textContent = name;
        const sm = document.createElement('small'); sm.textContent = note;
        wrap.append(s, sm); li.append(wrap); list.append(li);
      });
      const text = `Hello M. A. Trading, I have an upcoming shipment (${title.textContent}). Please confirm the documents I need:\n` +
        current.map(([n], i) => `${i + 1}. ${n}`).join('\n');
      send.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
      send.target = '_blank'; send.rel = 'noopener';
    };
    root.addEventListener('change', render);
    render();
  });

  /* ---------- Quote form ---------- */
  const form = $('[data-quote-form]');
  if (form) {
    // Prefill service from ?service=
    const params = new URLSearchParams(location.search);
    const svc = params.get('service');
    if (svc && form.service) {
      const map = { transport: 'transport', import: 'import', export: 'export', air: 'air', docs: 'docs', port: 'port', door: 'door' };
      if (map[svc]) form.service.value = map[svc];
    }
    const fieldOf = (input) => input.closest('.field');
    const validators = {
      name: v => v.trim().length >= 2,
      phone: v => /^[+()\d\s-]{8,}$/.test(v.trim()),
      email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      service: v => !!v,
      cargo: v => v.trim().length >= 3,
    };
    const check = (input) => {
      const fn = validators[input.name];
      if (!fn) return true;
      const ok = fn(input.value);
      fieldOf(input).classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    Object.keys(validators).forEach(n => {
      const el = form.elements[n];
      if (el) el.addEventListener('blur', () => { if (el.value) check(el); });
      if (el) el.addEventListener('input', () => { if (fieldOf(el).classList.contains('has-error')) check(el); });
    });
    let via = 'wa';
    $$('button[type="submit"]', form).forEach(b => b.addEventListener('click', () => { via = b.value; }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.submitter && e.submitter.value) via = e.submitter.value;
      const bad = Object.keys(validators).map(n => form.elements[n]).filter(el => el && !check(el));
      if (bad.length) { bad[0].focus(); return; }
      const f = (n) => (form.elements[n] && form.elements[n].value || '').trim();
      const svcText = form.service.options[form.service.selectedIndex].text;
      const lines = [
        'New enquiry from the website',
        `Name: ${f('name')}`,
        f('company') && `Company: ${f('company')}`,
        `Phone: ${f('phone')}`,
        f('email') && `Email: ${f('email')}`,
        `Service: ${svcText}`,
        `Port / station: ${f('port')}`,
        `Cargo: ${f('cargo')}`,
        f('eta') && `Expected arrival: ${f('eta')}`,
        f('bl') && `B/L / AWB: ${f('bl')}`,
        f('message') && `Notes: ${f('message')}`,
      ].filter(Boolean).join('\n');
      if (via === 'email') {
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Quote request — ' + svcText)}&body=${encodeURIComponent(lines)}`;
      } else {
        window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener');
      }
      const ok = $('[data-form-success]', form);
      if (ok) ok.classList.add('is-visible');
    });
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
