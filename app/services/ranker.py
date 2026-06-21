def rank_recipes(recipes: list) -> dict:
    """Sort and split recipes into three tiers based on ingredient match percentage.

    Recipes within each tier are ordered by match_percentage descending so the
    best matches appear first. An empty input list is handled gracefully and
    returns three empty tiers.

    Args:
        recipes: List of recipe dicts, each expected to contain a
                 'match_percentage' key with a float value (0.0 – 100.0).

    Returns:
        A dict with three keys:
            can_make_now   – recipes where match_percentage == 100.0
            almost_there   – recipes where 50.0 <= match_percentage < 100.0
            needs_shopping – recipes where match_percentage < 50.0
    """
    if not recipes:
        return {"can_make_now": [], "almost_there": [], "needs_shopping": []}

    sorted_recipes = sorted(recipes, key=lambda r: r.get("match_percentage", 0.0), reverse=True)

    can_make_now = []
    almost_there = []
    needs_shopping = []

    for recipe in sorted_recipes:
        pct = recipe.get("match_percentage", 0.0)
        if pct == 100.0:
            can_make_now.append(recipe)
        elif pct >= 50.0:
            almost_there.append(recipe)
        else:
            needs_shopping.append(recipe)

    return {
        "can_make_now": can_make_now,
        "almost_there": almost_there,
        "needs_shopping": needs_shopping,
    }
