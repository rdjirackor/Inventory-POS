from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from django.db.models import Q
from django.utils import timezone
from django.conf import settings




class TaxType(models.Model):
    name = models.CharField(max_length=100) 
    rate = models.DecimalField(max_digits=5, decimal_places=2) 
    active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.name} ({self.rate}%)"  

class Category(models.Model):
    name = models.CharField(max_length=500)
    def __str__(self):
        return self.name

class Discount(models.Model):
    name = models.CharField(max_length=100)
    discount = models.DecimalField(decimal_places=2, max_digits=5)
    def __str__(self):
        return f"{self.name}-{self.discount}"

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    brand = models.CharField(max_length=100)
    net_cost = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price_without_tax = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.ForeignKey(Discount, related_name="products", on_delete=models.PROTECT, null=True, blank=True)
    minimum_stock_level = models.PositiveIntegerField(default=0)
    image = models.ImageField(blank=True, null=True)
    barcode_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    taxes = models.ManyToManyField(TaxType, blank=True, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name="products")

    current_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )


    def __str__(self):
        return self.name

    def get_total_taxrate(self):
        total = Decimal("0.00")

        for tax in self.taxes.all():
            total += Decimal(str(tax.rate))

        return total


    def get_actual_sale_price(self):
        base_price = self.selling_price_without_tax

        discount_rate = (
            Decimal(str(self.discount.discount))
            if self.discount else Decimal("0.00")
        )

        tax_rate = self.get_total_taxrate()

        discount_amount = base_price * discount_rate / Decimal("100")
        tax_amount = base_price * tax_rate / Decimal("100")

        return (base_price - discount_amount + tax_amount).quantize(
            Decimal("0.01")
        )

    

        
    

class Supplier(models.Model):
    name = models.CharField(max_length=200) 
    products = models.ManyToManyField(Product, related_name="suppliers")
    phone_number = models.CharField(max_length=18)
    email = models.CharField(max_length=100)
    address = models.CharField(max_length=1000)
    contact_person = models.CharField(max_length=100, blank=True)
    tax_number = models.CharField(max_length=20)
    def __str__(self):
        return f"{self.name}-{self.phone_number}"
    
class PurchaseOrder(models.Model):
    supplier = models.ForeignKey(Supplier,on_delete=models.PROTECT, related_name="purchase_orders")
    expected_delivery = models.DateField() 
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Sent', 'Sent'),
        ('Received', 'Received'),
        ('Cancelled', 'Cancelled'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Draft'
    )
    def __str__(self):
        return f"{self.supplier}-{self.status}"

class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    first_name = models.CharField(max_length=100, null=True)
    second_name = models.CharField(max_length=100, null=True)
    reward_points = models.DecimalField(decimal_places=0, max_digits=15)
    credit_balance = models.DecimalField(decimal_places=2, max_digits=15)
    

    def __str__(self):
        return self.user.username
    
class OrderHistory(models.Model):
    customer = models.ForeignKey(
        Customer,
        related_name="orders",
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )

    time_of_purchase = models.DateTimeField(auto_now_add=True)

    def get_total_items(self):
        data = {}

        for item in self.items.all():
            data[item.product] = item.amount_bought

        return data

    def get_total_amount(self):
        total = Decimal("0.00")

        for item in self.items.all():
            line_total = item.get_line_total()

            if line_total is None:
                return None

            total += line_total

        return total.quantize(Decimal("0.01"))

    def get_amount_paid(self):
        total = sum(
            (payment.amount for payment in self.payments.all()),
            Decimal("0.00")
        )

        return total.quantize(Decimal("0.01"))

    def get_balance_due(self):
        total = self.get_total_amount()

        if total is None:
            return None

        return (total - self.get_amount_paid()).quantize(
            Decimal("0.01")
        )

    @property
    def payment_status(self):
        total = self.get_total_amount()

        if total is None or total <= 0:
            return "Unpaid"

        amount_paid = self.get_amount_paid()

        if amount_paid <= 0:
            return "Unpaid"

        if amount_paid >= total:
            return "Paid"

        return "Partially Paid"

    def __str__(self):
        return f"OH-{self.id}"

    
    
class QuantityOfAnItemBought(models.Model):
    order = models.ForeignKey(
        "OrderHistory",
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    amount_bought = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    unit_price_before_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    discount_rate = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True
    )

    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    tax_rate = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True
    )

    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    def capture_pricing_snapshot(self, product):
        base_price = product.selling_price_without_tax

        discount_rate = (
            Decimal(str(product.discount.discount))
            if product.discount else Decimal("0.00")
        )

        tax_rate = product.get_total_taxrate()

        discount_amount = (
            base_price * discount_rate / Decimal("100")
        )

  
        tax_amount = (
            base_price * tax_rate / Decimal("100")
        )

        final_price = (
            base_price - discount_amount + tax_amount
        ).quantize(Decimal("0.01"))

        self.unit_price_before_discount = base_price
        self.discount_rate = discount_rate
        self.discount_amount = discount_amount.quantize(Decimal("0.01"))
        self.tax_rate = tax_rate
        self.tax_amount = tax_amount.quantize(Decimal("0.01"))
        self.unit_price = final_price

    def get_line_total(self):
        if self.unit_price is None:
            return None

        return (
            self.unit_price * self.amount_bought
        ).quantize(Decimal("0.01"))

    def get_net_price_at_time_of_sale(self):
        return self.unit_price_before_discount

    def get_active_discount_rate_at_sale_time(self):
        if self.discount_rate is None:
            return None

        return self.discount_rate / Decimal("100")

    def get_taxes_on_individual_item(self):
        if self.tax_rate is None:
            return None

        return self.tax_rate / Decimal("100")

    def __str__(self):
        return f"{self.amount_bought} x {self.product.name}"



