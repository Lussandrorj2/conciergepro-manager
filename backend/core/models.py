from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import threading
from deep_translator import GoogleTranslator


def _traduzir_em_background(instance_pk, model_class, campos):
    def _run():
        try:
            from deep_translator import GoogleTranslator
            obj = model_class.objects.get(pk=instance_pk)
            atualizado = False
            for attr_pt, attr_lang, lang_dest in campos:
                if not getattr(obj, attr_lang):
                    texto = getattr(obj, attr_pt)
                    if texto:
                        traduzido = GoogleTranslator(source='pt', target=lang_dest).translate(texto)
                        setattr(obj, attr_lang, traduzido)
                        atualizado = True
            if atualizado:
                obj.save(update_fields=[attr_lang for _, attr_lang, _ in campos])
        except Exception as e:
            print(f"[Tradução] Erro: {e}")
    threading.Thread(target=_run, daemon=True).start()


# ==========================================
# 🏨 HOTEL
# ==========================================
class Hotel(models.Model):
    nome = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    foto_capa = models.ImageField(upload_to='hoteis/capas/', null=True, blank=True)

    titulo_hero    = models.CharField(max_length=255, default="Experiências Exclusivas")
    subtitulo_hero = models.CharField(max_length=255, default="Selecione seu próximo destino")

    titulo_hero_en    = models.CharField(max_length=255, blank=True)
    subtitulo_hero_en = models.CharField(max_length=255, blank=True)
    titulo_hero_es    = models.CharField(max_length=255, blank=True)
    subtitulo_hero_es = models.CharField(max_length=255, blank=True)
    titulo_hero_fr    = models.CharField(max_length=255, blank=True)
    subtitulo_hero_fr = models.CharField(max_length=255, blank=True)

    whatsapp   = models.CharField(max_length=20, blank=True, null=True)
    criado_em  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        def traduzir():
            try:
                original = Hotel.objects.filter(pk=self.pk).first()

                if original and original.titulo_hero == self.titulo_hero:
                    return

                if self.titulo_hero:
                    titulo_en = GoogleTranslator(source='pt', target='en').translate(self.titulo_hero)
                    titulo_es = GoogleTranslator(source='pt', target='es').translate(self.titulo_hero)
                    titulo_fr = GoogleTranslator(source='pt', target='fr').translate(self.titulo_hero)
                else:
                    titulo_en = titulo_es = titulo_fr = None

                if self.subtitulo_hero:
                    subtitulo_en = GoogleTranslator(source='pt', target='en').translate(self.subtitulo_hero)
                    subtitulo_es = GoogleTranslator(source='pt', target='es').translate(self.subtitulo_hero)
                    subtitulo_fr = GoogleTranslator(source='pt', target='fr').translate(self.subtitulo_hero)
                else:
                    subtitulo_en = subtitulo_es = subtitulo_fr = None

                Hotel.objects.filter(pk=self.pk).update(
                    titulo_hero_en=titulo_en,
                    titulo_hero_es=titulo_es,
                    titulo_hero_fr=titulo_fr,
                    subtitulo_hero_en=subtitulo_en,
                    subtitulo_hero_es=subtitulo_es,
                    subtitulo_hero_fr=subtitulo_fr,
                )

            except Exception as e:
                print("Erro na tradução:", e)

        import threading
        threading.Thread(target=traduzir, daemon=True).start()


# ==========================================
# 👤 PERFIL
# ==========================================
class Perfil(models.Model):
    user  = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"


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
    banner    = models.ImageField(upload_to='passeios/banner/', null=True, blank=True)

    ativo      = models.BooleanField(default=True)
    criado_em  = models.DateTimeField(auto_now_add=True)

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
            ('nome', 'nome_en', 'en'), ('descricao', 'descricao_en', 'en'),
            ('nome', 'nome_es', 'es'), ('descricao', 'descricao_es', 'es'),
            ('nome', 'nome_fr', 'fr'), ('descricao', 'descricao_fr', 'fr'),
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
        return f"{self.passeio.nome} - {self.data} {self.horario}"


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

    # ── CAMPOS NOVOS ──────────────────────────────────
    # Data em que o pagamento foi confirmado (para o caixa)
    data_pagamento   = models.DateField(null=True, blank=True)
    # Mês de referência para agrupamento nos relatórios (YYYY-MM)
    mes_referencia   = models.CharField(max_length=7, blank=True, default='')
    # JSON armazenando recebimentos via Pix: [{"nome": "Fulano", "valor": 50.00}, ...]
    pix_recebimentos = models.TextField(blank=True, default='')
    # ──────────────────────────────────────────────────

    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)
    observacoes  = models.TextField(blank=True, default='')
    data_reserva = models.DateTimeField(auto_now_add=True)

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
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='cambio_transacoes')
    moeda = models.CharField(max_length=10)
    valor = models.DecimalField(max_digits=10, decimal_places=2)

    cotacao_usada = models.DecimalField(max_digits=10, decimal_places=4)
    valor_reais = models.DecimalField(max_digits=10, decimal_places=2)

    # 🔥 AQUI
    cotacao_compra = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    cotacao_venda = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    valor_recebido = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    lucro = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.hotel} — {self.moeda} {self.valor}"


# ==========================================
# 🖼️ IMAGENS
# ==========================================
class ImagemPasseio(models.Model):
    passeio   = models.ForeignKey(Passeio, on_delete=models.CASCADE, related_name='fotos')
    arquivo   = models.ImageField(upload_to='passeios/galeria/')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto de {self.passeio.nome}"


# ==========================================
# 👤 SIGNAL
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
    banner    = models.ImageField(upload_to='hero/', null=True, blank=True)

    def __str__(self):
        return f"Hero — {self.hotel.nome if self.hotel else 'sem hotel'}"


# ==========================================
# 💰 CONFIGURAÇÃO DE DIVISÃO DE LUCROS
# ==========================================
class ConfiguracaoDivisao(models.Model):
    hotel                = models.OneToOneField(Hotel, on_delete=models.CASCADE, related_name='divisao')
    percentual_hotel     = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    nomes_recepcionistas = models.TextField(blank=True, default='')   # JSON string
    atualizado_em        = models.DateTimeField(auto_now=True)

    def get_nomes(self):
        import json
        try:
            return json.loads(self.nomes_recepcionistas)
        except Exception:
            return []

    def set_nomes(self, lista):
        import json
        self.nomes_recepcionistas = json.dumps(lista)

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
    mes_referencia = models.CharField(max_length=7, blank=True, default='')  # YYYY-MM
    observacao     = models.TextField(blank=True, default='')
    criado_em      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recepcionista} — R$ {self.valor} ({self.mes_referencia})"