from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, unique=True, index=True, nullable=False)
    genre = Column(String, nullable=False)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)

    # Relationship to track transitions
    transactions = relationship("Transaction", back_populates="book")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="member")

    # Relationship to track transitions
    transactions = relationship("Transaction", back_populates="user")


# --- NEW TRANSACTION MODEL ---
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.datetime.utcnow)
    return_date = Column(DateTime, nullable=True)  # Nullable until the book is actually returned
    status = Column(String, default="borrowed")     # Can be "borrowed" or "returned"

    # Set up ORM relationships
    user = relationship("User", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")