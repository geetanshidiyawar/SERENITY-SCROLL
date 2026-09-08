"""
ai/tests/test_scoring.py

Unit tests for ai/scoring.py
"""

import pytest
from ai.scoring import calculate_negative_score, get_dominant_emotion, NEGATIVE_EMOTIONS


class TestDominantEmotion:
    def test_dominant_emotion_basic(self):
        scores = {"sadness": 0.60, "fear": 0.20, "anger": 0.10, "joy": 0.10}
        assert get_dominant_emotion(scores) == "sadness"

    def test_dominant_emotion_joy_wins(self):
        scores = {"sadness": 0.05, "fear": 0.05, "anger": 0.05, "joy": 0.85}
        assert get_dominant_emotion(scores) == "joy"

    def test_dominant_emotion_empty_dict_returns_none(self):
        assert get_dominant_emotion({}) is None

    def test_dominant_emotion_none_input_returns_none(self):
        assert get_dominant_emotion(None) is None


class TestNegativeScore:
    def test_negative_score_basic_sum(self):
        scores = {"sadness": 0.60, "fear": 0.20, "anger": 0.10, "joy": 0.10}
        result = calculate_negative_score(scores)
        assert result == pytest.approx(0.90, abs=1e-6)

    def test_negative_score_only_counts_configured_negative_emotions(self):
        scores = {"joy": 0.90, "neutral": 0.10}
        result = calculate_negative_score(scores)
        assert result == pytest.approx(0.0, abs=1e-6)

    def test_negative_score_includes_disgust(self):
        assert "disgust" in NEGATIVE_EMOTIONS
        scores = {"disgust": 0.40, "joy": 0.60}
        result = calculate_negative_score(scores)
        assert result == pytest.approx(0.40, abs=1e-6)


class TestMissingEmotionLabels:
    def test_missing_labels_treated_as_zero(self):
        # sadness, fear, disgust are missing entirely
        scores = {"joy": 0.80, "anger": 0.20}
        result = calculate_negative_score(scores)
        assert result == pytest.approx(0.20, abs=1e-6)

    def test_empty_dict_returns_zero(self):
        assert calculate_negative_score({}) == 0.0

    def test_none_input_does_not_crash(self):
        assert calculate_negative_score(None) == 0.0


class TestScoreClamping:
    def test_negative_score_clamped_to_one(self):
        scores = {"sadness": 0.70, "fear": 0.50, "anger": 0.30, "disgust": 0.20}
        result = calculate_negative_score(scores)
        assert result == 1.0
        assert 0.0 <= result <= 1.0

    def test_negative_score_never_below_zero(self):
        scores = {"sadness": 0.30, "fear": 0.30, "anger": 0.30, "disgust": 0.10}
        result = calculate_negative_score(scores)
        assert 0.0 <= result <= 1.0