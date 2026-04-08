from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from googletrans import Translator

class Hotel(models.Model):
    nome = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    foto_capa = models.ImageField(upload_to='hoteis/capas/', null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

class Passeio(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='passeios')
    nome = models.CharField(max_length=255)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    # --- CAMPOS DE TRADUÇÃO AUTOMÁTICA ---
    nome_en = models.CharField(max_length=255, blank=True)
    descricao_en = models.TextField(blank=True)
    
    nome_es = models.CharField(max_length=255, blank=True)
    descricao_es = models.TextField(blank=True)
    
    nome_fr = models.CharField(max_length=255, blank=True)
    descricao_fr = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        # Só tenta traduzir se for um novo registro ou se os campos originais mudaram
        translator = Translator()
        
        try:
            # Tradução para Inglês
            if not self.nome_en and self.nome:
                self.nome_en = translator.translate(self.nome, dest='en').text
            if not self.descricao_en and self.descricao:
                self.descricao_en = translator.translate(self.descricao, dest='en').text

            # Tradução para Espanhol
            if not self.nome_es and self.nome:
                self.nome_es = translator.translate(self.nome, dest='es').text
            if not self.descricao_es and self.descricao:
                self.descricao_es = translator.translate(self.descricao, dest='es').text

            # Tradução para Francês
            if not self.nome_fr and self.nome:
                self.nome_fr = translator.translate(self.nome, dest='fr').text
            if not self.descricao_fr and self.descricao:
                self.descricao_fr = translator.translate(self.descricao, dest='fr').text
        except Exception as e:
            print(f"Erro na tradução automática: {e}")
            # Se a tradução falhar (ex: sem internet), ele salva o original nos campos de tradução
            self.nome_en = self.nome_en or self.nome
            self.descricao_en = self.descricao_en or self.descricao

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} - {self.hotel.nome}"

class ImagemPasseio(models.Model):
    passeio = models.ForeignKey(Passeio, on_delete=models.CASCADE, related_name='fotos')
    arquivo = models.ImageField(upload_to='passeios/galeria/')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto de {self.passeio.nome}"

@receiver(post_save, sender=User)
def criar_perfil(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)