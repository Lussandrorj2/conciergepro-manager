from django.contrib import admin
from django.urls import path, include

# 👇 IMPORTANTE
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # suas rotas da app
    path('', include('core.urls')),
]

# 👇 ISSO AQUI RESOLVE SUAS IMAGENS
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)