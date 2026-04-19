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
    urlParams.get('hotel');

if (!hotelSlug) {
    console.error("❌ Hotel slug não definido");
    throw new Error("Hotel não identificado");
}

const API_BASE = '/api';

let idiomaAtual   = localStorage.getItem('lang') || 'pt';
let whatsappAtual = '5521999999999';
let passeioAtual  = null;
let listaPasseios = [];

// Estado do carrossel de fotos no detalhe
let detFotoIndex = 0;
let detFotos     = [];

const i18n = {
    pt: {
        btn: 'Ver detalhes',
        vazio: 'Nenhuma experiência disponível.',
        erro: 'Erro ao carregar.',
        explorar: 'Explorar',
        secao_label: 'Passeios',
        secao_titulo: 'Experiências disponíveis',
        sob_consulta: 'Sob consulta',
        por_pessoa: '/ pessoa',
        modal_eyebrow: 'Interesse no Passeio',
        det_eyebrow: 'Experiência',
        lbl_data: 'Data desejada',
        lbl_horario: 'Horário desejado',
        lbl_nome: 'Nome completo',
        lbl_tel: 'Telefone',
        lbl_qtd: 'Número de pessoas',
        resumo_passeio: 'Passeio',
        resumo_qtd: 'Pessoas',
        resumo_total: 'Total estimado',
        btn_confirmar: 'Falar no WhatsApp',
        btn_reservar_det: 'Reservar agora',
        btn_voltar: '← Voltar aos detalhes',
        sucesso: 'Redirecionando para o WhatsApp!',
        sem_imagem: 'Sem imagem',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `Olá! Me chamo *${nome}* e tenho interesse no passeio *${passeio}* para *${qtd} pessoa(s)*`;
            if (data)    msg += `, na data *${data}*`;
            if (horario) msg += ` às *${horario}*`;
            msg += `. Poderia confirmar a disponibilidade?`;
            return msg;
        },
        aviso_wpp: 'Você será direcionado ao WhatsApp do hotel para confirmar sua reserva.',
        campos_obrigatorios: 'Por favor, preencha seu nome e telefone.',
        mapa_label: 'Nos arredores',
        mapa_titulo: 'Restaurantes & Centros Comerciais',
        mapa_todos: 'Todos',
        mapa_restaurantes: '🍽 Restaurantes',
        mapa_compras: '🛍 Compras',
        mapa_carregando: 'Carregando mapa…',
        mapa_abrir: 'Ver no Google Maps ↗',
        mapa_ver: 'Ver no mapa',
    },
    en: {
        btn: 'See details',
        vazio: 'No tours found.',
        erro: 'Loading error.',
        explorar: 'Explore',
        secao_label: 'Tours',
        secao_titulo: 'Available experiences',
        sob_consulta: 'On request',
        por_pessoa: '/ person',
        modal_eyebrow: 'Tour Inquiry',
        det_eyebrow: 'Experience',
        lbl_data: 'Preferred date',
        lbl_horario: 'Preferred time',
        lbl_nome: 'Full name',
        lbl_tel: 'Phone',
        lbl_qtd: 'Number of guests',
        resumo_passeio: 'Tour',
        resumo_qtd: 'Guests',
        resumo_total: 'Estimated total',
        btn_confirmar: 'Chat on WhatsApp',
        btn_reservar_det: 'Book now',
        btn_voltar: '← Back to details',
        sucesso: 'Redirecting to WhatsApp!',
        sem_imagem: 'No image',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `Hello! My name is *${nome}* and I'm interested in the tour *${passeio}* for *${qtd} guest(s)*`;
            if (data)    msg += ` on *${data}*`;
            if (horario) msg += ` at *${horario}*`;
            msg += `. Could you confirm availability?`;
            return msg;
        },
        aviso_wpp: "You will be redirected to the hotel's WhatsApp to confirm your booking.",
        campos_obrigatorios: 'Please fill in your name and phone number.',
        mapa_label: 'Nearby',
        mapa_titulo: 'Restaurants & Shopping',
        mapa_todos: 'All',
        mapa_restaurantes: '🍽 Restaurants',
        mapa_compras: '🛍 Shopping',
        mapa_carregando: 'Loading map…',
        mapa_abrir: 'View on Google Maps ↗',
        mapa_ver: 'View on map',
    },
    es: {
        btn: 'Ver detalles',
        vazio: 'No se encontraron tours.',
        erro: 'Error de carga.',
        explorar: 'Explorar',
        secao_label: 'Paseos',
        secao_titulo: 'Experiencias disponibles',
        sob_consulta: 'Bajo consulta',
        por_pessoa: '/ persona',
        modal_eyebrow: 'Consulta de Paseo',
        det_eyebrow: 'Experiencia',
        lbl_data: 'Fecha preferida',
        lbl_horario: 'Hora preferida',
        lbl_nome: 'Nombre completo',
        lbl_tel: 'Teléfono',
        lbl_qtd: 'Número de personas',
        resumo_passeio: 'Paseo',
        resumo_qtd: 'Personas',
        resumo_total: 'Total estimado',
        btn_confirmar: 'Hablar en WhatsApp',
        btn_reservar_det: 'Reservar ahora',
        btn_voltar: '← Volver a detalles',
        sucesso: '¡Redirigiendo al WhatsApp!',
        sem_imagem: 'Sin imagen',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `¡Hola! Me llamo *${nome}* y estoy interesado/a en el paseo *${passeio}* para *${qtd} persona(s)*`;
            if (data)    msg += ` en la fecha *${data}*`;
            if (horario) msg += ` a las *${horario}*`;
            msg += `. ¿Podría confirmar disponibilidad?`;
            return msg;
        },
        aviso_wpp: 'Será redirigido al WhatsApp del hotel para confirmar su reserva.',
        campos_obrigatorios: 'Por favor, complete su nombre y teléfono.',
        mapa_label: 'Alrededores',
        mapa_titulo: 'Restaurantes & Centros Comerciales',
        mapa_todos: 'Todos',
        mapa_restaurantes: '🍽 Restaurantes',
        mapa_compras: '🛍 Compras',
        mapa_carregando: 'Cargando mapa…',
        mapa_abrir: 'Ver en Google Maps ↗',
        mapa_ver: 'Ver en el mapa',
    },
    fr: {
        btn: 'Voir détails',
        vazio: 'Aucune visite trouvée.',
        erro: 'Erreur de chargement.',
        explorar: 'Explorer',
        secao_label: 'Visites',
        secao_titulo: 'Expériences disponibles',
        sob_consulta: 'Sur demande',
        por_pessoa: '/ personne',
        modal_eyebrow: 'Demande de Visite',
        det_eyebrow: 'Expérience',
        lbl_data: 'Date souhaitée',
        lbl_horario: 'Heure souhaitée',
        lbl_nome: 'Nom complet',
        lbl_tel: 'Téléphone',
        lbl_qtd: 'Nombre de personnes',
        resumo_passeio: 'Visite',
        resumo_qtd: 'Personnes',
        resumo_total: 'Total estimé',
        btn_confirmar: 'Contacter sur WhatsApp',
        btn_reservar_det: 'Réserver maintenant',
        btn_voltar: '← Retour aux détails',
        sucesso: 'Redirection vers WhatsApp!',
        sem_imagem: 'Sans image',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `Bonjour ! Je m'appelle *${nome}* et je suis intéressé(e) par la visite *${passeio}* pour *${qtd} personne(s)*`;
            if (data)    msg += ` à la date *${data}*`;
            if (horario) msg += ` à *${horario}*`;
            msg += `. Pourriez-vous confirmer la disponibilité ?`;
            return msg;
        },
        aviso_wpp: "Vous serez redirigé vers le WhatsApp de l'hôtel pour confirmer votre réservation.",
        campos_obrigatorios: 'Veuillez remplir votre nom et numéro de téléphone.',
        mapa_label: 'Aux alentours',
        mapa_titulo: 'Restaurants & Centres Commerciaux',
        mapa_todos: 'Tous',
        mapa_restaurantes: '🍽 Restaurants',
        mapa_compras: '🛍 Shopping',
        mapa_carregando: 'Chargement de la carte…',
        mapa_abrir: 'Voir sur Google Maps ↗',
        mapa_ver: 'Voir sur la carte',
    }
};

