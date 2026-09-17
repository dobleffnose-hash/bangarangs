"""Genera las fotos con modelo usando Gemini (Nano Banana) a partir de las fotos reales.

Uso:
  python scripts/generar-fotos-ia.py musc-terracota ia-1            # 2 versiones
  python scripts/generar-fotos-ia.py musc-terracota ia-1 --n 4
  python scripts/generar-fotos-ia.py conj-lima-verde ia-2 --modelo fotos-ia/musc-terracota/ia-1-v1.png
  python scripts/generar-fotos-ia.py portada portada
  python scripts/generar-fotos-ia.py musc-lila real-frente          # limpia la foto real (fondo blanco)

La clave se lee de la variable GEMINI_API_KEY o del archivo C:/Users/IAN/.gemini_key.
Las salidas van a fotos-ia/{id}/{toma}-vN.png (no se suben al repo). Después se eligen y se convierten a webp.
"""
import base64, json, os, sys, time, urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MODELO_API = 'gemini-2.5-flash-image'

BASE = ("Realistic fashion e-commerce catalog photograph, studio quality. Use EXACTLY the garment from the reference "
        "image(s): same colors, same order and thickness of the color blocks and stripes, same straps, same buttons and "
        "the same number of them. Do not add patterns, textures or details that are not in the reference; do not change "
        "the garment's proportions or length. Model: woman around 25, straight brown shoulder-length hair, natural "
        "makeup, no jewelry or accessories, wearing light-blue high-waisted straight-leg jeans. Plain off-white studio "
        "background, no props or furniture. Soft diffused natural light, no harsh shadows. Camera at chest height, "
        "50 mm lens. No text, no logos, no watermark.")

MUSC = ("The garment is a fitted fine-knit camisole top with thin adjustable {bretel} spaghetti straps. From top to "
        "bottom: a {arriba} block covering more than half of the top, then a {franja} band with {lineas}, and at the hem "
        "many thin alternating horizontal stripes in {rayas}. It ends at the hip.")
BOLERO = ("The garment is a very short cropped cardigan (bolero) in fine ribbed knit, plain {color}, round neckline, "
          "long fitted sleeves, with a front placket of seven small round buttons in the same color. It ends right "
          "below the bust.")
TOP_BLANCO = " Underneath she wears a plain white fitted top."

PRENDAS = {
    'musc-terracota': MUSC.format(bretel='dark olive', arriba='very dark olive green', franja='terracotta (burnt orange)',
                                  lineas='a single thin dark line through the middle', rayas='cream and dark olive'),
    'musc-lima': MUSC.format(bretel='dark olive', arriba='very dark olive green', franja='sand beige',
                             lineas='two thin dark lines', rayas='lime green and dark olive'),
    'musc-lila': MUSC.format(bretel='beige', arriba='light beige', franja='pastel lilac',
                             lineas='a single thin beige line through the middle', rayas='pale pastel green and beige'),
    'bolero-verde': BOLERO.format(color='dark olive green') + TOP_BLANCO,
    'bolero-beige': BOLERO.format(color='cream beige') + TOP_BLANCO,
}
CONJUNTOS = {  # id: (musculosa, bolero)
    'conj-terracota-verde': ('musc-terracota', 'bolero-verde'),
    'conj-lima-verde': ('musc-lima', 'bolero-verde'),
    'conj-lila-beige': ('musc-lila', 'bolero-beige'),
    'promo-verde': ('musc-terracota', 'bolero-verde'),
    'portada': ('musc-terracota', 'bolero-verde'),
}

TOMAS = {
    'ia-1': ('Full-body shot down to the knees, facing the camera, relaxed pose, arms loose, looking at the camera.', '3:4'),
    'ia-2': ('Full-body shot down to the knees, three-quarter angle, one hand in the jeans pocket, looking at the camera.', '3:4'),
    'ia-3': ('Close-up of the torso from the neck to the hips, to show the knit texture and the color blocks.', '3:4'),
    'portada': ('Wide horizontal shot. The model stands full-body in the right third of the frame; the left two thirds '
                'are empty background, for text. Same model, background and light as the catalog photos.', '16:9'),
    'real-frente': None, 'real-espalda': None, 'real-etiqueta': None,  # limpieza de foto real
}
LIMPIEZA = ("Edit this product photo. Keep the garment exactly as it is: do not change colors, stripes, buttons, "
            "texture or proportions. Replace the marble background with a plain white studio background. Straighten "
            "the image so the garment is vertical and centered, {orientacion}. Even soft light, remove the phone and "
            "person shadows. Remove the white paper tag and its thread, keep the black cardboard brand tag where it "
            "is. Vertical 3:4 format, realistic online-store product photo.")


