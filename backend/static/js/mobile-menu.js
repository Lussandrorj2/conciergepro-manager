/**
 * mobile-menu.js
 * Adiciona: hamburguer, drawer sidebar, backdrop e bottom nav
 * Inclua em todas as páginas do dashboard antes de </body>
 * <script src="{% static 'js/mobile-menu.js' %}"></script>
 */

(function () {
    'use strict';

    // Só age se for mobile
    function isMobile() { return window.innerWidth <= 768; }

    // ── Identifica a página ativa pelo URL ──
    const path = window.location.pathname;
    function isActive(slug) { return path.includes(slug); }

    // ── Itens do bottom nav (5 principais) ──
    const NAV_ITEMS = [
        { icon: '🏠', label: 'Dashboard', slug: 'dashboard',   path: 'dashboard/'   },
        { icon: '📅', label: 'Reservas',  slug: 'reservas',    path: 'reservas/'    },
        { icon: '🗺️', label: 'Passeios',  slug: 'listar',      path: 'listar/'      },
        { icon: '💱', label: 'Câmbio',    slug: 'cambio',      path: 'cambio/'      },
        { icon: '📊', label: 'Relatórios',slug: 'relatorios',  path: 'relatorios/'  },
    ];

    // ── Extrai o slug do hotel da URL ──
    // URL padrão: /slug/dashboard/ → pega o primeiro segmento
    function getHotelSlug() {
        const parts = path.split('/').filter(Boolean);
        return parts[0] || '';
    }

    function init() {
        // 1. Adiciona backdrop
        if (!document.querySelector('.sidebar-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', closeSidebar);
        }

        // 2. Injeta hamburguer na topbar
        const topbar = document.querySelector('.topbar');
        if (topbar && !topbar.querySelector('.hamburger-btn')) {
            const btn = document.createElement('button');
            btn.className = 'hamburger-btn';
            btn.setAttribute('aria-label', 'Menu');
            btn.innerHTML = '☰';
            btn.addEventListener('click', toggleSidebar);
            topbar.insertBefore(btn, topbar.firstChild);
        }

        // 3. Injeta bottom nav
        if (!document.querySelector('.bottom-nav')) {
            const slug = getHotelSlug();
            const nav = document.createElement('nav');
            nav.className = 'bottom-nav';
            nav.innerHTML = NAV_ITEMS.map(item => {
                const active = isActive(item.slug) ? 'active' : '';
                return `
                    <a class="bottom-nav-item ${active}" href="/${slug}/dashboard/${item.path}">
                        <span class="nav-icon">${item.icon}</span>
                        <span>${item.label}</span>
                    </a>`;
            }).join('');
            document.body.appendChild(nav);
        }
    }

    function toggleSidebar() {
        const sidebar  = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (!sidebar) return;
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) closeSidebar();
        else openSidebar();
    }

    function openSidebar() {
        document.querySelector('.sidebar')?.classList.add('open');
        document.querySelector('.sidebar-backdrop')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        document.querySelector('.sidebar')?.classList.remove('open');
        document.querySelector('.sidebar-backdrop')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Fecha sidebar ao clicar em um link dentro dela (mobile)
    function bindSidebarLinks() {
        document.querySelectorAll('.sidebar nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (isMobile()) closeSidebar();
            });
        });
    }

    // Re-init ao redimensionar (ex: rotação do celular)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) closeSidebar();
        }, 150);
    });

    // Swipe para fechar sidebar (arrastar da esquerda para direita fecha)
    let touchStartX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar?.classList.contains('open') && dx < -60) closeSidebar();
    }, { passive: true });

    // Inicializa
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); bindSidebarLinks(); });
    } else {
        init();
        bindSidebarLinks();
    }

})();
