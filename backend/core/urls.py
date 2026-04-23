from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    # =========================
    # HOME
    # =========================
    path('', views.home, name='home'),
    path('api/traduzir/', views.traduzir_texto),

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
    path('<slug:hotel_slug>/dashboard/quadro/', views.dashboard_quadro, name='dashboard_quadro'),

    # =========================
    # API PÚBLICA
    # =========================
    path('api/hotel/<slug:slug>/', views.detalhe_hotel, name='detalhe_hotel'),
    path('api/<slug:hotel_slug>/passeios/', views.listar_passeios, name='listar_passeios_publico'),
    path('api/admin/<slug:hotel_slug>/traduzir/', views.forcar_traducao_hotel, name='forcar_traducao'),

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
    path('api/public/<slug:hotel_slug>/passeios/', views.listar_passeios, name='api_passeios_detail'),

    # =========================
    # RESERVAS
    # =========================
    path('api/public/<slug:hotel_slug>/reservar/', views.criar_reserva, name='criar_reserva'),
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
    path('api/admin/<slug:hotel_slug>/cambio/<int:transacao_id>/', views.api_cambio_detail, name='api_cambio_detail'),

    # =========================
    # RELATÓRIOS
    # =========================
    path('api/<slug:hotel_slug>/relatorios/passeios/', views.relatorio_passeios, name='relatorio_passeios'),
    path('api/<slug:hotel_slug>/relatorios/mensal/', views.relatorio_mensal, name='relatorio_mensal'),
    path('api/<slug:hotel_slug>/relatorios/cambio/', views.relatorio_cambio, name='relatorio_cambio'),
    path('api/<slug:hotel_slug>/relatorios/comissoes/', views.relatorio_comissoes, name='relatorio_comissoes'),
    path('api/admin/<slug:hotel_slug>/divisao/', views.api_divisao, name='api_divisao'),

    path('<slug:hotel_slug>/dashboard/lugares/', views.dashboard_lugares, name='dashboard_lugares'),
    path('api/admin/<slug:hotel_slug>/lugares/', views.api_lugares, name='api_lugares'),
    path('api/admin/<slug:hotel_slug>/lugares/<int:lugar_id>/', views.api_lugares, name='api_lugares_detail'),
    path('api/public/<slug:hotel_slug>/lugares/', views.api_lugares_publico, name='api_lugares_publico'),

    # =========================
    # ADIANTAMENTOS  ← ESTAVA FALTANDO
    # =========================
    path('api/admin/<slug:hotel_slug>/adiantamentos/', views.api_adiantamentos, name='api_adiantamentos'),

    # =========================
    # IMAGENS
    # =========================
    path('api/admin/imagem/<int:id>/', views.deletar_imagem, name='deletar_imagem'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
