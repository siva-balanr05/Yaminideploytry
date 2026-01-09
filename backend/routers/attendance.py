"""
Attendance Management Router
Handles employee attendance check-in/check-out and status tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from datetime import datetime, date, timedelta
from typing import List, Optional
import pytz
import models
import schemas
import crud
from auth import get_current_user, get_db
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

# IST timezone
IST = pytz.timezone('Asia/Kolkata')

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/attendance")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/check-in")
async def check_in_with_photo(
    photo: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    attendance_status: str = Form(...),
    time: str = Form(...),
    location: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check in for the day with photo upload
    Only one check-in per day is allowed
    """
    # ✅ Get IST time (business timezone)
    now_utc = datetime.utcnow()
    now_ist = datetime.now(IST)
    today_ist = now_ist.date()
    
    # Check if already checked in today (using attendance_date)
    existing_attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.attendance_date == today_ist
    ).first()
    
    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )
    
    # Save uploaded photo
    file_extension = os.path.splitext(photo.filename)[1]
    photo_filename = f"{current_user.id}_{now_ist.strftime('%Y%m%d_%H%M%S')}{file_extension}"
    photo_path = UPLOAD_DIR / photo_filename
    
    with photo_path.open("wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    # 📘 DISCIPLINE: Check cutoff time (9:30 AM IST)
    cutoff_time = now_ist.replace(hour=9, minute=30, second=0, microsecond=0)
    is_late = now_ist > cutoff_time
    status_text = "Late" if is_late else "Present"
    
    # Create attendance record
    db_attendance = models.Attendance(
        employee_id=current_user.id,
        date=now_utc,  # UTC timestamp for logs
        attendance_date=today_ist,  # Business date (IST) - SINGLE SOURCE OF TRUTH
        time=now_ist.strftime("%H:%M:%S"),
        location=location,
        latitude=latitude,
        longitude=longitude,
        photo_path=str(photo_path),
        status=status_text
    )
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    # 🔔 Notify admin if late
    if is_late:
        try:
            from notification_service import NotificationService
            NotificationService.create_notification(
                db=db,
                title=f"⚠️ Late Attendance: {current_user.full_name}",
                message=f"Checked in at {now_ist.strftime('%I:%M %p')} (after 9:30 AM cutoff)",
                type="ALERT",
                user_id=None,
                role=models.UserRole.ADMIN
            )
        except Exception as e:
            import logging
            logging.error(f"Failed to send late attendance alert: {e}")
    
    return {
        "id": db_attendance.id,
        "employee_id": db_attendance.employee_id,
        "date": db_attendance.date.isoformat(),
        "attendance_date": db_attendance.attendance_date.isoformat(),
        "time": db_attendance.time,
        "status": db_attendance.status,
        "location": db_attendance.location,
        "latitude": db_attendance.latitude,
        "longitude": db_attendance.longitude,
        "photo_path": db_attendance.photo_path
    }


@router.get("/today")
def get_today_attendance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ✅ SINGLE SOURCE OF TRUTH: Get today's attendance record
    
    Returns ONE record or None based on attendance_date (IST business date)
    No arrays, no timezone confusion, no frontend parsing
    """
    today_ist = datetime.now(IST).date()
    
    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.attendance_date == today_ist
    ).first()
    
    if not attendance:
        return None
    
    return {
        "id": attendance.id,
        "employee_id": attendance.employee_id,
        "attendance_date": attendance.attendance_date.isoformat(),
        "date": attendance.date.isoformat(),
        "time": attendance.time,
        "status": attendance.status,
        "location": attendance.location,
        "latitude": attendance.latitude,
        "longitude": attendance.longitude,
        "photo_path": attendance.photo_path
    }


@router.post("/check-in-json", response_model=schemas.Attendance)
def check_in(
    attendance_data: schemas.AttendanceCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check in for the day (JSON-based, legacy)
    Only one check-in per day is allowed
    """
    now = datetime.now()
    today = now.date()
    
    # Check if already checked in today
    existing_attendance = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            func.date(models.Attendance.date) == today
        )
    ).first()
    
    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )
    
    # 📘 DISCIPLINE: Check cutoff time (9:30 AM)
    cutoff_time = datetime.combine(today, datetime.min.time()) + timedelta(hours=9, minutes=30)
    is_late = now > cutoff_time
    status_text = "Late" if is_late else "On Time"
    
    # Validate photo path is provided
    if not attendance_data.photo_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="📸 Photo required for attendance"
        )
    
    # Create attendance record
    db_attendance = models.Attendance(
        employee_id=current_user.id,
        date=now,
        time=now.strftime("%H:%M:%S"),
        location=attendance_data.location,
        latitude=attendance_data.latitude,
        longitude=attendance_data.longitude,
        photo_path=attendance_data.photo_path,
        status=status_text
    )
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    # 🔔 Notify admin if late
    if is_late:
        try:
            NotificationService.create_notification(
                db=db,
                title=f"⚠️ Late Attendance: {current_user.full_name}",
                message=f"Checked in at {now.strftime('%I:%M %p')} (after 9:30 AM cutoff)",
                type="ALERT",
                user_id=None,
                role=models.UserRole.ADMIN
            )
        except Exception as e:
            import logging
            logging.error(f"Failed to send late attendance alert: {e}")
    
    return db_attendance


