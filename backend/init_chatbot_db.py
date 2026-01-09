"""
Initialize Chatbot Database Tables
Creates the 5 chatbot tables in the database
"""

from database import engine, Base
from models import (
    ChatbotKnowledge,
    ChatSession,
    ChatMessage,
    ChatbotHandoff,
    ChatbotAnalytics
)

def init_chatbot_tables():
    """Create all chatbot tables"""
    print("Creating chatbot database tables...")
    
    try:
        # Create only chatbot tables
        Base.metadata.create_all(
            bind=engine,
            tables=[
                ChatbotKnowledge.__table__,
                ChatSession.__table__,
                ChatMessage.__table__,
                ChatbotHandoff.__table__,
                ChatbotAnalytics.__table__,
            ]
        )
        print("✅ Chatbot tables created successfully!")
        print("\nTables created:")
        print("  - chatbot_knowledge")
        print("  - chat_sessions")
        print("  - chat_messages")
        print("  - chatbot_handoffs")
        print("  - chatbot_analytics")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    init_chatbot_tables()
