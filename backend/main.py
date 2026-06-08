from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import models
from database import engine, get_db

# Auto-create database tables on startup if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library Management System API")

# --- ENABLE CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# --- PYDANTIC SCHEMAS (Data Validation & Serialization) ---

# Book Schemas
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    genre: str
    total_copies: int

class BookResponse(BookBase):
    id: int
    available_copies: int
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "member"

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# Transaction Schemas (Enriched with relationship structures)
class TransactionBookDetail(BaseModel):
    title: str
    author: str
    class Config:
        from_attributes = True

class TransactionUserDetail(BaseModel):
    name: str
    class Config:
        from_attributes = True

class BorrowRequest(BaseModel):
    user_id: int
    book_id: int

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    book_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None
    status: str
    book: Optional[TransactionBookDetail] = None
    user: Optional[TransactionUserDetail] = None
    
    class Config:
        from_attributes = True


# --- API ROUTES ---

@app.get("/")
def root():
    return {"message": "Welcome to the Library Management System API!"}


# 1. Catalog: Add a New Book
@app.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def add_book(book: BookBase, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if db_book:
        raise HTTPException(status_code=400, detail="ISBN already registered")
    
    new_book = models.Book(
        title=book.title,
        author=book.author,
        isbn=book.isbn,
        genre=book.genre,
        total_copies=book.total_copies,
        available_copies=book.total_copies 
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


# 2. Catalog: Get All Books
@app.get("/books", response_model=List[BookResponse])
def get_all_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()


# 3. Users: Register a New User
@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(name=user.name, email=user.email, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# 3.5 Users: Get All Registered Users
@app.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


# 4. Circulation: Borrow a Book
@app.post("/books/borrow", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def borrow_book(request: BorrowRequest, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == request.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="No copies available for borrowing")

    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    active_loan = db.query(models.Transaction).filter(
        models.Transaction.user_id == request.user_id,
        models.Transaction.book_id == request.book_id,
        models.Transaction.status == "borrowed"
    ).first()
    if active_loan:
        raise HTTPException(status_code=400, detail="User has already borrowed a copy of this book")

    new_transaction = models.Transaction(
        user_id=request.user_id, 
        book_id=request.book_id,
        borrow_date=datetime.utcnow()
    )
    book.available_copies -= 1

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


# 5. Circulation: Return a Book
@app.post("/books/return", response_model=TransactionResponse)
def return_book(request: BorrowRequest, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.user_id == request.user_id,
        models.Transaction.book_id == request.book_id,
        models.Transaction.status == "borrowed"
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="No active borrowing record found for this user and book")

    transaction.return_date = datetime.utcnow()
    transaction.status = "returned"

    book = db.query(models.Book).filter(models.Book.id == request.book_id).first()
    if book:
        book.available_copies += 1

    db.commit()
    db.refresh(transaction)
    return transaction


# 6. Circulation: Get All Active Loans
@app.get("/loans", response_model=List[TransactionResponse])
def get_active_loans(db: Session = Depends(get_db)):
    return db.query(models.Transaction).filter(models.Transaction.status == "borrowed").all()