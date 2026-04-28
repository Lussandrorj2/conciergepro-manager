from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import threading
import json
import re
from cloudinary.models import CloudinaryField
from deep_translator import GoogleTranslator


def _traduzir_em_background(instance_pk, model_class, campos):
    def _run():
        try:
            termos_protegidos = {
                r'\bRio de Janeiro\b': '##RIODEJANEIRO##',
                r'\bRio\b': '##RIO##',
            }
            restauracao = {
                '##RIODEJANEIRO##': 'Rio de Janeiro',
                '##RIO##': 'Rio',
            }
            obj = model_class.objects.get(pk=instance_pk)
            campos_atualizados = []
            translator = GoogleTranslator(source='pt', target='en')
            for attr_pt, attr_lang, lang_dest in campos:
                texto = getattr(obj, attr_pt, None)
                if not texto:
                    continue
                texto_proc = texto
                for padrao, placeholder in termos_protegidos.items():
                    texto_proc = re.sub(padrao, placeholder, texto_proc)
                translator.target = lang_dest
                traduzido = translator.translate(texto_proc)
                if traduzido:
                    for placeholder, valor in restauracao.items():
                        traduzido = traduzido.replace(placeholder, valor)
                    setattr(obj, attr_lang, traduzido)
                    campos_atualizados.append(attr_lang)
            if campos_atualizados:
                obj.save(update_fields=campos_atualizados)
        except Exception as e:
            print(f"[Tradução] Erro: {e}")
    threading.Thread(target=_run, daemon=True).start()


# ==========================================
# 🏨 HOTEL
# ==========================================
class Hotel(models.Model):
    nome      = models.CharField(max_length=255)
    slug      = models.SlugField(unique=True)
    foto_capa = CloudinaryField('image', null=True, blank=True)

    titulo_hero    = models.CharField(max_length=255, default="Experiências Exclusivas")
    subtitulo_hero = models.CharField(max_length=255, default="Selecione seu próximo destino")
    titulo_hero_en    = models.CharField(max_length=255, blank=True)
    subtitulo_hero_en = models.CharField(max_length=255, blank=True)
    titulo_hero_es    = models.CharField(max_length=255, blank=True)
    subtitulo_hero_es = models.CharField(max_length=255, blank=True)
    titulo_hero_fr    = models.CharField(max_length=255, blank=True)
    subtitulo_hero_fr = models.CharField(max_length=255, blank=True)

    whatsapp   = models.CharField(max_length=20, blank=True, null=True)
    mapa_embed = models.TextField(blank=True)
    criado_em  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        titulo_mudou = subtitulo_mudou = True
        if self.pk:
            try:
                original = Hotel.objects.get(pk=self.pk)
                titulo_mudou    = original.titulo_hero    != self.titulo_hero
                subtitulo_mudou = original.subtitulo_hero != self.subtitulo_hero
                if titulo_mudou:
                    self.titulo_hero_en = self.titulo_hero_es = self.titulo_hero_fr = ""
                if subtitulo_mudou:
                    self.subtitulo_hero_en = self.subtitulo_hero_es = self.subtitulo_hero_fr = ""
            except Hotel.DoesNotExist:
                pass
        super().save(*args, **kwargs)
        if not (titulo_mudou or subtitulo_mudou):
            return
        campos = []
        if titulo_mudou:
            campos += [('titulo_hero','titulo_hero_en','en'),('titulo_hero','titulo_hero_es','es'),('titulo_hero','titulo_hero_fr','fr')]
        if subtitulo_mudou:
            campos += [('subtitulo_hero','subtitulo_hero_en','en'),('subtitulo_hero','subtitulo_hero_es','es'),('subtitulo_hero','subtitulo_hero_fr','fr')]
        _traduzir_em_background(self.pk, Hotel, campos)


# ==========================================
# 👤 PERFIL — com cargo e permissões
# ==========================================

