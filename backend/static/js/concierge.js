// ==========================================
// CONFIG GLOBAL
// ==========================================
function getImageUrl(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    return '';
}

const urlParams = new URLSearchParams(window.location.search);

const hotelSlug =
    window.hotelSlug ||
    urlParams.get('hotel') ||
    '';

if (!hotelSlug) {
    console.error("❌ Hotel slug não definido");
    // throw removido — não trava mais o JS
}

const API_BASE = '/api';


let idiomaAtual   = localStorage.getItem(‘lang’) || ‘pt’;
let whatsappAtual = ‘5521999999999’;
let passeioAtual  = null;
let listaPasseios = [];

let detFotoIndex = 0;
let detFotos     = [];

const i18n = {
pt: {
btn: ‘Ver detalhes’,
vazio: ‘Nenhuma experiência disponível.’,
erro: ‘Erro ao carregar.’,
explorar: ‘Explorar’,
secao_label: ‘Passeios’,
secao_titulo: ‘Experiências disponíveis’,
sob_consulta: ‘Sob consulta’,
por_pessoa: ‘/ pessoa’,
modal_eyebrow: ‘Interesse no Passeio’,
det_eyebrow: ‘Experiência’,
lbl_data: ‘Data desejada’,
lbl_horario: ‘Horário desejado’,
lbl_nome: ‘Nome completo’,
lbl_tel: ‘Telefone’,
lbl_qtd: ‘Número de pessoas’,
resumo_passeio: ‘Passeio’,
resumo_qtd: ‘Pessoas’,
resumo_total: ‘Total estimado’,
btn_confirmar: ‘Falar no WhatsApp’,
btn_reservar_det: ‘Reservar agora’,
btn_voltar: ‘← Voltar aos detalhes’,
sucesso: ‘Redirecionando para o WhatsApp!’,
sem_imagem: ‘Sem imagem’,
wpp_msg: (nome, passeio, qtd, data, horario) => {
let msg = `Olá! Me chamo *${nome}* e tenho interesse no passeio *${passeio}* para *${qtd} pessoa(s)*`;
if (data)    msg += `, na data *${data}*`;
if (horario) msg += ` às *${horario}*`;
msg += `. Poderia confirmar a disponibilidade?`;
return msg;
},
aviso_wpp: ‘Você será direcionado ao WhatsApp do hotel para confirmar sua reserva.’,
campos_obrigatorios: ‘Por favor, preencha seu nome.’,
mapa_label: ‘Nos arredores’,
mapa_titulo: ‘Restaurantes & Centros Comerciais’,
mapa_todos: ‘Todos’,
mapa_restaurantes: ‘🍽 Restaurantes’,
mapa_compras: ‘🛍 Compras’,
mapa_carregando: ‘Carregando mapa…’,
mapa_abrir: ‘Ver no Google Maps ↗’,
mapa_ver: ‘Ver no mapa’,
},
en: {
btn: ‘See details’,
vazio: ‘No tours found.’,
erro: ‘Loading error.’,
explorar: ‘Explore’,
secao_label: ‘Tours’,
secao_titulo: ‘Available experiences’,
sob_consulta: ‘On request’,
por_pessoa: ‘/ person’,
modal_eyebrow: ‘Tour Inquiry’,
det_eyebrow: ‘Experience’,
lbl_data: ‘Preferred date’,
lbl_horario: ‘Preferred time’,
lbl_nome: ‘Full name’,
lbl_tel: ‘Phone’,
lbl_qtd: ‘Number of guests’,
resumo_passeio: ‘Tour’,
resumo_qtd: ‘Guests’,
resumo_total: ‘Estimated total’,
btn_confirmar: ‘Chat on WhatsApp’,
btn_reservar_det: ‘Book now’,
btn_voltar: ‘← Back to details’,
sucesso: ‘Redirecting to WhatsApp!’,
sem_imagem: ‘No image’,
wpp_msg: (nome, passeio, qtd, data, horario) => {
let msg = `Hello! My name is *${nome}* and I'm interested in the tour *${passeio}* for *${qtd} guest(s)*`;
if (data)    msg += ` on *${data}*`;
if (horario) msg += ` at *${horario}*`;
msg += `. Could you confirm availability?`;
return msg;
},
aviso_wpp: “You will be redirected to the hotel’s WhatsApp to confirm your booking.”,
campos_obrigatorios: ‘Please fill in your name.’,
mapa_label: ‘Nearby’,
mapa_titulo: ‘Restaurants & Shopping’,
mapa_todos: ‘All’,
mapa_restaurantes: ‘🍽 Restaurants’,
mapa_compras: ‘🛍 Shopping’,
mapa_carregando: ‘Loading map…’,
mapa_abrir: ‘View on Google Maps ↗’,
mapa_ver: ‘View on map’,
},
es: {
btn: ‘Ver detalles’,
vazio: ‘No se encontraron tours.’,
erro: ‘Error de carga.’,
explorar: ‘Explorar’,
secao_label: ‘Paseos’,
secao_titulo: ‘Experiencias disponibles’,
sob_consulta: ‘Bajo consulta’,
por_pessoa: ‘/ persona’,
modal_eyebrow: ‘Consulta de Paseo’,
det_eyebrow: ‘Experiencia’,
lbl_data: ‘Fecha preferida’,
lbl_horario: ‘Hora preferida’,
lbl_nome: ‘Nombre completo’,
lbl_tel: ‘Teléfono’,
lbl_qtd: ‘Número de personas’,
resumo_passeio: ‘Paseo’,
resumo_qtd: ‘Personas’,
resumo_total: ‘Total estimado’,
btn_confirmar: ‘Hablar en WhatsApp’,
btn_reservar_det: ‘Reservar ahora’,
btn_voltar: ‘← Volver a detalles’,
sucesso: ‘¡Redirigiendo al WhatsApp!’,
sem_imagem: ‘Sin imagen’,
wpp_msg: (nome, passeio, qtd, data, horario) => {
let msg = `¡Hola! Me llamo *${nome}* y estoy interesado/a en el paseo *${passeio}* para *${qtd} persona(s)*`;
if (data)    msg += ` en la fecha *${data}*`;
if (horario) msg += ` a las *${horario}*`;
msg += `. ¿Podría confirmar disponibilidad?`;
return msg;
},
aviso_wpp: ‘Será redirigido al WhatsApp del hotel para confirmar su reserva.’,
campos_obrigatorios: ‘Por favor, complete su nombre.’,
mapa_label: ‘Alrededores’,
mapa_titulo: ‘Restaurantes & Centros Comerciales’,
mapa_todos: ‘Todos’,
mapa_restaurantes: ‘🍽 Restaurantes’,
mapa_compras: ‘🛍 Compras’,
mapa_carregando: ‘Cargando mapa…’,
mapa_abrir: ‘Ver en Google Maps ↗’,
mapa_ver: ‘Ver en el mapa’,
},
fr: {
btn: ‘Voir détails’,
vazio: ‘Aucune visite trouvée.’,
erro: ‘Erreur de chargement.’,
explorar: ‘Explorer’,
secao_label: ‘Visites’,
secao_titulo: ‘Expériences disponibles’,
sob_consulta: ‘Sur demande’,
por_pessoa: ‘/ personne’,
modal_eyebrow: ‘Demande de Visite’,
det_eyebrow: ‘Expérience’,
lbl_data: ‘Date souhaitée’,
lbl_horario: ‘Heure souhaitée’,
lbl_nome: ‘Nom complet’,
lbl_tel: ‘Téléphone’,
lbl_qtd: ‘Nombre de personnes’,
resumo_passeio: ‘Visite’,
resumo_qtd: ‘Personnes’,
resumo_total: ‘Total estimé’,
btn_confirmar: ‘Contacter sur WhatsApp’,
btn_reservar_det: ‘Réserver maintenant’,
btn_voltar: ‘← Retour aux détails’,
sucesso: ‘Redirection vers WhatsApp!’,
sem_imagem: ‘Sans image’,
wpp_msg: (nome, passeio, qtd, data, horario) => {
let msg = `Bonjour ! Je m'appelle *${nome}* et je suis intéressé(e) par la visite *${passeio}* pour *${qtd} personne(s)*`;
if (data)    msg += ` à la date *${data}*`;
if (horario) msg += ` à *${horario}*`;
msg += `. Pourriez-vous confirmer la disponibilité ?`;
return msg;
},
aviso_wpp: “Vous serez redirigé vers le WhatsApp de l’hôtel pour confirmer votre réservation.”,
campos_obrigatorios: ‘Veuillez remplir votre nom.’,
mapa_label: ‘Aux alentours’,
mapa_titulo: ‘Restaurants & Centres Commerciaux’,
mapa_todos: ‘Tous’,
mapa_restaurantes: ‘🍽 Restaurants’,
mapa_compras: ‘🛍 Shopping’,
mapa_carregando: ‘Chargement de la carte…’,
mapa_abrir: ‘Voir sur Google Maps ↗’,
mapa_ver: ‘Voir sur la carte’,
}
};

