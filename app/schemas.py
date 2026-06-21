from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class RecipeSuggestRequest(BaseModel):
    """Payload sent by the client to request AI-generated recipe suggestions."""

    ingredients: list[str] = Field(default=[])
    """Ingredients the user currently has.
    May be empty when dish_name is provided; otherwise at least 1 item required
    (enforced by the route, which returns 422). The upper bound is enforced by
    the route (returns 400) using MAX_INGREDIENTS."""

    cuisine_preference: str = "general"
    """Cuisine style to bias the suggestions toward. Defaults to general."""

    max_prep_time_minutes: int | None = None
    """Optional hard cap on total preparation time in minutes. None means no limit."""

    dish_name: str | None = None
    """Optional dish name hint to bias LLM suggestions toward a specific dish."""

    dietary_restrictions: list[str] = []
    """Dietary restriction keys to filter/flag recipes. Valid values:
    diabetic, lactose_intolerant, hypertension, pescatarian,
    vegan, vegetarian, gluten_free, nut_allergy."""


class SaveRecipeRequest(BaseModel):
    """Payload sent by the client to bookmark a recipe."""

    recipe_name: str
    """Display name for the recipe being saved."""

    recipe_data: dict
    """Full recipe payload (ingredients, instructions, metadata) to persist as-is."""


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class RecipeResult(BaseModel):
    """A single recipe returned by the LLM, enriched with match metadata."""

    name: str
    """Recipe title."""

    description: str
    """Short description of the dish."""

    used_ingredients: list[str]
    """Ingredients from the user's list that this recipe uses."""

    missing_ingredients: list[str]
    """Ingredients this recipe needs that the user did not provide."""

    match_percentage: float
    """Percentage of required ingredients the user already has (0.0 – 100.0)."""

    prep_time_minutes: int
    """Estimated preparation time in minutes."""

    cook_time_minutes: int | None = None
    """Estimated active cooking time in minutes. None when not provided by the LLM."""

    servings: int | None = None
    """Number of people the recipe serves. None when not provided by the LLM."""

    tips: str | None = None
    """A single helpful cooking tip for this dish. None when not provided by the LLM."""

    instructions: list[str]
    """Ordered list of steps to prepare the recipe."""

    difficulty: str
    """Subjective difficulty level, e.g. 'easy', 'medium', or 'hard'."""

    dietary_warnings: list[str] = []
    """Warning messages for triggered dietary restrictions."""

    dietary_flagged: list[str] = []
    """Specific ingredient names that triggered a dietary restriction."""

    dietary_labels: list[str] = []
    """Human-readable restriction names that were triggered."""

    is_dietary_safe: bool = True
    """False when an exclude-severity restriction was triggered."""


class RankedRecipesResponse(BaseModel):
    """Top-level response returned from the recipe suggestion endpoint.

    Recipes are pre-sorted into three tiers based on how many ingredients
    the user already has.
    """

    request_id: str
    """UUID of the SuggestionRequest row created for this call."""

    ingredients_provided: list[str]
    """Echo of the ingredients the user submitted."""

    total_recipes_found: int
    """Total number of recipes across all three tiers."""

    can_make_now: list[RecipeResult]
    """Recipes where the user has 100 % of required ingredients."""

    almost_there: list[RecipeResult]
    """Recipes where the user has 50 – 99 % of required ingredients."""

    needs_shopping: list[RecipeResult]
    """Recipes where the user has less than 50 % of required ingredients."""


class SavedRecipeResponse(BaseModel):
    """Representation of a bookmarked recipe returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    """Auto-incremented primary key of the SavedRecipe row."""

    recipe_name: str
    """Display name of the saved recipe."""

    recipe_data: dict
    """Full recipe payload as originally saved."""

    saved_at: datetime
    """UTC timestamp of when the recipe was bookmarked."""


class RecipeLibraryCreate(BaseModel):
    """Payload for adding or updating a recipe in the library."""

    name: str
    """Unique display name for the recipe."""

    region: str
    """Cultural region (e.g. yoruba, igbo, hausa, south_south, modern, general)."""

    category: str
    """Dish category (e.g. soup, rice, snack, swallow, breakfast, drink, stew, porridge)."""

    description: str
    """Two to three sentence description including origin and taste profile."""

    ingredients: list[str]
    """Ingredient strings with quantities, e.g. '2 cups black eyed beans'."""

    instructions: list[str]
    """Ordered step strings."""

    prep_time_minutes: int
    """Preparation time in minutes."""

    cook_time_minutes: int
    """Active cooking time in minutes."""

    servings: int
    """Number of people the recipe serves."""

    difficulty: str
    """Difficulty level: easy, medium, or hard."""

    tips: str | None = None
    """Optional single cooking tip."""

    is_traditional: bool = True
    """True for unmodified traditional recipes."""

    is_modern_twist: bool = False
    """True for contemporary variations."""


class RecipeLibraryResponse(BaseModel):
    """Full representation of a library recipe returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    region: str
    category: str
    description: str
    ingredients: list[str]
    instructions: list[str]
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    difficulty: str
    tips: str | None
    is_traditional: bool
    is_modern_twist: bool
    created_at: datetime


class PopularIngredientResponse(BaseModel):
    """Aggregated ingredient usage count returned from the analytics endpoint."""

    ingredient: str
    """Ingredient name."""

    count: int
    """Number of times this ingredient has appeared across all suggestion requests."""
