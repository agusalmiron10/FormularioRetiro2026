import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import './index.css';

// El panel vive en /admin; el resto del sitio es el formulario público.
const esAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>{esAdmin ? <AdminApp /> : <App />}</StrictMode>,
);