function t(key) {
const lang = i18n[idiomaAtual] || i18n[‘pt’];
return lang[key] !== undefined ? lang[key] : (i18n[‘pt’][key] || key);
}

// ==========================================
// HOTEL (HERO)
// ==========================================
async function carregarHotel(lang) {
if (!hotelSlug) return;
try {
const res = await fetch(`${API_BASE}/hotel/${hotelSlug}/?lang=${lang}`);
if (!res.ok) { console.warn(’[carregarHotel] HTTP’, res.status); return; }
const data = await res.json();

```
    if (data.whatsapp) {
        whatsappAtual = data.whatsapp;
        const wppLink = document.getElementById('wpp-main');
        if (wppLink) wppLink.href = `https://wa.me/${data.whatsapp}`;
    }

    const heroBg = document.getElementById('hero-bg');
    if (heroBg && data.foto_capa) {
        heroBg.style.backgroundImage = `url('${data.foto_capa}')`;
        heroBg.style.opacity = '1';
    }

    const tituloEl    = document.getElementById('txt-hero-title');
    const subtituloEl = document.getElementById('txt-hero-subtitle');
    if (tituloEl && data.titulo_hero)       tituloEl.innerText    = data.titulo_hero;
    if (subtituloEl && data.subtitulo_hero) subtituloEl.innerText = data.subtitulo_hero;

    if (data.mapa_embed) {
        MAPA_GERAL_SRC = data.mapa_embed;
    }

} catch (error) {
    console.error('[carregarHotel] Erro:', error);
}
```

}

// ==========================================
// CARROSSEL PRINCIPAL
// ==========================================
let carrIndex    = 0;
let carrVisiveis = 3;
let carrTotal    = 0;

function carrosselAtualizar() {
const track   = document.getElementById(‘passeios-track’);
const btnPrev = document.getElementById(‘carr-prev’);
const btnNext = document.getElementById(‘carr-next’);
const dotsEl  = document.getElementById(‘carr-dots’);
if (!track) return;

```
const cardW = 320 + 24;
track.style.transform = `translateX(-${carrIndex * cardW}px)`;

