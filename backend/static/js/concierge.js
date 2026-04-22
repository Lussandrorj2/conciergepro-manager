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
if (!hotelSlug) console.error('Hotel slug nao definido');

var API_BASE      = '/api';
var idiomaAtual   = localStorage.getItem('lang') || 'pt';
var whatsappAtual = '5521999999999';
var passeioAtual  = null;
var listaPasseios = [];
var detFotoIndex  = 0;
var detFotos      = [];

var i18n = {
    pt: {
    btn: 'Ver detalhes', vazio: 'Nenhuma experiencia disponivel.', erro: 'Erro ao carregar.',
    explorar: 'Explorar', secao_label: 'Passeios', secao_titulo: 'Experiencias disponiveis',
    sob_consulta: 'Sob consulta', por_pessoa: '/ pessoa', modal_eyebrow: 'Interesse no Passeio',
    det_eyebrow: 'Experiencia', lbl_data: 'Data desejada', lbl_horario: 'Horario desejado',
    lbl_nome: 'Nome completo', lbl_tel: 'Telefone', lbl_qtd: 'Numero de pessoas',
    resumo_passeio: 'Passeio', resumo_qtd: 'Pessoas', resumo_total: 'Total estimado',
    btn_confirmar: 'Falar no WhatsApp', btn_reservar_det: 'Reservar agora',
    btn_voltar: 'Voltar aos detalhes', sucesso: 'Redirecionando para o WhatsApp!',
    sem_imagem: 'Sem imagem',
    wpp_msg: function(n,p,q,d,h){ var m='Ola! Me chamo *'+n+'* e tenho interesse no passeio *'+p+'* para *'+q+' pessoa(s)*'; if(d) m+=', na data *'+d+'*'; if(h) m+=' as *'+h+'*'; m+='. Poderia confirmar a disponibilidade?'; return m; },
    aviso_wpp: 'Voce sera direcionado ao WhatsApp do hotel para confirmar sua reserva.',
    campos_obrigatorios: 'Por favor, preencha seu nome e telefone.',
    mapa_label: 'Nos arredores', mapa_titulo: 'Restaurantes & Centros Comerciais',
    mapa_todos: 'Todos', mapa_restaurantes: 'Restaurantes', mapa_compras: 'Compras',
    mapa_carregando: 'Carregando mapa…', mapa_abrir: 'Ver no Google Maps', mapa_ver: 'Ver no mapa'
    },
    en: {
    btn: 'See details', vazio: 'No tours found.', erro: 'Loading error.',
    explorar: 'Explore', secao_label: 'Tours', secao_titulo: 'Available experiences',
    sob_consulta: 'On request', por_pessoa: '/ person', modal_eyebrow: 'Tour Inquiry',
    det_eyebrow: 'Experience', lbl_data: 'Preferred date', lbl_horario: 'Preferred time',
    lbl_nome: 'Full name', lbl_tel: 'Phone', lbl_qtd: 'Number of guests',
    resumo_passeio: 'Tour', resumo_qtd: 'Guests', resumo_total: 'Estimated total',
    btn_confirmar: 'Chat on WhatsApp', btn_reservar_det: 'Book now',
    btn_voltar: 'Back to details', sucesso: 'Redirecting to WhatsApp!', sem_imagem: 'No image',
    wpp_msg: function(n,p,q,d,h){ var m='Hello! My name is *'+n+"* and I'm interested in the tour *"+p+'* for *'+q+' guest(s)*'; if(d) m+=' on *'+d+'*'; if(h) m+=' at *'+h+'*'; m+='. Could you confirm availability?'; return m; },
    aviso_wpp: "You will be redirected to the hotel's WhatsApp to confirm your booking.",
    campos_obrigatorios: 'Please fill in your name and phone number.',
    mapa_label: 'Nearby', mapa_titulo: 'Restaurants & Shopping',
    mapa_todos: 'All', mapa_restaurantes: 'Restaurants', mapa_compras: 'Shopping',
    mapa_carregando: 'Loading map…', mapa_abrir: 'View on Google Maps', mapa_ver: 'View on map'
    },
    es: {
    btn: 'Ver detalles', vazio: 'No se encontraron tours.', erro: 'Error de carga.',
    explorar: 'Explorar', secao_label: 'Paseos', secao_titulo: 'Experiencias disponibles',
    sob_consulta: 'Bajo consulta', por_pessoa: '/ persona', modal_eyebrow: 'Consulta de Paseo',
    det_eyebrow: 'Experiencia', lbl_data: 'Fecha preferida', lbl_horario: 'Hora preferida',
    lbl_nome: 'Nombre completo', lbl_tel: 'Telefono', lbl_qtd: 'Numero de personas',
    resumo_passeio: 'Paseo', resumo_qtd: 'Personas', resumo_total: 'Total estimado',
    btn_confirmar: 'Hablar en WhatsApp', btn_reservar_det: 'Reservar ahora',
    btn_voltar: 'Volver a detalles', sucesso: 'Redirigiendo al WhatsApp!', sem_imagem: 'Sin imagen',
    wpp_msg: function(n,p,q,d,h){ var m='Hola! Me llamo *'+n+'* y estoy interesado en el paseo *'+p+'* para *'+q+' persona(s)*'; if(d) m+=' en la fecha *'+d+'*'; if(h) m+=' a las *'+h+'*'; m+='. Podria confirmar disponibilidad?'; return m; },
    aviso_wpp: 'Sera redirigido al WhatsApp del hotel para confirmar su reserva.',
    campos_obrigatorios: 'Por favor, complete su nombre y telefono.',
    mapa_label: 'Alrededores', mapa_titulo: 'Restaurantes & Centros Comerciales',
    mapa_todos: 'Todos', mapa_restaurantes: 'Restaurantes', mapa_compras: 'Compras',
    mapa_carregando: 'Cargando mapa…', mapa_abrir: 'Ver en Google Maps', mapa_ver: 'Ver en el mapa'
    },
    fr: {
    btn: 'Voir details', vazio: 'Aucune visite trouvee.', erro: 'Erreur de chargement.',
    explorar: 'Explorer', secao_label: 'Visites', secao_titulo: 'Experiences disponibles',
    sob_consulta: 'Sur demande', por_pessoa: '/ personne', modal_eyebrow: 'Demande de Visite',
    det_eyebrow: 'Experience', lbl_data: 'Date souhaitee', lbl_horario: 'Heure souhaitee',
    lbl_nome: 'Nom complet', lbl_tel: 'Telephone', lbl_qtd: 'Nombre de personnes',
    resumo_passeio: 'Visite', resumo_qtd: 'Personnes', resumo_total: 'Total estime',
    btn_confirmar: 'Contacter sur WhatsApp', btn_reservar_det: 'Reserver maintenant',
    btn_voltar: 'Retour aux details', sucesso: 'Redirection vers WhatsApp!', sem_imagem: 'Sans image',
    wpp_msg: function(n,p,q,d,h){ var m="Bonjour ! Je m'appelle *"+n+"* et je suis interesse par la visite *"+p+"* pour *"+q+" personne(s)*"; if(d) m+=" a la date *"+d+"*"; if(h) m+=" a *"+h+"*"; m+=". Pourriez-vous confirmer la disponibilite ?"; return m; },
    aviso_wpp: "Vous serez redirige vers le WhatsApp de l'hotel pour confirmer votre reservation.",
    campos_obrigatorios: "Veuillez remplir votre nom et numero de telephone.",
    mapa_label: 'Aux alentours', mapa_titulo: 'Restaurants & Centres Commerciaux',
    mapa_todos: 'Tous', mapa_restaurantes: 'Restaurants', mapa_compras: 'Shopping',
    mapa_carregando: 'Chargement de la carte…', mapa_abrir: 'Voir sur Google Maps', mapa_ver: 'Voir sur la carte'
    }
};

