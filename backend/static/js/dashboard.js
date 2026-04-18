(function () {
‘use strict’;

function init() {


var hotelSlug = window.hotelSlug;

if (!hotelSlug) {
    console.error('dashboard.js: hotelSlug nao definido');
    return;
}

var elData = document.getElementById('data-hoje');
if (elData) {
    elData.innerText = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function formatPreco(p) {
    if (p.preco_sob_consulta) return 'Sob consulta';
    var val = Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return 'R$ ' + val + (p.preco_por_pessoa ? ' / pax' : '');
}

function setEl(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.innerText = txt;
}

function statusClass(s) {
    if (s === 'confirmada') return 'status-confirmada';
    if (s === 'cancelada') return 'status-cancelada';
    return 'status-pendente';
}

function statusLabel(s) {
    if (s === 'confirmada') return 'Confirmada';
    if (s === 'cancelada') return 'Cancelada';
    return 'Pendente';
}

async function carregarDashboard() {

    var passeios = [];
    try {
        var rP = await fetch('/api/admin/' + hotelSlug + '/passeios/');
        if (!rP.ok) throw new Error('HTTP ' + rP.status);
        var rawP = await rP.json();
        passeios = Array.isArray(rawP) ? rawP : (rawP.results || rawP.passeios || []);
    } catch (e) {
        console.error('erro passeios:', e.message);
        setEl('lista-passeios', '<div class="empty-state" style="color:#f87171">Erro: ' + e.message + '</div>');
        setEl('checklist', '<div class="empty-state" style="color:#f87171">Erro: ' + e.message + '</div>');
    }

    var hotel = {};
    try {
        var rH = await fetch('/api/hotel/' + hotelSlug + '/');
        if (rH.ok) hotel = await rH.json();
    } catch (e) {
        console.warn('hotel info erro:', e.message);
    }

    var reservas = [];
    try {
        var rR = await fetch('/api/admin/' + hotelSlug + '/reservas/');
        if (!rR.ok) throw new Error('HTTP ' + rR.status);
        var rawR = await rR.json();
        reservas = Array.isArray(rawR) ? rawR : (rawR.results || []);
    } catch (e) {
        console.error('erro reservas:', e.message);
        setEl('lista-reservas-recentes', '<div class="empty-state" style="color:#f87171">Erro: ' + e.message + '</div>');
    }

    setText('total-passeios', passeios.length);
    setText('reservas-hoje', 0);
    setText('preco-medio', '--');
    setText('sub-sob-consulta', '');

    var sobConsulta = 0;
    var comPreco = [];
    for (var i = 0; i < passeios.length; i++) {
        if (passeios[i].preco_sob_consulta) sobConsulta++;
        else if (passeios[i].preco > 0) comPreco.push(passeios[i]);
    }

    if (sobConsulta) setText('sub-sob-consulta', sobConsulta + ' sob consulta');

    if (comPreco.length) {
        var soma = 0;
        for (var j = 0; j < comPreco.length; j++) soma += Number(comPreco[j].preco);
        var media = soma / comPreco.length;
        setText('preco-medio', 'R$ ' + media.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    }

    var hoje = new Date().toISOString().split('T')[0];
    var qtdHoje = 0;
    for (var k = 0; k < reservas.length; k++) {
        if ((reservas[k].data_passeio || '').startsWith(hoje) && reservas[k].status === 'confirmada') qtdHoje++;
    }
    setText('reservas-hoje', qtdHoje);

    var listaRes = document.getElementById('lista-reservas-recentes');
    if (listaRes && !listaRes.querySelector('[style*="color:#f87171"]')) {
        if (!reservas.length) {
            listaRes.innerHTML = '<div class="empty-state">Nenhuma reserva ainda.</div>';
        } else {
            var htmlRes = '';
            var slice = reservas.slice(0, 5);
            for (var r = 0; r < slice.length; r++) {
                var res = slice[r];
                var ini = (res.nome_cliente || '?').charAt(0).toUpperCase();
                var dataPass = res.data_passeio ? new Date(res.data_passeio).toLocaleDateString('pt-BR') : '--';
                htmlRes += '<div class="reserva-row">';
                htmlRes += '<div class="reserva-avatar">' + ini + '</div>';
                htmlRes += '<div class="reserva-info">';
                htmlRes += '<div class="reserva-nome">' + (res.nome_cliente || '--') + '</div>';
                htmlRes += '<div class="reserva-detalhe">' + (res.passeio_nome || 'Passeio') + ' - ' + dataPass + '</div>';
                htmlRes += '</div>';
                htmlRes += '<span class="status-pill ' + statusClass(res.status) + '">' + statusLabel(res.status) + '</span>';
                htmlRes += '</div>';
            }
            listaRes.innerHTML = htmlRes;
        }
    }

    var lista = document.getElementById('lista-passeios');
    if (lista && !lista.querySelector('[style*="color:#f87171"]')) {
        if (!passeios.length) {
            lista.innerHTML = '<div class="empty-state">Nenhum passeio ainda.<br><a href="/' + hotelSlug + '/dashboard/criar/">Criar agora</a></div>';
        } else {
            var htmlPass = '';
            var sliceP = passeios.slice(0, 5);
            for (var p = 0; p < sliceP.length; p++) {
                var pass = sliceP[p];
                var imgSrc = pass.banner || (pass.fotos && pass.fotos[0] && pass.fotos[0].url) || '';
                var thumb = imgSrc
                    ? '<div class="passeio-thumb"><img src="' + imgSrc + '" alt="' + pass.nome + '"></div>'
                    : '<div class="passeio-thumb">🏖️</div>';
                htmlPass += '<div class="passeio-row">';
                htmlPass += thumb;
                htmlPass += '<div class="passeio-row-info">';
                htmlPass += '<div class="passeio-row-nome">' + pass.nome + '</div>';
                htmlPass += '<div class="passeio-row-desc">' + (pass.descricao || '') + '</div>';
                htmlPass += '</div>';
                htmlPass += '<div class="passeio-row-preco">' + formatPreco(pass) + '</div>';
                htmlPass += '</div>';
            }
            lista.innerHTML = htmlPass;
        }
    }

    var checklist = document.getElementById('checklist');
    if (checklist && !checklist.querySelector('[style*="color:#f87171"]')) {
        var semFoto = [];
        for (var sf = 0; sf < passeios.length; sf++) {
            if (!passeios[sf].banner && (!passeios[sf].fotos || !passeios[sf].fotos.length)) semFoto.push(passeios[sf]);
        }

        var checks = [
            { label: 'Passeios cadastrados', sub: passeios.length ? passeios.length + ' passeio(s) ativo(s)' : 'Nenhum ainda', done: passeios.length > 0, link: passeios.length ? null : '/' + hotelSlug + '/dashboard/criar/', linkLabel: 'Criar' },
            { label: 'Foto de capa', sub: hotel.foto_capa ? 'Imagem definida' : 'Sem foto de capa', done: !!hotel.foto_capa, link: hotel.foto_capa ? null : '/' + hotelSlug + '/dashboard/configuracoes/', linkLabel: 'Configurar' },
            { label: 'Titulo da pagina', sub: hotel.titulo_hero ? hotel.titulo_hero.substring(0, 30) : 'Titulo padrao em uso', done: !!hotel.titulo_hero, link: hotel.titulo_hero ? null : '/' + hotelSlug + '/dashboard/configuracoes/', linkLabel: 'Definir' },
            { label: 'Passeios com foto', sub: semFoto.length ? semFoto.length + ' sem imagem' : 'Todos com imagem', done: passeios.length > 0 && semFoto.length === 0, link: semFoto.length ? '/' + hotelSlug + '/dashboard/listar/' : null, linkLabel: 'Revisar' }
        ];

        var feitos = 0;
        for (var ch = 0; ch < checks.length; ch++) { if (checks[ch].done) feitos++; }
        setText('check-progress', feitos + '/' + checks.length + ' concluidos');

        var htmlCheck = '';
        for (var ci = 0; ci < checks.length; ci++) {
            var c = checks[ci];
            htmlCheck += '<div class="check-item">';
            htmlCheck += '<div class="check-circle ' + (c.done ? 'done' : 'warn') + '">' + (c.done ? 'v' : '!') + '</div>';
            htmlCheck += '<div class="check-text">';
            htmlCheck += '<div class="check-label">' + c.label + '</div>';
            htmlCheck += '<div class="check-sub">' + c.sub + '</div>';
            htmlCheck += '</div>';
            if (c.link) htmlCheck += '<a href="' + c.link + '" class="check-action">' + c.linkLabel + '</a>';
            htmlCheck += '</div>';
        }
        checklist.innerHTML = htmlCheck;
    }
}

carregarDashboard();


}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, init);
} else {
init();
}

})();