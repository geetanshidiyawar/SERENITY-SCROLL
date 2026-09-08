"""
ai/config.py

Centralized configuration for the MindBreak AIML module.
All tunable thresholds and constants live here so behavior can be
adjusted without touching the logic in other modules.
"""

# Maximum number of characters allowed in cleaned text before truncation.
# Prevents excessively long inputs from being passed to the emotion model.
MAX_TEXT_CHARS = 5000

# General negative score threshold used to flag content as concerning.
NEGATIVE_THRESHOLD = 0.70

# High negative score threshold. On its own (regardless of exposure count
# or time spent), a score at or above this level is severe enough to
# trigger an intervention immediately.
HIGH_NEGATIVE_THRESHOLD = 0.75

# Number of times a user must be repeatedly exposed to negative content
# before it contributes to triggering an intervention at the medium
# negative score threshold.
REPEATED_EXPOSURE_THRESHOLD = 3

# Negative score threshold used in combination with REPEATED_EXPOSURE_THRESHOLD.
# If negative_score >= this value AND exposure_count >= REPEATED_EXPOSURE_THRESHOLD,
# an intervention is triggered.
REPEATED_EXPOSURE_NEGATIVE_SCORE = 0.60

# Number of minutes of continuous session time considered a "long session".
LONG_SESSION_MINUTES = 15

# Negative score threshold used in combination with LONG_SESSION_MINUTES.
# If negative_score >= this value AND time_spent_minutes >= LONG_SESSION_MINUTES,
# an intervention is triggered.
LONG_SESSION_NEGATIVE_SCORE = 0.55

# The set of emotions considered "negative" for the purposes of calculating
# an overall negative_score. These are summed/aggregated from the emotion
# classifier's output to produce a single negative_score value.
NEGATIVE_EMOTIONS = {
    "sadness",
    "fear",
    "anger",
    "disgust",
}
