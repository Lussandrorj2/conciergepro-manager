'''import os
import re
from core.models import PasseioGlobal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS_PATH = os.path.join(BASE_DIR, '..', 'frontend', 'static', 'js', 'data.js')


def carregar_data_js():
    with open(DATA_JS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # divide cada tour pelo id
    partes = content.split("id:")

    tours = []

    for parte in partes[1:]:  # ignora o primeiro pedaço
        # pega id
        id_match = re.search(r'"(.*?)"', parte)
        if not id_match:
            continue

        tour_id = id_match.group(1)

        # pega bloco info
        info_match = re.search(r'info:\s*\{(.*?)\}', parte, re.DOTALL)
        info_block = info_match.group(1) if info_match else ""

        def get_lang(lang):
            m = re.search(rf'{lang}:\s*"(.*?)"', info_block)
            return m.group(1) if m else ""

        tours.append({
            "id": tour_id,
            "info": {
                "pt": get_lang("pt"),
                "en": get_lang("en"),
                "es": get_lang("es"),
                "fr": get_lang("fr"),
            }
        })

    return tours


def formatar_titulo(tour_id):
    return tour_id.replace("-", " ").title()


def seed_passeios():
    tours = carregar_data_js()

    for t in tours:
        PasseioGlobal.objects.update_or_create(
            tour_id=t["id"],
            defaults={
                "titulo_pt": formatar_titulo(t["id"]),
                "titulo_en": formatar_titulo(t["id"]),
                "titulo_es": formatar_titulo(t["id"]),
                "titulo_fr": formatar_titulo(t["id"]),

                "descricao_pt": t["info"]["pt"],
                "descricao_en": t["info"]["en"],
                "descricao_es": t["info"]["es"],
                "descricao_fr": t["info"]["fr"],
            }
        )

    print(f"✅ {len(tours)} passeios importados com sucesso!")'''