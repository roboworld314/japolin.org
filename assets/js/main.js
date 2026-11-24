/* Johora Akter Polin, personal site. Plain JavaScript, no build step. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ------------------------------ lightbox ------------------------------ */

  var lightbox = (function () {
    var dlg = document.getElementById('lightbox');
    if (!dlg) return null;
    var img = dlg.querySelector('.lightbox-img');
    var cap = dlg.querySelector('.lightbox-caption');
    var nav = dlg.querySelector('.lightbox-nav');
    var count = dlg.querySelector('.lightbox-count');
    var items = [];
    var index = 0;
    var opener = null;
    var supported = typeof dlg.showModal === 'function';

    function show(i) {
      index = (i + items.length) % items.length;
      var it = items[index];
      img.src = it.src;
      img.alt = it.alt || '';
      cap.textContent = it.caption || '';
      count.textContent = items.length > 1 ? (index + 1) + ' of ' + items.length : '';
      nav.hidden = items.length < 2;
    }

    function open(list, start, from) {
      items = list;
      if (!supported) { window.open(list[start].src, '_blank', 'noopener'); return; }
      opener = from || null;
      show(start);
      dlg.showModal();
    }

    dlg.querySelector('.lightbox-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lightbox-prev').addEventListener('click', function () { show(index - 1); });
    dlg.querySelector('.lightbox-next').addEventListener('click', function () { show(index + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (items.length < 2) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });
    dlg.addEventListener('close', function () {
      img.removeAttribute('src');
      if (opener) opener.focus();
    });

    return { open: open };
  })();

  /* -------------------------------- news -------------------------------- */

  (function renderNews() {
    var grid = document.getElementById('news-grid');
    var news = Array.isArray(window.NEWS) ? window.NEWS : [];
    if (!grid || !news.length) return;

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    }

    function youtubeId(url) {
      var m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/.exec(url || '');
      return m ? m[1] : null;
    }

    function media(item) {
      var box = el('div', 'news-media');
      var yt = youtubeId(item.video);
      if (yt) {
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + yt;
        f.title = item.alt || item.title;
        f.loading = 'lazy';
        f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        box.appendChild(f);
      } else if (item.video) {
        var v = document.createElement('video');
        v.src = item.video;
        v.controls = true;
        v.preload = 'metadata';
        v.playsInline = true;
        if (item.poster) v.poster = item.poster;
        v.setAttribute('aria-label', item.alt || item.title);
        box.appendChild(v);
      } else {
        var b = el('button', 'news-media-btn');
        b.type = 'button';
        b.setAttribute('aria-label', 'Enlarge photo: ' + (item.alt || item.title));
        var im = document.createElement('img');
        im.src = item.image;
        im.alt = item.alt || '';
        im.loading = 'lazy';
        im.decoding = 'async';
        if (item.fit === 'contain') box.classList.add('is-contain');
        if (item.background) { box.style.background = item.background; im.style.background = item.background; im.style.padding = '0'; }
        if (item.position) im.style.objectPosition = item.position === 'top' ? 'center top' : item.position;
        if (item.frame === 'browser') {
          box.classList.add('is-browser');
          var bar = el('span', 'browser-bar');
          bar.setAttribute('aria-hidden', 'true');
          bar.appendChild(el('span', 'browser-dots'));
          var addr = item.frameLabel || ((item.link && item.link.href) ? item.link.href.replace(/^https?:\/\//, '').replace(/\/$/, '') : '');
          bar.appendChild(el('span', 'browser-url', addr));
          b.appendChild(bar);
        }
        b.appendChild(im);
        var zoom = el('span', 'news-zoom');
        zoom.setAttribute('aria-hidden', 'true');
        zoom.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M10.5 4a6.5 6.5 0 0 1 5.2 10.4l4 4-1.4 1.4-4-4A6.5 6.5 0 1 1 10.5 4zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm-.9 1.8h1.8v1.8h1.8v1.8h-1.8v1.8H9.6v-1.8H7.8V9.6h1.8z" fill="currentColor"/></svg>';
        b.appendChild(zoom);
        b.addEventListener('click', function () {
          if (lightbox) lightbox.open([{ src: item.image, alt: item.alt, caption: item.caption || item.title }], 0, b);
        });
        box.appendChild(b);
      }
      return box;
    }

    var TAG_ICON = {
      Talk: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
      Teaching: '<path d="M2.5 9L12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.6 3.5 2.4 5.5 2.4s4-.8 5.5-2.4V11M21.5 9v5"/>',
      Service: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
      Paper: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
      Award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>'
    };
    function icon(tag, cls) {
      var path = TAG_ICON[tag] || TAG_ICON.Paper;
      return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
    }

    // Items without a photo get a drawn cover in the site's colours.
    function cover(item) {
      var box = el('div', 'news-media news-cover');
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML = icon(item.tag, 'cover-icon');
      box.appendChild(el('span', 'cover-title', (item.cover && item.cover.title) || item.tag || ''));
      if (item.cover && item.cover.sub) box.appendChild(el('span', 'cover-sub', item.cover.sub));
      return box;
    }

    news.forEach(function (item, i) {
      var art = el('article', 'news-card');
      var hasMedia = !!(item.image || item.video);
      art.appendChild(hasMedia ? media(item) : cover(item));

      // Label and date share one row, so dates line up across all cards.
      var body = el('div', 'news-body');
      var meta = el('div', 'news-meta');
      if (item.tag) {
        var tag = el('span', 'news-tag');
        tag.innerHTML = icon(item.tag, 'tag-icon');
        tag.appendChild(document.createTextNode(item.tag));
        meta.appendChild(tag);
      }
      var date = el('span', 'news-date');
      date.innerHTML = '<svg class="tag-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
      date.appendChild(document.createTextNode(item.date));
      meta.appendChild(date);
      body.appendChild(meta);
      body.appendChild(el('h3', 'news-title', item.title));
      if (item.text) body.appendChild(el('p', 'news-text', item.text));
      if (item.link && item.link.href) {
        var p = el('p', 'news-link');
        var a = el('a', null, item.link.label || 'Read more');
        a.href = item.link.href;
        if (/^https?:/.test(item.link.href)) { a.target = '_blank'; a.rel = 'noopener'; }
        p.appendChild(a);
        body.appendChild(p);
      }
      art.appendChild(body);
      art.style.setProperty('--i', String(Math.min(i, 3)));
      grid.appendChild(art);
    });

    // Cards rise in, one after another, the first time the grid scrolls into view.
    if (!reduceMotion && hasIO) {
      grid.classList.add('will-reveal');
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        grid.classList.add('is-revealed');
        obs.disconnect();
      }, { rootMargin: '0px 0px -12% 0px' }).observe(grid);
    }

    // Slider: arrows move one card at a time; dots show where you are.
    var prev = document.querySelector('.news-prev');
    var next = document.querySelector('.news-next');
    var dotsBox = document.querySelector('.news-dots');
    var cards = Array.prototype.slice.call(grid.children);
    var dots = cards.map(function (card, i) {
      var d = el('button', 'news-dot');
      d.type = 'button';
      d.tabIndex = -1;
      d.addEventListener('click', function () { go(i); });
      if (dotsBox) dotsBox.appendChild(d);
      return d;
    });

    function step() {
      var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }
    function current() { return Math.round(grid.scrollLeft / step()); }
    function go(i) {
      grid.scrollTo({ left: i * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function update() {
      var max = grid.scrollWidth - grid.clientWidth;
      var scrollable = max > 2;
      if (prev) { prev.disabled = grid.scrollLeft <= 2; prev.hidden = !scrollable; }
      if (next) { next.disabled = grid.scrollLeft >= max - 2; next.hidden = !scrollable; }
      if (dotsBox) dotsBox.hidden = !scrollable;
      var perView = Math.max(1, Math.round(grid.clientWidth / step()));
      var first = current();
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i >= first && i < first + perView); });
      // Centre the arrows on the pictures.
      var pic = cards[0].firstElementChild;
      if (pic) grid.parentNode.style.setProperty('--arrow-y', (pic.offsetHeight / 2) + 'px');
    }
    if (prev) prev.addEventListener('click', function () { go(Math.max(0, current() - 1)); });
    if (next) next.addEventListener('click', function () { go(current() + 1); });
    grid.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, current() - 1)); }
    });
    var ticking = false;
    grid.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(function () { ticking = false; update(); }); }
    }, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  })();

  /* ------------------------------- charts ------------------------------- */

  var charts = document.querySelectorAll('.chart');

  // Numbers next to the bars count up as the bars grow.
  function countUp(chart) {
    chart.querySelectorAll('.chart-value').forEach(function (el) {
      var target = el.getAttribute('data-v') || el.textContent.trim();
      el.setAttribute('data-v', target);
      var num = parseFloat(target);
      if (isNaN(num) || reduceMotion) { el.textContent = target; return; }
      var decimals = (target.split('.')[1] || '').length;
      var start = null;
      function tick(t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 900);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (num * e).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }
  function drawChart(c) { c.classList.add('is-drawn'); countUp(c); }
  function redrawCharts(panel) {
    if (reduceMotion) return;
    panel.querySelectorAll('.chart').forEach(function (c) {
      c.classList.remove('is-drawn');
      void c.offsetWidth;
      requestAnimationFrame(function () { drawChart(c); });
    });
  }

  if (reduceMotion || !hasIO) {
    charts.forEach(function (c) { c.classList.add('is-drawn'); });
  } else {
    var chartIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          drawChart(e.target);
          chartIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    charts.forEach(function (c) { chartIO.observe(c); });
  }

  // "How it works" steps appear one by one while the connecting line draws.
  var stepLists = document.querySelectorAll('.steps');
  function drawSteps(list) { list.classList.remove('is-drawn'); void list.offsetWidth; list.classList.add('is-drawn'); }
  if (!reduceMotion && hasIO) {
    stepLists.forEach(function (l) { l.classList.add('will-draw'); });
    var stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { drawSteps(e.target); stepIO.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    stepLists.forEach(function (l) { stepIO.observe(l); });
  }

  /* --------------------------- project explorer -------------------------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.project-tab'));

  var ink = document.querySelector('.tab-ink');
  function moveInk() {
    var sel = document.querySelector('.project-tab[aria-selected="true"]');
    if (!ink || !sel) return;
    ink.style.setProperty('--ink-x', sel.offsetLeft + 'px');
    ink.style.setProperty('--ink-w', sel.offsetWidth + 'px');
  }

  function activate(tab, focus) {
    var changed = tab.getAttribute('aria-selected') !== 'true';
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-active', on);
    });
    moveInk();
    var active = document.getElementById(tab.getAttribute('aria-controls'));
    if (changed && active && !reduceMotion) {
      // The new project fades in, its charts redraw, and its steps replay.
      active.classList.remove('is-entering'); void active.offsetWidth; active.classList.add('is-entering');
      redrawCharts(active);
      active.querySelectorAll('.steps').forEach(drawSteps);
    }
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  window.addEventListener('resize', moveInk);
  window.addEventListener('load', moveInk);
  moveInk();

  // Research theme cards: pointer glow, and icons play once when the cards appear.
  var themeCards = document.querySelectorAll('.theme-card');
  themeCards.forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  var themeGrid = document.querySelector('.theme-grid');
  if (themeGrid && !reduceMotion && hasIO) {
    themeGrid.classList.add('will-reveal');
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      themeGrid.classList.add('is-revealed');
      themeCards.forEach(function (c) { c.classList.add('is-live'); });
      setTimeout(function () { themeCards.forEach(function (c) { c.classList.remove('is-live'); }); }, 4500);
      obs.disconnect();
    }, { rootMargin: '0px 0px -12% 0px' }).observe(themeGrid);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activate(next, true); }
    });
  });

  // Links in the research themes open a specific project
  document.querySelectorAll('[data-open-project]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var tab = document.querySelector('.project-tab[data-project="' + link.getAttribute('data-open-project') + '"]');
      if (!tab) return;
      e.preventDefault();
      activate(tab, false);
      document.getElementById('projects').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // Figure galleries open in the lightbox
  document.querySelectorAll('.gallery').forEach(function (gallery) {
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.thumb'));
    var list = thumbs.map(function (t) {
      var im = t.querySelector('img');
      return { src: t.getAttribute('data-full'), alt: im ? im.alt : '', caption: t.getAttribute('data-caption') };
    });
    thumbs.forEach(function (t, i) {
      t.addEventListener('click', function () { if (lightbox) lightbox.open(list, i, t); });
    });
  });

  /* ---------------------------- figure sliders ---------------------------- */

  document.querySelectorAll('.fig-slider').forEach(function (slider) {
    var frame = slider.querySelector('.fs-frame');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.fs-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.fs-dots span'));
    var count = slider.querySelector('.fs-count');
    var cap = slider.querySelector('.fs-cap');
    var idx = 0;
    function show(n) {
      n = (n + slides.length) % slides.length;
      if (n === idx) return;
      var old = slides[idx];
      old.classList.remove('is-active'); old.classList.add('is-leaving');
      setTimeout(function () { old.classList.remove('is-leaving'); }, 400);
      idx = n;
      slides[idx].classList.add('is-active');
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
      if (count) count.textContent = (idx + 1) + ' / ' + slides.length;
      if (cap) cap.textContent = slides[idx].getAttribute('data-caption');
    }
    slider.querySelector('.fs-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    slider.querySelector('.fs-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    frame.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      if (e.key === 'Enter') openViewer();
    });
    // Hover magnifier follows the pointer (mouse only).
    frame.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || e.target.closest('.fs-arrow')) { frame.classList.remove('is-zooming'); return; }
      var r = frame.getBoundingClientRect();
      frame.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
      frame.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
      frame.classList.add('is-zooming');
    });
    frame.addEventListener('pointerleave', function () { frame.classList.remove('is-zooming'); });
    function openViewer() {
      if (!lightbox) return;
      var items = slides.map(function (s) { return { src: s.getAttribute('data-full'), alt: s.querySelector('img').alt, caption: s.getAttribute('data-caption') }; });
      lightbox.open(items, idx, frame);
    }
    frame.addEventListener('click', function (e) { if (!e.target.closest('.fs-arrow')) openViewer(); });
  });

  /* ------------------------- experience filters ------------------------- */

  var xpChips = document.querySelectorAll('.xp-filters .chip');
  var xpItems = document.querySelectorAll('.xp-list .xp');
  xpChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-xp');
      xpChips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      xpItems.forEach(function (li) { li.hidden = f !== 'all' && li.getAttribute('data-type') !== f; });
    });
  });

  // Experience entries and education cards rise in, in order, on first view.
  [['.xp-list', '.xp'], ['.edu-track', '.ms']].forEach(function (pair) {
    var box = document.querySelector(pair[0]);
    if (!box || reduceMotion || !hasIO) return;
    box.querySelectorAll(pair[1]).forEach(function (n, i) { n.style.setProperty('--i', String(i)); });
    box.classList.add('will-reveal');
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      box.classList.add('is-revealed');
      obs.disconnect();
    }, { rootMargin: '0px 0px -10% 0px' }).observe(box);
  });

  /* -------------------------------- skills -------------------------------- */

  var skillGrid = document.querySelector('.skill-grid');
  if (skillGrid) {
    var skillCards = skillGrid.querySelectorAll('.skill-card');
    // A soft glow follows the pointer across each card.
    skillCards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    if (!reduceMotion && hasIO) {
      skillGrid.classList.add('will-reveal');
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        skillGrid.classList.add('is-revealed');
        // Icons play for a few seconds as the cards arrive, then wait for a hover.
        skillCards.forEach(function (card) { card.classList.add('is-live'); });
        window.setTimeout(function () {
          skillCards.forEach(function (card) { card.classList.remove('is-live'); });
        }, 4500);
        obs.disconnect();
      }, { rootMargin: '0px 0px -12% 0px' }).observe(skillGrid);
    }
  }

  /* -------------------------------- moments ------------------------------- */

  var moGrid = document.querySelector('.mo-grid');
  var moData = window.MOMENTS || [];
  if (moGrid && moData.length) {
    var moFilters = document.querySelector('.mo-filters');
    var moTiles = moData.map(function (m, i) {
      var li = document.createElement('li');
      li.className = 'mo' + (m.size === 'big' ? ' mo-big' : m.size === 'wide' ? ' mo-wide' : '');
      li.dataset.tag = m.tag || '';
      li.style.setProperty('--i', i);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mo-btn';
      b.setAttribute('aria-label', 'Enlarge photo: ' + m.title);
      var im = document.createElement('img');
      im.src = m.src;
      im.alt = m.alt || m.title;
      im.loading = 'lazy';
      im.decoding = 'async';
      if (m.fit === 'contain') { im.style.objectFit = 'contain'; }
      if (m.background) b.style.background = m.background;
      if (m.position) im.style.objectPosition = m.position;
      b.appendChild(im);
      var cap = document.createElement('span');
      cap.className = 'mo-cap';
      cap.innerHTML = '<span class="mo-tag"></span><b></b><time></time>';
      cap.querySelector('.mo-tag').textContent = m.tag || '';
      cap.querySelector('b').textContent = m.title;
      cap.querySelector('time').textContent = m.date || '';
      b.appendChild(cap);
      b.addEventListener('click', function () {
        if (!lightbox) return;
        var shown = moTiles.filter(function (t) { return !t.li.hidden; });
        var items = shown.map(function (t) { return { src: t.m.src, alt: t.m.alt || t.m.title, caption: t.m.title + (t.m.date ? ', ' + t.m.date : '') }; });
        lightbox.open(items, shown.findIndex(function (t) { return t.li === li; }), b);
      });
      li.appendChild(b);
      moGrid.appendChild(li);
      return { li: li, m: m };
    });

    // Filter buttons come from the tags in use, with a count for each.
    var tags = [];
    moData.forEach(function (m) { if (m.tag && tags.indexOf(m.tag) < 0) tags.push(m.tag); });
    if (moFilters && tags.length > 1) {
      ['All'].concat(tags).forEach(function (t, k) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'chip' + (k === 0 ? ' is-active' : '');
        c.setAttribute('aria-pressed', k === 0 ? 'true' : 'false');
        var n = t === 'All' ? moData.length : moData.filter(function (m) { return m.tag === t; }).length;
        c.innerHTML = t + ' <span>' + n + '</span>';
        c.addEventListener('click', function () {
          moFilters.querySelectorAll('.chip').forEach(function (x) {
            x.classList.toggle('is-active', x === c);
            x.setAttribute('aria-pressed', x === c ? 'true' : 'false');
          });
          var j = 0;
          moTiles.forEach(function (tile) {
            var show = t === 'All' || tile.m.tag === t;
            tile.li.hidden = !show;
            if (show) {
              tile.li.style.setProperty('--i', j++);
              if (!reduceMotion) { tile.li.classList.remove('mo-pop'); void tile.li.offsetWidth; tile.li.classList.add('mo-pop'); }
            }
          });
          // Feature sizes only make sense in the full grid.
          moGrid.classList.toggle('is-filtered', t !== 'All');
        });
        moFilters.appendChild(c);
      });
    }

    if (!reduceMotion && hasIO) {
      moGrid.classList.add('will-reveal');
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        moGrid.classList.add('is-revealed');
        obs.disconnect();
      }, { rootMargin: '0px 0px -10% 0px' }).observe(moGrid);
    }
  }

  /* --------------------------- service & awards --------------------------- */

  var svcLayout = document.querySelector('.svc-layout');
  if (svcLayout) {
    var svcItems = svcLayout.querySelectorAll('.svc, .award');
    svcLayout.querySelectorAll('.svc').forEach(function (el, i) { el.style.setProperty('--i', i); });
    svcLayout.querySelectorAll('.award').forEach(function (el, i) { el.style.setProperty('--i', i); });
    // The same pointer glow as the skill cards.
    svcLayout.querySelectorAll('.svc, .award-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    if (!reduceMotion && hasIO) {
      svcLayout.classList.add('will-reveal');
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        svcLayout.classList.add('is-revealed');
        svcItems.forEach(function (el) { el.classList.add('is-live'); });
        window.setTimeout(function () {
          svcItems.forEach(function (el) { el.classList.remove('is-live'); });
        }, 4500);
        obs.disconnect();
      }, { rootMargin: '0px 0px -12% 0px' }).observe(svcLayout);
    }
  }

  /* ------------------------- publication filters ------------------------ */

  var chips = document.querySelectorAll('.pub-filters .chip');
  var blocks = document.querySelectorAll('.pub-block');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      blocks.forEach(function (b) { b.hidden = f !== 'all' && b.getAttribute('data-type') !== f; });
      animatePubs();
    });
  });

  // Paper cards rise in, in order: on first view, and again after filtering.
  var pubList = document.getElementById('publications');
  function animatePubs() {
    if (!pubList || reduceMotion) return;
    var k = 0;
    pubList.querySelectorAll('.pub-block:not([hidden]) .pub').forEach(function (p) { p.style.setProperty('--k', String(k++)); });
    pubList.classList.remove('pubs-anim');
    void pubList.offsetWidth; // restart the animation
    pubList.classList.add('pubs-anim');
  }
  if (pubList && hasIO && !reduceMotion) {
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      animatePubs();
      obs.disconnect();
    }, { rootMargin: '0px 0px -15% 0px' }).observe(pubList.querySelector('.pub-filters') || pubList);
  }

  // Paper figures open full size in the figure viewer.
  document.querySelectorAll('.pub-fig-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!lightbox) return;
      var gallery = btn.getAttribute('data-gallery');
      var items = gallery ? JSON.parse(gallery).map(function (g) { return { src: g.src, alt: g.caption, caption: g.caption }; })
        : [{ src: btn.getAttribute('data-full'), alt: btn.querySelector('img').alt, caption: btn.getAttribute('data-cap') }];
      lightbox.open(items, 0, btn);
    });
  });

  // "Show details" opens a summary, key results, and keywords under each paper.
  document.querySelectorAll('.pub-more').forEach(function (btn) {
    var card = btn.closest('.pub');
    var label = btn.querySelector('span');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      card.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Hide details' : 'Show details';
    });
  });

  /* ------------------- current section in nav, back to top -------------- */

  // Highlight the section whose top has passed the upper half of the window.
  // Worked out from the scroll position, so it is right after jumps and reloads.
  var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  var navSections = [];
  navLinks.forEach(function (a) {
    var sec = document.getElementById(a.getAttribute('href').slice(1));
    // Education is a column inside the Teaching section; measure its section.
    if (sec) navSections.push({ link: a, sec: sec.closest('section') || sec });
  });
  if (navSections.length) {
    var navTicking = false;
    var updateNav = function () {
      navTicking = false;
      // Sections side by side (Teaching and Education) share a top, so both light up.
      var line = window.innerHeight * 0.45;
      var best = -Infinity;
      navSections.forEach(function (n) {
        n.top = n.sec.getBoundingClientRect().top;
        if (n.top <= line && n.top > best) best = n.top;
      });
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && window.scrollY > 0) best = navSections[navSections.length - 1].top;
      navSections.forEach(function (n) {
        n.link.classList.toggle('is-current', best > -Infinity && Math.abs(n.top - best) < 4);
      });
    };
    var queueNav = function () {
      if (!navTicking) { navTicking = true; window.requestAnimationFrame(updateNav); }
    };
    window.addEventListener('scroll', queueNav, { passive: true });
    window.addEventListener('resize', queueNav);
    updateNav();
  }

  var toTop = document.querySelector('.to-top');
  var hero = document.querySelector('.hero');
  if (toTop && hero && hasIO) {
    new IntersectionObserver(function (entries) {
      toTop.hidden = entries[0].isIntersecting;
    }).observe(hero);
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var brand = document.querySelector('.brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }
})();
