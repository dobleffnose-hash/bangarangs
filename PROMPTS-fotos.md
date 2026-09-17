# Prompts para las fotos con modelo (Gemini / Nano Banana)

Cómo usarlos: en Gemini, subí **la foto real de la prenda** (la de frente, y si tenés la de espalda también) y pegá el prompt = **BASE + PRENDA + VARIANTE**. Una imagen por prompt. Generá 3 o 4 versiones de cada una y quedate con la que pase el control de calidad del final.

Siempre la misma modelo, el mismo fondo y la misma luz en todas: eso es lo que hace que el catálogo se vea profesional.

---

## BASE (va siempre primero)

> Foto de catálogo de moda, realista, calidad de estudio. Usá EXACTAMENTE la prenda de la imagen de referencia: mismos colores, mismo orden y grosor de las franjas y rayas, mismos breteles, mismos botones y la misma cantidad. No agregues estampados, texturas ni detalles que no estén en la referencia, no cambies las proporciones ni el largo de la prenda. Modelo mujer de unos 25 años, pelo castaño lacio a la altura de los hombros, maquillaje natural, sin accesorios. Lleva jean recto celeste claro de tiro alto. Fondo de estudio liso color blanco roto, sin objetos ni muebles. Luz natural suave y difusa, sin sombras duras. Cámara a la altura del pecho, lente de 50 mm. Sin texto, sin logos, sin marca de agua.

## PRENDA (elegí la que corresponde)

**Musculosa Terracota (`musc-terracota`)**
> La prenda es una musculosa tejida de punto fino, ajustada al cuerpo, con breteles finos regulables verde oliva oscuro. De arriba hacia abajo: un bloque verde oliva muy oscuro que ocupa más de la mitad, después una franja terracota (naranja quemado) con una única línea fina oscura en el medio, y en el ruedo rayas horizontales finas alternadas crema y oliva oscuro. Termina a la altura de la cadera.

**Musculosa Oliva y Lima (`musc-lima`)**
> La prenda es una musculosa tejida de punto fino, ajustada al cuerpo, con breteles finos regulables verde oliva oscuro. De arriba hacia abajo: un bloque verde oliva muy oscuro que ocupa más de la mitad, después una franja beige arena con dos líneas finas oscuras, y en el ruedo rayas horizontales finas alternadas verde lima y oliva oscuro. Termina a la altura de la cadera.

**Musculosa Lila (`musc-lila`)**
> La prenda es una musculosa tejida de punto fino, ajustada al cuerpo, con breteles finos regulables beige. De arriba hacia abajo: un bloque beige claro que ocupa más de la mitad, después una franja lila pastel con una única línea fina beige en el medio, y en el ruedo rayas horizontales finas alternadas verde claro pastel y beige. Termina a la altura de la cadera.

**Bolero Verde (`bolero-verde`)**
> La prenda es un bolero corto tejido de punto fino acanalado, verde oliva oscuro liso, cuello redondo, manga larga ajustada, con una botonera al frente de siete botones chicos redondos del mismo color. Es muy corto: termina justo debajo del pecho. Debajo lleva un top blanco liso.

**Bolero Beige (`bolero-beige`)**
> La prenda es un bolero corto tejido de punto fino acanalado, beige crema liso, cuello redondo, manga larga ajustada, con una botonera al frente de siete botones chicos redondos del mismo color. Es muy corto: termina justo debajo del pecho. Debajo lleva un top blanco liso.

**Conjuntos** (subí las dos fotos reales)
> Lleva las dos prendas de las imágenes de referencia: la musculosa [describir como arriba] y encima el bolero [describir como arriba], abierto, sin abrochar, de modo que se vea la franja y las rayas de la musculosa.

- `conj-terracota-verde`: Musculosa Terracota + Bolero Verde
- `conj-lima-verde`: Musculosa Oliva y Lima + Bolero Verde
- `conj-lila-beige`: Musculosa Lila + Bolero Beige
- `promo-verde`: Musculosa Terracota + Bolero Verde (la misma foto que `conj-terracota-verde` sirve)

## VARIANTE (una por foto)

| Archivo | Agregar al final |
|---|---|
| `ia-1.webp` | Plano de cuerpo entero hasta las rodillas, de frente, pose relajada, brazos sueltos, mirando a cámara. Formato vertical 3:4. |
| `ia-2.webp` | Plano de cuerpo entero hasta las rodillas, de tres cuartos de perfil, una mano en el bolsillo del jean, mirando a cámara. Formato vertical 3:4. |
| `ia-3.webp` | Plano cerrado del torso, del cuello a la cadera, para ver la textura del tejido y las franjas. Formato vertical 3:4. |
| `portada.webp` | Plano horizontal amplio, formato 16:9, la modelo parada en el tercio derecho de la imagen, cuerpo entero, con espacio vacío del fondo a la izquierda para poner texto. Lleva el conjunto Musculosa Terracota + Bolero Verde abierto. |

## Control de calidad (antes de subir cada imagen)

Compará con la prenda real y descartá si falla cualquiera de estos:

- Orden de los bloques: oscuro arriba / franja / rayas abajo (en la Lila: beige arriba / lila / rayas verdes).
- La franja tiene 1 línea (Terracota y Lila) o 2 líneas (Oliva y Lima), ni más ni menos.
- Las rayas del ruedo son finas y muchas, no tres o cuatro rayas gruesas.
- Breteles finos, no anchos, y del color correcto.
- Boleros: exactamente 7 botones, cuello redondo, largo hasta debajo del pecho, manga larga.
- Nada de estampados, logos, cinturones, joyas o accesorios inventados.
- Manos y dedos normales, cara sin deformaciones.
- Misma modelo, mismo fondo y misma luz que las otras fotos ya aprobadas.

## Después

1. Nombrá cada imagen como dice la tabla y ponela en `img/productos/{id}/`.
2. Convertila a `.webp` de menos de 300 KB (ver README, sección "Fotos").
3. `git push` y en un minuto está en el sitio.
