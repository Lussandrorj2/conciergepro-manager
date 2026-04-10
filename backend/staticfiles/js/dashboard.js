// ==========================
// 🔧 CONFIGURAÇÃO E UTILITÁRIOS
// ==========================
const hotelSlug = window.hotelSlug;
const API_BASE = `/api/admin/${hotelSlug}/passeios/`; // Rota administrativa correta

const getCSRFToken = () => {
    return window.csrfToken || 
           document.cookie.split("; ")
               .find(r => r.startsWith("csrftoken"))
               ?.split("=")[1];
};

// Array global para gerenciar as novas fotos com autonomia (adicionar/remover antes de salvar)
let arquivosParaSubir = [];

// ==========================
// 📦 CARREGAR E EXIBIR PASSEIOS
// ==========================
async function carregarPasseios() {
    const container = document.getElementById("lista");
    if (!container) return;

    try {
        container.innerHTML = '<div class="loader">Carregando seus passeios...</div>';
        // Buscamos da API pública para listar, mas usamos a admin para gerenciar
        const res = await fetch(`/api/${hotelSlug}/passeios/`);
        const passeios = await res.json();

        if (!passeios || passeios.length === 0) {
            container.innerHTML = "<p>Nenhum passeio cadastrado.</p>";
            return;
        }

        container.innerHTML = passeios.map(p => `
            <div class="card-passeio" id="passeio-${p.id}">
                <div class="card-img">
                    ${p.fotos && p.fotos.length > 0
                        ? `<img src="${p.fotos[0].url}" class="img-passeio">`
                        : `<img src="/static/images/placeholder.jpg" class="img-passeio">`
                    }
                </div>
                <div class="card-content">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao ? p.descricao.substring(0, 60) + '...' : 'Sem descrição.'}</p>
                    <strong>R$ ${p.preco || '---'}</strong>
                </div>
                <div class="card-footer">
                    <button onclick='prepararEdicao(${JSON.stringify(p)})' class="btn-edit">Editar</button>
                    <button onclick="deletarPasseio(${p.id})" class="btn-delete">Excluir</button>
                </div>
            </div>
        `).join("");

    } catch (e) {
        container.innerHTML = "<p>Erro ao conectar com o servidor.</p>";
    }
}

// ==========================
// 📸 GESTÃO DINÂMICA DE IMAGENS
// ==========================
function previewImagens() {
    const input = document.getElementById('imagem');
    const preview = document.getElementById('preview-imagens');
    
    Array.from(input.files).forEach(file => {
        // Evita duplicados por nome de arquivo
        if (!arquivosParaSubir.some(f => f.name === file.name)) {
            arquivosParaSubir.push(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'img-container';
                div.innerHTML = `
                    <img src="${e.target.result}">
                    <button type="button" class="btn-delete-img" onclick="removerDaLista(this, '${file.name}')">×</button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });
    input.value = ""; // Reseta o input para permitir selecionar o mesmo arquivo após deletar
}

function removerDaLista(botao, nomeArquivo) {
    arquivosParaSubir = arquivosParaSubir.filter(f => f.name !== nomeArquivo);
    botao.parentElement.remove();
}

// ==========================
// 🚀 SALVAR OU ATUALIZAR PASSEIO
// ==========================
async function validarCriacao() {
    const p_id = document.getElementById("passeio_id").value;
    const nome = document.getElementById("nome").value;
    const preco = document.getElementById("preco").value;
    const descricao = document.getElementById("descricao").value;
    const btn = document.getElementById("btn-salvar");

    if (!nome) return alert("O nome é obrigatório!");

    const formData = new FormData();
    if (p_id) formData.append("passeio_id", p_id);
    formData.append("nome", nome);
    formData.append("preco", preco);
    formData.append("descricao", descricao);

    // ✅ Envia corretamente múltiplas imagens
    arquivosParaSubir.forEach((file) => {
        formData.append("imagens", file);
    });

    try {
        btn.disabled = true;
        btn.innerText = "Enviando...";

        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "X-CSRFToken": getCSRFToken() },
            body: formData
        });

        if (res.ok) {
            alert("Passeio salvo com sucesso!");
            location.reload();
        } else {
            const erro = await res.json();
            alert("Erro: " + (erro.mensagem || "Verifique os dados."));
        }
    } catch (err) {
        alert("Erro de conexão com o servidor.");
    } finally {
        btn.disabled = false;
        btn.innerText = "🚀 Publicar Passeio";
    }
}

// ==========================
// ✏️ PREPARAR EDIÇÃO
// ==========================
function prepararEdicao(p) {
    document.getElementById("passeio_id").value = p.id;
    document.getElementById("nome").value = p.nome;
    document.getElementById("descricao").value = p.descricao || "";
    document.getElementById("preco").value = p.preco || "";

    // Limpa fotos anteriores do preview
    document.getElementById('preview-imagens').innerHTML = "";
    arquivosParaSubir = [];

    const btn = document.getElementById("btn-salvar");
    if (btn) btn.innerText = "💾 Salvar Alterações";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================
// ❌ EXCLUSÃO
// ==========================
async function deletarPasseio(id) {
    if (!confirm("Deseja realmente excluir este passeio?")) return;

    try {
        const res = await fetch(`${API_BASE}${id}/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": getCSRFToken() }
        });

        if (res.ok) location.reload();
    } catch (err) {
        alert("Erro ao excluir.");
    }
}

// ==========================
// ⚙️ ATUALIZAR BANNER DO HOTEL
// ==========================
async function salvarBanner() {
    const inputFoto = document.getElementById('foto_capa');
    if (!inputFoto || !inputFoto.files[0]) return alert("Selecione uma imagem!");

    const formData = new FormData();
    formData.append('foto_capa', inputFoto.files[0]);

    try {
        const res = await fetch(`/api/hotel/${hotelSlug}/atualizar/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFToken() },
            body: formData
        });

        if (res.ok) {
            alert("Banner atualizado!");
            location.reload();
        }
    } catch (error) {
        alert("Erro ao atualizar banner.");
    }
}

// ==========================
// 🏨 SALVAR HERO (TÍTULO + SUBTÍTULO + BANNER)
// ==========================
async function salvarHero() {
    const titulo = document.getElementById("titulo_hero_pt").value;
    const subtitulo = document.getElementById("subtitulo_hero_pt").value;
    const fotoInput = document.getElementById("foto_capa");

    if (!titulo) {
        alert("O título é obrigatório!");
        return;
    }

    const formData = new FormData();
    formData.append("titulo_hero", titulo);
    formData.append("subtitulo_hero", subtitulo);

    if (fotoInput && fotoInput.files[0]) {
        formData.append("foto_capa", fotoInput.files[0]);
    }

    try {
        const res = await fetch(`/api/hotel/${hotelSlug}/atualizar/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken()
            },
            body: formData
        });

        if (res.ok) {
            alert("Hero atualizado e traduzido com sucesso!");
            location.reload();
        } else {
            alert("Erro ao salvar hero.");
        }

    } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", carregarPasseios);