if (btnPrev) btnPrev.disabled = carrIndex === 0;
if (btnNext) btnNext.disabled = carrIndex >= carrTotal - carrVisiveis;

if (dotsEl) {
    dotsEl.innerHTML = '';
    const numDots = Math.max(1, carrTotal - carrVisiveis + 1);
    for (let i = 0; i < numDots; i++) {
        const d     = document.createElement('button');
        d.className = 'carr-dot' + (i === carrIndex ? ' active' : '');
        d.onclick   = () => { carrIndex = i; carrosselAtualizar(); };
        dotsEl.appendChild(d);
    }
}
```

}

function carrosselMover(dir) {
const max = Math.max(0, carrTotal - carrVisiveis);
carrIndex  = Math.min(max, Math.max(0, carrIndex + dir));
carrosselAtualizar();
}

function carrosselCalcularVisiveis() {
const viewport = document.getElementById(‘passeios’);
if (!viewport) return 3;
const w = viewport.offsetWidth;
if (w < 480) return 1;
return Math.max(1, Math.floor(w / (320 + 24)));
}

function initCarrosselDrag() {
const el = document.getElementById(‘passeios’);
if (!el) return;
let startX = 0, isDragging = false;

```
const onStart = e => {
    isDragging = true;
    startX     = (e.touches ? e.touches[0].clientX : e.clientX);
    el.classList.add('dragging');
};
const onEnd = e => {
    if (!isDragging) return;
    isDragging = false;
    el.classList.remove('dragging');
    const endX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const diff = startX - endX;
    if (Math.abs(diff) > 50) carrosselMover(diff > 0 ? 1 : -1);
};

el.addEventListener('mousedown',  onStart);
el.addEventListener('touchstart', onStart, { passive: true });
el.addEventListener('mouseup',    onEnd);
el.addEventListener('touchend',   onEnd);
window.addEventListener('resize', () => {
    carrVisiveis = carrosselCalcularVisiveis();
    carrosselAtualizar();
});
```

}

// ==========================================
// PASSEIOS
// ==========================================
async function carregarPasseios(lang) {
const track = document.getElementById(‘passeios-track’);
if (!track) return;

```
if (!hotelSlug) {
    track.innerHTML = `<div class="estado-vazio" style="flex:1"><span class="icon">🏖️</span><p>${t('vazio')}</p></div>`;
    return;
}

