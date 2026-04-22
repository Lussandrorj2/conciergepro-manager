// ==========================================
// CONFIG GLOBAL
// ==========================================
function getImageUrl(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    return '';
}

var urlParams  = new URLSearchParams(window.location.search);
var hotelSlug  = window.hotelSlug || urlParams.get('hotel');

if (!hotelSlug) {
    console.error('Hotel slug nao definido');
}

var API_BASE = '/api';

var idiomaAtual   = localStorage.getItem('lang') || 'pt';
var whatsappAtual = '5521999999999';
var passeioAtual  = null;
var listaPasseios = [];

var detFotoIndex = 0;
var detFotos     = [];

var i18n = {
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
        wpp_msg: function(nome, passeio, qtd, data, horario) {
            var msg = 'Olá! Me chamo *' + nome + '* e tenho interesse no passeio *' + passeio + '* para *' + qtd + ' pessoa(s)*';
            if (data)    msg += ', na data *' + data + '*';
            if (horario) msg += ' às *' + horario + '*';
            msg += '. Poderia confirmar a disponibilidade?';
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
        mapa_ver: 'Ver no mapa'
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
        wpp_msg: function(nome, passeio, qtd, data, horario) {
            var msg = 'Hello! My name is *' + nome + '* and I\'m interested in the tour *' + passeio + '* for *' + qtd + ' guest(s)*';
            if (data)    msg += ' on *' + data + '*';
            if (horario) msg += ' at *' + horario + '*';
            msg += '. Could you confirm availability?';
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
        mapa_ver: 'View on map'
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
        wpp_msg: function(nome, passeio, qtd, data, horario) {
            var msg = '¡Hola! Me llamo *' + nome + '* y estoy interesado/a en el paseo *' + passeio + '* para *' + qtd + ' persona(s)*';
            if (data)    msg += ' en la fecha *' + data + '*';
            if (horario) msg += ' a las *' + horario + '*';
            msg += '. ¿Podría confirmar disponibilidad?';
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
        mapa_ver: 'Ver en el mapa'
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
        wpp_msg: function(nome, passeio, qtd, data, horario) {
            var msg = "Bonjour ! Je m'appelle *" + nome + "* et je suis intéressé(e) par la visite *" + passeio + "* pour *" + qtd + " personne(s)*";
            if (data)    msg += ' à la date *' + data + '*';
            if (horario) msg += ' à *' + horario + '*';
            msg += '. Pourriez-vous confirmer la disponibilité ?';
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
        mapa_ver: 'Voir sur la carte'
    }
};

function t(key) {
    var lang = i18n[idiomaAtual] || i18n['pt'];
    return lang[key] !== undefined ? lang[key] : (i18n['pt'][key] || key);
}

// ==========================================
// HOTEL (HERO)
// ==========================================
async function carregarHotel(lang) {
    if (!hotelSlug) return;
    try {
        var res = await fetch(API_BASE + '/hotel/' + hotelSlug + '/?lang=' + lang);
        if (!res.ok) { console.warn('[carregarHotel] HTTP', res.status); return; }
        var data = await res.json();

        if (data.whatsapp) {
            whatsappAtual = data.whatsapp;
            var wppLink = document.getElementById('wpp-main');
            if (wppLink) wppLink.href = 'https://wa.me/' + data.whatsapp;
        }

        var heroBg = document.getElementById('hero-bg');
        if (heroBg && data.foto_capa) {
            heroBg.style.backgroundImage = 'url(\'' + data.foto_capa + '\')';
            heroBg.style.opacity = '1';
        }

        var tituloEl    = document.getElementById('txt-hero-title');
        var subtituloEl = document.getElementById('txt-hero-subtitle');
        if (tituloEl && data.titulo_hero)       tituloEl.innerText    = data.titulo_hero;
        if (subtituloEl && data.subtitulo_hero) subtituloEl.innerText = data.subtitulo_hero;

        if (data.mapa_embed) {
            MAPA_GERAL_SRC = data.mapa_embed;
        }

    } catch (error) {
        console.error('[carregarHotel] Erro:', error);
    }
}

// ==========================================
// CARROSSEL PRINCIPAL
// ==========================================
var carrIndex    = 0;
var carrVisiveis = 3;
var carrTotal    = 0;

function carrosselAtualizar() {
    var track   = document.getElementById('passeios-track');
    var btnPrev = document.getElementById('carr-prev');
    var btnNext = document.getElementById('carr-next');
    var dotsEl  = document.getElementById('carr-dots');
    if (!track) return;

    var cardW = 320 + 24;
    track.style.transform = 'translateX(-' + (carrIndex * cardW) + 'px)';

    if (btnPrev) btnPrev.disabled = carrIndex === 0;
    if (btnNext) btnNext.disabled = carrIndex >= carrTotal - carrVisiveis;

    if (dotsEl) {
        dotsEl.innerHTML = '';
        var numDots = Math.max(1, carrTotal - carrVisiveis + 1);
        for (var i = 0; i < numDots; i++) {
            var d = document.createElement('button');
            d.className = 'carr-dot' + (i === carrIndex ? ' active' : '');
            d.onclick = (function(idx) {
                return function() { carrIndex = idx; carrosselAtualizar(); };
            })(i);
            dotsEl.appendChild(d);
        }
    }
}

function carrosselMover(dir) {
    var max = Math.max(0, carrTotal - carrVisiveis);
    carrIndex = Math.min(max, Math.max(0, carrIndex + dir));
    carrosselAtualizar();
}

function carrosselCalcularVisiveis() {
    var viewport = document.getElementById('passeios');
    if (!viewport) return 3;
    var w = viewport.offsetWidth;
    if (w < 480) return 1;
    return Math.max(1, Math.floor(w / (320 + 24)));
}

function initCarrosselDrag() {
    var el = document.getElementById('passeios');
    if (!el) return;
    var startX = 0, isDragging = false;

    var onStart = function(e) {
        isDragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        el.classList.add('dragging');
    };
    var onEnd = function(e) {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('dragging');
        var endX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
        var diff = startX - endX;
        if (Math.abs(diff) > 50) carrosselMover(diff > 0 ? 1 : -1);
    };

    el.addEventListener('mousedown',  onStart);
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('mouseup',    onEnd);
    el.addEventListener('touchend',   onEnd);
    window.addEventListener('resize', function() {
        carrVisiveis = carrosselCalcularVisiveis();
        carrosselAtualizar();
    });
}

// ==========================================
// PASSEIOS
// ==========================================
async function carregarPasseios(lang) {
    var track = document.getElementById('passeios-track');
    if (!track) return;

    if (!hotelSlug) {
        track.innerHTML = '<div class="estado-vazio" style="flex:1"><span class="icon">🏖️</span><p>' + t('vazio') + '</p></div>';
        return;
    }

    try {
        var res = await fetch(API_BASE + '/public/' + hotelSlug + '/passeios/?lang=' + lang);
        if (!res.ok) throw new Error('HTTP ' + res.status);

        listaPasseios = await res.json();

        var countEl = document.getElementById('count-passeios');
        if (countEl) countEl.innerText = listaPasseios.length + ' ' + t('secao_label').toLowerCase();

        if (!listaPasseios.length) {
            track.innerHTML = '<div class="estado-vazio" style="flex:1"><span class="icon">🏖️</span><p>' + t('vazio') + '</p></div>';
            return;
        }

        var html = '';
        for (var i = 0; i < listaPasseios.length; i++) {
            html += renderCard(listaPasseios[i]);
        }
        track.innerHTML = html;

        carrTotal    = listaPasseios.length;
        carrIndex    = 0;
        carrVisiveis = carrosselCalcularVisiveis();
        carrosselAtualizar();
        initCarrosselDrag();

    } catch (e) {
        console.error('[carregarPasseios]', e);
        track.innerHTML = '<div class="estado-erro" style="flex:1"><span class="icon">⚠️</span><p>' + t('erro') + '</p></div>';
    }
}

// ==========================================
// CARD
// ==========================================
function renderCard(p) {
    var precoLabel = p.preco_sob_consulta
        ? t('sob_consulta')
        : 'R$ ' + Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    var precoSub = (p.preco_por_pessoa && !p.preco_sob_consulta) ? t('por_pessoa') : '';

    var primeiraFoto = (p.fotos && p.fotos.length)
        ? (typeof p.fotos[0] === 'string' ? p.fotos[0] : p.fotos[0].url || '')
        : '';
    var imgSrc = getImageUrl(p.banner || p.imagem || p.foto || p.foto_capa || p.image || primeiraFoto);

    var imgHTML = imgSrc
        ? '<img src="' + imgSrc + '" alt="' + p.nome + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\'card-img-empty\\\'>🌊</div>\'">'
        : '<div class="card-img-empty">🌊</div>';

    var precoSubHTML = precoSub ? '<small>' + precoSub + '</small>' : '';

    return '<div class="card-passeio" onclick="abrirDetalhe(' + p.id + ')">' +
        '<div class="card-img">' +
            imgHTML +
            '<span class="card-preco-badge">' + precoLabel + '</span>' +
            '<div class="card-img-hover"><span>' + t('btn') + '</span></div>' +
        '</div>' +
        '<div class="card-body">' +
            '<h3 class="card-nome">' + p.nome + '</h3>' +
            '<p class="card-desc">' + (p.descricao || '') + '</p>' +
            '<div class="card-footer">' +
                '<div class="card-preco">' + precoLabel + precoSubHTML + '</div>' +
                '<button class="btn-reservar" onclick="event.stopPropagation(); abrirDetalhe(' + p.id + ')">' + t('btn') + '</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

// ==========================================
// FOTOS DETALHE
// ==========================================
function coletarFotos(p) {
    var fotos = [];
    var principal = getImageUrl(p.banner || p.imagem || p.foto || p.foto_capa || p.image);
    if (principal) fotos.push(principal);
    var extras = p.fotos || [];
    for (var i = 0; i < extras.length; i++) {
        var src = getImageUrl(extras[i]);
        if (src && src !== principal) fotos.push(src);
    }
    return fotos;
}

function detFotoRender() {
    var track   = document.getElementById('det-foto-track');
    var thumbs  = document.getElementById('det-foto-thumbs');
    var counter = document.getElementById('det-foto-counter');
    var btnPrev = document.getElementById('det-foto-prev');
    var btnNext = document.getElementById('det-foto-next');
    if (!track) return;

    if (!detFotos.length) {
        track.innerHTML = '<div class="det-foto-slide"><div class="det-foto-slide-empty">🌊</div></div>';
        if (thumbs)  thumbs.innerHTML = '';
        if (counter) counter.textContent = '';
        if (btnPrev) btnPrev.style.display = 'none';
        if (btnNext) btnNext.style.display = 'none';
        return;
    }

    var slidesHTML = '';
    for (var i = 0; i < detFotos.length; i++) {
        slidesHTML += '<div class="det-foto-slide"><img src="' + detFotos[i] + '" alt="" onerror="this.parentElement.innerHTML=\'<div class=\\\'det-foto-slide-empty\\\'>🌊</div>\'"></div>';
    }
    track.innerHTML = slidesHTML;

    if (thumbs) {
        if (detFotos.length > 1) {
            var thumbsHTML = '';
            for (var j = 0; j < detFotos.length; j++) {
                thumbsHTML += '<div class="det-thumb ' + (j === detFotoIndex ? 'active' : '') + '" onclick="detFotoIr(' + j + ')">' +
                    '<img src="' + detFotos[j] + '" alt="" onerror="this.style.display=\'none\'">' +
                '</div>';
            }
            thumbs.innerHTML = thumbsHTML;
        } else {
            thumbs.innerHTML = '';
        }
    }

    if (btnPrev) btnPrev.style.display = detFotos.length > 1 ? 'flex' : 'none';
    if (btnNext) btnNext.style.display = detFotos.length > 1 ? 'flex' : 'none';

    detFotoAtualizar();
}

function detFotoAtualizar() {
    var track   = document.getElementById('det-foto-track');
    var counter = document.getElementById('det-foto-counter');
    var btnPrev = document.getElementById('det-foto-prev');
    var btnNext = document.getElementById('det-foto-next');
    var thumbEls = document.querySelectorAll('.det-thumb');

    if (track)   track.style.transform = 'translateX(-' + (detFotoIndex * 100) + '%)';
    if (counter) counter.textContent   = (detFotoIndex + 1) + ' / ' + detFotos.length;
    if (btnPrev) btnPrev.disabled      = detFotoIndex === 0;
    if (btnNext) btnNext.disabled      = detFotoIndex >= detFotos.length - 1;

    thumbEls.forEach(function(th, i) { th.classList.toggle('active', i === detFotoIndex); });
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
    passeioAtual = null;
    for (var i = 0; i < listaPasseios.length; i++) {
        if (listaPasseios[i].id === passeioId) { passeioAtual = listaPasseios[i]; break; }
    }
    if (!passeioAtual) return;

    var p = passeioAtual;
    detFotos     = coletarFotos(p);
    detFotoIndex = 0;
    detFotoRender();

    var eyebrowEl = document.getElementById('det-eyebrow');
    if (eyebrowEl) eyebrowEl.innerText = t('det_eyebrow');

    var nomeEl = document.getElementById('det-nome');
    if (nomeEl) nomeEl.innerText = p.nome;

    var descEl = document.getElementById('det-desc');
    if (descEl) {
        descEl.innerHTML     = p.descricao_completa || p.descricao || '';
        descEl.style.display = descEl.innerHTML.trim() ? '' : 'none';
    }

    var chipsEl = document.getElementById('det-chips');
    if (chipsEl) {
        var chips = [];
        if (p.duracao)   chips.push('⏱ <span>' + p.duracao + '</span>');
        if (p.nivel)     chips.push('🎯 <span>' + p.nivel + '</span>');
        if (p.inclui)    chips.push('✅ <span>' + p.inclui + '</span>');
        if (p.saida)     chips.push('📍 <span>' + p.saida + '</span>');
        if (p.idade_min) chips.push('👤 <span>A partir de ' + p.idade_min + ' anos</span>');
        if (p.idiomas)   chips.push('🌐 <span>' + p.idiomas + '</span>');
        var chipsHTML = '';
        for (var c = 0; c < chips.length; c++) {
            chipsHTML += '<div class="det-chip">' + chips[c] + '</div>';
        }
        chipsEl.innerHTML     = chipsHTML;
        chipsEl.style.display = chips.length ? '' : 'none';
    }

    var precoEl    = document.getElementById('det-preco');
    var precoSubEl = document.getElementById('det-preco-sub');
    if (precoEl) {
        if (p.preco_sob_consulta) {
            precoEl.childNodes[0].textContent = t('sob_consulta');
        } else {
            var val = Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            precoEl.childNodes[0].textContent = 'R$ ' + val;
        }
    }
    if (precoSubEl) {
        precoSubEl.textContent = (!p.preco_sob_consulta && p.preco_por_pessoa) ? t('por_pessoa') : '';
    }

    var btnDet = document.getElementById('btn-reservar-det');
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
    var wrap = document.getElementById('det-foto-wrap');
    if (!wrap || wrap._swipeInit) return;
    wrap._swipeInit = true;

    var startX = 0;
    wrap.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', function(e) {
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) detFotoMover(diff > 0 ? 1 : -1);
    });
}

// ==========================================
// MODAL RESERVA
// ==========================================
function abrirModalReservaDoDetalhe() {
    if (!passeioAtual) return;
    document.getElementById('modalDetalhe').classList.remove('open');
    abrirModalReserva();
}

function abrirModalReserva() {
    if (!passeioAtual) return;
    var p = passeioAtual;

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

    var btnVoltar = document.getElementById('btn-voltar-txt');
    if (btnVoltar) btnVoltar.textContent = t('btn_voltar').replace('← ', '');

    var avisoEl = document.getElementById('modal-aviso-wpp');
    if (avisoEl) {
        var lastChild = avisoEl.lastChild;
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

    var qtd    = parseInt(document.getElementById('res-qtd').value) || 1;
    var resumo = document.getElementById('modal-resumo');

    var totalStr = '';
    if (passeioAtual.preco_sob_consulta) {
        totalStr = t('sob_consulta');
    } else {
        var preco = Number(passeioAtual.preco || 0);
        var total = passeioAtual.preco_por_pessoa ? preco * qtd : preco;
        totalStr = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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
    var nome     = document.getElementById('res-nome').value.trim();
    var telefone = document.getElementById('res-tel').value.trim();
    var qtd      = parseInt(document.getElementById('res-qtd').value) || 1;
    var dataVal  = document.getElementById('res-data').value;
    var horario  = document.getElementById('res-horario').value;

    if (!nome || !telefone) {
        mostrarToast(t('campos_obrigatorios'), 'error');
        return;
    }

    var dataLabel = '';
    if (dataVal) {
        dataLabel = new Date(dataVal + 'T00:00:00').toLocaleDateString(
            idiomaAtual === 'pt' ? 'pt-BR' : idiomaAtual,
            { day: '2-digit', month: 'long', year: 'numeric' }
        );
    }

    var msgFn    = t('wpp_msg');
    var mensagem = typeof msgFn === 'function'
        ? msgFn(nome, passeioAtual.nome, qtd, dataLabel, horario)
        : 'Olá! Tenho interesse no passeio ' + passeioAtual.nome + ' para ' + qtd + ' pessoa(s).';

    var url = 'https://wa.me/' + whatsappAtual + '?text=' + encodeURIComponent(mensagem);

    mostrarToast(t('sucesso'), 'success');
    fecharModalReserva();
    window.open(url, '_blank');
}

// ==========================================
// TOAST
// ==========================================
function mostrarToast(msg, tipo) {
    tipo = tipo || '';
    var container = document.getElementById('toasts');
    var toast     = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
}

// ==========================================
// IDIOMA
// ==========================================
async function trocarIdioma(lang) {
    idiomaAtual = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    var scrollEl    = document.getElementById('txt-scroll');
    var labelSecao  = document.getElementById('label-secao');
    var tituloSecao = document.getElementById('titulo-secao');
    var countEl     = document.getElementById('count-passeios');

    if (scrollEl)    scrollEl.innerText    = t('explorar');
    if (labelSecao)  labelSecao.innerText  = t('secao_label');
    if (tituloSecao) tituloSecao.innerText = t('secao_titulo');

    if (countEl && listaPasseios.length) {
        countEl.innerText = listaPasseios.length + ' ' + t('secao_label').toLowerCase();
    }

    atualizarTextosMapa();

    await Promise.all([
        carregarHotel(lang),
        carregarPasseios(lang)
    ]);
}

// ==========================================
// ESC / CLICK FORA
// ==========================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('modalReserva') && document.getElementById('modalReserva').classList.contains('open')) {
            voltarParaDetalhe();
        } else if (document.getElementById('modalLugar') && document.getElementById('modalLugar').classList.contains('open')) {
            fecharModalLugar();
        } else {
            fecharDetalhe();
        }
    }
});

