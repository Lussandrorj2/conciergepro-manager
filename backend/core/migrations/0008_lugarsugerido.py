from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LugarSugerido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('restaurante', 'Restaurante'), ('shopping', 'Shopping / Compras')], max_length=20)),
                ('nome', models.CharField(max_length=200)),
                ('descricao', models.CharField(blank=True, max_length=300)),
                ('estrelas', models.CharField(blank=True, default='★★★★☆', max_length=10)),
                ('distancia', models.CharField(blank=True, max_length=50)),
                ('horario', models.CharField(blank=True, max_length=200)),
                ('maps_link', models.URLField(blank=True)),
                ('lat', models.FloatField(blank=True, null=True)),
                ('lng', models.FloatField(blank=True, null=True)),
                ('ativo', models.BooleanField(default=True)),
                ('ordem', models.IntegerField(default=0)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('hotel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lugares', to='core.hotel')),
            ],
            options={
                'ordering': ['ordem', 'nome'],
            },
        ),
    ]
