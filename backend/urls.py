from django.urls import path, re_path
from . import views

urlpatterns = [
    path('api/map/', views.MapCreate.as_view() ),
    path('update/', views.update),
    path('move/',views.move)
]