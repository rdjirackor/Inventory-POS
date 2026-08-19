from django.db import models

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


class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    brand = models.CharField(max_length=100)
    net_cost = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price_without_tax = models.DecimalField(max_digits=12, decimal_places=2)
    discount_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    warehouse = models.CharField(max_length=200)
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=0)
    image = models.ImageField()
    barcode_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    taxes = models.ManyToManyField(TaxType, blank=True, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    
    def get_total_taxrate(self):
        total = 0
        for tax in self.taxes.all():
            total+=tax.rate
        return total
        
    def get_actual_sale_price(self):
        discount_amount = self.selling_price_without_tax * self.discount_rate/100
        total_tax_amount = self.get_total_taxrate()/100 * self.selling_price_without_tax
        sale_price = self.selling_price_without_tax - discount_amount + total_tax_amount
        return sale_price

class Supplier(models.Model):
    name = models.CharField(max_length=200) 
    products = models.ManyToManyField(Product, related_name="suppliers")
    phone_number = models.CharField(max_length=18)
    email = models.CharField(max_length=100)
    address = models.CharField(max_length=1000)
    contact_person = models.CharField(max_length=100, blank=True)
    tax_number = models.CharField(max_length=20)

    
  

class PurchaseOrder(models.Model):
    supplier = models.ForeignKey(Supplier,on_delete=models.PROTECT, related_name="purchase_orders")
    items = models.ManyToManyField(Product,related_name="purchase_orders")
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



class Customer(models.Model):
    name = models.CharField(max_length=150)
    def __str__(self):
        return self.name



class OrderHistory(models.Model):
    products = models.ManyToManyField(Product, related_name="orders")
    customer = models.ForeignKey(Customer, related_name="orders", on_delete=models.PROTECT)
    time_of_purchase = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"OH-{self.customer}-{self.time_of_purchase}"