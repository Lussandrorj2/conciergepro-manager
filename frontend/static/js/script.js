// ==========================================
// 🏨 CONCIERGE - CONFIGURAÇÃO GLOBAL
// ==========================================

const params = new URLSearchParams(window.location.search);
// O slug deve ser idêntico ao cadastrado no Admin do Django
const hotelSlug = (params.get('hotel') || '').trim(); 
const API_BASE = "http://127.0.0.1:8000/api"; 

const traducoes = {
    pt: { btnReservar: "Reservar", lblPreco: "A partir de", erro: "Erro ao carregar.", vazio: "Nenhum passeio encontrado." },
    en: { btnReservar: "Book Now", lblPreco: "Starting at", erro: "Loading error.", vazio: "No tours found." },
    es: { btnReservar: "Reservar", lblPreco: "Desde", erro: "Error de carga.", vazio: "No se encontraron tours." },
    fr: { btnReservar: "Réserver", lblPreco: "À partir de", erro: "Erreur de chargement.", vazio: "Aucune visite trouvée." }
};

let idiomaAtual = 'pt';

// ==========================================
// 🖼️ CARREGAR DADOS DO HOTEL (BANNER E TÍTULO)
// ==========================================
async function carregarDadosHotel() {
    if (!hotelSlug) {
        console.warn("Slug do hotel não fornecido na URL.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/hotel/${hotelSlug}/`);
        
        // Se retornar 404, o slug na URL está diferente do slug no Admin
        if (!response.ok) throw new Error("Hotel não encontrado");

        const data = await response.json();
        
        if (data.nome) document.title = `Concierge | ${data.nome}`;

        // Aplica o banner vindo do banco de dados
        if (data.foto_capa) {
            const heroElement = document.getElementById('hero');
            if (heroElement) {
                // Define a variável CSS --hero-image com a URL absoluta da API
                heroElement.style.setProperty('--hero-image', `url('${data.foto_capa}')`);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar dados do hotel:", error);
        const erroCard = document.querySelector(".hero-content");
        if (erroCard) erroCard.innerHTML = "<h1>Hotel não encontrado</h1><p>Verifique o slug na URL.</p>";
    }
}

// ==========================================
// 📦 BUSCAR E RENDERIZAR PASSEIOS
// ==========================================
async function carregarConteudo() {
    const container = document.getElementById("passeios");
    if (!container) return;

    if (!hotelSlug) {
        container.innerHTML = "<p style='color:black; text-align:center;'>Identifique o hotel na URL.<br>Ex: ?hotel=arpoador</p>";
        return;
    }

    try {
        // Busca a lista de passeios vinculados ao hotel
        const response = await fetch(`${API_BASE}/${hotelSlug}/passeios/`);
        if (!response.ok) throw new Error("Erro ao buscar passeios");

        const passeios = await response.json();

        if (!passeios || passeios.length === 0) {
            container.innerHTML = `<p style='color:black; text-align:center;'>${traducoes[idiomaAtual].vazio}</p>`;
            return;
        }

        container.innerHTML = passeios.map(p => {
            const nomeTraduzido = p[`nome_${idiomaAtual}`] || p.nome;
            const descTraduzida = p[`descricao_${idiomaAtual}`] || p.descricao;
            // Garante que a primeira foto exista ou usa um placeholder
            const fotoPrincipal = (p.fotos && p.fotos.length > 0) ? p.fotos[0].url : '../static/img/placeholder.jpg';

            return `
                <div class="card">
                    <div class="carousel">
                        <div class="card-img" id="img-container-${p.id}">
                            <img src="${fotoPrincipal}" class="slide active" style="width: 100%; height: 200px; object-fit: cover;">
                        </div>
                    </div>
                    <div class="card-content" style="padding: 15px;">
                        <h3>${nomeTraduzido}</h3>
                        <p class="info">${descTraduzida}</p>
                        <div class="card-info">
                            <div class="price">
                                <small>${traducoes[idiomaAtual].lblPreco}</small><br>
                                <strong>R$ ${p.preco || '---'}</strong>
                            </div>
                            <button class="btn-whatsapp" onclick="reservar('${nomeTraduzido}')">
                                ${traducoes[idiomaAtual].btnReservar}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Erro na lista de passeios:", error);
        container.innerHTML = `<p style='color:black;'>${traducoes[idiomaAtual].erro}</p>`;
    }
}

// ==========================================
// 🛠️ FUNÇÕES DE INTERAÇÃO
// ==========================================

function trocarIdioma(sigla) {
    if (traducoes[sigla]) {
        idiomaAtual = sigla;
        carregarConteudo(); // Recarrega os passeios com a tradução correta
    }
}

function reservar(nomePasseio) {
    const msg = encodeURIComponent(`Olá! Gostaria de informações sobre o passeio: ${nomePasseio}`);
    // Substitua pelo número real ou torne dinâmico via API futuramente
    window.open(`https://wa.me/5521999999999?text=${msg}`, '_blank');
}

// ==========================================
// 🚀 INICIALIZAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosHotel();
    carregarConteudo();
});

// Expondo a função para o HTML (onClick)
window.trocarIdioma = trocarIdioma;