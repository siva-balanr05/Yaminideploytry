"""
Database Configuration for FastAPI + PostgreSQL (Neon)
Production-ready with SSL support, connection pooling, and error handling.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv
from typing import Generator
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please add it to your .env file or environment variables."
    )

# Handle Render's postgres:// vs postgresql:// URL format
# Neon and most providers use postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# For psycopg2 driver compatibility (if using psycopg2-binary)
# Neon requires SSL - ensure sslmode is in the URL or add connect_args
if "sslmode" not in DATABASE_URL:
    # Append sslmode=require for Neon
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

# Create engine with production-ready settings for Neon PostgreSQL
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,              # Number of connections to keep open
    max_overflow=10,          # Max additional connections when pool is exhausted
    pool_timeout=30,          # Seconds to wait for a connection from pool
    pool_recycle=1800,        # Recycle connections after 30 minutes (Neon idle timeout)
    pool_pre_ping=True,       # Verify connections before using (handles stale connections)
    echo=os.getenv("SQL_DEBUG", "false").lower() == "true",
    # Connect args for additional SSL configuration if needed
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
    }
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Declarative base for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.
    Ensures proper cleanup after request completion.
    
    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def check_database_connection() -> bool:
    """
    Test database connection. Useful for health checks.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            conn.commit()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def init_database() -> None:
    """
    Initialize database tables.
    Call this on application startup.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
