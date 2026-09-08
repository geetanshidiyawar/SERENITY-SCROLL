"""
ai/emotion.py

Emotion classification module for MindBreak.

Uses a pretrained Hugging Face Transformer model via the `transformers`
pipeline API to classify text into emotion categories with probability
scores. No training or fine-tuning is performed — this is inference only.
"""

from typing import Dict
from transformers import pipeline

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
# Pretrained multi-class emotion classification model (6 base emotions +
# neutral). Swap this constant to try other emotion models without touching
# any other code.
MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"

# The standardized keys the rest of the app expects back. Any label the
# model returns that is NOT in this set is preserved under its original
# name rather than being dropped.
_BASE_EMOTIONS = ["sadness", "fear", "anger", "joy"]

# ---------------------------------------------------------------------------
# Pipeline initialization (loaded once, reused across calls)
# ---------------------------------------------------------------------------
# top_k=None tells the pipeline to return scores for ALL labels instead of
# just the top prediction (this replaced the deprecated `return_all_scores=True`).
_emotion_pipeline = pipeline(
    task="text-classification",
    model=MODEL_NAME,
    top_k=None,
)


def _empty_result() -> Dict[str, float]:
    """Standardized zeroed-out result for empty/invalid input."""
    return {emotion: 0.0 for emotion in _BASE_EMOTIONS}


def analyze_emotion(text: str) -> Dict[str, float]:
    """
    Analyze the emotional content of a piece of text.

    Args:
        text: Input string to classify.

    Returns:
        A dictionary containing at least the base emotions:
            {"sadness": float, "fear": float, "anger": float, "joy": float}
        If the underlying model produces additional labels (e.g. "surprise",
        "disgust", "neutral"), those are included as extra keys rather than
        being discarded.

        All values are floats in [0.0, 1.0].
    """
    # --- Safe handling of empty / invalid input -----------------------------
    if text is None or not isinstance(text, str) or text.strip() == "":
        return _empty_result()

    # --- Run inference -------------------------------------------------------
    # With top_k=None, output shape is: [[{"label": ..., "score": ...}, ...]]
    raw_output = _emotion_pipeline(text)

    # Normalize output shape (some versions return a flat list for single input)
    scores = raw_output[0] if isinstance(raw_output[0], list) else raw_output

    # --- Build result dict ----------------------------------------------------
    result = _empty_result()  # ensures base emotions always exist, default 0.0

    for entry in scores:
        label = entry["label"].lower()
        score = float(entry["score"])
        result[label] = score  # overwrites base emotion or adds new label

    return result


# ---------------------------------------------------------------------------
# Quick manual test (run: python ai/emotion.py)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    test_inputs = [
        "I can't believe I lost my job, I feel so hopeless.",
        "You scared the hell out of me, don't ever do that again!",
        "",
    ]

    for t in test_inputs:
        print(f"Input: {t!r}")
        print("Output:", analyze_emotion(t))
        print("-" * 60)