import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Load backend/.env into the process environment (not just into pydantic
# Settings) so plain os.getenv() calls like the one below see it too.
load_dotenv()

# Local dev: zero-setup SQLite file. Production: set DATABASE_URL to a
# free-tier Postgres connection string (Neon/Supabase) — no code change
# needed beyond the env var, since all access goes through SQLAlchemy.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
# pool_pre_ping: tests each pooled connection with a cheap "is it alive"
# check before handing it to a request. Without this, a connection that
# Supabase's pooler silently dropped (idle timeout, restart, etc.) gets
# reused as-is and the next query hangs/fails instead of transparently
# reconnecting.
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if DATABASE_URL.startswith("sqlite"):
    # SQLite ignores FK constraints (including ON DELETE CASCADE) unless
    # this pragma is set per-connection — without it, local/test SQLite
    # silently diverges from how Postgres actually enforces the same
    # schema in production.
    @event.listens_for(engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
