from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Hotel, Passeio, ImagemPasseio
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# --- APIS PÚBLICAS (Acessadas pelo Frontend) ---

@api_view(['GET'])
@permission_classes([AllowAny])
def detalhe_hotel(request, slug):
    try:
        hotel = Hotel.objects.get(slug=slug)
        return Response({
            'nome': hotel.nome,
            'foto_capa': request.build_absolute_uri(hotel.foto_capa.url) if hotel.foto_capa else None
        })
    except Hotel.DoesNotExist:
        return Response({'error': 'Hotel não encontrado'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_passeios(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    passeios = Passeio.objects.filter(hotel=hotel, ativo=True).prefetch_related('fotos')
    
    resultado = []
    for p in passeios:
        resultado.append({
            "id": p.id,
            "nome": p.nome,
            "descricao": p.descricao,
            "nome_en": p.nome_en,
            "descricao_en": p.descricao_en,
            "nome_es": p.nome_es,
            "descricao_es": p.descricao_es,
            "nome_fr": p.nome_fr,
            "descricao_fr": p.descricao_fr,
            "preco": float(p.preco) if p.preco else None,
            "fotos": [
                {"id": f.id, "url": request.build_absolute_uri(f.arquivo.url)} 
                for f in p.fotos.all()
            ]
        })
    return Response(resultado)

# --- VIEWS DE NAVEGAÇÃO ---

def login_view(request):
    if request.method == "POST":
        u = request.POST.get("username")
        p = request.POST.get("password")
        user = authenticate(request, username=u, password=p)
        if user:
            login(request, user)
            return redirect(f'/{user.perfil.hotel.slug}/dashboard/')
        return render(request, 'login.html', {'erro': 'Credenciais inválidas'})
    return render(request, 'login.html')

@login_required
def dashboard(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    if request.user.perfil.hotel != hotel:
        return redirect(f'/{request.user.perfil.hotel.slug}/dashboard/')
    return render(request, 'dashboard.html', {'hotel': hotel})

def logout_view(request):
    logout(request)
    return redirect('login')

# --- API PRIVADA (CRUD do Dashboard) ---

@csrf_exempt
@login_required
def api_passeios(request, hotel_slug, passeio_id=None):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    
    if request.user.perfil.hotel != hotel:
        return JsonResponse({"erro": "Acesso negado"}, status=403)

    if request.method == "DELETE":
        if "foto_id" in request.GET:
            foto = get_object_or_404(ImagemPasseio, id=request.GET.get("foto_id"), passeio__hotel=hotel)
            foto.arquivo.delete()
            foto.delete()
            return JsonResponse({"status": "foto_removida"})
        elif passeio_id:
            passeio = get_object_or_404(Passeio, id=passeio_id, hotel=hotel)
            passeio.delete()
            return JsonResponse({"status": "passeio_removido"})

    if request.method == "POST":
        p_id = request.POST.get("id")
        passeio = get_object_or_404(Passeio, id=p_id, hotel=hotel) if p_id else Passeio(hotel=hotel)
        passeio.nome = request.POST.get("nome")
        passeio.descricao = request.POST.get("descricao")
        passeio.preco = request.POST.get("preco") or None
        passeio.save()

        for f in request.FILES.getlist('imagens'):
            ImagemPasseio.objects.create(passeio=passeio, arquivo=f)
        return JsonResponse({"status": "ok", "id": passeio.id})

    # Retorno padrão para GET (Lista passeios no dashboard)
    return listar_passeios(request, hotel_slug)

@csrf_exempt
@login_required
def atualizar_hotel(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    
    if request.user.perfil.hotel != hotel:
        return JsonResponse({"erro": "Acesso negado"}, status=403)

    if request.method == "POST":
        novo_nome = request.POST.get("nome_hotel")
        if novo_nome:
            hotel.nome = novo_nome
            
        if 'foto_capa' in request.FILES:
            hotel.foto_capa = request.FILES['foto_capa']
        
        hotel.save()

        # Retorna JSON para o JavaScript atualizar a imagem sem recarregar a página
        return JsonResponse({
            "status": "ok",
            "nome": hotel.nome,
            "foto_capa": request.build_absolute_uri(hotel.foto_capa.url) if hotel.foto_capa else None
        })

    return JsonResponse({"erro": "Método não permitido"}, status=405)