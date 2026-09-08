"""
ai/tests/test_decision.py

Unit tests for ai/decision.py
"""

import pytest
from ai.decision import (
    should_trigger,
    get_risk_level,
    HIGH_NEGATIVE_THRESHOLD,
    MEDIUM_NEGATIVE_THRESHOLD,
    MEDIUM_EXPOSURE_THRESHOLD,
    LOW_NEGATIVE_THRESHOLD,
    LOW_TIME_THRESHOLD,
    RISK_WARNING_MIN,
    RISK_INTERVENTION_MIN,
)


class TestHighNegativeScore:
    def test_high_negative_score_triggers(self):
        result = should_trigger(
            negative_score=HIGH_NEGATIVE_THRESHOLD + 0.05,
            exposure_count=1,
            time_spent_minutes=1.0,
        )
        assert result is True

    def test_high_negative_score_gives_intervention_risk(self):
        risk = get_risk_level(
            negative_score=HIGH_NEGATIVE_THRESHOLD + 0.05,
            exposure_count=1,
            time_spent_minutes=1.0,
        )
        assert risk == "INTERVENTION"


class TestRepeatedExposure:
    def test_medium_negative_with_high_exposure_triggers(self):
        result = should_trigger(
            negative_score=MEDIUM_NEGATIVE_THRESHOLD,
            exposure_count=MEDIUM_EXPOSURE_THRESHOLD,
            time_spent_minutes=1.0,
        )
        assert result is True

    def test_medium_negative_with_low_exposure_does_not_trigger(self):
        result = should_trigger(
            negative_score=MEDIUM_NEGATIVE_THRESHOLD,
            exposure_count=MEDIUM_EXPOSURE_THRESHOLD - 1,
            time_spent_minutes=1.0,
        )
        assert result is False


class TestLongSession:
    def test_low_negative_with_long_session_triggers(self):
        result = should_trigger(
            negative_score=LOW_NEGATIVE_THRESHOLD,
            exposure_count=1,
            time_spent_minutes=LOW_TIME_THRESHOLD,
        )
        assert result is True

    def test_low_negative_with_short_session_does_not_trigger(self):
        result = should_trigger(
            negative_score=LOW_NEGATIVE_THRESHOLD,
            exposure_count=1,
            time_spent_minutes=LOW_TIME_THRESHOLD - 1,
        )
        assert result is False


class TestNormalCase:
    def test_normal_low_everything_does_not_trigger(self):
        result = should_trigger(
            negative_score=0.10,
            exposure_count=0,
            time_spent_minutes=2.0,
        )
        assert result is False

    def test_normal_case_gives_normal_risk(self):
        risk = get_risk_level(
            negative_score=0.10,
            exposure_count=0,
            time_spent_minutes=2.0,
        )
        assert risk == "NORMAL"


class TestBoundaryValues:
    def test_negative_score_exactly_at_high_threshold_triggers(self):
        # >= comparison means exact threshold should trigger
        result = should_trigger(
            negative_score=HIGH_NEGATIVE_THRESHOLD,
            exposure_count=1,
            time_spent_minutes=1.0,
        )
        assert result is True

    def test_negative_score_just_below_high_threshold_alone_does_not_trigger(self):
        result = should_trigger(
            negative_score=HIGH_NEGATIVE_THRESHOLD - 0.01,
            exposure_count=1,
            time_spent_minutes=1.0,
        )
        assert result is False

    def test_risk_level_exactly_at_warning_min(self):
        risk = get_risk_level(
            negative_score=RISK_WARNING_MIN,
            exposure_count=0,
            time_spent_minutes=0,
        )
        assert risk == "WARNING"

    def test_risk_level_exactly_at_intervention_min(self):
        risk = get_risk_level(
            negative_score=RISK_INTERVENTION_MIN,
            exposure_count=0,
            time_spent_minutes=0,
        )
        assert risk == "INTERVENTION"

    def test_negative_score_zero_boundary(self):
        result = should_trigger(
            negative_score=0.0,
            exposure_count=0,
            time_spent_minutes=0.0,
        )
        assert result is False

    def test_negative_score_one_boundary(self):
        result = should_trigger(
            negative_score=1.0,
            exposure_count=0,
            time_spent_minutes=0.0,
        )
        assert result is True

    def test_invalid_negative_score_raises(self):
        with pytest.raises(ValueError):
            should_trigger(negative_score=1.5, exposure_count=1, time_spent_minutes=1.0)

    def test_negative_exposure_count_raises(self):
        with pytest.raises(ValueError):
            should_trigger(negative_score=0.1, exposure_count=-1, time_spent_minutes=1.0)