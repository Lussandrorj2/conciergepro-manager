// ==========================================
// CONFIG GLOBAL
// ==========================================
function getImageUrl(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    return '';
}

const hotelSlug = window.hotelSlug || '';
const API_BASE  = '/api';

let idiomaAtual  = localStorage.getItem('lang') || 'pt';
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
        // Mapa
        mapa_label: 'Nos arredores',
        mapa_titulo: 'Restaurantes & Centros Comerciais',
        mapa_todos: 'Todos',
        mapa_restaurantes: '🍽 Restaurantes',
        mapa_compras: '🛍 Compras',
        mapa_carregando: 'Carregando mapa…',
        mapa_abrir: 'Abrir no Google Maps',
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
        // Map
        mapa_label: 'Nearby',
        mapa_titulo: 'Restaurants & Shopping',
        mapa_todos: 'All',
        mapa_restaurantes: '🍽 Restaurants',
        mapa_compras: '🛍 Shopping',
        mapa_carregando: 'Loading map…',
        mapa_abrir: 'Open in Google Maps',
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
        // Mapa
        mapa_label: 'Alrededores',
        mapa_titulo: 'Restaurantes & Centros Comerciales',
        mapa_todos: 'Todos',
        mapa_restaurantes: '🍽 Restaurantes',
        mapa_compras: '🛍 Compras',
        mapa_carregando: 'Cargando mapa…',
        mapa_abrir: 'Abrir en Google Maps',
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
        // Carte
        mapa_label: 'Aux alentours',
        mapa_titulo: 'Restaurants & Centres Commerciaux',
        mapa_todos: 'Tous',
        mapa_restaurantes: '🍽 Restaurants',
        mapa_compras: '🛍 Shopping',
        mapa_carregando: 'Chargement de la carte…',
        mapa_abrir: 'Ouvrir dans Google Maps',
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
    try {
        const res = await fetch(`${API_BASE}/hotel/${hotelSlug}/?lang=${lang}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.whatsapp) {
            whatsappAtual = data.whatsapp;
            const wppLink = document.getElementById('wpp-main');
            if (wppLink) wppLink.href = `https://wa.me/${data.whatsapp}`;
        }

        const fotoCapa = getImageUrl(
            data.foto_capa ||
            data.foto_hero ||
            data.imagem_capa ||
            data.capa
        );
        
        if (fotoCapa) {
            const heroBg = document.getElementById('hero-bg');
            if (heroBg) heroBg.style.backgroundImage = `url('${fotoCapa}')`;
        }
        
        const elTitle = document.getElementById('txt-hero-title');
        const elSub   = document.getElementById('txt-hero-subtitle');
        if (elTitle && (data.titulo_hero || data.titulo)) elTitle.innerText = data.titulo_hero || data.titulo;
        if (elSub   && (data.subtitulo_hero || data.subtitulo)) elSub.innerText = data.subtitulo_hero || data.subtitulo;

    } catch (e) {
        console.error('Erro hotel:', e);
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
            const d = document.createElement('button');
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
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
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

    try {
        const res = await fetch(`${API_BASE}/${hotelSlug}/passeios/?lang=${lang}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        listaPasseios = await res.json();

        const countEl = document.getElementById('count-passeios');
        if (countEl) countEl.innerText = `${listaPasseios.length} ${t('secao_label').toLowerCase()}`;

        if (!listaPasseios.length) {
            track.innerHTML = `
                <div class="estado-vazio" style="flex:1">
                    <span class="icon">🏖️</span>
                    <p>${t('vazio')}</p>
                </div>`;
            return;
        }

        track.innerHTML   = listaPasseios.map(p => renderCard(p)).join('');
        carrTotal         = listaPasseios.length;
        carrIndex         = 0;
        carrVisiveis      = carrosselCalcularVisiveis();
        carrosselAtualizar();
        initCarrosselDrag();

    } catch (e) {
        console.error('Erro passeios:', e);
        track.innerHTML = `
            <div class="estado-erro" style="flex:1">
                <span class="icon">⚠️</span>
                <p>${t('erro')}</p>
            </div>`;
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
    const imgSrc = getImageUrl(
        p.banner ||
        p.imagem ||
        p.foto ||
        p.foto_capa ||
        p.image ||
        primeiraFoto
    );
    
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

    const principal = getImageUrl(
        p.banner || p.imagem || p.foto || p.foto_capa || p.image
    );

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
        if (thumbs)  thumbs.innerHTML  = '';
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
        descEl.innerHTML = p.descricao_completa || p.descricao || '';
        descEl.style.display = descEl.innerHTML.trim() ? '' : 'none';
    }

    const chipsEl = document.getElementById('det-chips');
    if (chipsEl) {
        const chips = [];
        if (p.duracao)     chips.push(`⏱ <span>${p.duracao}</span>`);
        if (p.nivel)       chips.push(`🎯 <span>${p.nivel}</span>`);
        if (p.inclui)      chips.push(`✅ <span>${p.inclui}</span>`);
        if (p.saida)       chips.push(`📍 <span>${p.saida}</span>`);
        if (p.idade_min)   chips.push(`👤 <span>A partir de ${p.idade_min} anos</span>`);
        if (p.idiomas)     chips.push(`🌐 <span>${p.idiomas}</span>`);
        chipsEl.innerHTML = chips.map(c => `<div class="det-chip">${c}</div>`).join('');
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
    if (avisoEl) avisoEl.lastChild.textContent = ' ' + t('aviso_wpp');

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
function fecharModal() { fecharDetalhe(); fecharModalReserva(); }

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
        const preco = Number(passeioAtual.preco || 0);
        const total = passeioAtual.preco_por_pessoa ? preco * qtd : preco;
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
// CSRF
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

    if (scrollEl)    scrollEl.innerText    = t('explorar');
    if (labelSecao)  labelSecao.innerText  = t('secao_label');
    if (tituloSecao) tituloSecao.innerText = t('secao_titulo');

    // Atualiza textos do mapa
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
// ==========================================
// MAPA TURÍSTICO
// ==========================================
// ==========================================

// ------------------------------------------
// CONFIGURAÇÃO DE LUGARES
// ------------------------------------------
// Edite este array com os lugares reais próximos ao seu hotel.
//
// Como obter o mapaSrc (embed do Google Maps):
//   1. Acesse maps.google.com e pesquise o lugar
//   2. Clique em "Compartilhar" → aba "Incorporar um mapa"
//   3. Copie o valor do atributo src do <iframe> gerado
//   4. Cole no campo mapaSrc abaixo
//
// Como obter o mapaLink (link direto):
//   1. Pesquise o lugar em maps.google.com
//   2. Copie a URL da barra de endereços do navegador
//
// O campo mapaSrc do MAPA_GERAL_SRC é o mapa da região do hotel,
// sem um lugar específico selecionado. Obtenha-o centralizando o mapa
// no bairro/rua do hotel e usando a opção "Incorporar um mapa".
// ------------------------------------------

const MAPA_GERAL_SRC = 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14907!2d-43.0!3d-22.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr';
// ↑ Substitua pelo embed real da região do seu hotel

const LUGARES = [
    // ── RESTAURANTES ───────────────────────
    {
        id: 1,
        tipo: 'restaurante',
        nome: 'Restaurante Vista Mar',
        descricao: 'Frutos do mar frescos com vista para o oceano',
        estrelas: 4.8,
        distancia: '200m',
        // Substitua pelo src real do embed do Google Maps:
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.0!3d-22.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU0JzAwLjAiUyA0M8KwMDAnMDAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000001',
        // Substitua pelo link real do Google Maps:
        mapaLink: 'https://www.google.com/maps/search/Restaurante+Vista+Mar',
    },
    {
        id: 2,
        tipo: 'restaurante',
        nome: 'Bistrô do Largo',
        descricao: 'Culinária brasileira contemporânea, ambiente aconchegante',
        estrelas: 4.5,
        distancia: '400m',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.01!3d-22.91!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU0JzM2LjAiUyA0M8KwMDAnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000002',
        mapaLink: 'https://www.google.com/maps/search/Bistro+do+Largo',
    },
    {
        id: 3,
        tipo: 'restaurante',
        nome: 'Sushi Sakura',
        descricao: 'Culinária japonesa autêntica, delivery disponível',
        estrelas: 4.6,
        distancia: '600m',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.02!3d-22.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU1JzEyLjAiUyA0M8KwMDEnMTIuMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000003',
        mapaLink: 'https://www.google.com/maps/search/Sushi+Sakura',
    },
    {
        id: 4,
        tipo: 'restaurante',
        nome: 'Cantina della Nonna',
        descricao: 'Massas artesanais e pizzas à lenha, estilo italiano',
        estrelas: 4.7,
        distancia: '750m',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.015!3d-22.915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU0JzU0LjAiUyA0M8KwMDAnNTQuMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000004',
        mapaLink: 'https://www.google.com/maps/search/Cantina+della+Nonna',
    },
    // ── SHOPPING / COMPRAS ──────────────────
    {
        id: 5,
        tipo: 'shopping',
        nome: 'Shopping Costa Verde',
        descricao: 'Lojas, cinema e ampla praça de alimentação',
        estrelas: 4.2,
        distancia: '1.2km',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.03!3d-22.93!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU1JzQ4LjAiUyA0M8KwMDEnNDguMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000005',
        mapaLink: 'https://www.google.com/maps/search/Shopping+Costa+Verde',
    },
    {
        id: 6,
        tipo: 'shopping',
        nome: 'Mercado Municipal',
        descricao: 'Produtos locais, artesanato e souvenirs regionais',
        estrelas: 4.4,
        distancia: '800m',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.005!3d-22.905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU0JzE4LjAiUyA0M8KwMDAnMTguMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000006',
        mapaLink: 'https://www.google.com/maps/search/Mercado+Municipal',
    },
    {
        id: 7,
        tipo: 'shopping',
        nome: 'Galeria das Artes',
        descricao: 'Boutiques, galerias de arte e cafés gourmet',
        estrelas: 4.3,
        distancia: '500m',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.008!3d-22.908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU0JzI4LjgiUyA0M8KwMDAnMjguOCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000007',
        mapaLink: 'https://www.google.com/maps/search/Galeria+das+Artes',
    },
    {
        id: 8,
        tipo: 'shopping',
        nome: 'Centro Comercial Beira-Mar',
        descricao: 'Farmácias, supermercado e lojas de conveniência',
        estrelas: 4.0,
        distancia: '350m',
        mapaSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675!2d-43.003!3d-22.903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDU0JzEwLjgiUyA0M8KwMDAnMTAuOCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000008',
        mapaLink: 'https://www.google.com/maps/search/Centro+Comercial+Beira+Mar',
    },
];

// Estado do mapa
let lugarFiltroAtivo = 'todos';
let lugarSelecionadoId = null;

// ------------------------------------------
// Atualiza textos do mapa conforme idioma
// ------------------------------------------
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

    // Re-renderiza cards com novos textos
    if (document.getElementById('mapa-cards-grid')) {
        renderLugarCards();
    }
}

// ------------------------------------------
// Filtro
// ------------------------------------------
function filtrarMapa(tipo) {
    lugarFiltroAtivo = tipo;

    document.querySelectorAll('.filtro-mapa-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tipo === tipo);
    });

    // Se o lugar selecionado não está no filtro, deseleciona
    if (lugarSelecionadoId !== null) {
        const lugar = LUGARES.find(l => l.id === lugarSelecionadoId);
        if (lugar && tipo !== 'todos' && lugar.tipo !== tipo) {
            lugarSelecionadoId = null;
            carregarMapaIframe(MAPA_GERAL_SRC);
        }
    }

    renderLugarCards();
}

// ------------------------------------------
// Renderiza os cards de lugares
// ------------------------------------------
function renderLugarCards() {
    const grid = document.getElementById('mapa-cards-grid');
    if (!grid) return;

    const lista = lugarFiltroAtivo === 'todos'
        ? LUGARES
        : LUGARES.filter(l => l.tipo === lugarFiltroAtivo);

    if (!lista.length) {
        grid.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:20px 0;">${t('vazio')}</div>`;
        return;
    }

    grid.innerHTML = lista.map(lugar => {
        const tipoLabel = lugar.tipo === 'restaurante'
            ? t('mapa_restaurantes')
            : t('mapa_compras');

        // Estrelas (arredondadas)
        const estrelasCheias = Math.round(lugar.estrelas);
        const estrelasVazias = 5 - estrelasCheias;
        const estrelasHTML = '★'.repeat(estrelasCheias) + '☆'.repeat(estrelasVazias);

        const selecionado = lugarSelecionadoId === lugar.id ? ' selecionado' : '';

        return `
        <div class="lugar-card${selecionado}" onclick="selecionarLugar(${lugar.id})" role="button" tabindex="0" aria-label="${lugar.nome}">
            <div class="lugar-tipo-badge">${tipoLabel}</div>
            <div class="lugar-nome">${lugar.nome}</div>
            <div class="lugar-info-desc">${lugar.descricao}</div>
            <div class="lugar-meta">
                <span class="lugar-estrelas">${estrelasHTML} ${lugar.estrelas.toFixed(1)}</span>
                <span class="lugar-distancia">📍 ${lugar.distancia}</span>
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

    // Teclado: Enter seleciona
    grid.querySelectorAll('.lugar-card').forEach(card => {
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter') card.click();
        });
    });
}

// ------------------------------------------
// Selecionar lugar → atualiza mapa
// ------------------------------------------
function selecionarLugar(id) {
    lugarSelecionadoId = id;
    const lugar = LUGARES.find(l => l.id === id);
    if (!lugar) return;

    renderLugarCards();
    carregarMapaIframe(lugar.mapaSrc);
}

// ------------------------------------------
// Carrega src no iframe com loading state
// ------------------------------------------
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

    // Só atualiza o src se for diferente (evita reload desnecessário)
    if (iframe.src !== src) {
        iframe.src = src;
    } else {
        // Mesmo src, esconde loading imediatamente
        if (loading) loading.classList.add('oculto');
    }
}

// ------------------------------------------
// Inicializa seção do mapa
// ------------------------------------------
function initMapa() {
    atualizarTextosMapa();
    renderLugarCards();
    // Carrega o mapa geral da região ao iniciar
    carregarMapaIframe(MAPA_GERAL_SRC);

    // Seleciona automaticamente o primeiro lugar após 600ms
    if (LUGARES.length) {
        setTimeout(() => selecionarLugar(LUGARES[0].id), 600);
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
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