from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import httpx
from datetime import datetime

from app.database import get_db
from app.config import settings

router = APIRouter()


@router.get("/search")
async def search_universities(
    q: str = "",
    limit: int = 50,
    cursor: Optional[str] = None,
    state: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Search universities (public endpoint)"""
    
    try:
        # Try external universities API
        async with httpx.AsyncClient(timeout=settings.UNIVERSITIES_API_TIMEOUT) as client:
            params = {
                "country": "United States"
            }
            if q:
                params["name"] = q
            
            response = await client.get(
                f"{settings.UNIVERSITIES_API_URL}/search",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Transform data to match frontend expectations
                universities = []
                for item in data[:limit]:
                    university = {
                        "id": item.get("domains", ["unknown"])[0] or item["name"].lower().replace(" ", "-"),
                        "name": item["name"],
                        "state": extract_state_from_name(item["name"]) or "Unknown",
                        "city": extract_city_from_name(item["name"]) or "Unknown",
                        "type": determine_university_type(item["name"]),
                        "searchTerms": generate_search_terms(item["name"]),
                        "website": item.get("web_pages", [None])[0],
                        "enrollment": None,
                        "established": None,
                        "latitude": None,
                        "longitude": None
                    }
                    universities.append(university)
                
                # Apply filters
                if state:
                    universities = [u for u in universities if u["state"].lower() == state.lower()]
                if type:
                    universities = [u for u in universities if u["type"] == type]
                
                return {
                    "universities": universities[:limit],
                    "total": len(universities),
                    "hasMore": len(universities) > limit,
                    "nextCursor": None
                }
    
    except Exception as e:
        print(f"External API failed: {e}")
    
    # Fallback to hardcoded data
    fallback_universities = [
        {
            "id": "harvard",
            "name": "Harvard University",
            "state": "MA",
            "city": "Cambridge",
            "type": "private",
            "searchTerms": ["harvard", "cambridge", "ivy"],
            "website": "https://harvard.edu",
            "enrollment": 23000,
            "established": 1636
        },
        {
            "id": "mit",
            "name": "Massachusetts Institute of Technology",
            "state": "MA", 
            "city": "Cambridge",
            "type": "private",
            "searchTerms": ["mit", "massachusetts institute", "tech"],
            "website": "https://mit.edu",
            "enrollment": 11000,
            "established": 1861
        },
        {
            "id": "stanford",
            "name": "Stanford University",
            "state": "CA",
            "city": "Stanford",
            "type": "private",
            "searchTerms": ["stanford", "palo alto"],
            "website": "https://stanford.edu",
            "enrollment": 17000,
            "established": 1885
        }
    ]
    
    # Apply search filter
    if q:
        search_term = q.lower()
        fallback_universities = [
            u for u in fallback_universities
            if search_term in u["name"].lower() or 
               search_term in u["city"].lower() or
               search_term in u["state"].lower() or
               any(search_term in term for term in u["searchTerms"])
        ]
    
    return {
        "universities": fallback_universities[:limit],
        "total": len(fallback_universities),
        "hasMore": False,
        "nextCursor": None
    }


@router.get("/{university_id}")
async def get_university_details(
    university_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed university information"""
    
    # Mock detailed response
    return {
        "id": university_id,
        "name": "Mock University",
        "state": "CA",
        "city": "Mock City",
        "type": "public",
        "searchTerms": ["mock", "university"],
        "website": "https://mock.edu",
        "enrollment": 15000,
        "established": 1950,
        "description": "A comprehensive public university serving students in California.",
        "campuses": [
            {
                "name": "Main Campus",
                "address": "123 University Ave",
                "city": "Mock City",
                "state": "CA"
            }
        ],
        "demographics": {
            "totalStudents": 15000,
            "undergraduateStudents": 12000,
            "graduateStudents": 3000
        }
    }


def extract_state_from_name(name: str) -> Optional[str]:
    """Extract state from university name"""
    state_map = {
        'california': 'CA', 'texas': 'TX', 'florida': 'FL', 'new york': 'NY',
        'massachusetts': 'MA', 'pennsylvania': 'PA', 'illinois': 'IL'
    }
    
    name_lower = name.lower()
    for state_name, state_code in state_map.items():
        if state_name in name_lower:
            return state_code
    return None


def extract_city_from_name(name: str) -> Optional[str]:
    """Extract city from university name"""
    cities = [
        'cambridge', 'boston', 'new york', 'chicago', 'los angeles',
        'berkeley', 'stanford', 'philadelphia', 'atlanta', 'seattle'
    ]
    
    name_lower = name.lower()
    for city in cities:
        if city in name_lower:
            return city.title()
    return None


def determine_university_type(name: str) -> str:
    """Determine university type from name"""
    name_lower = name.lower()
    
    if 'community college' in name_lower:
        return 'community'
    elif 'institute of technology' in name_lower or 'tech' in name_lower:
        return 'technical'
    elif any(word in name_lower for word in ['christian', 'catholic', 'seminary']):
        return 'religious'
    elif 'state university' in name_lower or 'state college' in name_lower:
        return 'public'
    else:
        return 'private'


def generate_search_terms(name: str) -> list:
    """Generate search terms for university"""
    terms = [name.lower()]
    
    if 'university of' in name.lower():
        state = name.replace('University of ', '')
        terms.append(f"u{state[0].lower()}")
    
    if 'institute of technology' in name.lower():
        terms.extend(['tech', 'institute'])
    
    return terms