try {
    const res = await fetch(`${API_BASE}/public/${hotelSlug}/passeios/?lang=${lang}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    listaPasseios = await res.json();

    const countEl = document.getElementById('count-passeios');
    if (countEl) countEl.innerText = `${listaPasseios.length} ${t('secao_label').toLowerCase()}`;

    if (!listaPasseios.length) {
        track.innerHTML = `<div class="estado-vazio" style="flex:1"><span class="icon">🏖️</span><p>${t('vazio')}</p></div>`;
        return;
    }

    track.innerHTML = listaPasseios.map(p => renderCard(p)).join('');
    carrTotal       = listaPasseios.length;
    carrIndex       = 0;
    carrVisiveis    = carrosselCalcularVisiveis();
    carrosselAtualizar();
    initCarrosselDrag();

} catch (e) {
    console.error('[carregarPasseios]', e);
    track.innerHTML = `<div class="estado-erro" style="flex:1"><span class="icon">⚠️</span><p>${t('erro')}</p></div>`;
}
```

}

// ==========================================
// CARD
// ==========================================
function renderCard(p) {
const precoLabel = p.preco_sob_consulta
? t(‘sob_consulta’)
: `R$ ${Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

```
const precoSub = p.preco_por_pessoa && !p.preco_sob_consulta ? t('por_pessoa') : '';

const primeiraFoto = (p.fotos && p.fotos.length)
    ? (typeof p.fotos[0] === 'string' ? p.fotos[0] : p.fotos[0].url || '')
    : '';
const imgSrc = getImageUrl(p.banner || p.imagem || p.foto || p.foto_capa || p.image || primeiraFoto);

const imgHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${p.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-img-empty\\'>🌊</div>'">`
    : `<div class="card-img-empty">🌊</div>`;

return `
<div class="card-passeio" onclick="abrirDetalhe(${p.id})">
    <div class="card-img">
        ${imgHTML}
        <span class="card-preco-badge">${precoLabel}</span>
        <div class="card-img-hover"><span>${t('btn')}</span></div>
    </div>
    <div class="card-body">
        <h3 class="card-nome">${p.nome}</h3>
        <p class="card-desc">${p.descricao || ''}</p>
        <div class="card-footer">
            <div class="card-preco">
                ${precoLabel}
                ${precoSub ? `<small>${precoSub}</small>` : ''}
            </div>
            <button class="btn-reservar" onclick="event.stopPropagation(); abrirDetalhe(${p.id})">
                ${t('btn')}
            </button>
        </div>
    </div>
</div>`;
```

}

// ==========================================
// MODAL DETALHE — Carrossel de fotos
// ==========================================
function coletarFotos(p) {
const fotos = [];
const principal = getImageUrl(p.banner || p.imagem || p.foto || p.foto_capa || p.image);
if (principal) fotos.push(principal);
const extras = p.fotos || [];
extras.forEach(f => {
const src = getImageUrl(f);
if (src && src !== principal) fotos.push(src);
});
return fotos;
}

function detFotoRender() {
const track   = document.getElementById(‘det-foto-track’);
const thumbs  = document.getElementById(‘det-foto-thumbs’);
const counter = document.getElementById(‘det-foto-counter’);
const btnPrev = document.getElementById(‘det-foto-prev’);
const btnNext = document.getElementById(‘det-foto-next’);
if (!track) return;

```
if (!detFotos.length) {
    track.innerHTML = `<div class="det-foto-slide"><div class="det-foto-slide-empty">🌊</div></div>`;
    if (thumbs)  thumbs.innerHTML      = '';
    if (counter) counter.textContent   = '';
    if (btnPrev) btnPrev.style.display = 'none';
    if (btnNext) btnNext.style.display = 'none';
    return;
}

track.innerHTML = detFotos.map(src => `
    <div class="det-foto-slide">
        <img src="${src}" alt="" onerror="this.parentElement.innerHTML='<div class=\\'det-foto-slide-empty\\'>🌊</div>'">
    </div>`).join('');

if (thumbs) thumbs.innerHTML = '';

if (btnPrev) btnPrev.style.display = detFotos.length > 1 ? 'flex' : 'none';
if (btnNext) btnNext.style.display = detFotos.length > 1 ? 'flex' : 'none';

detFotoAtualizar();
```

}

function detFotoAtualizar() {
const track   = document.getElementById(‘det-foto-track’);
const counter = document.getElementById(‘det-foto-counter’);
const btnPrev = document.getElementById(‘det-foto-prev’);
const btnNext = document.getElementById(‘det-foto-next’);
const thumbs  = document.querySelectorAll(’.det-thumb’);

```
if (track)   track.style.transform = `translateX(-${detFotoIndex * 100}%)`;
if (counter) counter.textContent   = `${detFotoIndex + 1} / ${detFotos.length}`;
if (btnPrev) btnPrev.disabled      = detFotoIndex === 0;
if (btnNext) btnNext.disabled      = detFotoIndex >= detFotos.length - 1;

thumbs.forEach((th, i) => th.classList.toggle('active', i === detFotoIndex));
```

}

function detFotoMover(dir) {
detFotoIndex = Math.min(detFotos.length - 1, Math.max(0, detFotoIndex + dir));
detFotoAtualizar();
}

function detFotoIr(index) {
detFotoIndex = index;
detFotoAtualizar();
}

// ==========================================
// ABRIR DETALHE
// ==========================================
function abrirDetalhe(passeioId) {
passeioAtual = listaPasseios.find(p => p.id === passeioId);
if (!passeioAtual) return;

```
const p = passeioAtual;
detFotos     = coletarFotos(p);
detFotoIndex = 0;
detFotoRender();

const eyebrowEl = document.getElementById('det-eyebrow');
if (eyebrowEl) eyebrowEl.innerText = t('det_eyebrow');

const nomeEl = document.getElementById('det-nome');
if (nomeEl) nomeEl.innerText = p.nome;

const descEl = document.getElementById('det-desc');
if (descEl) {
    descEl.innerHTML     = p.descricao_completa || p.descricao || '';
    descEl.style.display = descEl.innerHTML.trim() ? '' : 'none';
}

const chipsEl = document.getElementById('det-chips');
if (chipsEl) {
    const chips = [];
    if (p.duracao)   chips.push(`⏱ <span>${p.duracao}</span>`);
    if (p.nivel)     chips.push(`🎯 <span>${p.nivel}</span>`);
    if (p.inclui)    chips.push(`✅ <span>${p.inclui}</span>`);
    if (p.saida)     chips.push(`📍 <span>${p.saida}</span>`);
    if (p.idade_min) chips.push(`👤 <span>A partir de ${p.idade_min} anos</span>`);
    if (p.idiomas)   chips.push(`🌐 <span>${p.idiomas}</span>`);
    chipsEl.innerHTML     = chips.map(c => `<div class="det-chip">${c}</div>`).join('');
    chipsEl.style.display = chips.length ? '' : 'none';
}

const precoEl    = document.getElementById('det-preco');
const precoSubEl = document.getElementById('det-preco-sub');
if (precoEl) {
    if (p.preco_sob_consulta) {
        precoEl.childNodes[0].textContent = t('sob_consulta');
    } else {
        const val = Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        precoEl.childNodes[0].textContent = `R$ ${val}`;
    }
}
if (precoSubEl) {
    precoSubEl.textContent = (!p.preco_sob_consulta && p.preco_por_pessoa) ? t('por_pessoa') : '';
}

const btnDet = document.getElementById('btn-reservar-det');
if (btnDet) btnDet.textContent = t('btn_reservar_det');

initDetFotoSwipe();

document.getElementById('modalDetalhe').classList.add('open');
document.body.style.overflow = 'hidden';
```

}

function fecharDetalhe() {
document.getElementById(‘modalDetalhe’).classList.remove(‘open’);
document.body.style.overflow = ‘’;
}

function initDetFotoSwipe() {
const wrap = document.getElementById(‘det-foto-wrap’);
if (!wrap || wrap._swipeInit) return;
wrap._swipeInit = true;

```
let startX = 0;
wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
wrap.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) detFotoMover(diff > 0 ? 1 : -1);
});
```

}

// ==========================================
// MODAL RESERVA
// ==========================================
function abrirModalReservaDoDetalhe() {
if (!passeioAtual) return;
document.getElementById(‘modalDetalhe’).classList.remove(‘open’);
abrirModalReserva();
}

function abrirModalReserva() {
if (!passeioAtual) return;
const p = passeioAtual;

```
// Atualiza textos com guarda — seguro mesmo se o elemento não existir no HTML
const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
};

