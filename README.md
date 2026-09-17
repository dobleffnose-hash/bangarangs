# Bangarangs · catálogo

Sitio estático de catálogo para vender prendas Twinset Milano de archivo. Sin carrito ni pagos: cada prenda abre WhatsApp con el mensaje armado.

HTML, CSS y JavaScript puros. No hay que instalar ni compilar nada: se abre `index.html` con doble clic y funciona.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `js/config.js` | Nombre de la tienda, número de WhatsApp, Instagram y descuento por transferencia |
| `data/productos.js` | Prendas, precios, stock por talle, medidas, conjuntos y promo |
| `img/productos/{id}/` | Fotos de cada prenda (ver "Fotos") |
| `index.html`, `css/estilos.css`, `js/app.js` | La página. Normalmente no hace falta tocarlos |
| `img/og.jpg` | Imagen que aparece al compartir el link (1200 × 630). Es provisoria: reemplazala por una foto real |
| `img/portada.webp` | Foto grande de la portada (todavía no está; mientras tanto se ve el bloque verde) |

## Cómo editar

### Cambiar un precio o el stock

Abrí `data/productos.js`, buscá la prenda por su `id` y cambiá el número:

```js
"precio": 38000,
"stock": { "S": 7, "M": 16, "L": 8 },
```

- Un talle con stock `0` aparece tachado y no se puede elegir.
- Si todos los talles están en `0`, la prenda muestra "Agotado" y pierde el botón de WhatsApp.
- Con 3 unidades o menos en algún talle aparece "Últimas unidades".
- Los conjuntos y la promo no tienen stock propio: se calcula solo como el mínimo entre las prendas que los forman.

El precio con transferencia se calcula solo a partir de `DESCUENTO_TRANSFERENCIA` en `js/config.js`. Con `0` deja de mostrarse.

### Cambiar WhatsApp, nombre o Instagram

Todo en `js/config.js`:

```js
NOMBRE_TIENDA: 'Bangarangs',
WHATSAPP: '5491125458525',   // código de país + área + número, sin + ni espacios ni el 15
INSTAGRAM: '',               // usuario sin @; vacío oculta el link
DESCUENTO_TRANSFERENCIA: 0.10,
```

El título de la pestaña y los textos de Open Graph están en las primeras líneas de `index.html`; si cambiás el nombre de la tienda, actualizalos ahí también.

### Renombrar la musculosa "Oliva y Lima"

Quedó pendiente confirmar esa prenda (en el conteo figura como "VERDE / BEIGE / LILA"). En `data/productos.js` está marcada con un comentario: cambiá `nombre`, `descripcion` y `color`, y si hace falta el nombre del conjunto `conj-lima-verde`.

### Completar medidas y composición

En cada prenda de `data/productos.js`, reemplazá los `__` de `medidas` y el texto `"A completar"` de `composicion`.

## Fotos

Cada prenda tiene su carpeta en `img/productos/` con el mismo nombre que su `id`. Dentro van estos archivos, en `.webp` y de menos de 300 KB:

| Archivo | Qué es |
|---|---|
| `ia-1.webp` | Modelo generada con IA, de frente (es la foto principal) |
| `ia-2.webp` | Modelo generada con IA, de costado (aparece al pasar el mouse por la tarjeta) |
| `ia-3.webp` | Modelo generada con IA, detalle del tejido |
| `real-frente.webp` | Foto real de la prenda |
| `real-espalda.webp` | Foto real de la espalda |
| `real-etiqueta.webp` | Foto real de la etiqueta |

Los conjuntos y la promo solo usan `ia-1`, `ia-2` e `ia-3`. Mientras falte alguna foto, el sitio muestra un cuadro del color de la prenda con su nombre: no hay que hacer nada, cuando copiás el archivo aparece.

Si una prenda va a tener menos fotos (por ejemplo, solo una real), agregale a su entrada en `productos.js` la lista exacta:

```js
"fotos_ia": ["img/productos/musc-lila/ia-1.webp"],
"fotos_reales": ["img/productos/musc-lila/real-frente.webp"],
```

### Convertir fotos a .webp

**Sin instalar nada:** entrá a [squoosh.app](https://squoosh.app), arrastrá la foto, elegí WebP a la derecha, calidad 80, y bajá el tamaño ("Resize") a 1600 px de lado mayor hasta que pese menos de 300 KB. Descargá y renombrá.

**Con Node (varias fotos de una vez):**

```bash
npm install sharp
node scripts/convertir-webp.mjs carpeta-con-fotos img/productos/musc-lila
```

Convierte todas las jpg/png de la carpeta, las reduce a 1600 px y baja la calidad hasta que pesen menos de 300 KB. Después renombrá cada archivo según la tabla de arriba.

### Prompts para generar las fotos con modelo

Están en el brief del proyecto (sección 7). En resumen: subir siempre la foto real como referencia, misma modelo, mismo fondo lino, y descartar las imágenes donde cambien los colores, las rayas o los botones.

## Probar localmente

Doble clic en `index.html` alcanza. Si preferís un servidor local (por ejemplo para probar en el celular por wifi):

```bash
python -m http.server 8000
```

y entrá a `http://localhost:8000`.

## Publicar en GitHub Pages

1. Creá un repositorio público en GitHub, por ejemplo `bangarangs`.
2. Subí todos los archivos a la rama `main` (con GitHub Desktop o desde la web con "Add file > Upload files").
3. En el repositorio, andá a **Settings > Pages**. En "Build and deployment" elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guardá.
4. En uno o dos minutos el sitio queda en `https://USUARIO.github.io/bangarangs/`.

Cada vez que subís un cambio a `main`, el sitio se actualiza solo en un minuto.

Una vez publicado, abrí `index.html` y reemplazá `USUARIO` en las tres líneas marcadas del `<head>` (`canonical`, `og:url` y `og:image`) por tu usuario de GitHub, o por el dominio propio si lo tenés. WhatsApp e Instagram solo muestran la imagen de vista previa si la dirección es completa.

### Dominio propio (opcional)

1. Registrá un `.com.ar` en [nic.ar](https://nic.ar).
2. Creá en la raíz del repositorio un archivo llamado `CNAME` (sin extensión) con el dominio adentro, por ejemplo `bangarangs.com.ar`.
3. En el panel DNS del dominio agregá los registros que indica GitHub: cuatro registros `A` apuntando a `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`, y un `CNAME` de `www` a `USUARIO.github.io`.
4. En **Settings > Pages** escribí el dominio en "Custom domain", esperá que verifique y activá **Enforce HTTPS**.

## Checklist antes de lanzar

- [ ] `WHATSAPP` en `js/config.js` con el número real.
- [ ] `USUARIO` reemplazado en las tres líneas del `<head>` de `index.html`.
- [ ] Fotos en todas las carpetas de `img/productos/`.
- [ ] `img/portada.webp` (horizontal, con espacio libre a la izquierda para el titular).
- [ ] `img/og.jpg` con una foto real.
- [ ] Medidas y composición completas.
- [ ] Nombre de la musculosa "Oliva y Lima" confirmado.
