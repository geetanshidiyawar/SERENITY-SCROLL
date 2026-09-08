"""
ai/tests/test_emotion.py

Unit tests for ai/emotion.py

Note: these tests do NOT assert exact floating-point scores from the
pretrained model (that output can shift slightly across model/library
versions). Instead they validate structure, types, and value ranges.
"""

import pytest
from ai.emotion import analyze_emotion, _BASE_EMOTIONS


class TestNonEmptyInput:
    def test_non_empty_text_returns_result(self):
        result = analyze_emotion("I am so happy today, everything feels great!")
        assert result is not None
        assert len(result) > 0

    def test_non_empty_text_contains_base_emotions(self):
        result = analyze_emotion("This is terrifying news.")
        for emotion in _BASE_EMOTIONS:
            assert emotion in result


class TestEmptyInputHandling:
    def test_empty_string_returns_zeroed_base_emotions(self):
        result = analyze_emotion("")
        assert result == {"sadness": 0.0, "fear": 0.0, "anger": 0.0, "joy": 0.0}

    def test_whitespace_only_string_handled_safely(self):
        result = analyze_emotion("   ")
        assert result == {"sadness": 0.0, "fear": 0.0, "anger": 0.0, "joy": 0.0}

    def test_none_input_handled_safely(self):
        result = analyze_emotion(None)
        assert result == {"sadness": 0.0, "fear": 0.0, "anger": 0.0, "joy": 0.0}

    def test_non_string_input_handled_safely(self):
        result = analyze_emotion(12345)
        assert result == {"sadness": 0.0, "fear": 0.0, "anger": 0.0, "joy": 0.0}


class TestOutputIsDictionary:
    def test_output_type_is_dict(self):
        result = analyze_emotion("I feel anxious about tomorrow.")
        assert isinstance(result, dict)

    def test_empty_input_output_type_is_dict(self):
        result = analyze_emotion("")
        assert isinstance(result, dict)


class TestScoresAreNumeric:
    def test_all_values_are_float_or_int(self):
        result = analyze_emotion("What a wonderful surprise this is!")
        for label, value in result.items():
            assert isinstance(value, (int, float)), f"{label} score is not numeric"

    def test_all_keys_are_strings(self):
        result = analyze_emotion("I'm furious about this decision.")
        for label in result.keys():
            assert isinstance(label, str)


class TestScoresWithinValidRange:
    def test_all_scores_between_zero_and_one(self):
        result = analyze_emotion("This makes me deeply sad and worried.")
        for label, value in result.items():
            assert 0.0 <= value <= 1.0, f"{label}={value} is out of range"

    def test_empty_input_scores_within_range(self):
        result = analyze_emotion("")
        for label, value in result.items():
            assert 0.0 <= value <= 1.0