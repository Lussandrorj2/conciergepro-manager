from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Hotel, LogOperacao
from .permissions import requer_gerente

@login_required
@requer_gerente
def dashboard_logs(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    return render(request, 'dashboard/logs.html', {'hotel': hotel})

@login_required
@requer_gerente
def api_logs(request, hotel_slug):
    hotel = get_object_or_404(Hotel, slug=hotel_slug)
    acao  = request.GET.get('acao', '')
    usuario = request.GET.get('usuario', '')
    
    logs = LogOperacao.objects.filter(hotel=hotel).select_related('usuario')
    if acao:
        logs = logs.filter(acao=acao)
    if usuario:
        logs = logs.filter(usuario__username__icontains=usuario)
    
    logs = logs[:200]  # limita os últimos 200
    
    dados = [{
        'id':        l.id,
        'usuario':   l.usuario.username if l.usuario else '(sistema)',
        'acao':      l.acao,
        'descricao': l.descricao,
        'criado_em': l.criado_em.strftime('%d/%m/%Y %H:%M'),
    } for l in logs]
    
    return JsonResponse(dados, safe=False)
