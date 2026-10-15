"""
Async SQLAlchemy engine + session factory + table initialisation.
Uses asyncpg as the async Postgres driver.
"""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

kwargs = {}
if "sqlite" in settings.DATABASE_URL:
    kwargs["connect_args"] = {"check_same_thread": False}
else:
    kwargs["pool_size"] = 10
    kwargs["max_overflow"] = 20

engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    **kwargs
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    """Create all tables on startup (dev mode). Use Alembic for production."""
    async with engine.begin() as conn:
        # Import models so they are registered with Base.metadata
        from app.models import db_models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    """FastAPI dependency that yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
