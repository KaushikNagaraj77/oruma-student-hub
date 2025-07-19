import re
from typing import List, Optional
from email_validator import validate_email, EmailNotValidError


def validate_email_format(email: str) -> bool:
    """Validate email format"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False


def validate_password_strength(password: str) -> tuple[bool, List[str]]:
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one number")
    
    if not re.search(r"[a-zA-Z]", password):
        errors.append("Password must contain at least one letter")
    
    return len(errors) == 0, errors


def validate_university_name(university: str) -> bool:
    """Validate university name"""
    if not university or len(university.strip()) < 2:
        return False
    
    # Basic validation - could be enhanced with actual university database
    return len(university.strip()) <= 255


def validate_content_length(content: str, max_length: int = 2000) -> bool:
    """Validate content length"""
    return len(content.strip()) <= max_length


def validate_hashtags(hashtags: List[str]) -> tuple[bool, List[str]]:
    """Validate hashtags"""
    errors = []
    
    if len(hashtags) > 10:
        errors.append("Maximum 10 hashtags allowed")
    
    for hashtag in hashtags:
        if not hashtag.startswith('#'):
            hashtag = f"#{hashtag}"
        
        if len(hashtag) > 50:
            errors.append(f"Hashtag '{hashtag}' is too long (max 50 characters)")
        
        if not re.match(r'^#[a-zA-Z0-9_]+$', hashtag):
            errors.append(f"Hashtag '{hashtag}' contains invalid characters")
    
    return len(errors) == 0, errors


def validate_mentions(mentions: List[str]) -> tuple[bool, List[str]]:
    """Validate mentions"""
    errors = []
    
    if len(mentions) > 10:
        errors.append("Maximum 10 mentions allowed")
    
    for mention in mentions:
        if not mention.startswith('@'):
            mention = f"@{mention}"
        
        if len(mention) > 50:
            errors.append(f"Mention '{mention}' is too long (max 50 characters)")
        
        if not re.match(r'^@[a-zA-Z0-9_]+$', mention):
            errors.append(f"Mention '{mention}' contains invalid characters")
    
    return len(errors) == 0, errors


def validate_image_filename(filename: str) -> bool:
    """Validate image filename"""
    if not filename:
        return False
    
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    extension = filename.lower().split('.')[-1]
    return f".{extension}" in allowed_extensions


def validate_price(price: float) -> bool:
    """Validate price for marketplace items"""
    return price >= 0 and price <= 999999.99