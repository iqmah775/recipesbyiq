from fastapi import HTTPException
from app.config import settings
from app.services.dietary import build_dietary_prompt_addition
from app.services.parser import LLMParseError, parse_llm_response


def build_prompt(
    ingredients: list[str],
    cuisine_preference: str,
    max_prep_time: int | None,
    dish_name: str | None = None,
    dietary_restrictions: list[str] | None = None,
) -> str:
    """Build the recipe-suggestion prompt to send to the LLM.

    Args:
        ingredients: Ingredients the user currently has at home.
        cuisine_preference: Cuisine style to prioritise in suggestions.
        max_prep_time: Optional upper bound on prep time in minutes. When
                       provided, a constraint sentence is added to the prompt.
        dish_name: Optional dish name to anchor the suggestions to a specific dish.
        dietary_restrictions: Optional list of restriction keys to inject as constraints.

    Returns:
        The fully formatted prompt string ready to be sent as a user message.
    """
    dietary_addition = build_dietary_prompt_addition(dietary_restrictions or [])

    # ── Dish-name path: user searched for a specific dish ─────────────────────
    if dish_name:
        return f"""You are an expert chef assistant. The user wants to make: {dish_name}

Suggest exactly 5 variations or related recipes for {dish_name}.
{dietary_addition}
For each recipe provide detailed authentic instructions.

Respond ONLY with valid JSON in this exact format, no explanation, no markdown, no backticks:
{{
  "recipes": [
    {{
      "name": "Recipe Name",
      "description": "Two sentence description",
      "used_ingredients": ["ingredient1", "ingredient2"],
      "missing_ingredients": [],
      "match_percentage": 100,
      "prep_time_minutes": 20,
      "cook_time_minutes": 30,
      "servings": 4,
      "difficulty": "easy",
      "tips": "One helpful tip",
      "instructions": [
        "Step 1: Detailed instruction with exact time, heat level, and what to look for",
        "Step 2: Detailed instruction with exact time, heat level, and what to look for",
        "Step 3: Continue with same level of detail",
        "Step 4: Continue with same level of detail",
        "Step 5: Continue with same level of detail",
        "Step 6: Final step with serving suggestion"
      ]
    }}
  ]
}}

Rules:
- All 5 recipes must be real, authentic, correctly named dishes
- Instructions must be detailed with exact times, temperatures, and visual cues
- difficulty = easy, medium, or hard only
- Return ONLY the JSON, nothing else"""

    # ── Ingredient-based path: user provided ingredients ───────────────────────
    ingredients_str = ", ".join(ingredients)

    time_constraint = (
        f"All recipes must take {max_prep_time} minutes or less to prepare."
        if max_prep_time
        else ""
    )

    return f"""You are an expert Nigerian chef assistant. NIGERIAN FOOD REFERENCE GUIDE - Use this as your cooking bible:

Moi Moi: Soak black eyed beans for 30 mins, peel skin by rubbing between palms, blend with water to smooth paste, add crayfish, onions, scotch bonnet, seasoning, fish or egg, pour into foil containers or leaves, steam for 45-60 minutes until firm.

Jollof Rice: Blend tomatoes, red bell pepper, scotch bonnet. Fry onions in oil until golden, add blended pepper and fry for 20-30 minutes until oil floats on top. Add stock, seasoning, bay leaves, curry, thyme. Add washed rice, cook covered on low heat 30-40 minutes.

Egusi Soup: Fry onions in palm oil, add blended scotch bonnet and crayfish, fry 10 minutes. Mix egusi with water to paste, add to pot in lumps, cook 15 minutes. Add meat, stockfish, seasoning, cook 10 more minutes. Add vegetables last.

Pepper Soup: Boil meat with onions and salt. Add pepper soup spice mix, crayfish, scotch bonnet, uziza leaves. Simmer 20 minutes on low heat until broth is deeply flavoured.

Fried Rice: Parboil rice. Stir fry vegetables in hot oil separately. Fry rice in oil with soy sauce. Combine everything with seasoning.

Pounded Yam: Boil yam until very soft, pound in mortar until smooth and stretchy with no lumps. Serve with soup.

Akara: Soak and peel black eyed beans, blend to smooth paste, add onions, scotch bonnet, crayfish, salt, whisk to aerate. Deep fry in hot oil in spoonfuls until golden brown.

ALWAYS follow these traditional methods exactly. Never simplify or combine methods from different dishes.

A user has these ingredients at home: {ingredients_str}

Suggest exactly 5 recipes — prioritize {cuisine_preference} dishes. {time_constraint}
{dietary_addition}
IMPORTANT: Be extremely detailed and explicit in your instructions. Each recipe must have at least 6 steps. Every step must explain exactly:
- How long to cook (e.g. "fry for 5 minutes on medium heat")
- What to look for (e.g. "until the onions turn golden brown")
- Exact quantities where possible (e.g. "add 2 cups of water")
- What the food should look, smell or sound like at each stage

Respond ONLY with valid JSON in this exact format, no explanation, no markdown, no backticks:
{{
  "recipes": [
    {{
      "name": "Recipe Name",
      "description": "Two to three sentence description of the dish including its origin and taste profile",
      "used_ingredients": ["ingredient1"],
      "missing_ingredients": ["ingredient2"],
      "match_percentage": 85,
      "prep_time_minutes": 20,
      "cook_time_minutes": 30,
      "servings": 4,
      "tips": "One helpful cooking tip for this dish",
      "instructions": [
        "Step 1: Detailed instruction with exact time, heat level, and what to look for",
        "Step 2: Detailed instruction with exact time, heat level, and what to look for",
        "Step 3: Continue with same level of detail",
        "Step 4: Continue with same level of detail",
        "Step 5: Continue with same level of detail",
        "Step 6: Final step with serving suggestion"
      ],
      "difficulty": "easy"
    }}
  ]
}}

Rules:
- match_percentage = percentage of recipe ingredients the user already has
- used_ingredients = only from the user's provided list
- missing_ingredients = what the recipe needs that the user does not have
- difficulty = easy, medium, or hard only
- Every instruction step must be at least 2 sentences long
- Include exact cooking times, temperatures, and visual cues in every step
- Sort by match_percentage descending
- Return ONLY the JSON, nothing else"""


