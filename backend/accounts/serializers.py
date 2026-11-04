from rest_framework import serializers
from decimal import Decimal


from django.contrib.auth.models import User
from .models import (
    TaxType,
    Category,
    Discount,
    Warehouse,
    Product,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    Customer,
    OrderHistory,
    QuantityOfAnItemBought,
    Branch,
    Cashier,
    Settings,
    Notification,
    Announcement,
    AnnouncementReadStatus,
    AuditLog,
    Receipt,
    StockMovement,
    Returns,
    Payment,
    NotificationRecipient
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = [
            "id",
            "business_name",
            "store_logo",
            "currency",
            "receipt_footer",
            "timezone",
            "backup_enabled",
            "backup_provider",
        ]

class TaxTypeSerializer(serializers.ModelSerializer):

    
    class Meta:
        model = TaxType
        fields = ["id", "name", "rate", "active"]


class CategorySerializer(serializers.ModelSerializer):

    
    class Meta:
        model = Category
        fields = ["id", "name"]

    


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ["id", "name", "discount"]


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = [
            "id",
            "name",
            "location",
        ]


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = [
            "id",
            "name",
            "discount",
        ]


class ProductSerializer(serializers.ModelSerializer):
    actual_sale_price = serializers.SerializerMethodField()


    discount_name = serializers.StringRelatedField(
        source="discount",
        read_only=True
    )

    taxes_names = serializers.StringRelatedField(
        source="taxes",
        many=True,
        read_only=True
    )

    category_name = serializers.StringRelatedField(
        source="category",
        read_only=True
    )

    warehouse_name = serializers.StringRelatedField(
        source="warehouse",
        read_only=True
    )

    class Meta:

        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "brand",
            "net_cost",
            "selling_price_without_tax",
            "actual_sale_price",
            "discount",
            "taxes",
            "category",
            "warehouse",
            "discount_name",
            "taxes_names",
            "category_name",
            "warehouse_name",
            "current_stock",
            "minimum_stock_level",
            "image",
            "barcode_number",
        ]





    def get_actual_sale_price(self, obj):
        return str(obj.get_actual_sale_price().quantize(Decimal("0.01")))

class SupplierSerializer(serializers.ModelSerializer):

    product_names = serializers.StringRelatedField(
        source="products",
        many=True,
        read_only=True

    )

    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "products",
            "phone_number",
            "email",
            "address",
            "contact_person",
            "tax_number",

            "product_names",
        ]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "supplier",
            "expected_delivery",
            "status",
        ]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = [
            "id",
            "purchase_order",
            "product",
            "quantity",
        ]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "user",
            "first_name",
            "second_name",
            "reward_points",
            "credit_balance",
        ]


class OrderHistorySerializer(serializers.ModelSerializer):

    customer_name = serializers.StringRelatedField(
        source="customer",
        read_only=True
    )

    total_amount = serializers.SerializerMethodField()
    amount_paid = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()
    payment_status = serializers.CharField(read_only=True)

    class Meta:
        model = OrderHistory
        fields = [
            "id",
            "customer",
            "customer_name",
            "time_of_purchase",
            "total_amount",
            "amount_paid",
            "balance_due",
            "payment_status",
        ]

    def get_total_amount(self, obj):
        value = obj.get_total_amount()
        return str(value) if value is not None else None

    def get_amount_paid(self, obj):
        return str(obj.get_amount_paid())

    def get_balance_due(self, obj):
        value = obj.get_balance_due()
        return str(value) if value is not None else None

class QuantityOfAnItemBoughtSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = QuantityOfAnItemBought
        fields = [
            "id",
            "order",
            "product",
            "product_name",
            "amount_bought",
            "unit_price_before_discount",
            "discount_rate",
            "discount_amount",
            "tax_rate",
            "tax_amount",
            "unit_price",
        ]


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = [
            "id",
            "name",
            "location",
        ]


class CashierSerializer(serializers.ModelSerializer):


    branch_name = serializers.StringRelatedField(
            source = "branch_stationed_at",
            read_only = True,
    
        )
    class Meta:
        model = Cashier
        fields = [
            "id",
            "user",
            "first_name",
            "second_name",
            "date_employed",
            "branch_stationed_at",
            "branch_name"
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "message",
            "created_at",
        ]

class NotificationReadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationRecipient
        fields = [
            "id",
            "notification",
            "user",
            "is_read",
            "read_at",
        ]


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "message",
            "created_at",
            "target_audience",
            "excluded_users",
        ]


class AnnouncementReadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementReadStatus
        fields = [
            "id",
            "announcement",
            "user",
            "read_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "action",
            "timestamp",
            "status",
            "description",
            "entity_type",
            "entity_id",
            "changes",
        ]


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = [
            "id",
            "order_history",
            "receipt_number",
            "cashier",
            "settings",
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "quantity",
            "movement_type",
            "date",
            "performed_by",
            "reason",
        ]


class ReturnsSerializer(serializers.ModelSerializer):

    product_name = serializers.StringRelatedField(
        source ="product",
        read_only = True
    )

    customer_name = serializers.StringRelatedField(
        source ="customer",
        read_only = True
    )
    


    class Meta:
        model = Returns
        fields = [
            "id",
            "product",
            "customer",
            "order_history",
            "quantity",
            "reason",
            "product_name",
            "customer_name",
        ]


class PaymentSerializer(serializers.ModelSerializer):

    recorded_by_username = serializers.CharField(
        source="recorded_by.username",
        read_only=True,
        default=None
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "amount",
            "method",
            "provider",
            "reference_number",
            "recorded_by",
            "recorded_by_username",
            "paid_at",
        ]

        read_only_fields = [
            "id",
            "recorded_by",
            "paid_at",
        ]