function t(key) {
    var lang = i18n[idiomaAtual] || i18n['pt'];
    return lang[key] !== undefined ? lang[key] : (i18n['pt'][key] || key);
}

// ==========================================
// HOTEL
// ==========================================
async function carregarHotel(lang) {
    if (!hotelSlug) return;
    try {
        var res = await fetch(API_BASE + '/hotel/' + hotelSlug + '/?lang=' + lang);
        if (!res.ok) return;
        var data = await res.json();
        if (data.whatsapp) {
            whatsappAtual = data.whatsapp;
            var wl = document.getElementById('wpp-main');
            if (wl) wl.href = 'https://wa.me/' + data.whatsapp;
        }
        var bg = document.getElementById('hero-bg');
        if (bg && data.foto_capa) {
            bg.style.backgroundImage = "url('' + data.foto_capa + '')";
            bg.style.opacity = '1';
        }
        var t1 = document.getElementById('txt-hero-title');
        var t2 = document.getElementById('txt-hero-subtitle');
        if (t1 && data.titulo_hero)    t1.innerText = data.titulo_hero;
        if (t2 && data.subtitulo_hero) t2.innerText = data.subtitulo_hero;
        if (data.mapa_embed) MAPA_GERAL_SRC = data.mapa_embed;
    } catch(e) { console.error('[carregarHotel]', e); }
}
    
// ==========================================
// COVERFLOW ENGINE
// ==========================================
var carrIndex = 0;
var carrTotal = 0;

function coverflowGetCardWidth() {
    var w = window.innerWidth;
    if (w <= 480) return Math.min(w * 0.80, 270);
    if (w <= 768) return Math.min(w * 0.74, 290);
    return 280;
}

function coverflowGetConfig() {
    var isMobile = window.innerWidth <= 768;
    return {
        rotateY:     isMobile ? 42 : 50,
        transZ:      isMobile ? -110 : -140,
        gap:         isMobile ? 0.52 : 0.56,
        scaleActive: isMobile ? 1.05 : 1.08,
        scaleSide:   isMobile ? 0.82 : 0.84,
        scaleFar:    isMobile ? 0.68 : 0.70
    };
}