# Módulos disponíveis no sistema
MODULOS = [
    ('hospedagem',    'Hospedagem / Auditoria'),
    ('reservas',      'Reservas Concierge'),
    ('reservas_hotel','Reservas Hotel'),
    ('experiencias',  'Experiências / Passeios'),
    ('cambio',        'Câmbio'),
    ('tarefas',       'Tarefas'),
    ('relatorios',    'Relatórios'),
    ('configuracoes', 'Configurações'),
    ('lugares',       'Lugares Sugeridos'),
]

CARGO_CHOICES = [
    ('gerente',       'Gerente'),
    ('recepcionista', 'Recepcionista'),
]

class Perfil(models.Model):
    user  = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfis')
    cargo = models.CharField(max_length=20, choices=CARGO_CHOICES, default='recepcionista')

    # JSON com lista de módulos permitidos ex: ["hospedagem", "reservas", "cambio"]
    # Gerente tem acesso a tudo automaticamente (verificado na view)
    permissoes_json = models.TextField(blank=True, default='[]')

    # Dados extras
    nome_completo = models.CharField(max_length=150, blank=True)
    telefone      = models.CharField(max_length=20, blank=True)
    ativo         = models.BooleanField(default=True)
    criado_em     = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['cargo', 'user__username']

    def __str__(self):
        return f"{self.user.username} ({self.get_cargo_display()}) — {self.hotel}"

    # ---------- helpers de permissão ----------

    def get_permissoes(self):
        try:
            return json.loads(self.permissoes_json)
        except Exception:
            return []

    def set_permissoes(self, lista):
        self.permissoes_json = json.dumps(lista)

    def tem_permissao(self, modulo):
        """Gerente tem acesso total. Recepcionista só ao que foi liberado."""
        if not self.ativo:
            return False
        if self.user.is_superuser or self.user.is_staff:
            return True
        if self.cargo == 'gerente':
            return True
        return modulo in self.get_permissoes()

    def is_gerente(self):
        return self.cargo == 'gerente' or self.user.is_superuser or self.user.is_staff

    def modulos_disponiveis(self):
        """Retorna lista de módulos que este usuário pode acessar."""
        if self.is_gerente() or self.user.is_superuser:
            return [m[0] for m in MODULOS]
        return self.get_permissoes()


# ==========================================
# 🏝️ PASSEIO
# ==========================================
class Passeio(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='passeios')
    nome        = models.CharField(max_length=255)
    descricao   = models.TextField()
    preco       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    preco_sob_consulta = models.BooleanField(default=False)
    preco_por_pessoa   = models.BooleanField(default=False)
    titulo    = models.CharField(max_length=255, blank=True)
    subtitulo = models.CharField(max_length=255, blank=True)
    banner    = CloudinaryField('image', null=True, blank=True)
    ativo     = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    nome_en      = models.CharField(max_length=255, blank=True)
    descricao_en = models.TextField(blank=True)
    nome_es      = models.CharField(max_length=255, blank=True)
    descricao_es = models.TextField(blank=True)
    nome_fr      = models.CharField(max_length=255, blank=True)
    descricao_fr = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                original = Passeio.objects.get(pk=self.pk)
                if original.nome != self.nome or original.descricao != self.descricao:
                    self.nome_en = self.descricao_en = ""
                    self.nome_es = self.descricao_es = ""
                    self.nome_fr = self.descricao_fr = ""
            except Passeio.DoesNotExist:
                pass
        super().save(*args, **kwargs)
        campos = [
            ('nome','nome_en','en'),('descricao','descricao_en','en'),
            ('nome','nome_es','es'),('descricao','descricao_es','es'),
            ('nome','nome_fr','fr'),('descricao','descricao_fr','fr'),
        ]
        _traduzir_em_background(self.pk, Passeio, campos)

    def __str__(self):
        return f"{self.nome} - {self.hotel.nome}"


