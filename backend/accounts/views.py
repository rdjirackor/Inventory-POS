from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .permissions import require_model_permissions

from django.utils import timezone
from datetime import timedelta

from django.db.models.deletion import ProtectedError

from decimal import Decimal, InvalidOperation
from django.db import transaction
from django.db.models import Sum

from rest_framework import status

from django.contrib.auth.models import User

from .models import *
from .serializers import *  

from .audit import log_action
from .notify import *



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def users(request):
    queryset = User.objects.all().order_by("username")
    serializer = UserSerializer(queryset, many=True)
    return Response(serializer.data)
    
@api_view(["POST"]) 
def login(request):
    username = request.data.get("username")    
    password = request.data.get("password")             
    
    user = authenticate(username=username, password=password)

    if user is None:
        log_action(
                action=AuditLog.Action.LOGIN_FAILED,
                status=False,
                description=f"Person with username \"{username}\" failed to log in",
                entity_type="User",
            ) 

        return Response({
            "message": "Invalid credentials"
            }, status=401)
    refresh = RefreshToken.for_user(user)
    log_action(
        user=user,
        action=AuditLog.Action.LOGIN_SUCCEEDED,
        status=True,
        description=f"{user.username} logged in",
        entity_type="User",
        entity_id=user.id,
    )    
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.user.is_superuser:
        role = "Admin"
    else:
        group = request.user.groups.first()
        role = group.name if group else None

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "role": role,
    })



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(OrderHistory)
def checkout(request):

    items = request.data.get("items")
    customer_id = request.data.get("customer_id")
    payment_method = request.data.get("payment_method")

    if not isinstance(items, list) or not items:
        return Response(
            {"error": "The cart cannot be empty."},
            status=400
        )

    valid_methods = dict(Payment.PAYMENT_METHODS)

    if payment_method not in valid_methods:
        return Response(
            {"error": "Invalid payment method."},
            status=400
        )

    try:
        current_user = request.user
    except Cashier.DoesNotExist:
        return Response(
            {"error": "This account is not linked to a cashier."},
            status=403
        )
    try:
        group_names = set(
                    current_user.groups.values_list("name", flat=True)
                    )
        if not group_names.intersection({"Admin", "Cashiers"}):
                return Response(
        {"error": "You are not authorized to make sales."},
        status=403
    )
    except User.DoesNotExist:
            return Response(
                {"error": "This account is not linked to a user."},
                status=403
            )

    quantities = {}



    try:
        for item in items:
            product_id = int(item["product_id"])
            quantity = Decimal(str(item["quantity"]))

            if (
                not quantity.is_finite()
                or quantity <= 0
                or quantity != quantity.quantize(Decimal("0.01"))
            ):
                raise ValueError("Invalid quantity.")

            if product_id in quantities:
                raise ValueError("Duplicate product in cart.")

            quantities[product_id] = quantity

        

    except (KeyError, TypeError, ValueError, InvalidOperation):
        return Response(
            {"error": "Invalid product, quantity, or payment amount."},
            status=400
        )

    try:
        with transaction.atomic():



            products = {
                product.id: product
                for product in Product.objects.select_for_update()
                .filter(id__in=quantities.keys())
                .order_by("id")
            }

            if len(products) != len(quantities):
                return Response(
                    {"error": "One or more products do not exist."},
                    status=400
                )

            total = Decimal("0.00")

            for product_id, quantity in quantities.items():
                product = products[product_id]

                if product.current_stock < quantity:
                    return Response(
                        {
                            "error": (
                                f"Insufficient stock for {product.name}."
                            )
                        },
                        status=400
                    )

                total += product.get_actual_sale_price() * quantity

            total = total.quantize(Decimal("0.01"))

            

            customer = None

            if customer_id not in (None, ""):
                try:
                    customer = Customer.objects.get(id=customer_id)
                except (
                    Customer.DoesNotExist,
                    ValueError,
                    TypeError
                ):
                    return Response(
                        {"error": "Customer does not exist."},
                        status=400
                    )

            order = OrderHistory.objects.create(
                customer=customer
            )

            for product_id, quantity in quantities.items():
                product = products[product_id]

                QuantityOfAnItemBought.objects.create(
                    order=order,
                    product=product,
                    amount_bought=quantity
                )

                product.current_stock -= quantity
                product.save(update_fields=["current_stock"])

                StockMovement.objects.create(
                    product=product,
                    quantity=-quantity,
                    movement_type="sale",
                    performed_by=current_user,
                    reason=f"Sale OH-{order.id}"
                )


            payment = Payment.objects.create(
                order=order,
                amount=total,
                method=payment_method
                )

            log_action(
                    user=current_user,
                    action=AuditLog.Action.SALE_COMPLETED,
                    status=True,
                    description=f"{current_user} made a sale, with OrderHistory, \"{order.id}\"",
                    entity_type="User",
                    entity_id=current_user.id,
                ) 

            return Response(
                {
                    "message": "Sale completed successfully.",
                    "order_id": order.id,
                    "payment_id": payment.id,
                    "total": str(total),
                    "customer_id": customer.id if customer else None
                },
                status=201
            )

    except Exception:
        import logging
        logging.getLogger(__name__).exception(
            "Checkout failed"
        )
        return Response(
            {"error": "Checkout failed. No sale was completed."},
            status=500
        )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Supplier)
