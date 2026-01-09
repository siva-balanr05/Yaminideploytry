"""
Seed Sample Chatbot Knowledge Base
Adds initial FAQs for testing
"""

from sqlalchemy.orm import Session
from database import SessionLocal
from models import ChatbotKnowledge

SAMPLE_KNOWLEDGE = [
    # Products
    {
        "title": "Products - What we sell",
        "content_en": "Q: What products do you sell?\nA: We sell a wide range of electronics including laptops, desktops, printers, networking equipment, and computer accessories.",
        "content_ta": "கே: நீங்கள் என்ன தயாரிப்புகளை விற்கிறீர்கள்?\nபதில்: நாங்கள் லேப்டாப், டெஸ்க்டாப், பிரிண்டர், நெட்வொர்க்கிங் உபகரணங்கள் மற்றும் கணினி உபகரணங்கள் உட்பட பல்வேறு மின்னணு பொருட்களை விற்கிறோம்.",
        "category": "product",
        "keywords": "products, laptop, desktop, printer, electronics"
    },
    {
        "title": "Dell Laptops - Availability",
        "content_en": "Q: Do you have Dell laptops in stock?\nA: Yes, we have various Dell laptop models in stock. Please visit our showroom or contact our sales team for current availability and pricing.",
        "content_ta": "கே: டெல் லேப்டாப் ஸ்டாக்கில் உள்ளதா?\nபதில்: ஆம், எங்களிடம் பல்வேறு டெல் லேப்டாப் மாடல்கள் ஸ்டாக்கில் உள்ளன. தற்போதைய கிடைக்கும் தன்மை மற்றும் விலைக்கு எங்கள் ஷோரூமை பார்வையிடவும் அல்லது எங்கள் விற்பனை குழுவை தொடர்பு கொள்ளவும்.",
        "category": "product",
        "keywords": "Dell, laptop, stock, availability"
    },
    
    # Services
    {
        "title": "Services - What we provide",
        "content_en": "Q: What services do you provide?\nA: We provide computer repair, laptop servicing, printer maintenance, network installation, and data recovery services.",
        "content_ta": "கே: நீங்கள் என்ன சேவைகளை வழங்குகிறீர்கள்?\nபதில்: நாங்கள் கணினி பழுதுபார்ப்பு, லேப்டாப் சேவை, பிரிண்டர் பராமரிப்பு, நெட்வொர்க் நிறுவல் மற்றும் தரவு மீட்பு சேவைகளை வழங்குகிறோம்.",
        "category": "service",
        "keywords": "service, repair, maintenance, servicing"
    },
    {
        "title": "Laptop Repair - Duration",
        "content_en": "Q: How long does laptop repair take?\nA: Laptop repair typically takes 2-5 business days depending on the issue. Emergency repairs can be completed within 24 hours for an additional charge.",
        "content_ta": "கே: லேப்டாப் பழுதுபார்ப்பு எவ்வளவு நேரம் எடுக்கும்?\nபதில்: லேப்டாப் பழுதுபார்ப்பு பொதுவாக சிக்கலைப் பொறுத்து 2-5 வேலை நாட்கள் ஆகும். அவசர பழுதுபார்ப்புகள் கூடுதல் கட்டணத்திற்கு 24 மணி நேரத்திற்குள் முடிக்கப்படும்.",
        "category": "service",
        "keywords": "repair, laptop, duration, time, emergency"
    },
    
    # AMC
    {
        "title": "AMC - Annual Maintenance Contract",
        "content_en": "Q: What is AMC and what does it cover?\nA: AMC (Annual Maintenance Contract) provides regular maintenance, priority service, and discounted repairs for your equipment throughout the year.",
        "content_ta": "கே: AMC என்றால் என்ன மற்றும் அது என்ன உள்ளடக்குகிறது?\nபதில்: AMC (வருடாந்திர பராமரிப்பு ஒப்பந்தம்) ஆண்டு முழுவதும் உங்கள் உபகரணங்களுக்கு வழக்கமான பராமரிப்பு, முன்னுரிமை சேவை மற்றும் தள்ளுபடி பழுதுபார்ப்புகளை வழங்குகிறது.",
        "category": "amc",
        "keywords": "AMC, maintenance contract, annual, warranty"
    },
    
    # Business Hours
    {
        "title": "Business Hours",
        "content_en": "Q: What are your business hours?\nA: We are open Monday to Saturday from 9:00 AM to 7:00 PM. Sunday: 10:00 AM to 2:00 PM. Public holidays are closed.",
        "content_ta": "கே: உங்கள் வணிக நேரங்கள் என்ன?\nபதில்: நாங்கள் திங்கள் முதல் சனிக்கிழமை வரை காலை 9:00 முதல் மாலை 7:00 வரை திறந்திருக்கிறோம். ஞாயிறு: காலை 10:00 முதல் பிற்பகல் 2:00 வரை. பொது விடுமுறை நாட்கள் மூடப்பட்டுள்ளன.",
        "category": "general",
        "keywords": "hours, timing, open, closed, schedule"
    },
    
    # Contact
    {
        "title": "Contact Information",
        "content_en": "Q: How can I contact you?\nA: You can reach us at our showroom, call us during business hours, or send an inquiry through our website. Our team will respond within 24 hours.",
        "content_ta": "கே: நான் உங்களை எப்படி தொடர்பு கொள்வது?\nபதில்: நீங்கள் எங்கள் ஷோரூமில் எங்களை அணுகலாம், வணிக நேரத்தில் எங்களை அழைக்கலாம் அல்லது எங்கள் இணையதளம் வழியாக விசாரணையை அனுப்பலாம். எங்கள் குழு 24 மணி நேரத்திற்குள் பதிலளிக்கும்.",
        "category": "general",
        "keywords": "contact, phone, call, reach, inquiry"
    },
]

def seed_knowledge():
    """Add sample knowledge to database"""
    db: Session = SessionLocal()
    
    try:
        print("Seeding chatbot knowledge base...")
        
        # Check if knowledge already exists
        existing_count = db.query(ChatbotKnowledge).count()
        if existing_count > 0:
            print(f"⚠️  Knowledge base already has {existing_count} entries.")
            response = input("Do you want to add more samples? (y/n): ")
            if response.lower() != 'y':
                print("Skipping seed.")
                return
        
        # Add sample knowledge
        added = 0
        for item in SAMPLE_KNOWLEDGE:
            knowledge = ChatbotKnowledge(
                title=item["title"],
                content=item.get("content_en", ""),  # Use English as main content
                content_en=item.get("content_en", ""),
                content_ta=item.get("content_ta", ""),
                category=item.get("category", "general"),
                keywords=item.get("keywords", ""),
                is_active=True
            )
            db.add(knowledge)
            added += 1
        
        db.commit()
        print(f"✅ Successfully added {added} knowledge entries!")
        print("\nNext steps:")
        print("1. Set your MISTRAL_API_KEY in backend/.env")
        print("2. Login to admin portal: http://localhost:5173/admin")
        print("3. Go to 'AI Chatbot' → 'Knowledge Base' tab")
        print("4. Click 'Rebuild Index' to create FAISS embeddings")
        print("5. Test the chatbot on the customer portal")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding knowledge: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_knowledge()
