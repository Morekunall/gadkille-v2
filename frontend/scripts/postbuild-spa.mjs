import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const redirectsPath = join(distDir, '_redirects');

if (!existsSync(indexPath)) {
  console.error('postbuild-spa: dist/index.html not found — run vite build first');
  process.exit(1);
}

// Render / Netlify-style SPA fallback
copyFileSync(indexPath, join(distDir, '404.html'));

const redirects = `/*    /index.html   200
/login    /index.html   200
/explore  /index.html   200
/admin    /index.html   200
/dashboard    /index.html   200
/fort/*    /index.html   200
/trek/*    /index.html   200
`;

writeFileSync(redirectsPath, redirects, 'utf8');
console.log('postbuild-spa: wrote dist/_redirects and dist/404.html');
