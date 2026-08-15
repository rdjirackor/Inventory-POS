from django.urls import path
from .views import hello, login, me

urlpatterns = [
    path("login/",login),
    path("me/",me),
    
]
