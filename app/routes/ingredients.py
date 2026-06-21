from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import IngredientLog
from app.schemas import PopularIngredientResponse

router = APIRouter(tags=["ingredients"])


@router.get("/ingredients/popular", response_model=list[PopularIngredientResponse])
def get_popular_ingredients(db: Session = Depends(get_db)):
    """Return the ten most frequently used ingredients across all suggestion requests.

    Aggregates the ingredient_logs table by ingredient name, counts occurrences,
    and returns results ordered by count descending. Returns an empty list when
    no ingredient logs exist yet.

    Args:
        db: Injected SQLAlchemy session.

    Returns:
        A list of up to 10 PopularIngredientResponse objects, each containing
        the ingredient name and its total usage count.
    """
    rows = (
        db.query(IngredientLog.ingredient, func.count(IngredientLog.id).label("count"))
        .group_by(IngredientLog.ingredient)
        .order_by(func.count(IngredientLog.id).desc())
        .limit(10)
        .all()
    )

    return [PopularIngredientResponse(ingredient=row.ingredient, count=row.count) for row in rows]
