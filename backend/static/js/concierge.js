// ==========================================
// CONFIG GLOBAL
// ==========================================
const hotelSlug = window.hotelSlug || '';
const API_BASE = '/api';

let idiomaAtual = localStorage.getItem('lang') || 'pt';
let whatsappAtual = '5521999999999';
let passeioAtual = null;
let listaPasseios = [];

const i18n = {
    pt: {
        btn: 'Reservar',
        vazio: 'Nenhuma experiência disponível.',
        erro: 'Erro ao carregar.',
        explorar: 'Explorar',
        secao_label: 'Passeios',
        secao_titulo: 'Experiências disponíveis',
        sob_consulta: 'Sob consulta',
        por_pessoa: '/ pessoa',
        modal_eyebrow: 'Interesse no Passeio',
        lbl_data: 'Data desejada',
        lbl_horario: 'Horário desejado',
        lbl_nome: 'Nome completo',
        lbl_tel: 'Telefone',
        lbl_qtd: 'Número de pessoas',
        resumo_passeio: 'Passeio',
        resumo_qtd: 'Pessoas',
        resumo_total: 'Total estimado',
        btn_confirmar: 'Falar no WhatsApp',
        sucesso: 'Redirecionando para o WhatsApp!',
        sem_imagem: 'Sem imagem',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `Olá! Me chamo *${nome}* e tenho interesse no passeio *${passeio}* para *${qtd} pessoa(s)*`;
            if (data) msg += `, na data *${data}*`;
            if (horario) msg += ` às *${horario}*`;
            msg += `. Poderia confirmar a disponibilidade?`;
            return msg;
        },
        aviso_wpp: 'Você será direcionado ao WhatsApp do hotel para confirmar sua reserva.',
        campos_obrigatorios: 'Por favor, preencha seu nome e telefone.',
    },
    en: {
        btn: 'Book Now',
        vazio: 'No tours found.',
        erro: 'Loading error.',
        explorar: 'Explore',
        secao_label: 'Tours',
        secao_titulo: 'Available experiences',
        sob_consulta: 'On request',
        por_pessoa: '/ person',
        modal_eyebrow: 'Tour Inquiry',
        lbl_data: 'Preferred date',
        lbl_horario: 'Preferred time',
        lbl_nome: 'Full name',
        lbl_tel: 'Phone',
        lbl_qtd: 'Number of guests',
        resumo_passeio: 'Tour',
        resumo_qtd: 'Guests',
        resumo_total: 'Estimated total',
        btn_confirmar: 'Chat on WhatsApp',
        sucesso: 'Redirecting to WhatsApp!',
        sem_imagem: 'No image',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `Hello! My name is *${nome}* and I'm interested in the tour *${passeio}* for *${qtd} guest(s)*`;
            if (data) msg += ` on *${data}*`;
            if (horario) msg += ` at *${horario}*`;
            msg += `. Could you confirm availability?`;
            return msg;
        },
        aviso_wpp: 'You will be redirected to the hotel\'s WhatsApp to confirm your booking.',
        campos_obrigatorios: 'Please fill in your name and phone number.',
    },
    es: {
        btn: 'Reservar',
        vazio: 'No se encontraron tours.',
        erro: 'Error de carga.',
        explorar: 'Explorar',
        secao_label: 'Paseos',
        secao_titulo: 'Experiencias disponibles',
        sob_consulta: 'Bajo consulta',
        por_pessoa: '/ persona',
        modal_eyebrow: 'Consulta de Paseo',
        lbl_data: 'Fecha preferida',
        lbl_horario: 'Hora preferida',
        lbl_nome: 'Nombre completo',
        lbl_tel: 'Teléfono',
        lbl_qtd: 'Número de personas',
        resumo_passeio: 'Paseo',
        resumo_qtd: 'Personas',
        resumo_total: 'Total estimado',
        btn_confirmar: 'Hablar en WhatsApp',
        sucesso: '¡Redirigiendo al WhatsApp!',
        sem_imagem: 'Sin imagen',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `¡Hola! Me llamo *${nome}* y estoy interesado/a en el paseo *${passeio}* para *${qtd} persona(s)*`;
            if (data) msg += ` en la fecha *${data}*`;
            if (horario) msg += ` a las *${horario}*`;
            msg += `. ¿Podría confirmar disponibilidad?`;
            return msg;
        },
        aviso_wpp: 'Será redirigido al WhatsApp del hotel para confirmar su reserva.',
        campos_obrigatorios: 'Por favor, complete su nombre y teléfono.',
    },
    fr: {
        btn: 'Réserver',
        vazio: 'Aucune visite trouvée.',
        erro: 'Erreur de chargement.',
        explorar: 'Explorer',
        secao_label: 'Visites',
        secao_titulo: 'Expériences disponibles',
        sob_consulta: 'Sur demande',
        por_pessoa: '/ personne',
        modal_eyebrow: 'Demande de Visite',
        lbl_data: 'Date souhaitée',
        lbl_horario: 'Heure souhaitée',
        lbl_nome: 'Nom complet',
        lbl_tel: 'Téléphone',
        lbl_qtd: 'Nombre de personnes',
        resumo_passeio: 'Visite',
        resumo_qtd: 'Personnes',
        resumo_total: 'Total estimé',
        btn_confirmar: 'Contacter sur WhatsApp',
        sucesso: 'Redirection vers WhatsApp!',
        sem_imagem: 'Sans image',
        wpp_msg: (nome, passeio, qtd, data, horario) => {
            let msg = `Bonjour ! Je m'appelle *${nome}* et je suis intéressé(e) par la visite *${passeio}* pour *${qtd} personne(s)*`;
            if (data) msg += ` à la date *${data}*`;
            if (horario) msg += ` à *${horario}*`;
            msg += `. Pourriez-vous confirmer la disponibilité ?`;
            return msg;
        },
        aviso_wpp: 'Vous serez redirigé vers le WhatsApp de l\'hôtel pour confirmer votre réservation.',
        campos_obrigatorios: 'Veuillez remplir votre nom et numéro de téléphone.',
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

        const fotoCapa = data.foto_capa || data.foto_hero || data.imagem_capa || data.capa || '';
        if (fotoCapa) {
            const heroBg = document.getElementById('hero-bg');
            if (heroBg) heroBg.style.backgroundImage = `url('${fotoCapa}')`;
        }

        const elTitle = document.getElementById('txt-hero-title');
        const elSub   = document.getElementById('txt-hero-subtitle');
        if (elTitle && (data.titulo_hero || data.titulo)) elTitle.innerText = data.titulo_hero || data.titulo;
        if (elSub && (data.subtitulo_hero || data.subtitulo)) elSub.innerText = data.subtitulo_hero || data.subtitulo;

    } catch (e) {
        console.error('Erro hotel:', e);
    }
}

