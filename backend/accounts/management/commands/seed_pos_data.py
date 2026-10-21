
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Category, TaxType, Discount


class Command(BaseCommand):
    help = "Seed initial Inventory POS data"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding Inventory POS data...")

        # Product categories
        categories = [
            "Beverages",
            "Food",
            "Household Items",
            "Personal Care",
            "Electronics",
        ]

        for name in categories:
            Category.objects.get_or_create(name=name)

        self.stdout.write(self.style.SUCCESS("Categories seeded."))

        # Tax types
        tax_types = [
            {"name": "Standard VAT", "rate": Decimal("15.00")},
            {"name": "Zero Rated", "rate": Decimal("0.00")},
        ]

        for tax in tax_types:
            TaxType.objects.get_or_create(
                name=tax["name"],
                defaults={
                    "rate": tax["rate"],
                    "active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("Tax types seeded."))

        # Discounts
        discounts = [
            Decimal("0.00"),
            Decimal("5.00"),
            Decimal("10.00"),
            Decimal("15.00"),
        ]

        for amount in discounts:
            Discount.objects.get_or_create(discount=amount)

        self.stdout.write(self.style.SUCCESS("Discounts seeded."))

        self.stdout.write(
            self.style.SUCCESS("Initial POS data seeded successfully!")
        )
