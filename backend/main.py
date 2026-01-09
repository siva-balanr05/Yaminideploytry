from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models
from database import engine
from scheduler import start_scheduler, stop_scheduler
from contextlib import asynccontextmanager
from pathlib import Path
import os

# Import routers
from routers import auth_routes
from routers import users
from routers import customers
from routers import enquiries
from routers import complaints
from routers import service_requests
from routers import service_engineer
from routers import feedback
from routers import attendance
from routers import mif
from routers import sales
from routers import products
from routers import product_management
from routers import notifications
from routers import bookings
from routers import reports
from routers import audit
from routers import orders
from routers import admin_sales
from routers import visitors
from routers import stock_movements
from routers import analytics
from routers import invoices
from routers import settings
from routers import chatbot
from routers import verified_attendance
from routers import outstanding
from routers import calls


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Yamini Infotech ERP System...")
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Database tables created/verified successfully!")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {str(e)}")
        print("   The app will continue - tables may already exist or will be created on first request.")
    
    try:
        start_scheduler()
        print("Scheduler started - Automated reminders active!")
    except Exception as e:
        print(f"⚠️  Scheduler initialization skipped: {str(e)}")
    yield
    # Shutdown
    print("Shutting down...")
    try:
        stop_scheduler()
        print("Scheduler stopped")
    except Exception as e:
        print(f"⚠️  Scheduler stop skipped: {str(e)}")


app = FastAPI(
    title="Yamini Infotech Business Management System",
    description="Complete business management system with CRM, Sales, Service, and Admin modules",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration - Production Ready
# Get allowed origins from environment variable or use defaults
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []

# Default origins for development
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]

# Combine custom and default origins, filter empty strings
all_origins = [o.strip() for o in (CORS_ORIGINS + DEFAULT_ORIGINS) if o.strip()]

# For development/testing, allow all origins if CORS_ALLOW_ALL is set
if os.getenv("CORS_ALLOW_ALL", "false").lower() == "true":
    all_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_credentials=True if all_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(enquiries.router)
app.include_router(complaints.router)
app.include_router(service_requests.router)
app.include_router(service_engineer.router)
app.include_router(feedback.router)
app.include_router(attendance.router)
app.include_router(mif.router)
app.include_router(sales.router)
app.include_router(orders.router)
app.include_router(admin_sales.router)
app.include_router(products.router)
app.include_router(product_management.router)
app.include_router(notifications.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(visitors.router)
app.include_router(stock_movements.router)
app.include_router(analytics.router)
app.include_router(invoices.router)
app.include_router(settings.router)
app.include_router(chatbot.router)
app.include_router(verified_attendance.router)
app.include_router(outstanding.router)
app.include_router(calls.router)

# Mount static files for uploads
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {
        "message": "Yamini Infotech API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# To run: uvicorn main:app --reload --port 8000
