from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import cast, or_, String
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import RecipeLibrary
from app.schemas import RecipeLibraryCreate, RecipeLibraryResponse

router = APIRouter(tags=["Recipe Library"])


@router.post("/library/recipes", response_model=RecipeLibraryResponse, status_code=201)
def create_library_recipe(body: RecipeLibraryCreate, db: Session = Depends(get_db)):
    """Add a new recipe to the curated library.

    Checks for a duplicate name before inserting. Returns the full persisted
    record including its generated id and timestamp.

    Args:
        body: Validated recipe payload.
        db: Injected SQLAlchemy session.

    Returns:
        RecipeLibraryResponse for the newly created record.

    Raises:
        HTTPException 400: When a recipe with the same name already exists.
    """
    if db.query(RecipeLibrary).filter(RecipeLibrary.name == body.name).first():
        raise HTTPException(status_code=400, detail=f"A recipe named '{body.name}' already exists in the library.")

    recipe = RecipeLibrary(**body.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/library/recipes/search", response_model=list[RecipeLibraryResponse])
def search_library_recipes(q: str, db: Session = Depends(get_db)):
    """Search library recipes by name or ingredient.

    Performs a case-insensitive substring search across the recipe name and
    the full serialised ingredients list.

    Args:
        q: Search term to match against name and ingredients.
        db: Injected SQLAlchemy session.

    Returns:
        A list of matching RecipeLibraryResponse objects. Empty list when nothing matches.
    """
    pattern = f"%{q}%"
    return (
        db.query(RecipeLibrary)
        .filter(
            or_(
                RecipeLibrary.name.ilike(pattern),
                cast(RecipeLibrary.ingredients, String).ilike(pattern),
            )
        )
        .all()
    )


@router.get("/library/recipes", response_model=list[RecipeLibraryResponse])
def list_library_recipes(
    region: str | None = None,
    category: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return all recipes in the library with optional filtering.

    Args:
        region: When provided, only return recipes for this region.
        category: When provided, only return recipes in this category.
        limit: Maximum number of recipes to return. Defaults to 50.
        db: Injected SQLAlchemy session.

    Returns:
        A list of RecipeLibraryResponse objects. Empty list when the library is empty.
    """
    query = db.query(RecipeLibrary)
    if region:
        query = query.filter(RecipeLibrary.region == region)
    if category:
        query = query.filter(RecipeLibrary.category == category)
    return query.limit(limit).all()


@router.get("/library/recipes/{recipe_id}", response_model=RecipeLibraryResponse)
def get_library_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Return a single library recipe by its id.

    Args:
        recipe_id: Primary key of the recipe_library row.
        db: Injected SQLAlchemy session.

    Returns:
        RecipeLibraryResponse for the requested recipe.

    Raises:
        HTTPException 404: When no recipe with the given id exists.
    """
    recipe = db.query(RecipeLibrary).filter(RecipeLibrary.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found in library.")
    return recipe


@router.put("/library/recipes/{recipe_id}", response_model=RecipeLibraryResponse)
def update_library_recipe(recipe_id: int, body: RecipeLibraryCreate, db: Session = Depends(get_db)):
    """Replace all fields of an existing library recipe.

    Args:
        recipe_id: Primary key of the recipe_library row to update.
        body: New values for every field.
        db: Injected SQLAlchemy session.

    Returns:
        RecipeLibraryResponse reflecting the updated record.

    Raises:
        HTTPException 404: When no recipe with the given id exists.
    """
    recipe = db.query(RecipeLibrary).filter(RecipeLibrary.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found in library.")

    for field, value in body.model_dump().items():
        setattr(recipe, field, value)

    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/library/recipes/{recipe_id}")
def delete_library_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Remove a recipe from the library by its id.

    Args:
        recipe_id: Primary key of the recipe_library row to delete.
        db: Injected SQLAlchemy session.

    Returns:
        Dict with a confirmation message on successful deletion.

    Raises:
        HTTPException 404: When no recipe with the given id exists.
    """
    recipe = db.query(RecipeLibrary).filter(RecipeLibrary.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found in library.")

    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}
