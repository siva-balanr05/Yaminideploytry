#!/usr/bin/env python
"""
Backend startup script - without reload
"""
import sys
import os

# Add backend directory to path
backend_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
