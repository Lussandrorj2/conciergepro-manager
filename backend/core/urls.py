from django.urls import path
from . import views

urlpatterns = [

    # =========================
    # HOME
    # =========================
    path('', views.home, name='home'),

    # =========================
    # AUTENTICAÇÃO
    # =========================
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # =========================
    # DASHBOARD (PÁGINAS)
    # =========================
    path('<slug:hotel_slug>/dashboard/', views.dashboard_home, name='dashboard_home'),
    path('<slug:hotel_slug>/dashboard/criar/', views.dashboard_criar, name='dashboard_criar'),
    path('<slug:hotel_slug>/dashboard/listar/', views.dashboard_listar, name='dashboard_listar'),
    path('<slug:hotel_slug>/dashboard/agenda/', views.dashboard_agenda, name='dashboard_agenda'),
    path('<slug:hotel_slug>/dashboard/reservas/', views.dashboard_reservas, name='dashboard_reservas'),
    path('<slug:hotel_slug>/dashboard/cambio/', views.dashboard_cambio, name='dashboard_cambio'),
    path('<slug:hotel_slug>/dashboard/relatorios/', views.dashboard_relatorios, name='dashboard_relatorios'),
    path('<slug:hotel_slug>/dashboard/configuracoes/', views.dashboard_config, name='dashboard_config'),

    # =========================
    # API PÚBLICA
    # =========================
    path('api/hotel/<slug:slug>/', views.detalhe_hotel, name='detalhe_hotel'),
    path('api/<slug:hotel_slug>/passeios/', views.listar_passeios, name='listar_passeios_publico'),

    # =========================
    # HERO (ADMIN)
    # =========================
    path('api/admin/<slug:hotel_slug>/hero/', views.salvar_hero, name='salvar_hero'),
    path('api/admin/<slug:hotel_slug>/hero/get/', views.obter_hero, name='obter_hero'),

    # =========================
    # PASSEIOS (CRUD)
    # =========================
    path('api/admin/<slug:hotel_slug>/passeios/', views.api_passeios, name='api_passeios'),
    path('api/admin/<slug:hotel_slug>/passeios/<int:passeio_id>/', views.api_passeios, name='api_passeios_detail'),

    # =========================
    # RESERVAS
    # =========================
    path('api/<slug:hotel_slug>/reservar/', views.criar_reserva, name='criar_reserva'),
    path('api/admin/<slug:hotel_slug>/reservas/', views.api_reservas, name='api_reservas'),
    path('api/admin/<slug:hotel_slug>/reservas/<int:reserva_id>/', views.api_reservas, name='api_reservas_detail'),

    # =========================
    # AGENDA
    # =========================
    path('api/admin/<slug:hotel_slug>/agenda/', views.api_agenda, name='api_agenda'),

    # =========================
    # CÂMBIO
    # =========================
    path('api/admin/<slug:hotel_slug>/cambio/', views.api_cambio, name='api_cambio'),

    # =========================
    # RELATÓRIOS
    # =========================
    path('api/<slug:hotel_slug>/relatorios/passeios/', views.relatorio_passeios, name='relatorio_passeios'),
    path('api/<slug:hotel_slug>/relatorios/mensal/', views.relatorio_mensal, name='relatorio_mensal'),
    path('api/<slug:hotel_slug>/relatorios/cambio/', views.relatorio_cambio, name='relatorio_cambio'),

    # =========================
    # IMAGENS
    # =========================
    path('api/admin/imagem/<int:id>/', views.deletar_imagem, name='deletar_imagem'),
]