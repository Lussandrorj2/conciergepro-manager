from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_hotel_lat_lng'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hotel',
            name='lat',
        ),
        migrations.RemoveField(
            model_name='hotel',
            name='lng',
        ),
        migrations.AddField(
            model_name='hotel',
            name='mapa_embed',
            field=models.TextField(blank=True, help_text='Cole aqui o link embed do Google Maps'),
        ),
    ]
