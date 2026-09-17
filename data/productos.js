// Catálogo. Para cambiar precio o stock, editá el número y subí el cambio.
// Un talle con stock 0 aparece tachado. Si todos están en 0, la prenda figura "Agotado".
// Las fotos se buscan en img/productos/{id}/ con estos nombres:
//   ia-1.webp, ia-2.webp, ia-3.webp, real-frente.webp, real-espalda.webp, real-etiqueta.webp
// Mientras falten, se muestra un cuadro del color de la prenda.
const PRODUCTOS = [
  {
    "id": "musc-terracota",
    "nombre": "Musculosa tejida Terracota",
    "tipo": "musculosa",
    "color": "#3E4A2E",
    "descripcion": "Musculosa tejida de punto liviano: base verde oliva oscuro, franja terracota al pecho y rayas beige en el ruedo. Breteles finos. Pieza de archivo estilo 2000, nueva con etiqueta.",
    "precio": 38000,
    "stock": { "S": 7, "M": 16, "L": 8 },
    "medidas": { "S": "Ancho __ cm / Largo __ cm", "M": "Ancho __ cm / Largo __ cm", "L": "Ancho __ cm / Largo __ cm" },
    "composicion": "A completar",
    "combina_con": ["bolero-verde", "conj-terracota-verde"]
  },
  {
    // PENDIENTE DE CONFIRMAR: en el conteo figura como "VERDE / BEIGE / LILA".
    // Si es otra prenda, cambiá "nombre", "descripcion" y "color" acá.
    "id": "musc-lima",
    "nombre": "Musculosa tejida Oliva y Lima",
    "tipo": "musculosa",
    "color": "#556B2F",
    "descripcion": "Musculosa tejida verde oliva con rayas verde lima y franja beige. Punto liviano con breteles regulables, ideal para primavera-verano.",
    "precio": 38000,
    "stock": { "S": 7, "M": 16, "L": 8 },
    "medidas": { "S": "Ancho __ cm / Largo __ cm", "M": "Ancho __ cm / Largo __ cm", "L": "Ancho __ cm / Largo __ cm" },
    "composicion": "A completar",
    "combina_con": ["bolero-verde", "conj-lima-verde"]
  },
  {
    "id": "musc-lila",
    "nombre": "Musculosa tejida Lila",
    "tipo": "musculosa",
    "color": "#D8CFC0",
    "descripcion": "Musculosa tejida beige con franja lila y rayas verde claro. Punto suave que cae liviano. Nueva con etiqueta.",
    "precio": 38000,
    "stock": { "S": 6, "M": 14, "L": 2 },
    "medidas": { "S": "Ancho __ cm / Largo __ cm", "M": "Ancho __ cm / Largo __ cm", "L": "Ancho __ cm / Largo __ cm" },
    "composicion": "A completar",
    "combina_con": ["bolero-beige", "conj-lila-beige"]
  },
  {
    "id": "bolero-verde",
    "nombre": "Bolero corto Verde",
    "tipo": "bolero",
    "color": "#4B5320",
    "descripcion": "Bolero corto verde oliva liso, tejido, manga larga y botonera al frente. Va abierto sobre una musculosa o cerrado solo.",
    "precio": 48000,
    "stock": { "S": 23, "M": 57, "L": 16 },
    "medidas": { "S": "Ancho __ cm / Largo __ cm / Manga __ cm", "M": "Ancho __ cm / Largo __ cm / Manga __ cm", "L": "Ancho __ cm / Largo __ cm / Manga __ cm" },
    "composicion": "A completar",
    "combina_con": ["musc-terracota", "musc-lima", "promo-verde"]
  },
  {
    "id": "bolero-beige",
    "nombre": "Bolero corto Beige",
    "tipo": "bolero",
    "color": "#D9CDB5",
    "descripcion": "Bolero corto beige liso, tejido, manga larga y botonera. Neutro: combina con las tres musculosas.",
    "precio": 48000,
    "stock": { "S": 2, "M": 14, "L": 3 },
    "medidas": { "S": "Ancho __ cm / Largo __ cm / Manga __ cm", "M": "Ancho __ cm / Largo __ cm / Manga __ cm", "L": "Ancho __ cm / Largo __ cm / Manga __ cm" },
    "composicion": "A completar",
    "combina_con": ["musc-lila", "conj-lila-beige"]
  },

  // Conjuntos: el stock por talle se calcula solo, como el mínimo entre las dos prendas.
  {
    "id": "conj-terracota-verde",
    "nombre": "Musculosa Terracota + Bolero Verde",
    "tipo": "conjunto",
    "color": "#3E4A2E",
    "descripcion": "Musculosa tejida Terracota con el bolero corto verde encima. El outfit completo, en el mismo talle.",
    "precio": 70000,
    "prendas": ["musc-terracota", "bolero-verde"],
    "combina_con": []
  },
  {
    "id": "conj-lima-verde",
    "nombre": "Musculosa Oliva y Lima + Bolero Verde",
    "tipo": "conjunto",
    "color": "#556B2F",
    "descripcion": "Musculosa tejida Oliva y Lima con el bolero corto verde encima. Tono sobre tono.",
    "precio": 70000,
    "prendas": ["musc-lima", "bolero-verde"],
    "combina_con": []
  },
  {
    "id": "conj-lila-beige",
    "nombre": "Musculosa Lila + Bolero Beige",
    "tipo": "conjunto",
    "color": "#D8CFC0",
    "descripcion": "Musculosa tejida Lila con el bolero corto beige encima. La combinación más clara.",
    "precio": 70000,
    "prendas": ["musc-lila", "bolero-beige"],
    "combina_con": []
  },

  // Promo destacada: se elige una de las musculosas de "opciones" en el talle de la clienta,
  // y el bolero va siempre en el talle indicado en "talle_fijo".
  {
    "id": "promo-verde",
    "nombre": "Musculosa verde + bolero verde de regalo",
    "tipo": "promo",
    "color": "#5C6E3C",
    "descripcion": "Elegís la musculosa (Terracota u Oliva y Lima) en tu talle y te llevás el bolero corto verde talle M de regalo.",
    "precio": 55000,
    "opciones": ["musc-terracota", "musc-lima"],
    "prendas": ["bolero-verde"],
    "talle_fijo": { "bolero-verde": "M" },
    "combina_con": []
  }
];