var elModalDet = document.getElementById('modalDetalhe');
if (elModalDet) elModalDet.addEventListener('click', function(e) { if (e.target === this) fecharDetalhe(); });

var elModalRes = document.getElementById('modalReserva');
if (elModalRes) elModalRes.addEventListener('click', function(e) { if (e.target === this) voltarParaDetalhe(); });

var elModalLug = document.getElementById('modalLugar');
if (elModalLug) elModalLug.addEventListener('click', function(e) { if (e.target === this) fecharModalLugar(); });

// ==========================================
// MAPA
// ==========================================
var MAPA_GERAL_SRC = '';
var LUGARES = [];

var MAPA_LABELS = {
    pt: { restaurante: 'Restaurante', shopping: 'Compras',  hotelBadge: '★ Do Hotel' },
    en: { restaurante: 'Restaurant',  shopping: 'Shopping', hotelBadge: "★ Hotel's Own" },
    es: { restaurante: 'Restaurante', shopping: 'Compras',  hotelBadge: '★ Del Hotel' },
    fr: { restaurante: 'Restaurant',  shopping: 'Shopping', hotelBadge: "★ De l'Hôtel" }
};

var lugarFiltroAtivo   = 'todos';
var lugarSelecionadoId = null;

function filtrarMapa(tipo) {
    lugarFiltroAtivo = tipo;

    document.querySelectorAll('.filtro-mapa-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tipo === tipo);
    });

    if (lugarSelecionadoId !== null) {
        var lugar = null;
        for (var i = 0; i < LUGARES.length; i++) {
            if (LUGARES[i].id === lugarSelecionadoId) { lugar = LUGARES[i]; break; }
        }
        if (lugar && tipo !== 'todos' && lugar.tipo !== tipo) {
            lugarSelecionadoId = null;
            carregarMapaIframe(MAPA_GERAL_SRC);
        }
    }

    renderLugarCards();
}

