from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_hotel_mapa_embed'),
    ]

    operations = [
        migrations.AddField(
            model_name='configuracaodivisao',
            name='pcts_json',
            field=models.TextField(blank=True, default='[]'),
        ),
    ]
