# Generated by Django 2.1.1 on 2019-03-10 15:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_map_gameid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='map',
            name='gameId',
        ),
        migrations.AddField(
            model_name='map',
            name='password',
            field=models.CharField(default='123456', max_length=30),
        ),
        migrations.AddField(
            model_name='map',
            name='userId',
            field=models.CharField(default='player', max_length=30),
        ),
        migrations.AlterField(
            model_name='map',
            name='detail',
            field=models.CharField(default='1000000000', max_length=400),
        ),
        migrations.AlterField(
            model_name='map',
            name='height',
            field=models.IntegerField(default=5),
        ),
        migrations.AlterField(
            model_name='map',
            name='mines',
            field=models.IntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='map',
            name='width',
            field=models.IntegerField(default=2),
        ),
    ]