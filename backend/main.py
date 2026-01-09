from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
import os
import sys
import logging

# Configure logging for Render
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# ============================================================================
# RENDER-SAFE STARTUP: Import database and models with error handling
# ============================================================================
try:
    import models
    from database import engine, check_database_connection
    DATABASE_AVAILABLE = True
    logger.info("✅ Database module loaded successfully")
except Exception as e:
    DATABASE_AVAILABLE = False
    engine = None
    logger.error(f"⚠️ Database module failed to load: {e}")

try:
    from scheduler import start_scheduler, stop_scheduler
    SCHEDULER_AVAILABLE = True
    logger.info("✅ Scheduler module loaded successfully")
except Exception as e:
    SCHEDULER_AVAILABLE = False
    start_scheduler = None
    stop_scheduler = None
    logger.error(f"⚠️ Scheduler module failed to load: {e}")

# ============================================================================
# SAFE ROUTER IMPORTS - Continue even if some routers fail
# ============================================================================
def safe_import_router(module_name: str):
    """Safely import a router, return None if it fails"""
    try:
        module = __import__(f"routers.{module_name}", fromlist=[module_name])
        logger.info(f"✅ Router loaded: {module_name}")
        return module.router
    except Exception as e:
        logger.warning(f"⚠️ Router failed to load: {module_name} - {e}")
        return None

# Import routers safely
routers_to_load = [
    "auth_routes", "users", "customers", "enquiries", "complaints",
    "service_requests", "service_engineer", "feedback", "attendance",
    "mif", "sales", "products", "product_management", "notifications",
    "bookings", "reports", "audit", "orders", "admin_sales", "visitors",
    "stock_movements", "analytics", "invoices", "settings", "chatbot",
    "verified_attendance", "outstanding", "calls"
]

loaded_routers = {}
for router_name in routers_to_load:
    router = safe_import_router(router_name)
    if router:
        loaded_routers[router_name] = router

logger.info(f"📦 Loaded {len(loaded_routers)}/{len(routers_to_load)} routers")


# ============================================================================
# LIFESPAN - Non-blocking startup for Render
# ============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Render-safe startup/shutdown lifecycle"""
    logger.info("🚀 Starting Yamini Infotech ERP System...")
    
    # Step 1: Database initialization (non-blocking)
    if DATABASE_AVAILABLE and engine:
        try:
            # Test connection first
            if check_database_connection():
                logger.info("✅ Database connection verified")
                models.Base.metadata.create_all(bind=engine)
                logger.info("✅ Database tables created/verified")
            else:
                logger.warning("⚠️ Database connection failed - app will start anyway")
        except Exception as e:
            logger.error(f"⚠️ Database initialization error: {e}")
            logger.info("   App will continue - DB operations may fail")
    else:
        logger.warning("⚠️ Database not available - starting without DB")
    
    # Step 2: Scheduler initialization (non-blocking)
    if SCHEDULER_AVAILABLE and start_scheduler:
        try:
            start_scheduler()
            logger.info("✅ Scheduler started - Automated reminders active")
        except Exception as e:
            logger.warning(f"⚠️ Scheduler failed to start: {e}")
    else:
        logger.warning("⚠️ Scheduler not available")
    
    logger.info("🎉 Application startup complete - ready to serve requests")
    
    yield  # App is running
    
    # Shutdown
    logger.info("🛑 Shutting down...")
    if SCHEDULER_AVAILABLE and stop_scheduler:
        try:
            stop_scheduler()
            logger.info("✅ Scheduler stopped")
        except Exception as e:
            logger.warning(f"⚠️ Scheduler stop error: {e}")
    logger.info("👋 Shutdown complete")


# ============================================================================
# FASTAPI APP CREATION
# ============================================================================
app = FastAPI(
    title="Yamini Infotech Business Management System",
    description="Complete business management system with CRM, Sales, Service, and Admin modules",
    version="2.0.0",
    lifespan=lifespan
)

# ============================================================================
# CORS Configuration - Production Ready
# ============================================================================
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]

all_origins = [o.strip() for o in (CORS_ORIGINS + DEFAULT_ORIGINS) if o.strip()]

if os.getenv("CORS_ALLOW_ALL", "false").lower() == "true":
    all_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_credentials=True if all_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# INCLUDE LOADED ROUTERS
# ============================================================================
for router_name, router in loaded_routers.items():
    try:
        app.include_router(router)
        logger.info(f"✅ Router registered: {router_name}")
    except Exception as e:
        logger.error(f"⚠️ Failed to register router {router_name}: {e}")

# ============================================================================
# STATIC FILES
# ============================================================================
try:
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    logger.info("✅ Static files mounted: /uploads")
except Exception as e:
    logger.warning(f"⚠️ Failed to mount uploads directory: {e}")

# ============================================================================
# HEALTH CHECK ENDPOINTS (Critical for Render)
# ============================================================================
@app.get("/")
def read_root():
    """Root endpoint - confirms API is running"""
    return {
        "message": "Yamini Infotech API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for Render
    Returns 200 OK even if DB is down - keeps service alive
    """
    db_status = "unknown"
    if DATABASE_AVAILABLE:
        try:
            if check_database_connection():
                db_status = "connected"
            else:
                db_status = "disconnected"
        except:
            db_status = "error"
    else:
        db_status = "not_configured"
    
    return {
        "status": "healthy",
        "database": db_status,
        "routers_loaded": len(loaded_routers),
        "scheduler": "running" if SCHEDULER_AVAILABLE else "disabled"
    }

@app.get("/api/status")
async def detailed_status():
    """Detailed system status for debugging"""
    return {
        "app": "Yamini Infotech ERP",
        "version": "2.0.0",
        "database_available": DATABASE_AVAILABLE,
        "scheduler_available": SCHEDULER_AVAILABLE,
        "routers_loaded": list(loaded_routers.keys()),
        "routers_failed": [r for r in routers_to_load if r not in loaded_routers],
        "environment": os.getenv("ENVIRONMENT", "production")
    }


# ============================================================================
# MAIN ENTRY POINT (for local development)
# ============================================================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"🚀 Starting server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)

# To run: uvicorn main:app --reload --port 8000