function selecionarLugar(id) {
    lugarSelecionadoId = id;
    var lugar = null;
    for (var i = 0; i < LUGARES.length; i++) {
        if (LUGARES[i].id === id) { lugar = LUGARES[i]; break; }
    }
    if (!lugar) return;
    carregarMapaIframe(gerarMapaSrc(lugar.lat, lugar.lng));
}

function gerarMapaSrc(lat, lng) {
    return 'https://maps.google.com/maps?q=' + lat + ',' + lng + '&z=16&output=embed';
}

function carregarMapaIframe(src) {
    var iframe  = document.getElementById('mapa-iframe');
    var loading = document.getElementById('mapa-loading');
    if (!iframe) return;

    if (loading) {
        loading.classList.remove('oculto');
        var txtEl = document.getElementById('mapa-loading-txt');
        if (txtEl) txtEl.innerText = t('mapa_carregando');
    }

    iframe.onload = function() {
        if (loading) loading.classList.add('oculto');
    };

    if (iframe.src !== src) {
        iframe.src = src;
    } else {
        if (loading) loading.classList.add('oculto');
    }
}

async function initMapa() {
    atualizarTextosMapa();
    if (MAPA_GERAL_SRC) carregarMapaIframe(MAPA_GERAL_SRC);

    try {
        var res = await fetch('/api/public/' + hotelSlug + '/lugares/');
        if (res.ok) {
            var dados = await res.json();
            LUGARES = dados.map(function(l) {
                return {
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
                    lng:       l.lng
                };
            });
        }
    } catch (e) {
        console.warn('Lugares nao carregados:', e);
    }

    renderLugarCards();
    if (MAPA_GERAL_SRC && MAPA_GERAL_SRC.indexOf('http') === 0) {
        carregarMapaIframe(MAPA_GERAL_SRC);
    }
}

