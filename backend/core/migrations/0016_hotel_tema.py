from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_logoperacao'),
    ]

    operations = [
        migrations.AddField(
            model_name='hotel',
            name='tema_id',
            field=models.CharField(blank=True, default='gold', max_length=30),
        ),
        migrations.AddField(
            model_name='hotel',
            name='tema_vars',
            field=models.TextField(blank=True, default=''),
        ),
    ]
