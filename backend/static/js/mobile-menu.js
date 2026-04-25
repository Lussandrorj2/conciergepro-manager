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

    function getHotelSlug() {
        if (window.hotelSlug) return window.hotelSlug;
        const parts = path.split('/').filter(Boolean);
        return parts[0] || '';
    }

    function getActivePage() {
        const parts = path.split('/').filter(Boolean);
        return parts[2] || '';
    }

    const NAV_ITEMS = [
        { icon: '🏠', label: 'Início', key: '',           sub: ''            },
        { icon: '📅', label: 'Reservas',  key: 'reservas',   sub: 'reservas/'   },
        { icon: '🗺️', label: 'Experiências',  key: 'listar',     sub: 'listar/'     },
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

        // 4. Mostrar/ocultar botões desktop vs mobile na topbar
        aplicarVisibilidadeTopbar();

        bindSidebarLinks();
    }

    /**
     * Em desktop (>768px): esconde o menu ⋮ se existirem botões .desktop-only
     * Em mobile: esconde botões .desktop-only, mantém o ⋮
     */
    function aplicarVisibilidadeTopbar() {
        const desktopBtns = document.querySelectorAll('.desktop-only');
        const actionsMenu = document.getElementById('actions-menu-wrap');

        function atualizar() {
            const mobile = isMobile();
            desktopBtns.forEach(el => {
                el.style.display = mobile ? 'none' : (el.dataset.display || 'flex');
            });
            // O menu ⋮ fica visível no mobile; no desktop, só se não houver botões diretos
            if (actionsMenu) {
                actionsMenu.style.display = (!mobile && desktopBtns.length) ? 'none' : '';
            }
        }

        atualizar();
        window.addEventListener('resize', atualizar);
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

    // ── Dropdown de ações da topbar (centralizado para todas as páginas) ──
    window.toggleActionsMenu = function () {
        document.getElementById('actions-dropdown')?.classList.toggle('open');
    };

    document.addEventListener('click', function (e) {
        const wrap = document.getElementById('actions-menu-wrap');
        if (wrap && !wrap.contains(e.target)) {
            document.getElementById('actions-dropdown')?.classList.remove('open');
        }
    });

    // Fecha ao redimensionar para desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) closeSidebar();
        }, 150);
    });

    // Swipe para fechar/abrir sidebar
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        const dx      = e.changedTouches[0].clientX - touchStartX;
        const sidebar = document.querySelector('.sidebar');
        if (dx < -60 && sidebar?.classList.contains('open')) {
            closeSidebar();
        }
        if (dx > 60 && touchStartX < 30 && !sidebar?.classList.contains('open')) {
            openSidebar();
        }
    }, { passive: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
