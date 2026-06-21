from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import ingredients, library, recipes, saved


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle.

    On startup, runs SQLAlchemy's create_all to ensure all MySQL tables exist.
    This is a no-op for tables that are already present, so it is safe to run
    on every startup without data loss.
    """
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="RecipesByIQ API",
    description="Smart Nigerian recipe suggestions based on ingredients you already have",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recipes.router, prefix="/api/v1")
app.include_router(saved.router, prefix="/api/v1")
app.include_router(ingredients.router, prefix="/api/v1")
app.include_router(library.router, prefix="/api/v1")


@app.get("/", tags=["root"])
def root():
    """Return a welcome message and a link to the interactive API documentation.

    Serves as a basic liveness indicator and entry point for developers
    exploring the API for the first time.

    Returns:
        Dict with a welcome message and the path to the Swagger UI docs.
    """
    return {"message": "Welcome to RecipesByIQ API", "docs": "/docs"}
