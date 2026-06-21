import re
from app.models import RecipeLibrary
from app.services.dietary import check_dietary_restrictions
from app.services.ranker import rank_recipes


def match_recipes_from_db(ingredients: list[str], db, dietary_restrictions: list[str] = []) -> dict:
    """Match user ingredients against the recipe_library table and return ranked results.

    Fetches every recipe from the library, computes an ingredient match percentage
    for each one (ignoring quantities and measurement units), builds dicts in the
    shape expected by RecipeResult, then passes them through rank_recipes to
    produce the three-tier ranked output.

    Args:
        ingredients: Simple ingredient strings the user has at home
                     (e.g. ['eggs', 'onions', 'palm oil']).
        db: An active SQLAlchemy session.

    Returns:
        A dict with keys can_make_now, almost_there, and needs_shopping, each
        containing a list of recipe dicts compatible with RecipeResult.
    """
    recipes = db.query(RecipeLibrary).all()
    if not recipes:
        return {"can_make_now": [], "almost_there": [], "needs_shopping": []}

    results = []
    for recipe in recipes:
        result = _build_result(recipe, ingredients)

        if dietary_restrictions:
            dietary_check = check_dietary_restrictions(recipe.ingredients, dietary_restrictions)
            if not dietary_check["is_safe"]:
                continue  # skip recipes that violate an exclude-severity restriction
            result.update({
                "dietary_warnings": dietary_check["warnings"],
                "dietary_flagged": dietary_check["flagged"],
                "dietary_labels": dietary_check["restriction_labels"],
                "is_dietary_safe": dietary_check["is_safe"],
            })

        results.append(result)

    return rank_recipes(results)


def _build_result(recipe: RecipeLibrary, user_ingredients: list[str]) -> dict:
    """Build a RecipeResult-compatible dict for a single library recipe.

    Args:
        recipe: A RecipeLibrary ORM row.
        user_ingredients: Simple ingredient strings the user has at home.

    Returns:
        A dict matching the RecipeResult schema fields.
    """
    used = []
    missing = []

    for lib_ingredient in recipe.ingredients:
        if any(_matches(user_ing, lib_ingredient) for user_ing in user_ingredients):
            used.append(lib_ingredient)
        else:
            missing.append(lib_ingredient)

    total = len(recipe.ingredients)
    match_percentage = round((len(used) / total) * 100, 1) if total else 0.0

    return {
        "name": recipe.name,
        "description": recipe.description,
        "used_ingredients": used,
        "missing_ingredients": missing,
        "match_percentage": match_percentage,
        "prep_time_minutes": recipe.prep_time_minutes,
        "cook_time_minutes": recipe.cook_time_minutes,
        "servings": recipe.servings,
        "tips": recipe.tips,
        "instructions": recipe.instructions,
        "difficulty": recipe.difficulty,
    }


def _matches(user_ingredient: str, library_ingredient: str) -> bool:
    """Return True if a user's ingredient is present in a library ingredient string.

    Strips leading quantities and common measurement units from the library
    ingredient before comparing so that '2 cups black eyed beans' matches
    a user ingredient of 'black eyed beans'.

    Args:
        user_ingredient: A simple ingredient name, e.g. 'black eyed beans'.
        library_ingredient: A quantity-prefixed string, e.g. '2 cups black eyed beans'.

    Returns:
        True when user_ingredient appears within the normalised library string.
    """
    return user_ingredient.lower().strip() in _normalise(library_ingredient)


def _normalise(text: str) -> str:
    """Strip numbers, fractions, and measurement words from an ingredient string.

    Args:
        text: Raw ingredient string, e.g. '1½ tbsp palm oil' or '3 large onions'.

    Returns:
        Lowercased string with quantities and units removed.
    """
    # Remove vulgar fractions and numeric values (including decimals and x/y forms)
    text = re.sub(r'\b\d+(?:[./]\d+)?\s*', '', text)

    # Remove common measurement and descriptor words
    units = (
        r'\b(cups?|tablespoons?|tbsps?|teaspoons?|tsps?|kg|grams?|g|lbs?|pounds?|'
        r'oz|ounces?|ml|liters?|litres?|cloves?|pieces?|slices?|handfuls?|bunches?|'
        r'large|medium|small|whole|fresh|dried|chopped|sliced|diced|minced|ground|'
        r'heaped|heaping|level)\b'
    )
    text = re.sub(units, '', text, flags=re.IGNORECASE)

    return ' '.join(text.lower().split())