@router.get("/today", response_model=Optional[schemas.Attendance])
def get_today_attendance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's attendance record for current user
    Returns None if not checked in
    """
    today = date.today()
    
    print(f"DEBUG: Checking attendance for user {current_user.id} on date {today}")
    
    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.attendance_date == today
    ).first()
    
    if attendance:
        print(f"DEBUG: Found attendance - Date: {attendance.attendance_date}, Status: {attendance.status}")
    else:
        print(f"DEBUG: No attendance found for today")
    
    return attendance


@router.get("/status")
def get_attendance_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user has checked in today
    Returns: { checked_in: boolean, attendance: object or null }
    """
    today = datetime.now().date()
    
    attendance = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            func.date(models.Attendance.date) == today
        )
    ).first()
    
    return {
        "checked_in": attendance is not None,
        "attendance": attendance
    }


@router.get("/my-history", response_model=List[schemas.Attendance])
def get_my_attendance_history(
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get attendance history for current user
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    attendance_records = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            models.Attendance.date >= start_date
        )
    ).order_by(models.Attendance.date.desc()).all()
    
    return attendance_records


@router.get("/employee/{employee_id}", response_model=List[schemas.Attendance])
def get_employee_attendance(
    employee_id: int,
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get attendance history for specific employee
    Admin/Reception only
    """
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.RECEPTION]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other employees' attendance"
        )
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    attendance_records = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == employee_id,
            models.Attendance.date >= start_date
        )
    ).order_by(models.Attendance.date.desc()).all()
    
    return attendance_records


@router.get("/all/today", response_model=List[dict])
def get_all_today_attendance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's attendance for all employees
    Admin/Reception only
    """
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.RECEPTION]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view all attendance"
        )
    
    today = date.today()
    
    # Get all active employees
    employees = db.query(models.User).filter(
        models.User.is_active == True,
        models.User.role.in_([
            models.UserRole.SALESMAN,
            models.UserRole.SERVICE_ENGINEER,
            models.UserRole.RECEPTION
        ])
    ).all()
    
    attendance_data = []
    for employee in employees:
        # Query attendance with fallback for older records
        attendance = db.query(models.Attendance).filter(
            models.Attendance.employee_id == employee.id,
            or_(
                models.Attendance.attendance_date == today,
                and_(
                    models.Attendance.attendance_date == None,
                    func.date(models.Attendance.date) == today
                )
            )
        ).first()
        
        attendance_info = None
        if attendance:
            attendance_info = {
                "id": attendance.id,
                "employee_id": attendance.employee_id,
                "date": attendance.date.isoformat() if attendance.date else None,
                "attendance_date": attendance.attendance_date.isoformat() if attendance.attendance_date else None,
                "time": attendance.time,
                "location": attendance.location,
                "latitude": attendance.latitude,
                "longitude": attendance.longitude,
                "photo_path": attendance.photo_path,
                "status": attendance.status,
                "check_in_time": attendance.check_in_time,
                "check_in_lat": attendance.check_in_lat,
                "check_in_lng": attendance.check_in_lng,
                "photo_url": attendance.photo_url
            }
        
        attendance_data.append({
            "employee_id": employee.id,
            "employee_name": employee.full_name,
            "role": employee.role,
            "checked_in": attendance is not None,
            "attendance": attendance_info
        })
    
    return attendance_data
