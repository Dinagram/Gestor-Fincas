/**
 * Genera PNG placeholders del logo DD² en public/assets/brand/ (+ favicon).
 * Son marcadores temporales con la marca geométrica; sustitúyelos por los
 * PNG oficiales manteniendo los MISMOS nombres y la UI los recogerá sin más.
 *
 *   node scripts/gen-brand-placeholders.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const BRONCE = '#3D332A';
const BEIGE = '#E9DDC6';
const TINTA = '#2A2520';
const TERRACOTA = '#A85D2B';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = path.join(root, 'public', 'assets', 'brand');
const appDir = path.join(root, 'src', 'app');

// Marca geométrica (fachada estilizada) — solo formas, rasteriza siempre.
function marca({ disc, ink, outline = false }) {
  const discEl = outline
    ? `<circle cx="32" cy="32" r="30.5" fill="none" stroke="${ink}" stroke-width="1.5"/>`
    : `<circle cx="32" cy="32" r="31" fill="${disc}"/>`;
  const windows = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      windows.push(
        `<rect x="${27 + c * 7}" y="${26 + r * 5}" width="3" height="3" rx="0.4" fill="${disc}"/>`,
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    ${discEl}
    <rect x="24" y="22" width="16" height="24" rx="1.5" fill="${ink}"/>
    ${windows.join('')}
    <rect x="30" y="40" width="4" height="6" rx="0.5" fill="${disc}"/>
  </svg>`;
}

// Lockup horizontal: marca + barras (placeholder del wordmark).
function horizontal() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80">
    <circle cx="40" cy="40" r="32" fill="${BRONCE}"/>
    <rect x="25" y="24" width="30" height="32" rx="2" fill="${BEIGE}"/>
    <rect x="48" y="40" width="9" height="4" rx="1" fill="${TERRACOTA}"/>
    <rect x="92" y="28" width="150" height="11" rx="3" fill="${TINTA}"/>
    <rect x="92" y="46" width="96" height="7" rx="3" fill="${TERRACOTA}"/>
  </svg>`;
}

async function png(svg, file, width) {
  await sharp(Buffer.from(svg)).resize({ width }).png().toFile(file);
  console.log('+', path.relative(root, file));
}

async function main() {
  await mkdir(brandDir, { recursive: true });

  const marcaBronce = marca({ disc: BRONCE, ink: BEIGE });
  const marcaBeige = marca({ disc: BEIGE, ink: BRONCE });
  const marcaOscuro = marca({ disc: TINTA, ink: BEIGE });
  const marcaContorno = marca({ disc: 'none', ink: BRONCE, outline: true });

  await Promise.all([
    png(marcaBronce, path.join(brandDir, 'logo_principal.png'), 512),
    png(marcaBeige, path.join(brandDir, 'logo_negativo.png'), 512),
    png(marcaContorno, path.join(brandDir, 'logo_contorno.png'), 512),
    png(marcaOscuro, path.join(brandDir, 'logo_oscuro.png'), 512),
    png(horizontal(), path.join(brandDir, 'logo_horizontal.png'), 900),
    png(marcaBronce, path.join(brandDir, 'marca_bronce.png'), 512),
    png(marcaBeige, path.join(brandDir, 'marca_beige.png'), 512),
    // favicon (app router lo recoge automáticamente)
    png(marcaBronce, path.join(appDir, 'icon.png'), 256),
  ]);

  console.log('Hecho. Sustituye los PNG por los oficiales (mismos nombres).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
