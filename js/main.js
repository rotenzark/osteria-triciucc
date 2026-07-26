/* PLUMBING_V 3 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'osteria-triciucc',                 // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
          0: [],
          1: [['12:00', '15:00'], ['19:00', '24:00']],
          2: [['12:00', '15:00'], ['19:00', '24:00']],
          3: [['12:00', '15:00'], ['19:00', '24:00']],
          4: [['12:00', '15:00'], ['19:00', '24:00']],
          5: [['12:00', '15:00'], ['19:00', '24:00']],
          6: [['19:00', '24:00']],
        },
    
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana */
    EN: {
      "nav.home": "Osteria TriCiucc, back to top",
      "nav.dentro": "Inside",
      "nav.giardino": "The garden",
      "nav.cucina": "The kitchen",
      "nav.dove": "Find us",
      "nav.apri": "Open the menu",
      "cta.prenota": "Book",
      "cta.chiama": "Call to book",
      "intro.nome": "Osteria TriCiucc",
      "intro.skip": "come in",
      "strada.eti": "Roman cooking · Via Asiago 68 · Milan",
      "strada.r1": "From the street",
      "strada.r2": "you'd never guess.",
      "strada.p": "An osteria «<b>found by chance</b>», «a little <b>out of the way</b>» — that's what the reviews say. And inside, right at the back, is the thing you can't see from the road: <b>a garden</b>.",
      "strada.firma": "«A secret garden inside» — <span>their own words</span>",
      "strada.giu": "Come in",
      "dentro.occhiello": "First step",
      "dentro.h": "The bar, and then the rooms",
      "dentro.p1": "Past the door you walk into a place <b>full of things to look at</b>: pocket watches hanging from a beam, copper pipes, old maps on the walls, a bookcase, a ship's wheel. Above the bar, bottles against a red wall.",
      "dentro.p2": "There are <b>several rooms</b>, one behind the other. You go down, you turn, and the further back you go the more the noise of the street disappears.",
      "dentro.nota": "One guest puts it this way: «a very welcoming place, <b>unusual in its furnishings</b>».",
      "alt.bancone": "The wooden bar with its red wall, hanging glasses and pocket watches on the beam",
      "alt.rame": "A beam with copper pipes, ivy, a clock and a ship's wheel on the wall",
      "alt.libri": "A room with a bookcase full of books, old maps on the walls and table lamps lit",
      "alt.oggetti": "A dark round table and, on the shelf behind, a metal sailing ship, a pendulum clock and a statue",
      "giard.occhiello": "At the back",
      "giard.h": "The garden",
      "giard.sub": "Tables under a pergola, a tall hedge for a wall, terrazzo underfoot. You can't see it from the street and you won't find it by looking: you have to know it's there.",
      "alt.giardino": "The inner garden: tables with mosaic tops, black chairs, a white pergola and a very dense green hedge",
      "giard.n1b": "17 reviews",
      "giard.n1": "mention it. After the dishes, it's the word customers write most often.",
      "giard.n2b": "May to September",
      "giard.n2": "it's the best part of the osteria — and the only one that, online, appears nowhere at all.",
      "giard.n3b": "For a table outside",
      "giard.n3": "it's worth calling ahead: those are the first ones to go.",
      "cuc.occhiello": "Roman cooking",
      "cuc.h": "The four classics, with fresh egg tonnarelli",
      "cuc.p": "In the reviews the most recurring words are <b>Roman cooking</b> and <b>cacio e pepe</b>, tied. Then carbonara. The prices below are the ones written on their own menu.",
      "list.pasta": "Pasta <span>fresh egg tonnarelli</span>",
      "list.anti": "Starters",
      "list.secondi": "Mains",
      "p.cacio": "Cacio e pepe",
      "p.gricia": "Gricia",
      "p.carbo": "Carbonara",
      "p.amatri": "Amatriciana",
      "a.tagliere": "Cured meats board with pickled vegetables",
      "a.culaccia": "Culaccia ham and buffalo mozzarella",
      "a.formaggi": "Mixed cheeses",
      "a.gazpacho": "Gazpacho",
      "s.galletto": "Spicy cockerel with potatoes",
      "s.tagliata": "Sliced beef with roast potatoes",
      "s.costata": "Rib-eye steak with vegetables",
      "s.costoletta": "Milanese-style veal cutlet",
      "list.coda": "There's also the <b>bistecca alla fiorentina</b>, but <b>by reservation only</b> and from one kilo up. The menu is written in Italian and English: they translate it themselves.",
      "alt.carbonara": "A plate of tonnarelli alla carbonara with guanciale and pepper",
      "alt.menu": "The osteria's menu, headed OTC, with starters, pasta, risotto and mains in Italian and English",
      "voci.h": "What people write",
      "v1": "«Osteria found by chance, we had dinner here last Tuesday and I have to say the food was excellent. The carbonara comes highly recommended, it was delicious.»",
      "v2": "«A very welcoming place, unusual in its furnishings. We had the tomato bruschetta and the mortadella and gorgonzola one. Excellent.»",
      "v3": "«Very nice, we ate well at lunch. I spent 14 euros for a first course, a dessert and water.»",
      "v4": "«Excellent dinner, thrilled with the octopus! Kind waiter, smiling owner. Well done!»",
      "v5": "«The cacio e pepe was superb, as was the green salad with chicken. Nice room, attentive and kind staff.»",
      "voci.voto": "<b>4.4</b> from <b>498 Google reviews</b>",
      "dove.occhiello": "Find us",
      "dove.h": "Via Asiago 68",
      "dove.ind": "20128 Milan — on the border between <b>Gorla</b> and Precotto, a few hundred metres from the Martesana canal.",
      "dove.cap": "Opening hours",
      "dove.mappa": "Map: Osteria TriCiucc, Via Asiago 68, Milan",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.solocena": "dinner only",
      "g.chiuso": "closed",
      "dove.teln": "Booking is by phone. For a table in the garden, better to call a little ahead.",
      "dove.extra": "Dine in and takeaway. €20–30 per person.",
      "piede.d": "Via Asiago 68, 20128 Milan · <a href=\"tel:+393519009608\">351 900 9608</a>",
      "piede.b": "Demonstration site built by <a href=\"https://bespokestud.io\" target=\"_blank\" rel=\"noopener\">Bespoke Studio</a> · photos and texts come from the business's public sources.",
      "barra.chiama": "Call",
      "barra.giard": "Garden",
      "barra.menu": "Menu",
      "lb.chiudi": "Close",
    },
  };
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    heroEntrance();
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    var en = root.lang === 'en';
    var txt;
    if (st.open) {
      txt = (en ? 'Open now' : 'Aperto ora') + ' · ' + (en ? 'closes at ' : 'chiude alle ') + st.closesAt;
    } else if (st.opensToday) {
      txt = (en ? 'Closed · opens today at ' : 'Chiuso · apre oggi alle ') + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = (en ? 'Closed · opens ' + DAYS_EN[st.opensDay] + ' at ' : 'Chiuso · apre ' + DAYS_IT[st.opensDay] + ' alle ') + st.opensAt;
    } else {
      txt = en ? 'Closed' : 'Chiuso';
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    root.lang = lang === 'en' ? 'en' : 'it';
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = lang === 'en' && SITE.EN[key] !== undefined ? SITE.EN[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      setLang(root.lang === 'en' ? 'it' : 'en');
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    if (localStorage.getItem(SITE.slug + '-lang') === 'en') setLang('en');
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */

  /* ─────────────────────────────────────────────────────────────────
     FIRMA — GLI INGRANAGGI.
     Il loro logo (Instagram @osteriatriciucc) è un boccale con dentro
     delle ruote dentate; gli stessi ingranaggi decorano l'intestazione
     del menu «OTC» e uno è appeso al pergolato del giardino. Qui due
     ruote agganciate girano in senso opposto mentre si scende: è il
     loro marchio in movimento.
     Le ruote sono SEMPRE VISIBILI via CSS (opacity .3) — se GSAP non
     carica restano ferme ma disegnate: niente da sbloccare, quindi
     nessun watchdog necessario.                                     */
  (function ingranaggi() {
    var svg = document.getElementById('ruote');
    if (!svg) return;

    /* i denti sono generati qui: 12 per ruota, così l'HTML resta pulito */
    function denti(id, n, r, h, w) {
      var g = document.getElementById(id);
      if (!g) return;
      var out = '';
      for (var i = 0; i < n; i++) {
        var a = (360 / n) * i;
        out += '<rect x="' + (-w / 2) + '" y="' + (-r - h + 2) + '" width="' + w +
               '" height="' + h + '" rx="1" fill="currentColor" transform="rotate(' + a + ')"/>';
      }
      g.innerHTML = out;
    }
    denti('dentiA', 12, 26, 7, 7);
    denti('dentiB', 12, 26, 7, 7);

    var A = svg.querySelector('.ruota--a');
    var B = svg.querySelector('.ruota--b');
    if (!A || !B) return;

    var ridotto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ridotto || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* mezzo dente di sfasamento: così i denti si incastrano invece di
       scontrarsi (12 denti = 30° di passo, mezzo dente = 15°) */
    gsap.set(A, { transformOrigin: 'center' });
    gsap.set(B, { rotation: 15, transformOrigin: 'center' });

    var st = {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
    };
    gsap.to(A, { rotation: 300, ease: 'none', scrollTrigger: st });
    gsap.to(B, { rotation: 15 - 300, ease: 'none', scrollTrigger: st });
  })();

})();
