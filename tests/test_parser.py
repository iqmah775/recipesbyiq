import json
import pathlib
import pytest
from app.services.parser import LLMParseError, parse_llm_response

MOCK_DIR = pathlib.Path(__file__).parent / "mock_responses"

MINIMAL_RECIPES = {"recipes": [{"name": "Jollof Rice", "match_percentage": 100}]}
MINIMAL_JSON = json.dumps(MINIMAL_RECIPES)


# ---------------------------------------------------------------------------
# Valid input
# ---------------------------------------------------------------------------

def test_clean_valid_json_returns_dict():
    result = parse_llm_response(MINIMAL_JSON)
    assert isinstance(result, dict)


def test_clean_valid_json_has_recipes_key():
    result = parse_llm_response(MINIMAL_JSON)
    assert "recipes" in result


def test_clean_valid_json_recipes_is_list():
    result = parse_llm_response(MINIMAL_JSON)
    assert isinstance(result["recipes"], list)


def test_clean_valid_json_preserves_content():
    result = parse_llm_response(MINIMAL_JSON)
    assert result["recipes"][0]["name"] == "Jollof Rice"


# ---------------------------------------------------------------------------
# Markdown fence stripping
# ---------------------------------------------------------------------------

def test_json_wrapped_in_json_backticks_parses_correctly():
    wrapped = f"```json\n{MINIMAL_JSON}\n```"
    result = parse_llm_response(wrapped)
    assert result["recipes"][0]["name"] == "Jollof Rice"


def test_json_wrapped_in_plain_backticks_parses_correctly():
    wrapped = f"```\n{MINIMAL_JSON}\n```"
    result = parse_llm_response(wrapped)
    assert result["recipes"][0]["name"] == "Jollof Rice"


def test_json_wrapped_in_backticks_without_newline_raises_llm_parse_error():
    # No newline between the fence and the JSON — not a format any LLM produces
    # and not valid markdown. The parser cannot clean this, so it should fail.
    wrapped = f"```json{MINIMAL_JSON}```"
    with pytest.raises(LLMParseError):
        parse_llm_response(wrapped)


# ---------------------------------------------------------------------------
# Whitespace handling
# ---------------------------------------------------------------------------

def test_leading_and_trailing_whitespace_is_handled():
    padded = f"   \n\n{MINIMAL_JSON}\n\n   "
    result = parse_llm_response(padded)
    assert "recipes" in result


def test_whitespace_inside_backtick_fence_is_handled():
    wrapped = f"```json\n\n   {MINIMAL_JSON}\n\n```"
    result = parse_llm_response(wrapped)
    assert "recipes" in result


# ---------------------------------------------------------------------------
# LLMParseError — broken JSON
# ---------------------------------------------------------------------------

def test_completely_broken_string_raises_llm_parse_error():
    with pytest.raises(LLMParseError):
        parse_llm_response("This is not JSON at all")


def test_truncated_json_raises_llm_parse_error():
    with pytest.raises(LLMParseError):
        parse_llm_response('{"recipes": [{"name": "Jollof')


def test_empty_string_raises_llm_parse_error():
    with pytest.raises(LLMParseError):
        parse_llm_response("")


def test_plain_text_explanation_raises_llm_parse_error():
    with pytest.raises(LLMParseError):
        parse_llm_response("Here are some great Nigerian recipes for you!")


# ---------------------------------------------------------------------------
# LLMParseError — schema violations
# ---------------------------------------------------------------------------

def test_missing_recipes_key_raises_llm_parse_error():
    bad = json.dumps({"results": [{"name": "Jollof Rice"}]})
    with pytest.raises(LLMParseError, match="missing the required 'recipes' key"):
        parse_llm_response(bad)


def test_recipes_as_dict_raises_llm_parse_error():
    bad = json.dumps({"recipes": {"name": "Jollof Rice"}})
    with pytest.raises(LLMParseError, match="Expected 'recipes' to be a list"):
        parse_llm_response(bad)


def test_recipes_as_string_raises_llm_parse_error():
    bad = json.dumps({"recipes": "Jollof Rice"})
    with pytest.raises(LLMParseError):
        parse_llm_response(bad)


def test_recipes_as_null_raises_llm_parse_error():
    bad = json.dumps({"recipes": None})
    with pytest.raises(LLMParseError):
        parse_llm_response(bad)


def test_recipes_as_integer_raises_llm_parse_error():
    bad = json.dumps({"recipes": 5})
    with pytest.raises(LLMParseError):
        parse_llm_response(bad)


# ---------------------------------------------------------------------------
# LLMParseError is raised (not a raw exception)
# ---------------------------------------------------------------------------

def test_broken_json_raises_llm_parse_error_not_json_decode_error():
    with pytest.raises(LLMParseError):
        parse_llm_response("{bad json}")


# ---------------------------------------------------------------------------
# Mock file integration
# ---------------------------------------------------------------------------

def test_mock_llm_response_file_parses_correctly():
    raw = (MOCK_DIR / "llm_response.json").read_text(encoding="utf-8")
    result = parse_llm_response(raw)
    assert "recipes" in result
    assert isinstance(result["recipes"], list)


def test_mock_llm_response_contains_five_recipes():
    raw = (MOCK_DIR / "llm_response.json").read_text(encoding="utf-8")
    result = parse_llm_response(raw)
    assert len(result["recipes"]) == 5


def test_mock_llm_response_recipes_have_required_fields():
    raw = (MOCK_DIR / "llm_response.json").read_text(encoding="utf-8")
    result = parse_llm_response(raw)
    required_fields = {
        "name", "description", "used_ingredients", "missing_ingredients",
        "match_percentage", "prep_time_minutes", "instructions", "difficulty",
    }
    for recipe in result["recipes"]:
        assert required_fields.issubset(recipe.keys()), (
            f"Recipe '{recipe.get('name')}' is missing fields: "
            f"{required_fields - recipe.keys()}"
        )


def test_mock_llm_response_match_percentages_are_valid():
    raw = (MOCK_DIR / "llm_response.json").read_text(encoding="utf-8")
    result = parse_llm_response(raw)
    for recipe in result["recipes"]:
        pct = recipe["match_percentage"]
        assert 0.0 <= pct <= 100.0, f"match_percentage {pct} out of range for '{recipe['name']}'"
