from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .permissions import require_model_permissions

from .models import *
from .serializers import *  
    
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
    elif hasattr(request.user, "cashier"):
        role = "Cashier"
    else:
        role = None

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "role": role,
    })




#okay now lemme write the setting api first, seems the most straightforward one

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
@require_model_permissions(Category)
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

        product.delete()

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
