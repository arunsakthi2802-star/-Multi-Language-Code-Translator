import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    translations = relationship("Translation", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Translation(Base):
    __tablename__ = "translations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    source_language = Column(String(50), nullable=False, index=True)
    target_language = Column(String(50), nullable=False, index=True)
    source_code = Column(Text, nullable=False)
    translated_code = Column(Text, nullable=True)
    provider = Column(String(50), default="openai")
    model_name = Column(String(100), nullable=True)
    status = Column(String(30), default="completed", index=True) # completed, failed, partial
    warnings = Column(Text, nullable=True) # JSON or newline string
    explanation = Column(Text, nullable=True)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now, index=True)
    completed_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="translations")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    source_code = Column(Text, nullable=False)
    translated_code = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True) # Comma-separated or JSON list
    created_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="projects")


class Template(Base):
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    source_language = Column(String(50), nullable=False, index=True)
    code = Column(Text, nullable=False)
    difficulty = Column(String(30), default="Beginner") # Beginner, Intermediate, Advanced
    category = Column(String(50), default="Basics", index=True) # Basics, Data Structures, Algorithms, OOP
    expected_behavior = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String(20), default="dark") # dark, light
    default_source_language = Column(String(50), default="python")
    default_target_language = Column(String(50), default="javascript")
    save_history = Column(Boolean, default=True)
    preferred_translation_style = Column(String(50), default="idiomatic")
    ai_provider = Column(String(50), default="openai") # openai, ollama, rule_based
    custom_model = Column(String(100), nullable=True)
    custom_base_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="settings")


class ExecutionRecord(Base):
    __tablename__ = "execution_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    language = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False) # success, error, timeout, rejected
    exit_code = Column(Integer, nullable=True)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
