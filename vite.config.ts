import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * Publica el panel en /admin como página real.
 *
 * No se puede resolver con una regla de _redirects: Cloudflare Pages
 * canonicaliza cualquier ruta que termine en /index.html y la redirige a /,
 * así que la reescritura nunca llega al SPA. Con un index.html propio en
 * dist/admin/ la ruta se sirve como archivo estático y el enrutado del
 * cliente hace el resto.
 */
const paginaAdmin = (): Plugin => ({
  name: 'pagina-admin',
  closeBundle() {
    const dist = path.resolve(__dirname, 'dist');
    const origen = path.join(dist, 'index.html');
    if (!fs.existsSync(origen)) return;
    const destino = path.join(dist, 'admin');
    fs.mkdirSync(destino, {recursive: true});
    fs.copyFileSync(origen, path.join(destino, 'index.html'));
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), paginaAdmin()],
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