// ==========================================
// CARROSSEL
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
    carrIndex = Math.min(max, Math.max(0, carrIndex + dir));
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

        track.innerHTML = listaPasseios.map(p => renderCard(p)).join('');

        carrTotal    = listaPasseios.length;
        carrIndex    = 0;
        carrVisiveis = carrosselCalcularVisiveis();
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
    const imgSrc = p.banner || p.imagem || p.foto || p.foto_capa || p.image || primeiraFoto;

    const imgHTML = imgSrc
        ? `<img src="${imgSrc}" alt="${p.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-img-empty\\'>🌊</div>'">`
        : `<div class="card-img-empty">🌊</div>`;

    return `
    <div class="card-passeio" onclick="abrirModal(${p.id})">
        <div class="card-img">
            ${imgHTML}
            <span class="card-preco-badge">${precoLabel}</span>
        </div>
        <div class="card-body">
            <h3 class="card-nome">${p.nome}</h3>
            <p class="card-desc">${p.descricao || ''}</p>
            <div class="card-footer">
                <div class="card-preco">
                    ${precoLabel}
                    ${precoSub ? `<small>${precoSub}</small>` : ''}
                </div>
                <button class="btn-reservar" onclick="event.stopPropagation(); abrirModal(${p.id})">
                    ${t('btn')}
                </button>
            </div>
        </div>
    </div>`;
}