function coverflowAtualizar() {
    var track   = document.getElementById('passeios-track');
    var btnPrev = document.getElementById('carr-prev');
    var btnNext = document.getElementById('carr-next');
    var dotsEl  = document.getElementById('carr-dots');
    if (!track) return;


    var cards = Array.from(track.querySelectorAll('.card-passeio'));
    var cfg   = coverflowGetConfig();
    
    cards.forEach(function(card, i) {
        var diff = i - carrIndex;
        var absD = Math.abs(diff);
    
        card.classList.toggle('coverflow-active', diff === 0);
    
        var cardW   = card.offsetWidth || coverflowGetCardWidth();
        var baseX   = -(cardW / 2);
        var offsetX = diff * cardW * cfg.gap;
        var rotY    = diff < 0 ? cfg.rotateY : (diff > 0 ? -cfg.rotateY : 0);
        var transZ  = diff === 0 ? 0 : cfg.transZ * Math.min(absD, 2);
    
        var scale;
        if (diff === 0)      scale = cfg.scaleActive;
        else if (absD === 1) scale = cfg.scaleSide;
        else                 scale = Math.max(0.55, cfg.scaleFar - (absD - 2) * 0.08);
    
        var opacity = diff === 0 ? 1 : Math.max(0.25, 0.65 - (absD - 1) * 0.18);
        var bright  = diff === 0 ? 1 : Math.max(0.45, 0.68 - (absD - 1) * 0.12);
        var sat     = diff === 0 ? 1 : Math.max(0.25, 0.50 - (absD - 1) * 0.10);
        var zIndex  = 20 - absD;
    
        if (absD > 4) {
            card.style.visibility    = 'hidden';
            card.style.pointerEvents = 'none';
            return;
        }
    
        card.style.visibility    = 'visible';
        card.style.pointerEvents = absD > 2 ? 'none' : '';
        card.style.zIndex        = zIndex;
        card.style.opacity       = opacity;
        card.style.filter        = 'brightness(' + bright + ') saturate(' + sat + ')';
        card.style.transform     = [
            'translateX(' + (baseX + offsetX) + 'px)',
            'translateZ(' + transZ + 'px)',
            'rotateY('    + rotY   + 'deg)',
            'scale('      + scale  + ')'
        ].join(' ');
    });
    
    var activeCard = cards[carrIndex];
    if (activeCard) {
        var h = activeCard.offsetHeight;
        if (h > 0) track.style.height = (h + 40) + 'px';
    }
    
    if (btnPrev) btnPrev.disabled = carrIndex === 0;
    if (btnNext) btnNext.disabled = carrIndex >= carrTotal - 1;
    
    if (dotsEl) {
        dotsEl.innerHTML = '';
        for (var j = 0; j < carrTotal; j++) {
            var d = document.createElement('button');
            d.className = 'carr-dot' + (j === carrIndex ? ' active' : '');
            d.setAttribute('aria-label', 'Item ' + (j + 1));
            d.onclick = (function(idx){ return function(){ coverflowIr(idx); }; })(j);
            dotsEl.appendChild(d);
        }
    }
}

function carrosselMover(dir) {
    carrIndex = Math.min(carrTotal - 1, Math.max(0, carrIndex + dir));
    coverflowAtualizar();
}

function coverflowIr(idx) {
    carrIndex = Math.max(0, Math.min(carrTotal - 1, idx));
    coverflowAtualizar();
}

function initCarrosselDrag() {
    var el = document.getElementById('passeios');
    if (!el || el._dragInit) return;
    el._dragInit = true;
    
    
    var startX = 0, startY = 0, isH = null, dragging = false;
    
    el.addEventListener('mousedown', function(e) {
        dragging = true; isH = null;
        startX = e.clientX; startY = e.clientY;
        el.classList.add('dragging');
    });
    el.addEventListener('touchstart', function(e) {
        dragging = true; isH = null;
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, { passive: true });
    
    el.addEventListener('touchmove', function(e) {
        if (!dragging) return;
        var dx = Math.abs(e.touches[0].clientX - startX);
        var dy = Math.abs(e.touches[0].clientY - startY);
        if (isH === null) isH = dx > dy;
        if (isH && e.cancelable) e.preventDefault();
    }, { passive: false });
    
    var onEnd = function(e) {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('dragging');
        var endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        if (isH && Math.abs(startX - endX) > 40) {
            carrosselMover(startX - endX > 0 ? 1 : -1);
        }
    };
    el.addEventListener('mouseup',  onEnd);
    el.addEventListener('touchend', onEnd);
    
    el.addEventListener('click', function(e) {
        var card = e.target.closest('.card-passeio');
        if (!card) return;
        var cards = Array.from(el.querySelectorAll('.card-passeio'));
        var idx = cards.indexOf(card);
        if (idx >= 0 && idx !== carrIndex) {
            e.stopPropagation();
            coverflowIr(idx);
        }
    }, true);
    
    window.addEventListener('resize', function() { coverflowAtualizar(); });
    
    
}
    
document.addEventListener('keydown', function(e) {
    if (document.querySelector('.modal-overlay.open')) return;
    if (e.key === 'ArrowLeft')  carrosselMover(-1);
    if (e.key === 'ArrowRight') carrosselMover(1);
});

// ==========================================
// PASSEIOS
// ==========================================
async function carregarPasseios(lang) {
    var track = document.getElementById('passeios-track');
    if (!track) return;
    
    
    if (!hotelSlug) {
        track.innerHTML = '<div class='estado-vazio'><span class='icon'>&#127958;</span><p>' + t('vazio') + '</p></div>';
        return;
    }
    
    try {
        var res = await fetch(API_BASE + '/public/' + hotelSlug + '/passeios/?lang=' + lang);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        listaPasseios = await res.json();
    
        var countEl = document.getElementById('count-passeios');
        if (countEl) countEl.innerText = listaPasseios.length + ' ' + t('secao_label').toLowerCase();
    
        if (!listaPasseios.length) {
            track.innerHTML = '<div class='estado-vazio'><span class='icon'>&#127958;</span><p>' + t('vazio') + '</p></div>';
            return;
        }
    
        track.innerHTML = listaPasseios.map(renderCard).join('');
        carrTotal = listaPasseios.length;
        carrIndex = 0;
    
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                coverflowAtualizar();
                initCarrosselDrag();
            });
        });
    
    } catch(e) {
        console.error('[carregarPasseios]', e);
        track.innerHTML = '<div class='estado-erro'><span class='icon'>&#9888;</span><p>' + t('erro') + '</p></div>';
    }
}

