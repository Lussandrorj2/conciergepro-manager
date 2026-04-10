// ==========================================
// 🏨 CONCIERGE - CONFIGURAÇÃO GLOBAL
// ==========================================

// Prioriza o slug vindo do Django (window.hotelSlug) ou tenta pegar da URL
const hotelSlug = window.hotelSlug || new URLSearchParams(window.location.search).get('hotel') || '';
const API_BASE = "/api"; // Caminho relativo para funcionar em produção e local

const traducoesFixas = {
    pt: { btnReservar: "Reservar", lblPreco: "A partir de", erro: "Erro ao carregar.", vazio: "Nenhum passeio encontrado." },
    en: { btnReservar: "Book Now", lblPreco: "Starting at", erro: "Loading error.", vazio: "No tours found." },
    es: { btnReservar: "Reservar", lblPreco: "Desde", erro: "Error de carga.", vazio: "No se encontraron tours." },
    fr: { btnReservar: "Réserver", lblPreco: "À partir de", erro: "Erreur de chargement.", vazio: "Aucune visite trouvée." }
};

let idiomaAtual = 'pt';

// ==========================================
// 🖼️ CARREGAR DADOS DO HOTEL (BANNER E TÍTULO)
// ==========================================
async function carregarDadosHotel(lang = 'pt') {
    if (!hotelSlug) {
        console.warn("Slug do hotel não identificado.");
        return;
    }

    try {
        // Busca os dados do hotel filtrados pelo idioma para pegar os títulos dinâmicos
        const response = await fetch(`${API_BASE}/hotel/${hotelSlug}/?lang=${lang}`);
        if (!response.ok) throw new Error("Hotel não encontrado");

        const data = await response.json();

        // 1. Atualiza o Título da Aba
        if (data.nome) document.title = `${data.nome} | Concierge`;

        // 2. Atualiza o Banner (Hero)
        if (data.foto_capa) {
            const heroElement = document.getElementById('hero');
            if (heroElement) {
                heroElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${data.foto_capa}')`;
            }
        }

        // 3. Atualiza Título e Subtítulo dinâmicos do Dashboard
        const h1 = document.getElementById('txt-hero-title');
        const p = document.getElementById('txt-hero-subtitle');

        if (h1) h1.innerText = data.titulo_hero || (lang === 'pt' ? "Experiências Exclusivas" : "Exclusive Experiences");
        if (p) p.innerText = data.subtitulo_hero || (lang === 'pt' ? "Selecione seu próximo destino" : "Select your next destination");

    } catch (error) {
        console.error("Erro ao carregar dados do hotel:", error);
    }
}

// ==========================================
// 📦 BUSCAR E RENDERIZAR PASSEIOS
// ==========================================
async function carregarConteudo(lang = 'pt') {
    const container = document.getElementById("passeios");
    if (!container) return;

    if (!hotelSlug) {
        container.innerHTML = "<p style='text-align:center;'>Identifique o hotel para continuar.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${hotelSlug}/passeios/?lang=${lang}`);
        if (!response.ok) throw new Error("Erro ao buscar passeios");

        const passeios = await response.json();
        idiomaAtual = lang;

        if (!passeios || passeios.length === 0) {
            container.innerHTML = `<p style='text-align:center;'>${traducoesFixas[lang].vazio}</p>`;
            return;
        }

        container.innerHTML = passeios.map(p => {
            // Usa as fotos enviadas pela API ou um placeholder
            const fotosHTML = p.fotos && p.fotos.length > 0
                ? p.fotos.map(f => `<img src="${f.url}" style="width:100%; height:220px; object-fit:cover;">`).join("")
                : `<img src="/static/images/placeholder.jpg" style="width:100%; height:220px; object-fit:cover;">`;

            return `
                <div class="card">
                    <div class="card-img">
                        ${fotosHTML}
                    </div>
                    <div class="card-content">
                        <h3>${p.nome}</h3>
                        <p class="info">${p.descricao}</p>
                        <div class="card-info">
                            <div class="price">
                                <small>${traducoesFixas[lang].lblPreco}</small><br>
                                <strong>R$ ${p.preco || '---'}</strong>
                            </div>
                            <button class="btn-whatsapp" onclick="reservar('${p.nome}')">
                                ${traducoesFixas[lang].btnReservar}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Erro na lista de passeios:", error);
        container.innerHTML = `<p style='text-align:center;'>${traducoesFixas[lang].erro}</p>`;
    }
}

// ==========================================
// 🛠️ FUNÇÕES DE INTERAÇÃO
// ==========================================

async function trocarIdioma(lang) {
    console.log(`Alterando para: ${lang}`); // Verifique o console do navegador (F12)
    const slug = window.hotelSlug || new URLSearchParams(window.location.search).get('hotel');

    if (!slug) {
        console.error("Erro: Slug do hotel não encontrado para tradução.");
        return;
    }

    try {
        // 1. Busca os dados do hotel (Banner e Títulos do Dashboard)
        const responseHotel = await fetch(`/api/hotel/${slug}/?lang=${lang}`);
        const dataHotel = await responseHotel.json();

        if (dataHotel) {
            document.getElementById('txt-hero-title').innerText = dataHotel.titulo_hero;
            document.getElementById('txt-hero-subtitle').innerText = dataHotel.subtitulo_hero;

            // Atualiza o banner se ele mudar por idioma
            if (dataHotel.foto_capa) {
                document.getElementById('hero').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${dataHotel.foto_capa}')`;
            }
        }

        // 2. Busca os passeios traduzidos
        // Importante: Verifique se sua URL de API aceita o parâmetro ?lang=es e ?lang=fr
        await carregarConteudo(lang);

        // 3. Atualiza o estado visual dos botões
        document.querySelectorAll('.lang-buttons button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toLowerCase() === lang) btn.classList.add('active');
        });

    } catch (error) {
        console.error("Erro na troca de idioma:", error);
    }
}

function reservar(nomePasseio) {
    const msg = encodeURIComponent(`Olá! Gostaria de informações sobre o passeio: ${nomePasseio}`);
    // Idealmente, o número do WhatsApp também viria da API do hotel
    window.open(`https://wa.me/5521999999999?text=${msg}`, '_blank');
}

// ==========================================
// 🚀 INICIALIZAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Inicia sempre em português ou no idioma padrão
    carregarDadosHotel('pt');
    carregarConteudo('pt');
});

// Expondo as funções para o onClick do HTML
window.trocarIdioma = trocarIdioma;
window.reservar = reservar;