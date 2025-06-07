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


class Base:
    """Define the Base model that is inherited by all other models.

    Attributes:
        - Column definitions that define the structure of the table (descriptors)
            Datetimes are calculated from the server side using func.now()
            created_at: the date and time that an object is created
            deleted_at: the date and time that an object is deleted
            updated_at: the date and time that an object is updated
        - Class-level attribute:
            Table name are all lowercase across tables (because the table names
            are the property unique to each subclass, not shared as a single instance)
    """

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()


db = SQLAlchemy(model_class=Base)


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

    # One-to-many relationship with the Folder model
    folders: Mapped[List["Folder"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User ID {self.id} full name {self.full_name} username {self.username} email {self.email}>"


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
    last_reviewed: Mapped[datetime.datetime] = mapped_column(
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
    note: Mapped[str] = mapped_column(Text, nullable=True)

    # Many-to-one relationship with the Card model
    card_id: Mapped[int] = mapped_column(Integer, ForeignKey("card.id"), nullable=False)
    card: Mapped["Card"] = relationship(back_populates="reviews")

    def __repr__(self):
        return f"<Review id={self.id} score={self.score} card_id={self.card_id}>"