// ==========================================
// CARD RENDER
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
        ? '<img src='' + imgSrc + '' alt='' + escapeHTML(p.nome) + '' loading='lazy' onerror="this.parentElement.innerHTML=\'<div class=\\\'card-img-empty\\\'>&#127754;</div>\'">'
        : '<div class="card-img-empty">🌊</div>';

    var precoSubHTML = precoSub ? '<small>' + precoSub + '</small>' : '';

    return (
        '<div class="card-passeio" data-id="' + p.id + '" onclick="handleCardClick(' + p.id + ', this)">' +
            '<div class="card-img">' +
                imgHTML +
                '<div class="card-img-hover"><span>' + t('btn') + '</span></div>' +
            '</div>' +
            '<div class="card-body">' +
                '<h3 class="card-nome">' + escapeHTML(p.nome) + '</h3>' +
                '<p class="card-desc">' + escapeHTML(p.descricao || '') + '</p>' +
                '<div class="card-footer">' +
                    '<div class="card-preco">' + precoLabel + precoSubHTML + '</div>' +
                    '<button class="btn-reservar" onclick="event.stopPropagation();handleCardClick(' + p.id + ',null)">' + t('btn') + '</button>' +
                '</div>' +
            '</div>' +
        '</div>'
    );
}

function handleCardClick(passeioId, cardEl) {
    var track = document.getElementById('passeios-track');
    if (!track) return;
    var cards = Array.from(track.querySelectorAll('.card-passeio'));
    var idx = cards.findIndex(function(c){ return parseInt(c.dataset.id) === passeioId; });
    if (idx >= 0 && idx !== carrIndex) { coverflowIr(idx); return; }
    abrirDetalhe(passeioId);
}

// ==========================================
// FOTOS DETALHE
// ==========================================
function coletarFotos(p) {
    var fotos = [];
    var principal = getImageUrl(p.banner || p.imagem || p.foto || p.foto_capa || p.image);
    if (principal) fotos.push(principal);
    (p.fotos || []).forEach(function(f) {
        var s = getImageUrl(f);
        if (s && s !== principal) fotos.push(s);
    });
    return fotos;
}

    function detFotoRender() {
        var track   = document.getElementById("det-foto-track");
        var thumbs  = document.getElementById("det-foto-thumbs");
        var btnPrev = document.getElementById("det-foto-prev");
        var btnNext = document.getElementById("det-foto-next");
        if (!track) return;
    
    
    if (!detFotos.length) {
        track.innerHTML = '<div class="det-foto-slide"><div class="det-foto-slide-empty">&#127754;</div></div>';
        if (thumbs) thumbs.innerHTML = '';
        if (btnPrev) btnPrev.style.display = 'none';
        if (btnNext) btnNext.style.display = 'none';
        return;
    }
    
    track.innerHTML = detFotos.map(function(src) {
        return '<div class="det-foto-slide"><img src="' + src + '" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\'det-foto-slide-empty\\\'>&#127754;</div>\'"></div>';
    }).join('');
    
    if (thumbs) {
        thumbs.innerHTML = detFotos.length > 1 ? detFotos.map(function(src, j) {
            return '<div class="det-thumb ' + (j === detFotoIndex ? 'active' : '') + '" onclick="detFotoIr(' + j + ')"><img src="' + src + '" alt=""></div>';
        }).join('') : '';
    }
    
    if (btnPrev) btnPrev.style.display = detFotos.length > 1 ? 'flex' : 'none';
    if (btnNext) btnNext.style.display = detFotos.length > 1 ? 'flex' : 'none';
    detFotoAtualizar();


}

function detFotoAtualizar() {
    var track    = document.getElementById("det-foto-track");
    var counter  = document.getElementById("det-foto-counter");
    var btnPrev  = document.getElementById("det-foto-prev");
    var btnNext  = document.getElementById("det-foto-next");
    var thumbEls = document.querySelectorAll(".det-thumb");
    if (track)   track.style.transform = 'translateX(-" + (detFotoIndex * 100) + "%)';
    if (counter) counter.textContent   = (detFotoIndex + 1) + ' / ' + detFotos.length;
    if (btnPrev) btnPrev.disabled      = detFotoIndex === 0;
    if (btnNext) btnNext.disabled      = detFotoIndex >= detFotos.length - 1;
    thumbEls.forEach(function(th, i) { th.classList.toggle('active', i === detFotoIndex); });
}

function detFotoMover(dir) { detFotoIndex = Math.min(detFotos.length - 1, Math.max(0, detFotoIndex + dir)); detFotoAtualizar(); }
function detFotoIr(i) { detFotoIndex = i; detFotoAtualizar(); }

