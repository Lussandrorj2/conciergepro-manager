from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json

from .models import (
    Hotel, Passeio, ImagemPasseio, Hero,
    Reserva, CambioTransacao, PasseioAgenda
)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth


# =========================
# HOME
# =========================
def home(request):
    slug = request.GET.get('hotel')
    hotel = get_object_or_404(Hotel, slug=slug) if slug else None
    return render(request, 'index.html', {'hotel': hotel})


# =========================
# API PÚBLICA — HOTEL
# Retorna título/subtítulo no idioma solicitado via ?lang=
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def detalhe_hotel(request, slug):
    hotel = get_object_or_404(Hotel, slug=slug)
    lang  = request.GET.get('lang', 'pt')

    # Seleciona título e subtítulo no idioma certo, com fallback para PT
    if lang == 'en':
        titulo    = hotel.titulo_hero_en    or hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero_en or hotel.subtitulo_hero
    elif lang == 'es':
        titulo    = hotel.titulo_hero_es    or hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero_es or hotel.subtitulo_hero
    elif lang == 'fr':
        titulo    = hotel.titulo_hero_fr    or hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero_fr or hotel.subtitulo_hero
    else:  # pt (padrão)
        titulo    = hotel.titulo_hero
        subtitulo = hotel.subtitulo_hero

    return Response({
        "nome":          hotel.nome,
        "titulo_hero":   titulo,
        "subtitulo_hero": subtitulo,
        "foto_capa":     request.build_absolute_uri(hotel.foto_capa.url) if hotel.foto_capa else None,
        "whatsapp":      hotel.whatsapp or "5521999999999",
    })


