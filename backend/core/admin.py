from django.contrib import admin
from .models import Hotel, Perfil, Passeio, ImagemPasseio

@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ['user', 'hotel', 'cargo', 'ativo']
    fields = ['user', 'hotel', 'cargo', 'ativo', 'nome_completo', 'telefone']

admin.site.register(Hotel)
admin.site.register(Passeio)
admin.site.register(ImagemPasseio)
