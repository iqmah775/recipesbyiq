import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, JSON, String, Text
from app.database import Base


class SuggestionRequest(Base):
    """Records a single recipe-generation request submitted by a user.

    Stores the raw inputs alongside the full LLM response so results can be
    retrieved later without re-querying the model.
    """

    __tablename__ = "suggestion_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    """UUID v4 identifying this request, auto-generated and stored as a 36-character string."""

    ingredients_provided = Column(JSON, nullable=False)
    """List of ingredient strings the user supplied."""

    cuisine_preference = Column(String(50), nullable=True)
    """Optional cuisine filter supplied by the user (e.g. 'Italian')."""

    max_prep_time = Column(Integer, nullable=True)
    """Optional upper bound on total preparation time in minutes."""

    results_json = Column(JSON, nullable=True)
    """Full structured recipe results returned by the LLM. Null until the LLM responds."""

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    """UTC timestamp of when the request was created."""


class SavedRecipe(Base):
    """A recipe that a user has explicitly bookmarked for future reference."""

    __tablename__ = "saved_recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    """Auto-incrementing surrogate key."""

    recipe_name = Column(String(255), nullable=False)
    """Human-readable name of the saved recipe."""

    recipe_data = Column(JSON, nullable=False)
    """Full recipe payload including ingredients, instructions, and metadata."""

    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    """UTC timestamp of when the recipe was saved."""


class IngredientLog(Base):
    """Tracks each individual ingredient submitted as part of a suggestion request.

    Normalised from SuggestionRequest.ingredients_provided so ingredient usage
    can be queried and aggregated independently of the parent request.
    """

    __tablename__ = "ingredient_logs"

    __table_args__ = (
        Index("ix_ingredient_logs_request_id", "request_id"),
        Index("ix_ingredient_logs_ingredient", "ingredient"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    """Auto-incrementing surrogate key."""

    ingredient = Column(String(100), nullable=False)
    """Normalised ingredient name as submitted by the user."""

    request_id = Column(String(36), ForeignKey("suggestion_requests.id"), nullable=False)
    """Foreign key back to the SuggestionRequest this ingredient belongs to."""

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    """UTC timestamp copied from the parent request, denormalised for fast filtering."""


class RecipeLibrary(Base):
    """A curated Nigerian recipe stored in the local library.

    Used by the matcher service so that suggest requests for Nigerian cuisine
    can be satisfied from the library rather than an LLM call.
    """

    __tablename__ = "recipe_library"

    id = Column(Integer, primary_key=True, autoincrement=True)
    """Auto-incrementing surrogate key."""

    name = Column(String(255), nullable=False, unique=True)
    """Unique display name for the recipe."""

    region = Column(String(100), nullable=False)
    """Cultural region the recipe belongs to (e.g. yoruba, igbo, hausa, general)."""

    category = Column(String(100), nullable=False)
    """Dish category (e.g. soup, rice, snack, swallow, breakfast, drink, stew, porridge)."""

    description = Column(Text, nullable=False)
    """Two to three sentence description including origin and taste profile."""

    ingredients = Column(JSON, nullable=False)
    """Ordered list of ingredient strings with quantities, e.g. '2 cups black eyed beans'."""

    instructions = Column(JSON, nullable=False)
    """Ordered list of step strings."""

    prep_time_minutes = Column(Integer, nullable=False)
    """Time to prepare before cooking begins, in minutes."""

    cook_time_minutes = Column(Integer, nullable=False)
    """Active cooking time in minutes."""

    servings = Column(Integer, nullable=False)
    """Number of people the recipe serves."""

    difficulty = Column(String(50), nullable=False)
    """Subjective difficulty level: easy, medium, or hard."""

    tips = Column(Text, nullable=True)
    """Optional single cooking tip for the dish."""

    is_traditional = Column(Boolean, default=True)
    """True when this is a classic, unmodified traditional recipe."""

    is_modern_twist = Column(Boolean, default=False)
    """True when this is a contemporary variation of a traditional dish."""

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    """UTC timestamp of when the recipe was added to the library."""
