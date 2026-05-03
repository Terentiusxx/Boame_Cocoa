# app/auth/role_checker.py
from fastapi import Depends, HTTPException, status
from app.auth.auth_bearer import get_current_user

def role_checker(allowed_roles: list[str]):
    """
    Dependency to check if current user has one of the allowed roles.
    Usage:
        @router.get("/admin-data", dependencies=[Depends(role_checker(["admin"]))])
    """
    def wrapper(user = Depends(get_current_user)):
        user_role = getattr(user, "role", None)
        if not user_role or user_role.lower() not in [r.lower() for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' not authorized"
            )
        return user  # return user object for endpoint if needed
    return wrapper