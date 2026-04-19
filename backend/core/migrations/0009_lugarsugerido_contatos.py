from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_lugarsugerido'),
    ]

    operations = [
        migrations.AddField(
            model_name='lugarsugerido',
            name='instagram',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='lugarsugerido',
            name='telefone',
            field=models.CharField(blank=True, max_length=30),
        ),
    ]
