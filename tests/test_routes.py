import json
import os
import pathlib

# Must be set before importing app modules so pydantic-settings picks them up.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GROQ_API_KEY", "test-key")

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db

# ---------------------------------------------------------------------------
# Mock LLM data
# ---------------------------------------------------------------------------

MOCK_DIR = pathlib.Path(__file__).parent / "mock_responses"
MOCK_LLM_DATA = json.loads((MOCK_DIR / "llm_response.json").read_text(encoding="utf-8"))

VALID_INGREDIENTS = ["eggs", "tomatoes", "onions", "rice", "palm oil", "scotch bonnet"]

# ---------------------------------------------------------------------------
# Test database — in-memory SQLite with StaticPool so all sessions share one DB
# ---------------------------------------------------------------------------

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    """Create all tables before each test and drop them after for full isolation."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _suggest(ingredients=None, cuisine="italian"):
    """POST /api/v1/recipes/suggest via the LLM path (non-Nigerian cuisine by default)."""
    with patch("app.routes.recipes.get_recipe_suggestions", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = MOCK_LLM_DATA
        return client.post(
            "/api/v1/recipes/suggest",
            json={
                "ingredients": ingredients or VALID_INGREDIENTS,
                "cuisine_preference": cuisine,
            },
        )


# ---------------------------------------------------------------------------
# POST /api/v1/recipes/suggest
# ---------------------------------------------------------------------------

def test_suggest_returns_200():
    assert _suggest().status_code == 200


def test_suggest_response_has_required_keys():
    data = _suggest().json()
    assert "request_id" in data
    assert "ingredients_provided" in data
    assert "total_recipes_found" in data
    assert "can_make_now" in data
    assert "almost_there" in data
    assert "needs_shopping" in data


def test_suggest_echoes_ingredients():
    data = _suggest().json()
    assert set(data["ingredients_provided"]) == set(VALID_INGREDIENTS)


def test_suggest_correct_total_recipes_found():
    data = _suggest().json()
    assert data["total_recipes_found"] == 5


def test_suggest_correct_tier_distribution():
    data = _suggest().json()
    assert len(data["can_make_now"]) == 2
    assert len(data["almost_there"]) == 2
    assert len(data["needs_shopping"]) == 1


def test_suggest_recipe_result_has_required_fields():
    data = _suggest().json()
    recipe = data["can_make_now"][0]
    for field in ("name", "description", "used_ingredients", "missing_ingredients",
                  "match_percentage", "prep_time_minutes", "instructions", "difficulty"):
        assert field in recipe, f"Missing field: {field}"


def test_suggest_empty_ingredients_returns_422():
    response = client.post("/api/v1/recipes/suggest", json={"ingredients": []})
    assert response.status_code == 422


def test_suggest_too_many_ingredients_returns_400():
    too_many = [f"ingredient_{i}" for i in range(25)]
    response = client.post("/api/v1/recipes/suggest", json={"ingredients": too_many})
    assert response.status_code == 400


def test_suggest_persists_to_history():
    _suggest()
    history = client.get("/api/v1/recipes/history").json()
    assert len(history) == 1


def test_suggest_logs_ingredients():
    _suggest()
    popular = client.get("/api/v1/ingredients/popular").json()
    assert len(popular) == len(VALID_INGREDIENTS)


# ---------------------------------------------------------------------------
# GET /api/v1/recipes/history
# ---------------------------------------------------------------------------

def test_history_returns_200():
    response = client.get("/api/v1/recipes/history")
    assert response.status_code == 200


def test_history_returns_list():
    response = client.get("/api/v1/recipes/history")
    assert isinstance(response.json(), list)


def test_history_empty_when_no_requests():
    assert client.get("/api/v1/recipes/history").json() == []


def test_history_entry_has_required_keys():
    _suggest()
    entry = client.get("/api/v1/recipes/history").json()[0]
    assert "request_id" in entry
    assert "ingredients_provided" in entry
    assert "created_at" in entry
    assert "total_recipes_found" in entry


def test_history_total_recipes_found_is_correct():
    _suggest()
    entry = client.get("/api/v1/recipes/history").json()[0]
    assert entry["total_recipes_found"] == 5


# ---------------------------------------------------------------------------
# POST /api/v1/recipes/save
# ---------------------------------------------------------------------------

def test_save_recipe_returns_201():
    response = client.post("/api/v1/recipes/save", json={
        "recipe_name": "Jollof Rice",
        "recipe_data": {"prep_time_minutes": 45},
    })
    assert response.status_code == 201


def test_save_recipe_response_has_correct_fields():
    response = client.post("/api/v1/recipes/save", json={
        "recipe_name": "Jollof Rice",
        "recipe_data": {"prep_time_minutes": 45},
    })
    data = response.json()
    assert data["recipe_name"] == "Jollof Rice"
    assert "id" in data
    assert "saved_at" in data
    assert data["recipe_data"]["prep_time_minutes"] == 45


# ---------------------------------------------------------------------------
# GET /api/v1/recipes/saved
# ---------------------------------------------------------------------------

def test_get_saved_returns_200():
    assert client.get("/api/v1/recipes/saved").status_code == 200


def test_get_saved_returns_empty_list_when_none():
    assert client.get("/api/v1/recipes/saved").json() == []


def test_get_saved_returns_saved_recipe():
    client.post("/api/v1/recipes/save", json={
        "recipe_name": "Egusi Soup",
        "recipe_data": {},
    })
    data = client.get("/api/v1/recipes/saved").json()
    assert len(data) == 1
    assert data[0]["recipe_name"] == "Egusi Soup"


def test_get_saved_ordered_most_recent_first():
    client.post("/api/v1/recipes/save", json={"recipe_name": "First", "recipe_data": {}})
    client.post("/api/v1/recipes/save", json={"recipe_name": "Second", "recipe_data": {}})
    data = client.get("/api/v1/recipes/saved").json()
    assert data[0]["recipe_name"] == "Second"


# ---------------------------------------------------------------------------
# DELETE /api/v1/recipes/saved/{id}
# ---------------------------------------------------------------------------

def test_delete_saved_recipe_returns_200():
    recipe_id = client.post("/api/v1/recipes/save", json={
        "recipe_name": "Fried Rice", "recipe_data": {},
    }).json()["id"]
    response = client.delete(f"/api/v1/recipes/saved/{recipe_id}")
    assert response.status_code == 200


def test_delete_saved_recipe_returns_success_message():
    recipe_id = client.post("/api/v1/recipes/save", json={
        "recipe_name": "Fried Rice", "recipe_data": {},
    }).json()["id"]
    response = client.delete(f"/api/v1/recipes/saved/{recipe_id}")
    assert response.json() == {"message": "Recipe deleted successfully"}


def test_delete_saved_recipe_removes_from_db():
    recipe_id = client.post("/api/v1/recipes/save", json={
        "recipe_name": "Fried Rice", "recipe_data": {},
    }).json()["id"]
    client.delete(f"/api/v1/recipes/saved/{recipe_id}")
    assert client.get("/api/v1/recipes/saved").json() == []


def test_delete_nonexistent_recipe_returns_404():
    response = client.delete("/api/v1/recipes/saved/99999")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# GET /api/v1/ingredients/popular
# ---------------------------------------------------------------------------

def test_popular_ingredients_returns_200():
    assert client.get("/api/v1/ingredients/popular").status_code == 200


def test_popular_ingredients_returns_list():
    assert isinstance(client.get("/api/v1/ingredients/popular").json(), list)


def test_popular_ingredients_empty_when_no_data():
    assert client.get("/api/v1/ingredients/popular").json() == []


def test_popular_ingredients_entry_has_correct_fields():
    _suggest()
    entry = client.get("/api/v1/ingredients/popular").json()[0]
    assert "ingredient" in entry
    assert "count" in entry
    assert isinstance(entry["count"], int)


def test_popular_ingredients_returns_at_most_10():
    assert len(client.get("/api/v1/ingredients/popular").json()) <= 10


# ---------------------------------------------------------------------------
# GET /api/v1/health
# ---------------------------------------------------------------------------

def test_health_returns_200():
    assert client.get("/api/v1/health").status_code == 200


def test_health_status_is_ok():
    assert client.get("/api/v1/health").json()["status"] == "ok"


def test_health_has_all_keys():
    data = client.get("/api/v1/health").json()
    assert "status" in data
    assert "llm" in data
    assert "database" in data


# ---------------------------------------------------------------------------
# GET /
# ---------------------------------------------------------------------------

def test_root_returns_200():
    assert client.get("/").status_code == 200


def test_root_returns_welcome_message():
    data = client.get("/").json()
    assert data["message"] == "Welcome to RecipesByIQ API"
    assert "docs" in data


# ---------------------------------------------------------------------------
# Recipe Library — shared fixture payload
# ---------------------------------------------------------------------------

JOLLOF_PAYLOAD = {
    "name": "Jollof Rice",
    "region": "general",
    "category": "rice",
    "description": "Classic Nigerian Jollof Rice slowly cooked in a rich, spiced tomato base. It is a beloved party staple with a distinct smoky flavour.",
    "ingredients": [
        "2 cups long grain rice",
        "3 large tomatoes",
        "2 red bell peppers",
        "2 scotch bonnet",
        "1 large onion",
        "3 tbsp palm oil",
        "1 tsp curry powder",
        "1 tsp thyme",
    ],
    "instructions": [
        "Blend tomatoes, red bell peppers, and scotch bonnet into a smooth purée.",
        "Fry chopped onion in palm oil for 3 minutes until golden.",
        "Add the blended pepper and fry on medium heat for 20-30 minutes until oil floats on top.",
        "Add washed rice, stock, curry, and thyme. Stir to combine.",
        "Cover tightly and cook on low heat for 30-40 minutes without lifting the lid.",
        "Fluff gently and serve hot.",
    ],
    "prep_time_minutes": 15,
    "cook_time_minutes": 50,
    "servings": 4,
    "difficulty": "medium",
    "tips": "Use parboiled long-grain rice for best results.",
    "is_traditional": True,
    "is_modern_twist": False,
}


# ---------------------------------------------------------------------------
# POST /api/v1/library/recipes
# ---------------------------------------------------------------------------

def test_create_library_recipe_returns_201():
    assert client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).status_code == 201


def test_create_library_recipe_returns_correct_fields():
    data = client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).json()
    assert data["name"] == "Jollof Rice"
    assert data["region"] == "general"
    assert data["category"] == "rice"
    assert data["is_traditional"] is True
    assert "id" in data
    assert "created_at" in data


def test_create_library_recipe_duplicate_name_returns_400():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    assert client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).status_code == 400


# ---------------------------------------------------------------------------
# GET /api/v1/library/recipes
# ---------------------------------------------------------------------------

def test_list_library_recipes_returns_200():
    assert client.get("/api/v1/library/recipes").status_code == 200


def test_list_library_recipes_empty():
    assert client.get("/api/v1/library/recipes").json() == []


def test_list_library_recipes_returns_created_recipe():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    data = client.get("/api/v1/library/recipes").json()
    assert len(data) == 1
    assert data[0]["name"] == "Jollof Rice"


def test_list_library_recipes_filter_by_region():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    assert len(client.get("/api/v1/library/recipes?region=general").json()) == 1
    assert client.get("/api/v1/library/recipes?region=yoruba").json() == []


def test_list_library_recipes_filter_by_category():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    assert len(client.get("/api/v1/library/recipes?category=rice").json()) == 1
    assert client.get("/api/v1/library/recipes?category=soup").json() == []


# ---------------------------------------------------------------------------
# GET /api/v1/library/recipes/search
# ---------------------------------------------------------------------------

def test_search_library_recipes_by_name():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    data = client.get("/api/v1/library/recipes/search?q=Jollof").json()
    assert len(data) == 1
    assert data[0]["name"] == "Jollof Rice"


def test_search_library_recipes_by_ingredient():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    data = client.get("/api/v1/library/recipes/search?q=scotch bonnet").json()
    assert len(data) == 1


def test_search_library_recipes_no_match_returns_empty():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    assert client.get("/api/v1/library/recipes/search?q=pizza").json() == []


# ---------------------------------------------------------------------------
# GET /api/v1/library/recipes/{recipe_id}
# ---------------------------------------------------------------------------

def test_get_library_recipe_by_id():
    created_id = client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).json()["id"]
    data = client.get(f"/api/v1/library/recipes/{created_id}").json()
    assert data["name"] == "Jollof Rice"


def test_get_library_recipe_not_found_returns_404():
    assert client.get("/api/v1/library/recipes/9999").status_code == 404


# ---------------------------------------------------------------------------
# PUT /api/v1/library/recipes/{recipe_id}
# ---------------------------------------------------------------------------

def test_update_library_recipe_returns_200():
    created_id = client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).json()["id"]
    updated = {**JOLLOF_PAYLOAD, "description": "Updated description."}
    assert client.put(f"/api/v1/library/recipes/{created_id}", json=updated).status_code == 200


def test_update_library_recipe_persists_change():
    created_id = client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).json()["id"]
    updated = {**JOLLOF_PAYLOAD, "difficulty": "hard"}
    client.put(f"/api/v1/library/recipes/{created_id}", json=updated)
    assert client.get(f"/api/v1/library/recipes/{created_id}").json()["difficulty"] == "hard"


def test_update_library_recipe_not_found_returns_404():
    assert client.put("/api/v1/library/recipes/9999", json=JOLLOF_PAYLOAD).status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/v1/library/recipes/{recipe_id}
# ---------------------------------------------------------------------------

def test_delete_library_recipe_returns_200():
    created_id = client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).json()["id"]
    response = client.delete(f"/api/v1/library/recipes/{created_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Recipe deleted successfully"}


def test_delete_library_recipe_removes_from_db():
    created_id = client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD).json()["id"]
    client.delete(f"/api/v1/library/recipes/{created_id}")
    assert client.get(f"/api/v1/library/recipes/{created_id}").status_code == 404


def test_delete_library_recipe_not_found_returns_404():
    assert client.delete("/api/v1/library/recipes/9999").status_code == 404


# ---------------------------------------------------------------------------
# POST /api/v1/recipes/suggest — Nigerian cuisine path (DB matcher)
# ---------------------------------------------------------------------------

def test_suggest_nigerian_empty_library_returns_message():
    response = client.post("/api/v1/recipes/suggest", json={
        "ingredients": VALID_INGREDIENTS,
        "cuisine_preference": "nigerian",
    })
    assert response.status_code == 200
    assert "message" in response.json()


def test_suggest_nigerian_with_library_returns_ranked_response():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    response = client.post("/api/v1/recipes/suggest", json={
        "ingredients": ["tomatoes", "onion", "palm oil", "rice", "scotch bonnet"],
        "cuisine_preference": "nigerian",
    })
    assert response.status_code == 200
    data = response.json()
    assert "can_make_now" in data or "almost_there" in data or "needs_shopping" in data
    assert "total_recipes_found" in data
    assert "request_id" in data


def test_suggest_nigerian_matched_recipe_in_correct_tier():
    client.post("/api/v1/library/recipes", json=JOLLOF_PAYLOAD)
    # Send all 8 recipe ingredients — expect 100% match
    response = client.post("/api/v1/recipes/suggest", json={
        "ingredients": [
            "rice", "tomatoes", "red bell peppers", "scotch bonnet",
            "onion", "palm oil", "curry powder", "thyme",
        ],
        "cuisine_preference": "nigerian",
    })
    data = response.json()
    assert len(data["can_make_now"]) == 1
    assert data["can_make_now"][0]["name"] == "Jollof Rice"
