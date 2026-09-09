"""
ai/decision.py

Decision logic for Serenity Scroll.

The module converts the AIML emotion score, exposure count,
and session duration into:

    1. Whether Serenity should trigger an intervention.
    2. A human-readable risk level.

No medical diagnosis is made here.
"""


# ============================================================
# THRESHOLDS
# ============================================================

# Strong negative content should immediately trigger Serenity.
HIGH_NEGATIVE_THRESHOLD = 0.75

# Moderate-to-high negative content can trigger when exposure
# happens repeatedly.
MEDIUM_NEGATIVE_THRESHOLD = 0.60
MEDIUM_EXPOSURE_THRESHOLD = 3

# Lower negative content can trigger after a long session.
LOW_NEGATIVE_THRESHOLD = 0.55
LOW_TIME_THRESHOLD = 15.0


# ============================================================
# RISK LEVEL THRESHOLDS
# ============================================================

RISK_NORMAL_MAX = 0.49

RISK_WARNING_MIN = 0.50
RISK_WARNING_MAX = 0.69

# IMPORTANT:
# This now matches the trigger system.
#
# If negative_score >= 0.70, the content is considered
# intervention-level.
RISK_INTERVENTION_MIN = 0.70


# ============================================================
# VALIDATION
# ============================================================

def _validate_inputs(
    negative_score: float,
    exposure_count: int,
    time_spent_minutes: float,
) -> None:
    """
    Validate decision-engine inputs.
    """

    if not isinstance(
        negative_score,
        (int, float)
    ):
        raise TypeError(
            "negative_score must be a number"
        )


    if not isinstance(
        exposure_count,
        int
    ):
        raise TypeError(
            "exposure_count must be an integer"
        )


    if not isinstance(
        time_spent_minutes,
        (int, float)
    ):
        raise TypeError(
            "time_spent_minutes must be a number"
        )


    if not 0.0 <= float(negative_score) <= 1.0:

        raise ValueError(
            "negative_score must be between 0 and 1"
        )


    if exposure_count < 0:

        raise ValueError(
            "exposure_count cannot be negative"
        )


    if float(time_spent_minutes) < 0:

        raise ValueError(
            "time_spent_minutes cannot be negative"
        )


# ============================================================
# TRIGGER DECISION
# ============================================================

def should_trigger(
    negative_score: float,
    exposure_count: int,
    time_spent_minutes: float,
) -> bool:
    """
    Decide whether Serenity should trigger an intervention.

    Trigger rules:

    1. High negative score:
       negative_score >= 0.70

    2. Moderate negative score with repeated exposure:
       negative_score >= 0.60
       AND
       exposure_count >= 3

    3. Lower negative score during a long session:
       negative_score >= 0.55
       AND
       time_spent_minutes >= 15

    Returns:
        True  -> Serenity intervention should trigger
        False -> No intervention required
    """

    _validate_inputs(
        negative_score,
        exposure_count,
        time_spent_minutes,
    )


    negative_score = float(
        negative_score
    )

    time_spent_minutes = float(
        time_spent_minutes
    )


    # --------------------------------------------------------
    # RULE 1: Intervention-level negative content
    # --------------------------------------------------------
    #
    # IMPORTANT:
    # This is intentionally 0.70 instead of 0.75 so that
    # should_trigger() agrees with get_risk_level().
    #

    if negative_score >= RISK_INTERVENTION_MIN:

        return True


    # --------------------------------------------------------
    # RULE 2: Repeated exposure
    # --------------------------------------------------------

    if (
        negative_score >= MEDIUM_NEGATIVE_THRESHOLD
        and
        exposure_count >= MEDIUM_EXPOSURE_THRESHOLD
    ):

        return True


    # --------------------------------------------------------
    # RULE 3: Long session + negative content
    # --------------------------------------------------------

    if (
        negative_score >= LOW_NEGATIVE_THRESHOLD
        and
        time_spent_minutes >= LOW_TIME_THRESHOLD
    ):

        return True


    # --------------------------------------------------------
    # Otherwise no intervention
    # --------------------------------------------------------

    return False


# ============================================================
# RISK LEVEL
# ============================================================

def get_risk_level(
    negative_score: float,
    exposure_count: int,
    time_spent_minutes: float,
) -> str:
    """
    Determine the current wellbeing risk level.

    Returns:

        NORMAL
        WARNING
        INTERVENTION

    The risk level describes the AIML signal only.
    It is not a medical diagnosis.
    """

    _validate_inputs(
        negative_score,
        exposure_count,
        time_spent_minutes,
    )


    negative_score = float(
        negative_score
    )


    # --------------------------------------------------------
    # INTERVENTION
    # --------------------------------------------------------

    if negative_score >= RISK_INTERVENTION_MIN:

        return "INTERVENTION"


    # --------------------------------------------------------
    # WARNING
    # --------------------------------------------------------

    if (
        negative_score >= RISK_WARNING_MIN
        and
        negative_score <= RISK_WARNING_MAX
    ):

        return "WARNING"


    # --------------------------------------------------------
    # NORMAL
    # --------------------------------------------------------

    return "NORMAL"
