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

# This is the function to reset a game or retrieve an old game
# depending on the date['action']
def update(request):
  if request.method == "POST":
    data = json.loads(request.body.decode('utf-8'))
    action = data['action']
    gameId = data['gameId']
    if action=="retrieve":                          # if we can not find a game, we can new a game 
      if not Map.objects.filter(userId=gameId).exists():
        newMap = Map(width=10, height=10, mines=10,userId=gameId,detail = getDetail(10,10,10), revealed='n'*100)
        newMap.save()
      currentMap = Map.objects.get(userId=gameId)   # if we find the game, we return the game
      return JsonResponse({
        'height':currentMap.height,
        'width':currentMap.width,
        'mines':currentMap.mines,
        'detail':currentMap.detail,
        'revealed':currentMap.revealed,
        'status':currentMap.status
      })
    width = int(data['width'])                     # The following is reset part
    height = int(data['height'])                   # Using the information from client 
    mines = int(data['mines'])                     # To create a new game
    totalNum = width*height
    mines = mines if int(mines)<totalNum/2 else int(totalNum/2)
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
        currentMap.status = "Pending"
        currentMap.save()
    
    currentMap = Map.objects.get(userId=gameId)
    return JsonResponse({
      'height':currentMap.height,
      'width':currentMap.width,
      'mines':currentMap.mines,
      'detail':currentMap.detail,
      'revealed':currentMap.revealed,
      'status':currentMap.status
    })
    
# this is a helper function
# 9 in details meaning this place is a mine
def getDetail(width, height, mines):
  totalNum = width*height
  detailInit = [str(0) for i in range(totalNum)]
  mineIndex = random.sample(range(0, totalNum), mines)
  for i in mineIndex:
    detailInit[i] = str(9)
  return ''.join(detailInit)

# Every time the player click on the button
# The server records the updated information
def move(request):
  if request.method == "POST":
    data = json.loads(request.body.decode('utf-8'))
    gameId = data['gameId']
    revealed = data['revealed']
    status = data['status']
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