class Branch(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    def __str__(self):
        return f"{self.name}-{self.location}"

class Cashier(models.Model):
    user = models.OneToOneField(User, related_name="cashier", on_delete=models.SET_NULL, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True)  
    second_name = models.CharField(max_length=100, null=True)
    date_employed = models.DateField()
    branch_stationed_at = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="cashiers")

    def __str__(self):
        return f"{self.user.username}-{self.branch_stationed_at}"

class Settings(models.Model):
    business_name = models.CharField(max_length=100)
    store_logo = models.ImageField(upload_to="store_logos/", blank=True, null=True)
    currency = models.CharField(max_length=3, default="GHS")    
    receipt_footer = models.CharField(max_length=500)
    timezone = models.CharField(max_length=50, default="Africa/Accra")    
    backup_enabled = models.BooleanField(default=False)
    backup_provider = models.CharField(max_length=50, blank=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
 


    def __str__(self):
        return self.business_name

class Notification(models.Model):

    class NotifType(models.TextChoices):
            LOW_STOCK = "LOW_STOCK", "Low Stock"
            NEW_USER = "NEW_USER", "New User Deleted"

    notification_type = models.CharField(
            max_length=50,
            choices=NotifType.choices,
            null=True
        )


    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

  
    
    def __str__(self):
        return f"{self.notification_type}- {self.created_at}"




class NotificationRecipient(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="recipients")
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notification_recipients"
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["notification", "user"],
                name="unique_notification_user",
            )
        ]

    def save(self, *args, **kwargs):
        if self.is_read and self.read_at is None:
            self.read_at = timezone.now()
        elif not self.is_read:
            self.read_at = None
        super().save(*args, **kwargs)     

    def __str__(self):
        return f"{self.user}" 


    
class Announcement(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    enabled = models.BooleanField(default=False)




    def __str__(self):
        return f"{self.title} ({self.target_audience})"

class AnnouncementReadStatus(models.Model):
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='read_by')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='read_announcements')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('announcement', 'user')

    def __str__(self):
        return f"{self.user.username} read {self.announcement.title}"
    

