
from .models import AuditLog


def log_action(
    user=None,
    action=None,
    status=True,
    description="",
    entity_type="",
    entity_id=None,
    changes=None,
):
    return AuditLog.objects.create(
        user=user,
        action=action,
        status=status,
        description=description,
        entity_type=entity_type or "",
        entity_id=entity_id,
        changes=changes or {},
    )