document.getElementById('modal-eyebrow').innerText      = t('modal_eyebrow');
document.getElementById('modal-passeio-nome').innerText = p.nome;

setEl('lbl-data',    t('lbl_data'));
setEl('lbl-horario', t('lbl_horario'));
setEl('lbl-nome',    t('lbl_nome'));
setEl('lbl-tel',     t('lbl_tel'));   // tolerante — não quebra se não existir
setEl('lbl-qtd',     t('lbl_qtd'));

setEl('resumo-label-passeio', t('resumo_passeio'));
setEl('resumo-label-qtd',     t('resumo_qtd'));
setEl('resumo-label-total',   t('resumo_total'));

const btnVoltar = document.getElementById('btn-voltar-txt');
if (btnVoltar) btnVoltar.textContent = t('btn_voltar').replace('← ', '');

const avisoEl = document.getElementById('modal-aviso-wpp');
if (avisoEl) avisoEl.textContent = t('aviso_wpp');

// Limpa campos
document.getElementById('res-nome').value    = '';
document.getElementById('res-qtd').value     = 1;
document.getElementById('res-data').value    = '';
document.getElementById('res-horario').value = '';

const resTel = document.getElementById('res-tel');
if (resTel) resTel.value = '';

document.getElementById('modal-resumo').classList.remove('show');

calcularTotal();

document.getElementById('modalReserva').classList.add('open');
document.body.style.overflow = 'hidden';
```

}

function voltarParaDetalhe() {
document.getElementById(‘modalReserva’).classList.remove(‘open’);
if (passeioAtual) {
document.getElementById(‘modalDetalhe’).classList.add(‘open’);
} else {
document.body.style.overflow = ‘’;
}
}

function fecharModalReserva() {
document.getElementById(‘modalReserva’).classList.remove(‘open’);
document.body.style.overflow = ‘’;
passeioAtual = null;
}

function abrirModal(passeioId) { abrirDetalhe(passeioId); }
function fecharModal()         { fecharDetalhe(); fecharModalReserva(); }

// ==========================================
// CALCULAR TOTAL
// ==========================================
function calcularTotal() {
if (!passeioAtual) return;

```
const qtd    = parseInt(document.getElementById('res-qtd').value) || 1;
const resumo = document.getElementById('modal-resumo');

