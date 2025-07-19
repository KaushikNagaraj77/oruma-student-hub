from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False, index=True)
    condition = Column(String(20), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    images = Column(ARRAY(String), nullable=True)
    specifications = Column(Text, nullable=True)  # JSON string
    location = Column(String(255), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    status = Column(String(20), default="available", nullable=False, index=True)
    views_count = Column(Integer, default=0, nullable=False)
    saves_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    seller = relationship("User", back_populates="marketplace_items")
    saves = relationship("MarketplaceItemSave", back_populates="item", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MarketplaceItem(id='{self.id}', title='{self.title}', seller_id='{self.seller_id}', price={self.price})>"


class MarketplaceItemSave(Base):
    __tablename__ = "marketplace_item_saves"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    item_id = Column(UUID(as_uuid=True), ForeignKey("marketplace_items.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="marketplace_saves")
    item = relationship("MarketplaceItem", back_populates="saves")
    
    def __repr__(self):
        return f"<MarketplaceItemSave(user_id='{self.user_id}', item_id='{self.item_id}')>"


class MarketplaceCategory(Base):
    __tablename__ = "marketplace_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<MarketplaceCategory(id='{self.id}', name='{self.name}')>"