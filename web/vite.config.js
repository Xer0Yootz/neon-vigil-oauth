import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const AUTH_MODE = (process.env.VITE_AUTH_MODE || 'server').toLowerCase();

// Puts the sign-in gate (public/auth-gate.js) in front of the Gigas Garden page without editing the game file,
// which is also the standalone Remix build. Dev: served on the fly. Build: written into dist.
function gigasGate() {
  const tag = `<script src="../auth-gate.js" data-mode="${AUTH_MODE}"></script>`;
  const inject = (html) => html.replace(/<head>/i, (m) => `${m}\n  ${tag}`);
  let cfg;
  return {
    name: 'gigas-gate',
    configResolved(c) { cfg = c; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        const game = `${cfg.base}gigas-garden`;
        if (url === game) {
          res.statusCode = 302;
          res.setHeader('Location', `${game}/`);
          return res.end();
        }
        if (url !== `${game}/` && url !== `${game}/index.html`) return next();
        const html = fs.readFileSync(path.resolve(cfg.publicDir, 'gigas-garden/index.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(inject(html));
      });
    },
    closeBundle() {
      const out = path.resolve(cfg.root, cfg.build.outDir);
      const game = path.join(out, 'gigas-garden/index.html');
      if (fs.existsSync(game)) fs.writeFileSync(game, inject(fs.readFileSync(game, 'utf8')));
      // GitHub Pages has no SPA rewrites; its 404.html fallback boots the app on deep links like /hub.
      const index = path.join(out, 'index.html');
      if (fs.existsSync(index)) fs.copyFileSync(index, path.join(out, '404.html'));
    }
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || '/', // '/neon-vigil-oauth/' for https://xer0yootz.github.io/neon-vigil-oauth/
  plugins: [react(), gigasGate()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000'
    }
  }
});
