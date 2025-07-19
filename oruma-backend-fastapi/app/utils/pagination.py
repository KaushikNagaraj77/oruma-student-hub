import base64
import json
from typing import Optional, Any, Dict
from datetime import datetime


def encode_cursor(data: Dict[str, Any]) -> str:
    """Encode cursor data to base64 string"""
    # Convert datetime objects to ISO strings
    cursor_data = {}
    for key, value in data.items():
        if isinstance(value, datetime):
            cursor_data[key] = value.isoformat()
        else:
            cursor_data[key] = value
    
    json_str = json.dumps(cursor_data, sort_keys=True)
    return base64.urlsafe_b64encode(json_str.encode()).decode()


def decode_cursor(cursor: str) -> Optional[Dict[str, Any]]:
    """Decode base64 cursor string to data"""
    try:
        json_str = base64.urlsafe_b64decode(cursor.encode()).decode()
        cursor_data = json.loads(json_str)
        
        # Convert ISO strings back to datetime objects if needed
        for key, value in cursor_data.items():
            if isinstance(value, str) and key.endswith('_at'):
                try:
                    cursor_data[key] = datetime.fromisoformat(value)
                except ValueError:
                    pass
        
        return cursor_data
    except (ValueError, json.JSONDecodeError):
        return None


def create_next_cursor(items: list, cursor_field: str = 'created_at') -> Optional[str]:
    """Create next cursor from last item in list"""
    if not items:
        return None
    
    last_item = items[-1]
    if hasattr(last_item, cursor_field):
        cursor_value = getattr(last_item, cursor_field)
        return encode_cursor({cursor_field: cursor_value, 'id': str(last_item.id)})
    
    return None