// ==========================
// CONFIG GLOBAL
// ==========================
const hotelSlug = window.hotelSlug;
const params    = new URLSearchParams(window.location.search);
const passeioId = params.get('id');

// ==========================
// CSRF HELPER
// ✅ FIX: busca o token do cookie com fallback robusto.
// Como as views de passeio usam @csrf_exempt, o token não é
// obrigatório ali — mas mantemos para consistência com outras views.
// ==========================
function getCsrfToken() {
    // Tenta cookie primeiro
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);

    // Fallback: meta tag
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');

    return '';
}

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
        const res = await fetch(`/api/admin/${hotelSlug}/passeios/${id}/`, {
            credentials: 'same-origin',
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const p = await res.json();

        document.getElementById('nome').value      = p.nome      || '';
        document.getElementById('descricao').value = p.descricao || '';
        document.getElementById('preco').value     = p.preco     || '';
        document.getElementById('preco_sob_consulta').checked = !!p.preco_sob_consulta;
        document.getElementById('preco_por_pessoa').checked   = !!p.preco_por_pessoa;

        if (p.preco_sob_consulta) {
            document.getElementById('preco').disabled = true;
        }

        // Galeria existente
        if (p.fotos && p.fotos.length > 0) {
            const box       = document.getElementById('galeria-existente');
            const container = document.getElementById('galeria-atual');
            if (box) box.style.display = 'block';
            if (container) {
                container.innerHTML = p.fotos.map(f => `
                    <div class="foto-item" id="foto-${f.id}">
                        <img src="${f.url}" alt="foto" onerror="this.style.display='none'">
                        <button class="foto-del" onclick="deletarFoto(${f.id})" title="Remover">✕</button>
                    </div>
                `).join('');
            }
        }

    } catch (err) {
        console.error('[carregarPasseio]', err);
        mostrarToast('Erro ao carregar passeio: ' + err.message, 'error');
    }
}

// ==========================
// DELETAR FOTO
// ==========================
async function deletarFoto(id) {
    if (!confirm('Remover esta foto?')) return;

    try {
        const res = await fetch(`/api/admin/imagem/${id}/`, {
            method:      'DELETE',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': getCsrfToken(),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const el = document.getElementById(`foto-${id}`);
        if (el) el.remove();
        mostrarToast('Foto removida');
    } catch (e) {
        console.error('[deletarFoto]', e);
        mostrarToast('Erro ao remover foto: ' + e.message, 'error');
    }
}

// ==========================
// SALVAR (CREATE / UPDATE)
// ✅ FIX: não define Content-Type (o browser define com o boundary do FormData).
// A view usa @csrf_exempt, então o token é opcional, mas enviamos mesmo assim.
// Logs de erro melhorados para facilitar debug.
// ==========================
async function validarCriacao() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome) {
        mostrarToast('Digite o nome do passeio', 'error');
        return;
    }

    const sobConsulta = document.getElementById('preco_sob_consulta').checked;
    const form        = new FormData();

    form.append('nome',               nome);
    form.append('descricao',          document.getElementById('descricao').value);
    form.append('preco',              sobConsulta ? '' : (document.getElementById('preco').value || '0'));
    form.append('preco_sob_consulta', sobConsulta ? 'true' : 'false');
    form.append('preco_por_pessoa',   document.getElementById('preco_por_pessoa').checked ? 'true' : 'false');

    // ✅ Inclui o banner se houver campo dedicado (opcional)
    const bannerInput = document.getElementById('banner');
    if (bannerInput && bannerInput.files[0]) {
        form.append('banner', bannerInput.files[0]);
    }

    // Fotos da galeria
    const fotosInput = document.getElementById('fotos');
    if (fotosInput) {
        for (const f of fotosInput.files) {
            form.append('imagens', f);
        }
    }

    const url = passeioId
        ? `/api/admin/${hotelSlug}/passeios/${passeioId}/`
        : `/api/admin/${hotelSlug}/passeios/`;

    const btn = document.getElementById('btn-salvar-passeio');
    if (btn) { btn.disabled = true; btn.innerText = 'Salvando...'; }

    try {
        const res = await fetch(url, {
            method:      'POST',
            credentials: 'same-origin',
            // ✅ NÃO define Content-Type: o browser coloca o boundary correto do FormData
            headers: {
                'X-CSRFToken': getCsrfToken(),
            },
            body: form,
        });

        // Lê a resposta como texto primeiro para logar em caso de erro HTML
        const text = await res.text();

        if (!res.ok) {
            console.error('[validarCriacao] Resposta do servidor:', text);
            throw new Error(`HTTP ${res.status} — veja o console para detalhes`);
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error('[validarCriacao] Resposta não é JSON:', text);
            throw new Error('Resposta inesperada do servidor');
        }

        if (data.erro) throw new Error(data.erro);

        mostrarToast('Passeio salvo com sucesso! 🚀');
        setTimeout(() => {
            window.location.href = `/${hotelSlug}/dashboard/listar/`;
        }, 1200);

    } catch (err) {
        console.error('[validarCriacao]', err);
        mostrarToast(err.message || 'Erro ao salvar', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = '🚀 Salvar Passeio'; }
    }
}

// ==========================
// PREVIEW DE IMAGENS
// ==========================
function configurarPreview() {
    const input   = document.getElementById('fotos');
    const preview = document.getElementById('previewGaleria');
    if (!input || !preview) return;

    input.addEventListener('change', () => {
        preview.innerHTML = '';
        for (const file of input.files) {
            const reader  = new FileReader();
            reader.onload = e => {
                const img = document.createElement('img');
                img.src   = e.target.result;
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
    const precoInput  = document.getElementById('preco');
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

    const t       = document.createElement('div');
    t.className   = `toast ${tipo}`;
    t.innerText   = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}