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
    var more = document.getElementById('news-more');
    var news = Array.isArray(window.NEWS) ? window.NEWS : [];
    if (!grid || !news.length) return;
    var VISIBLE = 2;

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

    news.forEach(function (item, i) {
      var art = el('article', 'news-item');
      var hasMedia = !!(item.image || item.video);
      if (hasMedia) art.classList.add('has-media');
      art.appendChild(el('p', 'news-date', item.date));

      var body = el('div', 'news-body');
      body.appendChild(el('h3', 'news-title', item.title));
      if (item.text) body.appendChild(el('p', 'news-text', item.text));
      if (item.link && item.link.href) {
        var p = el('p', 'news-link');
        var a = el('a', null, item.link.label || 'Read more');
        a.href = item.link.href;
        p.appendChild(a);
        body.appendChild(p);
      }
      art.appendChild(body);
      if (hasMedia) art.appendChild(media(item));

      if (i >= VISIBLE) { art.hidden = true; art.classList.add('is-extra'); }
      grid.appendChild(art);
    });

    if (more && news.length > VISIBLE) {
      var showAll = 'Show all news (' + news.length + ')';
      more.textContent = showAll;
      more.hidden = false;
      more.setAttribute('aria-controls', 'news-grid');
      more.setAttribute('aria-expanded', 'false');
      more.addEventListener('click', function () {
        var open = more.getAttribute('aria-expanded') === 'true';
        grid.querySelectorAll('.is-extra').forEach(function (n) { n.hidden = open; });
        more.setAttribute('aria-expanded', String(!open));
        more.textContent = open ? showAll : 'Show fewer';
        if (!open) {
          var first = grid.querySelector('.is-extra .news-title');
          if (first) {
            first.setAttribute('tabindex', '-1');
            first.focus({ preventScroll: true });
          }
        }
      });
    }
  })();

  /* ------------------------------- charts ------------------------------- */

  var charts = document.querySelectorAll('.chart');
  if (reduceMotion || !hasIO) {
    charts.forEach(function (c) { c.classList.add('is-drawn'); });
  } else {
    var chartIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-drawn');
          chartIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    charts.forEach(function (c) { chartIO.observe(c); });
  }

  /* --------------------------- project explorer -------------------------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.project-tab'));

  function activate(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-active', on);
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
