# # # # app/crud/auth_crud.py
# # # from sqlalchemy.orm import Session
# # # from app.models.user import User
# # # from app.models.expert import Expert
# # # from app.models.admin import Admin
# # # from app.auth.auth_handler import verify_password, create_access_token
# # # from app.schemas.auth import TokenData

# # # def authenticate_user(db: Session, email: str, password: str):
# # #     """
# # #     Try to find the user by email in User, Expert, or Admin tables.
# # #     Returns the user object if valid, otherwise None.
# # #     """
# # #     email_normalized = email.strip().lower()
    
# # #     # Check User
# # #     user = db.query(User).filter(User.email == email_normalized).first()
# # #     if user and verify_password(password, user.password_hash):
# # #         return user, "Customer"
    
# # #     # Check Expert
# # #     expert = db.query(Expert).filter(Expert.email == email_normalized).first()
# # #     if expert and verify_password(password, expert.password_hash):
# # #         return expert, "Expert"
    
# # #     # Check Admin
# # #     admin = db.query(Admin).filter(Admin.email == email_normalized).first()
# # #     if admin and verify_password(password, admin.password_hash):
# # #         return admin, "Admin"
    
# # #     # Not found or invalid password
# # #     return None, None

# # # def create_auth_token(user, role: str):
# # #     """
# # #     Create JWT token for any authenticated user.
# # #     """
# # #     # Determine the correct ID field based on the role to avoid AttributeErrors
# # #     if role == "Admin":
# # #         user_id = user.admin_id
# # #     elif role == "Expert":
# # #         user_id = user.expert_id
# # #     else:
# # #         # Default for Customer
# # #         user_id = user.user_id
        
# # #     token_data = {"user_id": user_id, "role": role}
# # #     token = create_access_token(token_data)
# # #     return token



# # # app/crud/auth_crud.py
# # from sqlalchemy.orm import Session
# # from app.models.user import User
# # from app.models.expert import Expert
# # from app.models.admin import Admin
# # from app.auth.auth_handler import verify_password, create_access_token

# # def authenticate_user(db: Session, email: str, password: str):
# #     """
# #     Try to find the user by email in User, Expert, or Admin tables.
# #     Returns (user, role) if valid, otherwise (None, None).
# #     """
# #     email_normalized = email.strip().lower()

# #     # Check User
# #     user = db.query(User).filter(User.email == email_normalized).first()
# #     if user and verify_password(password, user.password_hash):
# #         return user, "user"

# #     # Check Expert
# #     expert = db.query(Expert).filter(Expert.email == email_normalized).first()
# #     if expert and verify_password(password, expert.password_hash):
# #         return expert, "expert"

# #     # Check Admin
# #     admin = db.query(Admin).filter(Admin.email == email_normalized).first()
# #     if admin and verify_password(password, admin.password_hash):
# #         return admin, "admin"

# #     return None, None


# # def create_auth_token(user, role: str):
# #     """
# #     Create JWT token for any authenticated user.
# #     """
# #     if role == "admin":
# #         user_id = user.admin_id
# #     elif role == "expert":
# #         user_id = user.expert_id
# #     else:  # customer
# #         user_id = user.user_id

# #     token_data = {"user_id": user_id, "role": role}
# #     return create_access_token(token_data)




# from sqlalchemy.orm import Session
# from app.models.user import User
# from app.models.expert import Expert
# from app.models.admin import Admin
# from app.auth.auth_handler import verify_password, create_access_token


# def authenticate_user(db: Session, email: str, password: str):
#     """
#     Try to find the user by email in User, Expert, or Admin tables.
#     Returns (user, role) if valid, otherwise (None, None).
#     """
#     email_normalized = email.strip().lower()

#     user = db.query(User).filter(User.email == email_normalized).first()
#     if user and verify_password(password, user.password_hash):
#         return user, "customer"  # ✅ consistent with auth_bearer.py

#     expert = db.query(Expert).filter(Expert.email == email_normalized).first()
#     if expert and verify_password(password, expert.password_hash):
#         return expert, "expert"

#     admin = db.query(Admin).filter(Admin.email == email_normalized).first()
#     if admin and verify_password(password, admin.password_hash):
#         return admin, "admin"

#     return None, None


# # def create_auth_token(user, role: str):
# #     """
# #     Create JWT token for any authenticated user.
# #     """
# #     if role == "admin":
# #         user_id = user.admin_id
# #     elif role == "expert":
# #         user_id = user.expert_id
# #     else:  # customer
# #         user_id = user.user_id

# #     token_data = {
# #         "_id": user_id,   # ✅ fixed from "user_id" to "_id"
# #         "role": role
# #     }
# #     return create_access_token(token_data)

# def create_auth_token(user, role: str):
#     """
#     Create JWT token for authenticated user.
#     """
#     if role == "admin":
#         user_id = user.admin_id
#     elif role == "expert":
#         user_id = user.expert_id
#     else:
#         user_id = user.user_id

#     return create_access_token({
#         "_id": user_id,
#         "role": role.lower()
#     })


from sqlalchemy.orm import Session
from app.models.user import User
from app.models.expert import Expert
from app.models.admin import Admin
from app.auth.auth_handler import verify_password, create_access_token


# ========================================================= #
#                AUTHENTICATE USER (ALL ROLES)
# ========================================================= #
def authenticate_user(db: Session, email: str, password: str):
    """
    Check User, Expert, Admin tables and validate credentials.
    Returns (user, role) or (None, None).
    """

    email_normalized = email.strip().lower()

    # -----------------------------
    # CUSTOMER
    # -----------------------------
    user = db.query(User).filter(User.email == email_normalized).first()
    if user and verify_password(password, user.password_hash):
        return user, "customer"

    # -----------------------------
    # EXPERT
    # -----------------------------
    expert = db.query(Expert).filter(Expert.email == email_normalized).first()
    if expert and verify_password(password, expert.password_hash):
        return expert, "expert"

    # -----------------------------
    # ADMIN
    # -----------------------------
    admin = db.query(Admin).filter(Admin.email == email_normalized).first()
    if admin and verify_password(password, admin.password_hash):
        return admin, "admin"

    return None, None


# ========================================================= #
#                CREATE AUTH TOKEN (FIXED)
# ========================================================= #
def create_auth_token(user, role: str):
    """
    Generate JWT token for any role.
    ALWAYS uses consistent payload:
    {
        "_id": user_id,
        "role": role
    }
    """

    role_lower = role.lower()

    # -----------------------------
    # GET CORRECT USER ID
    # -----------------------------
    if role_lower == "expert":
        user_id = user.expert_id

    elif role_lower == "admin":
        user_id = user.admin_id

    else:
        user_id = user.user_id

    # -----------------------------
    # JWT PAYLOAD (STANDARDIZED)
    # -----------------------------
    token_data = {
        "_id": user_id,        # ✅ FIXED KEY (IMPORTANT)
        "role": role_lower     # always lowercase
    }

    return create_access_token(token_data)