let totalStr = '';
if (passeioAtual.preco_sob_consulta) {
    totalStr = t('sob_consulta');
} else {
    const preco = Number(passeioAtual.preco || 0);
    const total = passeioAtual.preco_por_pessoa ? preco * qtd : preco;
    totalStr = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

document.getElementById('resumo-passeio').innerText     = passeioAtual.nome;
document.getElementById('resumo-qtd').innerText         = qtd;
document.getElementById('resumo-total-valor').innerText = totalStr;
resumo.classList.add('show');
```

}

// ==========================================
// CONFIRMAR → WHATSAPP
// ==========================================
function confirmarReserva() {
const nome    = document.getElementById(‘res-nome’).value.trim();
const qtd     = parseInt(document.getElementById(‘res-qtd’).value) || 1;
const dataVal = document.getElementById(‘res-data’).value;
const horario = document.getElementById(‘res-horario’).value;

```
// Validação: apenas nome obrigatório
if (!nome) {
    mostrarToast(t('campos_obrigatorios'), 'error');
    return;
}

let dataLabel = '';
if (dataVal) {
    dataLabel = new Date(dataVal + 'T00:00:00').toLocaleDateString(
        idiomaAtual === 'pt' ? 'pt-BR' : idiomaAtual,
        { day: '2-digit', month: 'long', year: 'numeric' }
    );
}

const msgFn    = t('wpp_msg');
const mensagem = typeof msgFn === 'function'
    ? msgFn(nome, passeioAtual.nome, qtd, dataLabel, horario)
    : `Olá! Tenho interesse no passeio ${passeioAtual.nome} para ${qtd} pessoa(s).`;

const url = `https://wa.me/${whatsappAtual}?text=${encodeURIComponent(mensagem)}`;

mostrarToast(t('sucesso'), 'success');
fecharModalReserva();
window.open(url, '_blank');
```

}

// ==========================================
// TOAST
// ==========================================
function mostrarToast(msg, tipo = ‘’) {
const container = document.getElementById(‘toasts’);
const toast     = document.createElement(‘div’);
toast.className = `toast ${tipo}`;
toast.innerText = msg;
container.appendChild(toast);
setTimeout(() => toast.remove(), 3500);
}

// ==========================================
// CSRF
// ==========================================
function getCookie(name) {
for (const c of document.cookie.split(’;’)) {
const [k, v] = c.trim().split(’=’);
if (k === name) return decodeURIComponent(v);
}
return ‘’;
}

// ==========================================
// IDIOMA
// ==========================================
async function trocarIdioma(lang) {
idiomaAtual = lang;
localStorage.setItem(‘lang’, lang);

```
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
});

const scrollEl    = document.getElementById('txt-scroll');
const labelSecao  = document.getElementById('label-secao');
const tituloSecao = document.getElementById('titulo-secao');
const countEl     = document.getElementById('count-passeios');

if (scrollEl)    scrollEl.innerText    = t('explorar');
if (labelSecao)  labelSecao.innerText  = t('secao_label');
if (tituloSecao) tituloSecao.innerText = t('secao_titulo');

if (countEl && listaPasseios.length) {
    countEl.innerText = `${listaPasseios.length} ${t('secao_label').toLowerCase()}`;
}

atualizarTextosMapa();

await Promise.all([
    carregarHotel(lang),
    carregarPasseios(lang),
]);
```

}

// ==========================================
// ESC / CLICK FORA
// ==========================================
document.addEventListener(‘keydown’, e => {
if (e.key === ‘Escape’) {
if (document.getElementById(‘modalReserva’)?.classList.contains(‘open’)) {
voltarParaDetalhe();
} else if (document.getElementById(‘modalLugar’)?.classList.contains(‘open’)) {
fecharModalLugar();
} else {
fecharDetalhe();
}
}
});

document.getElementById(‘modalDetalhe’)?.addEventListener(‘click’, function(e) {
if (e.target === this) fecharDetalhe();
});

document.getElementById(‘modalReserva’)?.addEventListener(‘click’, function(e) {
if (e.target === this) voltarParaDetalhe();
});

document.getElementById(‘modalLugar’)?.addEventListener(‘click’, function(e) {
if (e.target === this) fecharModalLugar();
});

// ==========================================
// MAPA
// ==========================================
let MAPA_GERAL_SRC = ‘’;
let LUGARES        = [];

const MAPA_LABELS = {
pt: { restaurante: ‘Restaurante’, shopping: ‘Compras’,  hotelBadge: ‘★ Do Hotel’ },
en: { restaurante: ‘Restaurant’,  shopping: ‘Shopping’, hotelBadge: “★ Hotel’s Own” },
es: { restaurante: ‘Restaurante’, shopping: ‘Compras’,  hotelBadge: ‘★ Del Hotel’ },
fr: { restaurante: ‘Restaurant’,  shopping: ‘Shopping’, hotelBadge: “★ De l’Hôtel” },
};

let lugarFiltroAtivo   = ‘todos’;
let lugarSelecionadoId = null;

function atualizarTextosMapa() {
const labelEl  = document.getElementById(‘label-mapa’);
const tituloEl = document.getElementById(‘titulo-mapa’);
const loadEl   = document.getElementById(‘mapa-loading-txt’);
const btnTodos = document.getElementById(‘filtro-todos’);
const btnRest  = document.getElementById(‘filtro-restaurante’);
const btnShop  = document.getElementById(‘filtro-shopping’);

```
if (labelEl)  labelEl.innerText  = t('mapa_label');
if (tituloEl) tituloEl.innerText = t('mapa_titulo');
if (loadEl)   loadEl.innerText   = t('mapa_carregando');
if (btnTodos) btnTodos.innerText = t('mapa_todos');
if (btnRest)  btnRest.innerText  = t('mapa_restaurantes');
if (btnShop)  btnShop.innerText  = t('mapa_compras');

