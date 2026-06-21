import json


class LLMParseError(Exception):
    """Raised when the raw LLM response cannot be parsed into the expected structure.

    Wraps both JSON decode failures and schema validation failures so callers
    only need to catch one exception type for all LLM output problems.
    """


def parse_llm_response(raw_response: str) -> dict:
    """Parse a raw LLM response string into a validated recipe dictionary.

    Cleans common LLM formatting artifacts (leading/trailing whitespace,
    markdown code fences) before attempting JSON parsing, then validates
    that the result contains a well-formed 'recipes' list.

    Args:
        raw_response: The unprocessed string returned by the LLM.

    Returns:
        A dict containing at minimum a 'recipes' key whose value is a list.

    Raises:
        LLMParseError: If the string cannot be decoded as JSON.
        LLMParseError: If the decoded object has no 'recipes' key.
        LLMParseError: If 'recipes' exists but is not a list.
    """
    cleaned = _clean(raw_response)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise LLMParseError(
            f"LLM response is not valid JSON: {exc}"
        ) from exc

    if "recipes" not in parsed:
        raise LLMParseError(
            "LLM response is missing the required 'recipes' key. "
            f"Keys present: {list(parsed.keys())}"
        )

    if not isinstance(parsed["recipes"], list):
        raise LLMParseError(
            f"Expected 'recipes' to be a list, got {type(parsed['recipes']).__name__}."
        )

    return parsed


def _clean(raw: str) -> str:
    """Strip whitespace and markdown code fences from a raw LLM string.

    Handles both plain ```...``` fences and language-tagged ```json...``` fences
    that LLMs commonly wrap their JSON output in.

    Args:
        raw: The unprocessed LLM output string.

    Returns:
        The cleaned string ready for JSON parsing.
    """
    text = raw.strip()

    if text.startswith("```"):
        # Remove opening fence (with or without a language tag)
        first_newline = text.find("\n")
        if first_newline != -1:
            text = text[first_newline + 1:]

        # Remove closing fence
        if text.endswith("```"):
            text = text[: -3]

    return text.strip()
