/* Bangarangs · catálogo. Lee CONFIG (js/config.js) y PRODUCTOS (data/productos.js). */
'use strict';

const TALLES = ['S', 'M', 'L'];
const porId = Object.fromEntries(PRODUCTOS.map(p => [p.id, p]));
const $ = (sel, raiz = document) => raiz.querySelector(sel);

const precio = n => '$' + n.toLocaleString('es-AR');
const precioTransf = n => Math.round(n * (1 - CONFIG.DESCUENTO_TRANSFERENCIA));
const wa = texto => `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(texto)}`;

function el(tag, attrs = {}, ...hijos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n[k] = v;
    else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  n.append(...hijos.filter(h => h != null));
  return n;
}

/* ---------- datos derivados ---------- */

// Prendas que componen un producto. Los conjuntos y la promo no tienen stock propio.
function partes(p, opcion) {
  if (p.stock) return [p.id];
  const elegida = opcion || (p.opciones && p.opciones[0]);
  return [...(elegida ? [elegida] : []), ...p.prendas];
}

function stock(p, talle, opcion) {
  if (p.stock) return p.stock[talle] || 0;
  return Math.min(...partes(p, opcion).map(id => stock(porId[id], (p.talle_fijo || {})[id] || talle)));
}

const agotado = (p, opcion) => TALLES.every(t => stock(p, t, opcion) === 0);
const ultimas = (p, opcion) => TALLES.some(t => { const s = stock(p, t, opcion); return s > 0 && s <= 3; });

const fotosIA = p => p.fotos_ia || [1, 2, 3].map(n => `img/productos/${p.id}/ia-${n}.webp`);
const fotosReales = p => p.fotos_reales || ['frente', 'espalda', 'etiqueta'].map(n => `img/productos/${p.id}/real-${n}.webp`);

function mensajeWA(p, talle, opcion) {
  const nombre = p.tipo === 'promo' ? `${porId[opcion].nombre} + bolero verde de regalo` : p.nombre;
  if (p.stock) return `Hola! Me interesa la ${nombre} en talle ${talle} (${precio(p.precio)}). ¿Está disponible?`;
  return `Hola! Me interesa ${p.tipo === 'promo' ? 'la promo' : 'el conjunto'} ${nombre} en talle ${talle} (${precio(p.precio)}).`;
}

/* ---------- imágenes ---------- */

