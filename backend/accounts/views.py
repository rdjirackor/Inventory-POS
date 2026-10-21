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

from rest_framework import status

from django.contrib.auth.models import User

from .models import *
from .serializers import *  


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
        cashier = Cashier.objects.get(user=request.user)
    except Cashier.DoesNotExist:
        return Response(
            {"error": "This account is not linked to a cashier."},
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
                    performed_by=cashier,
                    reason=f"Sale OH-{order.id}"
                )

            payment = Payment.objects.create(
                order=order,
                amount=total,
                method=payment_method
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
            "performed_by": movement.performed_by.user.username,
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
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@require_model_permissions(Notification)
def notifications(request):
    notification = Notification.objects.all()
    
    serializer = NotificationSerializer(
        notification, many =True 
    )

    return Response(
        serializer.data
    )
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
# @require_model_permissions(Category)
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
@permission_classes([IsAuthenticated])
@require_model_permissions(Category)

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
            serializer.save()

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

            serializer.save()

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
            serializer.save()
            return Response(
                serializer.data,
            )
        
        return Response(
            serializer.errors,
            status=400
        )
    
    elif request.method == "DELETE":

        discount.delete()

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
            serializer.save()
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
            return Response(
                serializer.data
            )
        return Response(
            serializer.errors,
            status=400
        )  
    elif request.method == "DELETE":
        taxtype.delete()
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
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        warehouse.delete()

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
            serializer.save()
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
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        try:
            product.delete()

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
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        branch.delete()

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
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        customer.delete()

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
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

    elif request.method == "DELETE":

        cashier.delete()

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

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@require_model_permissions([StockMovement])
def  modify_stock(request):
    product_id = request.data.get("product_id")
    product = Product.objects.get(id=product_id)
    quantity = request.data.get("quantity")
    direction = request.data.get("direction")
    reason = request.data.get("reason")


    try:
        with transaction.atomic():
            product = Product.objects.select_for_update(id = product_id)
            if direction == "Decrease":
                product.current_stock-=quantity
            if direction == "Increase":
                product.current_stock+=quantity

            product.save()
            


            # Then, I create the audit record here
            # I alsodo stockMovement.objects.create
    
    except Product.DoesNotExist:
        return Response(
            {"error":"Product not Found"},
            status=status.HTTP_404_not_found,
        )
    return Response(
        {"message":"Stock updated Successfully"},
        status=200
    )
        



   