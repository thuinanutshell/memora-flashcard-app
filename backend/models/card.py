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


class Card(db.Model):
    """Table to store cards belong to each folder

    Attributes:
        - id (integer)
        - question (text)
        - answer (text)
        - difficulty_level (string)
        - next_review_at (datetime): This attribute will be updated based on when the user reviews the card
        - review_count (integer): Default value is 0 when first created and will be updated each time the user reviews the card
        - is_fully_reviewed (boolean): Default value is False when first created and will be updated to True when the card is reviewed at least 3 times
        - last_reviewed (datetime): Each time the card is reviewed, this column will be updated and used to calculate the next due date to review the card
        - deck_id (int): foreign key that refers to the Folder model (many-to-one)
        - deck (string): relationship with the Folder model
    """

    __table_args__ = (
        UniqueConstraint("deck_id", "question", name="uix_deck_card_question"),
    )

    # Input created by the user
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String, nullable=False)

    # Input that will be updated by the server
    next_review_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    review_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    is_fully_reviewed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    last_reviewed_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Many-to-one relationship with the Deck model
    deck_id: Mapped[int] = mapped_column(Integer, ForeignKey("deck.id"), nullable=False)
    deck: Mapped["Deck"] = relationship(back_populates="cards")

    # One-to-many relationship with the Review model
    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="card", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Card id={self.id} question={self.question} deck_id={self.deck_id}>"
