from rest_framework import serializers
from backend.models import Map
class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = '__all__'