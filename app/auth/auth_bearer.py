



# # # app/auth/auth_bearer.py
# # from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# # from fastapi import Depends, HTTPException, status
# # from sqlalchemy.orm import Session
# # from app.db import get_db
# # from app.auth.auth_handler import decode_access_token
# # from app.models.user import User
# # from app.models.expert import Expert
# # from app.models.admin import Admin

# # security = HTTPBearer()

# # def get_current_user(
# #     credentials: HTTPAuthorizationCredentials = Depends(security),
# #     db: Session = Depends(get_db)
# # ):
# #     token = credentials.credentials
# #     try:
# #         payload = decode_access_token(token)
# #         user_id = payload.get("_id")
# #         role = payload.get("role")

# #         if not user_id or not role:
# #             raise HTTPException(
# #                 status_code=status.HTTP_401_UNAUTHORIZED,
# #                 detail="Invalid token payload"
# #             )
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_401_UNAUTHORIZED,
# #             detail=str(e)
# #         )

# #     role_lower = role.lower()

# #     if role_lower == "customer":
# #         user = db.query(User).filter(User.user_id == user_id).first()
# #     elif role_lower == "expert":
# #         user = db.query(Expert).filter(Expert.expert_id == user_id).first()
# #     elif role_lower == "admin":
# #         user = db.query(Admin).filter(Admin.admin_id == user_id).first()
# #     else:
# #         raise HTTPException(
# #             status_code=status.HTTP_401_UNAUTHORIZED,
# #             detail="Invalid user role"
# #         )

# #     if not user:
# #         raise HTTPException(
# #             status_code=status.HTTP_401_UNAUTHORIZED,
# #             detail="User not found"
# #         )

# #     # ✅ Set universal attributes reliably
# #     user.role = role_lower
# #     user._id = user_id
# #     user.user_id = user_id  # ✅ also set user_id so both work

# #     return user


# # app/auth/auth_bearer.py

# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from fastapi import Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.db import get_db
# from app.auth.auth_handler import decode_access_token
# from app.models.user import User
# from app.models.expert import Expert
# from app.models.admin import Admin

# security = HTTPBearer()

# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: Session = Depends(get_db)
# ):
#     token = credentials.credentials

#     payload = decode_access_token(token)

#     # ✅ FIX: support multiple possible keys
#     user_id = payload.get("_id") or payload.get("user_id") or payload.get("sub") or payload.get("id")
#     role = payload.get("role")

#     if not user_id or not role:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token payload"
#         )

#     role_lower = role.lower()

#     # IMPORTANT: ensure correct model lookup
#     if role_lower == "customer":
#         user = db.query(User).filter(User.user_id == user_id).first()

#     elif role_lower == "expert":
#         user = db.query(Expert).filter(Expert.expert_id == user_id).first()

#     elif role_lower == "admin":
#         user = db.query(Admin).filter(Admin.admin_id == user_id).first()

#     else:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid user role"
#         )

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found"
#         )

#     # ✅ DO NOT overwrite DB IDs (IMPORTANT FIX)
#     user.role = role_lower

#     return user



# app/auth/auth_bearer.py

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth.auth_handler import decode_access_token
from app.models.user import User
from app.models.expert import Expert
from app.models.admin import Admin

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    # ✅ FIX: flexible ID support
    user_id = (
        payload.get("_id")
        or payload.get("user_id")
        or payload.get("sub")
        or payload.get("id")
    )

    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    role_lower = role.lower()

    # -----------------------------
    # ROLE ROUTING
    # -----------------------------
    if role_lower == "customer":
        user = db.query(User).filter(User.user_id == user_id).first()

    elif role_lower == "expert":
        user = db.query(Expert).filter(Expert.expert_id == user_id).first()

    elif role_lower == "admin":
        user = db.query(Admin).filter(Admin.admin_id == user_id).first()

    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid role"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # ✅ DO NOT mutate IDs (IMPORTANT FIX)
    user.role = role_lower

    return user