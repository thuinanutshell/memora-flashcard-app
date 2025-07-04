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


class Deck(db.Model):
    """Table to store each folder's study decks

    Attributes:
        id (integer)
        name (string)
        description (string)
        folder_id: foreign key that refers to the Folder model (many-to-one relationship)
        folder: relationship with the Folder model
    """

    __table_args__ = (
        UniqueConstraint("folder_id", "name", name="uix_folder_deck_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Many-to-one relationship with the Folder model
    folder_id: Mapped[int] = mapped_column(ForeignKey("folder.id"), nullable=False)
    folder: Mapped["Folder"] = relationship(back_populates="decks")

    # One-to-many relationship with the Card model
    cards: Mapped[List["Card"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Deck id={self.id} name={self.name!r} folder_id={self.folder_id}>"