if (document.getElementById('mapa-cards-grid')) {
    renderLugarCards();
}
```

}

function filtrarMapa(tipo) {
lugarFiltroAtivo = tipo;

```
document.querySelectorAll('.filtro-mapa-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tipo === tipo);
});

if (lugarSelecionadoId !== null) {
    const lugar = LUGARES.find(l => l.id === lugarSelecionadoId);
    if (lugar && tipo !== 'todos' && lugar.tipo !== tipo) {
        lugarSelecionadoId = null;
        carregarMapaIframe(MAPA_GERAL_SRC);
    }
}

renderLugarCards();
```

}

function renderLugarCards() {
const grid = document.getElementById(‘mapa-cards-grid’);
if (!grid) return;

```
const L_    = MAPA_LABELS[idiomaAtual] || MAPA_LABELS['pt'];
const lista = lugarFiltroAtivo === 'todos'
    ? LUGARES
    : LUGARES.filter(l => l.tipo === lugarFiltroAtivo);

if (!lista.length) {
    grid.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:20px 0;">${t('vazio')}</div>`;
    return;
}

grid.innerHTML = lista.map(lugar => {
    const nome      = lugar.nome[idiomaAtual] || lugar.nome['pt'];
    const desc      = lugar.desc[idiomaAtual] || lugar.desc['pt'];
    const dist      = lugar.dist[idiomaAtual] || lugar.dist['pt'];
    const horario   = lugar.horario[idiomaAtual] || lugar.horario['pt'];
    const tipoLabel = lugar.tipo === 'restaurante' ? L_.restaurante : L_.shopping;
    const sel       = lugarSelecionadoId === lugar.id ? ' selecionado' : '';

    return `
    <div class="lugar-card${sel}"
         onclick="abrirModalLugar(${lugar.id}); selecionarLugar(${lugar.id});"
         role="button" tabindex="0" aria-label="${nome}">
        <div class="lugar-tipo-badge">${lugar.emoji} ${tipoLabel}</div>
        <div class="lugar-nome">${nome}</div>
        <div class="lugar-info-desc">${desc}</div>
        ${horario ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;line-height:1.4;">🕐 ${horario}</div>` : ''}
        <div class="lugar-meta">
            <span class="lugar-estrelas">${lugar.estrelas}</span>
            <span class="lugar-distancia">🚶 ${dist}</span>
        </div>
        <a class="lugar-card-link"
           href="${lugar.mapaLink}"
           target="_blank"
           rel="noopener"
           onclick="event.stopPropagation()">
            ↗ ${t('mapa_abrir')}
        </a>
    </div>`;
}).join('');

grid.querySelectorAll('.lugar-card').forEach(card => {
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter') card.click();
    });
});

grid.scrollLeft = 0;
```

}

function selecionarLugar(id) {
lugarSelecionadoId = id;
const lugar = LUGARES.find(l => l.id === id);
if (!lugar) return;
renderLugarCards();
carregarMapaIframe(gerarMapaSrc(lugar.lat, lugar.lng));
}