function t(key) {
    const lang = i18n[idiomaAtual] || i18n['pt'];
    return lang[key] !== undefined ? lang[key] : (i18n['pt'][key] || key);
}

// ==========================================
// HOTEL (HERO)
// ==========================================
async function carregarHotel(lang) {
    if (!hotelSlug) return;
    try {
        const res = await fetch(`${API_BASE}/hotel/${hotelSlug}/?lang=${lang}`);
        if (!res.ok) { console.warn('[carregarHotel] HTTP', res.status); return; }
        const data = await res.json();

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

    } catch (error) {
        console.error('[carregarHotel] Erro:', error);
    }
}

// ==========================================
// CARROSSEL PRINCIPAL
// ==========================================
let carrIndex    = 0;
let carrVisiveis = 3;
let carrTotal    = 0;

function carrosselAtualizar() {
    const track   = document.getElementById('passeios-track');
    const btnPrev = document.getElementById('carr-prev');
    const btnNext = document.getElementById('carr-next');
    const dotsEl  = document.getElementById('carr-dots');
    if (!track) return;

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
}

function carrosselMover(dir) {
    const max = Math.max(0, carrTotal - carrVisiveis);
    carrIndex  = Math.min(max, Math.max(0, carrIndex + dir));
    carrosselAtualizar();
}

function carrosselCalcularVisiveis() {
    const viewport = document.getElementById('passeios');
    if (!viewport) return 3;
    return Math.max(1, Math.floor(viewport.offsetWidth / (320 + 24)));
}

function initCarrosselDrag() {
    const el = document.getElementById('passeios');
    if (!el) return;
    let startX = 0, isDragging = false;

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
}

// ==========================================
// PASSEIOS
// ==========================================
async function carregarPasseios(lang) {
    const track = document.getElementById('passeios-track');
    if (!track) return;

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
}

