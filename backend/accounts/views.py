from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated


@api_view(["GET"])
def hello(request):
    return Response({ 
        "message":"W!"})
  
    
@api_view(["POST"]) 
def login(request):
    username = request.data.get("username")    
    password = request.data.get("password")             
    
    user = authenticate(username=username, password=password)

    if user is None:
        return Response({
            "message": "Invalid credentials"
            }, status=401)
    refresh = RefreshToken.for_user(user)
    
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,

    })
