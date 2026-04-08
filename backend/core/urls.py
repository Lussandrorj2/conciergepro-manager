from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ==========================================
    # 🔐 1. AUTENTICAÇÃO E NAVEGAÇÃO
    # ==========================================
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Rota do Dashboard (Interface do hoteleiro)
    path('<slug:hotel_slug>/dashboard/', views.dashboard, name='dashboard'),

    # ==========================================
    # 🌐 2. APIS PÚBLICAS (Usadas pelo script.js)
    # ==========================================
    
    # Busca Nome e Banner do Hotel
    path('api/hotel/<slug:slug>/', views.detalhe_hotel, name='detalhe_hotel'),
    
    # Busca Lista de Passeios (Frontend)
    # Importante: A barra final evita o erro 302 que quebra o JSON
    path('api/<slug:hotel_slug>/passeios/', views.listar_passeios, name='listar_passeios_publico'),

    # ==========================================
    # ⚙️ 3. APIS PRIVADAS (CRUD do Dashboard)
    # ==========================================
    
    # Atualizar Banner e Configurações do Hotel
    path('api/hotel/<slug:hotel_slug>/atualizar/', views.atualizar_hotel, name='atualizar_hotel'),
    
    # Gerenciar Passeios (Criar/Editar/Deletar)
    path('api/admin/<slug:hotel_slug>/passeios/', views.api_passeios, name='api_passeios'),
    path('api/admin/<slug:hotel_slug>/passeios/<int:passeio_id>/', views.api_passeios, name='api_passeios_detail'),

] 

# Serve arquivos de mídia (Fotos) durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)