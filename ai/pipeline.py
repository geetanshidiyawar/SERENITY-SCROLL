"""
ai/pipeline.py

Integration layer for MindBreak's AIML pipeline.

Flow:
    raw text
      -> clean_text()
      -> analyze_emotion()
      -> get_dominant_emotion()
      -> calculate_negative_score()
      -> should_trigger() / get_risk_level()
      -> standardized JSON-safe dict

This module makes no clinical diagnosis — it only produces a rule-based
wellbeing signal for the app to act on (e.g. show a gentle break prompt).
"""

from typing import Dict, Any

from ai.preprocessing import clean_text
from ai.emotion import analyze_emotion
from ai.scoring import calculate_negative_score, get_dominant_emotion
from ai.decision import should_trigger, get_risk_level


def analyze_content(
    text: str,
    content_type: str = "unknown",
    time_spent_minutes: float = 0,
    exposure_count: int = 1,
) -> Dict[str, Any]:
    """
    Run the full MindBreak AIML pipeline on a piece of text.
    """
    cleaned = clean_text(text)

    # Normalize numeric inputs up front so decision.py's strict
    # validation (int exposure_count, float time, 0-1 negative_score)
    # never blows up on loosely-typed input.
    exposure_count = int(exposure_count or 0)
    time_spent_minutes = float(time_spent_minutes or 0)

    if cleaned == "":
        return {
            "dominant_emotion": None,
            "dominant_score": 0.0,
            "scores": {},
            "negative_score": 0.0,
            "content_type": content_type,
            "exposure_count": exposure_count,
            "time_spent_minutes": time_spent_minutes,
            "trigger": False,
            "trigger_reason": "normal",
        }

    raw_scores = analyze_emotion(cleaned)

    dominant_emotion = get_dominant_emotion(raw_scores)
    dominant_score = raw_scores.get(dominant_emotion, 0.0) if dominant_emotion else 0.0

    negative_score = calculate_negative_score(raw_scores)
    # Clamp defensively so decision.py's [0.0, 1.0] validation never fails.
    negative_score = max(0.0, min(1.0, float(negative_score)))

    trigger = should_trigger(
        negative_score=negative_score,
        exposure_count=exposure_count,
        time_spent_minutes=time_spent_minutes,
    )
    risk_level = get_risk_level(
        negative_score=negative_score,
        exposure_count=exposure_count,
        time_spent_minutes=time_spent_minutes,
    )
    trigger_reason = risk_level.lower()  # "normal" / "warning" / "intervention"

    rounded_scores = {
        label: round(float(value), 4) for label, value in raw_scores.items()
    }

    result: Dict[str, Any] = {
        "dominant_emotion": dominant_emotion,
        "dominant_score": round(float(dominant_score), 4),
        "scores": rounded_scores,
        "negative_score": round(negative_score, 4),
        "content_type": content_type,
        "exposure_count": exposure_count,
        "time_spent_minutes": time_spent_minutes,
        "trigger": bool(trigger),
        "trigger_reason": trigger_reason,
    }

    return result


if __name__ == "__main__":
    import json

    print("Running MindBreak pipeline...", flush=True)

    result = analyze_content(
        text="Experts warn that the situation could become much worse.",
        content_type="news",
        time_spent_minutes=12,
        exposure_count=5,
    )

    print(json.dumps(result, indent=2))