


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest
from app.crud import auth
from app.db import get_db

router = APIRouter()


# # @router.post("/login")
# # def login(login_data: LoginRequest, db: Session = Depends(get_db)):
# #     try:
# #         # 1. Authenticate user
# #         user, role = auth.authenticate_user(
# #             db,
# #             login_data.email,
# #             login_data.password
# #         )

# #         if not user:
# #             raise HTTPException(
# #                 status_code=status.HTTP_401_UNAUTHORIZED,
# #                 detail="Invalid email or password"
# #             )

# #         # 2. Create token (ONLY ONE WAY — IMPORTANT)
# #         token = auth.create_auth_token(user, role)

# #         role_lower = role.lower()

# #         # 3. Get correct user ID for response
# #         if role_lower == "expert":
# #             user_id = user.expert_id
# #         elif role_lower == "admin":
# #             user_id = user.admin_id
# #         else:
# #             user_id = user.user_id

# #         # 4. Return response
# #         return {
# #             "access_token": token,
# #             "token_type": "bearer",
# #             "user_id": user_id,
# #             "role": role_lower,
# #             "first_name": user.first_name,
# #             "last_name": user.last_name,
# #             "mid_name": getattr(user, "mid_name", None),
# #             "email": user.email,
# #             "telephone": user.telephone
# #         }

# #     except HTTPException:
# #         raise

# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail=f"Login failed: {str(e)}"
# #         )






@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user, role = auth.authenticate_user(
            db,
            login_data.email,
            login_data.password
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = auth.create_auth_token(user, role)

        role_lower = role.lower()

        user_id = (
            user.expert_id if role_lower == "expert"
            else user.admin_id if role_lower == "admin"
            else user.user_id
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user_id,
            "role": role_lower,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))



