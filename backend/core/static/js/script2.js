// ==========================
// 🔧 CONFIGURAÇÃO (BACKEND/DASHBOARD)
// ==========================

// Captura o slug que passamos via <script> no dashboard.html
const hotelSlug = window.hotelSlug;

// No Dashboard, usamos a origem atual do navegador
const API = `${window.location.origin}/api/${hotelSlug}/passeios/`;

const getCSRFToken = () =>
    document.cookie.split("; ")
        .find(r => r.startsWith("csrftoken"))
        ?.split("=")[1];

// ==========================
// 📦 CARREGAR PASSEIOS
// ==========================
async function carregarPasseios() {
    const container = document.getElementById("lista");
    if (!container) return;

    try {
        container.innerHTML = "<p>Carregando seus passeios...</p>";
        const res = await fetch(API);
        const passeios = await res.json();

        if (passeios.length === 0) {
            container.innerHTML = "<p>Nenhum passeio cadastrado.</p>";
            return;
        }

        container.innerHTML = passeios.map(p => `
            <div class="card-passeio" id="passeio-${p.id}">
                <div class="carousel-wrapper">
                    <div class="card-img">
                        ${p.fotos && p.fotos.length > 0
                ? p.fotos.map(foto => `<img src="${foto.url}" class="img-passeio">`).join("")
                : `<img src="/static/img/placeholder.jpg" class="img-passeio">`
            }
                    </div>
                </div>

                <div class="card-content">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao || 'Sem descrição.'}</p>
                </div>

                <div class="card-footer">
                    <strong>R$ ${p.preco ? p.preco : '---'}</strong>
                    <div class="actions">
                        <button onclick='prepararEdicao(${JSON.stringify(p)})' class="btn-edit">
                            Editar
                        </button>
                        <button onclick="deletarPasseio(${p.id})" class="btn-delete">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (e) {
        container.innerHTML = "<p>Erro ao conectar com o servidor Django.</p>";
    }
}

// ==========================
// 💾 SALVAR OU ATUALIZAR
// ==========================
async function salvarPasseio() {
    const p_id = document.getElementById("passeio_id").value; // Pega o ID se estiver editando
    const nome = document.getElementById("nome").value;
    const descricao = document.getElementById("descricao").value;
    const preco = document.getElementById("preco").value;

    if (!nome) return alert("O nome é obrigatório!");

    const formData = new FormData();
    if (p_id) formData.append("id", p_id); // Envia o ID para o Django saber que é UPDATE

    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("preco", preco);

    // Upload de múltiplas imagens conforme o novo modelo
    const inputImagem = document.getElementById("imagem");
    if (inputImagem.files.length > 0) {
        for (let i = 0; i < inputImagem.files.length; i++) {
            formData.append("imagens", inputImagem.files[i]);
        }
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "X-CSRFToken": getCSRFToken() },
            body: formData
        });

        if (res.ok) {
            alert("Sucesso!");
            location.reload();
        } else {
            alert("Erro ao salvar. Verifique se o Django retornou algum erro.");
        }
    } catch (err) {
        alert("Erro de conexão.");
    }
}

// ==========================
// ❌ DELETAR
// ==========================
async function deletarPasseio(id) {
    if (!confirm("Tem certeza que deseja excluir este passeio?")) return;

    try {
        const res = await fetch(`${API}${id}/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": getCSRFToken() }
        });

        if (res.ok) {
            location.reload();
        }
    } catch (err) {
        alert("Erro ao excluir.");
    }
}

// Garanta que esta função não esteja dentro de um window.onload ou outra função
async function salvarBanner() {
    const inputFoto = document.getElementById('foto_capa');
    if (!inputFoto.files[0]) {
        alert("Por favor, selecione uma imagem primeiro.");
        return;
    }

    const formData = new FormData();
    formData.append('foto_capa', inputFoto.files[0]);

    // Usamos o window.hotelSlug que definimos no dashboard.html
    const url = `/api/hotel/${window.hotelSlug}/atualizar/`; // Adicione a barra final!

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            // O Django precisa do CSRF Token para POSTs
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });

        const data = await response.json();
        if (data.status === 'ok') {
            alert("Banner atualizado!");
            location.reload();
        } else {
            alert("Erro ao salvar: " + (data.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
    }
}

// ==========================
// ✏️ PREPARAR EDIÇÃO
// ==========================
function prepararEdicao(p) {
    // Preenche os campos do formulário com os dados do objeto p
    document.getElementById("passeio_id").value = p.id;
    document.getElementById("nome").value = p.nome;
    document.getElementById("descricao").value = p.descricao;
    document.getElementById("preco").value = p.preco || "";

    // Altera o botão para o usuário saber que está editando
    const btn = document.querySelector(".btn-publicar");
    if (btn) btn.innerText = "Salvar Alterações";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================
// 🚀 INICIALIZAÇÃO
// ==========================
document.addEventListener("DOMContentLoaded", carregarPasseios);
window.validarCriacao = salvarPasseio;