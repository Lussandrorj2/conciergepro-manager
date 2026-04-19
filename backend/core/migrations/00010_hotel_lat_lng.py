from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_lugarsugerido_contatos'),
    ]

    operations = [
        migrations.AddField(
            model_name='hotel',
            name='lat',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hotel',
            name='lng',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