// ==========================================
// MODAL
// ==========================================
function abrirModal(passeioId) {
    passeioAtual = listaPasseios.find(p => p.id === passeioId);
    if (!passeioAtual) return;

    // Labels i18n
    document.getElementById('modal-eyebrow').innerText       = t('modal_eyebrow');
    document.getElementById('modal-passeio-nome').innerText  = passeioAtual.nome;
    document.getElementById('lbl-data').innerText            = t('lbl_data');
    document.getElementById('lbl-horario').innerText         = t('lbl_horario');
    document.getElementById('lbl-nome').innerText            = t('lbl_nome');
    document.getElementById('lbl-tel').innerText             = t('lbl_tel');
    document.getElementById('lbl-qtd').innerText             = t('lbl_qtd');
    document.getElementById('resumo-label-passeio').innerText = t('resumo_passeio');
    document.getElementById('resumo-label-qtd').innerText    = t('resumo_qtd');
    document.getElementById('resumo-label-total').innerText  = t('resumo_total');

    const avisoEl = document.getElementById('modal-aviso-wpp');
    if (avisoEl) avisoEl.innerText = t('aviso_wpp');

    // Limpa campos
    document.getElementById('res-nome').value    = '';
    document.getElementById('res-tel').value     = '';
    document.getElementById('res-qtd').value     = 1;
    document.getElementById('res-data').value    = '';
    document.getElementById('res-horario').value = '';
    document.getElementById('modal-resumo').classList.remove('show');

    // Galeria
    const galeriaEl = document.getElementById('modal-galeria');
    galeriaEl.innerHTML = '';
    const fotos = passeioAtual.fotos || passeioAtual.galeria || passeioAtual.imagens || [];
    const imgPrincipal = passeioAtual.banner || passeioAtual.imagem || passeioAtual.foto || '';

    if (imgPrincipal) {
        const img = document.createElement('img');
        img.src = imgPrincipal;
        img.className = 'active';
        img.onerror = () => img.remove();
        img.onclick = () => selecionarGaleria(img);
        galeriaEl.appendChild(img);
    }
    fotos.forEach(f => {
        const src = typeof f === 'string' ? f : (f.url || f.imagem || f.foto || '');
        if (!src) return;
        const img = document.createElement('img');
        img.src = src;
        img.onerror = () => img.remove();
        img.onclick = () => selecionarGaleria(img);
        galeriaEl.appendChild(img);
    });

    calcularTotal();
    document.getElementById('modalReserva').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function selecionarGaleria(imgEl) {
    document.querySelectorAll('#modal-galeria img').forEach(i => i.classList.remove('active'));
    imgEl.classList.add('active');
}

function fecharModal() {
    document.getElementById('modalReserva').classList.remove('open');
    document.body.style.overflow = '';
    passeioAtual = null;
}

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
    const nome    = document.getElementById('res-nome').value.trim();
    const telefone = document.getElementById('res-tel').value.trim();
    const qtd     = parseInt(document.getElementById('res-qtd').value) || 1;
    const dataVal = document.getElementById('res-data').value;
    const horario = document.getElementById('res-horario').value;

    if (!nome || !telefone) {
        mostrarToast(t('campos_obrigatorios'), 'error');
        return;
    }

    // Formata data legível se preenchida
    let dataLabel = '';
    if (dataVal) {
        dataLabel = new Date(dataVal + 'T00:00:00').toLocaleDateString(
            idiomaAtual === 'pt' ? 'pt-BR' : idiomaAtual,
            { day: '2-digit', month: 'long', year: 'numeric' }
        );
    }

    const msgFn = t('wpp_msg');
    const mensagem = typeof msgFn === 'function'
        ? msgFn(nome, passeioAtual.nome, qtd, dataLabel, horario)
        : `Olá! Tenho interesse no passeio ${passeioAtual.nome} para ${qtd} pessoa(s).`;

    const url = `https://wa.me/${whatsappAtual}?text=${encodeURIComponent(mensagem)}`;

    mostrarToast(t('sucesso'), 'success');
    fecharModal();
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

    await Promise.all([
        carregarHotel(lang),
        carregarPasseios(lang),
    ]);
}

// ==========================================
// FECHAR COM ESC / CLICK FORA
// ==========================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
});

document.getElementById('modalReserva')?.addEventListener('click', function (e) {
    if (e.target === this) fecharModal();
});

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    trocarIdioma(idiomaAtual);
});

window.trocarIdioma     = trocarIdioma;
window.abrirModal       = abrirModal;
window.fecharModal      = fecharModal;
window.confirmarReserva = confirmarReserva;
window.calcularTotal    = calcularTotal;
window.carrosselMover   = carrosselMover;