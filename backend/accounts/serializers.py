from rest_framework import serializers
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
)

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
        fields = ["id", "name", "branch_stationed_at"]

    


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
    class Meta:
        model = OrderHistory
        fields = [
            "id",
            "customer",
            "time_of_purchase",
        ]


class QuantityOfAnItemBoughtSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuantityOfAnItemBought
        fields = [
            "id",
            "order",
            "product",
            "amount_bought",
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
            "is_read",
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
            "actions",
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
    class Meta:
        model = Returns
        fields = [
            "id",
            "product",
            "customer",
            "stock_movement",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "amount",
            "method",
            "paid_at",
        ]

