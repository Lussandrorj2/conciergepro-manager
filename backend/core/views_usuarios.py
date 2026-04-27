"""
core/views_usuarios.py
Views para gestão de usuários (gerente cria/edita/remove recepcionistas).
Inclui API JSON para o frontend.
"""
import json
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import transaction

from .models import Hotel, Perfil, MODULOS
from .permissions import requer_gerente, requer_gerente_api


# ──────────────────────────────────────────
# PÁGINA DE GESTÃO DE USUÁRIOS
# ──────────────────────────────────────────
@login_required
@requer_gerente
def gerenciar_usuarios(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/gerenciar_usuarios.html', {
        'hotel':   hotel,
        'modulos': MODULOS,
    })


# ──────────────────────────────────────────
# API — LISTAR USUÁRIOS DO HOTEL
# ──────────────────────────────────────────
@login_required
@requer_gerente_api
def api_usuarios_lista(request, hotel_slug):
    hotel   = get_object_or_404(Hotel, slug=hotel_slug)
    perfis  = Perfil.objects.filter(hotel=hotel).select_related('user').order_by('cargo', 'user__username')

    dados = []
    for p in perfis:
        dados.append({
            'id':            p.user.id,
            'username':      p.user.username,
            'nome_completo': p.nome_completo or p.user.get_full_name(),
            'email':         p.user.email,
            'telefone':      p.telefone,
            'cargo':         p.cargo,
            'cargo_label':   p.get_cargo_display(),
            'ativo':         p.ativo,
            'permissoes':    p.get_permissoes(),
            'criado_em':     p.criado_em.strftime('%d/%m/%Y') if p.criado_em else '',
        })

    return JsonResponse(dados, safe=False)


# ──────────────────────────────────────────
# API — CRIAR USUÁRIO
# ──────────────────────────────────────────
@csrf_exempt
@login_required
@requer_gerente_api
def api_usuario_criar(request, hotel_slug):
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método inválido'}, status=405)

    hotel = get_object_or_404(Hotel, slug=hotel_slug)

    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'erro': 'JSON inválido'}, status=400)

    username      = (body.get('username') or '').strip()
    password      = (body.get('password') or '').strip()
    nome_completo = (body.get('nome_completo') or '').strip()
    email         = (body.get('email') or '').strip()
    telefone      = (body.get('telefone') or '').strip()
    cargo         = body.get('cargo', 'recepcionista')
    permissoes    = body.get('permissoes', [])

    # Validações
    if not username:
        return JsonResponse({'erro': 'Username obrigatório'}, status=400)
    if not password or len(password) < 6:
        return JsonResponse({'erro': 'Senha deve ter ao menos 6 caracteres'}, status=400)
    if cargo not in ('gerente', 'recepcionista'):
        return JsonResponse({'erro': 'Cargo inválido'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'erro': 'Username já existe'}, status=400)

    # Valida módulos
    modulos_validos = [m[0] for m in MODULOS]
    permissoes = [p for p in permissoes if p in modulos_validos]

    try:
        with transaction.atomic():
            # Cria o User
            partes = nome_completo.split(' ', 1)
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=partes[0] if partes else '',
                last_name=partes[1] if len(partes) > 1 else '',
            )

            # Atualiza o Perfil (criado pelo signal)
            perfil = user.perfil
            perfil.hotel         = hotel
            perfil.cargo         = cargo
            perfil.nome_completo = nome_completo
            perfil.telefone      = telefone
            perfil.ativo         = True
            perfil.set_permissoes(permissoes if cargo == 'recepcionista' else [])
            perfil.save()

        return JsonResponse({
            'status': 'ok',
            'id':     user.id,
            'msg':    f'Usuário {username} criado com sucesso!'
        })

    except Exception as e:
        return JsonResponse({'erro': str(e)}, status=500)


