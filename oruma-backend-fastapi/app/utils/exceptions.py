from fastapi import HTTPException
from typing import Optional, Dict, Any


class OrumaBadRequestException(HTTPException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            detail={
                "error": "Bad Request",
                "message": message,
                "details": details or {}
            }
        )


class OrumaUnauthorizedException(HTTPException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": message
            }
        )


class OrumaForbiddenException(HTTPException):
    def __init__(self, message: str = "Access forbidden"):
        super().__init__(
            status_code=403,
            detail={
                "error": "Forbidden",
                "message": message
            }
        )


class OrumaNotFoundException(HTTPException):
    def __init__(self, message: str, resource: str = "Resource"):
        super().__init__(
            status_code=404,
            detail={
                "error": "Not Found",
                "message": message,
                "details": {"resource": resource}
            }
        )


class OrumaConflictException(HTTPException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=409,
            detail={
                "error": "Conflict",
                "message": message,
                "details": details or {}
            }
        )


class OrumaValidationException(HTTPException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=422,
            detail={
                "error": "Validation Error",
                "message": message,
                "details": details or {}
            }
        )