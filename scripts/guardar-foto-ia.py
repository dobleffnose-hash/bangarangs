"""Toma la última imagen generada por Gemini en Descargas y la deja en el sitio.
Uso: python scripts/guardar-foto-ia.py musc-terracota ia-1
Guarda el original en fotos-ia/{id}/{toma}.jpg y el webp (<300 KB) en img/productos/{id}/{toma}.webp.
Para la portada: python scripts/guardar-foto-ia.py portada portada  -> img/portada.webp
"""
import os, shutil, sys
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
DESCARGAS = Path.home() / 'Downloads'
pid, toma = sys.argv[1], sys.argv[2]

origen = max(DESCARGAS.glob('Gemini_Generated_Image_*'), key=os.path.getmtime)
orig_dest = RAIZ / 'fotos-ia' / pid / f'{toma}.jpg'
orig_dest.parent.mkdir(parents=True, exist_ok=True)
shutil.move(origen, orig_dest)

im = Image.open(orig_dest).convert('RGB')
if toma == 'portada':
    salida = RAIZ / 'img/portada.webp'; im.thumbnail((2000, 2000))
else:
    salida = RAIZ / 'img/productos' / pid / f'{toma}.webp'; im.thumbnail((1200, 1600))
q = 84
while True:
    im.save(salida, 'WEBP', quality=q, method=6)
    if salida.stat().st_size <= 300 * 1024 or q <= 40: break
    q -= 8
print(f'{salida.relative_to(RAIZ)}  {im.size[0]}x{im.size[1]}  {salida.stat().st_size // 1024} KB  (original: {orig_dest.name})')