class AuditLog(models.Model):
    user = models.ForeignKey(
        User,
        related_name="audit_logs",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    class Action(models.TextChoices):
        USER_CREATED = "USER_CREATED", "User Created"
        USER_UPDATED = "USER_UPDATED", "User Updated"
        USER_DELETED = "USER_DELETED", "User Deleted"

        LOGIN_SUCCEEDED = "LOGIN_SUCCEEDED", "Login Succeeded"
        LOGIN_FAILED = "LOGIN_FAILED", "Login Failed"
        LOGOUT_SUCCEEDED = "LOGOUT_SUCCEEDED", "Logout Suceeded"

        ACCESS_DENIED = "ACCESS_DENIED", "Access Denied"

        ROLE_OR_PERMISSION_CHANGED = "ROLE_OR_PERMISSION_CHANGED", "Role or Permission Changed"


        PRODUCT_CREATED = "PRODUCT_CREATED", "Product Created"
        PRODUCT_UPDATED = "PRODUCT_UPDATED", "Product Updated"
        PRODUCT_DELETED = "PRODUCT_DELETED", "Product Deleted"

        CATEGORY_CREATED = "CATEGORY_CREATED", "Category Created"
        CATEGORY_UPDATED = "CATEGORY_UPDATED", "Category Updated"
        CATEGORY_DELETED = "CATEGORY_DELETED", "Category Deleted"

        DISCOUNT_CREATED = "DISCOUNT_CREATED", "Discount Created"
        DISCOUNT_UPDATED = "DISCOUNT_UPDATED", "Discount Updated"
        DISCOUNT_DELETED = "DISCOUNT_DELETED", "Discount Deleted"

        TAXTYPE_CREATED = "TAXTYPE_CREATED", "Taxtype Created"
        TAXTYPE_UPDATED = "TAXTYPE_UPDATED", "Taxtype Updated"
        TAXTYPE_DELETED = "TAXTYPE_DELETED", "Taxtype Deleted"

        WAREHOUSE_CREATED = "WAREHOUSE_CREATED", "Warehouse Created"
        WAREHOUSE_UPDATED = "WAREHOUSE_UPDATED", "Warehouse Updated"
        WAREHOUSE_DELETED = "WAREHOUSE_DELETED", "Warehouse Deleted"

        BRANCH_CREATED = "BRANCH_CREATED", "Branch Created"
        BRANCH_UPDATED = "BRANCH_UPDATED", "Branch Updated"
        BRANCH_DELETED = "BRANCH_DELETED", "Branch Deleted"

        SUPPLIER_CREATED = "SUPPLIER_CREATED", "Supplier Created"
        SUPPLIER_UPDATED = "SUPPLIER_UPDATED", "Supplier Updated"
        SUPPLIER_DELETED = "SUPPLIER_DELETED", "Supplier Deleted"

        PURCHASE_ORDER_CREATED = "PURCHASE_ORDER_CREATED", "Purchase Order Created"
        PURCHASE_ORDER_UPDATED = "PURCHASE_ORDER_UPDATED", "Purchase Order Updated"
        PURCHASE_ORDER_DELETED = "PURCHASE_ORDER_DELETED", "Purchase Order Deleted"
        PURCHASE_ORDER_SENT = "PURCHASE_ORDER_SENT", "Purchase Order Sent"
        PURCHASE_ORDER_RECEIVED = "PURCHASE_ORDER_RECEIVED", "Purchase Order Received"
        PURCHASE_ORDER_CANCELLED = "PURCHASE_ORDER_CANCELLED", "Purchase Order Cancelled"

        CUSTOMER_CREATED = "CUSTOMER_CREATED", "Customer Created"
        CUSTOMER_UPDATED = "CUSTOMER_UPDATED", "Customer Updated"
        CUSTOMER_DELETED = "CUSTOMER_DELETED", "Customer Deleted"

        CASHIER_CREATED = "CASHIER_CREATED", "Cashier Created"
        CASHIER_UPDATED = "CASHIER_UPDATED", "Cashier Updated"
        CASHIER_DELETED = "CASHIER_DELETED", "Cashier Deleted"

        SETTINGS_UPDATED = "SETTINGS_UPDATED", "Settings Updated"

        ANNOUNCEMENT_READ = "ANNOUNCEMENT_READ", "Announcement Read"
        ANNOUNCEMENT_UPDATED = "ANNOUNCEMENT_UPDATED", "Announcement Updated"
              

        SALE_COMPLETED = "SALE_COMPLETED", "Sale Completed"
        SALE_FAILED = "SALE_FAILED", "Sale Failed"
        SALE_VOIDED = "SALE_VOIDED", "Sale Voided"
        
        STOCK_ADJUSTED = "STOCK_ADJUSTED", "Stock Adjusted"

        RETURN_PROCESSED = "RETURN_PROCESSED", "Return Processed"
        RETURN_REJECTED = "RETURN_REJECTED", "Return Rejected"

        STOCK_MOVEMENT_CREATED = "STOCK_MOVEMENT_CREATED", "Stock Movement Created" 

        PAYMENT_PROCESSED = "PAYMENT_PROCESSED", "Payment Processed"





    action = models.CharField(
        max_length=50,
        choices=Action.choices,
        null=True
    )
    timestamp = models.DateTimeField(auto_now_add=True, null=True)
    status = models.BooleanField(default=True)
    description = models.CharField(max_length=1000, null=True)
    entity_type = models.CharField(
        max_length=100,
        blank=True,
    )
    entity_id = models.PositiveBigIntegerField(
        null=True,
        blank=True,
    )
    changes = models.JSONField(
        default=dict,
        blank=True,
    ) 
    def __str__(self):
        return f"{self.user}-{self.action}"

class Receipt(models.Model):
    order_history = models.OneToOneField(
        OrderHistory,
        related_name="receipt",
        on_delete=models.PROTECT,
        null=True
    )
    receipt_number = models.CharField(max_length=50, unique=True, null=True)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="receipts_issued",
        on_delete=models.PROTECT,
        null=True
    )
    settings = models.ForeignKey(
        Settings,
        on_delete=models.PROTECT,
        related_name="receipts",
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.receipt_number

class StockMovement(models.Model):
    product = models.ForeignKey(Product, related_name="stock_movements", on_delete=models.PROTECT)
    movement_type = models.CharField(max_length=50) 
    date = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.PROTECT,related_name="stock_movements", null=True)
    reason = models.CharField(max_length=10000, blank=True)



    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )


    def __str__(self):
        return f"{self.product}-{self.quantity}"

class Returns(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="returns")
    customer = models.ForeignKey(Customer, related_name="returns", on_delete=models.PROTECT, null=True, blank=True)
    order_history = models.ForeignKey(OrderHistory, on_delete=models.PROTECT, related_name="returns", null=True)
    quantity = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=1,
)
    reason = models.CharField(max_length=1000, null=True)
    def __str__(self):
        return f"{self.product} - Return of {self.quantity}"

    
class Payment(models.Model):

    PAYMENT_METHODS = [
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("Mobile Money", "Mobile Money"),
        ("Bank Transfer", "Bank Transfer"),
    ]

    order = models.ForeignKey(
        OrderHistory,
        related_name="payments",
        on_delete=models.PROTECT
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHODS
    )

    provider = models.CharField(
        max_length=50,
        blank=True,
        default=""
    )

    reference_number = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="payments_recorded",
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method} - {self.amount}"


    