# ==========================================
# 📅 AGENDA
# ==========================================
class PasseioAgenda(models.Model):
    passeio = models.ForeignKey(Passeio, on_delete=models.CASCADE, related_name='agendas')
    data    = models.DateField(null=True, blank=True)
    horario = models.TimeField(null=True, blank=True)
    vagas   = models.IntegerField(default=0)

    @property
    def vagas_disponiveis(self):
        reservadas = self.reservas.filter(
            status__in=[Reserva.Status.PENDENTE, Reserva.Status.CONFIRMADA]
        ).aggregate(total=models.Sum('num_pessoas'))['total'] or 0
        return max(self.vagas - reservadas, 0)

    def __str__(self):
        data_str = self.data.strftime('%d/%m/%Y') if self.data else "Sem data"
        return f"{self.passeio.nome if self.passeio else 'Passeio'} - {data_str}"


# ==========================================
# 🧾 RESERVA
# ==========================================
class Reserva(models.Model):
    class Status(models.TextChoices):
        PENDENTE   = 'pendente',   'Pendente'
        CONFIRMADA = 'confirmada', 'Confirmada'
        REALIZADO  = 'realizado',  'Passeio Realizado'
        PAGO       = 'pago',       'Pago'
        CANCELADA  = 'cancelada',  'Cancelada'

    class FormaPagamento(models.TextChoices):
        PIX      = 'pix',      'Pix'
        DINHEIRO = 'dinheiro', 'Dinheiro'
        PENDENTE = 'pendente', 'Pendente'

    hotel          = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='reservas')
    passeio        = models.ForeignKey(Passeio, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservas_diretas')
    passeio_agenda = models.ForeignKey(PasseioAgenda, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservas')
    nome_cliente      = models.CharField(max_length=200)
    telefone          = models.CharField(max_length=20)
    email             = models.EmailField(blank=True, default='')
    data_passeio      = models.DateField(null=True, blank=True)
    horario           = models.TimeField(null=True, blank=True)
    num_pessoas       = models.PositiveIntegerField(default=1)
    valor_bruto       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    comissao_agencia  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    comissao_recepcao = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    recepcionista     = models.CharField(max_length=100, blank=True, default='')
    forma_pagamento   = models.CharField(max_length=20, choices=FormaPagamento.choices, default=FormaPagamento.PENDENTE)
    data_pagamento    = models.DateField(null=True, blank=True)
    mes_referencia    = models.CharField(max_length=7, blank=True, default='')
    pix_recebimentos  = models.TextField(blank=True, default='')
    status            = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)
    observacoes       = models.TextField(blank=True, default='')
    data_reserva      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome_cliente} — {self.passeio} ({self.status})"


# ==========================================
# 💱 CAMBIO
# ==========================================
class Cambio(models.Model):
    moeda            = models.CharField(max_length=10)
    cotacao_oficial  = models.DecimalField(max_digits=10, decimal_places=4)
    percentual_lucro = models.DecimalField(max_digits=5, decimal_places=2)
    cotacao_venda    = models.DecimalField(max_digits=10, decimal_places=4)
    data             = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.moeda} — {self.cotacao_venda} ({self.data})"


class CambioTransacao(models.Model):
    hotel          = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='cambio_transacoes')
    moeda          = models.CharField(max_length=10)
    valor          = models.DecimalField(max_digits=10, decimal_places=2)
    cotacao_usada  = models.DecimalField(max_digits=10, decimal_places=4)
    valor_reais    = models.DecimalField(max_digits=10, decimal_places=2)
    cotacao_compra = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    cotacao_venda  = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    valor_recebido = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lucro          = models.DecimalField(max_digits=10, decimal_places=2)
    data           = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.hotel} — {self.moeda} {self.valor}"


# ==========================================
# 🖼️ IMAGENS
# ==========================================
class ImagemPasseio(models.Model):
    passeio   = models.ForeignKey(Passeio, on_delete=models.CASCADE, related_name='fotos')
    arquivo   = CloudinaryField('image')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto de {self.passeio.nome}"


