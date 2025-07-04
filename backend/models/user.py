from base import db
from typing import List
import datetime
import uuid
from typing import List
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import (
    ForeignKey,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import JSON


class User(db.Model):
    """Table to store user's personal information

    Attributes:
        - id (UUID string)
        - full_name (string)
        - username (string)
        - email (string)
        - password_hash (string)
        - folders (list): one-to-many relationship with the Folder model
    """

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    full_name: Mapped[str] = mapped_column(String(128), nullable=False)
    username: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)

    # Analytics fields
    study_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_study_date: Mapped[datetime.date] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # One-to-many relationship with the Folder model
    folders: Mapped[List["Folder"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user")
    aiconversations: Mapped[List["AIConversation"]] = relationship(
        "AIConversation", back_populates="user"
    )

    def __repr__(self):
        return f"<User ID {self.id} full name {self.full_name} username {self.username} email {self.email}>"
