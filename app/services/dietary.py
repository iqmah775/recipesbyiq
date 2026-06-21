DIETARY_RULES = {
    "diabetic": {
        "label": "Diabetic",
        "warning": "High glycemic ingredients — consume in moderation",
        "flagged_ingredients": ["white rice", "rice", "sugar", "honey", "sweet corn", "corn", "ripe plantain", "plantain", "flour", "white flour", "semolina", "bread", "yam", "potato", "garri", "eba", "fufu", "amala", "tuwo"],
        "severity": "warning"
    },
    "lactose_intolerant": {
        "label": "Lactose Intolerant",
        "warning": "Contains dairy ingredients",
        "flagged_ingredients": ["milk", "butter", "cheese", "cream", "yogurt", "ice cream", "condensed milk", "evaporated milk"],
        "severity": "warning"
    },
    "hypertension": {
        "label": "Hypertension",
        "warning": "High sodium ingredients — use sparingly",
        "flagged_ingredients": ["stockfish", "seasoning cubes", "maggi", "knorr", "salt", "dried fish", "smoked fish", "soy sauce", "crayfish"],
        "severity": "caution"
    },
    "pescatarian": {
        "label": "Pescatarian",
        "warning": "Contains meat",
        "flagged_ingredients": ["beef", "chicken", "goat", "goat meat", "pork", "lamb", "turkey", "liver", "tripe", "shaki", "pomo", "cow foot", "assorted meat"],
        "severity": "exclude"
    },
    "vegan": {
        "label": "Vegan",
        "warning": "Contains animal products",
        "flagged_ingredients": ["beef", "chicken", "goat", "pork", "lamb", "turkey", "liver", "fish", "dried fish", "smoked fish", "crayfish", "eggs", "milk", "butter", "cheese", "cream", "stockfish", "shrimp", "prawns", "periwinkle"],
        "severity": "exclude"
    },
    "vegetarian": {
        "label": "Vegetarian",
        "warning": "Contains meat or fish",
        "flagged_ingredients": ["beef", "chicken", "goat", "pork", "lamb", "turkey", "liver", "fish", "dried fish", "smoked fish", "stockfish", "shrimp", "prawns", "periwinkle", "tripe", "shaki"],
        "severity": "exclude"
    },
    "gluten_free": {
        "label": "Gluten Free",
        "warning": "Contains gluten",
        "flagged_ingredients": ["flour", "plain flour", "semolina", "bread", "pasta", "wheat", "barley", "oats", "chin chin", "meat pie"],
        "severity": "exclude"
    },
    "nut_allergy": {
        "label": "Nut Allergy",
        "warning": "Contains nuts",
        "flagged_ingredients": ["groundnuts", "peanuts", "groundnut oil", "kuli kuli", "groundnut cake", "cashew", "almond", "walnut"],
        "severity": "warning"
    }
}


def check_dietary_restrictions(recipe_ingredients: list, restrictions: list[str]) -> dict:
    """Check a recipe's ingredients against dietary restrictions.

    Args:
        recipe_ingredients: Raw ingredient strings from the recipe.
        restrictions: List of restriction keys to check against.

    Returns:
        Dict with is_safe, warnings, flagged, and restriction_labels.
        is_safe is False only when an exclude-severity restriction is triggered.
    """
    if not restrictions:
        return {"is_safe": True, "warnings": [], "flagged": [], "restriction_labels": []}

    warnings = []
    flagged_found = []
    restriction_labels = []
    has_exclusion = False

    recipe_ingredients_lower = [ing.lower() for ing in recipe_ingredients]

    for restriction in restrictions:
        if restriction not in DIETARY_RULES:
            continue

        rule = DIETARY_RULES[restriction]
        matched = []

        for flagged_ing in rule["flagged_ingredients"]:
            for recipe_ing in recipe_ingredients_lower:
                if flagged_ing.lower() in recipe_ing:
                    matched.append(flagged_ing)
                    break

        if matched:
            warnings.append(rule["warning"])
            flagged_found.extend(matched)
            restriction_labels.append(rule["label"])
            if rule["severity"] == "exclude":
                has_exclusion = True

    return {
        "is_safe": not has_exclusion,
        "warnings": list(set(warnings)),
        "flagged": list(set(flagged_found)),
        "restriction_labels": list(set(restriction_labels))
    }


def build_dietary_prompt_addition(restrictions: list[str]) -> str:
    """Build additional prompt text instructing the LLM to respect dietary restrictions.

    Args:
        restrictions: List of restriction keys from DIETARY_RULES.

    Returns:
        A formatted string to inject into the LLM prompt, or empty string if none.
    """
    if not restrictions:
        return ""

    rules = [DIETARY_RULES[r] for r in restrictions if r in DIETARY_RULES]
    labels = [r["label"] for r in rules]
    all_flagged = []
    for r in rules:
        all_flagged.extend(r["flagged_ingredients"])

    return f"""
DIETARY RESTRICTIONS: The user has the following dietary restrictions: {', '.join(labels)}.
CRITICAL: Do NOT suggest recipes that contain these ingredients: {', '.join(set(all_flagged))}.
All 5 suggested recipes must be completely safe for someone with these restrictions.
"""
