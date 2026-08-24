from django.urls import path
from .views import *

urlpatterns = [
    path("login/",login),
    path("me/",me),
    path("categories/", categories),
    path("categories/<int:category_id>/", category_detail),

    
]
