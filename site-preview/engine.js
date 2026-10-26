/* Jasmine Infiniti homepage prototype engine — infinite loop scroll, parallax, marquees, game modal, chat panel.
   Squarespace 7.0: paste into Settings > Advanced > Code Injection > Footer (Core plan or higher). */
(function () {
  var qs = new URLSearchParams(location.search);
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCED = mq.matches || qs.has('static');
  document.documentElement.classList.toggle('reduced-motion', REDUCED);

  /* ---------- 1. Infinite loop: clone the page body once, wrap scroll position ---------- */
  var loop = document.querySelector('[data-loop]');
  var unit = loop && loop.querySelector('.loop-unit');
  var H = 0, T = 0;
  function setupLoop() {
    if (!loop || !unit || REDUCED) return;
    var clone = unit.cloneNode(true);
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    if ('inert' in clone) clone.inert = true;
    clone.querySelectorAll('a,button,[tabindex]').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
    clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    clone.querySelectorAll('img').forEach(function (img) {
      img.loading = 'lazy';
      img.decoding = 'async';
      img.removeAttribute('fetchpriority');
    });
    loop.appendChild(clone);
    var measure = function () { H = unit.offsetHeight; T = unit.getBoundingClientRect().top + window.scrollY; };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(unit);
    var wrap = function () {
      var y = window.scrollY;
      if (H > 0 && y >= T + H) window.scrollTo(0, y - H);
    };
    window.addEventListener('scroll', wrap, { passive: true });
    window.addEventListener('wheel', function (e) {
      if (T < 2 && e.deltaY < 0 && window.scrollY <= 0 && H > 0) window.scrollTo(0, H);
    }, { passive: true });
    var ty = 0;
    window.addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (T < 2 && window.scrollY <= 0 && e.touches[0].clientY - ty > 30 && H > 0) { window.scrollTo(0, H - 1); ty = e.touches[0].clientY; }
    }, { passive: true });
    document.querySelectorAll('.loop-hint').forEach(function (el) { el.hidden = false; });
  }

  /* ---------- 2. Marquee rows (time + scroll driven), 3. parallax ---------- */
  var tracks = [].slice.call(document.querySelectorAll('.marquee-track'));
  function setupMarquees() {
    if (REDUCED) return;
    tracks.forEach(function (t) {
      var kids = [].slice.call(t.children);
      kids.forEach(function (el) {
        var copy = el.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        if (copy.matches && copy.matches('a,button')) copy.setAttribute('tabindex', '-1');
        copy.querySelectorAll('a,button').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
        t.appendChild(copy);
      });
    });
  }
  function cacheTracks() {
    tracks.forEach(function (t) { t._half = (t.scrollWidth / 2) || 1; });
  }
  var px = [];
  function collectPx() {
    px = [].slice.call(document.querySelectorAll('[data-speed]')).map(function (el) {
      return { el: el, speed: +el.dataset.speed || 0, parent: el.parentElement, top: 0, height: 0 };
    });
  }
  function measurePx() {
    var y = window.scrollY;
    px.forEach(function (item) {
      if (!item.parent) return;
      var r = item.parent.getBoundingClientRect();
      item.top = r.top + y;
      item.height = r.height;
    });
  }
  var t0 = performance.now(), lastY = window.scrollY, vel = 0;
  function frame(now) {
    var y = window.scrollY;
    vel = vel * 0.9 + (y - lastY) * 0.1; lastY = y;
    var secs = (now - t0) / 1000;
    var vh = window.innerHeight;
    tracks.forEach(function (t) {
      var dir = t.dataset.dir === 'right' ? 1 : -1;
      var half = t._half || 1;
      var off = ((secs * (+t.dataset.pps || 30)) + y * 0.35) % half;
      t.style.transform = 'translate3d(' + (dir < 0 ? -off : off - half) + 'px,0,0)';
    });
    px.forEach(function (item) {
      var viewTop = item.top - y;
      if (viewTop + item.height < -200 || viewTop > vh + 200) return;
      var c = viewTop + item.height / 2 - vh / 2;
      item.el.style.transform = 'translate3d(0,' + (c * item.speed).toFixed(1) + 'px,0)';
    });
    document.documentElement.style.setProperty('--skew', Math.max(-3, Math.min(3, vel * 0.08)).toFixed(2) + 'deg');
    requestAnimationFrame(frame);
  }

  /* ---------- 4. Game modal + chat panel ---------- */
  var URLS = {
    pages: 'https://xer0yootz.github.io/neon-vigil-oauth/gigas-garden/',
    remix: 'https://remix.gg/g/neon-vigil-gigas-garden',
    chat: 'https://xer0yootz.github.io/neon-vigil-oauth/chat'
  };
  var gameDlg = document.getElementById('game-modal');
  var chatPanel = document.getElementById('chat-panel');
  var chatFab = document.querySelector('.chat-fab');
  var chatReturn = null;
  function loadFrame(frame, url, fallbackEl) {
    if (qs.has('noframe')) { frame.removeAttribute('src'); return; }
    if (frame.dataset.loaded === url) return;
    frame.dataset.loaded = url; frame.src = url;
    if (fallbackEl) {
      fallbackEl.classList.remove('show');
      var ok = false;
      frame.onload = function () { ok = true; };
      setTimeout(function () { if (!ok) fallbackEl.classList.add('show'); }, 8000);
    }
  }
  function openGame(which) {
    which = which || 'pages';
    var f = gameDlg.querySelector('iframe');
    loadFrame(f, URLS[which] || URLS.pages, gameDlg.querySelector('.frame-fallback'));
    if (!gameDlg.open) gameDlg.showModal();
    document.documentElement.classList.add('modal-open');
  }
  function closeGame() { if (gameDlg.open) gameDlg.close(); }
  gameDlg.addEventListener('close', function () { document.documentElement.classList.remove('modal-open'); });
  gameDlg.addEventListener('click', function (e) { if (e.target === gameDlg) closeGame(); });
  function toggleChat(force) {
    var open = force !== undefined ? force : chatPanel.hidden;
    if (open && chatPanel.hidden) chatReturn = document.activeElement;
    chatPanel.hidden = !open;
    chatFab.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('chat-open', open);
    if (open) {
      loadFrame(chatPanel.querySelector('iframe'), URLS.chat, chatPanel.querySelector('.frame-fallback'));
      var closeBtn = chatPanel.querySelector('.x');
      if (closeBtn) closeBtn.focus();
    } else if (chatReturn && chatReturn.focus) {
      chatReturn.focus();
      chatReturn = null;
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open]');
    if (!a) {
      // Squarespace native Button/Text links can't carry data-open: map by href instead.
      // Links inside the modal bar stay real new-tab links.
      var l = e.target.closest('a[href]');
      if (!l || l.closest('.mbar,.frame-fallback')) return;
      var h = l.href.replace(/\/$/, '');
      if (h === URLS.chat) l.dataset.open = 'chat';
      else if (h === URLS.pages.replace(/\/$/, '')) l.dataset.open = 'game';
      // Remix stays a plain new-tab link (it redirects signed-out visitors)
      else return;
      a = l;
    }
    // Modifier-click / middle-click keeps normal new-tab behaviour
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    var k = a.dataset.open;
    if (k === 'game' || k === 'remix') openGame(k === 'remix' ? 'remix' : 'pages');
    else if (k === 'chat') toggleChat(true);
    else if (k === 'chat-toggle') toggleChat();
    else if (k === 'close-game') closeGame();
    else if (k === 'close-chat') toggleChat(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chatPanel && !chatPanel.hidden) toggleChat(false);
  });

  /* ---------- 5. WELLFAIR mini player ---------- */
  var au = document.getElementById('wellfair');
  var pb = document.querySelector('.player-btn');
  var bar = document.querySelector('.player-progress i');
  var tm = document.querySelector('.player-time');
  if (au && pb) {
    pb.addEventListener('click', function () { if (au.paused) au.play(); else au.pause(); });
    au.addEventListener('play', function () { pb.classList.add('playing'); pb.setAttribute('aria-label', 'Pause WELLFAIR'); });
    au.addEventListener('pause', function () { pb.classList.remove('playing'); pb.setAttribute('aria-label', 'Play WELLFAIR'); });
    au.addEventListener('timeupdate', function () {
      var d = au.duration || 220, c = au.currentTime;
      if (bar) bar.style.width = (c / d * 100) + '%';
      var f = function (s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); };
      if (tm) tm.textContent = f(c) + ' / ' + f(d);
    });
  }

  /* Heavy scroll work waits until after the first paint so the wordmark can be LCP. */
  requestAnimationFrame(function () {
    setupLoop();
    setupMarquees();
    collectPx();
    cacheTracks();
    measurePx();
    window.addEventListener('resize', function () { cacheTracks(); measurePx(); });
    if (!REDUCED) requestAnimationFrame(frame);
  });

  /* test hooks for the capture script */
  window.__proto = { openGame: openGame, closeGame: closeGame, toggleChat: toggleChat, loopHeight: function () { return H; } };
})();
