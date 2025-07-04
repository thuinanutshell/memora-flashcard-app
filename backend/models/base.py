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

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    deleted_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()


db = SQLAlchemy(model_class=Base)