// ==========================================
// CARD
// ==========================================
function renderCard(p) {
    const precoLabel = p.preco_sob_consulta
        ? t('sob_consulta')
        : `R$ ${Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

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
    const track   = document.getElementById('det-foto-track');
    const thumbs  = document.getElementById('det-foto-thumbs');
    const counter = document.getElementById('det-foto-counter');
    const btnPrev = document.getElementById('det-foto-prev');
    const btnNext = document.getElementById('det-foto-next');
    if (!track) return;

    if (!detFotos.length) {
        track.innerHTML = `<div class="det-foto-slide"><div class="det-foto-slide-empty">🌊</div></div>`;
        if (thumbs)  thumbs.innerHTML    = '';
        if (counter) counter.textContent = '';
        if (btnPrev) btnPrev.style.display = 'none';
        if (btnNext) btnNext.style.display = 'none';
        return;
    }

    track.innerHTML = detFotos.map(src => `
        <div class="det-foto-slide">
            <img src="${src}" alt="" onerror="this.parentElement.innerHTML='<div class=\\'det-foto-slide-empty\\'>🌊</div>'">
        </div>`).join('');

    if (thumbs) {
        thumbs.innerHTML = detFotos.length > 1
            ? detFotos.map((src, i) => `
                <div class="det-thumb ${i === detFotoIndex ? 'active' : ''}" onclick="detFotoIr(${i})">
                    <img src="${src}" alt="" onerror="this.style.display='none'">
                </div>`).join('')
            : '';
    }

    if (btnPrev) btnPrev.style.display = detFotos.length > 1 ? 'flex' : 'none';
    if (btnNext) btnNext.style.display = detFotos.length > 1 ? 'flex' : 'none';

    detFotoAtualizar();
}

function detFotoAtualizar() {
    const track   = document.getElementById('det-foto-track');
    const counter = document.getElementById('det-foto-counter');
    const btnPrev = document.getElementById('det-foto-prev');
    const btnNext = document.getElementById('det-foto-next');
    const thumbs  = document.querySelectorAll('.det-thumb');

    if (track)   track.style.transform = `translateX(-${detFotoIndex * 100}%)`;
    if (counter) counter.textContent   = `${detFotoIndex + 1} / ${detFotos.length}`;
    if (btnPrev) btnPrev.disabled      = detFotoIndex === 0;
    if (btnNext) btnNext.disabled      = detFotoIndex >= detFotos.length - 1;

    thumbs.forEach((th, i) => th.classList.toggle('active', i === detFotoIndex));
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
}

function fecharDetalhe() {
    document.getElementById('modalDetalhe').classList.remove('open');
    document.body.style.overflow = '';
}

function initDetFotoSwipe() {
    const wrap = document.getElementById('det-foto-wrap');
    if (!wrap || wrap._swipeInit) return;
    wrap._swipeInit = true;

    let startX = 0;
    wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend',   e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) detFotoMover(diff > 0 ? 1 : -1);
    });
}

// ==========================================
// ABRIR MODAL RESERVA A PARTIR DO DETALHE
// ==========================================
function abrirModalReservaDoDetalhe() {
    if (!passeioAtual) return;
    document.getElementById('modalDetalhe').classList.remove('open');
    abrirModalReserva();
}

function abrirModalReserva() {
    if (!passeioAtual) return;
    const p = passeioAtual;

    document.getElementById('modal-eyebrow').innerText        = t('modal_eyebrow');
    document.getElementById('modal-passeio-nome').innerText   = p.nome;
    document.getElementById('lbl-data').innerText             = t('lbl_data');
    document.getElementById('lbl-horario').innerText          = t('lbl_horario');
    document.getElementById('lbl-nome').innerText             = t('lbl_nome');
    document.getElementById('lbl-tel').innerText              = t('lbl_tel');
    document.getElementById('lbl-qtd').innerText              = t('lbl_qtd');
    document.getElementById('resumo-label-passeio').innerText = t('resumo_passeio');
    document.getElementById('resumo-label-qtd').innerText     = t('resumo_qtd');
    document.getElementById('resumo-label-total').innerText   = t('resumo_total');

    const btnVoltar = document.getElementById('btn-voltar-txt');
    if (btnVoltar) btnVoltar.textContent = t('btn_voltar').replace('← ', '');

    const avisoEl = document.getElementById('modal-aviso-wpp');
    if (avisoEl) {
        const lastChild = avisoEl.lastChild;
        if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
            lastChild.textContent = ' ' + t('aviso_wpp');
        }
    }

    document.getElementById('res-nome').value    = '';
    document.getElementById('res-tel').value     = '';
    document.getElementById('res-qtd').value     = 1;
    document.getElementById('res-data').value    = '';
    document.getElementById('res-horario').value = '';
    document.getElementById('modal-resumo').classList.remove('show');

    calcularTotal();

    document.getElementById('modalReserva').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function voltarParaDetalhe() {
    document.getElementById('modalReserva').classList.remove('open');
    if (passeioAtual) {
        document.getElementById('modalDetalhe').classList.add('open');
    } else {
        document.body.style.overflow = '';
    }
}

function fecharModalReserva() {
    document.getElementById('modalReserva').classList.remove('open');
    document.body.style.overflow = '';
    passeioAtual = null;
}

function abrirModal(passeioId) { abrirDetalhe(passeioId); }
function fecharModal()         { fecharDetalhe(); fecharModalReserva(); }

// ==========================================
// CALCULAR TOTAL
// ==========================================
function calcularTotal() {
    if (!passeioAtual) return;

    const qtd    = parseInt(document.getElementById('res-qtd').value) || 1;
    const resumo = document.getElementById('modal-resumo');

    let totalStr = '';
    if (passeioAtual.preco_sob_consulta) {
        totalStr = t('sob_consulta');
    } else {
        const preco  = Number(passeioAtual.preco || 0);
        const total  = passeioAtual.preco_por_pessoa ? preco * qtd : preco;
        totalStr = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    document.getElementById('resumo-passeio').innerText     = passeioAtual.nome;
    document.getElementById('resumo-qtd').innerText         = qtd;
    document.getElementById('resumo-total-valor').innerText = totalStr;
    resumo.classList.add('show');
}

// ==========================================
// CONFIRMAR → WHATSAPP
// ==========================================
function confirmarReserva() {
    const nome     = document.getElementById('res-nome').value.trim();
    const telefone = document.getElementById('res-tel').value.trim();
    const qtd      = parseInt(document.getElementById('res-qtd').value) || 1;
    const dataVal  = document.getElementById('res-data').value;
    const horario  = document.getElementById('res-horario').value;

    if (!nome || !telefone) {
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
}

// ==========================================
// TOAST
// ==========================================
function mostrarToast(msg, tipo = '') {
    const container = document.getElementById('toasts');
    const toast     = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ==========================================
// CSRF (admin)
// ==========================================
function getCookie(name) {
    for (const c of document.cookie.split(';')) {
        const [k, v] = c.trim().split('=');
        if (k === name) return decodeURIComponent(v);
    }
    return '';
}

// ==========================================
// IDIOMA
// ==========================================
async function trocarIdioma(lang) {
    idiomaAtual = lang;
    localStorage.setItem('lang', lang);

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
}

// ==========================================
// FECHAR COM ESC / CLICK FORA
// ==========================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (document.getElementById('modalReserva')?.classList.contains('open')) {
            voltarParaDetalhe();
        } else {
            fecharDetalhe();
        }
    }
});

document.getElementById('modalDetalhe')?.addEventListener('click', function(e) {
    if (e.target === this) fecharDetalhe();
});

document.getElementById('modalReserva')?.addEventListener('click', function(e) {
    if (e.target === this) voltarParaDetalhe();
});

// ==========================================
// MAPA TURÍSTICO — LUGARES REAIS (Ipanema Inn)
// ==========================================

const HOTEL_LAT = -22.98544266423526;
const HOTEL_LNG = -43.20739229160829;

const LUGARES = [
    // ── RESTAURANTES DO HOTEL (destaque) ──
    {
        id: 1, tipo: 'restaurante', emoji: '🌿', hotelProprio: true,
        nome: { pt: 'Quitéria Rio', en: 'Quitéria Rio', es: 'Quitéria Rio', fr: 'Quitéria Rio' },
        desc: {
            pt: 'Restaurante do hotel. Cozinha brasileira autoral do chef David Cruz ✦ No local',
            en: 'Hotel restaurant. Creative Brazilian cuisine by chef David Cruz ✦ On-site',
            es: 'Restaurante del hotel. Cocina brasileña de autor del chef David Cruz ✦ En el local',
            fr: "Restaurant de l'hôtel. Cuisine brésilienne créative du chef David Cruz ✦ Sur place"
        },
        estrelas: '★★★★★',
        dist: { pt: 'No térreo do hotel', en: 'Hotel ground floor', es: 'Planta baja del hotel', fr: "Rez-de-chaussée de l'hôtel" },
        horario: {
            pt: 'Café: 7h–11:30 | Almoço e Jantar: 12h–22:30 (diário)',
            en: 'Breakfast: 7–11:30am | Lunch & Dinner: 12–10:30pm (daily)',
            es: 'Desayuno: 7–11:30h | Almuerzo y Cena: 12h–22:30h (diario)',
            fr: 'Petit-déj: 7h–11h30 | Déjeuner et Dîner: 12h–22h30 (quotidien)'
        },
        mapaLink: 'https://maps.google.com/?q=Quitéria+Rio+Rua+Maria+Quitéria+27+Ipanema+Rio+de+Janeiro',
        lat: -22.98544506756334, lng: -43.20727995127523
    },
    {
        id: 2, tipo: 'restaurante', emoji: '🌊', hotelProprio: true,
        nome: { pt: 'Arp Bar', en: 'Arp Bar', es: 'Arp Bar', fr: 'Arp Bar' },
        desc: {
            pt: 'Bar & restaurante beira-mar do Hotel Arpoador. Vista única do pôr do sol ✦ Top 100 EXAME',
            en: 'Beachfront bar & restaurant at Hotel Arpoador. Unique sunset view ✦ Top 100 EXAME',
            es: 'Bar & restaurante frente al mar del Hotel Arpoador. Vista única al atardecer ✦ Top 100 EXAME',
            fr: 'Bar & restaurant en bord de mer du Hotel Arpoador. Vue unique sur le coucher de soleil ✦ Top 100 EXAME'
        },
        estrelas: '★★★★★',
        dist: { pt: '10 min a pé', en: '10 min walk', es: '10 min a pie', fr: '10 min à pied' },
        horario: {
            pt: 'Café: 7h–11:30 | Seg–Sex 12:15–23h | Sáb 12:45–23h | Dom 12:45–22h',
            en: 'Breakfast: 7–11:30am | Mon–Fri 12:15–11pm | Sat 12:45–11pm | Sun 12:45–10pm',
            es: 'Desayuno: 7–11:30h | Lun–Vie 12:15–23h | Sáb 12:45–23h | Dom 12:45–22h',
            fr: 'Petit-déj: 7h–11h30 | Lun–Ven 12h15–23h | Sam 12h45–23h | Dim 12h45–22h'
        },
        mapaLink: 'https://maps.google.com/?q=Hotel+Arpoador+Rua+Francisco+Otaviano+177+Ipanema+Rio+de+Janeiro',
        lat: -22.987833919316724, lng: -43.193849411853336
    },

    // ── RESTAURANTES DO BAIRRO ──
    {
        id: 3, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Zazá Bistrô Tropical', en: 'Zazá Bistrô Tropical', es: 'Zazá Bistrô Tropical', fr: 'Zazá Bistrô Tropical' },
        desc: {
            pt: 'Culinária criativa e tropical. Melhor ceviche de Ipanema ✦ 4.6 ★',
            en: 'Creative tropical cuisine. Best ceviche in Ipanema ✦ 4.6 ★',
            es: 'Cocina creativa y tropical. Mejor ceviche de Ipanema ✦ 4.6 ★',
            fr: "Cuisine créative et tropicale. Meilleur ceviche d'Ipanema ✦ 4.6 ★"
        },
        estrelas: '★★★★★',
        dist: { pt: '8 min a pé', en: '8 min walk', es: '8 min a pie', fr: '8 min à pied' },
        horario: {
            pt: 'Seg–Sáb 12h–00:30 | Dom 12h–23:30',
            en: 'Mon–Sat 12pm–12:30am | Sun 12pm–11:30pm',
            es: 'Lun–Sáb 12h–00:30 | Dom 12h–23:30',
            fr: 'Lun–Sam 12h–00h30 | Dim 12h–23h30'
        },
        mapaLink: 'https://maps.google.com/?q=Zazá+Bistrô+Tropical+Ipanema',
        lat: -22.9854508, lng: -43.2049036
    },
    {
        id: 4, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Pope Ipanema', en: 'Pope Ipanema', es: 'Pope Ipanema', fr: 'Pope Ipanema' },
        desc: {
            pt: 'Melhor italiano do Rio. Risoto de polvo imperdível ✦ 4.7 ★',
            en: "Rio's best Italian. Must-try octopus risotto ✦ 4.7 ★",
            es: 'Mejor italiano de Río. Risotto de pulpo imperdible ✦ 4.7 ★',
            fr: 'Meilleur italien de Rio. Risotto de poulpe incontournable ✦ 4.7 ★'
        },
        estrelas: '★★★★★',
        dist: { pt: '8 min a pé', en: '8 min walk', es: '8 min a pie', fr: '8 min à pied' },
        horario: {
            pt: 'Ter–Sex 18h–00h | Sáb–Dom 12h–00h',
            en: 'Tue–Fri 6pm–12am | Sat–Sun 12pm–12am',
            es: 'Mar–Vie 18h–00h | Sáb–Dom 12h–00h',
            fr: 'Mar–Ven 18h–00h | Sam–Dim 12h–00h'
        },
        mapaLink: 'https://maps.google.com/?q=Pope+Ipanema+Rio',
        lat: -22.9851157, lng: -43.2051654
    },
    {
        id: 5, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Nino Cucina', en: 'Nino Cucina', es: 'Nino Cucina', fr: 'Nino Cucina' },
        desc: {
            pt: 'Autêntica cozinha italiana. Ambiente charmoso com terraço ✦ 4.7 ★',
            en: 'Authentic Italian cuisine. Charming ambiance with terrace ✦ 4.7 ★',
            es: 'Auténtica cocina italiana. Ambiente encantador con terraza ✦ 4.7 ★',
            fr: 'Cuisine italienne authentique. Ambiance charmante avec terrasse ✦ 4.7 ★'
        },
        estrelas: '★★★★★',
        dist: { pt: '6 min a pé', en: '6 min walk', es: '6 min a pie', fr: '6 min à pied' },
        horario: {
            pt: 'Seg–Qui 12h–16h e 19h–00h | Sex–Sáb 12h–00h',
            en: 'Mon–Thu 12–4pm & 7pm–12am | Fri–Sat 12pm–12am',
            es: 'Lun–Jue 12h–16h y 19h–00h | Vie–Sáb 12h–00h',
            fr: 'Lun–Jeu 12h–16h et 19h–00h | Ven–Sam 12h–00h'
        },
        mapaLink: 'https://maps.google.com/?q=Nino+Cucina+Ipanema',
        lat: -22.9828156, lng: -43.2088174
    },
    {
        id: 6, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Nosso', en: 'Nosso', es: 'Nosso', fr: 'Nosso' },
        desc: {
            pt: 'Coquetéis premiados e menu autoral. Point do Ipanema ✦ 4.6 ★',
            en: 'Award-winning cocktails and signature menu. Ipanema hotspot ✦ 4.6 ★',
            es: 'Cócteles premiados y menú de autor. Punto de encuentro de Ipanema ✦ 4.6 ★',
            fr: "Cocktails primés et menu signature. Point de rencontre d'Ipanema ✦ 4.6 ★"
        },
        estrelas: '★★★★★',
        dist: { pt: '2 min a pé', en: '2 min walk', es: '2 min a pie', fr: '2 min à pied' },
        horario: {
            pt: 'Ter–Sáb 18:30h–00:30 | Dom 18:30h–23h',
            en: 'Tue–Sat 6:30pm–12:30am | Sun 6:30–11pm',
            es: 'Mar–Sáb 18:30h–00:30 | Dom 18:30h–23h',
            fr: 'Mar–Sam 18h30–00h30 | Dim 18h30–23h'
        },
        mapaLink: 'https://maps.google.com/?q=Nosso+Restaurante+Ipanema',
        lat: -22.9833517, lng: -43.2071758
    },
    {
        id: 7, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Masserini Osteria di Mare', en: 'Masserini Osteria di Mare', es: 'Masserini Osteria di Mare', fr: 'Masserini Osteria di Mare' },
        desc: {
            pt: 'Frutos do mar com vista para a Praia de Ipanema ✦ 4.7 ★',
            en: 'Seafood with views of Ipanema Beach ✦ 4.7 ★',
            es: 'Mariscos con vista a la Playa de Ipanema ✦ 4.7 ★',
            fr: "Fruits de mer avec vue sur la plage d'Ipanema ✦ 4.7 ★"
        },
        estrelas: '★★★★★',
        dist: { pt: '5 min a pé', en: '5 min walk', es: '5 min a pie', fr: '5 min à pied' },
        horario: {
            pt: 'Ter–Dom 12h–23h | Seg fechado',
            en: 'Tue–Sun 12pm–11pm | Mon closed',
            es: 'Mar–Dom 12h–23h | Lun cerrado',
            fr: 'Mar–Dim 12h–23h | Lun fermé'
        },
        mapaLink: 'https://maps.google.com/?q=Masserini+Osteria+Ipanema',
        lat: -22.9863290, lng: -43.2033205
    },
    {
        id: 8, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Giuseppe Grill Leblon', en: 'Giuseppe Grill Leblon', es: 'Giuseppe Grill Leblon', fr: 'Giuseppe Grill Leblon' },
        desc: {
            pt: 'A melhor picanha do Rio. Recomendado pelo Michelin ✦ 4.6 ★',
            en: "Rio's best picanha steak. Michelin recommended ✦ 4.6 ★",
            es: 'La mejor picaña de Río. Recomendado por Michelin ✦ 4.6 ★',
            fr: 'La meilleure picanha de Rio. Recommandé par le Michelin ✦ 4.6 ★'
        },
        estrelas: '★★★★★',
        dist: { pt: '15 min a pé', en: '15 min walk', es: '15 min a pie', fr: '15 min à pied' },
        horario: {
            pt: 'Seg–Sáb 12h–00h | Dom 12h–23h',
            en: 'Mon–Sat 12pm–12am | Sun 12pm–11pm',
            es: 'Lun–Sáb 12h–00h | Dom 12h–23h',
            fr: 'Lun–Sam 12h–00h | Dim 12h–23h'
        },
        mapaLink: 'https://maps.google.com/?q=Giuseppe+Grill+Leblon',
        lat: -22.9835344, lng: -43.2230006
    },
    {
        id: 9, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Babbo Osteria', en: 'Babbo Osteria', es: 'Babbo Osteria', fr: 'Babbo Osteria' },
        desc: {
            pt: 'Gnocchi de trufas e ambiente romântico no Ipanema ✦ 4.6 ★',
            en: 'Truffle gnocchi and romantic ambiance in Ipanema ✦ 4.6 ★',
            es: 'Gnocchi de trufas y ambiente romántico en Ipanema ✦ 4.6 ★',
            fr: 'Gnocchi aux truffes et ambiance romantique à Ipanema ✦ 4.6 ★'
        },
        estrelas: '★★★★★',
        dist: { pt: '10 min a pé', en: '10 min walk', es: '10 min a pie', fr: '10 min à pied' },
        horario: {
            pt: 'Seg–Qui 12h–16h e 19h–23h | Sex–Sáb 19h–00h | Dom 12h–18h',
            en: 'Mon–Thu 12–4pm & 7–11pm | Fri–Sat 7pm–12am | Sun 12–6pm',
            es: 'Lun–Jue 12h–16h y 19h–23h | Vie–Sáb 19h–00h | Dom 12h–18h',
            fr: 'Lun–Jeu 12h–16h et 19h–23h | Ven–Sam 19h–00h | Dim 12h–18h'
        },
        mapaLink: 'https://maps.google.com/?q=Babbo+Osteria+Ipanema',
        lat: -22.9826432, lng: -43.2122708
    },
    {
        id: 10, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Le Blond', en: 'Le Blond', es: 'Le Blond', fr: 'Le Blond' },
        desc: {
            pt: 'Fusão franco-brasileira. Estrela Michelin no Leblon ✦ 4.6 ★',
            en: 'French-Brazilian fusion. Michelin star in Leblon ✦ 4.6 ★',
            es: 'Fusión franco-brasileña. Estrella Michelin en Leblon ✦ 4.6 ★',
            fr: 'Fusion franco-brésilienne. Étoile Michelin à Leblon ✦ 4.6 ★'
        },
        estrelas: '★★★★★',
        dist: { pt: '18 min a pé', en: '18 min walk', es: '18 min a pie', fr: '18 min à pied' },
        horario: {
            pt: 'Seg–Sex 12h–16h e 18:30h–00h | Sáb–Dom 12h–00h',
            en: 'Mon–Fri 12–4pm & 6:30pm–12am | Sat–Sun 12pm–12am',
            es: 'Lun–Vie 12h–16h y 18:30h–00h | Sáb–Dom 12h–00h',
            fr: 'Lun–Ven 12h–16h et 18h30–00h | Sam–Dim 12h–00h'
        },
        mapaLink: 'https://maps.google.com/?q=Le+Blond+Leblon',
        lat: -22.9862088, lng: -43.2281262
    },
    {
        id: 11, tipo: 'restaurante', emoji: '🍽',
        nome: { pt: 'Nola Leblon', en: 'Nola Leblon', es: 'Nola Leblon', fr: 'Nola Leblon' },
        desc: {
            pt: 'Menu contemporâneo premiado. Point da Rua Dias Ferreira ✦ 4.5 ★',
            en: 'Award-winning contemporary menu. Dias Ferreira Street hotspot ✦ 4.5 ★',
            es: 'Menú contemporáneo premiado. Punto de la Calle Dias Ferreira ✦ 4.5 ★',
            fr: 'Menu contemporain primé. Lieu de rendez-vous Rua Dias Ferreira ✦ 4.5 ★'
        },
        estrelas: '★★★★☆',
        dist: { pt: '20 min a pé', en: '20 min walk', es: '20 min a pie', fr: '20 min à pied' },
        horario: {
            pt: 'Seg–Ter 12h–00h | Qua–Sáb 12h–01h | Dom 12h–23h',
            en: 'Mon–Tue 12pm–12am | Wed–Sat 12pm–1am | Sun 12pm–11pm',
            es: 'Lun–Mar 12h–00h | Mié–Sáb 12h–01h | Dom 12h–23h',
            fr: 'Lun–Mar 12h–00h | Mer–Sam 12h–01h | Dim 12h–23h'
        },
        mapaLink: 'https://maps.google.com/?q=Nola+Leblon+Rio',
        lat: -22.9840584, lng: -43.2274173
    },

    // ── SHOPPINGS ──
    {
        id: 12, tipo: 'shopping', emoji: '🛍',
        nome: { pt: 'Shopping Leblon', en: 'Shopping Leblon', es: 'Shopping Leblon', fr: 'Shopping Leblon' },
        desc: {
            pt: 'O mall mais sofisticado do Rio. Marcas nacionais e internacionais ✦ 4.6 ★',
            en: "Rio's most sophisticated mall. National and international brands ✦ 4.6 ★",
            es: 'El centro comercial más sofisticado de Río. Marcas nacionales e internacionales ✦ 4.6 ★',
            fr: 'Le centre commercial le plus sophistiqué de Rio. Marques nationales et internationales ✦ 4.6 ★'
        },
        estrelas: '★★★★★',
        dist: { pt: '12 min a pé', en: '12 min walk', es: '12 min a pie', fr: '12 min à pied' },
        horario: {
            pt: 'Seg–Sáb 10h–22h | Dom 12h–22h',
            en: 'Mon–Sat 10am–10pm | Sun 12pm–10pm',
            es: 'Lun–Sáb 10h–22h | Dom 12h–22h',
            fr: 'Lun–Sam 10h–22h | Dim 12h–22h'
        },
        mapaLink: 'https://maps.google.com/?q=Shopping+Leblon',
        lat: -22.9824704, lng: -43.2168792
    },
    {
        id: 13, tipo: 'shopping', emoji: '🛍',
        nome: { pt: 'Rio Design Leblon', en: 'Rio Design Leblon', es: 'Rio Design Leblon', fr: 'Rio Design Leblon' },
        desc: {
            pt: 'Moda, decoração e gastronomia no coração do Leblon ✦ 4.5 ★',
            en: 'Fashion, décor and dining in the heart of Leblon ✦ 4.5 ★',
            es: 'Moda, decoración y gastronomía en el corazón de Leblon ✦ 4.5 ★',
            fr: 'Mode, décoration et gastronomie au cœur de Leblon ✦ 4.5 ★'
        },
        estrelas: '★★★★☆',
        dist: { pt: '14 min a pé', en: '14 min walk', es: '14 min a pie', fr: '14 min à pied' },
        horario: {
            pt: 'Seg–Sáb 10h–23h | Dom 12h–21h',
            en: 'Mon–Sat 10am–11pm | Sun 12pm–9pm',
            es: 'Lun–Sáb 10h–23h | Dom 12h–21h',
            fr: 'Lun–Sam 10h–23h | Dim 12h–21h'
        },
        mapaLink: 'https://maps.google.com/?q=Rio+Design+Leblon',
        lat: -22.9833799, lng: -43.2185823
    },
    {
        id: 14, tipo: 'shopping', emoji: '🛍',
        nome: { pt: 'Galeria Ipanema 2000', en: 'Galeria Ipanema 2000', es: 'Galería Ipanema 2000', fr: 'Galeria Ipanema 2000' },
        desc: {
            pt: 'Moda autoral, biquínis e marcas exclusivas de Ipanema ✦ 4.7 ★',
            en: 'Designer fashion, bikinis and exclusive Ipanema brands ✦ 4.7 ★',
            es: 'Moda de autor, bikinis y marcas exclusivas de Ipanema ✦ 4.7 ★',
            fr: "Mode d'auteur, bikinis et marques exclusives d'Ipanema ✦ 4.7 ★"
        },
        estrelas: '★★★★★',
        dist: { pt: '5 min a pé', en: '5 min walk', es: '5 min a pie', fr: '5 min à pied' },
        horario: {
            pt: 'Seg–Sáb 09h–20h',
            en: 'Mon–Sat 9am–8pm',
            es: 'Lun–Sáb 09h–20h',
            fr: 'Lun–Sam 9h–20h'
        },
        mapaLink: 'https://maps.google.com/?q=Galeria+Ipanema+2000',
        lat: -22.9841546, lng: -43.2115691
    },
    {
        id: 15, tipo: 'shopping', emoji: '🛍',
        nome: { pt: 'Forum de Ipanema', en: 'Forum de Ipanema', es: 'Forum de Ipanema', fr: 'Forum de Ipanema' },
        desc: {
            pt: 'Boutiques, lojas locais e clima vintage de Ipanema ✦ 4.4 ★',
            en: "Boutiques, local shops and Ipanema's vintage vibe ✦ 4.4 ★",
            es: 'Boutiques, tiendas locales y ambiente vintage de Ipanema ✦ 4.4 ★',
            fr: "Boutiques, magasins locaux et ambiance vintage d'Ipanema ✦ 4.4 ★"
        },
        estrelas: '★★★★☆',
        dist: { pt: '4 min a pé', en: '4 min walk', es: '4 min a pie', fr: '4 min à pied' },
        horario: {
            pt: 'Seg–Sex 08h–20h | Sáb 08h–18h',
            en: 'Mon–Fri 8am–8pm | Sat 8am–6pm',
            es: 'Lun–Vie 08h–20h | Sáb 08h–18h',
            fr: 'Lun–Ven 8h–20h | Sam 8h–18h'
        },
        mapaLink: 'https://maps.google.com/?q=Forum+de+Ipanema',
        lat: -22.9845092, lng: -43.2056211
    },
];

// Labels do mapa por idioma (inclui badge "Do Hotel")
const MAPA_LABELS = {
    pt: { restaurante: 'Restaurante', shopping: 'Compras', hotelBadge: '★ Do Hotel', hotelNome: '🏨 Hotel — Ipanema Inn', hotelInfo: 'Sua localização atual' },
    en: { restaurante: 'Restaurant', shopping: 'Shopping', hotelBadge: '★ Hotel\'s Own', hotelNome: '🏨 Hotel — Ipanema Inn', hotelInfo: 'Your current location' },
    es: { restaurante: 'Restaurante', shopping: 'Compras', hotelBadge: '★ Del Hotel', hotelNome: '🏨 Hotel — Ipanema Inn', hotelInfo: 'Tu ubicación actual' },
    fr: { restaurante: 'Restaurant', shopping: 'Shopping', hotelBadge: "★ De l'Hôtel", hotelNome: '🏨 Hôtel — Ipanema Inn', hotelInfo: 'Votre position actuelle' },
};

let lugarFiltroAtivo   = 'todos';
let lugarSelecionadoId = null;

function atualizarTextosMapa() {
    const labelEl  = document.getElementById('label-mapa');
    const tituloEl = document.getElementById('titulo-mapa');
    const loadEl   = document.getElementById('mapa-loading-txt');
    const btnTodos = document.getElementById('filtro-todos');
    const btnRest  = document.getElementById('filtro-restaurante');
    const btnShop  = document.getElementById('filtro-shopping');

    if (labelEl)  labelEl.innerText  = t('mapa_label');
    if (tituloEl) tituloEl.innerText = t('mapa_titulo');
    if (loadEl)   loadEl.innerText   = t('mapa_carregando');
    if (btnTodos) btnTodos.innerText = t('mapa_todos');
    if (btnRest)  btnRest.innerText  = t('mapa_restaurantes');
    if (btnShop)  btnShop.innerText  = t('mapa_compras');

    if (document.getElementById('mapa-cards-grid')) {
        renderLugarCards();
    }
}

function filtrarMapa(tipo) {
    lugarFiltroAtivo = tipo;

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
}

function renderLugarCards() {
    const grid = document.getElementById('mapa-cards-grid');
    if (!grid) return;

    const L_    = MAPA_LABELS[idiomaAtual] || MAPA_LABELS['pt'];
    const lista = lugarFiltroAtivo === 'todos'
        ? LUGARES
        : LUGARES.filter(l => l.tipo === lugarFiltroAtivo);

    if (!lista.length) {
        grid.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:20px 0;">${t('vazio')}</div>`;
        return;
    }

    grid.innerHTML = lista.map(lugar => {
        const nome       = lugar.nome[idiomaAtual] || lugar.nome['pt'];
        const desc       = lugar.desc[idiomaAtual] || lugar.desc['pt'];
        const dist       = lugar.dist[idiomaAtual] || lugar.dist['pt'];
        const horario    = lugar.horario[idiomaAtual] || lugar.horario['pt'];
        const tipoLabel  = lugar.tipo === 'restaurante' ? L_.restaurante : L_.shopping;
        const selecionado = lugarSelecionadoId === lugar.id ? ' selecionado' : '';
        const hotelBadge = lugar.hotelProprio
            ? `<div style="display:inline-block;background:var(--gold,#b5843a);color:#fff;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:2px 8px;border-radius:10px;margin-top:2px;">${L_.hotelBadge}</div>`
            : '';

        return `
        <div class="lugar-card${selecionado}${lugar.hotelProprio ? ' hotel-proprio' : ''}"
             onclick="selecionarLugar(${lugar.id})"
             role="button" tabindex="0" aria-label="${nome}">
            <div class="lugar-tipo-badge">${lugar.emoji} ${tipoLabel}</div>
            <div class="lugar-nome">${nome}</div>
            ${hotelBadge}
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
}

function selecionarLugar(id) {
    lugarSelecionadoId = id;
    const lugar = LUGARES.find(l => l.id === id);
    if (!lugar) return;

    renderLugarCards();
    carregarMapaIframe(lugar.mapaSrc || gerarMapaSrc(lugar.lat, lugar.lng));
}

// Gera URL do Google Maps embed para as coordenadas
function gerarMapaSrc(lat, lng) {
    return `https://www.google.com/maps/embed/v1/place?key=&q=${lat},${lng}`;
}

// Mapa geral centrado no hotel
const MAPA_GERAL_SRC = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3675.5!2d${HOTEL_LNG}!3d${HOTEL_LAT}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr`;

function carregarMapaIframe(src) {
    const iframe  = document.getElementById('mapa-iframe');
    const loading = document.getElementById('mapa-loading');
    if (!iframe) return;

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
}

function initMapa() {
    atualizarTextosMapa();
    renderLugarCards();
    carregarMapaIframe(MAPA_GERAL_SRC);

    if (LUGARES.length) {
        setTimeout(() => selecionarLugar(LUGARES[0].id), 600);
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === idiomaAtual);
    });

    trocarIdioma(idiomaAtual);
    initMapa();
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
