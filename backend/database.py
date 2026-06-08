from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Create a local SQLite database file named library.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./library.db"

engine = create_engine(
    # connect_args={"check_same_thread": False} is required only for SQLite
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to inject database sessions into our API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()