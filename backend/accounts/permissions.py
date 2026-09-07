from functools import wraps
from rest_framework.response import Response


def require_model_permissions(model):

    def decorator(view_func):

        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return view_func(request, *args, **kwargs)

            app_label = model._meta.app_label
            model_name = model._meta.model_name

            permissions = {
                "GET": f"{app_label}.view_{model_name}",
                "POST": f"{app_label}.add_{model_name}",
                "PUT": f"{app_label}.change_{model_name}",
                "PATCH": f"{app_label}.change_{model_name}",
                "DELETE": f"{app_label}.delete_{model_name}",
            }

            permission = permissions.get(request.method)

            if permission and not request.user.has_perm(permission):
                return Response(
                    {
                        "detail": "You do not have permission to perform this action."
                    },
                    status=403
                )

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator