// Convierte fotos (jpg/png/heic ya exportado) a .webp de menos de 300 KB, lado mayor 1600 px.
// Uso:  node scripts/convertir-webp.mjs carpeta-origen carpeta-destino
// Requiere Node 18+ y sharp:  npm install sharp
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const [origen, destino = origen] = process.argv.slice(2);
if (!origen) { console.error('Uso: node scripts/convertir-webp.mjs origen [destino]'); process.exit(1); }
await mkdir(destino, { recursive: true });

for (const archivo of await readdir(origen)) {
  if (!/\.(jpe?g|png|tiff?)$/i.test(archivo)) continue;
  const salida = join(destino, parse(archivo).name + '.webp');
  let calidad = 82;
  do {
    await sharp(join(origen, archivo)).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: calidad }).toFile(salida);
    calidad -= 8;
  } while ((await stat(salida)).size > 300 * 1024 && calidad > 40);
  console.log(archivo, '->', salida, Math.round((await stat(salida)).size / 1024) + ' KB');
}
