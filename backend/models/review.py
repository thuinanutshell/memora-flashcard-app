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


class Review(db.Model):
    """Table to store review events that belong to each card

    Attributes:
        - id (integer)
        - user_answer (text): user's answer when they review the card
        - reviewed_at (datetime): the date and time at which the user reviews the card
        - score (float): the accuracy percentage of user's answer and the correct answer
        - note (text): the note that the user stores after reviewing the card
        - card_id (integer): foreign key that refers to the card table
        - card (List): many-to-one relationship with the Card model
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_answer: Mapped[str] = mapped_column(Text, nullable=False)
    reviewed_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)

    # Many-to-one relationship with the Card model
    card_id: Mapped[int] = mapped_column(Integer, ForeignKey("card.id"), nullable=False)
    card: Mapped["Card"] = relationship(back_populates="reviews")

    # Many-to-one relationship with the User model
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review id={self.id} score={self.score} card_id={self.card_id}>"
