from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.db import get_db
from app.models.user import User
from app.models.expert import Expert
from app.models.admin import Admin
from app.models.disease import Disease
from app.models.consult import Consultation
from app.models.message import Message
from app.models.scan import Scan
from app.models.history import History
from app.schemas.response import APIResponse
from app.auth.role_checker import role_checker
from app.auth.auth_bearer import get_current_user
from typing import List

router = APIRouter()


# ---------------------------------------------------------
# Main Dashboard Summary (Admin Only)
# ---------------------------------------------------------
@router.get(
    "/dashboard",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        total_users = db.query(User).count()
        total_experts = db.query(Expert).count()
        verified_experts = db.query(Expert).filter(
            Expert.is_verified == True
        ).count()
        unverified_experts = db.query(Expert).filter(
            Expert.is_verified == False
        ).count()
        total_admins = db.query(Admin).count()
        total_diseases = db.query(Disease).count()
        total_consultations = db.query(Consultation).count()
        total_messages = db.query(Message).count()
        total_scans = db.query(Scan).count()

        # Consultation status breakdown
        open_consultations = db.query(Consultation).filter(
            Consultation.status == "Open"
        ).count()
        in_progress_consultations = db.query(Consultation).filter(
            Consultation.status == "In-Progress"
        ).count()
        resolved_consultations = db.query(Consultation).filter(
            Consultation.status == "Resolved"
        ).count()

        # Online users via WebSocket
        from app.websocket.connect_manager import manager
        online_users = manager.get_connected_clients()

        return APIResponse(
            success=True,
            message="Dashboard data fetched successfully",
            data={
                "users": {
                    "total_users": total_users,
                    "total_experts": total_experts,
                    "verified_experts": verified_experts,
                    "unverified_experts": unverified_experts,
                    "total_admins": total_admins
                },
                "diseases": {
                    "total_diseases": total_diseases
                },
                "scans": {
                    "total_scans": total_scans
                },
                "consultations": {
                    "total_consultations": total_consultations,
                    "open": open_consultations,
                    "in_progress": in_progress_consultations,
                    "resolved": resolved_consultations
                },
                "messages": {
                    "total_messages": total_messages
                },
                "online": {
                    "online_count": len(online_users),
                    "clients": online_users
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Dashboard failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Most Active Expert
# ---------------------------------------------------------
@router.get(
    "/most-active-expert",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def most_active_expert(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        result = (
            db.query(
                Expert.expert_id,
                Expert.first_name,
                Expert.last_name,
                Expert.email,
                Expert.specialization,
                func.count(Consultation.consult_id).label("total_consultations"),
                func.sum(
                    func.cast(Consultation.status == "Resolved", int)
                ).label("resolved_consultations")
            )
            .join(Consultation, Consultation.expert_id == Expert.expert_id)
            .group_by(
                Expert.expert_id,
                Expert.first_name,
                Expert.last_name,
                Expert.email,
                Expert.specialization
            )
            .order_by(func.count(Consultation.consult_id).desc())
            .first()
        )

        if not result:
            return APIResponse(
                success=False,
                message="No expert data found",
                data=None
            )

        return APIResponse(
            success=True,
            message="Most active expert fetched",
            data={
                "expert_id": result.expert_id,
                "expert_name": f"{result.first_name} {result.last_name}",
                "email": result.email,
                "specialization": result.specialization,
                "total_consultations": result.total_consultations,
                "resolved_consultations": result.resolved_consultations or 0
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Consultations Per Month
# ---------------------------------------------------------
@router.get(
    "/consultations-per-month",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def consultations_per_month(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        results = (
            db.query(
                extract("year", Consultation.created_at).label("year"),
                extract("month", Consultation.created_at).label("month"),
                func.count(Consultation.consult_id).label("count")
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )

        month_names = {
            1: "January", 2: "February", 3: "March",
            4: "April", 5: "May", 6: "June",
            7: "July", 8: "August", 9: "September",
            10: "October", 11: "November", 12: "December"
        }

        return APIResponse(
            success=True,
            message="Consultations per month fetched",
            data={
                "chart_data": [
                    {
                        "year": int(r.year),
                        "month": int(r.month),
                        "month_name": month_names[int(r.month)],
                        "consultation_count": r.count
                    }
                    for r in results
                ]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Scans Per Month
# ---------------------------------------------------------
@router.get(
    "/scans-per-month",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def scans_per_month(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        results = (
            db.query(
                extract("year", Scan.created_at).label("year"),
                extract("month", Scan.created_at).label("month"),
                func.count(Scan.scan_id).label("count")
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )

        month_names = {
            1: "January", 2: "February", 3: "March",
            4: "April", 5: "May", 6: "June",
            7: "July", 8: "August", 9: "September",
            10: "October", 11: "November", 12: "December"
        }

        return APIResponse(
            success=True,
            message="Scans per month fetched",
            data={
                "chart_data": [
                    {
                        "year": int(r.year),
                        "month": int(r.month),
                        "month_name": month_names[int(r.month)],
                        "scan_count": r.count
                    }
                    for r in results
                ]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Most Common Diseases Detected
# ---------------------------------------------------------
@router.get(
    "/common-diseases",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def most_common_diseases(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        results = (
            db.query(
                Disease.disease_id,
                Disease.name,
                Disease.urgency_level,
                func.count(Scan.scan_id).label("detection_count")
            )
            .join(Scan, Scan.disease_id == Disease.disease_id)
            .group_by(
                Disease.disease_id,
                Disease.name,
                Disease.urgency_level
            )
            .order_by(func.count(Scan.scan_id).desc())
            .all()
        )

        return APIResponse(
            success=True,
            message="Most common diseases fetched",
            data={
                "diseases": [
                    {
                        "disease_id": r.disease_id,
                        "disease_name": r.name,
                        "urgency_level": r.urgency_level,
                        "detection_count": r.detection_count
                    }
                    for r in results
                ]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# New Users Per Month
# ---------------------------------------------------------
@router.get(
    "/users-per-month",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def users_per_month(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        results = (
            db.query(
                extract("year", User.created_at).label("year"),
                extract("month", User.created_at).label("month"),
                func.count(User.user_id).label("count")
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )

        month_names = {
            1: "January", 2: "February", 3: "March",
            4: "April", 5: "May", 6: "June",
            7: "July", 8: "August", 9: "September",
            10: "October", 11: "November", 12: "December"
        }

        return APIResponse(
            success=True,
            message="New users per month fetched",
            data={
                "chart_data": [
                    {
                        "year": int(r.year),
                        "month": int(r.month),
                        "month_name": month_names[int(r.month)],
                        "new_users": r.count
                    }
                    for r in results
                ]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )


# ---------------------------------------------------------
# Recent Activity Feed
# ---------------------------------------------------------
@router.get(
    "/recent-activity",
    response_model=APIResponse[dict],
    dependencies=[Depends(role_checker(["admin"]))]
)
def recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # Recent consultations
        recent_consultations = (
            db.query(Consultation)
            .order_by(Consultation.created_at.desc())
            .limit(limit)
            .all()
        )

        # Recent scans
        recent_scans = (
            db.query(Scan)
            .order_by(Scan.created_at.desc())
            .limit(limit)
            .all()
        )

        # Recent users
        recent_users = (
            db.query(User)
            .order_by(User.created_at.desc())
            .limit(limit)
            .all()
        )

        return APIResponse(
            success=True,
            message="Recent activity fetched",
            data={
                "recent_consultations": [
                    {
                        "consult_id": c.consult_id,
                        "subject": c.subject,
                        "status": c.status,
                        "priority": c.priority,
                        "created_at": str(c.created_at)
                    }
                    for c in recent_consultations
                ],
                "recent_scans": [
                    {
                        "scan_id": s.scan_id,
                        "confidence_score": s.confidence_score,
                        "urgency_level": s.urgency_level,
                        "created_at": str(s.created_at)
                    }
                    for s in recent_scans
                ],
                "recent_users": [
                    {
                        "user_id": u.user_id,
                        "name": f"{u.first_name} {u.last_name}",
                        "email": u.email,
                        "created_at": str(u.created_at)
                    }
                    for u in recent_users
                ]
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            message=f"Failed: {str(e)}",
            data=None
        )