const hotelSlug = window.hotelSlug;

// ==========================
// CARREGAR PASSEIOS
// ==========================
async function carregarPasseios() {
    try {
        const res = await fetch(`/api/${hotelSlug}/passeios/`);
        const passeios = await res.json();

        const select = document.getElementById('passeioSelect');
        select.innerHTML = '<option value="">— selecione o passeio —</option>' +
            passeios.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    } catch (e) {
        console.error('Erro ao carregar passeios:', e);
    }
}

// ==========================
// SALVAR AGENDA
// ==========================
async function salvarAgenda() {
    const passeio_id = document.getElementById('passeioSelect').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const vagas = document.getElementById('vagas').value;

    if (!passeio_id) { mostrarToast('Selecione um passeio', 'error'); return; }
    if (!vagas) { mostrarToast('Informe o número de vagas', 'error'); return; }

    const formData = new FormData();
    formData.append('passeio_id', passeio_id);
    formData.append('data', data);
    formData.append('horario', horario);
    formData.append('vagas', vagas);

    try {
        const res = await fetch(`/api/admin/${hotelSlug}/agenda/`, {
            method: 'POST',
            body: formData
        });

        const data_resp = await res.json();
        if (data_resp.erro) throw new Error(data_resp.erro);

        mostrarToast('✔ Agenda criada!');
        document.getElementById('data').value = '';
        document.getElementById('horario').value = '';
        document.getElementById('vagas').value = '';
        document.getElementById('passeioSelect').value = '';
        carregarAgenda();
    } catch (e) {
        mostrarToast(e.message || 'Erro ao salvar', 'error');
    }
}

// ==========================
// LISTAR AGENDA
// ==========================
async function carregarAgenda() {
    const container = document.getElementById('listaAgenda');

    try {
        const res = await fetch(`/api/admin/${hotelSlug}/agenda/`);
        const dados = await res.json();

        if (!dados.length) {
            container.innerHTML = '<div style="padding:32px;text-align:center;color:#475569;font-size:13px;">Nenhum agendamento cadastrado.</div>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Passeio</th>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Vagas Totais</th>
                        <th>Disponíveis</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(a => {
                        const dataFmt = a.data
                            ? new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')
                            : '—';
                        const vagas = a.vagas_disponiveis ?? a.vagas;
                        const cls = vagas === 0 ? 'vagas-zero' : vagas <= 3 ? 'vagas-low' : 'vagas-ok';

                        return `
                        <tr>
                            <td style="font-weight:500;color:#e2e8f0">${a.passeio__nome || '—'}</td>
                            <td>${dataFmt}</td>
                            <td>${a.horario || '—'}</td>
                            <td style="text-align:center">${a.vagas}</td>
                            <td style="text-align:center">
                                <span class="vagas-badge ${cls}">${vagas}</span>
                            </td>
                            <td>
                                <button class="btn-del" onclick="deletarAgenda(${a.id})">🗑️</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`;
    } catch (e) {
        container.innerHTML = '<div style="padding:32px;text-align:center;color:#f87171;font-size:13px;">Erro ao carregar agenda.</div>';
    }
}

// ==========================
// DELETAR AGENDA
// ==========================
async function deletarAgenda(id) {
    if (!confirm('Remover este agendamento?')) return;

    try {
        await fetch(`/api/admin/${hotelSlug}/agenda/?id=${id}`, { method: 'DELETE' });
        mostrarToast('Agendamento removido');
        carregarAgenda();
    } catch (e) {
        mostrarToast('Erro ao remover', 'error');
    }
}

// ==========================
// TOAST
// ==========================
function mostrarToast(msg, tipo = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    carregarPasseios();
    carregarAgenda();
});