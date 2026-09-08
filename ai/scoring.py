# ai/scoring.py

from ai.config import NEGATIVE_EMOTIONS


def calculate_negative_score(scores):
    """
    Calculate the combined score of negative emotions.
    """

    if scores is None:
        return 0.0

    negative_score = 0.0

    for emotion in NEGATIVE_EMOTIONS:
        negative_score += float(scores.get(emotion, 0.0))

    return max(0.0, min(1.0, negative_score))


def get_dominant_emotion(scores):
    """
    Return the emotion with the highest probability.

    Returns None when input is empty or None.
    """

    if not scores:
        return None

    return max(scores, key=scores.get)


def calculate_scores(scores):
    """
    Calculate dominant emotion and negative score.
    """

    dominant_emotion = get_dominant_emotion(scores)
    negative_score = calculate_negative_score(scores)

    return {
        "dominant_emotion": dominant_emotion,
        "negative_score": negative_score,
    }