def clave():
    k = os.environ.get('GEMINI_API_KEY') or (Path.home() / '.gemini_key').read_text().strip()
    if not k: sys.exit('Falta la clave: variable GEMINI_API_KEY o archivo ~/.gemini_key')
    return k


def imagen_b64(ruta):
    mime = 'image/webp' if ruta.suffix == '.webp' else 'image/png' if ruta.suffix == '.png' else 'image/jpeg'
    return {'inline_data': {'mime_type': mime, 'data': base64.b64encode(ruta.read_bytes()).decode()}}


def armar(pid, toma, modelo_ref):
    """Devuelve (prompt, [rutas de referencia], aspecto)."""
    if toma.startswith('real-'):
        orient = 'straps up' if pid.startswith('musc') else 'neckline up, sleeves to the sides'
        return LIMPIEZA.format(orientacion=orient), [RAIZ / 'img/productos' / pid / f'{toma}.webp'], '3:4'
    detalle, aspecto = TOMAS[toma]
    if pid in PRENDAS:
        refs = [RAIZ / 'img/productos' / pid / 'real-frente.webp']
        texto = f'{BASE} {PRENDAS[pid]} {detalle}'
    else:
        m, b = CONJUNTOS[pid]
        refs = [RAIZ / 'img/productos' / m / 'real-frente.webp', RAIZ / 'img/productos' / b / 'real-frente.webp']
        texto = (f'{BASE} She wears two garments from the reference images. First reference: {PRENDAS[m]} '
                 f'Second reference: {PRENDAS[b].replace(TOP_BLANCO, "")} '
                 f'The bolero is worn OPEN, unbuttoned, over the camisole, so the camisole\'s band and stripes stay visible. {detalle}')
    if modelo_ref:
        refs.append(Path(modelo_ref))
        texto += ' The last reference image shows the model, background and lighting: use the SAME woman, same hair, same jeans, same background and same light.'
    return texto, refs, aspecto


def generar(pid, toma, n=2, modelo_ref=None):
    texto, refs, aspecto = armar(pid, toma, modelo_ref)
    salida = RAIZ / 'fotos-ia' / pid
    salida.mkdir(parents=True, exist_ok=True)
    cuerpo = {
        'contents': [{'parts': [imagen_b64(r) for r in refs] + [{'text': texto}]}],
        'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspecto}},
    }
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODELO_API}:generateContent'
    req = urllib.request.Request(url, data=json.dumps(cuerpo).encode(), method='POST',
                                 headers={'Content-Type': 'application/json', 'x-goog-api-key': clave()})
    hechas = []
    for i in range(1, n + 1):
        for intento in range(3):
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    datos = json.load(r)
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:300]
                if e.code in (429, 503) and intento < 2:
                    time.sleep(20); continue
                sys.exit(f'Error {e.code}: {msg}')
        partes = datos['candidates'][0]['content']['parts']
        imgs = [p['inlineData']['data'] for p in partes if 'inlineData' in p]
        if not imgs:
            print('Sin imagen en la respuesta:', json.dumps(datos)[:300]); continue
        destino = salida / f'{toma}-v{i}.png'
        destino.write_bytes(base64.b64decode(imgs[0]))
        hechas.append(destino); print('OK', destino.relative_to(RAIZ))
    return hechas


if __name__ == '__main__':
    args = sys.argv[1:]
    if len(args) < 2: sys.exit(__doc__)
    pid, toma = args[0], args[1]
    n = int(args[args.index('--n') + 1]) if '--n' in args else 2
    modelo_ref = args[args.index('--modelo') + 1] if '--modelo' in args else None
    generar(pid, toma, n, modelo_ref)
