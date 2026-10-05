/* Susegad — small, dependency-free enhancements.
   Everything here is progressive: the page reads fine without it. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------
     Opening hours, computed in Brooklyn time (America/New_York)
     ------------------------------------------------------------------ */
  const HOURS = { open: 7 * 60, close: 18 * 60, closedDay: 1 }; // minutes; Monday closed
  const TIME_ZONE = 'America/New_York';
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function goaNow(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type).value;
    return {
      day: WEEKDAY_INDEX[get('weekday')],
      minutes: Number(get('hour')) * 60 + Number(get('minute')),
      iso: `${get('year')}-${get('month')}-${get('day')}`,
    };
  }

  function openingStatus(now) {
    const openToday = now.day !== HOURS.closedDay;
    if (openToday && now.minutes >= HOURS.open && now.minutes < HOURS.close) {
      const left = HOURS.close - now.minutes;
      return { open: true, text: left <= 30 ? 'Open now · closing soon, at 6:00 pm' : 'Open now · closes 6:00 pm' };
    }
    if (openToday && now.minutes < HOURS.open) {
      return { open: false, text: 'Closed · opens today 7:00 am' };
    }
    // Find the next open day.
    let next = (now.day + 1) % 7;
    if (next === HOURS.closedDay) next = (next + 1) % 7;
    const isTomorrow = next === (now.day + 1) % 7;
    const prefix = now.day === HOURS.closedDay ? 'Closed today' : 'Closed';
    return { open: false, text: `${prefix} · opens ${isTomorrow ? 'tomorrow' : DAY_NAMES[next]} 7:00 am` };
  }

  function renderHours() {
    const now = goaNow();
    const status = openingStatus(now);
    $$('[data-status]').forEach((el) => {
      el.dataset.state = status.open ? 'open' : 'closed';
      const text = $('.status__text', el);
      if (text) text.textContent = status.text;
    });
    $$('.hours__table tr[data-day]').forEach((row) => {
      const today = Number(row.dataset.day) === now.day;
      row.classList.toggle('is-today', today);
      if (today) row.setAttribute('aria-current', 'date');
      else row.removeAttribute('aria-current');
    });
  }

  renderHours();
  setInterval(renderHours, 60 * 1000);

  /* ------------------------------------------------------------------
     Header: subtle background once the page has scrolled
     ------------------------------------------------------------------ */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  const nav = $('.nav');
  const toggle = $('[data-nav-toggle]');
  const panel = $('[data-nav-panel]');
  const desktopNav = window.matchMedia('(min-width: 960px)');

  if (nav && toggle && panel) {
    const outside = () => [$('main'), $('.site-footer'), $('.topbar'), $('.skip-link'), $('.brand')].filter(Boolean);
    const focusables = () => [toggle, ...$$('a[href], button:not([disabled])', panel)];

    const setOpen = (open, { returnFocus = true } = {}) => {
      if (open) {
        // Panel starts just below the header, wherever the header currently sits.
        root.style.setProperty('--panel-top', `${header.getBoundingClientRect().bottom}px`);
      }
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
      outside().forEach((el) => { el.inert = open; });
      if (open) {
        const first = $('a', panel);
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

    panel.addEventListener('click', (e) => {
      if (e.target.closest('a') && !desktopNav.matches) setOpen(false, { returnFocus: false });
    });

    document.addEventListener('keydown', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    desktopNav.addEventListener('change', (e) => {
      if (e.matches && nav.classList.contains('is-open')) setOpen(false, { returnFocus: false });
    });
  }

  /* ------------------------------------------------------------------
     Menu tabs (WAI-ARIA tabs pattern, automatic activation)
     ------------------------------------------------------------------ */
  $$('[data-tabs]').forEach((tablist) => {
    const tabs = $$('[role="tab"]', tablist);
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    const select = (index, { focus = true } = {}) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;
        if (next !== null) {
          e.preventDefault();
          select(next);
        }
      });
    });

    const initial = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    select(initial, { focus: false });
  });

  /* ------------------------------------------------------------------
     Reveal on scroll — only for things below the fold, so nothing
     visible on load ever blinks out. Skipped for reduced motion.
     ------------------------------------------------------------------ */
  const revealables = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('is-pending');
        io.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------------
     Reservation form
     ------------------------------------------------------------------ */
  const form = $('[data-reserve-form]');
  const success = $('[data-reserve-success]');

  if (form && success) {
    form.noValidate = true;
    const fields = {
      name: $('#r-name', form),
      phone: $('#r-phone', form),
      date: $('#r-date', form),
      time: $('#r-time', form),
      guests: $('#r-guests', form),
      note: $('#r-note', form),
    };
    const statusEl = $('[data-form-status]', form);

    const todayISO = () => goaNow().iso;
    fields.date.min = todayISO();
    const max = new Date();
    max.setDate(max.getDate() + 60);
    fields.date.max = goaNow(max).iso;

    const parseISO = (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const toMinutes = (hhmm) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };

    const rules = {
      name: (v) => (v.trim().length < 2 ? 'Tell us who to expect — at least two letters.' : ''),
      phone: (v) => {
        const digits = v.replace(/[\s\-().]/g, '');
        if (!digits) return 'We need a number to confirm the booking.';
        if (!/^(\+?1)?\d{10}$/.test(digits) && !/^\+\d{11,14}$/.test(digits)) {
          return 'That doesn’t look like a phone number — ten digits, area code first, is perfect.';
        }
        return '';
      },
      date: (v) => {
        if (!v) return 'Pick a day.';
        if (v < fields.date.min) return 'That day has already been and gone.';
        if (v > fields.date.max) return 'We only take bookings up to two months ahead.';
        if (parseISO(v).getDay() === HOURS.closedDay) return 'We’re closed on Mondays (siesta, mostly). Tuesday?';
        return '';
      },
      time: (v) => {
        if (!v) return 'Choose a time.';
        if (fields.date.value === todayISO() && toMinutes(v) < goaNow().minutes + 30) {
          return 'That slot has gone by today — try a later one.';
        }
        return '';
      },
      guests: (v) => (!v ? 'How many of you?' : ''),
      note: (v) => (v.length > 300 ? 'Keep it under 300 characters, please.' : ''),
    };

    const showError = (key, message) => {
      const input = fields[key];
      const error = document.getElementById(`${input.id}-error`);
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      if (error) error.textContent = message;
      return !message;
    };

    const validate = (key) => showError(key, rules[key](fields[key].value));

    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      const evt = input.tagName === 'SELECT' || input.type === 'date' ? 'change' : 'blur';
      input.addEventListener(evt, () => {
        if (input.value || input.hasAttribute('aria-invalid')) validate(key);
        if (key === 'date' && fields.time.value) validate('time');
      });
      input.addEventListener('input', () => {
        if (input.hasAttribute('aria-invalid')) validate(key);
      });
    });

    const prettyDate = (iso) =>
      parseISO(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = Object.keys(fields).filter((key) => !validate(key));
      if (invalid.length) {
        statusEl.textContent = invalid.length === 1 ? 'One field needs a look.' : `${invalid.length} fields need a look.`;
        fields[invalid[0]].focus();
        return;
      }
      statusEl.textContent = '';
      const name = fields.name.value.trim().split(/\s+/)[0];
      const guests = Number(fields.guests.value);
      const timeLabel = fields.time.options[fields.time.selectedIndex].text;
      $('[data-success-name]', success).textContent = name;
      const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
      $('[data-success-text]', success).textContent =
        `A table for ${words[guests - 1] || guests} on ${prettyDate(fields.date.value)} at ${timeLabel}. ` +
        `We’ll ring ${fields.phone.value.trim()} within a few hours to confirm. If plans change, just call.`;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    $('[data-reserve-again]', success).addEventListener('click', () => {
      form.reset();
      Object.keys(fields).forEach((key) => showError(key, ''));
      success.hidden = true;
      form.hidden = false;
      fields.name.focus();
    });
  }

  /* ------------------------------------------------------------------
     Newsletter
     ------------------------------------------------------------------ */
  const letter = $('[data-letter-form]');
  const letterDone = $('[data-letter-success]');
  if (letter && letterDone) {
    letter.noValidate = true;
    const input = $('input[type="email"]', letter);
    const error = $('.letter__error', letter);
    letter.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      error.textContent = ok ? '' : 'That email address doesn’t look quite right.';
      if (!ok) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      letter.hidden = true;
      letterDone.hidden = false;
      letterDone.focus();
    });
  }
})();
