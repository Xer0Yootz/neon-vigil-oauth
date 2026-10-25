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
  var H = 0, T = 0, looped = false;
  if (loop && unit && !REDUCED) {
    var clone = unit.cloneNode(true);
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a,button,[tabindex]').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
    clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    loop.appendChild(clone);
    var measure = function () { H = unit.getBoundingClientRect().height; T = unit.getBoundingClientRect().top + window.scrollY; };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(unit);
    var wrap = function () {
      var y = window.scrollY;
      if (H > 0 && y >= T + H) { window.scrollTo(0, y - H); looped = true; }
    };
    window.addEventListener('scroll', wrap, { passive: true });
    // scrolling up past the very top wraps to the end of the first copy
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
  tracks.forEach(function (t) { t.innerHTML += t.innerHTML; t.querySelectorAll('a').forEach(function (a, i) { if (i >= t.children.length / 2) a.setAttribute('tabindex', '-1'); }); });
  var px = [].slice.call(document.querySelectorAll('[data-speed]'));
  var t0 = performance.now(), lastY = window.scrollY, vel = 0;
  function frame(now) {
    var y = window.scrollY;
    vel = vel * 0.9 + (y - lastY) * 0.1; lastY = y;
    if (!REDUCED) {
      var secs = (now - t0) / 1000;
      tracks.forEach(function (t) {
        var dir = t.dataset.dir === 'right' ? 1 : -1;
        var half = t.scrollWidth / 2 || 1;
        var off = ((secs * (+t.dataset.pps || 30)) + y * 0.35) % half;
        t.style.transform = 'translate3d(' + (dir < 0 ? -off : off - half) + 'px,0,0)';
      });
      var vh = window.innerHeight;
      px.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var c = (r.top + r.height / 2 - vh / 2);
        el.style.transform = 'translate3d(0,' + (c * +el.dataset.speed).toFixed(1) + 'px,0)';
      });
      document.documentElement.style.setProperty('--skew', Math.max(-3, Math.min(3, vel * 0.08)).toFixed(2) + 'deg');
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 4. Game modal + chat panel ---------- */
  var URLS = {
    pages: 'https://xer0yootz.github.io/neon-vigil-oauth/gigas-garden/',
    remix: 'https://remix.gg/games/d9a532a8-456a-4ddb-b323-5b7a5cd46f72',
    chat: 'https://xer0yootz.github.io/neon-vigil-oauth/chat'
  };
  var gameDlg = document.getElementById('game-modal');
  var chatPanel = document.getElementById('chat-panel');
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
    gameDlg.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === which); });
    gameDlg.querySelector('.newtab').href = URLS[which];
    loadFrame(f, URLS[which], gameDlg.querySelector('.frame-fallback'));
    if (!gameDlg.open) gameDlg.showModal();
    document.documentElement.classList.add('modal-open');
  }
  function closeGame() { gameDlg.close(); }
  gameDlg.addEventListener('close', function () { document.documentElement.classList.remove('modal-open'); });
  gameDlg.addEventListener('click', function (e) { if (e.target === gameDlg) closeGame(); });
  function toggleChat(force) {
    var open = force !== undefined ? force : chatPanel.hidden;
    chatPanel.hidden = !open;
    document.querySelector('.chat-fab').setAttribute('aria-expanded', open);
    if (open) loadFrame(chatPanel.querySelector('iframe'), URLS.chat, chatPanel.querySelector('.frame-fallback'));
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open]');
    if (!a) {
      // Squarespace native Button/Text links can't carry data-open: map by href instead
      var l = e.target.closest('a[href]');
      if (!l) return;
      var h = l.href.replace(/\/$/, '');
      if (h === URLS.chat) l.dataset.open = 'chat';
      else if (h === URLS.pages.replace(/\/$/, '')) l.dataset.open = 'game';
      // Remix stays a plain new-tab link (it redirects signed-out visitors)
      else return;
      if (l.closest('.mbar,.frame-fallback')) { delete l.dataset.open; return; } // new-tab links stay new-tab
      a = l;
    }
    // Modifier-click / middle-click keeps normal new-tab behaviour
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    var k = a.dataset.open;
    if (k === 'game' || k === 'remix') openGame(k === 'remix' ? 'remix' : (a.dataset.tab || 'pages'));
    else if (k === 'chat') toggleChat(true);
    else if (k === 'chat-toggle') toggleChat();
    else if (k === 'close-game') closeGame();
    else if (k === 'close-chat') toggleChat(false);
  });
  gameDlg.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () { openGame(b.dataset.tab); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chatPanel.hidden) toggleChat(false); });

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
      bar.style.width = (c / d * 100) + '%';
      var f = function (s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); };
      tm.textContent = f(c) + ' / ' + f(d);
    });
  }

  /* test hooks for the capture script */
  window.__proto = { openGame: openGame, closeGame: closeGame, toggleChat: toggleChat, loopHeight: function () { return H; } };
})();