function gerarMapaSrc(lat, lng) {
return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

function carregarMapaIframe(src) {
const iframe  = document.getElementById(‘mapa-iframe’);
const loading = document.getElementById(‘mapa-loading’);
if (!iframe) return;

```
if (loading) {
    loading.classList.remove('oculto');
    const txtEl = document.getElementById('mapa-loading-txt');
    if (txtEl) txtEl.innerText = t('mapa_carregando');
}

iframe.onload = () => {
    if (loading) loading.classList.add('oculto');
};

if (iframe.src !== src) {
    iframe.src = src;
} else {
    if (loading) loading.classList.add('oculto');
}
```

}

async function initMapa() {
atualizarTextosMapa();
if (MAPA_GERAL_SRC) carregarMapaIframe(MAPA_GERAL_SRC);

```
try {
    const res = await fetch(`/api/public/${hotelSlug}/lugares/`);
    if (res.ok) {
        const dados = await res.json();
        LUGARES = dados.map(l => ({
            id:        l.id,
            tipo:      l.tipo,
            emoji:     l.tipo === 'restaurante' ? '🍽' : '🛍',
            nome:      { pt: l.nome,      en: l.nome,      es: l.nome,      fr: l.nome },
            desc:      { pt: l.descricao, en: l.descricao, es: l.descricao, fr: l.descricao },
            estrelas:  l.estrelas || '★★★★☆',
            instagram: l.instagram || '',
            telefone:  l.telefone  || '',
            dist:      { pt: l.distancia, en: l.distancia, es: l.distancia, fr: l.distancia },
            horario:   { pt: l.horario,   en: l.horario,   es: l.horario,   fr: l.horario },
            mapaLink:  l.maps_link || '',
            lat:       l.lat,
            lng:       l.lng,
        }));
    }
} catch(e) {
    console.warn('Lugares não carregados:', e);
}

renderLugarCards();
if (MAPA_GERAL_SRC && MAPA_GERAL_SRC.startsWith('http')) {
    carregarMapaIframe(MAPA_GERAL_SRC);
}
```

}

// ==========================================
// MODAL LUGAR
// ==========================================
function abrirModalLugar(id) {
const l = LUGARES.find(x => x.id === id);
if (!l) return;

```
const nome = l.nome[idiomaAtual] || l.nome['pt'];
const desc = l.desc[idiomaAtual] || l.desc['pt'];
const dist = l.dist[idiomaAtual] || l.dist['pt'];
const hor  = l.horario[idiomaAtual] || l.horario['pt'];

document.getElementById('lugar-tipo').innerText      = l.tipo === 'restaurante' ? '🍽 Restaurante' : '🛍 Compras';
document.getElementById('lugar-nome').innerText      = nome;
document.getElementById('lugar-desc').innerText      = desc || '';
document.getElementById('lugar-horario').innerHTML   = hor  ? `🕐 ${hor}` : '';
document.getElementById('lugar-distancia').innerHTML = dist ? `🚶 ${dist}` : '';
document.getElementById('lugar-estrelas').innerText  = l.estrelas || '';

const contatos = document.getElementById('lugar-contatos');
let html = '';

if (l.mapaLink) html += `
    <a href="${l.mapaLink}" target="_blank" rel="noopener"
       style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f4f6f9;border-radius:10px;text-decoration:none;color:var(--text);font-size:13px;font-weight:500;border:1px solid #e2e8f0;">
        📍 Ver no Google Maps
    </a>`;

if (l.instagram) {
    const igHref = l.instagram.startsWith('http')
        ? l.instagram
        : `https://instagram.com/${l.instagram.replace('@', '')}`;
    html += `
    <a href="${igHref}" target="_blank" rel="noopener"
       style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f4f6f9;border-radius:10px;text-decoration:none;color:var(--text);font-size:13px;font-weight:500;border:1px solid #e2e8f0;">
        📸 Instagram
    </a>`;
}

if (l.telefone) html += `
    <a href="https://wa.me/${l.telefone.replace(/\D/g, '')}" target="_blank" rel="noopener"
       style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(37,211,102,0.07);border:1px solid rgba(37,211,102,0.2);border-radius:10px;text-decoration:none;color:#16a34a;font-size:13px;font-weight:500;">
        💬 WhatsApp
    </a>`;

contatos.innerHTML = html;
document.getElementById('modalLugar').classList.add('open');
document.body.style.overflow = 'hidden';
```

}

function fecharModalLugar() {
document.getElementById(‘modalLugar’).classList.remove(‘open’);
document.body.style.overflow = ‘’;
}

// ==========================================
// INIT
// ==========================================
document.addEventListener(‘DOMContentLoaded’, async () => {
document.querySelectorAll(’.lang-btn’).forEach(btn => {
btn.classList.toggle(‘active’, btn.dataset.lang === idiomaAtual);
});

```
await carregarHotel(idiomaAtual);
await Promise.all([
    carregarPasseios(idiomaAtual),
    initMapa(),
]);
```

});

// ==========================================
// EXPORTS GLOBAIS
// ==========================================
window.trocarIdioma               = trocarIdioma;
window.abrirModal                 = abrirModal;
window.abrirDetalhe               = abrirDetalhe;
window.fecharDetalhe              = fecharDetalhe;
window.abrirModalReservaDoDetalhe = abrirModalReservaDoDetalhe;
window.voltarParaDetalhe          = voltarParaDetalhe;
window.fecharModal                = fecharModal;
window.fecharModalReserva         = fecharModalReserva;
window.confirmarReserva           = confirmarReserva;
window.calcularTotal              = calcularTotal;
window.carrosselMover             = carrosselMover;
window.detFotoMover               = detFotoMover;
window.detFotoIr                  = detFotoIr;
window.filtrarMapa                = filtrarMapa;
window.selecionarLugar            = selecionarLugar;
window.fecharModalLugar           = fecharModalLugar;