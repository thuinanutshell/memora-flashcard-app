from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    """Table to store user's personal information
    
    Attributes:
        - id (integer)
        - username (string)
        - email (string)
        - password_hash (string)
    """
    

class Folder(db.Model):
    """Table to store user's folders information
    
    Attributes:
        - id (integer)
        - name (string)
        - description (text)
    """
    
class Card(db.Model):
    """Table to store cards belong to each folder
    
    Attributes:
        - id (integer)
        - question (text)
        - answer (text)
        - reviewed_at (timestamp)
    """
    


