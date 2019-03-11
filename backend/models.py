from django.db import models
from . import config
# Create your models here.
class Map(models.Model):
    width = models.IntegerField(default=2)
    height = models.IntegerField(default=5)
    mines = models.IntegerField(default=1)
    detail = models.CharField(max_length=400,default="1000000000")
    userId = models.CharField(max_length=30,default="player")
    password = models.CharField(max_length=30, default="123456")
    revealed = models.CharField(max_length=400, default="nnnnnnnnnn")
    status = models.CharField(default="Pending",max_length=10)
