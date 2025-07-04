from models.base import db
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


class Folder(db.Model):
    """Table to store user's folders information

    Attributes:
        - id (integer)
        - name (string)
        - description (text)
        - user_id (uuid): foreign key that refers to the User model (many-to-one relationship)
        - user: relationship with the User model
        - decks (list): one-to-many relationship with the Deck model
    """

    __table_args__ = (UniqueConstraint("user_id", "name", name="uix_user_folder_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Many-to-one relationship with the User model
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="folders")

    # One-to-many relationship with the Deck model
    decks: Mapped[List["Deck"]] = relationship(
        back_populates="folder", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Folder id={self.id} name={self.name!r} user_id={self.user_id}>"
