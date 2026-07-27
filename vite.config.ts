import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * Publica /admin y /mi-inscripcion como páginas reales.
 *
 * No se puede resolver con una regla de _redirects: Cloudflare Pages
 * canonicaliza cualquier ruta que termine en /index.html y la redirige a /,
 * así que la reescritura nunca llega al SPA. Con un index.html propio en
 * cada carpeta, la ruta se sirve como archivo estático y el enrutado del
 * cliente (main.tsx, según pathname) hace el resto.
 */
const RUTAS_PROPIAS = ['admin', 'mi-inscripcion'];

const paginasPropias = (): Plugin => ({
  name: 'paginas-propias',
  closeBundle() {
    const dist = path.resolve(__dirname, 'dist');
    const origen = path.join(dist, 'index.html');
    if (!fs.existsSync(origen)) return;
    for (const ruta of RUTAS_PROPIAS) {
      const destino = path.join(dist, ruta);
      fs.mkdirSync(destino, {recursive: true});
      fs.copyFileSync(origen, path.join(destino, 'index.html'));
    }
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), paginasPropias()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