# ==========================================
# 👤 SIGNAL — cria Perfil ao criar User
# ==========================================
@receiver(post_save, sender=User)
def criar_ou_atualizar_perfil(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.get_or_create(user=instance)


# ==========================================
# 🎯 HERO
# ==========================================
class Hero(models.Model):
    hotel     = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='heroes', null=True, blank=True)
    titulo    = models.CharField(max_length=255)
    subtitulo = models.CharField(max_length=255, blank=True)
    banner    = CloudinaryField('image', null=True, blank=True)

    def __str__(self):
        return f"Hero — {self.hotel.nome if self.hotel else 'sem hotel'}"


# ==========================================
# 💰 CONFIGURAÇÃO DE DIVISÃO DE LUCROS
# ==========================================
class ConfiguracaoDivisao(models.Model):
    hotel                = models.OneToOneField(Hotel, on_delete=models.CASCADE, related_name='divisao')
    percentual_hotel     = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    nomes_recepcionistas = models.TextField(blank=True, default='')
    pcts_json            = models.TextField(blank=True, default='[]')
    atualizado_em        = models.DateTimeField(auto_now=True)

    def get_nomes(self):
        try:
            return json.loads(self.nomes_recepcionistas)
        except Exception:
            return []

    def set_nomes(self, lista):
        self.nomes_recepcionistas = json.dumps(lista)

    def get_pcts(self):
        try:
            return json.loads(self.pcts_json)
        except Exception:
            return []

    def set_pcts(self, lista):
        self.pcts_json = json.dumps(lista)

    def __str__(self):
        return f"Divisão — {self.hotel.nome}"


# ==========================================
# 💸 ADIANTAMENTOS
# ==========================================
class Adiantamento(models.Model):
    hotel          = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='adiantamentos')
    recepcionista  = models.CharField(max_length=100)
    valor          = models.DecimalField(max_digits=10, decimal_places=2)
    data           = models.DateField(null=True, blank=True)
    mes_referencia = models.CharField(max_length=7, blank=True, default='')
    observacao     = models.TextField(blank=True, default='')
    criado_em      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recepcionista} — R$ {self.valor} ({self.mes_referencia})"


# ==========================================
# 📍 LUGARES SUGERIDOS
# ==========================================
class LugarSugerido(models.Model):
    TIPO_CHOICES = [
        ('restaurante', 'Restaurante'),
        ('shopping',    'Shopping / Compras'),
    ]
    hotel      = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='lugares')
    tipo       = models.CharField(max_length=20, choices=TIPO_CHOICES)
    nome       = models.CharField(max_length=200)
    descricao  = models.CharField(max_length=300, blank=True)
    estrelas   = models.CharField(max_length=10, blank=True, default='★★★★☆')
    distancia  = models.CharField(max_length=50, blank=True)
    horario    = models.CharField(max_length=200, blank=True)
    maps_link  = models.URLField(blank=True)
    lat        = models.FloatField(null=True, blank=True)
    lng        = models.FloatField(null=True, blank=True)
    ativo      = models.BooleanField(default=True)
    ordem      = models.IntegerField(default=0)
    criado_em  = models.DateTimeField(auto_now_add=True)
    instagram  = models.CharField(max_length=100, blank=True)
    telefone   = models.CharField(max_length=30, blank=True)

    class Meta:                          # ← pertence ao LugarSugerido
        ordering = ['ordem', 'nome']

    def __str__(self):
        hotel_nome = self.hotel.nome if self.hotel else "Sem Hotel"
        return f"{self.nome} ({hotel_nome})"


# ==========================================
# 📋 LOG DE OPERAÇÕES
# ==========================================
class LogOperacao(models.Model):
    hotel       = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='logs')
    usuario     = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acao        = models.CharField(max_length=50)
    descricao   = models.TextField()
    dados_extra = models.JSONField(default=dict, blank=True)
    criado_em   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-criado_em']

    def __str__(self):
        return f"[{self.criado_em:%d/%m/%Y %H:%M}] {self.usuario} — {self.acao}"
        hotel_nome = self.hotel.nome if self.hotel else "Sem Hotel"
        return f"{self.nome} ({hotel_nome})"
