/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// El sitio pasa por dos etapas, y la única diferencia entre ellas es si hay
// dominio propio:
//
//   1. Antes de comprar el dominio vive en `usuario.github.io/<repo>/` y
//      necesita basePath.
//   2. Con el dominio, vive en la raíz y NO debe llevarlo (si lo llevara,
//      todos los CSS y JS apuntarían a /<repo>/… y la página saldría en
//      blanco).
//
// Esa diferencia queda escrita en `public/CNAME`, que es justo el archivo que
// hay que añadir para servir el sitio en el dominio. Así que se deduce de ahí
// y no hay que acordarse de tocar nada más al hacer el cambio.
const hasCustomDomain = fs.existsSync(path.join(__dirname, 'public', 'CNAME'));
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const basePath = isGithubPages && !hasCustomDomain && repo ? `/${repo}` : '';

// Sin la config de Firebase el sitio compila igual, se despliega igual, y a
// todo el que abra su enlace le dice "este enlace no funciona". Un fallo así,
// en la única pantalla que ven trescientas personas, no puede ser silencioso:
// mejor que no llegue a publicarse.
if (isGithubPages) {
  const missing = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Falta la config de Firebase: ${missing.join(', ')}. ` +
        'Son los mismos valores que los del gestor; añádelos como secrets del ' +
        'repositorio — ver README > "Firebase".'
    );
  }
}

const nextConfig = {
  // Exportación 100% estática: genera la carpeta /out lista para GitHub Pages.
  output: 'export',
  trailingSlash: true,
  images: {
    // next/image necesita un servidor para optimizar; en estático lo desactivamos.
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
};

module.exports = nextConfig;