# ──────────────────────────────────────────
# API — EDITAR USUÁRIO
# ──────────────────────────────────────────
@csrf_exempt
@login_required
@requer_gerente_api
def api_usuario_editar(request, hotel_slug, user_id):
    if request.method not in ('PUT', 'PATCH'):
        return JsonResponse({'erro': 'Método inválido'}, status=405)

    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    user  = get_object_or_404(User, id=user_id)

    # Garante que o usuário pertence ao hotel
    try:
        perfil = user.perfil
        if perfil.hotel != hotel:
            return JsonResponse({'erro': 'Usuário não pertence a este hotel'}, status=403)
    except Exception:
        return JsonResponse({'erro': 'Perfil não encontrado'}, status=404)

    # Não permite editar o próprio usuário via esta API (use o perfil)
    if user == request.user:
        return JsonResponse({'erro': 'Use as configurações de perfil para editar seu próprio usuário'}, status=400)

    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'erro': 'JSON inválido'}, status=400)

    # Campos editáveis
    if 'nome_completo' in body:
        perfil.nome_completo = body['nome_completo'].strip()
        partes = perfil.nome_completo.split(' ', 1)
        user.first_name = partes[0] if partes else ''
        user.last_name  = partes[1] if len(partes) > 1 else ''

    if 'email' in body:
        user.email = body['email'].strip()

    if 'telefone' in body:
        perfil.telefone = body['telefone'].strip()

    if 'cargo' in body and body['cargo'] in ('gerente', 'recepcionista'):
        perfil.cargo = body['cargo']

    if 'ativo' in body:
        perfil.ativo = bool(body['ativo'])

    if 'permissoes' in body:
        modulos_validos = [m[0] for m in MODULOS]
        perms = [p for p in body['permissoes'] if p in modulos_validos]
        perfil.set_permissoes(perms)

    # Troca de senha (opcional)
    if body.get('password'):
        if len(body['password']) < 6:
            return JsonResponse({'erro': 'Senha deve ter ao menos 6 caracteres'}, status=400)
        user.set_password(body['password'])

    try:
        with transaction.atomic():
            user.save()
            perfil.save()
        return JsonResponse({'status': 'ok', 'msg': 'Usuário atualizado com sucesso!'})
    except Exception as e:
        return JsonResponse({'erro': str(e)}, status=500)


# ──────────────────────────────────────────
# API — DELETAR USUÁRIO
# ──────────────────────────────────────────
@csrf_exempt
@login_required
@requer_gerente_api
def api_usuario_deletar(request, hotel_slug, user_id):
    if request.method != 'DELETE':
        return JsonResponse({'erro': 'Método inválido'}, status=405)

    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    user  = get_object_or_404(User, id=user_id)

    # Não permite deletar a si mesmo
    if user == request.user:
        return JsonResponse({'erro': 'Não é possível deletar o próprio usuário'}, status=400)

    try:
        perfil = user.perfil
        if perfil.hotel != hotel:
            return JsonResponse({'erro': 'Usuário não pertence a este hotel'}, status=403)
    except Exception:
        return JsonResponse({'erro': 'Perfil não encontrado'}, status=404)

    username = user.username
    user.delete()
    return JsonResponse({'status': 'ok', 'msg': f'Usuário {username} removido.'})


# ──────────────────────────────────────────
# API — TOGGLE ATIVO/INATIVO
# ──────────────────────────────────────────
@csrf_exempt
@login_required
@requer_gerente_api
def api_usuario_toggle_ativo(request, hotel_slug, user_id):
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método inválido'}, status=405)

    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    user  = get_object_or_404(User, id=user_id)

    if user == request.user:
        return JsonResponse({'erro': 'Não é possível desativar o próprio usuário'}, status=400)

    try:
        perfil = user.perfil
        if perfil.hotel != hotel:
            return JsonResponse({'erro': 'Usuário não pertence a este hotel'}, status=403)
        perfil.ativo = not perfil.ativo
        perfil.save()
        status_label = 'ativado' if perfil.ativo else 'desativado'
        return JsonResponse({'status': 'ok', 'ativo': perfil.ativo, 'msg': f'Usuário {status_label}.'})
    except Exception as e:
        return JsonResponse({'erro': str(e)}, status=500)