def dashboard(request):

    today = timezone.localdate()

    orders = OrderHistory.objects.filter(
        time_of_purchase__date=today
    )

    todays_sales = Decimal("0")
    most_expensive_order = Decimal("0")
    profit_generated_today = Decimal("0")
    number_of_orders = 0

    low_stock_items = 0
    out_of_stock = 0
    low_stock_products = []
    recent_activity = []



    today = timezone.localdate()

    orders_last_7_days = []

    for i in range(6, -1, -1):
        date = today - timedelta(days=i)

        count = OrderHistory.objects.filter(
            time_of_purchase__date=date
        ).count()

        orders_last_7_days.append({
            "date": date.strftime("%a"),
            "orders": count,
        })

    for product in Product.objects.all().order_by("current_stock")[:5]:
            if product.current_stock <= product.minimum_stock_level:
                low_stock_products.append(product.name)
                

    for product in Product.objects.all():
        

        if product.current_stock <= product.minimum_stock_level:
            low_stock_items += 1

        if product.current_stock == 0:
            out_of_stock += 1


    for order in orders:

        order_total = Decimal("0")
        order_profit = Decimal("0")

        for item in order.items.all():

            sale_price = item.product.get_actual_sale_price()
            quantity = item.amount_bought

            item_total = quantity * sale_price

            order_total += item_total

            item_profit = quantity * (
                sale_price - item.product.net_cost
            )

            order_profit += item_profit

        todays_sales += order_total
        profit_generated_today += order_profit

        if order_total > most_expensive_order:
            most_expensive_order = order_total

        if order:
            number_of_orders += 1
    top_selling_product = "None"
    top_selling_quantity = Decimal("0")

    for order in orders:
        for item in order.items.all():

            if item.amount_bought > top_selling_quantity:
                top_selling_quantity = item.amount_bought   
                top_selling_product = item.product.name


    stock_movements = StockMovement.objects.order_by("-date")[:5]

    for movement in stock_movements:
        recent_activity.append({
            
            "product": movement.product.name,
            "quantity": movement.quantity,
            "movement_type": movement.movement_type,
            "date": movement.date,
            "performed_by": (
                f"{movement.performed_by.username or 'No Name'} "
                
            ).strip() if movement.performed_by else "Admin",
            "reason": movement.reason,
        })


    return Response({
        "todays_sales": todays_sales,
        "most_expensive_order": most_expensive_order,
        "profit_generated_today": profit_generated_today,
        "low_stock_items": low_stock_items,
        "pending_purchase_orders": PurchaseOrder.objects.filter(
            status__in=["Draft", "Sent"]
        ).count(),
        "out_of_stock": out_of_stock,
        "number_of_orders": number_of_orders,
        "top_selling_product": top_selling_product,
        "orders_last_7_days": orders_last_7_days,
        "low_stock_products": low_stock_products,
        "recent_activity": recent_activity,

    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Notification)
def notifications(request):
    notification = Notification.objects.all().order_by("-created_at")
    
    serializer = NotificationSerializer(
        notification, many =True 
    )

    return Response(
        serializer.data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_receipt(request):
    active_user = request.user
    queryset = NotificationRecipient.objects.filter(user = active_user).select_related("notification")
    serializer = NotificationReadStatusSerializer(
            queryset,
            many = True, 
            
    )
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def notification_read(request, notification_id):
    try:
        notification_receipt = NotificationRecipient.objects.get(user = request.user, notification=notification_id )
        notification_receipt.is_read = True
        notification_receipt.save()
        serializer = NotificationReadStatusSerializer(
                notification_receipt,
        )
        return Response(
            serializer.data
        )

    except(NotificationRecipient.DoesNotExist):
        return Response(
            status=404,
        )





@api_view(["POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(PurchaseOrder)
def receive_purchase_order(request, purchase_order_id):

    with transaction.atomic():

        try:
            order = PurchaseOrder.objects.select_for_update().get(
                id=purchase_order_id
            )
        except PurchaseOrder.DoesNotExist:
            return Response(
                {"error": "Purchase order does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status != "Sent":
            return Response(
                {"error": "Only sent purchase orders can be received."},
                status=status.HTTP_400_BAD_REQUEST
            )

        items = list(
            order.items.select_related("product").order_by("product_id")
        )

        if not items:
            return Response(
                {"error": "This purchase order has no items."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cashier = Cashier.objects.get(user=request.user)
        except Cashier.DoesNotExist:
            return Response(
                {"error": "This account is not linked to a cashier."},
                status=status.HTTP_403_FORBIDDEN
            )

        for item in items:
            if item.quantity <= Decimal("0"):
                return Response(
                    {
                        "error": (
                            f"Invalid quantity for {item.product.name}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        for item in items:
            product = Product.objects.select_for_update().get(
                id=item.product_id
            )

            product.current_stock += item.quantity
            product.save(update_fields=["current_stock"])

            StockMovement.objects.create(
                product=product,
                quantity=item.quantity,
                movement_type="purchase",
                performed_by=cashier,
                reason=f"Purchase order PO-{order.id} received"
            )

        order.status = "Received"
        order.save(update_fields=["status"])

        return Response(
            {
                "message": "Purchase order received successfully.",
                "purchase_order_id": order.id,
                "status": order.status,
                "items_received": len(items)
            },
            status=status.HTTP_200_OK
        )

    


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Settings)
def settings(request):
    setting = Settings.objects.first()
    serializer = SettingsSerializer(setting)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Settings)

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

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
# @require_model_permissions(Category)
def categories(request):
    user = request.user

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
            category = serializer.save()
            log_action(user=user,
                       action=AuditLog.Action.CATEGORY_CREATED,
                       status=True,
                       description=f"{user} created new Category, {category.name}",
                       entity_id=category.id,
                       entity_type="Category"
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )
    
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Category)

def category_detail(request, category_id):

    try:
        category = Category.objects.get(id=category_id)
        category_name = category.name
        category_id = category.id

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
            log_action(user=request.user,
                       action=AuditLog.Action.CATEGORY_UPDATED,
                       status=True,
                        description=f"{request.user} updated Category, {category.name}",
                        entity_id=category.id,
   
                       entity_type="Category"
            )

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
            log_action(user=request.user,
                                   action=AuditLog.Action.CATEGORY_UPDATED,
                                   status=True,
                                   description=f"{request.user} updated Category, {category.name}",
                                   entity_id=category.id,
                                   entity_type="Category"
                                   
                        )

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )


    elif request.method == "DELETE":

        category.delete()
        log_action(user=request.user,
                               action=AuditLog.Action.CATEGORY_DELETED,
                               status=True,
                               description=f"{request.user} deleted Category, {category_name}",
                               entity_id=category_id,
                               entity_type="Category"
                    )

        return Response(
            status=204
        )
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Discount)
def discounts(request):

    if request.method == "GET":
        discounts = Discount.objects.all()
        serializer = DiscountSerializer(
            discounts,
            many = True
        )

        return Response(
            serializer.data
        )
    elif request.method == "POST":
        serializer = DiscountSerializer(
            data = request.data
        )

        if serializer.is_valid():
            discount = serializer.save()

            log_action(user=request.user,
                                   action=AuditLog.Action.DISCOUNT_CREATED,
                                   status=True,
                                    description=f"{request.user} created discount, {discount.name}",
                                    entity_id=discount.id,
                                    entity_type="Discount",
                        )

            return Response(
                serializer.data,
                status = 201            
            )
        return Response(
            serializer.errors,
            status=400
        )
@api_view(["GET","PATCH","PUT","DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Discount)
def discount_detail(request, discount_id):
    try:
        discount = Discount.objects.get(id = discount_id)
    except Discount.DoesNotExist:
        return Response(
            {"error": "Discount does not exist"},
            status=404
        )

    if request.method == "GET":
        serializer = DiscountSerializer(discount)
        return Response(
            serializer.data,
        )
    elif request.method == "PATCH":
        serializer = DiscountSerializer(
            discount,
            data = request.data,
            partial = True
        )
        if serializer.is_valid():

            discount = serializer.save()
            log_action(user=request.user,
                                               action=AuditLog.Action.DISCOUNT_CREATED,
                                               status=True,
                                                description=f"{request.user} updated discount, {discount.name}",
                                                entity_id=discount.id,
                                                entity_type="Discount",
                                    )

            return Response(
                serializer.data,
            )
        return Response(
            serializer.errors,
            status=400
        )
    elif request.method == "PUT":
        serializer = DiscountSerializer(
            discount,
            data = request.data
        )
        if serializer.is_valid():
            discount = serializer.save()
            log_action(user=request.user,
                                                           action=AuditLog.Action.DISCOUNT_CREATED,
                                                           status=True,
                                                            description=f"{request.user} updated discount, {discount.name}",
                                                            entity_id=discount.id,
                                                            entity_type="Discount",
                                                )
            return Response(
                serializer.data,
            )
        
        return Response(
            serializer.errors,
            status=400
        )
    
    elif request.method == "DELETE":

        discount.delete()
        log_action(user=request.user,
                                                                   action=AuditLog.Action.DISCOUNT_DELETED,
                                                                   status=True,
                                                                    description=f"{request.user} deleted discount, {discount.name}",
                                                                    entity_id=discount.id,
                                                                    entity_type="Discount",
                                                        )

        return Response(
            status=204
        )
@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(TaxType)
def taxtypes(request):

    if request.method == "GET":
        taxtypes = TaxType.objects.all()
        serializer = TaxTypeSerializer(
            taxtypes,
            many = True
        )
        return Response(
            serializer.data
        )
    elif request.method == "POST":
        serializer = TaxTypeSerializer(
            data = request.data
        )
        if serializer.is_valid():
            taxtype = serializer.save()
            log_action(user=request.user,
                       action=AuditLog.Action.TAXTYPE_CREATED,
                                               status=True,
                                                description=f"{request.user} created taxtype, {taxtype.name}",
                                                entity_id=taxtype.id,
                                                entity_type="Taxtype",
                                    )


            return Response(
                serializer.data,
                status=201
                )

        return Response(
            serializer.errors,
            status=400)
@api_view(["GET","PUT","PATCH","DELETE"])   
@permission_classes([IsAuthenticated])
@require_model_permissions(TaxType)

def taxtype_details(request, taxtype_id):
    try:
        taxtype = TaxType.objects.get(id = taxtype_id)
    except TaxType.DoesNotExist:
        return Response(
            {"error": "TaxType does not exist"},
            status=404
        )

    if request.method == "GET":
        serializer = TaxTypeSerializer(taxtype)
        return Response(
            serializer.data
        )
    elif request.method == "PUT":
        serializer = TaxTypeSerializer(
            taxtype,
            data = request.data
        )
        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                       action=AuditLog.Action.TAXTYPE_UPDATED,
                                                                               status=True,
                                                                                description=f"{request.user} updated Taxtype, \"{taxtype.name}\"",
                                                                                entity_id=taxtype.id,
                                                                                entity_type="Taxtype",
                                                                    ) 
            return Response(
                serializer.data
            )
        return Response(
            serializer.errors,
            status=400
        )        
    elif request.method == "PATCH":
        serializer = TaxTypeSerializer(
            taxtype,
            data = request.data,
            partial = True
        )
        if serializer.is_valid():  
            serializer.save() 
            log_action(user=request.user,
                                           action=AuditLog.Action.TAXTYPE_UPDATED,
                                                                   status=True,
                                                                    description=f"{request.user} updated Taxtype, \"{taxtype.name}\"",
                                                                    entity_id=taxtype.id,
                                                                    entity_type="Taxtype",
                                                        )            
            return Response(
                serializer.data
            )
        return Response(
            serializer.errors,
            status=400
        )  
    elif request.method == "DELETE":
        taxtype.delete()
        log_action(user=request.user,
                               action=AuditLog.Action.TAXTYPE_DELETED,
                                                       status=True,
                                                        description=f"{request.user} deleted Taxtype, {taxtype.name}",
                                                        entity_id=taxtype.id,
                                                        entity_type="Taxtype",
                                            )
        
        return Response(
            status=204
        )
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Warehouse)     
def warehouses(request):

    if request.method == "GET":
        warehouses = Warehouse.objects.all()

        serializer = WarehouseSerializer(
            warehouses,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":
        serializer = WarehouseSerializer(
            data=request.data
        )

        if serializer.is_valid():
            warehouse = serializer.save()
            log_action(user=request.user,
                                               action=AuditLog.Action.WAREHOUSE_CREATED,
                                                                       status=True,
                                                                        description=f"{request.user} updated warehouse, {warehouse.name}",
                                                                        entity_id=warehouse.id,
                                                                        entity_type="Warehouse",
                                                            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Warehouse)
def warehouse_detail(request, warehouse_id):

    try:
        warehouse = Warehouse.objects.get(id=warehouse_id)

    except Warehouse.DoesNotExist:
        return Response(
            {"error": "Warehouse does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = WarehouseSerializer(warehouse)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = WarehouseSerializer(
            warehouse,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                               action=AuditLog.Action.WAREHOUSE_UPDATED,
                                                                       status=True,
                                                                        description=f"{request.user} updated warehouse, {warehouse.name}",
                                                                        entity_id=warehouse.id,
                                                                        entity_type="Warehouse",
                                                            )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "PATCH":

        serializer = WarehouseSerializer(
            warehouse,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                   action=AuditLog.Action.WAREHOUSE_UPDATED,
                                                           status=True,
                                                            description=f"{request.user} updated warehouse, {warehouse.name}",
                                                            entity_id=warehouse.id,
                                                            entity_type="Warehouse",
                                                )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        warehouse.delete()
        log_action(user=request.user,
                                           action=AuditLog.Action.WAREHOUSE_DELETED,
                                                                   status=True,
                                                                    description=f"{request.user} deleted warehouse, {warehouse.name}",
                                                                    entity_id=warehouse.id,
                                                                    entity_type="Warehouse",
                                                        )

        return Response(status=204)
    
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Product)
def products(request):

    if request.method == "GET":
        products = Product.objects.all()

        serializer = ProductSerializer(
            products,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = ProductSerializer(
            data=request.data
        )

        if serializer.is_valid():
            product = serializer.save()
            log_action(user=request.user,
                                               action=AuditLog.Action.PRODUCT_CREATED,
                                                                       status=True,
                                                                        description=f"{request.user} created product, {product.name}",
                                                                        entity_id=product.id,
                                                                        entity_type="Product",
                                                            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Product)

def product_detail(request, product_id):

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = ProductSerializer(product)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = ProductSerializer(
            product,
            data=request.data
        )

        if serializer.is_valid():
            if product.current_stock <= product.minimum_stock_level:
                notify(notification_type=Notification.Type.LOW_STOCK,
                    message=f"{product.name} is low in stock",
                    )
            log_action(user=request.user,
                                   action=AuditLog.Action.PRODUCT_UPDATED,
                                                           status=True,
                                                            description=f"{request.user} updated product, {product.name}",
                                                            entity_id=product.id,
                                                            entity_type="Product",
                                                )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "PATCH":

        remove_image = request.data.get("remove_image")

        if remove_image == "true":
            if product.image:
                product.image.delete(save=False)

            product.image = None

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            if product.current_stock <= product.minimum_stock_level:
                notify(notification_type=Notification.Type.LOW_STOCK,
                    message=f"{product.name} is low in stock",
                    )
            log_action(user=request.user,
                                               action=AuditLog.Action.PRODUCT_UPDATED,
                                                                       status=True,
                                                                        description=f"{request.user} updated product, {product.name}",
                                                                        entity_id=product.id,
                                                                        entity_type="Product",
                                                            )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        try:
            product.delete()
            log_action(user=request.user,
                                               action=AuditLog.Action.PRODUCT_DELETED,
                                                                       status=True,
                                                                        description=f"{request.user} deleted product, {product.name}",
                                                                        entity_id=product.id,
                                                                        entity_type="Product",
                                                            )

        except ProtectedError:
            return Response(
                {
                    "error": "Protected"
                },
                status=400
            )

    return Response(status=204)
    
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Supplier)
def suppliers(request):

    if request.method == "GET":

        suppliers = Supplier.objects.all()

        serializer = SupplierSerializer(
            suppliers,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = SupplierSerializer(
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
@permission_classes([IsAuthenticated])
@require_model_permissions(Supplier)

def supplier_detail(request, supplier_id):

    try:
        supplier = Supplier.objects.get(id=supplier_id)

    except Supplier.DoesNotExist:
        return Response(
            {"error": "Supplier does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = SupplierSerializer(supplier)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = SupplierSerializer(
            supplier,
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

        serializer = SupplierSerializer(
            supplier,
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

        supplier.delete()

        return Response(status=204)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Branch)
def branches(request):

    if request.method == "GET":

        branches = Branch.objects.all()

        serializer = BranchSerializer(
            branches,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = BranchSerializer(
            data=request.data
        )

        if serializer.is_valid():
            branch = serializer.save()
            log_action(user=request.user,
                                               action=AuditLog.Action.BRANCH_CREATED,
                                                                       status=True,
                                                                        description=f"{request.user} created branch, {branch.name}",
                                                                        entity_id=branch.id,
                                                                        entity_type="Branch",
                                                            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Branch)

def branch_detail(request, branch_id):

    try:
        branch = Branch.objects.get(id=branch_id)

    except Branch.DoesNotExist:
        return Response(
            {"error": "Branch does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = BranchSerializer(branch)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = BranchSerializer(
            branch,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                           action=AuditLog.Action.BRANCH_UPDATED,
                                                                                   status=True,
                                                                                    description=f"{request.user} updated branch, {branch.name}",
                                                                                    entity_id=branch.id,
                                                                                    entity_type="Branch",
                                                                        )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "PATCH":

        serializer = BranchSerializer(
            branch,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                           action=AuditLog.Action.BRANCH_UPDATED,
                                                                                   status=True,
                                                                                    description=f"{request.user} updated branch, {branch.name}",
                                                                                    entity_id=branch.id,
                                                                                    entity_type="Branch",
                                                                        )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        branch.delete()
        log_action(user=request.user,
                                                       action=AuditLog.Action.BRANCH_DELETED,
                                                                               status=True,
                                                                                description=f"{request.user} deleted branch, {branch.name}",
                                                                                entity_id=branch.id,
                                                                                entity_type="Branch",
                                                                    )

        return Response(status=204)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(PurchaseOrder)
def purchase_orders(request):

    if request.method == "GET":

        orders = PurchaseOrder.objects.all()

        serializer = PurchaseOrderSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = PurchaseOrderSerializer(
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
@permission_classes([IsAuthenticated])
@require_model_permissions(PurchaseOrder)

def purchase_order_detail(request, purchase_order_id):

    try:
        order = PurchaseOrder.objects.get(
            id=purchase_order_id
        )

    except PurchaseOrder.DoesNotExist:
        return Response(
            {"error": "Purchase order does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = PurchaseOrderSerializer(order)

        return Response(serializer.data)

    elif request.method == "PUT":

        if order.status == "Received":
            return Response(
                {"error": "Received purchase orders cannot be edited."},
                status=400
            )

        if request.data.get("status") == "Received":
            return Response(
                {"error": "Use the receive endpoint to receive an order."},
                status=400
            )
        

        serializer = PurchaseOrderSerializer(
            order,
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
        if order.status == "Received":
            return Response(
                {"error": "Received purchase orders cannot be edited."},
                status=400
            )

        if request.data.get("status") == "Received":
            return Response(
                {"error": "Use the receive endpoint to receive an order."},
                status=400
            )

        serializer = PurchaseOrderSerializer(
            order,
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

        order.delete()

        return Response(status=204)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(PurchaseOrderItem)
def purchase_order_items(request):

    if request.method == "GET":

        items = PurchaseOrderItem.objects.all()

        serializer = PurchaseOrderItemSerializer(
            items,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = PurchaseOrderItemSerializer(
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
@permission_classes([IsAuthenticated])
@require_model_permissions(PurchaseOrderItem)

def purchase_order_item_detail(request, item_id):

    try:
        item = PurchaseOrderItem.objects.get(id=item_id)

    except PurchaseOrderItem.DoesNotExist:
        return Response(
            {"error": "Purchase order item does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = PurchaseOrderItemSerializer(item)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = PurchaseOrderItemSerializer(
            item,
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

        serializer = PurchaseOrderItemSerializer(
            item,
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

        item.delete()

        return Response(status=204)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Customer)
def customers(request):

    if request.method == "GET":

        customers = Customer.objects.all()

        serializer = CustomerSerializer(
            customers,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = CustomerSerializer(
            data=request.data
        )

        if serializer.is_valid():
            customer = serializer.save()
            log_action(user=request.user,
                                                           action=AuditLog.Action.CUSTOMER_CREATED,
                                                                                   status=True,
                                                                                    description=f"{request.user} created customer, {customer.name}",
                                                                                    entity_id=customer.id,
                                                                                    entity_type="Customer",
                                                                        )


            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Customer)

def customer_detail(request, customer_id):

    try:
        customer = Customer.objects.get(id=customer_id)

    except Customer.DoesNotExist:
        return Response(
            {"error": "Customer does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = CustomerSerializer(customer)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = CustomerSerializer(
            customer,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                                       action=AuditLog.Action.CUSTOMER_UPDATED,
                                                                                               status=True,
                                                                                                description=f"{request.user} updated customer, {customer.name}",
                                                                                                entity_id=customer.id,
                                                                                                entity_type="Customer",
                                                                                    )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "PATCH":

        serializer = CustomerSerializer(
            customer,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                                                   action=AuditLog.Action.CUSTOMER_UPDATED,
                                                                                                           status=True,
                                                                                                            description=f"{request.user} updated customer, {customer.name}",
                                                                                                            entity_id=customer.id,
                                                                                                            entity_type="Customer",
                                                                                                )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        customer.delete()
        log_action(user=request.user,
                                                                               action=AuditLog.Action.CUSTOMER_DELETED,
                                                                                                       status=True,
                                                                                                        description=f"{request.user} deleted customer, {customer.name}",
                                                                                                        entity_id=customer.id,
                                                                                                        entity_type="Customer",
                                                                                            )

        return Response(status=204)
    
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Cashier)
def cashiers(request):

    if request.method == "GET":

        cashiers = Cashier.objects.all()

        serializer = CashierSerializer(
            cashiers,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = CashierSerializer(
            data=request.data
        )

        if serializer.is_valid():
            cashier = serializer.save()
            log_action(user=request.user,
                                                                                   action=AuditLog.Action.CASHIER_CREATED,
                                                                                                           status=True,
                                                                                                            description=f"{request.user} created cashier, {cashier.first_name} {cashier.second_name}",
                                                                                                            entity_id=cashier.id,
                                                                                                            entity_type="Cashier",
                                                                                                )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Cashier)

def cashier_detail(request, cashier_id):

    try:
        cashier = Cashier.objects.get(id=cashier_id)

    except Cashier.DoesNotExist:
        return Response(
            {"error": "Cashier does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = CashierSerializer(cashier)

        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = CashierSerializer(
            cashier,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                                                               action=AuditLog.Action.CASHIER_UPDATED,
                                                                                                                       status=True,
                                                                                                                        description=f"{request.user} updated cashier, {cashier.first_name} {cashier.second_name}",
                                                                                                                        entity_id=cashier.id,
                                                                                                                        entity_type="Cashier",
                                                                                                            )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "PATCH":

        serializer = CashierSerializer(
            cashier,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user,
                                                                                                           action=AuditLog.Action.CASHIER_UPDATED,
                                                                                                                                   status=True,
                                                                                                                                    description=f"{request.user} updated cashier, {cashier.first_name} {cashier.second_name}",
                                                                                                                                    entity_id=cashier.id,
                                                                                                                                    entity_type="Cashier",
                                                                                                                        )
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        cashier.delete()
        log_action(user=request.user,
                                                                                                       action=AuditLog.Action.CASHIER_DELETED,
                                                                                                                               status=True,
                                                                                                                                description=f"{request.user} deleted cashier, {cashier.name}",
                                                                                                                                entity_id=cashier.id,
                                                                                                                                entity_type="Cashier",
                                                                                                                    )

        return Response(status=204)



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Announcement)
def announcements(request):

    if request.method == "GET":

        announcements = Announcement.objects.all()

        serializer = AnnouncementSerializer(
            announcements,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = AnnouncementSerializer(
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
@permission_classes([IsAuthenticated])
@require_model_permissions(Announcement)

def announcement_detail(request, announcement_id):

    try:
        announcement = Announcement.objects.get(
            id=announcement_id
        )

    except Announcement.DoesNotExist:
        return Response(
            {"error": "Announcement does not exist"},
            status=404
        )

    if request.method == "GET":

        serializer = AnnouncementSerializer(announcement)
        return Response(serializer.data)

    elif request.method == "PUT":

        serializer = AnnouncementSerializer(
            announcement,
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

        serializer = AnnouncementSerializer(
            announcement,
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

        announcement.delete()
        return Response(status=204)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Payment)  

def payments(request):

    payments = Payment.objects.all()

    serializer = PaymentSerializer(
        payments,
        many=True
    )

    return Response(serializer.data)

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(StockMovement) 
def stock(request):
    if request.method =="GET":
        stock_movements = StockMovement.objects.all()
        serializer = StockMovementSerializer(
            stock_movements,
            many=True
        )

        return Response(serializer.data)



    if request.method == "POST":
        if request.user.is_superuser:
            role = "Admin"
        else:
            group = request.user.groups.first()
            role = group.name if group else None

        product_id = request.data.get("product_id")
        quantity_input = request.data.get("quantity")
        direction = request.data.get("direction")
        reason = request.data.get("reason", "").strip()

        if direction not in ["Increase", "Decrease"]:
            return Response(
                {"error": "Direction must be Increase or Decrease."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = Decimal(str(quantity_input))
            if not quantity.is_finite() or quantity <= 0:
                raise InvalidOperation
        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a positive decimal number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not product_id:
            return Response(
                {"error": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"error": "A reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role in ["Admin", "Cashiers"]:
            performed_by = request.user
        if role == None:
            return Response(
                   {"error": "You are not authorized to update stock!"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        try:
            with transaction.atomic():
                product = Product.objects.select_for_update().get(id=product_id)

                if direction == "Decrease" and quantity > product.current_stock:
                    return Response(
                        {"error": "Adjustment would result in negative stock."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if direction == "Increase":
                    product.current_stock += quantity
                else:
                    product.current_stock -= quantity

                product.save(update_fields=["current_stock"])
                log_action(user=request.user,
                                                                                                               action=AuditLog.Action.STOCK_ADJUSTED,
                                                                                                                                       status=True,
                                                                                                                                        description=f"{request.user} updated product, {product.name}\'s stock",
                                                                                                                                        entity_id=product.id,
                                                                                                                                        entity_type="Product",
                                                                                                                            )

                movement = StockMovement.objects.create(
                    product=product,
                    quantity=quantity,
                    movement_type = "Stock Increase" if direction == "Increase" else "Stock Decrease",
                    performed_by=performed_by,
                    reason=reason,
                )
                if product.current_stock <= product.minimum_stock_level:
                    notify(notification_type=Notification.Type.LOW_STOCK,
                        message=f"{product.name} is low in stock",
                        )
                log_action(user=request.user,
                                                                                                                               action=AuditLog.Action.STOCK_MOVEMENT_CREATED,
                                                                                                                                                       status=True,
                                                                                                                                                        description=f"{request.user} created a {movement} on product, {product.name}",
                                                                                                                                                        entity_id=movement.id,
                                                                                                                                                        entity_type="StockMovement",
                                                                                                                                            )

            return Response(
                StockMovementSerializer(movement).data,
                status=status.HTTP_201_CREATED,
            )

        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            ) 

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions(OrderHistory)
def returns(request):

    if request.method == "GET":
        returns = Returns.objects.all()
        serializer = ReturnsSerializer(
            returns,
            many=True
        )

        return Response(serializer.data)

    if request.method == "POST":    
        product_id = request.data.get("product_id")
        order_history_id = request.data.get("order_history")
        customer_id = request.data.get("customer")
        reason = (request.data.get("reason") or "").strip()

        try:
            quantity = Decimal(str(request.data.get("quantity")))

            if not quantity.is_finite() or quantity <= 0:
                raise InvalidOperation

        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a valid positive number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not product_id or not order_history_id:
            return Response(
                {"error": "Product and original sale are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"error": "A reason for the return is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        group_names = set(
            request.user.groups.values_list("name", flat=True)
        )

        if not (
            request.user.is_superuser
            or group_names.intersection({"Admin", "Cashiers"})
        ):
            return Response(
                {"error": "You are not authorized to process returns."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            with transaction.atomic():
                
                order = OrderHistory.objects.select_for_update().get(
                    pk=order_history_id
                )

                product = Product.objects.select_for_update().get(
                    pk=product_id
                )

                sold_items = list(
                    order.items.select_for_update().filter(product=product)
                )

                if not sold_items:
                    return Response(
                        {"error": "This product was not included in that sale."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                quantity_sold = sum(
                    (item.amount_bought for item in sold_items),
                    Decimal("0"),
                )

                quantity_previously_returned = (
                    Returns.objects.filter(
                        order_history=order,
                        product=product,
                    ).aggregate(total=Sum("quantity"))["total"]
                    or Decimal("0")
                )

                quantity_remaining = (
                    quantity_sold - quantity_previously_returned
                )

                if quantity > quantity_remaining:
                    return Response(
                        {
                            "error": (
                                f"Only {quantity_remaining} of this product "
                                "remain eligible for return on this sale."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        
                order_customer = order.customer

                if customer_id not in (None, ""):
                    if order_customer is None or str(
                        order_customer.pk
                    ) != str(customer_id):
                        return Response(
                            {
                                "error": (
                                    "The customer does not match the "
                                    "original sale."
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                return_record = Returns.objects.create(
                    product=product,
                    customer=order_customer,
                    order_history=order,
                    quantity=quantity,
                    reason=reason,
                )

                product.current_stock += quantity
                product.save(update_fields=["current_stock"])
                log_action(user=request.user,
                            action=AuditLog.Action.STOCK_ADJUSTED,
                            status=True,
                            description=f"{request.user} processed a return that resulted in a stock increase on {product.name} with ID {product_id}.This has resulted in an increase of {quantity} to it\'s stock.",
                            entity_id=movement.id,
                            entity_type="StockMovement",
                            )

                movement = StockMovement.objects.create(
                    product=product,
                    movement_type="return",
                    performed_by=request.user,
                    reason=f"Return for sale #{order.pk}: {reason}",
                    quantity=quantity,
                )

                return_data = ReturnsSerializer(return_record).data
                movement_data = StockMovementSerializer(movement).data
                log_action(user=request.user,
                            action=AuditLog.Action.STOCK_MOVEMENT_CREATED,
                            status=True,
                            description=f"{return_record.id} created a stock increase on product, {product.name}",
                            entity_id=movement.id,
                            entity_type="StockMovement",
                            )

        except (OrderHistory.DoesNotExist, Product.DoesNotExist):
            return Response(
                {"error": "The original sale or product could not be found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (ValueError, TypeError):
            return Response(
                {"error": "The supplied sale or product ID is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "returns": return_data,
                "stock_movements": movement_data,
            },
            status=status.HTTP_201_CREATED,
        )



