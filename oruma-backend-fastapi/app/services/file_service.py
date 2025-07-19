import os
import uuid
import aiofiles
from typing import List, Optional
from fastapi import UploadFile
from PIL import Image
import io

from app.config import settings
from app.utils.exceptions import OrumaBadRequestException, OrumaValidationException
from app.utils.validators import validate_image_filename


class FileService:
    
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
    ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
    
    def __init__(self):
        self.upload_path = settings.UPLOAD_PATH
        self._ensure_upload_directories()
    
    def _ensure_upload_directories(self):
        """Ensure upload directories exist"""
        directories = ['posts', 'events', 'marketplace', 'avatars']
        for directory in directories:
            dir_path = os.path.join(self.upload_path, directory)
            os.makedirs(dir_path, exist_ok=True)
    
    async def save_image(self, file: UploadFile, category: str) -> tuple[str, str]:
        """Save uploaded image and return URL and ID"""
        
        # Validate file
        if not file.content_type or file.content_type not in self.ALLOWED_MIME_TYPES:
            raise OrumaValidationException("Invalid file type. Only JPG, PNG, and WebP are allowed")
        
        if not validate_image_filename(file.filename or ""):
            raise OrumaValidationException("Invalid file extension")
        
        # Check file size
        content = await file.read()
        if len(content) > settings.MAX_FILE_SIZE_BYTES:
            raise OrumaValidationException(f"File size too large. Maximum {settings.FILE_MAX_SIZE_MB}MB allowed")
        
        # Reset file position
        await file.seek(0)
        
        # Validate that it's actually an image
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
        except Exception:
            raise OrumaValidationException("Invalid image file")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        extension = os.path.splitext(file.filename or "")[1].lower()
        filename = f"{file_id}{extension}"
        
        # Determine file path
        category_path = os.path.join(self.upload_path, category)
        file_path = os.path.join(category_path, filename)
        
        # Save file
        await file.seek(0)
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Optimize image
        await self._optimize_image(file_path)
        
        # Generate URL
        url = f"/uploads/{category}/{filename}"
        
        return url, file_id
    
    async def save_multiple_images(self, files: List[UploadFile], category: str, max_files: int) -> List[str]:
        """Save multiple images and return URLs"""
        
        if len(files) > max_files:
            raise OrumaValidationException(f"Maximum {max_files} images allowed")
        
        urls = []
        for file in files:
            url, _ = await self.save_image(file, category)
            urls.append(url)
        
        return urls
    
    async def _optimize_image(self, file_path: str):
        """Optimize image for web"""
        try:
            with Image.open(file_path) as image:
                # Convert to RGB if necessary
                if image.mode in ('RGBA', 'P'):
                    image = image.convert('RGB')
                
                # Resize if too large
                max_size = (1920, 1080)
                if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                    image.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save optimized image
                if file_path.lower().endswith('.png'):
                    image.save(file_path, 'PNG', optimize=True)
                else:
                    image.save(file_path, 'JPEG', quality=85, optimize=True)
        
        except Exception as e:
            # If optimization fails, just log and continue
            print(f"Failed to optimize image {file_path}: {e}")
    
    def delete_image(self, url: str) -> bool:
        """Delete image file"""
        try:
            # Extract filename from URL
            if url.startswith('/uploads/'):
                file_path = os.path.join(self.upload_path, url[9:])  # Remove '/uploads/'
                if os.path.exists(file_path):
                    os.remove(file_path)
                    return True
            return False
        except Exception:
            return False
    
    def delete_images(self, urls: List[str]) -> int:
        """Delete multiple images and return count of deleted files"""
        count = 0
        for url in urls:
            if self.delete_image(url):
                count += 1
        return count