async def get_recipe_suggestions(
    ingredients: list[str],
    cuisine_preference: str,
    max_prep_time: int | None,
    dish_name: str | None = None,
    dietary_restrictions: list[str] | None = None,
) -> dict:
    """Request recipe suggestions from the Groq LLM and return parsed results.

    Sends the user's ingredients and preferences to Groq, parses the response
    with parse_llm_response, and retries once with a repair prompt if the
    initial response cannot be parsed. Raises an HTTP 503 if both attempts fail.

    The groq package is imported lazily here so the module can be loaded in
    environments where groq is not installed (e.g. tests that mock this function).

    Args:
        ingredients: Ingredients the user currently has at home.
        cuisine_preference: Cuisine style to prioritise in suggestions.
        max_prep_time: Optional upper bound on prep time in minutes.
        dish_name: Optional dish name to anchor suggestions to a specific dish.
        dietary_restrictions: Optional restriction keys to inject as LLM constraints.

    Returns:
        A validated dict containing a 'recipes' list as returned by the LLM.

    Raises:
        HTTPException: 503 if both the initial call and the retry fail to
                       produce parseable JSON.
    """
    from groq import AsyncGroq  # lazy import — not needed until this function is called

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    prompt = build_prompt(ingredients, cuisine_preference, max_prep_time, dish_name, dietary_restrictions)

    raw = await _call_groq(client, prompt)

    try:
        return parse_llm_response(raw)
    except LLMParseError:
        raw_retry = await _call_groq(client, _build_fix_prompt(raw))
        try:
            return parse_llm_response(raw_retry)
        except LLMParseError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"LLM returned unparseable JSON after retry: {exc}",
            ) from exc


async def _call_groq(client, prompt: str) -> str:
    """Send a single user message to the Groq chat completions API.

    Args:
        client: An authenticated AsyncGroq client instance.
        prompt: The fully formatted user message to send.

    Returns:
        The raw text content of the model's reply.
    """
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2048,
    )
    return response.choices[0].message.content


def _build_fix_prompt(bad_response: str) -> str:
    """Build a repair prompt that asks the LLM to correct its malformed output.

    Args:
        bad_response: The raw string the LLM returned that failed JSON parsing.

    Returns:
        A prompt instructing the LLM to return only valid JSON.
    """
    return f"""Your previous response could not be parsed as valid JSON. Here is what you returned:

{bad_response}

Fix it and return ONLY valid JSON matching this exact structure, with no explanation, no markdown, and no backticks:
{{
  "recipes": [
    {{
      "name": "Recipe Name",
      "description": "One sentence description",
      "used_ingredients": ["ingredient1"],
      "missing_ingredients": ["ingredient2"],
      "match_percentage": 85,
      "prep_time_minutes": 20,
      "instructions": ["Step 1", "Step 2"],
      "difficulty": "easy"
    }}
  ]
}}"""
