from django.shortcuts import render
from backend.models import Map
from backend.serializers import MapSerializer
from rest_framework import generics
from django.http import JsonResponse
from . import config
import json
import random
from django.views.decorators.csrf import csrf_exempt


class MapCreate(generics.ListCreateAPIView):
  queryset = Map.objects.all()
  serializer_class = MapSerializer

@csrf_exempt
def update(request):
  if request.method == "POST":
    data = json.loads(request.body.decode('utf-8'))
    action = data['action']
    gameId = data['gameId']
    if action=="retrieve":
      if not Map.objects.filter(userId=gameId).exists():
        newMap = Map(width=10, height=10, mines=10,userId=gameId,detail = getDetail(10,10,10), revealed='n'*100)
        newMap.save()
      currentMap = Map.objects.get(userId=gameId)
      print(currentMap.revealed);
      print(currentMap.detail);
      return JsonResponse({
        'height':currentMap.height,
        'width':currentMap.width,
        'mines':currentMap.mines,
        'detail':currentMap.detail,
        'revealed':currentMap.revealed
      })
    width = int(data['width'])
    height = int(data['height'])
    mines = int(data['mines'])
    totalNum = width*height
    mines = mines if int(mines)<totalNum else totalNum
    revealed = ['n' for i in range(totalNum)]
    revealed = ''.join(revealed)
    details = getDetail(width, height, mines)
    if action=="reset":
      if not Map.objects.filter(userId=gameId).exists():
        newMap = Map(width=width, height=height, mines=mines,userId=gameId,detail=details,revealed=revealed)
        newMap.save()
      else:
        currentMap = Map.objects.get(userId=gameId)
        currentMap.width = width
        currentMap.height = height
        currentMap.mines = mines
        currentMap.detail = details
        currentMap.revealed = revealed
        currentMap.save()
    
    currentMap = Map.objects.get(userId=gameId)
    return JsonResponse({
      'height':currentMap.height,
      'width':currentMap.width,
      'mines':currentMap.mines,
      'detail':currentMap.detail,
      'revealed':currentMap.revealed
    })

def getDetail(width, height, mines):
  totalNum = width*height
  detailInit = [str(0) for i in range(totalNum)]
  mineIndex = random.sample(range(0, totalNum), mines)
  for i in mineIndex:
    detailInit[i] = str(9)
  return ''.join(detailInit)

  
@csrf_exempt
def move(request):
  if request.method == "POST":
    data = json.loads(request.body.decode('utf-8'))
    gameId = data['gameId']
    revealed = data['revealed']
    status = data['status']
    print(status)
    currentMap = Map.objects.get(userId=gameId)
    currentMap.revealed = revealed
    currentMap.status = status
    currentMap.save()
    return JsonResponse({
      'height':currentMap.height,
      'width':currentMap.width,
      'mines':currentMap.mines,
      'detail':currentMap.detail,
      'revealed':currentMap.revealed
    })