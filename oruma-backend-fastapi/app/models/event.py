from sqlalchemy import Column, String, DateTime, Integer, Boolean, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    start_time = Column(String(5), nullable=False)  # HH:MM format
    end_time = Column(String(5), nullable=False)    # HH:MM format
    location = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=False)
    registration_required = Column(Boolean, default=True, nullable=False)
    banner_image = Column(String(512), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    university = Column(String(255), nullable=False, index=True)
    status = Column(String(20), default="upcoming", nullable=False, index=True)
    views_count = Column(Integer, default=0, nullable=False)
    saves_count = Column(Integer, default=0, nullable=False)
    attendees_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    organizer = relationship("User", back_populates="organized_events")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")
    saves = relationship("EventSave", back_populates="event", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Event(id='{self.id}', title='{self.title}', organizer_id='{self.organizer_id}')>"


class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), default="registered", nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="event_registrations")
    
    def __repr__(self):
        return f"<EventRegistration(id='{self.id}', event_id='{self.event_id}', user_id='{self.user_id}', status='{self.status}')>"


class EventSave(Base):
    __tablename__ = "event_saves"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="event_saves")
    event = relationship("Event", back_populates="saves")
    
    def __repr__(self):
        return f"<EventSave(user_id='{self.user_id}', event_id='{self.event_id}')>"


class EventCategory(Base):
    __tablename__ = "event_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<EventCategory(id='{self.id}', name='{self.name}')>"