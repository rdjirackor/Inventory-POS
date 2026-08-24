from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated

from .models import *
from .serializers import *


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
#okay now lemme write the setting api first, seems the most straightforward one

@api_view(["GET"])
def settings(request):
    setting = Settings.objects.first()
    serializer = SettingsSerializer(setting)
    return Response(serializer.data)

@api_view(["PUT"])
def settings(request):
    setting = Settings.objects.first()

    serializer = SettingsSerializer(
        setting,
        data = request.data,
        partial = True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(
        serializer.errors,
        status=400
    )

@api_view(["GET"])
def notifications(request):
    notification = Notification.objects.all()
    
    serializer = NotificationSerializer(
        notification, many =True 
    )

    return Response(
        serializer.data
    )

@api_view(["GET", "POST"])
def categories(request):

    if request.method == "GET":

        categories = Category.objects.all()

        serializer = CategorySerializer(
            categories,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = CategorySerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )
    
@api_view(["GET", "PUT", "PATCH", "DELETE"])
def category_detail(request, category_id):

    try:
        category = Category.objects.get(id=category_id)

    except Category.DoesNotExist:
        return Response(
            {"error": "Category does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = CategorySerializer(category)

        return Response(serializer.data)


    elif request.method == "PUT":

        serializer = CategorySerializer(
            category,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )


    elif request.method == "PATCH":

        serializer = CategorySerializer(
            category,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )


    elif request.method == "DELETE":

        category.delete()

        return Response(
            status=204
        )


