/**
 * mobile-menu.js
 * Adiciona: hamburguer, drawer sidebar, backdrop e bottom nav
 * Inclua em todas as páginas do dashboard antes de </body>
 * <script src="{% static 'js/mobile-menu.js' %}"></script>
 */

(function () {
    'use strict';

    function isMobile() { return window.innerWidth <= 768; }

    const path = window.location.pathname;

    // ── Extrai o hotel slug da URL ──
    // URL: /ipanema/dashboard/reservas/ → slug = "ipanema"
    function getHotelSlug() {
        if (window.hotelSlug) return window.hotelSlug;
        const parts = path.split('/').filter(Boolean);
        return parts[0] || '';
    }

    // ── Identifica a subpágina ativa ──
    // /slug/dashboard/reservas/ → "reservas"
    // /slug/dashboard/          → "" (dashboard raiz)
    function getActivePage() {
        const parts = path.split('/').filter(Boolean);
        // parts[0] = slug, parts[1] = "dashboard", parts[2] = subpágina
        return parts[2] || '';
    }

    // ── Itens do bottom nav ──
    const NAV_ITEMS = [
        { icon: '🏠', label: 'Dashboard', key: '',           sub: ''            },
        { icon: '📅', label: 'Reservas',  key: 'reservas',   sub: 'reservas/'   },
        { icon: '🗺️', label: 'Passeios',  key: 'listar',     sub: 'listar/'     },
        { icon: '💵↔️💶', label: 'Câmbio',    key: 'cambio',     sub: 'cambio/'     },
        { icon: '📊', label: 'Relatórios',key: 'relatorios', sub: 'relatorios/' },
    ];

    function buildNav() {
        const slug       = getHotelSlug();
        const activePage = getActivePage();

        return NAV_ITEMS.map(item => {
            const isActive = activePage === item.key;
            const href     = `/${slug}/dashboard/${item.sub}`;
            return `<a class="bottom-nav-item${isActive ? ' active' : ''}" href="${href}">
                <span class="nav-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');
    }

    function init() {
        // Não rodar em páginas sem sidebar (ex: login)
        if (!document.querySelector(".sidebar")) return;
        // 1. Backdrop
        if (!document.querySelector('.sidebar-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', closeSidebar);
        }

        // 2. Hamburguer na topbar
        const topbar = document.querySelector('.topbar');
        // DEPOIS
        const existingBtn = topbar?.querySelector('.hamburger-btn') || document.getElementById('hamburger-btn');
        if (topbar && !existingBtn) {
            const btn = document.createElement('button');
            btn.className = 'hamburger-btn';
            btn.setAttribute('aria-label', 'Abrir menu');
            btn.innerHTML = '☰';
            btn.addEventListener('click', toggleSidebar);
            topbar.insertBefore(btn, topbar.firstChild);
        } else if (existingBtn) {
            existingBtn.addEventListener('click', toggleSidebar);
        }


        // 3. Bottom nav
        if (!document.querySelector('.bottom-nav')) {
            const nav = document.createElement('nav');
            nav.className = 'bottom-nav';
            nav.innerHTML = buildNav();
            document.body.appendChild(nav);
        }

        bindSidebarLinks();
    }

    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
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

    function bindSidebarLinks() {
        document.querySelectorAll('.sidebar nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (isMobile()) closeSidebar();
            });
        });
    }

    // Fecha ao redimensionar para desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) closeSidebar();
        }, 150);
    });

    // Swipe para fechar (arrastar para esquerda com sidebar aberta)
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        const dx      = e.changedTouches[0].clientX - touchStartX;
        const sidebar = document.querySelector('.sidebar');
        // Fechar: swipe esquerda com sidebar aberta
        if (dx < -60 && sidebar?.classList.contains('open')) {
            closeSidebar();
        }
        // Abrir: swipe direita começando na borda esquerda (<30px)
        if (dx > 60 && touchStartX < 30 && !sidebar?.classList.contains('open')) {
            openSidebar();
        }
    }, { passive: true });

    // Init — aguarda DOM se necessário
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
