
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Notification, NotificationRecipient


User = get_user_model()


@transaction.atomic
def notify(
    notification_type=None,
    message=None,
):
    notification = Notification.objects.create(
        notification_type=notification_type,
        message=message,
    )

    users = User.objects.filter(
        is_active=True,
    )

    recipients = [
        NotificationRecipient(
            notification=notification,
            user=user,
        )
        for user in users
    ]

    NotificationRecipient.objects.bulk_create(recipients)

    return notification