// ==========================================
// MODAL LUGAR
// ==========================================
function abrirModalLugar(id) {
    var l = null;
    for (var i = 0; i < LUGARES.length; i++) {
        if (LUGARES[i].id === id) { l = LUGARES[i]; break; }
    }
    if (!l) return;

    var nome = l.nome[idiomaAtual] || l.nome['pt'];
    var desc = l.desc[idiomaAtual] || l.desc['pt'];
    var dist = l.dist[idiomaAtual] || l.dist['pt'];
    var hor  = l.horario[idiomaAtual] || l.horario['pt'];

    document.getElementById('lugar-tipo').innerText      = l.tipo === 'restaurante' ? '🍽 Restaurante' : '🛍 Compras';
    document.getElementById('lugar-nome').innerText      = nome;
    document.getElementById('lugar-desc').innerText      = desc || '';
    document.getElementById('lugar-horario').innerHTML   = hor  ? '🕐 ' + hor  : '';
    document.getElementById('lugar-distancia').innerHTML = dist ? '🚶 ' + dist : '';
    document.getElementById('lugar-estrelas').innerText  = l.estrelas || '';

    var contatos = document.getElementById('lugar-contatos');
    var html = '';

    if (l.mapaLink) {
        html += '<a href="' + l.mapaLink + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f4f6f9;border-radius:10px;text-decoration:none;color:var(--text);font-size:13px;font-weight:500;border:1px solid #e2e8f0;">📍 Ver no Google Maps</a>';
    }

    if (l.instagram) {
        var igHref = l.instagram.indexOf('http') === 0
            ? l.instagram
            : 'https://instagram.com/' + l.instagram.replace('@', '');
        html += '<a href="' + igHref + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f4f6f9;border-radius:10px;text-decoration:none;color:var(--text);font-size:13px;font-weight:500;border:1px solid #e2e8f0;">📸 Instagram</a>';
    }

    if (l.telefone) {
        html += '<a href="https://wa.me/' + l.telefone.replace(/\D/g, '') + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(37,211,102,0.07);border:1px solid rgba(37,211,102,0.2);border-radius:10px;text-decoration:none;color:#16a34a;font-size:13px;font-weight:500;">💬 WhatsApp</a>';
    }

    contatos.innerHTML = html;
    document.getElementById('modalLugar').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function fecharModalLugar() {
    document.getElementById('modalLugar').classList.remove('open');
    document.body.style.overflow = '';
}

// ==========================================
// CARROSSEL LUGARES (simples, igual aos passeios)
// ==========================================
var lugarCarrIndex    = 0;
var lugarCarrVisiveis = 3;
var lugarCarrTotal    = 0;

function lugarCarrCalcularVisiveis() {
    var vp = document.getElementById('lugares-viewport');
    if (!vp) return 3;
    var w = vp.offsetWidth;
    if (w < 480) return 1;
    return Math.max(1, Math.floor(w / (300 + 20)));
}

function lugarCarrAtualizar() {
    var track   = document.getElementById('lugares-track');
    var btnPrev = document.getElementById('lugares-prev');
    var btnNext = document.getElementById('lugares-next');
    var dotsEl  = document.getElementById('lugares-dots');
    if (!track) return;

    var cardW = 300 + 20;
    track.style.transform = 'translateX(-' + (lugarCarrIndex * cardW) + 'px)';

    if (btnPrev) btnPrev.disabled = lugarCarrIndex === 0;
    if (btnNext) btnNext.disabled = lugarCarrIndex >= lugarCarrTotal - lugarCarrVisiveis;

    if (dotsEl) {
        dotsEl.innerHTML = '';
        var numDots = Math.max(1, lugarCarrTotal - lugarCarrVisiveis + 1);
        for (var i = 0; i < numDots; i++) {
            var d = document.createElement('button');
            d.className = 'lugares-dot' + (i === lugarCarrIndex ? ' active' : '');
            d.setAttribute('aria-label', 'Item ' + (i + 1));
            d.onclick = (function(idx) {
                return function() { lugarCarrIndex = idx; lugarCarrAtualizar(); };
            })(i);
            dotsEl.appendChild(d);
        }
    }
}

function lc360Mover(dir) {
    var max = Math.max(0, lugarCarrTotal - lugarCarrVisiveis);
    lugarCarrIndex = Math.min(max, Math.max(0, lugarCarrIndex + dir));
    lugarCarrAtualizar();
}

function lc360Ir(index) {
    lugarCarrIndex = index;
    lugarCarrAtualizar();
}

function lc360Selecionar(lugarId) {
    abrirModalLugar(lugarId);
    selecionarLugar(lugarId);
}

function initLugarDrag() {
    var vp = document.getElementById('lugares-viewport');
    if (!vp || vp._dragInit) return;
    vp._dragInit = true;

    var startX = 0, isDragging = false;

    var onStart = function(e) {
        isDragging = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        vp.classList.add('dragging');
    };
    var onEnd = function(e) {
        if (!isDragging) return;
        isDragging = false;
        vp.classList.remove('dragging');
        var endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        var diff = startX - endX;
        if (Math.abs(diff) > 50) lc360Mover(diff > 0 ? 1 : -1);
    };

    vp.addEventListener('mousedown',  onStart);
    vp.addEventListener('touchstart', onStart, { passive: true });
    vp.addEventListener('mouseup',    onEnd);
    vp.addEventListener('touchend',   onEnd);
}

// ==========================================
// RENDER LUGAR CARDS
// ==========================================
function renderLugarCards() {
    var grid = document.getElementById('mapa-cards-grid');
    if (!grid) return;

    var L_ = MAPA_LABELS[idiomaAtual] || MAPA_LABELS['pt'];
    var lista = lugarFiltroAtivo === 'todos'
        ? LUGARES
        : LUGARES.filter(function(l) { return l.tipo === lugarFiltroAtivo; });

    if (!lista.length) {
        grid.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:20px 0;">' + t('vazio') + '</div>';
        lugarCarrTotal = 0;
        return;
    }

    lugarCarrTotal    = lista.length;
    lugarCarrIndex    = 0;
    lugarCarrVisiveis = lugarCarrCalcularVisiveis();

    var cardsHTML = '';
    for (var i = 0; i < lista.length; i++) {
        var lugar     = lista[i];
        var nome      = lugar.nome[idiomaAtual] || lugar.nome['pt'];
        var desc      = lugar.desc[idiomaAtual] || lugar.desc['pt'];
        var dist      = lugar.dist[idiomaAtual] || lugar.dist['pt'];
        var horario   = lugar.horario[idiomaAtual] || lugar.horario['pt'];
        var tipoLabel = lugar.tipo === 'restaurante' ? L_.restaurante : L_.shopping;
        var horHTML   = horario ? '<div class="lugar-horario-txt">🕐 ' + horario + '</div>' : '';

        cardsHTML +=
            '<div class="lugar-card"' +
            ' onclick="lc360Selecionar(' + lugar.id + ')"' +
            ' role="button" tabindex="0" aria-label="' + nome + '">' +
                '<div class="lugar-tipo-badge">' + lugar.emoji + ' ' + tipoLabel + '</div>' +
                '<div class="lugar-nome">' + nome + '</div>' +
                '<div class="lugar-info-desc">' + (desc || '') + '</div>' +
                horHTML +
                '<div class="lugar-meta">' +
                    '<span class="lugar-estrelas">' + lugar.estrelas + '</span>' +
                    '<span>🚶 ' + (dist || '') + '</span>' +
                '</div>' +
                (lugar.mapaLink ? '<a class="lugar-card-link" href="' + lugar.mapaLink + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗ ' + t('mapa_abrir') + '</a>' : '') +
            '</div>';
    }

    grid.innerHTML =
        '<div class="lugares-carrossel-wrapper">' +
            '<button class="lugares-nav-btn prev" id="lugares-prev" onclick="lc360Mover(-1)" aria-label="Anterior" disabled>&#x2039;</button>' +
            '<button class="lugares-nav-btn next" id="lugares-next" onclick="lc360Mover(1)"  aria-label="Próximo">&#x203a;</button>' +
            '<div class="lugares-viewport" id="lugares-viewport">' +
                '<div class="lugares-track" id="lugares-track">' +
                    cardsHTML +
                '</div>' +
            '</div>' +
            '<div class="lugares-dots" id="lugares-dots"></div>' +
        '</div>';

    lugarCarrVisiveis = lugarCarrCalcularVisiveis();
    lugarCarrAtualizar();
    initLugarDrag();

    window.addEventListener('resize', function() {
        lugarCarrVisiveis = lugarCarrCalcularVisiveis();
        lugarCarrAtualizar();
    });
}

// ==========================================
// ATUALIZAR TEXTOS MAPA
// ==========================================
function atualizarTextosMapa() {
    var labelEl  = document.getElementById('label-mapa');
    var tituloEl = document.getElementById('titulo-mapa');
    var loadEl   = document.getElementById('mapa-loading-txt');
    var btnTodos = document.getElementById('filtro-todos');
    var btnRest  = document.getElementById('filtro-restaurante');
    var btnShop  = document.getElementById('filtro-shopping');

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

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async function() {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === idiomaAtual);
    });

    await carregarHotel(idiomaAtual);
    await Promise.all([
        carregarPasseios(idiomaAtual),
        initMapa()
    ]);
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
window.lc360Mover                 = lc360Mover;
window.lc360Ir                    = lc360Ir;
window.lc360Selecionar            = lc360Selecionar;
window.fecharModalLugar           = fecharModalLugar;
