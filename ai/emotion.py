"""
ai/emotion.py

Emotion analysis for Serenity Scroll.

Uses:
    j-hartmann/emotion-english-distilroberta-base

The model has a limited token context window, so long webpage text
is explicitly truncated before inference.
"""

from typing import Dict

from transformers import pipeline


MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"

# Keep this below the model's positional embedding limit.
# RoBERTa supports 514 positional embeddings, but using 512 tokens
# gives us a safe margin for special tokens.
MAX_TOKENS = 512


print("Loading Serenity emotion model...")

emotion_classifier = pipeline(
    "text-classification",
    model=MODEL_NAME,
    tokenizer=MODEL_NAME,
    top_k=None,
)

print("Serenity emotion model loaded successfully.")


def analyze_emotion(text: str) -> Dict[str, float]:
    """
    Analyze the emotional content of text.

    Returns:
        {
            "sadness": 0.82,
            "fear": 0.05,
            ...
        }
    """

    if not text or not text.strip():
        return {}


    # ------------------------------------------------------------
    # Clean input
    # ------------------------------------------------------------

    text = str(text).strip()


    # ------------------------------------------------------------
    # Hugging Face inference
    #
    # IMPORTANT:
    # truncation=True prevents long webpages from exceeding
    # the model's positional embedding limit.
    # ------------------------------------------------------------

    results = emotion_classifier(
        text,
        truncation=True,
        max_length=MAX_TOKENS,
    )


    # ------------------------------------------------------------
    # Convert Hugging Face output into:
    #
    # {
    #     "sadness": 0.82,
    #     "joy": 0.05,
    #     ...
    # }
    # ------------------------------------------------------------

    scores: Dict[str, float] = {}


    if not results:
        return scores


    # With top_k=None, the pipeline normally returns:
    #
    # [
    #     [
    #         {"label": "...", "score": ...},
    #         ...
    #     ]
    # ]
    #
    # Handle both nested and non-nested forms safely.

    if (
        isinstance(results, list)
        and len(results) > 0
        and isinstance(results[0], list)
    ):

        predictions = results[0]

    else:

        predictions = results


    for item in predictions:

        if not isinstance(item, dict):
            continue


        label = item.get("label")

        score = item.get("score")


        if label is None or score is None:
            continue


        scores[str(label)] = float(score)


    return scores
