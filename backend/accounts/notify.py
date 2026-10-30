
from .models import Notification


def notify(
    notification_type=None,
    message=None,
    created_at=True,

):
    return Notification.objects.create(
        notification_type=notification_type,
        message=message,
        created_at=created_at,
        
    )