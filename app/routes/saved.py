from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SavedRecipe
from app.schemas import SaveRecipeRequest, SavedRecipeResponse

router = APIRouter(tags=["saved"])


@router.post("/recipes/save", response_model=SavedRecipeResponse, status_code=201)
def save_recipe(body: SaveRecipeRequest, db: Session = Depends(get_db)):
    """Bookmark a recipe for future reference.

    Persists the recipe name and full recipe payload to the saved_recipes table
    and returns the newly created row including its generated id and timestamp.

    Args:
        body: Request body containing recipe_name and recipe_data.
        db: Injected SQLAlchemy session.

    Returns:
        SavedRecipeResponse representing the persisted record.
    """
    saved = SavedRecipe(recipe_name=body.recipe_name, recipe_data=body.recipe_data)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.get("/recipes/saved", response_model=list[SavedRecipeResponse])
def list_saved_recipes(db: Session = Depends(get_db)):
    """Return all bookmarked recipes ordered by most recently saved first.

    Args:
        db: Injected SQLAlchemy session.

    Returns:
        A list of SavedRecipeResponse objects. Returns an empty list when no
        recipes have been saved yet.
    """
    return db.query(SavedRecipe).order_by(SavedRecipe.saved_at.desc()).all()


@router.delete("/recipes/saved/{recipe_id}")
def delete_saved_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Remove a bookmarked recipe by its id.

    Args:
        recipe_id: Primary key of the saved_recipes row to delete.
        db: Injected SQLAlchemy session.

    Returns:
        Dict with a confirmation message on successful deletion.

    Raises:
        HTTPException 404: When no saved recipe with the given id exists.
    """
    saved = db.query(SavedRecipe).filter(SavedRecipe.id == recipe_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db.delete(saved)
    db.commit()
    return {"message": "Recipe deleted successfully"}
