from .models import LogOperacao

def registrar_log(hotel, usuario, acao, descricao, dados_extra=None):
    """
    Registra uma operação no log do sistema.
    
    Ações sugeridas:
      'criar_reserva', 'editar_reserva', 'deletar_reserva', 'pagar_reserva'
      'criar_cambio', 'editar_cambio', 'deletar_cambio'
      'criar_usuario', 'editar_usuario', 'deletar_usuario', 'toggle_usuario'
      'checkout', 'login', 'logout'
    """
    try:
        LogOperacao.objects.create(
            hotel=hotel,
            usuario=usuario,
            acao=acao,
            descricao=descricao,
            dados_extra=dados_extra or {},
        )
    except Exception as e:
        print(f"[LOG ERROR] {e}")
