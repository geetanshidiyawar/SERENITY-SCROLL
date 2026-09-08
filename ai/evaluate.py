# ai/evaluate.py

"""
MindBreak - AIML Evaluation Script

Run from the project root:

    python -m ai.evaluate

This script:
1. Loads test_data.csv from the project root
2. Cleans the input text
3. Runs the Hugging Face emotion model
4. Calculates the dominant emotion
5. Calculates the negative-emotion score
6. Applies the trigger decision
7. Prints the evaluation results
"""

import os
import pandas as pd

from ai.preprocessing import clean_text
from ai.emotion import analyze_emotion
from ai.scoring import (
    calculate_negative_score,
    get_dominant_emotion,
)


# =========================================================
# PATHS
# =========================================================

# Project root = SERENITY-SCROLL
PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_FILE = os.path.join(
    PROJECT_ROOT,
    "test_data.csv"
)


# =========================================================
# DECISION LOGIC
# =========================================================

def calculate_trigger(
    negative_score,
    exposure_count,
    time_spent_minutes
):
    """
    Decide whether a possible negative-content spiral
    should trigger an intervention.

    Rules:

    1. Negative score >= 0.75
       -> trigger

    2. Negative score >= 0.60 AND
       exposure count >= 3
       -> trigger

    3. Negative score >= 0.55 AND
       time spent >= 15 minutes
       -> trigger

    Otherwise:
       -> no trigger
    """

    negative_score = float(negative_score)
    exposure_count = int(exposure_count)
    time_spent_minutes = float(time_spent_minutes)

    if negative_score >= 0.75:
        return True

    if (
        negative_score >= 0.60
        and exposure_count >= 3
    ):
        return True

    if (
        negative_score >= 0.55
        and time_spent_minutes >= 15
    ):
        return True

    return False


# =========================================================
# LOAD TEST DATA
# =========================================================

def load_test_data():
    """
    Load test_data.csv from the project root.
    """

    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(
            "\nCould not find test_data.csv.\n"
            f"Expected location:\n{DATA_FILE}\n\n"
            "Make sure test_data.csv is in the "
            "SERENITY-SCROLL root folder."
        )

    df = pd.read_csv(DATA_FILE)

    if df.empty:
        raise ValueError(
            "test_data.csv is empty."
        )

    return df


# =========================================================
# NORMALIZE EMOTION OUTPUT
# =========================================================

def normalize_emotion_scores(result):
    """
    Convert different possible Hugging Face outputs
    into a simple dictionary:

        {
            "sadness": 0.80,
            "fear": 0.10,
            "joy": 0.10
        }

    Supports common formats returned by transformers.
    """

    if result is None:
        return {}

    # -----------------------------------------------------
    # Case 1:
    #
    # [
    #   {"label": "sadness", "score": 0.8},
    #   {"label": "joy", "score": 0.2}
    # ]
    # -----------------------------------------------------

    if isinstance(result, list):

        # Sometimes pipeline returns:
        #
        # [
        #   [
        #       {"label": "...", "score": ...}
        #   ]
        # ]
        if (
            len(result) == 1
            and isinstance(result[0], list)
        ):
            result = result[0]

        scores = {}

        for item in result:

            if not isinstance(item, dict):
                continue

            label = item.get("label")
            score = item.get("score")

            if label is None or score is None:
                continue

            try:
                scores[str(label).lower()] = float(score)
            except (TypeError, ValueError):
                continue

        return scores

    # -----------------------------------------------------
    # Case 2:
    #
    # {
    #     "sadness": 0.8,
    #     "joy": 0.2
    # }
    # -----------------------------------------------------

    if isinstance(result, dict):

        scores = {}

        for label, score in result.items():

            try:
                scores[str(label).lower()] = float(score)
            except (TypeError, ValueError):
                continue

        return scores

    return {}


# =========================================================
# EVALUATE ONE ROW
# =========================================================

def evaluate_sample(row):
    """
    Evaluate one row from test_data.csv.
    """

    # -----------------------------------------------------
    # Text
    # -----------------------------------------------------

    text = str(
        row.get("text", "")
    ).strip()

    if not text:
        raise ValueError(
            "Text is empty."
        )

    # -----------------------------------------------------
    # Clean text
    # -----------------------------------------------------

    text = clean_text(text)

    # -----------------------------------------------------
    # Content type
    # -----------------------------------------------------

    content_type = str(
        row.get(
            "content_type",
            "news"
        )
    )

    # -----------------------------------------------------
    # Exposure count
    # -----------------------------------------------------

    try:
        exposure_count = int(
            row.get(
                "exposure_count",
                1
            )
        )
    except (TypeError, ValueError):
        exposure_count = 1

    # -----------------------------------------------------
    # Time spent
    # -----------------------------------------------------

    try:
        time_spent_minutes = float(
            row.get(
                "time_spent_minutes",
                0
            )
        )
    except (TypeError, ValueError):
        time_spent_minutes = 0.0

    # -----------------------------------------------------
    # Emotion model
    # -----------------------------------------------------

    raw_result = analyze_emotion(text)

    scores = normalize_emotion_scores(
        raw_result
    )

    # -----------------------------------------------------
    # Dominant emotion
    # -----------------------------------------------------

    dominant_emotion = get_dominant_emotion(
        scores
    )

    # -----------------------------------------------------
    # Negative score
    # -----------------------------------------------------

    negative_score = calculate_negative_score(
        scores
    )

    # -----------------------------------------------------
    # Trigger
    # -----------------------------------------------------

    trigger = calculate_trigger(
        negative_score=negative_score,
        exposure_count=exposure_count,
        time_spent_minutes=time_spent_minutes
    )

    # -----------------------------------------------------
    # Expected trigger
    #
    # If test_data.csv contains an "expected_trigger"
    # column, use it for comparison.
    # -----------------------------------------------------

    expected_trigger = None

    if "expected_trigger" in row.index:

        value = row.get(
            "expected_trigger"
        )

        if pd.notna(value):

            if isinstance(value, bool):
                expected_trigger = value

            else:
                value = str(
                    value
                ).strip().lower()

                if value in {
                    "true",
                    "1",
                    "yes"
                }:
                    expected_trigger = True

                elif value in {
                    "false",
                    "0",
                    "no"
                }:
                    expected_trigger = False

    return {
        "text": text,
        "content_type": content_type,
        "dominant_emotion": dominant_emotion,
        "negative_score": negative_score,
        "exposure_count": exposure_count,
        "time_spent_minutes": time_spent_minutes,
        "trigger": trigger,
        "expected_trigger": expected_trigger,
    }


