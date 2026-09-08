"""
ai/decision.py

Decision engine for MindBreak.

Evaluates user state based on negative score, exposure count,
and time spent to decide whether an intervention should trigger
and to classify the overall risk level.
"""

# Configurable thresholds for trigger logic
HIGH_NEGATIVE_THRESHOLD = 0.75
MEDIUM_NEGATIVE_THRESHOLD = 0.60
MEDIUM_EXPOSURE_THRESHOLD = 3
LOW_NEGATIVE_THRESHOLD = 0.55
LOW_TIME_THRESHOLD = 15.0

# Configurable thresholds for risk level classification
RISK_NORMAL_MAX = 0.49
RISK_WARNING_MIN = 0.50
RISK_WARNING_MAX = 0.69
RISK_INTERVENTION_MIN = 0.70


def _validate_inputs(negative_score: float, exposure_count: int, time_spent_minutes: float) -> None:
    """Validates types and ranges for input parameters."""
    if not isinstance(negative_score, (int, float)):
        raise TypeError("negative_score must be a number")

    if negative_score < 0.0 or negative_score > 1.0:
        raise ValueError("negative_score must be between 0.0 and 1.0")

    if not isinstance(exposure_count, int):
        raise TypeError("exposure_count must be an integer")

    if exposure_count < 0:
        raise ValueError("exposure_count must not be negative")

    if not isinstance(time_spent_minutes, (int, float)):
        raise TypeError("time_spent_minutes must be a number")

    if time_spent_minutes < 0:
        raise ValueError("time_spent_minutes must not be negative")


def should_trigger(
    negative_score: float,
    exposure_count: int,
    time_spent_minutes: float
) -> bool:
    """
    Determines if an intervention should be triggered based on user state.
    """
    _validate_inputs(negative_score, exposure_count, time_spent_minutes)

    if negative_score >= HIGH_NEGATIVE_THRESHOLD:
        return True

    if negative_score >= MEDIUM_NEGATIVE_THRESHOLD and exposure_count >= MEDIUM_EXPOSURE_THRESHOLD:
        return True

    if negative_score >= LOW_NEGATIVE_THRESHOLD and time_spent_minutes >= LOW_TIME_THRESHOLD:
        return True

    return False


def get_risk_level(
    negative_score: float,
    exposure_count: int,
    time_spent_minutes: float
) -> str:
    """
    Determines the overall risk level category: NORMAL, WARNING, or INTERVENTION.
    """
    _validate_inputs(negative_score, exposure_count, time_spent_minutes)

    if negative_score >= RISK_INTERVENTION_MIN:
        return "INTERVENTION"

    if negative_score >= RISK_WARNING_MIN:
        return "WARNING"

    return "NORMAL"


if __name__ == "__main__":
    test_cases = [
        (0.80, 1, 5.0),
        (0.65, 3, 5.0),
        (0.60, 2, 5.0),
        (0.55, 1, 20.0),
        (0.55, 1, 10.0),
        (0.30, 0, 2.0),
    ]

    for negative_score, exposure_count, time_spent_minutes in test_cases:
        trigger = should_trigger(negative_score, exposure_count, time_spent_minutes)
        risk = get_risk_level(negative_score, exposure_count, time_spent_minutes)
        print(f"negative_score={negative_score}, exposure_count={exposure_count}, time_spent_minutes={time_spent_minutes}")
        print(f"  should_trigger -> {trigger}")
        print(f"  get_risk_level -> {risk}")
        print("-" * 60)