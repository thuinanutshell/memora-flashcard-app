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


class AIConversation(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_query: Mapped[str] = mapped_column(Text, nullable=False)
    ai_response: Mapped[str] = mapped_column(Text, nullable=False)

    # Many-to-one relationship with the User table (one user can have many AI conversations)
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="aiconversations")

    def __repr__(self):
        return f"<AIConversation id={self.id} user_id={self.user_id}>"