// ==========================================
// MODAL DETALHE
// ==========================================
function abrirDetalhe(passeioId) {
    passeioAtual = listaPasseios.find(function(p){ return p.id === passeioId; }) || null;
    if (!passeioAtual) return;
    var p = passeioAtual;


    detFotos = coletarFotos(p); detFotoIndex = 0; detFotoRender();
    
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.innerText = val; };
    set('det-eyebrow', t('det_eyebrow'));
    set('det-nome', p.nome);
    
    var descEl = document.getElementById('det-desc');
    if (descEl) {
        descEl.innerHTML = p.descricao_completa || p.descricao || '';
        descEl.style.display = descEl.innerHTML.trim() ? '' : 'none';
    }
    
    var chipsEl = document.getElementById('det-chips');
    if (chipsEl) {
        var chips = [];
        if (p.duracao)   chips.push('&#9201; <span>' + p.duracao + '</span>');
        if (p.nivel)     chips.push('&#127919; <span>' + p.nivel + '</span>');
        if (p.inclui)    chips.push('&#9989; <span>' + p.inclui + '</span>');
        if (p.saida)     chips.push('&#128205; <span>' + p.saida + '</span>');
        if (p.idade_min) chips.push('&#128100; <span>A partir de ' + p.idade_min + ' anos</span>');
        if (p.idiomas)   chips.push('&#127760; <span>' + p.idiomas + '</span>');
        chipsEl.innerHTML = chips.map(function(c){ return '<div class="det-chip">' + c + '</div>'; }).join('');
        chipsEl.style.display = chips.length ? '' : 'none';
    }
    
    var precoEl    = document.getElementById('det-preco');
    var precoSubEl = document.getElementById('det-preco-sub');
    if (precoEl) {
        precoEl.childNodes[0].textContent = p.preco_sob_consulta
            ? t('sob_consulta')
            : 'R$ ' + Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    if (precoSubEl) precoSubEl.textContent = (!p.preco_sob_consulta && p.preco_por_pessoa) ? t('por_pessoa') : '';
    
    var btnDet = document.getElementById('btn-reservar-det');
    if (btnDet) btnDet.textContent = t('btn_reservar_det');
    
    initDetFotoSwipe();
    document.getElementById('modalDetalhe').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function fecharDetalhe() {
    document.getElementById("modalDetalhe").classList.remove("open"); 
    document.body.style.overflow = '';
    }

function initDetFotoSwipe() {
    var wrap = document.getElementById("det-foto-wrap");
    if (!wrap || wrap._swipeInit) return;
    wrap._swipeInit = true;
    var sx = 0;
    wrap.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener("touchend",   function(e){ var d = sx - e.changedTouches[0].clientX; if (Math.abs(d) > 40) detFotoMover(d > 0 ? 1 : -1); });
}

// ==========================================
// MODAL RESERVA
// ==========================================
function abrirModalReservaDoDetalhe() {
    if (!passeioAtual) return;
    document.getElementById("modalDetalhe").classList.remove("open");
    abrirModalReserva();
    }

function abrirModalReserva() {
    if (!passeioAtual) return;
    var p = passeioAtual;
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.innerText = val; };
    set("modal-eyebrow",        t("modal_eyebrow"));
    set("modal-passeio-nome",   p.nome);
    set("lbl-data",             t("lbl_data"));
    set("lbl-horario",          t("lbl_horario"));
    set("lbl-nome",             t("lbl_nome"));
    set("lbl-tel",              t("lbl_tel"));
    set("lbl-qtd",              t("lbl_qtd"));
    set("resumo-label-passeio", t("resumo_passeio"));
    set("resumo-label-qtd",     t("resumo_qtd"));
    set("resumo-label-total",   t("resumo_total"));
    
    var bv = document.getElementById('btn-voltar-txt');
    if (bv) bv.textContent = t('btn_voltar');
    
    var av = document.getElementById('modal-aviso-wpp');
    if (av) {
        var lc = av.lastChild;
        if (lc && lc.nodeType === Node.TEXT_NODE) lc.textContent = ' ' + t('aviso_wpp');
    }
    
    ['res-nome', 'res-tel', 'res-data', 'res-horario'].forEach(function(id){
        var el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('res-qtd').value = 1;
    document.getElementById('modal-resumo').classList.remove('show');
    calcularTotal();
    document.getElementById('modalReserva').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function voltarParaDetalhe() {
    document.getElementById("modalReserva").classList.remove("open");
    if (passeioAtual) document.getElementById("modalDetalhe").classList.add("open");
    else document.body.style.overflow = '';
}

function fecharModalReserva() {
    document.getElementById("modalReserva").classList.remove("open");
    document.body.style.overflow = '';
    passeioAtual = null;
}

function abrirModal(id) { abrirDetalhe(id); }
function fecharModal()  { fecharDetalhe(); fecharModalReserva(); }

function calcularTotal() {
    if (!passeioAtual) return;
    var qtd = parseInt(document.getElementById("res-qtd").value) || 1;
    var totalStr = passeioAtual.preco_sob_consulta
        ? t("sob_consulta")
        : 'R$ ' + (passeioAtual.preco_por_pessoa
            ? Number(passeioAtual.preco || 0) * qtd
            : Number(passeioAtual.preco || 0)
        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    document.getElementById("resumo-passeio").innerText     = passeioAtual.nome;
    document.getElementById("resumo-qtd").innerText         = qtd;
    document.getElementById("resumo-total-valor").innerText = totalStr;
    document.getElementById("modal-resumo").classList.add("show");
    }

function confirmarReserva() {
    var nome = document.getElementById("res-nome").value.trim();
    var tel  = document.getElementById("res-tel").value.trim();
    if (!nome || !tel) { mostrarToast(t("campos_obrigatorios"), "error"); return; }
    var qtd   = parseInt(document.getElementById("res-qtd").value) || 1;
    var dv    = document.getElementById("res-data").value;
    var hor   = document.getElementById("res-horario").value;
    var dl    = dv ? new Date(dv + "T00:00:00").toLocaleDateString(idiomaAtual === "pt" ? "pt-BR" : idiomaAtual, { day: "2-digit", month: "long", year: "numeric" }) : "";
    var msgFn = t("wpp_msg");
    var msg   = typeof msgFn === "function"
        ? msgFn(nome, passeioAtual.nome, qtd, dl, hor)
        : 'Ola! Tenho interesse no passeio ' + passeioAtual.nome + ' para ' + qtd + ' pessoa(s).';
    mostrarToast(t("sucesso"), "success");
    fecharModalReserva();
    window.open("https://wa.me/" + whatsappAtual + "?text=" + encodeURIComponent(msg), "_blank");
}

function mostrarToast(msg, tipo) {
    var c     = document.getElementById("toasts");
    var toast = document.createElement("div");
    toast.className = 'toast ' + (tipo || "");
    toast.innerText = msg;
    c.appendChild(toast);
    setTimeout(function(){ toast.remove(); }, 3500);
}

// ==========================================
// IDIOMA
// ==========================================
async function trocarIdioma(lang) {
    idiomaAtual = lang;
    localStorage.setItem("lang", lang);
    document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.toggle("active", b.dataset.lang === lang); });
    var ls = document.getElementById("label-secao");
    var ts = document.getElementById("titulo-secao");
    var ce = document.getElementById("count-passeios");
    if (ls) ls.innerText = t("secao_label");
    if (ts) ts.innerText = t("secao_titulo");
    if (ce && listaPasseios.length) ce.innerText = listaPasseios.length + ' ' + t("secao_label").toLowerCase();
    atualizarTextosMapa();
    await Promise.all([carregarHotel(lang), carregarPasseios(lang)]);
}

// ESC / clique fora fecha modais
document.addEventListener("keydown", function(e) {
    if (e.key !== "Escape") return;
    if (document.getElementById("modalReserva").classList.contains("open")) voltarParaDetalhe();
    else if (document.getElementById("modalLugar").classList.contains("open")) fecharModalLugar();
    else fecharDetalhe();
});

["modalDetalhe", "modalReserva", "modalLugar"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function(e) {
        if (e.target !== this) return;
        if (id === "modalDetalhe")      fecharDetalhe();
        else if (id === "modalReserva") voltarParaDetalhe();
        else                            fecharModalLugar();
    });
});

