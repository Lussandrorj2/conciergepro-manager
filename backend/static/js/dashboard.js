// ==========================
// CONFIG GLOBAL
// ==========================
const hotelSlug = window.hotelSlug;
const params = new URLSearchParams(window.location.search);
const passeioId = params.get('id');

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-salvar-passeio');
    if (btn) btn.addEventListener('click', validarCriacao);

    if (passeioId) {
        const titulo = document.getElementById('titulo-pagina');
        if (titulo) titulo.innerText = 'Editar Passeio';
        carregarPasseio(passeioId);
    }

    configurarPreview();
    configurarSwitches();
});

// ==========================
// CARREGAR PASSEIO (EDIT)
// ==========================
async function carregarPasseio(id) {
    try {
        const res = await fetch(`/api/admin/${hotelSlug}/passeios/${id}/`);
        const p = await res.json();

        document.getElementById('nome').value = p.nome || '';
        document.getElementById('descricao').value = p.descricao || '';
        document.getElementById('preco').value = p.preco || '';
        document.getElementById('preco_sob_consulta').checked = p.preco_sob_consulta;
        document.getElementById('preco_por_pessoa').checked = p.preco_por_pessoa;

        if (p.preco_sob_consulta) {
            document.getElementById('preco').disabled = true;
        }

        // Galeria existente
        if (p.fotos && p.fotos.length > 0) {
            const box = document.getElementById('galeria-existente');
            const container = document.getElementById('galeria-atual');
            if (box) box.style.display = 'block';
            if (container) {
                container.innerHTML = p.fotos.map(f => `
                    <div class="foto-item" id="foto-${f.id}">
                        <img src="${f.url}" alt="foto">
                        <button class="foto-del" onclick="deletarFoto(${f.id})" title="Remover">✕</button>
                    </div>
                `).join('');
            }
        }

    } catch (err) {
        console.error(err);
        mostrarToast('Erro ao carregar passeio', 'error');
    }
}

// ==========================
// DELETAR FOTO
// ==========================
async function deletarFoto(id) {
    if (!confirm('Remover esta foto?')) return;

    try {
        await fetch(`/api/admin/imagem/${id}/`, { method: 'DELETE' });
        const el = document.getElementById(`foto-${id}`);
        if (el) el.remove();
        mostrarToast('Foto removida');
    } catch (e) {
        mostrarToast('Erro ao remover foto', 'error');
    }
}

// ==========================
// SALVAR (CREATE / UPDATE)
// ==========================
async function validarCriacao() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome) { mostrarToast('Digite o nome do passeio', 'error'); return; }

    const sobConsulta = document.getElementById('preco_sob_consulta').checked;
    const form = new FormData();

    form.append('nome', nome);
    form.append('descricao', document.getElementById('descricao').value);
    form.append('preco', sobConsulta ? '' : (document.getElementById('preco').value || 0));
    form.append('preco_sob_consulta', sobConsulta ? 'true' : 'false');
    form.append('preco_por_pessoa', document.getElementById('preco_por_pessoa').checked ? 'true' : 'false');

    const fotos = document.getElementById('fotos').files;
    for (let f of fotos) form.append('imagens', f);

    const url = passeioId
        ? `/api/admin/${hotelSlug}/passeios/${passeioId}/`
        : `/api/admin/${hotelSlug}/passeios/`;

    const btn = document.getElementById('btn-salvar-passeio');
    btn.disabled = true;
    btn.innerText = 'Salvando...';

    try {
        const res = await fetch(url, { method: 'POST', body: form });
        const data = await res.json();

        if (data.erro) throw new Error(data.erro);

        mostrarToast('Passeio salvo com sucesso! 🚀');
        setTimeout(() => {
            window.location.href = `/${hotelSlug}/dashboard/listar/`;
        }, 1200);

    } catch (err) {
        mostrarToast(err.message || 'Erro ao salvar', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Salvar Passeio';
    }
}

// ==========================
// PREVIEW DE IMAGENS
// ==========================
function configurarPreview() {
    const input = document.getElementById('fotos');
    const preview = document.getElementById('previewGaleria');
    if (!input || !preview) return;

    input.addEventListener('change', () => {
        preview.innerHTML = '';
        for (let file of input.files) {
            const reader = new FileReader();
            reader.onload = e => {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// ==========================
// REGRAS DE PREÇO
// ==========================
function configurarSwitches() {
    const sobConsulta = document.getElementById('preco_sob_consulta');
    const precoInput = document.getElementById('preco');
    if (!sobConsulta || !precoInput) return;

    sobConsulta.addEventListener('change', () => {
        precoInput.disabled = sobConsulta.checked;
        if (sobConsulta.checked) precoInput.value = '';
    });
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