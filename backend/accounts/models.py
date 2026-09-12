from django.db import models
from django.contrib.auth.models import User


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
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=0)
    image = models.ImageField()
    barcode_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    taxes = models.ManyToManyField(TaxType, blank=True, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name="products")
    
    def get_total_taxrate(self):
        total = 0
        for tax in self.taxes.all():
            total+= tax.rate
        return total
        
    def get_actual_sale_price(self):
        discount_amount = 0

        if self.discount:
            discount_amount = (
                self.selling_price_without_tax *
                self.discount.discount / 100
            )

        total_tax_amount = (
            self.get_total_taxrate() / 100 *
            self.selling_price_without_tax
        )

        return self.selling_price_without_tax - discount_amount + total_tax_amount
    
    def __str__(self):
        return f"{self.name}-{self.selling_price_without_tax}"

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
    customer = models.ForeignKey(Customer, related_name="orders", on_delete=models.PROTECT, blank=True, null=True)
    time_of_purchase = models.DateTimeField(auto_now_add=True)

    def get_total_items(self):
        data = {}
        for item in self.items.all():
            data[item.product] = item.amount_bought
        return data

    def __str__(self):
        return f"OH-{self.customer}-{self.time_of_purchase}"
    
class QuantityOfAnItemBought(models.Model):
    order = models.ForeignKey('OrderHistory', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    #just in case the store using this application is like not a major supermarket, and lowkey be selling things in fractions, ill allow for decimals but hide it with react unless necassary for prettiness
    amount_bought = models.DecimalField(decimal_places=2, max_digits=5)
    
#will be worked on later
    def get_net_price_at_time_of_sale(self):
        return self.product.selling_price_without_tax
    def get_active_discount_rate_at_sale_time(self):
        if self.product.discount:
            return self.product.discount.discount / 100
        return 0
    def get_taxes_on_individual_item(self):
        return self.product.get_total_taxrate()/100
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
    timezone = models.CharField(max_length=50, default="Africa/Accra")    #i think this would be a path to maybe some place online or multiple paths, preferably one offline at a different location and one synced. On second thought, the backup will be online nvm
    backup_enabled = models.BooleanField(default=False)
    backup_provider = models.CharField(max_length=50, blank=True)
 


    def __str__(self):
        return self.business_name

class Notification(models.Model):
    POSSIBLE_NOTIFICATION = [
        ('Low Stock', 'Low Stock'),
        ('Pending Purchase', 'Pending Purchase'),
        ('New Supplier', 'New Supplier'),
        ('Large Sale', 'Large Sale'),
        ('Failed Payment','Failed Payment'),
        ('New User', 'New User')
    ]

    notification_type = models.CharField(
        max_length=100,
        choices=POSSIBLE_NOTIFICATION,
        default='Low Stock')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.notification_type}- {self.created_at}"
    
class Announcement(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    TARGET_CHOICES = [
        ('all', 'Everyone (Staff + Customers)'),
        ('staff', 'Staff Only (Admins, Cashiers)'),
        ('customers', 'Customers Only'),
        ('admins', 'Admins Only'),
    ]
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES, default='all')

    excluded_users = models.ManyToManyField(User, blank=True, related_name='excluded_announcements')   

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
    user = models.ForeignKey(User, related_name="audit_logs", on_delete=models.SET_NULL,null=True, blank=True)
    ALL_POSSIBLE_ACTIONS = [
        #I think, i have to detail every single possible action and later set triggeres later, bloody heck, thats going to take forver!!!
    ]
    actions = models.CharField(max_length=100, choices=ALL_POSSIBLE_ACTIONS, default=f"")
    def __str__(self):
        return f"{self.user}-{self.actions}"

class Receipt(models.Model):
    order_history = models.ForeignKey(OrderHistory,related_name="receipts",on_delete=models.PROTECT)
    receipt_number = models.CharField(max_length=50)
    cashier = models.ForeignKey(Cashier, related_name="receipts", on_delete=models.PROTECT)
    settings = models.ForeignKey(Settings, on_delete=models.PROTECT, related_name="receipts")
    def __str__(self):
        return f"{self.order_history}-{self.cashier}"

class StockMovement(models.Model):
    product = models.ForeignKey(Product, related_name="stock_movements", on_delete=models.PROTECT)
    quantity = models.IntegerField() # Positive for incoming, negative for outgoing
    movement_type = models.CharField(max_length=50) #sale, damaged, etc
    date = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(Cashier, on_delete=models.PROTECT,related_name="stock_movements")
    reason = models.CharField(max_length=10000, blank=True)

    def __str__(self):
        return f"{self.product}-{self.movement_type}-{self.quantity}"

class Returns(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="returns")
    customer = models.ForeignKey(Customer, related_name="returns", on_delete=models.PROTECT, null=True, blank=True)
    stock_movement = models.OneToOneField(StockMovement, related_name="returns", on_delete=models.PROTECT)
    def __str__(self):
        return f"{self.product}-{self.stock_movement}"

    
class Payment(models.Model):
    PAYMENT_METHODS = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('Mobile Money', 'Mobile Money'),
        ('Bank Transfer', 'Bank Transfer'),
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

    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method}-{self.amount}"