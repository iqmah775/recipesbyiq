import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.config import settings
from app.database import SessionLocal, get_db
from app.models import IngredientLog, SuggestionRequest
from app.schemas import RankedRecipesResponse, RecipeResult, RecipeSuggestRequest
from app.services.llm import get_recipe_suggestions
from app.services.matcher import match_recipes_from_db
from app.services.ranker import rank_recipes

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recipes"])

NIGERIAN_CUISINES = [
    "nigerian", "yoruba", "igbo", "hausa", "calabar", "delta", "rivers",
    "south south", "south_south", "northern", "traditional", "modern",
]


@router.post("/recipes/suggest")
async def suggest_recipes(
    body: RecipeSuggestRequest,
    db: Session = Depends(get_db),
):
    """Generate and rank recipe suggestions based on the user's available ingredients.

    For Nigerian cuisines the library database is checked first; if it contains
    matching recipes they are returned immediately without an LLM call. When no
    library recipes exist yet, a message is returned prompting the user to
    populate the library. For all other cuisines the Groq LLM is called.

    In both cases the request and per-ingredient logs are persisted to MySQL.

    Args:
        body: Validated request body containing ingredients and preferences.
        db: Injected SQLAlchemy session.

    Returns:
        RankedRecipesResponse when results are found, or a message dict when the
        library is empty for a Nigerian cuisine request.

    Raises:
        HTTPException 422: Automatically raised by FastAPI/Pydantic when the
                           ingredients list is empty.
        HTTPException 400: When the number of ingredients exceeds MAX_INGREDIENTS.
        HTTPException 503: When the LLM fails to return parseable JSON after retry.
    """
    if not body.ingredients and not body.dish_name:
        raise HTTPException(
            status_code=422,
            detail="At least one ingredient or a dish_name is required.",
        )

    if len(body.ingredients) > settings.MAX_INGREDIENTS:
        raise HTTPException(
            status_code=400,
            detail=f"Too many ingredients. Maximum allowed is {settings.MAX_INGREDIENTS}.",
        )

    if not body.cuisine_preference or body.cuisine_preference.strip() == "":
        body.cuisine_preference = "general"

    try:
        is_nigerian = any(
            cuisine in body.cuisine_preference.lower() for cuisine in NIGERIAN_CUISINES
        )

        if is_nigerian:
            tiers = match_recipes_from_db(body.ingredients, db, body.dietary_restrictions)
            if not any(tiers.values()):
                return {
                    "message": (
                        "No matching recipes found in library yet. "
                        "Add recipes via POST /api/v1/library/recipes first."
                    )
                }
            results_to_save = tiers
        else:
            llm_result = await get_recipe_suggestions(
                ingredients=body.ingredients,
                cuisine_preference=body.cuisine_preference,
                max_prep_time=body.max_prep_time_minutes,
                dish_name=body.dish_name,
                dietary_restrictions=body.dietary_restrictions,
            )
            tiers = rank_recipes(llm_result.get("recipes", []))
            results_to_save = llm_result

        suggestion = SuggestionRequest(
            ingredients_provided=body.ingredients,
            cuisine_preference=body.cuisine_preference,
            max_prep_time=body.max_prep_time_minutes,
            results_json=results_to_save,
        )
        db.add(suggestion)
        db.flush()

        for ingredient in body.ingredients:
            db.add(IngredientLog(ingredient=ingredient, request_id=suggestion.id))

        db.commit()
        db.refresh(suggestion)

        all_recipes = tiers["can_make_now"] + tiers["almost_there"] + tiers["needs_shopping"]

        return RankedRecipesResponse(
            request_id=suggestion.id,
            ingredients_provided=body.ingredients,
            total_recipes_found=len(all_recipes),
            can_make_now=[RecipeResult(**r) for r in tiers["can_make_now"]],
            almost_there=[RecipeResult(**r) for r in tiers["almost_there"]],
            needs_shopping=[RecipeResult(**r) for r in tiers["needs_shopping"]],
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in suggest_recipes: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong processing your request.",
        ) from exc


@router.get("/recipes/history")
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    """Return the most recent recipe suggestion requests stored in the database.

    Queries suggestion_requests ordered by created_at descending and includes
    a computed total_recipes_found field derived from the stored results_json.

    Args:
        limit: Maximum number of records to return. Defaults to 10.
        db: Injected SQLAlchemy session.

    Returns:
        A list of dicts, each containing request_id, ingredients_provided,
        created_at, and total_recipes_found.
    """
    rows = (
        db.query(SuggestionRequest)
        .order_by(SuggestionRequest.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "request_id": row.id,
            "ingredients_provided": row.ingredients_provided,
            "created_at": row.created_at,
            "total_recipes_found": (
                len(row.results_json.get("recipes", []))
                if row.results_json
                else 0
            ),
        }
        for row in rows
    ]


@router.get("/health")
def health_check():
    """Check the operational status of the API, LLM connection, and database.

    Tests the database by executing a lightweight 'SELECT 1' query. The LLM
    status is reported as connected when the API key is configured; no live
    network call is made. Always returns HTTP 200 — the individual status
    fields indicate which components are healthy.

    Returns:
        Dict with keys 'status', 'llm', and 'database', each set to either
        'connected' or 'disconnected'.
    """
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:
        db_status = "disconnected"

    llm_status = "connected" if settings.GROQ_API_KEY else "disconnected"

    return {"status": "ok", "llm": llm_status, "database": db_status}
