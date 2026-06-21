import pytest
from app.services.ranker import rank_recipes


def make_recipe(name: str, match_percentage: float) -> dict:
    """Return a minimal recipe dict with the given name and match percentage."""
    return {
        "name": name,
        "description": "A test recipe.",
        "used_ingredients": ["onions", "tomatoes"],
        "missing_ingredients": [],
        "match_percentage": match_percentage,
        "prep_time_minutes": 20,
        "instructions": ["Step 1", "Step 2"],
        "difficulty": "easy",
    }


# ---------------------------------------------------------------------------
# Tier routing
# ---------------------------------------------------------------------------

def test_100_percent_goes_into_can_make_now():
    result = rank_recipes([make_recipe("Full Match", 100.0)])
    assert len(result["can_make_now"]) == 1
    assert result["can_make_now"][0]["name"] == "Full Match"
    assert result["almost_there"] == []
    assert result["needs_shopping"] == []


def test_75_percent_goes_into_almost_there():
    result = rank_recipes([make_recipe("Good Match", 75.0)])
    assert len(result["almost_there"]) == 1
    assert result["almost_there"][0]["name"] == "Good Match"
    assert result["can_make_now"] == []
    assert result["needs_shopping"] == []


def test_30_percent_goes_into_needs_shopping():
    result = rank_recipes([make_recipe("Poor Match", 30.0)])
    assert len(result["needs_shopping"]) == 1
    assert result["needs_shopping"][0]["name"] == "Poor Match"
    assert result["can_make_now"] == []
    assert result["almost_there"] == []


# ---------------------------------------------------------------------------
# Boundary values
# ---------------------------------------------------------------------------

def test_exactly_50_percent_goes_into_almost_there():
    result = rank_recipes([make_recipe("Boundary Low", 50.0)])
    assert len(result["almost_there"]) == 1
    assert result["almost_there"][0]["name"] == "Boundary Low"
    assert result["needs_shopping"] == []


def test_exactly_0_percent_goes_into_needs_shopping():
    result = rank_recipes([make_recipe("No Match", 0.0)])
    assert len(result["needs_shopping"]) == 1
    assert result["needs_shopping"][0]["name"] == "No Match"
    assert result["can_make_now"] == []
    assert result["almost_there"] == []


# ---------------------------------------------------------------------------
# Empty input
# ---------------------------------------------------------------------------

def test_empty_list_returns_three_empty_categories():
    result = rank_recipes([])
    assert result == {"can_make_now": [], "almost_there": [], "needs_shopping": []}


# ---------------------------------------------------------------------------
# Sorting within categories
# ---------------------------------------------------------------------------

def test_results_within_can_make_now_sorted_descending():
    recipes = [
        make_recipe("Full Match A", 100.0),
        make_recipe("Full Match B", 100.0),
    ]
    result = rank_recipes(recipes)
    percentages = [r["match_percentage"] for r in result["can_make_now"]]
    assert percentages == sorted(percentages, reverse=True)


def test_results_within_almost_there_sorted_descending():
    recipes = [
        make_recipe("Decent", 60.0),
        make_recipe("Good", 90.0),
        make_recipe("Okay", 75.0),
    ]
    result = rank_recipes(recipes)
    percentages = [r["match_percentage"] for r in result["almost_there"]]
    assert percentages == [90.0, 75.0, 60.0]


def test_results_within_needs_shopping_sorted_descending():
    recipes = [
        make_recipe("Low A", 10.0),
        make_recipe("Low B", 40.0),
        make_recipe("Low C", 25.0),
    ]
    result = rank_recipes(recipes)
    percentages = [r["match_percentage"] for r in result["needs_shopping"]]
    assert percentages == [40.0, 25.0, 10.0]


# ---------------------------------------------------------------------------
# Multi-category split
# ---------------------------------------------------------------------------

def test_multiple_recipes_split_across_all_three_categories():
    recipes = [
        make_recipe("Egg Sauce with Rice", 100.0),
        make_recipe("Fried Egg Stew", 100.0),
        make_recipe("Tomato Fried Rice", 86.0),
        make_recipe("Jollof Rice", 62.0),
        make_recipe("Egusi Soup", 30.0),
    ]
    result = rank_recipes(recipes)

    assert len(result["can_make_now"]) == 2
    assert len(result["almost_there"]) == 2
    assert len(result["needs_shopping"]) == 1


def test_multi_category_names_land_in_correct_tier():
    recipes = [
        make_recipe("Egg Sauce with Rice", 100.0),
        make_recipe("Fried Egg Stew", 100.0),
        make_recipe("Tomato Fried Rice", 86.0),
        make_recipe("Jollof Rice", 62.0),
        make_recipe("Egusi Soup", 30.0),
    ]
    result = rank_recipes(recipes)

    can_names = {r["name"] for r in result["can_make_now"]}
    almost_names = {r["name"] for r in result["almost_there"]}
    shopping_names = {r["name"] for r in result["needs_shopping"]}

    assert can_names == {"Egg Sauce with Rice", "Fried Egg Stew"}
    assert almost_names == {"Tomato Fried Rice", "Jollof Rice"}
    assert shopping_names == {"Egusi Soup"}


def test_multi_category_global_order_descending():
    recipes = [
        make_recipe("Egg Sauce with Rice", 100.0),
        make_recipe("Fried Egg Stew", 100.0),
        make_recipe("Tomato Fried Rice", 86.0),
        make_recipe("Jollof Rice", 62.0),
        make_recipe("Egusi Soup", 30.0),
    ]
    result = rank_recipes(recipes)

    assert result["can_make_now"][0]["match_percentage"] >= result["can_make_now"][-1]["match_percentage"]
    assert result["almost_there"][0]["match_percentage"] >= result["almost_there"][-1]["match_percentage"]
