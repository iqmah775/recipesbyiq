from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)
"""SQLAlchemy engine connected to MySQL via DATABASE_URL.

pool_pre_ping checks the connection health before each use.
pool_recycle drops and replaces connections older than 3600 seconds to
avoid MySQL's default 8-hour idle disconnect.
"""

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
"""Session factory bound to the MySQL engine."""

Base = declarative_base()
"""Declarative base class for all ORM models."""


def get_db():
    """Yield a database session and guarantee it is closed after the request.

    Intended for use as a FastAPI dependency via Depends(get_db).
    The session is always closed in the finally block, even if an exception
    is raised during the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
