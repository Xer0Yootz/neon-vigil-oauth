/* Neon Vigil sign-in gate for the Gigas Garden page. The game file loads it from a tag near the top of <head>;
   vite.config.js and backend/server.js set that tag's data-mode (or add the tag if it is missing). */
(function () {
  var me = document.currentScript;
  var mode = (me && me.getAttribute('data-mode')) || 'server';
  var root = new URL('./', me.src).href; // app root, where auth-gate.js lives
  var signIn = root + '?next=' + encodeURIComponent(location.pathname + location.search);
  function localSession() {
    try {
      var s = JSON.parse(localStorage.getItem('nv-vigil-session') || 'null');
      return !!(s && s.exp > Date.now());
    } catch (e) { return false; }
  }
  if (mode === 'server') {
    // The backend already gates this page; this covers the Vite dev server, where it is served directly.
    var hide = document.createElement('style');
    hide.textContent = 'html{visibility:hidden}';
    document.head.appendChild(hide);
    fetch(root + 'api/auth/me', { credentials: 'include' })
      .then(function (r) { if (r.ok) hide.remove(); else location.replace(signIn); })
      .catch(function () { location.replace(signIn); });
  } else if (!localSession()) {
    location.replace(signIn);
    return;
  }

  // Icon-only way back to the hub and chat, styled like the game's HUD buttons.
  var ICONS = {
    hub: '<path d="M12 2L22 7V17L12 22L2 17V7Z"/><path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5Z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  };
  function addNav() {
    var css = document.createElement('style');
    css.textContent =
      '#nv-gate-nav{position:fixed;left:8px;top:50%;transform:translateY(-50%);z-index:2147483000;display:flex;flex-direction:column;gap:8px}' +
      '#nv-gate-nav a{width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:#00f0ff;' +
      'background:rgba(6,8,20,.72);border:1px solid rgba(0,240,255,.45);box-shadow:0 0 8px rgba(0,240,255,.25);text-decoration:none}' +
      '#nv-gate-nav a:hover,#nv-gate-nav a:focus-visible{color:#ff4fd8;border-color:#ff4fd8;box-shadow:0 0 10px rgba(255,79,216,.45)}';
    document.head.appendChild(css);
    var nav = document.createElement('nav');
    nav.id = 'nv-gate-nav';
    nav.setAttribute('aria-label', 'Neon Vigil');
    [['hub', 'Back to hub'], ['chat', 'Chat']].forEach(function (it) {
      var a = document.createElement('a');
      a.href = root + it[0];
      a.title = it[1];
      a.setAttribute('aria-label', it[1]);
      a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + ICONS[it[0]] + '</svg>';
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
  }
  if (document.body) addNav(); else document.addEventListener('DOMContentLoaded', addNav);
})();
