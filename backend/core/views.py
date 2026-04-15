from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json
import traceback

from .models import (
    Hotel, Passeio, ImagemPasseio, Hero,
    Reserva, CambioTransacao, PasseioAgenda,
    ConfiguracaoDivisao, Adiantamento,
)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from deep_translator import GoogleTranslator


def to_float(valor):
    try:
        return float(str(valor).replace(",", "."))
    except Exception:
        return 0


def get_media_url(field):
    """
    Retorna a URL pública de um campo de arquivo.
    Funciona tanto com armazenamento local quanto com S3/R2.
    """
    if not field:
        return None
    try:
        # .url já retorna a URL correta seja local ou S3
        return field.url
    except Exception:
        return None


def _get_hotel_do_usuario(request, hotel):
    """
    Verifica se o usuário logado pertence ao hotel solicitado.
    """
    try:
        return request.user.perfil.hotel == hotel
    except Exception:
        return False


# =========================
# HOME
# =========================

def home(request):
    slug  = request.GET.get('hotel', '').strip()
    hotel = None
    if slug:
        try:
            hotel = Hotel.objects.get(slug=slug)
        except Hotel.DoesNotExist:
            hotel = None
    return render(request, 'index.html', {'hotel': hotel})


# =========================
# API PÚBLICA — HOTEL
# =========================

@api_view(['GET'])
@permission_classes([AllowAny])
def detalhe_hotel(request, slug):
    hotel = get_object_or_404(Hotel, slug=slug)
    lang  = request.GET.get('lang', 'pt')

    if lang == 'en':
        titulo    = hotel.titulo_hero_en    or hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero_en or hotel.subtitulo_hero
    elif lang == 'es':
        titulo    = hotel.titulo_hero_es    or hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero_es or hotel.subtitulo_hero
    elif lang == 'fr':
        titulo    = hotel.titulo_hero_fr    or hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero_fr or hotel.subtitulo_hero
    else:
        titulo    = hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero

    return Response({
        "nome":         hotel.nome,
        "titulo_hero":  titulo,
        "subtitulo_hero": subtitulo,
        "foto_capa":    get_media_url(hotel.foto_capa),
        "whatsapp":     hotel.whatsapp,
    })


# =========================
# API PÚBLICA — PASSEIOS
# =========================

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_passeios(request, hotel_slug):
    hotel    = get_object_or_404(Hotel, slug=hotel_slug)
    lang     = request.GET.get('lang', 'pt')
    passeios = Passeio.objects.filter(hotel=hotel, ativo=True).prefetch_related('fotos')

    resultado = []
    for p in passeios:
        if lang == 'en':
            nome      = p.nome_en      or p.nome
            descricao = p.descricao_en or p.descricao
        elif lang == 'es':
            nome      = p.nome_es      or p.nome
            descricao = p.descricao_es or p.descricao
        elif lang == 'fr':
            nome      = p.nome_fr      or p.nome
            descricao = p.descricao_fr or p.descricao
        else:
            nome      = p.nome
            descricao = p.descricao

        resultado.append({
            "id":                 p.id,
            "nome":               nome,
            "descricao":          descricao,
            "preco":              float(p.preco) if p.preco else 0,
            "preco_sob_consulta": p.preco_sob_consulta,
            "preco_por_pessoa":   p.preco_por_pessoa,
            "banner":             get_media_url(p.banner),
            "fotos": [
                {"id": f.id, "url": get_media_url(f.arquivo)}
                for f in p.fotos.all()
                if get_media_url(f.arquivo)
            ],
        })
    return Response(resultado)


# =========================
# LOGIN / LOGOUT
# =========================

def login_view(request):
    if request.method == "POST":
        user = authenticate(
            request,
            username=request.POST.get("username"),
            password=request.POST.get("password"),
        )
        if user:
            login(request, user)
            try:
                if user.perfil and user.perfil.hotel:
                    return redirect(f"/{user.perfil.hotel.slug}/dashboard/")
            except Exception:
                pass
            return redirect('/')
        return render(request, 'login.html', {"erro": "Login inválido"})
    return render(request, 'login.html')


def logout_view(request):
    logout(request)
    return redirect('login')


# =========================
# DASHBOARD (PÁGINAS)
# =========================