# =========================================================
# PRINT ONE RESULT
# =========================================================

def print_result(number, result):
    """
    Print a clean result for one sample.
    """

    print(
        f"\nSample {number}"
    )

    print(
        f"Emotion        : "
        f"{result['dominant_emotion']}"
    )

    print(
        f"Negative score : "
        f"{result['negative_score']:.3f}"
    )

    print(
        f"Content type   : "
        f"{result['content_type']}"
    )

    print(
        f"Exposure count : "
        f"{result['exposure_count']}"
    )

    print(
        f"Time spent     : "
        f"{result['time_spent_minutes']:.1f} min"
    )

    print(
        f"Trigger        : "
        f"{result['trigger']}"
    )

    if result["expected_trigger"] is not None:

        print(
            f"Expected       : "
            f"{result['expected_trigger']}"
        )

        print(
            f"Match          : "
            f"{result['trigger'] == result['expected_trigger']}"
        )


# =========================================================
# MAIN EVALUATION
# =========================================================

def evaluate():

    print(
        "\n========================================"
    )

    print(
        "        MINDBREAK AIML EVALUATION"
    )

    print(
        "========================================"
    )

    # -----------------------------------------------------
    # Load data
    # -----------------------------------------------------

    df = load_test_data()

    print(
        f"\nTest samples: {len(df)}"
    )

    print(
        f"Data file: {DATA_FILE}"
    )

    # -----------------------------------------------------
    # Evaluate samples
    # -----------------------------------------------------

    results = []

    successful = 0
    failed = 0

    for index, row in df.iterrows():

        try:

            result = evaluate_sample(
                row
            )

            results.append(result)

            successful += 1

            print_result(
                index + 1,
                result
            )

        except Exception as error:

            failed += 1

            print(
                f"\nSample {index + 1} FAILED"
            )

            print(
                f"Error: {error}"
            )

    # -----------------------------------------------------
    # No successful results
    # -----------------------------------------------------

    if not results:

        print(
            "\nNo samples were successfully evaluated."
        )

        return

    # -----------------------------------------------------
    # Results DataFrame
    # -----------------------------------------------------

    results_df = pd.DataFrame(
        results
    )

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    print(
        "\n========================================"
    )

    print(
        "              SUMMARY"
    )

    print(
        "========================================"
    )

    print(
        f"Total samples : {len(df)}"
    )

    print(
        f"Successful    : {successful}"
    )

    print(
        f"Failed        : {failed}"
    )

    # -----------------------------------------------------
    # Trigger statistics
    # -----------------------------------------------------

    triggered = int(
        results_df["trigger"].sum()
    )

    not_triggered = (
        len(results_df)
        - triggered
    )

    print(
        f"\nTriggered     : {triggered}"
    )

    print(
        f"Not triggered: {not_triggered}"
    )

    if len(results_df) > 0:

        trigger_rate = (
            triggered
            / len(results_df)
        ) * 100

        print(
            f"Trigger rate  : "
            f"{trigger_rate:.2f}%"
        )

    # -----------------------------------------------------
    # Expected trigger accuracy
    # -----------------------------------------------------

    if (
        "expected_trigger"
        in results_df.columns
    ):

        comparison_df = results_df[
            results_df[
                "expected_trigger"
            ].notna()
        ]

        if not comparison_df.empty:

            correct = (
                comparison_df["trigger"]
                ==
                comparison_df[
                    "expected_trigger"
                ]
            ).sum()

            total_expected = len(
                comparison_df
            )

            accuracy = (
                correct
                / total_expected
            ) * 100

            print(
                "\nExpected-trigger accuracy:"
            )

            print(
                f"{accuracy:.2f}% "
                f"({correct}/{total_expected})"
            )

    # -----------------------------------------------------
    # Emotion distribution
    # -----------------------------------------------------

    print(
        "\n========================================"
    )

    print(
        "        EMOTION DISTRIBUTION"
    )

    print(
        "========================================"
    )

    emotion_counts = (
        results_df[
            "dominant_emotion"
        ]
        .value_counts()
    )

    for emotion, count in (
        emotion_counts.items()
    ):

        print(
            f"{emotion:15} : {count}"
        )

    # -----------------------------------------------------
    # Final table
    # -----------------------------------------------------

    print(
        "\n========================================"
    )

    print(
        "        EVALUATION TABLE"
    )

    print(
        "========================================"
    )

    display_columns = [
        "dominant_emotion",
        "negative_score",
        "exposure_count",
        "time_spent_minutes",
        "trigger"
    ]

    print(
        results_df[
            display_columns
        ].to_string(index=False)
    )

    print(
        "\n========================================"
    )

    print(
        "           EVALUATION DONE"
    )

    print(
        "========================================\n"
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    evaluate()