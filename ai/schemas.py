"""
ai/schemas.py

Pydantic data schemas for MindBreak AI pipeline.
Validates inputs and formats data structure for emotion analysis results.
"""

from typing import Dict
from pydantic import BaseModel, Field, field_validator

VALID_RISK_LEVELS = {"NORMAL", "WARNING", "INTERVENTION"}


class EmotionAnalysisResult(BaseModel):
    dominant_emotion: str
    scores: Dict[str, float]
    negative_score: float
    content_type: str
    exposure_count: int
    time_spent_minutes: float
    trigger: bool
    risk_level: str

    @field_validator("negative_score")
    @classmethod
    def validate_negative_score(cls, value: float) -> float:
        if value < 0.0 or value > 1.0:
            raise ValueError("negative_score must be between 0 and 1")
        return value

    @field_validator("scores")
    @classmethod
    def validate_scores(cls, value: Dict[str, float]) -> Dict[str, float]:
        for emotion, score in value.items():
            if score < 0.0 or score > 1.0:
                raise ValueError(f"score for '{emotion}' must be between 0 and 1")
        return value

    @field_validator("exposure_count")
    @classmethod
    def validate_exposure_count(cls, value: int) -> int:
        if value < 0:
            raise ValueError("exposure_count cannot be negative")
        return value

    @field_validator("time_spent_minutes")
    @classmethod
    def validate_time_spent_minutes(cls, value: float) -> float:
        if value < 0:
            raise ValueError("time_spent_minutes cannot be negative")
        return value

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, value: str) -> str:
        if value not in VALID_RISK_LEVELS:
            raise ValueError(f"risk_level must be one of {VALID_RISK_LEVELS}")
        return value

    model_config = {
        "json_schema_extra": {
            "example": {
                "dominant_emotion": "anger",
                "scores": {
                    "sadness": 0.05,
                    "fear": 0.10,
                    "anger": 0.70,
                    "joy": 0.02,
                    "disgust": 0.08,
                    "surprise": 0.03,
                    "neutral": 0.02
                },
                "negative_score": 0.70,
                "content_type": "text",
                "exposure_count": 4,
                "time_spent_minutes": 18.5,
                "trigger": True,
                "risk_level": "INTERVENTION"
            }
        }
    }


if __name__ == "__main__":
    result = EmotionAnalysisResult(
        dominant_emotion="anger",
        scores={
            "sadness": 0.05,
            "fear": 0.10,
            "anger": 0.70,
            "joy": 0.02
        },
        negative_score=0.70,
        content_type="text",
        exposure_count=4,
        time_spent_minutes=18.5,
        trigger=True,
        risk_level="INTERVENTION"
    )

    print(result.model_dump_json(indent=2))