// ==========================================
// MAPA
// ==========================================
var MAPA_GERAL_SRC  = "";
var LUGARES         = [];
var MAPA_LABELS     = {
    pt: { restaurante: "Restaurante", shopping: "Compras",  hotelBadge: "Do Hotel" },
    en: { restaurante: "Restaurant",  shopping: "Shopping", hotelBadge: "Hotel's Own” },
    es: { restaurante: "Restaurante", shopping: "Compras",  hotelBadge: "Del Hotel" },
    fr: { restaurante: "Restaurant",  shopping: "Shopping", hotelBadge: "De l'Hotel" }
};
var lugarFiltroAtivo   = "todos";
var lugarSelecionadoId = null;

function filtrarMapa(tipo) {
    lugarFiltroAtivo = tipo;
    document.querySelectorAll('.filtro-mapa-btn').forEach(function(b){ b.classList.toggle("active", b.dataset.tipo === tipo); });
    if (lugarSelecionadoId !== null) {
        var l = LUGARES.find(function(x){ return x.id === lugarSelecionadoId; });
        if (l && tipo !== "todos" && l.tipo !== tipo) {
            lugarSelecionadoId = null;
            carregarMapaIframe(MAPA_GERAL_SRC);
        }
    }
    renderLugarCards();
}

function selecionarLugar(id) {
    lugarSelecionadoId = id;
    var l = LUGARES.find(function(x){ return x.id === id; });
    if (l) carregarMapaIframe("https://maps.google.com/maps?q=" + l.lat + "," + l.lng + "&z=16&output=embed");
}

function carregarMapaIframe(src) {
    var iframe  = document.getElementById("mapa-iframe');
    var loading = document.getElementById("mapa-loading');
    if (!iframe) return;
    if (loading) {
        loading.classList.remove("oculto');
        var txt = document.getElementById("mapa-loading-txt');
        if (txt) txt.innerText = t("mapa_carregando');
    }
    iframe.onload = function(){ if (loading) loading.classList.add("oculto'); };
    if (iframe.src !== src) iframe.src = src;
    else if (loading) loading.classList.add("oculto');
}

async function initMapa() {
    atualizarTextosMapa();
    if (MAPA_GERAL_SRC) carregarMapaIframe(MAPA_GERAL_SRC);
    try {
        var res = await fetch('/api/public/' + hotelSlug + '/lugares/');
        if (res.ok) {
            var dados = await res.json();
            LUGARES = dados.map(function(l){
                return {
                    id: l.id, tipo: l.tipo,
                    emoji: l.tipo === "restaurante" ? "🍽" : "🛍",
                    nome:    { pt: l.nome,      en: l.nome,      es: l.nome,      fr: l.nome },
                    desc:    { pt: l.descricao, en: l.descricao, es: l.descricao, fr: l.descricao },
                    estrelas:  l.estrelas  || "",
                    instagram: l.instagram || "",
                    telefone:  l.telefone  || "",
                    dist:    { pt: l.distancia, en: l.distancia, es: l.distancia, fr: l.distancia },
                    horario: { pt: l.horario,   en: l.horario,   es: l.horario,   fr: l.horario },
                    mapaLink: l.maps_link || "", lat: l.lat, lng: l.lng
                };
            });
        }
    } catch(e) { console.warn("Lugares nao carregados:", e); }
    renderLugarCards();
    if (MAPA_GERAL_SRC && MAPA_GERAL_SRC.indexOf("http") === 0) carregarMapaIframe(MAPA_GERAL_SRC);
}

function abrirModalLugar(id) {
    var l = LUGARES.find(function(x){ return x.id === id; });
    if (!l) return;
    var nome = l.nome[idiomaAtual]    || l.nome["pt"];
    var desc = l.desc[idiomaAtual]    || l.desc["pt"];
    var dist = l.dist[idiomaAtual]    || l.dist["pt"];
    var hor  = l.horario[idiomaAtual] || l.horario["pt"];
    document.getElementById("lugar-tipo").innerText      = l.tipo === "restaurante" ? "🍽 Restaurante" : "🛍 Compras";
    document.getElementById("lugar-nome").innerText      = nome;
    document.getElementById("lugar-desc").innerText      = desc || "";
    document.getElementById("lugar-horario").innerHTML   = hor  ? "🕐 " + hor  : "";
    document.getElementById("lugar-distancia").innerHTML = dist ? "🚶 " + dist : "";
    document.getElementById("lugar-estrelas").innerText  = l.estrelas || "";
    var html = "';
    if (l.mapaLink)  html += '<a href="' + l.mapaLink + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f4f6f9;border-radius:10px;text-decoration:none;color:var(--text);font-size:13px;font-weight:500;border:1px solid #e2e8f0;">📍 Ver no Google Maps</a>';
    if (l.instagram) { var ig = l.instagram.indexOf("http") === 0 ? l.instagram : "https://instagram.com/" + l.instagram.replace('@', ""); html += "<a href=" + ig + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f4f6f9;border-radius:10px;text-decoration:none;color:var(--text);font-size:13px;font-weight:500;border:1px solid #e2e8f0;">📷 Instagram</a>'; }
    if (l.telefone)  html += "<a href="https://wa.me/' + l.telefone.replace(/\D/g, '') + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(37,211,102,0.07);border:1px solid rgba(37,211,102,0.2);border-radius:10px;text-decoration:none;color:#16a34a;font-size:13px;font-weight:500;">💬 WhatsApp</a>';
    document.getElementById("lugar-contatos').innerHTML = html;
    document.getElementById("modalLugar').classList.add("open');
    document.body.style.overflow = "hidden';
}

function fecharModalLugar() {
    document.getElementById("modalLugar").classList.remove("open");
    document.body.style.overflow = '';
}

// ==========================================
// CARROSSEL LUGARES
// ==========================================
var lugarCarrIndex    = 0;
var lugarCarrVisiveis = 3;
var lugarCarrTotal    = 0;

function lugarCarrCalcularVisiveis() {
    var vp = document.getElementById("lugares-viewport");
    if (!vp) return 3;
    var w = vp.offsetWidth;
    if (w < 480) return 1;
    return Math.max(1, Math.floor(w / (300 + 20)));
}

function lugarCarrAtualizar() {
    var track = document.getElementById('lugares-track');
    var bp    = document.getElementById('lugares-prev');
    var bn    = document.getElementById('lugares-next');
    var dots  = document.getElementById('lugares-dots');
    if (!track) return;
    track.style.transform = 'translateX(-' + (lugarCarrIndex * (300 + 20)) + 'px)';
    if (bp) bp.disabled = lugarCarrIndex === 0;
    if (bn) bn.disabled = lugarCarrIndex >= lugarCarrTotal - lugarCarrVisiveis;
    if (dots) {
        dots.innerHTML = '';
        var nd = Math.max(1, lugarCarrTotal - lugarCarrVisiveis + 1);
        for (var i = 0; i < nd; i++) {
            var d = document.createElement('button');
            d.className = 'lugares-dot' + (i === lugarCarrIndex ? ' active' : '');
            d.onclick = (function(idx){ return function(){ lugarCarrIndex = idx; lugarCarrAtualizar(); }; })(i);
            dots.appendChild(d);
        }
    }
}

function lc360Mover(dir) {
    lugarCarrIndex = Math.min(Math.max(0, lugarCarrTotal - lugarCarrVisiveis), Math.max(0, lugarCarrIndex + dir));
    lugarCarrAtualizar();
}

function lc360Ir(i) { lugarCarrIndex = i; lugarCarrAtualizar(); }

function lc360Selecionar(id) { abrirModalLugar(id); selecionarLugar(id); }

function initLugarDrag() {
    var vp = document.getElementById('lugares-viewport');
    if (!vp || vp._dragInit) return;
    vp._dragInit = true;
    var sx = 0, drag = false;
    vp.addEventListener('mousedown',  function(e){ drag = true; sx = e.clientX; vp.classList.add('dragging'); });
    vp.addEventListener('touchstart', function(e){ drag = true; sx = e.touches[0].clientX; }, { passive: true });
    var end = function(e) {
        if (!drag) return;
        drag = false;
        vp.classList.remove('dragging');
        var ex = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        if (Math.abs(sx - ex) > 50) lc360Mover(sx - ex > 0 ? 1 : -1);
    };
    vp.addEventListener('mouseup',  end);
    vp.addEventListener('touchend', end);
}

// ==========================================
// RENDER LUGAR CARDS
// ==========================================
function renderLugarCards() {
    var grid = document.getElementById('mapa-cards-grid');
    if (!grid) return;

    var lista = lugarFiltroAtivo === 'todos'
        ? LUGARES
        : LUGARES.filter(function(l){ return l.tipo === lugarFiltroAtivo; });

    var L_ = MAPA_LABELS[idiomaAtual] || MAPA_LABELS['pt'];

    if (!lista.length) {
        grid.innerHTML = '<div class="estado-vazio"><span class="icon">&#128205;</span><p>Nenhum local encontrado.</p></div>';
        return;
    }

    var cardsHTML = lista.map(function(lugar) {
        var nome = lugar.nome[idiomaAtual]    || lugar.nome['pt'];
        var desc = lugar.desc[idiomaAtual]    || lugar.desc['pt'];
        var dist = lugar.dist[idiomaAtual]    || lugar.dist['pt'];
        var hor  = lugar.horario[idiomaAtual] || lugar.horario['pt'];
        var tl   = lugar.tipo === 'restaurante' ? L_.restaurante : L_.shopping;

        var starsHTML = (lugar.estrelas || '')
            .replace(/\u2605/g, '<span class="star filled">&#9733;</span>')
            .replace(/\u2606/g, '<span class="star empty">&#9734;</span>');
    
        return (
            '<div class="lugar-card-v2" onclick="lc360Selecionar(' + lugar.id + ')" role="button" tabindex="0">' +
                '<div class="lc2-header">' +
                    '<div class="lc2-badge">' + lugar.emoji + ' ' + tl + '</div>' +
                    (lugar.mapaLink ? '<a class="lc2-maps-btn" href="' + lugar.mapaLink + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Ver no Google Maps">&#8599;</a>' : '') +
                '</div>' +
                '<div class="lc2-nome">' + nome + '</div>' +
                '<div class="lc2-desc">' + (desc || '') + '</div>' +
                '<div class="lc2-divider"></div>' +
                '<div class="lc2-footer">' +
                    '<div class="lc2-meta-col">' +
                        '<div class="lc2-stars">' + starsHTML + '</div>' +
                        (hor ? '<div class="lc2-horario">&#128336; ' + hor + '</div>' : '') +
                    '</div>' +
                    (dist ? '<div class="lc2-dist"><span class="lc2-dist-icon">&#128694;</span><span>' + dist + '</span></div>' : '') +
                '</div>' +
            '</div>'
        );
    }).join('');

    lugarCarrTotal = lista.length;
    lugarCarrIndex = 0;

    grid.innerHTML =
        '<div class="lugares-carrossel-wrapper">' +
            '<button class="lugares-nav-btn prev" id="lugares-prev" onclick="lc360Mover(-1)" disabled>&#x2039;</button>' +
            '<button class="lugares-nav-btn next" id="lugares-next" onclick="lc360Mover(1)">&#x203a;</button>' +
            '<div class="lugares-viewport" id="lugares-viewport">' +
                '<div class="lugares-track" id="lugares-track">' + cardsHTML + '</div>' +
            '</div>' +
            '<div class="lugares-dots" id="lugares-dots"></div>' +
        '</div>';
    
    lugarCarrVisiveis = lugarCarrCalcularVisiveis();
    lugarCarrAtualizar();
    initLugarDrag();
    
    window.addEventListener('resize', function(){
        lugarCarrVisiveis = lugarCarrCalcularVisiveis();
        lugarCarrAtualizar();
    });
}

function atualizarTextosMapa() {
    var ids  = { labelEl: 'label-mapa', tituloEl: 'titulo-mapa', loadEl: 'mapa-loading-txt', btnTodos: 'filtro-todos', btnRest: 'filtro-restaurante', btnShop: 'filtro-shopping' };
    var vals = { labelEl: t('mapa_label'), tituloEl: t('mapa_titulo'), loadEl: t('mapa_carregando'), btnTodos: t('mapa_todos'), btnRest: t('mapa_restaurantes'), btnShop: t('mapa_compras') };
    Object.keys(ids).forEach(function(k){ var el = document.getElementById(ids[k]); if (el) el.innerText = vals[k]; });
    if (document.getElementById("mapa-cards-grid')) renderLugarCards();
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async function() {
    document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.lang === idiomaAtual); });
    await carregarHotel(idiomaAtual);
    await Promise.all([carregarPasseios(idiomaAtual), initMapa()]);
});

// EXPORTS
window.trocarIdioma               = trocarIdioma;
window.abrirModal                 = abrirModal;
window.abrirDetalhe               = abrirDetalhe;
window.fecharDetalhe              = fecharDetalhe;
window.handleCardClick            = handleCardClick;
window.abrirModalReservaDoDetalhe = abrirModalReservaDoDetalhe;
window.voltarParaDetalhe          = voltarParaDetalhe;
window.fecharModal                = fecharModal;
window.fecharModalReserva         = fecharModalReserva;
window.confirmarReserva           = confirmarReserva;
window.calcularTotal              = calcularTotal;
window.carrosselMover             = carrosselMover;
window.coverflowIr                = coverflowIr;
window.detFotoMover               = detFotoMover;
window.detFotoIr                  = detFotoIr;
window.filtrarMapa                = filtrarMapa;
window.selecionarLugar            = selecionarLugar;
window.lc360Mover                 = lc360Mover;
window.lc360Ir                    = lc360Ir;
window.lc360Selecionar            = lc360Selecionar;
window.fecharModalLugar           = fecharModalLugar;