@login_required
def dashboard_home(request, hotel_slug):
    return render(request, 'dashboard/dashboard_home.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_criar(request, hotel_slug):
    return render(request, "dashboard/criar_passeios.html", {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_listar(request, hotel_slug):
    return render(request, 'dashboard/gerenciar_passeios.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_relatorios(request, hotel_slug):
    return render(request, 'dashboard/relatorios.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_config(request, hotel_slug):
    return render(request, 'dashboard/configuracoes.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_agenda(request, hotel_slug):
    return render(request, 'dashboard/agenda_passeios.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_reservas(request, hotel_slug):
    return render(request, 'dashboard/reservas.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})

@login_required
def dashboard_cambio(request, hotel_slug):
    return render(request, 'dashboard/cambio.html', {'hotel': get_object_or_404(Hotel, slug=hotel_slug)})


# =========================
# PASSEIOS CRUD (ADMIN)
# =========================

@csrf_exempt
@login_required
def api_passeios(request, hotel_slug, passeio_id=None):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    # Garante que apenas usuários do hotel acessam
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        if passeio_id:
            p = get_object_or_404(Passeio, id=passeio_id, hotel=hotel)
            return JsonResponse({
                "id":                 p.id,
                "nome":               p.nome,
                "descricao":          p.descricao,
                "preco":              str(p.preco) if p.preco else "",
                "preco_sob_consulta": p.preco_sob_consulta,
                "preco_por_pessoa":   p.preco_por_pessoa,
                "banner":             get_media_url(p.banner),
                "fotos": [
                    {"id": f.id, "url": get_media_url(f.arquivo)}
                    for f in p.fotos.all()
                    if get_media_url(f.arquivo)
                ],
            })

        passeios = Passeio.objects.filter(hotel=hotel).prefetch_related('fotos')
        return JsonResponse([{
            "id":                 p.id,
            "nome":               p.nome,
            "descricao":          p.descricao,
            "preco":              float(p.preco) if p.preco else 0,
            "preco_sob_consulta": p.preco_sob_consulta,
            "preco_por_pessoa":   p.preco_por_pessoa,
            "banner":             get_media_url(p.banner),
            "fotos": [
                {"id": f.id, "url": get_media_url(f.arquivo)}
                for f in p.fotos.all()
                if get_media_url(f.arquivo)
            ],
        } for p in passeios], safe=False)

    if request.method == "POST":
        try:
            if passeio_id:
                passeio = get_object_or_404(Passeio, id=passeio_id, hotel=hotel)
            else:
                passeio = Passeio(hotel=hotel)

            passeio.nome               = request.POST.get("nome", "").strip()
            passeio.descricao          = request.POST.get("descricao", "").strip()
            passeio.preco_sob_consulta = request.POST.get("preco_sob_consulta") == "true"
            passeio.preco_por_pessoa   = request.POST.get("preco_por_pessoa") == "true"

            if passeio.preco_sob_consulta:
                passeio.preco = None
            else:
                try:
                    passeio.preco = float(request.POST.get("preco") or 0)
                except (ValueError, TypeError):
                    passeio.preco = 0

            if request.FILES.get("banner"):
                passeio.banner = request.FILES.get("banner")

            passeio.save()

            # Salva imagens adicionais da galeria
            for f in request.FILES.getlist("imagens"):
                ImagemPasseio.objects.create(passeio=passeio, arquivo=f)

            return JsonResponse({"status": "ok", "id": passeio.id})

        except Exception as e:
            print("[api_passeios POST] Erro:")
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    if request.method == "DELETE":
        get_object_or_404(Passeio, id=passeio_id, hotel=hotel).delete()
        return JsonResponse({"status": "removido"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# CÂMBIO — listagem e criação
# =========================

@csrf_exempt
@login_required
def api_cambio(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        ano = request.GET.get("ano", "")
        mes = request.GET.get("mes", "")
        qs  = CambioTransacao.objects.filter(hotel=hotel).order_by('-data')
        if ano:
            qs = qs.filter(data__year=ano)
        if mes:
            qs = qs.filter(data__month=mes)

        dados = []
        for t in qs:
            cotacao_compra = str(getattr(t, 'cotacao_compra', t.cotacao_usada) or t.cotacao_usada)
            cotacao_venda  = str(getattr(t, 'cotacao_venda', 0) or 0)
            valor_recebido = str(getattr(t, 'valor_recebido', 0) or 0)
            dados.append({
                "id":             t.id,
                "moeda":          t.moeda,
                "valor":          str(t.valor),
                "cotacao_compra": cotacao_compra,
                "cotacao_venda":  cotacao_venda,
                "cotacao_usada":  str(t.cotacao_usada),
                "valor_reais":    str(t.valor_reais),
                "valor_recebido": valor_recebido,
                "lucro":          str(t.lucro),
                "data":           t.data.strftime('%Y-%m-%d') if t.data else "",
            })
        return JsonResponse(dados, safe=False)

    if request.method == "POST":
        try:
            moeda          = request.POST.get("moeda")
            valor          = float(request.POST.get("valor") or 0)
            cotacao_compra = float(request.POST.get("cotacao_compra") or request.POST.get("cotacao") or 0)
            cotacao_venda  = float(request.POST.get("cotacao_venda") or 0)
            valor_recebido = float(request.POST.get("valor_recebido") or 0)
            valor_pago     = valor * cotacao_compra

            valor_recebido_calc = valor * cotacao_venda if cotacao_venda else valor_pago
            lucro               = valor_recebido_calc - valor_pago

            t = CambioTransacao(
                hotel=hotel, moeda=moeda, valor=valor,
                cotacao_usada=cotacao_compra, valor_reais=valor_pago, lucro=lucro,
            )
            if hasattr(t, 'cotacao_compra'): t.cotacao_compra = cotacao_compra
            if hasattr(t, 'cotacao_venda'):  t.cotacao_venda  = cotacao_venda
            if hasattr(t, 'valor_recebido'): t.valor_recebido = valor_recebido
            t.save()
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    return JsonResponse({"erro": "Método inválido"}, status=400)


# =========================
# CÂMBIO — detalhe (PUT / DELETE)
# =========================

@csrf_exempt
@login_required
def api_cambio_detail(request, hotel_slug, transacao_id):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    transacao = get_object_or_404(CambioTransacao, id=transacao_id, hotel=hotel)

    if request.method == "PUT":
        try:
            data           = json.loads(request.body)
            moeda          = data.get("moeda", transacao.moeda)
            valor          = float(data.get("valor") or transacao.valor)
            cotacao_compra = float(data.get("cotacao_compra") or transacao.cotacao_usada)
            cotacao_venda  = float(data.get("cotacao_venda") or 0)
            valor_recebido = float(data.get("valor_recebido") or 0)

            valor_pago = valor * cotacao_compra
            lucro      = valor_recebido - valor_pago if valor_recebido > 0 else 0

            transacao.moeda         = moeda
            transacao.valor         = valor
            transacao.cotacao_usada = cotacao_compra
            transacao.valor_reais   = valor_pago
            transacao.lucro         = lucro

            if hasattr(transacao, 'cotacao_compra'): transacao.cotacao_compra = cotacao_compra
            if hasattr(transacao, 'cotacao_venda'):  transacao.cotacao_venda  = cotacao_venda
            if hasattr(transacao, 'valor_recebido'): transacao.valor_recebido = valor_recebido

            transacao.save()
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    if request.method == "DELETE":
        transacao.delete()
        return JsonResponse({"status": "removido"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# DELETAR IMAGEM
# =========================

@csrf_exempt
@login_required
def deletar_imagem(request, id):
    if request.method != "DELETE":
        return JsonResponse({"erro": "Método inválido"}, status=400)
    try:
        imagem = get_object_or_404(ImagemPasseio, id=id)
        if not _get_hotel_do_usuario(request, imagem.passeio.hotel):
            return JsonResponse({"erro": "Sem permissão"}, status=403)
        imagem.delete()
        return JsonResponse({"status": "ok"})
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"erro": str(e)}, status=500)


# =========================
# RESERVAS (PÚBLICO)
# =========================

@api_view(['POST'])
@permission_classes([AllowAny])
def criar_reserva(request, hotel_slug):
    try:
        hotel     = Hotel.objects.get(slug=hotel_slug)
        agenda_id = request.data.get("agenda_id")
        nome      = request.data.get("nome")
        telefone  = request.data.get("telefone")
        qtd       = int(request.data.get("qtd_pessoas", 1))

        comissao_recepcao = float(str(request.data.get("comissao_recepcao", 0)).replace(",", "."))
        comissao_agencia  = float(str(request.data.get("comissao_agencia", 0)).replace(",", "."))
        recepcionista     = request.data.get("recepcionista", "")
        forma_pagamento   = request.data.get("forma_pagamento", "pendente")

        agenda  = PasseioAgenda.objects.get(id=agenda_id)
        passeio = agenda.passeio

        if passeio.preco_sob_consulta:
            valor_total = 0
        else:
            preco       = passeio.preco or 0
            valor_total = float(preco) * qtd if passeio.preco_por_pessoa else float(preco)

        Reserva.objects.create(
            hotel=hotel,
            passeio_agenda=agenda,
            nome_cliente=nome,
            telefone=telefone,
            num_pessoas=qtd,
            valor_bruto=valor_total,
            comissao_recepcao=comissao_recepcao,
            comissao_agencia=comissao_agencia,
            recepcionista=recepcionista,
            forma_pagamento=forma_pagamento,
        )
        return Response({"status": "ok", "valor_total": float(valor_total)})
    except Exception as e:
        print(traceback.format_exc())
        return Response({"erro": str(e)}, status=500)


# =========================
# RESERVAS (ADMIN)
# =========================

@csrf_exempt
@login_required
def api_reservas(request, hotel_slug, reserva_id=None):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        qs = Reserva.objects.filter(hotel=hotel).order_by('-data_reserva')
        if request.GET.get('status'):
            qs = qs.filter(status=request.GET.get('status'))

        dados = []
        for r in qs:
            if r.passeio:
                passeio_nome = r.passeio.nome
                passeio_id   = r.passeio.id
            elif r.passeio_agenda:
                passeio_nome = r.passeio_agenda.passeio.nome
                passeio_id   = r.passeio_agenda.passeio.id
            else:
                passeio_nome = '-'
                passeio_id   = None

            if r.data_passeio:
                data = r.data_passeio.strftime('%d/%m/%Y')
            elif r.passeio_agenda and r.passeio_agenda.data:
                data = r.passeio_agenda.data.strftime('%d/%m/%Y')
            else:
                data = '-'

            horario = str(r.horario)[:5] if r.horario else '-'

            dados.append({
                "id":                r.id,
                "nome_cliente":      r.nome_cliente,
                "telefone":          r.telefone,
                "email":             r.email,
                "num_pessoas":       r.num_pessoas,
                "valor_bruto":       str(r.valor_bruto),
                "comissao_agencia":  str(r.comissao_agencia),
                "comissao_recepcao": str(r.comissao_recepcao),
                "recepcionista":     r.recepcionista,
                "forma_pagamento":   r.forma_pagamento,
                "status":            r.status,
                "data_reserva":      r.data_reserva.strftime('%d/%m/%Y %H:%M') if r.data_reserva else '-',
                "passeio_nome":      passeio_nome,
                "passeio_id":        passeio_id,
                "data":              data,
                "horario":           horario,
                "observacoes":       r.observacoes,
                "data_pagamento":    str(r.data_pagamento) if r.data_pagamento else '',
                "mes_referencia":    r.mes_referencia or '',
                "pix_recebimentos":  r.pix_recebimentos or '[]',
            })
        return JsonResponse(dados, safe=False)

    if request.method == "POST":
        try:
            passeio_id        = request.POST.get("passeio_id")
            nome              = request.POST.get("nome_cliente", "").strip()
            telefone          = request.POST.get("telefone", "").strip()
            email             = request.POST.get("email", "")
            data_pass         = request.POST.get("data_passeio") or None
            horario           = request.POST.get("horario") or None
            num_pessoas       = int(request.POST.get("num_pessoas") or 1)
            valor_bruto       = to_float(request.POST.get("valor_bruto"))
            comissao_agencia  = to_float(request.POST.get("comissao_agencia"))
            forma_pagamento   = request.POST.get("forma_pagamento", "pendente")
            status            = request.POST.get("status", "pendente")
            obs               = request.POST.get("observacoes", "")
            data_pagamento    = request.POST.get("data_pagamento") or None
            mes_referencia    = request.POST.get("mes_referencia", "")
            pix_recebimentos  = request.POST.get("pix_recebimentos", "[]")
            recepcionista_str = request.POST.get("recepcionista", "")
            comissao_recepcao = to_float(request.POST.get("comissao_recepcao"))

            if not all([passeio_id, nome, telefone, data_pass]):
                return JsonResponse({"erro": "Campos obrigatórios faltando"}, status=400)

            passeio = get_object_or_404(Passeio, id=passeio_id, hotel=hotel)

            Reserva.objects.create(
                hotel=hotel, passeio=passeio, nome_cliente=nome, telefone=telefone,
                email=email, data_passeio=data_pass, horario=horario,
                num_pessoas=num_pessoas, valor_bruto=valor_bruto,
                comissao_agencia=comissao_agencia, comissao_recepcao=comissao_recepcao,
                recepcionista=recepcionista_str, forma_pagamento=forma_pagamento,
                status=status, data_pagamento=data_pagamento,
                mes_referencia=mes_referencia, pix_recebimentos=pix_recebimentos,
                observacoes=obs,
            )
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    if request.method == "PATCH" and reserva_id:
        try:
            reserva = get_object_or_404(Reserva, id=reserva_id, hotel=hotel)
            body    = json.loads(request.body)
            for key, value in body.items():
                if hasattr(reserva, key):
                    setattr(reserva, key, value)
            reserva.save()
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    if request.method == "DELETE" and reserva_id:
        get_object_or_404(Reserva, id=reserva_id, hotel=hotel).delete()
        return JsonResponse({"status": "ok"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# RELATÓRIOS
# =========================

@login_required
def relatorio_mensal(request, hotel_slug):
    dados = Reserva.objects.filter(
        hotel__slug=hotel_slug, status='pago', data_reserva__isnull=False
    ).annotate(mes=TruncMonth('data_reserva')).values('mes').annotate(
        total=Count('id'), faturamento=Sum('comissao_recepcao')
    ).order_by('mes')
    return JsonResponse(list(dados), safe=False)


@login_required
def relatorio_passeios(request, hotel_slug):
    dados = Reserva.objects.filter(
        passeio__hotel__slug=hotel_slug, status='pago'
    ).values(nome=F('passeio__nome')).annotate(
        total_vendas=Count('id'), faturamento=Sum('comissao_recepcao')
    ).order_by('-total_vendas')
    return JsonResponse(list(dados), safe=False)


@login_required
def relatorio_comissoes(request, hotel_slug):
    dados = Reserva.objects.filter(
        hotel__slug=hotel_slug, status='pago', comissao_recepcao__gt=0
    ).values('recepcionista').annotate(
        total_comissao=Sum('comissao_recepcao'), qtd_reservas=Count('id')
    ).order_by('-total_comissao')
    return JsonResponse(list(dados), safe=False)


@login_required
def relatorio_cambio(request, hotel_slug):
    qs             = CambioTransacao.objects.filter(hotel__slug=hotel_slug)
    total_lucro    = qs.aggregate(total=Sum('lucro'))['total'] or 0
    total_recebido = qs.aggregate(total=Sum('valor_recebido'))['total'] or 0
    total_pago     = qs.aggregate(total=Sum('valor_reais'))['total'] or 0
    dados          = qs.values('moeda').annotate(total=Sum('lucro'))
    return JsonResponse({
        "resumo": {
            "total_lucro":    float(total_lucro),
            "total_recebido": float(total_recebido),
            "total_pago":     float(total_pago),
        },
        "dados": list(dados),
    })


# =========================
# DIVISÃO DE LUCROS
# =========================

@csrf_exempt
@login_required
def api_divisao(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        try:
            cfg = hotel.divisao
            return JsonResponse({"percentual_hotel": str(cfg.percentual_hotel), "nomes": cfg.get_nomes()})
        except Exception:
            return JsonResponse({"percentual_hotel": "0", "nomes": []})

    if request.method == "POST":
        try:
            body      = json.loads(request.body)
            pct_hotel = float(body.get("percentual_hotel", 0))
            nomes     = body.get("nomes", [])
            cfg, _    = ConfiguracaoDivisao.objects.get_or_create(hotel=hotel)
            cfg.percentual_hotel = pct_hotel
            cfg.set_nomes(nomes)
            cfg.save()
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# ADIANTAMENTOS
# =========================

@csrf_exempt
@login_required
def api_adiantamentos(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        mes = request.GET.get("mes_referencia", "")
        qs  = Adiantamento.objects.filter(hotel=hotel)
        if mes:
            qs = qs.filter(mes_referencia=mes)
        dados = [
            {
                "id":            a.id,
                "rec":           a.recepcionista,
                "valor":         str(a.valor),
                "data":          str(a.data) if a.data else "",
                "mes_referencia": a.mes_referencia,
                "observacao":    a.observacao,
            }
            for a in qs.order_by('-criado_em')
        ]
        return JsonResponse({"adiantamentos": dados})

    if request.method == "POST":
        try:
            body          = json.loads(request.body)
            adiantamentos = body.get("adiantamentos", [])
            mes_ref       = body.get("mes_referencia", "")

            qs = Adiantamento.objects.filter(hotel=hotel)
            if mes_ref:
                qs = qs.filter(mes_referencia=mes_ref)
            qs.delete()

            for a in adiantamentos:
                rec   = (a.get("rec") or "").strip()
                valor = float(a.get("valor") or 0)
                data  = a.get("data") or None
                obs   = a.get("obs") or a.get("observacao") or ""
                mr    = a.get("mes_referencia") or (data[:7] if data else mes_ref)
                if rec and valor > 0:
                    Adiantamento.objects.create(
                        hotel=hotel, recepcionista=rec, valor=valor,
                        data=data, mes_referencia=mr, observacao=obs,
                    )
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# AGENDA
# =========================

@csrf_exempt
@login_required
def api_agenda(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        qs = PasseioAgenda.objects.filter(passeio__hotel=hotel).order_by('data', 'horario')
        dados = [{
            "id":               a.id,
            "passeio_id":       a.passeio_id,
            "passeio__nome":    a.passeio.nome,
            "data":             str(a.data),
            "horario":          str(a.horario),
            "vagas":            a.vagas,
            "vagas_disponiveis": a.vagas_disponiveis,
        } for a in qs]
        return JsonResponse(dados, safe=False)

    if request.method == "POST":
        try:
            PasseioAgenda.objects.create(
                passeio_id=request.POST.get("passeio_id"),
                data=request.POST.get("data") or None,
                horario=request.POST.get("horario") or None,
                vagas=int(request.POST.get("vagas") or 0),
            )
            return JsonResponse({"status": "ok"})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"erro": str(e)}, status=500)

    if request.method == "DELETE":
        agenda_id = request.GET.get('id')
        if agenda_id:
            get_object_or_404(PasseioAgenda, id=agenda_id, passeio__hotel=hotel).delete()
            return JsonResponse({"status": "ok"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# HERO (ADMIN)
# =========================

@csrf_exempt
@login_required
def salvar_hero(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "POST":
        titulo    = request.POST.get("titulo", "").strip()
        subtitulo = request.POST.get("subtitulo", "").strip()
        whatsapp  = request.POST.get("whatsapp", "").strip()

        if titulo:
            hotel.titulo_hero = titulo
        if subtitulo:
            hotel.subtitulo_hero = subtitulo
        if whatsapp:
            hotel.whatsapp = whatsapp

        banner = request.FILES.get('banner')
        if banner:
            hotel.foto_capa = banner

        hotel.save()
        return JsonResponse({"status": "ok"})
    return JsonResponse({"erro": "Método inválido"}, status=405)


@login_required
def obter_hero(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return JsonResponse({
        "titulo":    hotel.titulo_hero,
        "subtitulo": hotel.subtitulo_hero,
        "banner":    get_media_url(hotel.foto_capa),
        "whatsapp":  hotel.whatsapp or "",
    })


@csrf_exempt
@login_required
def forcar_traducao_hotel(request, hotel_slug):
    """Força re-tradução síncrona para recuperação/debug."""
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if not _get_hotel_do_usuario(request, hotel):
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    try:
        campos = {}
        if hotel.titulo_hero:
            campos['titulo_hero_en'] = GoogleTranslator(source='pt', target='en').translate(hotel.titulo_hero)
            campos['titulo_hero_es'] = GoogleTranslator(source='pt', target='es').translate(hotel.titulo_hero)
            campos['titulo_hero_fr'] = GoogleTranslator(source='pt', target='fr').translate(hotel.titulo_hero)
        if hotel.subtitulo_hero:
            campos['subtitulo_hero_en'] = GoogleTranslator(source='pt', target='en').translate(hotel.subtitulo_hero)
            campos['subtitulo_hero_es'] = GoogleTranslator(source='pt', target='es').translate(hotel.subtitulo_hero)
            campos['subtitulo_hero_fr'] = GoogleTranslator(source='pt', target='fr').translate(hotel.subtitulo_hero)

        Hotel.objects.filter(pk=hotel.pk).update(**campos)
        return JsonResponse({"status": "ok", "traduzido": list(campos.keys())})
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({"erro": str(e)}, status=500)