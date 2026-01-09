#!/usr/bin/env python
"""
Comprehensive Database Analysis, Verification, and Initialization Script
Checks if database exists, verifies schema, creates if needed, and seeds data
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import psycopg2
from psycopg2 import sql
import json
from datetime import datetime

# Configuration
DB_HOST = 'localhost'
DB_USER = 'postgres'
DB_PASSWORD = 'postgres'
DB_NAME = 'yamini_infotech'
DB_PORT = 5432

print("=" * 80)
print("DATABASE ANALYSIS AND INITIALIZATION SCRIPT")
print("=" * 80)
print(f"Target Database: {DB_NAME}@{DB_HOST}:{DB_PORT}")
print()

# Step 1: Check PostgreSQL connection
print("📋 STEP 1: Checking PostgreSQL Connection")
print("-" * 80)

try:
    postgres_conn = psycopg2.connect(
        host=DB_HOST,
        database='postgres',
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    postgres_conn.autocommit = True
    postgres_cur = postgres_conn.cursor()
    print("✅ PostgreSQL server is running and accessible")
    postgres_cur.close()
    postgres_conn.close()
except Exception as e:
    print(f"❌ Cannot connect to PostgreSQL: {e}")
    sys.exit(1)

# Step 2: Check if database exists
print("\n📋 STEP 2: Checking if Database Exists")
print("-" * 80)

conn = psycopg2.connect(
    host=DB_HOST,
    database='postgres',
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)
conn.autocommit = True
cur = conn.cursor()

cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
db_exists = cur.fetchone() is not None

if db_exists:
    print(f"✅ Database '{DB_NAME}' already exists")
else:
    print(f"⚠️  Database '{DB_NAME}' does not exist - Creating...")
    try:
        cur.execute(f"CREATE DATABASE {DB_NAME}")
        print(f"✅ Database '{DB_NAME}' created successfully")
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

cur.close()
conn.close()

# Step 3: Connect to the target database
print("\n📋 STEP 3: Connecting to Target Database")
print("-" * 80)

try:
    db_conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    db_conn.autocommit = True
    db_cur = db_conn.cursor()
    print(f"✅ Successfully connected to '{DB_NAME}'")
except Exception as e:
    print(f"❌ Cannot connect to '{DB_NAME}': {e}")
    sys.exit(1)

# Step 4: Check existing tables
print("\n📋 STEP 4: Checking Existing Tables")
print("-" * 80)

db_cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
""")
existing_tables = [row[0] for row in db_cur.fetchall()]

if existing_tables:
    print(f"✅ Found {len(existing_tables)} existing tables:")
    for table in existing_tables:
        db_cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = db_cur.fetchone()[0]
        print(f"   - {table:25} ({count:5} rows)")
else:
    print("⚠️  No tables found - Database is empty")

# Step 5: Drop existing tables if they exist
print("\n📋 STEP 5: Clearing Existing Tables (if any)")
print("-" * 80)

if existing_tables:
    print("Dropping existing tables with CASCADE...")
    tables_to_drop = [
        "audit_logs", "visitor_logs", "attendance", "stock_movements",
        "invoices", "orders", "feedback", "complaints", "service_requests",
        "mif_access_logs", "mif_records", "bookings", "enquiries",
        "sales_calls", "products", "customers", "users", "chatbot_knowledge"
    ]
    
    for table in tables_to_drop:
        try:
            db_cur.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            print(f"   ✅ {table}")
        except Exception as e:
            print(f"   ⚠️  {table}: {str(e)[:50]}")
    
    print("✅ All tables cleared")
else:
    print("✅ No tables to drop")

db_cur.close()
db_conn.close()

# Step 6: Create tables from SQLAlchemy models
print("\n📋 STEP 6: Creating Database Schema from Models")
print("-" * 80)

try:
    from database import engine
    import models
    
    models.Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully")
    
    # Verify tables were created
    db_conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    db_cur = db_conn.cursor()
    db_cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    new_tables = [row[0] for row in db_cur.fetchall()]
    print(f"   Created {len(new_tables)} tables: {', '.join(new_tables[:5])}...")
    db_cur.close()
    db_conn.close()
    
except Exception as e:
    print(f"❌ Error creating tables: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 7: Seed demo data
print("\n📋 STEP 7: Seeding Demo User Data")
print("-" * 80)

try:
    from database import SessionLocal
    import crud
    import schemas
    
    db = SessionLocal()
    
    # Check if users already exist
    from models import User
    existing_users = db.query(User).count()
    
    if existing_users > 0:
        print(f"✅ Database already has {existing_users} users - Skipping seed data")
    else:
        users_data = [
            {
                "username": "admin",
                "email": "admin@yamini.com",
                "password": "admin123",
                "full_name": "System Administrator",
                "role": "ADMIN"
            },
            {
                "username": "reception",
                "email": "reception@yamini.com",
                "password": "reception123",
                "full_name": "Reception Staff",
                "role": "RECEPTION"
            },
            {
                "username": "salesman",
                "email": "salesman@yamini.com",
                "password": "sales123",
                "full_name": "Sales Representative",
                "role": "SALESMAN"
            },
            {
                "username": "engineer",
                "email": "engineer@yamini.com",
                "password": "engineer123",
                "full_name": "Service Engineer",
                "role": "SERVICE_ENGINEER"
            },
            {
                "username": "office",
                "email": "office@yamini.com",
                "password": "office123",
                "full_name": "Office Staff",
                "role": "RECEPTION"
            },
            {
                "username": "customer",
                "email": "customer@yamini.com",
                "password": "customer123",
                "full_name": "Demo Customer",
                "role": "CUSTOMER"
            },
        ]
        
        for user_data in users_data:
            try:
                user_create = schemas.UserCreate(**user_data)
                crud.create_user(db=db, user=user_create)
                print(f"   ✅ {user_data['username']:12} ({user_data['role']})")
            except Exception as e:
                print(f"   ⚠️  {user_data['username']}: {str(e)[:40]}")
        
        print("✅ Demo users created")
    
    db.close()
    
except Exception as e:
    print(f"❌ Error seeding data: {e}")
    import traceback
    traceback.print_exc()

# Step 8: Final verification
print("\n📋 STEP 8: Final Database Verification")
print("-" * 80)

try:
    db_conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    db_cur = db_conn.cursor()
    
    # Count tables
    db_cur.execute("""
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    table_count = db_cur.fetchone()[0]
    
    # Count users
    db_cur.execute("SELECT COUNT(*) FROM users")
    user_count = db_cur.fetchone()[0]
    
    print(f"✅ Database Status:")
    print(f"   - Database: {DB_NAME}")
    print(f"   - Tables: {table_count}")
    print(f"   - Users: {user_count}")
    
    if user_count > 0:
        db_cur.execute("SELECT username, role, email FROM users ORDER BY id")
        users = db_cur.fetchall()
        print(f"\n   Users in database:")
        for username, role, email in users:
            print(f"   - {username:12} ({role:18}) {email}")
    
    db_cur.close()
    db_conn.close()
    
except Exception as e:
    print(f"⚠️  Verification error: {e}")

print("\n" + "=" * 80)
print("✅ DATABASE INITIALIZATION COMPLETE!")
print("=" * 80)
print("\n🔐 Login Credentials:")
print("   admin        / admin123")
print("   reception    / reception123")
print("   salesman     / sales123")
print("   engineer     / engineer123")
print("   office       / office123")
print("   customer     / customer123")
print("\n🚀 Next step: Start the backend server")
print("   cd backend")
print("   python run_server.py")
print()
