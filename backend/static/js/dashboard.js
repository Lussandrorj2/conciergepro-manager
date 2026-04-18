// dashboard.js

(function () {
‘use strict’;

```
function init() {

    const hotelSlug = window.hotelSlug;

    if (!hotelSlug) {
        console.error('[dashboard.js] hotelSlug nao definido.');
        return;
    }

    const elData = document.getElementById('data-hoje');
    if (elData) elData.innerText =
        new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

    function formatPreco(p) {
        if (p.preco_sob_consulta) return 'Sob consulta';
        const val = Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        return 'R$ ' + val + (p.preco_por_pessoa ? ' / pax' : '');
    }

    function setEl(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function setText(id, txt) {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    }

    async function carregarDashboard() {

        // 1. Passeios
        let passeios = [];
        try {
            const r = await fetch('/api/admin/' + hotelSlug + '/passeios/');
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const raw = await r.json();
            passeios = Array.isArray(raw) ? raw : (raw.results || raw.passeios || []);
        } catch (e) {
            console.error('[passeios]', e);
            setEl('lista-passeios', '<div class="empty-state" style="color:#f87171">Erro ao carregar passeios: ' + e.message + '</div>');
            setEl('checklist',      '<div class="empty-state" style="color:#f87171">' + e.message + '</div>');
        }

        // 2. Hotel info
        let hotel = {};
        try {
            const r = await fetch('/api/hotel/' + hotelSlug + '/');
            if (r.ok) hotel = await r.json();
        } catch (e) {
            console.warn('[hotel info]', e.message);
        }

        // 3. Reservas
        let reservas = [];
        try {
            const r = await fetch('/api/admin/' + hotelSlug + '/reservas/');
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const raw = await r.json();
            reservas = Array.isArray(raw) ? raw : (raw.results || []);
        } catch (e) {
            console.error('[reservas]', e);
            setEl('lista-reservas-recentes', '<div class="empty-state" style="color:#f87171">Erro ao carregar reservas: ' + e.message + '</div>');
        }

        // Stats
        setText('total-passeios', passeios.length);

        const sobConsulta = passeios.filter(function(p) { return p.preco_sob_consulta; }).length;
        setText('sub-sob-consulta', sobConsulta ? sobConsulta + ' sob consulta' : '');

        const comPreco = passeios.filter(function(p) { return !p.preco_sob_consulta && p.preco > 0; });
        if (comPreco.length) {
            const media = comPreco.reduce(function(s, p) { return s + Number(p.preco); }, 0) / comPreco.length;
            setText('preco-medio', 'R$ ' + media.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        } else {
            setText('preco-medio', '--');
        }

        const hoje = new Date().toISOString().split('T')[0];
        const reservasHoje = reservas.filter(function(r) {
            return (r.data_passeio || '').startsWith(hoje) && r.status === 'confirmada';
        }).length;
        setText('reservas-hoje', reservasHoje);

        // Reservas recentes
        const listaRes = document.getElementById('lista-reservas-recentes');
        if (listaRes && !listaRes.querySelector('[style*="color:#f87171"]')) {
            if (!reservas.length) {
                listaRes.innerHTML = '<div class="empty-state">Nenhuma reserva ainda.</div>';
            } else {
                function statusClass(s) {
                    if (s === 'confirmada') return 'status-confirmada';
                    if (s === 'cancelada')  return 'status-cancelada';
                    return 'status-pendente';
                }
                function statusLabel(s) {
                    if (s === 'confirmada') return 'Confirmada';
                    if (s === 'cancelada')  return 'Cancelada';
                    return 'Pendente';
                }

                listaRes.innerHTML = reservas.slice(0, 5).map(function(r) {
                    const ini      = (r.nome_cliente || '?').charAt(0).toUpperCase();
                    const dataPass = r.data_passeio
                        ? new Date(r.data_passeio).toLocaleDateString('pt-BR')
                        : '--';
                    return '<div class="reserva-row">' +
                        '<div class="reserva-avatar">' + ini + '</div>' +
                        '<div class="reserva-info">' +
                            '<div class="reserva-nome">' + (r.nome_cliente || '--') + '</div>' +
                            '<div class="reserva-detalhe">' + (r.passeio_nome || r.passeio || 'Passeio') + ' - ' + dataPass + '</div>' +
                        '</div>' +
                        '<span class="status-pill ' + statusClass(r.status) + '">' + statusLabel(r.status) + '</span>' +
                    '</div>';
                }).join('');
            }
        }

        // Lista passeios
        const lista = document.getElementById('lista-passeios');
        if (lista && !lista.querySelector('[style*="color:#f87171"]')) {
            if (!passeios.length) {
                lista.innerHTML = '<div class="empty-state">Nenhum passeio criado ainda.<br><a href="/' + hotelSlug + '/dashboard/criar/">Criar agora</a></div>';
            } else {
                lista.innerHTML = passeios.slice(0, 5).map(function(p) {
                    const imgSrc = p.banner || (p.fotos && p.fotos[0] && p.fotos[0].url);
                    const thumb  = imgSrc
                        ? '<div class="passeio-thumb"><img src="' + imgSrc + '" alt="' + p.nome + '"></div>'
                        : '<div class="passeio-thumb">🏖️</div>';
                    return '<div class="passeio-row">' +
                        thumb +
                        '<div class="passeio-row-info">' +
                            '<div class="passeio-row-nome">' + p.nome + '</div>' +
                            '<div class="passeio-row-desc">' + (p.descricao || '') + '</div>' +
                        '</div>' +
                        '<div class="passeio-row-preco">' + formatPreco(p) + '</div>' +
                    '</div>';
                }).join('');
            }
        }

        // Checklist
        const checklist = document.getElementById('checklist');
        if (checklist && !checklist.querySelector('[style*="color:#f87171"]')) {
            const semFoto = passeios.filter(function(p) {
                return !p.banner && (!p.fotos || !p.fotos.length);
            });

            const checks = [
                {
                    label: 'Passeios cadastrados',
                    sub:   passeios.length ? passeios.length + ' passeio(s) ativo(s)' : 'Nenhum passeio ainda',
                    done:  passeios.length > 0,
                    link:  passeios.length ? null : '/' + hotelSlug + '/dashboard/criar/',
                    linkLabel: 'Criar'
                },
                {
                    label: 'Foto de capa do hotel',
                    sub:   hotel.foto_capa ? 'Imagem definida' : 'Sem foto de capa',
                    done:  !!hotel.foto_capa,
                    link:  hotel.foto_capa ? null : '/' + hotelSlug + '/dashboard/configuracoes/',
                    linkLabel: 'Configurar'
                },
                {
                    label: 'Titulo da pagina inicial',
                    sub:   hotel.titulo_hero ? '"' + hotel.titulo_hero.substring(0, 28) + '..."' : 'Titulo padrao em uso',
                    done:  !!hotel.titulo_hero,
                    link:  hotel.titulo_hero ? null : '/' + hotelSlug + '/dashboard/configuracoes/',
                    linkLabel: 'Definir'
                },
                {
                    label: 'Passeios com foto',
                    sub:   semFoto.length ? semFoto.length + ' passeio(s) sem imagem' : 'Todos com imagem',
                    done:  passeios.length > 0 && semFoto.length === 0,
                    link:  semFoto.length ? '/' + hotelSlug + '/dashboard/listar/' : null,
                    linkLabel: 'Revisar'
                }
            ];

            const feitos = checks.filter(function(c) { return c.done; }).length;
            setText('check-progress', feitos + '/' + checks.length + ' concluidos');

            checklist.innerHTML = checks.map(function(c) {
                return '<div class="check-item">' +
                    '<div class="check-circle ' + (c.done ? 'done' : 'warn') + '">' + (c.done ? 'v' : '!') + '</div>' +
                    '<div class="check-text">' +
                        '<div class="check-label">' + c.label + '</div>' +
                        '<div class="check-sub">' + c.sub + '</div>' +
                    '</div>' +
                    (c.link ? '<a href="' + c.link + '" class="check-action">' + c.linkLabel + '</a>' : '') +
                '</div>';
            }).join('');
        }
    }

    carregarDashboard();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
```

})();