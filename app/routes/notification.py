



# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List
# from app.db import get_db
# from app.schemas.response import APIResponse
# from app.schemas.notification import NotificationOut
# from app.crud.notification import (
#     get_user_notifications,
#     mark_all_user_notifications_read,
#     delete_all_user_notifications
# )
# from app.auth.auth_bearer import get_current_user
# from app.models.notification import Notification

# router = APIRouter()


# # =========================================================
# # STATIC ROUTES FIRST — before /{notification_id}
# # =========================================================

# #==============================================================#
# #         GET ALL NOTIFICATIONS FOR CURRENT USER               #
# #==============================================================#
# @router.get("/", response_model=APIResponse[List[NotificationOut]])
# def route_get_my_notifications(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         notifications = get_user_notifications(db, current_user.user_id, current_user.role)
#         return APIResponse(success=True, message=f"Found {len(notifications)} notifications", data=notifications)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=f"Failed to fetch notifications: {str(e)}", data=None)


# #==============================================================#
# #                  GET UNREAD NOTIFICATIONS COUNT              #
# #==============================================================#
# @router.get("/unread-count", response_model=APIResponse[dict])
# def route_get_unread_count(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         role_field = f"{current_user.role}_id"
#         count = db.query(Notification).filter(
#             getattr(Notification, role_field) == current_user.user_id,
#             Notification.is_read == False
#         ).count()

#         return APIResponse(success=True, message="Unread count fetched", data={"unread_count": count})
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


# #==============================================================#
# #                   MARK ALL NOTIFICATIONS AS READ             #
# #==============================================================#
# @router.patch("/read-all", response_model=APIResponse[bool])
# async def route_mark_all_read(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         await mark_all_user_notifications_read(db, current_user.user_id, current_user.role)
#         return APIResponse(success=True, message="All notifications marked as read", data=True)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=f"Failed: {str(e)}", data=False)


# #==============================================================#
# #                        DELETE ALL NOTIFICATIONS              #
# #==============================================================#
# @router.delete("/clear-all", response_model=APIResponse[bool])
# async def route_clear_notifications(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         await delete_all_user_notifications(db, current_user.user_id, current_user.role)
#         return APIResponse(success=True, message="All notifications cleared", data=True)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=f"Failed: {str(e)}", data=False)


# # =========================================================
# # PARAMETERIZED ROUTES LAST
# # =========================================================

# #==============================================================#
# #                     MARK NOTIFICATION AS READ                #
# #==============================================================#
# @router.patch("/{notification_id}/read", response_model=APIResponse[NotificationOut])
# def route_mark_single_read(
#     notification_id: int,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         db_notif = db.query(Notification).filter(Notification.id == notification_id).first()
#         if not db_notif:
#             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

#         role_field = f"{current_user.role}_id"
#         if getattr(db_notif, role_field) != current_user._id:
#             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this notification")

#         db_notif.is_read = True
#         db.commit()
#         db.refresh(db_notif)

#         return APIResponse(success=True, message="Notification marked as read", data=db_notif)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


# #==============================================================#
# #                     DELETE SINGLE NOTIFICATION               #
# #==============================================================#
# @router.delete("/{notification_id}", response_model=APIResponse[bool])
# def route_delete_notification(
#     notification_id: int,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     try:
#         db_notif = db.query(Notification).filter(Notification.id == notification_id).first()
#         if not db_notif:
#             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

#         role_field = f"{current_user.role}_id"
#         if getattr(db_notif, role_field) != current_user._id:
#             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this notification")

#         db.delete(db_notif)
#         db.commit()

#         return APIResponse(success=True, message="Notification deleted", data=True)
#     except HTTPException:
#         raise
#     except Exception as e:
#         return APIResponse(success=False, message=f"Failed: {str(e)}", data=False)


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.response import APIResponse
from app.schemas.notification import NotificationOut
from app.crud.notification import (
    get_user_notifications,
    mark_all_user_notifications_read,
    delete_all_user_notifications
)
from app.auth.auth_bearer import get_current_user
from app.models.notification import Notification

router = APIRouter()

# 🔥 HELPER FUNCTION - Get correct user ID
def get_user_id(current_user):
    """Handle both user_id and _id fields"""
    return getattr(current_user, 'user_id', getattr(current_user, '_id', None))

# =========================================================
# FIXED ROUTES
# =========================================================

@router.get("/", response_model=APIResponse[List[NotificationOut]])
def route_get_my_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = get_user_id(current_user)
        if not user_id:
            raise ValueError("No user ID found")
            
        print(f"🔍 Fetching notifications for user_id={user_id}, role={current_user.role}")
        notifications = get_user_notifications(db, user_id, current_user.role)
        return APIResponse(success=True, message=f"Found {len(notifications)} notifications", data=notifications)
    except Exception as e:
        print(f"❌ Notification fetch error: {e}")
        return APIResponse(success=False, message=f"Failed to fetch notifications: {str(e)}", data=None)


@router.get("/unread-count", response_model=APIResponse[dict])
def route_get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = get_user_id(current_user)
        role_field = f"{current_user.role}_id"
        count = db.query(Notification).filter(
            getattr(Notification, role_field) == user_id,  # ✅ Fixed
            Notification.is_read == False
        ).count()

        return APIResponse(success=True, message="Unread count fetched", data={"unread_count": count})
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


@router.patch("/read-all", response_model=APIResponse[bool])
async def route_mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = get_user_id(current_user)
        await mark_all_user_notifications_read(db, user_id, current_user.role)
        return APIResponse(success=True, message="All notifications marked as read", data=True)
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=False)


@router.delete("/clear-all", response_model=APIResponse[bool])
async def route_clear_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = get_user_id(current_user)
        await delete_all_user_notifications(db, user_id, current_user.role)
        return APIResponse(success=True, message="All notifications cleared", data=True)
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=False)


# FIXED SINGLE NOTIFICATION ROUTES
@router.patch("/{notification_id}/read", response_model=APIResponse[NotificationOut])
def route_mark_single_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        db_notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if not db_notif:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

        user_id = get_user_id(current_user)
        role_field = f"{current_user.role}_id"
        
        # ✅ FIXED: Use consistent user_id
        if getattr(db_notif, role_field) != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        db_notif.is_read = True
        db.commit()
        db.refresh(db_notif)
        return APIResponse(success=True, message="Notification marked as read", data=db_notif)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=None)


@router.delete("/{notification_id}", response_model=APIResponse[bool])
def route_delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        db_notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if not db_notif:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

        user_id = get_user_id(current_user)
        role_field = f"{current_user.role}_id"
        
        # ✅ FIXED: Use consistent user_id
        if getattr(db_notif, role_field) != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        db.delete(db_notif)
        db.commit()
        return APIResponse(success=True, message="Notification deleted", data=True)
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(success=False, message=f"Failed: {str(e)}", data=False)