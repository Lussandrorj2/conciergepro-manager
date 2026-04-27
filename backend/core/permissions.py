"""
core/permissions.py
Decorators e helpers de permissão para o sistema multi-tenant.

Uso nas views:
    from .permissions import requer_permissao, requer_gerente

    @login_required
    @requer_permissao('hospedagem')
    def dashboard_hospedagem(request, hotel_slug):
        ...

    @login_required
    @requer_gerente
    def gerenciar_usuarios(request, hotel_slug):
        ...
"""
from functools import wraps
from django.shortcuts import redirect, get_object_or_404
from django.http import JsonResponse
from .models import Hotel


def _get_perfil(request):
    """Retorna o perfil do usuário ou None."""
    try:
        return request.user.perfil
    except Exception:
        return None


def requer_permissao(modulo):
    """
    Decorator que verifica se o usuário tem permissão para o módulo.
    Superusers e gerentes têm acesso automático.
    Redireciona para o dashboard se não tiver permissão.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, hotel_slug, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')

            # Superuser sempre passa
            if request.user.is_superuser or request.user.is_staff:
                return view_func(request, hotel_slug, *args, **kwargs)

            perfil = _get_perfil(request)
            if not perfil:
                return redirect('login')

            # Verifica se o perfil pertence ao hotel da URL
            hotel = get_object_or_404(Hotel, slug=hotel_slug)
            if perfil.hotel != hotel:
                return redirect('login')

            # Verifica se está ativo
            if not perfil.ativo:
                return redirect('login')

            # Gerente tem acesso total
            if perfil.cargo == 'gerente':
                return view_func(request, hotel_slug, *args, **kwargs)

            # Recepcionista: verifica permissão específica
            if not perfil.tem_permissao(modulo):
                return redirect('dashboard_home', hotel_slug=hotel_slug)

            return view_func(request, hotel_slug, *args, **kwargs)
        return wrapper
    return decorator


def requer_gerente(view_func):
    """
    Decorator que exige cargo de gerente (ou superuser).
    Para views de gestão de usuários, configurações críticas etc.
    """
    @wraps(view_func)
    def wrapper(request, hotel_slug, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')

        if request.user.is_superuser or request.user.is_staff:
            return view_func(request, hotel_slug, *args, **kwargs)

        perfil = _get_perfil(request)
        if not perfil or not perfil.ativo:
            return redirect('login')

        hotel = get_object_or_404(Hotel, slug=hotel_slug)
        if perfil.hotel != hotel:
            return redirect('login')

        if perfil.cargo != 'gerente':
            return redirect('dashboard_home', hotel_slug=hotel_slug)

        return view_func(request, hotel_slug, *args, **kwargs)
    return wrapper


def requer_permissao_api(modulo):
    """
    Decorator para views de API (retorna JSON 403 em vez de redirect).
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, hotel_slug, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'erro': 'Não autenticado'}, status=401)

            if request.user.is_superuser or request.user.is_staff:
                return view_func(request, hotel_slug, *args, **kwargs)

            perfil = _get_perfil(request)
            if not perfil or not perfil.ativo:
                return JsonResponse({'erro': 'Sem permissão'}, status=403)

            hotel = get_object_or_404(Hotel, slug=hotel_slug)
            if perfil.hotel != hotel:
                return JsonResponse({'erro': 'Sem permissão'}, status=403)

            if not perfil.tem_permissao(modulo):
                return JsonResponse({'erro': 'Sem permissão para este módulo'}, status=403)

            return view_func(request, hotel_slug, *args, **kwargs)
        return wrapper
    return decorator


def requer_gerente_api(view_func):
    """Decorator para APIs que exigem cargo gerente."""
    @wraps(view_func)
    def wrapper(request, hotel_slug, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'erro': 'Não autenticado'}, status=401)
        if request.user.is_superuser or request.user.is_staff:
            return view_func(request, hotel_slug, *args, **kwargs)
        perfil = _get_perfil(request)
        if not perfil or not perfil.ativo:
            return JsonResponse({'erro': 'Sem permissão'}, status=403)
        hotel = get_object_or_404(Hotel, slug=hotel_slug)
        if perfil.hotel != hotel:
            return JsonResponse({'erro': 'Sem permissão'}, status=403)
        if perfil.cargo != 'gerente':
            return JsonResponse({'erro': 'Apenas gerentes podem realizar esta ação'}, status=403)
        return view_func(request, hotel_slug, *args, **kwargs)
    return wrapper


def get_contexto_usuario(request, hotel):
    """
    Retorna dicionário com dados do usuário para os templates.
    Usado em todas as views para popular o menu e verificar permissões no template.
    """
    perfil = _get_perfil(request)
    if not perfil:
        return {'is_gerente': False, 'modulos': [], 'perfil': None}

    return {
        'perfil':     perfil,
        'is_gerente': perfil.is_gerente() or request.user.is_superuser,
        'modulos':    perfil.modulos_disponiveis(),
        'cargo':      perfil.cargo,
    }