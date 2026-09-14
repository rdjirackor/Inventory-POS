from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path("login/",login),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("me/",me),


    path("dashboard/", dashboard),

    path("categories/", categories),
    path("categories/<int:category_id>/", category_detail),

    path("discounts/", discounts),
    path("discounts/<int:discount_id>/", discount_detail),

    path("taxtypes/", taxtypes),
    path("taxtypes/<int:taxtype_id>/", taxtype_details),

    path("warehouses/", warehouses),
    path("warehouses/<int:warehouse_id>/", warehouse_detail),

    path("products/", products),
    path("products/<int:product_id>/", product_detail),

    path("suppliers/", suppliers),
    path("suppliers/<int:supplier_id>/", supplier_detail),

    path("purchase-orders/", purchase_orders),
    path(
        "purchase-orders/<int:purchase_order_id>/",
        purchase_order_detail
    ),

    path("purchase-order-items/", purchase_order_items),
    path(
        "purchase-order-items/<int:item_id>/",
        purchase_order_item_detail
    ),

    path("customers/", customers),
    path("customers/<int:customer_id>/", customer_detail),

    path("branches/", branches),
    path("branches/<int:branch_id>/", branch_detail),

    path("cashiers/", cashiers),
    path("cashiers/<int:cashier_id>/", cashier_detail),

    path("settings/", settings),

    path("notifications/", notifications),

    path("announcements/", announcements),
    path(
        "announcements/<int:announcement_id>/",
        announcement_detail
    ),

    path("payments/", payments),
  
    
]
