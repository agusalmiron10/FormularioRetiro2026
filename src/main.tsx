import {StrictMode} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import MiInscripcion from './MiInscripcion.tsx';
import './index.css';

// El panel vive en /admin, el portal personal en /mi-inscripcion; el resto
// del sitio es el formulario público.
const ruta = window.location.pathname.replace(/\/+$/, '');

const paginas: Record<string, ComponentType> = {
  '/admin': AdminApp,
  '/mi-inscripcion': MiInscripcion
};

const Pagina = paginas[ruta] ?? App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Pagina />
  </StrictMode>,
);