# =========================
# API PÚBLICA — PASSEIOS
# Retorna nome/descrição no idioma certo e URLs absolutas para imagens
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])
def listar_passeios(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    lang  = request.GET.get('lang', 'pt')

    passeios = Passeio.objects.filter(
        hotel=hotel,
        ativo=True
    ).prefetch_related('fotos')

    resultado = []
    for p in passeios:
        # Seleciona nome e descrição traduzidos, com fallback para PT
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

        # URL absoluta do banner (garante que funcione em qualquer ambiente)
        banner_url = None
        if p.banner:
            try:
                banner_url = request.build_absolute_uri(p.banner.url)
            except Exception:
                banner_url = None

        resultado.append({
            "id":                p.id,
            "nome":              nome,
            "descricao":         descricao,
            "preco":             float(p.preco) if p.preco else 0,
            "preco_sob_consulta": p.preco_sob_consulta,
            "preco_por_pessoa":  p.preco_por_pessoa,
            "banner":            banner_url,
            "fotos": [
                {
                    "id":  f.id,
                    "url": request.build_absolute_uri(f.arquivo.url)
                }
                for f in p.fotos.all()
            ]
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
            password=request.POST.get("password")
        )
        if user:
            login(request, user)
            if hasattr(user, 'perfil') and user.perfil.hotel:
                return redirect(f'/{user.perfil.hotel.slug}/dashboard/')
        return render(request, 'login.html', {'erro': 'Login inválido'})
    return render(request, 'login.html')


def logout_view(request):
    logout(request)
    return redirect('login')


# =========================
# DASHBOARD (PÁGINAS)
# =========================
@login_required
def dashboard_home(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/dashboard_home.html', {'hotel': hotel})


@login_required
def dashboard_criar(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, "dashboard/criar_passeios.html", {'hotel': hotel})


@login_required
def dashboard_listar(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/gerenciar_passeios.html', {'hotel': hotel})


@login_required
def dashboard_relatorios(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/relatorios.html', {'hotel': hotel})


@login_required
def dashboard_config(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/configuracoes.html', {'hotel': hotel})


@login_required
def dashboard_agenda(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/agenda_passeios.html', {'hotel': hotel})


@login_required
def dashboard_reservas(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/reservas.html', {'hotel': hotel})


@login_required
def dashboard_cambio(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/cambio.html', {'hotel': hotel})


# =========================
# PASSEIOS CRUD (ADMIN)
# =========================
@csrf_exempt
@login_required
def api_passeios(request, hotel_slug, passeio_id=None):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    if request.user.perfil.hotel != hotel:
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        if passeio_id:
            p = get_object_or_404(Passeio, id=passeio_id, hotel=hotel)
            return JsonResponse({
                "id":                p.id,
                "nome":              p.nome,
                "descricao":         p.descricao,
                "preco":             str(p.preco) if p.preco else "",
                "preco_sob_consulta": p.preco_sob_consulta,
                "preco_por_pessoa":  p.preco_por_pessoa,
                # URL absoluta para imagens individuais também
                "banner": request.build_absolute_uri(p.banner.url) if p.banner else None,
                "fotos": [
                    {
                        "id":  f.id,
                        "url": request.build_absolute_uri(f.arquivo.url)
                    }
                    for f in p.fotos.all()
                ],
            })

        passeios = Passeio.objects.filter(hotel=hotel).prefetch_related('fotos')
        return JsonResponse([{
            "id":                p.id,
            "nome":              p.nome,
            "descricao":         p.descricao,
            "preco":             float(p.preco) if p.preco else 0,
            "preco_sob_consulta": p.preco_sob_consulta,
            "preco_por_pessoa":  p.preco_por_pessoa,
            # URL absoluta para não quebrar no dashboard
            "banner": request.build_absolute_uri(p.banner.url) if p.banner else None,
            "fotos": [
                {
                    "id":  f.id,
                    "url": request.build_absolute_uri(f.arquivo.url)
                }
                for f in p.fotos.all()
            ]
        } for p in passeios], safe=False)

    if request.method == "POST":
        passeio = (
            get_object_or_404(Passeio, id=passeio_id, hotel=hotel)
            if passeio_id else Passeio(hotel=hotel)
        )
        passeio.nome              = request.POST.get("nome")
        passeio.descricao         = request.POST.get("descricao")
        passeio.preco_sob_consulta = request.POST.get("preco_sob_consulta") == "true"
        passeio.preco_por_pessoa  = request.POST.get("preco_por_pessoa") == "true"

        if passeio.preco_sob_consulta:
            passeio.preco = None
        else:
            try:
                passeio.preco = float(request.POST.get("preco") or 0)
            except (ValueError, TypeError):
                passeio.preco = 0

        # Banner principal (campo banner do modelo)
        banner = request.FILES.get('banner')
        if banner:
            passeio.banner = banner

        passeio.save()

        # Imagens adicionais da galeria
        for f in request.FILES.getlist('imagens'):
            ImagemPasseio.objects.create(passeio=passeio, arquivo=f)

        return JsonResponse({"status": "ok", "id": passeio.id})

    if request.method == "DELETE":
        passeio = get_object_or_404(Passeio, id=passeio_id, hotel=hotel)
        passeio.delete()
        return JsonResponse({"status": "removido"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# CÂMBIO
# =========================
@csrf_exempt
@login_required
def api_cambio(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    if request.user.perfil.hotel != hotel:
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        transacoes = CambioTransacao.objects.filter(hotel=hotel).order_by('-data').values(
            "id", "moeda", "valor", "cotacao_usada", "valor_reais", "lucro", "data"
        )
        return JsonResponse(list(transacoes), safe=False)

    if request.method == "POST":
        try:
            moeda          = request.POST.get("moeda")
            valor          = float(request.POST.get("valor") or 0)
            cotacao        = float(request.POST.get("cotacao") or 0)
            lucro_percent  = float(request.POST.get("lucro_percent") or 0)

            valor_reais = valor * cotacao
            lucro       = valor_reais * (lucro_percent / 100)

            CambioTransacao.objects.create(
                hotel=hotel,
                moeda=moeda,
                valor=valor,
                cotacao_usada=cotacao,
                valor_reais=valor_reais,
                lucro=lucro
            )
            return JsonResponse({"status": "ok"})
        except Exception as e:
            return JsonResponse({"erro": str(e)}, status=500)

    return JsonResponse({"erro": "Método inválido"}, status=400)


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

        if request.user.perfil.hotel != imagem.passeio.hotel:
            return JsonResponse({"erro": "Sem permissão"}, status=403)

        imagem.delete()
        return JsonResponse({"status": "ok"})
    except Exception as e:
        return JsonResponse({"erro": str(e)}, status=500)


# =========================
# RESERVAS (PÚBLICO)
# — agora apenas registra no banco; o redirect WhatsApp fica no frontend
# =========================
@api_view(['POST'])
@permission_classes([AllowAny])
def criar_reserva(request, hotel_slug):
    try:
        hotel = Hotel.objects.get(slug=hotel_slug)

        agenda_id  = request.data.get("agenda_id")
        nome       = request.data.get("nome")
        telefone   = request.data.get("telefone")
        qtd        = int(request.data.get("qtd_pessoas", 1))

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
            qtd_pessoas=qtd,
            valor_total=valor_total
        )

        return Response({"status": "ok", "valor_total": float(valor_total)})
    except Exception as e:
        return Response({"erro": str(e)}, status=500)


# =========================
# RESERVAS (ADMIN)
# =========================
@csrf_exempt
@login_required
def api_reservas(request, hotel_slug, reserva_id=None):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    if request.user.perfil.hotel != hotel:
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        qs = Reserva.objects.filter(hotel=hotel).order_by('-data_reserva')

        status_filtro = request.GET.get('status')
        if status_filtro:
            qs = qs.filter(status=status_filtro)

        dados = []
        for r in qs:
            agenda = r.passeio_agenda
            dados.append({
                "id":            r.id,
                "nome_cliente":  r.nome_cliente,
                "telefone":      r.telefone,
                "qtd_pessoas":   r.qtd_pessoas,
                "valor_total":   str(r.valor_total),
                "status":        r.status,
                "data_reserva":  r.data_reserva.strftime('%d/%m/%Y %H:%M') if r.data_reserva else '—',
                "passeio_nome":  agenda.passeio.nome if agenda else '—',
                "data":          agenda.data.strftime('%d/%m/%Y') if agenda and agenda.data else '—',
                "horario":       str(agenda.horario) if agenda and agenda.horario else '—',
            })

        return JsonResponse(dados, safe=False)

    if request.method == "PATCH" and reserva_id:
        try:
            reserva    = get_object_or_404(Reserva, id=reserva_id, hotel=hotel)
            data       = json.loads(request.body)
            novo_status = data.get("status")
            if novo_status in ['pendente', 'confirmada', 'cancelada']:
                reserva.status = novo_status
                reserva.save(update_fields=['status'])
            return JsonResponse({"status": "ok"})
        except Exception as e:
            return JsonResponse({"erro": str(e)}, status=500)

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# AGENDA
# =========================
@csrf_exempt
@login_required
def api_agenda(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    if request.user.perfil.hotel != hotel:
        return JsonResponse({"erro": "Sem permissão"}, status=403)

    if request.method == "GET":
        passeio_id = request.GET.get('passeio_id')
        qs = PasseioAgenda.objects.filter(
            passeio__hotel=hotel
        ).order_by('data', 'horario')

        if passeio_id:
            qs = qs.filter(passeio_id=passeio_id)

        dados = []
        for a in qs:
            dados.append({
                "id":               a.id,
                "passeio":          a.passeio_id,      # ← campo "passeio" (int) para o JS filtrar
                "passeio_id":       a.passeio_id,
                "passeio__nome":    a.passeio.nome,
                "data":             str(a.data)    if a.data    else None,
                "horario":          str(a.horario) if a.horario else None,
                "vagas":            a.vagas,
                "vagas_disponiveis": a.vagas_disponiveis,
            })

        return JsonResponse(dados, safe=False)

    if request.method == "POST":
        try:
            PasseioAgenda.objects.create(
                passeio_id=request.POST.get("passeio_id"),
                data=request.POST.get("data")    or None,
                horario=request.POST.get("horario") or None,
                vagas=int(request.POST.get("vagas") or 0)
            )
            return JsonResponse({"status": "ok"})
        except Exception as e:
            return JsonResponse({"erro": str(e)}, status=500)

    if request.method == "DELETE":
        agenda_id = request.GET.get('id') or request.POST.get('id')
        if agenda_id:
            get_object_or_404(
                PasseioAgenda, id=agenda_id, passeio__hotel=hotel
            ).delete()
            return JsonResponse({"status": "ok"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


# =========================
# HERO (ADMIN)
# =========================
@csrf_exempt
@login_required
def salvar_hero(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    if request.method == "POST":
        titulo    = request.POST.get("titulo")
        subtitulo = request.POST.get("subtitulo")
        whatsapp  = request.POST.get("whatsapp")
        banner    = request.FILES.get('banner')

        if titulo    is not None: hotel.titulo_hero    = titulo
        if subtitulo is not None: hotel.subtitulo_hero = subtitulo
        if whatsapp:              hotel.whatsapp       = whatsapp
        if banner:                hotel.foto_capa      = banner

        hotel.save()
        return JsonResponse({"status": "ok"})

    return JsonResponse({"erro": "Método inválido"}, status=405)


@login_required
def obter_hero(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return JsonResponse({
        "titulo":    hotel.titulo_hero,
        "subtitulo": hotel.subtitulo_hero,
        "banner":    request.build_absolute_uri(hotel.foto_capa.url) if hotel.foto_capa else None,
        "whatsapp":  hotel.whatsapp,
    })


# =========================
# RELATÓRIOS (API)
# =========================
@login_required
def relatorio_mensal(request, hotel_slug):
    dados = Reserva.objects.filter(
        hotel__slug=hotel_slug,
        data_reserva__isnull=False
    ).annotate(
        mes=TruncMonth('data_reserva')
    ).values('mes').annotate(
        total=Count('id'),
        faturamento=Sum('valor_total')
    ).order_by('mes')

    return JsonResponse(list(dados), safe=False)


@login_required
def relatorio_passeios(request, hotel_slug):
    dados = Reserva.objects.filter(
        passeio_agenda__passeio__hotel__slug=hotel_slug
    ).values(
        nome=F('passeio_agenda__passeio__nome')
    ).annotate(
        total_vendas=Count('id')
    ).order_by('-total_vendas')

    return JsonResponse(list(dados), safe=False)


@login_required
def relatorio_cambio(request, hotel_slug):
    dados = CambioTransacao.objects.filter(
        hotel__slug=hotel_slug
    ).values('moeda').annotate(
        total=Sum('lucro')
    )
    return JsonResponse(list(dados), safe=False)