// Cuadro del color de la prenda con su nombre, para cuando todavía no está la foto.
function marcador(p) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(p.color.slice(i, i + 2), 16));
  const claro = r * .299 + g * .587 + b * .114 > 140;
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const lineas = p.nombre.split(' ').map((w, i) => `<tspan x="1.5" dy="${i ? .3 : 0}">${esc(w)}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4"><rect width="3" height="4" fill="${p.color}"/><text x="1.5" y="1.7" font-family="Georgia,serif" font-size=".26" text-anchor="middle" fill="${claro ? '#1E2117' : '#EFEAE0'}">${lineas}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function conMarcador(img, p) {
  img.classList.remove('marcador');
  img.onerror = () => { img.onerror = null; img.src = marcador(p); img.classList.add('marcador'); };
  return img;
}
const imagen = (src, alt, p, attrs = {}) => conMarcador(el('img', { src, alt, loading: 'lazy', width: 600, height: 800, ...attrs }), p);

const altIA = p => `${p.nombre} puesta en modelo, imagen ilustrativa generada con IA`;
const altReal = (p, i) => `${p.nombre}, foto real: ${['frente', 'espalda', 'etiqueta'][i]}`;

/* ---------- piezas de interfaz ---------- */

// Selector de talle. Guarda el elegido en caja.dataset.talle.
function selectorTalles(p, caja, opcion) {
  const grupo = el('div', { class: 'talles', role: 'group', 'aria-label': 'Talle' });
  for (const t of TALLES) {
    const s = stock(p, t, opcion);
    const b = el('button', { type: 'button', 'aria-pressed': 'false' }, s ? t : el('s', {}, t));
    if (!s) { b.disabled = true; b.setAttribute('aria-label', `${t} agotado`); }
    else b.onclick = () => {
      grupo.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      caja.dataset.talle = t;
      grupo.classList.remove('pedir');
      $('.aviso', caja).hidden = true;
      $('.btn', caja).href = wa(mensajeWA(p, t, caja.dataset.opcion));
    };
    grupo.append(b);
  }
  return grupo;
}

const iconoWA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><use href="#icono-wa"/></svg>';

function botonWA(p, caja, texto, etiqueta) {
  const a = el('a', {
    class: 'btn', href: '#', target: '_blank', rel: 'noopener', 'aria-label': etiqueta,
    onclick(e) {
      const t = caja.dataset.talle;
      if (t) return;
      e.preventDefault();
      $('.talles', caja).classList.add('pedir');
      $('.aviso', caja).hidden = false;
      $('.talles button:not([disabled])', caja)?.focus();
    },
  });
  a.innerHTML = iconoWA;
  a.append(texto);
  return a;
}

function bloquePrecio(p) {
  const bloque = el('p', { class: 'precio' }, precio(p.precio));
  if (CONFIG.DESCUENTO_TRANSFERENCIA > 0) bloque.append(el('small', {}, `${precio(precioTransf(p.precio))} con transferencia`));
  return bloque;
}

// Link a un producto: sirve como URL compartible y abre el detalle sin recargar.
const enlaceDetalle = (p, attrs, ...hijos) => el('a', {
  href: '#p=' + p.id, onclick(e) { e.preventDefault(); abrirDetalle(p.id, e.currentTarget); }, ...attrs,
}, ...hijos);

function tarjeta(p) {
  const art = el('article', { class: 'tarjeta', 'data-id': p.id });
  const [f1, f2] = fotosIA(p);
  const foto = enlaceDetalle(p, { class: 'tarjeta-foto', 'aria-label': `Ver detalle de ${p.nombre}` },
    imagen(f1, altIA(p), p), imagen(f2, '', p, { 'aria-hidden': 'true' }));
  if (agotado(p)) foto.append(el('span', { class: 'etiqueta etiqueta-agotado' }, 'Agotado'));
  else if (ultimas(p)) foto.append(el('span', { class: 'etiqueta' }, 'Últimas unidades'));

  art.append(foto, el('h3', {}, enlaceDetalle(p, { class: 'enlace' }, p.nombre)), bloquePrecio(p));
  if (!agotado(p)) {
    art.append(selectorTalles(p, art), el('p', { class: 'aviso', role: 'status', hidden: true }, 'Elegí un talle para consultar'), botonWA(p, art, 'Consultar', 'Consultar por WhatsApp'));
  }
  return art;
}

/* ---------- catálogo y filtros ---------- */

const filtro = { tipo: '', talle: '' };

function renderCatalogo() {
  const lista = PRODUCTOS.filter(p => p.tipo !== 'promo'
    && (!filtro.tipo || p.tipo === filtro.tipo)
    && (!filtro.talle || stock(p, filtro.talle) > 0));
  $('#grilla-catalogo').replaceChildren(...lista.map(tarjeta));
  $('.filtros-estado').textContent = lista.length
    ? `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`
    : 'No hay productos con esos filtros.';
}

document.querySelectorAll('.filtro button').forEach(b => b.onclick = () => {
  const clave = 'tipo' in b.dataset ? 'tipo' : 'talle';
  filtro[clave] = b.dataset[clave];
  b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  renderCatalogo();
});

/* ---------- promo ---------- */

let promoOpcion = null;

function renderPromo() {
  const p = PRODUCTOS.find(x => x.tipo === 'promo');
  const sec = $('#promo');
  if (!p) return sec.remove();
  promoOpcion ||= p.opciones[0];
  sec.dataset.opcion = promoOpcion;
  delete sec.dataset.talle;

  const opciones = el('div', { class: 'opciones', role: 'group', 'aria-label': 'Elegí la musculosa' },
    ...p.opciones.map(id => el('button', {
      type: 'button', 'aria-pressed': String(id === promoOpcion),
      onclick: () => { promoOpcion = id; renderPromo(); $(`.opciones [aria-pressed="true"]`, sec).focus(); },
    }, porId[id].nombre.replace('Musculosa tejida ', ''))));

  const texto = el('div', { class: 'promo-texto' },
    el('p', { class: 'sello' }, precio(p.precio)),
    el('h2', { id: 'promo-titulo' }, p.nombre),
    el('p', {}, p.descripcion),
    CONFIG.DESCUENTO_TRANSFERENCIA > 0 ? el('p', { class: 'transf' }, `${precio(precioTransf(p.precio))} con transferencia`) : null,
    opciones,
    selectorTalles(p, sec, promoOpcion),
    el('p', { class: 'aviso', role: 'status', hidden: true }, 'Elegí un talle para consultar'),
  );
  if (agotado(p, promoOpcion)) texto.append(el('p', { class: 'etiqueta etiqueta-agotado' }, 'Agotado'));
  else texto.append(botonWA(p, sec, 'Quiero la promo por WhatsApp'));

  sec.replaceChildren(
    el('div', { class: 'promo-foto' }, imagen(fotosIA(p)[0], altIA(p), p, { loading: 'eager' })),
    texto,
  );
}

/* ---------- detalle ---------- */

const dialogo = $('#detalle');
let disparador = null;

function abrirDetalle(id, desde, opcionElegida) {
  const p = porId[id];
  if (!p) return;
  if (!dialogo.open) disparador = desde || document.activeElement;
  const opcion = opcionElegida || (p.opciones && p.opciones[0]);
  const caja = el('div', { class: 'detalle-caja', 'data-id': id, 'data-opcion': opcion });

  // galería
  const fotos = [
    ...fotosIA(p).map(src => ({ src, alt: altIA(p), tipo: 'Con modelo (IA)' })),
    ...(p.stock ? fotosReales(p).map((src, i) => ({ src, alt: altReal(p, i), tipo: 'Foto real' })) : []),
  ];
  const principal = imagen(fotos[0].src, fotos[0].alt, p, { loading: 'eager' });
  const pieFoto = el('p', { class: 'galeria-pie', 'aria-live': 'polite' }, fotos[0].tipo);
  const miniaturas = el('div', { class: 'miniaturas', role: 'group', 'aria-label': 'Fotos' },
    ...fotos.map((f, i) => el('button', {
      type: 'button', 'aria-pressed': String(i === 0), 'aria-label': `${f.tipo}, foto ${i + 1}`,
      onclick(e) {
        conMarcador(principal, p).src = f.src; principal.alt = f.alt; pieFoto.textContent = f.tipo;
        miniaturas.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === e.currentTarget));
      },
    }, imagen(f.src, '', p, { width: 120, height: 160 }))));

  // medidas: una tabla por prenda
  const medidas = partes(p, opcion).map(pid => porId[pid]).filter(x => x.medidas).map(x => el('table', { class: 'medidas' },
    el('caption', {}, partes(p, opcion).length > 1 ? x.nombre : 'Medidas'),
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Talle'), el('th', { scope: 'col' }, 'Medidas'))),
    el('tbody', {}, ...TALLES.map(t => el('tr', {}, el('th', { scope: 'row' }, t), el('td', {}, x.medidas[t] || '')))),
  ));

  const combina = (p.combina_con || []).map(cid => porId[cid]).filter(Boolean);
  const info = el('div', { class: 'detalle-info' },
    el('p', { class: 'detalle-tipo' }, { musculosa: 'Musculosa', bolero: 'Bolero', conjunto: 'Conjunto', promo: 'Promo' }[p.tipo]),
    el('h2', { id: 'detalle-titulo' }, p.nombre),
    bloquePrecio(p),
    el('p', {}, p.descripcion),
    p.composicion ? el('p', { class: 'composicion' }, el('strong', {}, 'Composición: '), p.composicion) : null,
    ...medidas,
  );
  if (p.opciones) info.append(el('h3', {}, 'Musculosa'), el('div', { class: 'opciones', role: 'group', 'aria-label': 'Elegí la musculosa' },
    ...p.opciones.map(oid => el('button', { type: 'button', 'aria-pressed': String(oid === opcion), onclick: () => abrirDetalle(id, desde, oid) },
      porId[oid].nombre.replace('Musculosa tejida ', '')))));
  if (agotado(p, opcion)) info.append(el('p', { class: 'etiqueta etiqueta-agotado' }, 'Agotado'));
  else info.append(el('h3', {}, 'Talle'), selectorTalles(p, caja, opcion), el('p', { class: 'aviso', role: 'status', hidden: true }, 'Elegí un talle para consultar'), botonWA(p, caja, 'Consultar por WhatsApp'));
  if (combina.length) info.append(
    el('h3', {}, 'Combinalo con'),
    el('ul', { class: 'combina' }, ...combina.map(c => el('li', {}, enlaceDetalle(c, { class: 'enlace' }, `${c.nombre} · ${precio(c.precio)}`)))),
  );

  caja.append(
    el('button', { type: 'button', class: 'cerrar', 'aria-label': 'Cerrar', onclick: () => dialogo.close() }, '×'),
    el('div', { class: 'galeria' }, principal, pieFoto, miniaturas),
    info,
  );
  dialogo.replaceChildren(caja);
  if (!dialogo.open) dialogo.showModal();
  dialogo.scrollTop = 0;
  history.replaceState(null, '', '#p=' + id);
}

dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); });
dialogo.addEventListener('close', () => {
  history.replaceState(null, '', location.pathname + location.search);
  disparador?.focus();
});

/* ---------- arranque ---------- */

document.title = document.title.replace('Bangarangs', CONFIG.NOMBRE_TIENDA);
document.querySelectorAll('[data-tienda]').forEach(n => n.textContent = CONFIG.NOMBRE_TIENDA);
document.querySelectorAll('[data-wa-generico]').forEach(a => a.href = wa('Hola! Tengo una consulta sobre las prendas Twinset.'));
if (CONFIG.INSTAGRAM) document.querySelectorAll('[data-instagram]').forEach(a => { a.href = 'https://instagram.com/' + CONFIG.INSTAGRAM; a.hidden = false; });

$('.anuncios-pausa').onclick = e => {
  const pausado = e.currentTarget.parentNode.classList.toggle('pausado');
  e.currentTarget.setAttribute('aria-pressed', pausado);
  e.currentTarget.textContent = pausado ? 'Reanudar' : 'Pausar';
};

renderPromo();
renderCatalogo();
$('#grilla-conjuntos').replaceChildren(...PRODUCTOS.filter(p => p.tipo === 'conjunto').map(tarjeta));

// Datos estructurados para buscadores, armados desde el mismo catálogo.
const base = location.href.split('#')[0];
document.head.append(el('script', { type: 'application/ld+json' }, JSON.stringify([
  { '@context': 'https://schema.org', '@type': 'Organization', name: CONFIG.NOMBRE_TIENDA, url: base,
    ...(CONFIG.INSTAGRAM && { sameAs: ['https://instagram.com/' + CONFIG.INSTAGRAM] }) },
  ...PRODUCTOS.filter(p => p.stock).map(p => ({
    '@context': 'https://schema.org', '@type': 'Product', name: p.nombre, description: p.descripcion, sku: p.id,
    brand: { '@type': 'Brand', name: 'Twinset Milano' }, image: new URL(fotosReales(p)[0], base).href,
    offers: { '@type': 'Offer', url: base + '#p=' + p.id, priceCurrency: 'ARS', price: p.precio,
      itemCondition: 'https://schema.org/NewCondition', availability: 'https://schema.org/' + (agotado(p) ? 'OutOfStock' : 'InStock') },
  })),
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [...document.querySelectorAll('.preguntas details')].map(d => ({
    '@type': 'Question', name: $('summary', d).textContent, acceptedAnswer: { '@type': 'Answer', text: $('p', d).textContent } })) },
])));

const idInicial = new URLSearchParams(location.hash.slice(1)).get('p');
if (idInicial) abrirDetalle(idInicial);
