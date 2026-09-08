import sys
import uuid
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


# =========================================================
# PROJECT PATH
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# =========================================================
# IMPORT SERENITY INTEGRATION
# =========================================================

from integration.llm.intervention import generate_intervention
from integration.tts.elevenlabs import generate_audio


# =========================================================
# AUDIO DIRECTORY
# =========================================================

AUDIO_DIR = Path(__file__).resolve().parent / "audio"

AUDIO_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Serenity API",
    description="Backend for the Serenity digital wellbeing system",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8501",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# SERVE GENERATED AUDIO
# =========================================================

app.mount(
    "/audio",
    StaticFiles(directory=str(AUDIO_DIR)),
    name="audio"
)


# =========================================================
# CONSTANTS
# =========================================================

SUPPORTED_LANGUAGES = [
    "english",
    "hindi",
    "hinglish",
    "tamil",
    "punjabi",
    "marathi"
]


NEGATIVE_SCORE_THRESHOLD = 0.70

MIN_TIME_SECONDS = 30


# =========================================================
# DATA MODELS
# =========================================================

class PageData(BaseModel):

    url: str

    title: str

    text: str

    time_spent_seconds: int = Field(
        ge=0
    )


class EmotionData(BaseModel):

    dominant_emotion: str

    negative_score: float = Field(
        ge=0.0,
        le=1.0
    )

    content_type: str = "unknown"

    content_text: str = ""


class InterventionRequest(BaseModel):

    page: PageData

    emotion: EmotionData

    language: Literal[
        "english",
        "hindi",
        "hinglish",
        "tamil",
        "punjabi",
        "marathi"
    ]


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "status": "Serenity API is running",
        "service": "Serenity Scroll",
        "supported_languages": SUPPORTED_LANGUAGES
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================================================
# EXISTING PAGE DATA ENDPOINT
# =========================================================

@app.post("/page-data")
def receive_page_data(
    data: PageData
):

    print("\n==============================")
    print("SERENITY RECEIVED PAGE DATA")
    print("==============================")

    print("URL:")
    print(data.url)

    print("\nTITLE:")
    print(data.title)

    print(
        "\nTIME SPENT:",
        data.time_spent_seconds,
        "seconds"
    )

    print("\nTEXT:")
    print(data.text[:500])

    print("==============================\n")


    return {

        "success": True,

        "message":
            "Page data received successfully",

        "url":
            data.url,

        "title":
            data.title,

        "time_spent_seconds":
            data.time_spent_seconds
    }


# =========================================================
# MAIN INTERVENTION PIPELINE
# =========================================================

@app.post("/intervention")
def create_intervention(
    data: InterventionRequest
):

    print("\n================================")
    print("SERENITY INTERVENTION PIPELINE")
    print("================================")


    # -----------------------------------------------------
    # PRINT INPUT
    # -----------------------------------------------------

    print(
        "Language:",
        data.language
    )

    print(
        "Emotion:",
        data.emotion.dominant_emotion
    )

    print(
        "Negative score:",
        data.emotion.negative_score
    )

    print(
        "Time spent:",
        data.page.time_spent_seconds
    )


    # -----------------------------------------------------
    # DECISION ENGINE
    # -----------------------------------------------------

    trigger = (

        data.emotion.negative_score
        >= NEGATIVE_SCORE_THRESHOLD

        and

        data.page.time_spent_seconds
        >= MIN_TIME_SECONDS
    )


    print(
        "Trigger:",
        trigger
    )


    # -----------------------------------------------------
    # NO INTERVENTION
    # -----------------------------------------------------

    if not trigger:

        print(
            "No intervention required."
        )

        print(
            "================================\n"
        )

        return {

            "success": True,

            "trigger": False,

            "message":
                "No intervention required.",

            "emotion":
                data.emotion.dominant_emotion,

            "negative_score":
                data.emotion.negative_score
        }


    # -----------------------------------------------------
    # PREPARE EMOTION DATA FOR GEMINI
    # -----------------------------------------------------

    emotion_data = {

        "dominant_emotion":
            data.emotion.dominant_emotion,

        "negative_score":
            data.emotion.negative_score,

        "content_type":
            data.emotion.content_type,

        "content_text":
            data.emotion.content_text
            or data.page.text[:5000]
    }


    # -----------------------------------------------------
    # GEMINI
    # -----------------------------------------------------

    print("\nSTEP 1: GEMINI")

    try:

        intervention = generate_intervention(

            emotion_data,

            language=data.language
        )

    except Exception as e:

        print(
            "Gemini error:",
            str(e)
        )

        raise HTTPException(

            status_code=500,

            detail={
                "stage": "gemini",
                "error": str(e)
            }
        )


    print(
        "Gemini intervention generated."
    )


    # -----------------------------------------------------
    # COMBINE MESSAGE FOR TTS
    # -----------------------------------------------------

    audio_text = (

        f"{intervention['message']} "

        f"{intervention['activity']}"
    )


    # -----------------------------------------------------
    # UNIQUE AUDIO FILE
    # -----------------------------------------------------

    audio_filename = (

        f"serenity_"
        f"{data.language}_"
        f"{uuid.uuid4().hex}.mp3"
    )


    audio_path = (
        AUDIO_DIR /
        audio_filename
    )


    # -----------------------------------------------------
    # ELEVENLABS
    # -----------------------------------------------------

    print("\nSTEP 2: ELEVENLABS")

    try:

        generate_audio(

            text=audio_text,

            language=data.language,

            output_file=str(audio_path)
        )

    except Exception as e:

        print(
            "ElevenLabs error:",
            str(e)
        )

        raise HTTPException(

            status_code=500,

            detail={
                "stage": "elevenlabs",
                "error": str(e)
            }
        )


    print(
        "Audio generated."
    )


    # -----------------------------------------------------
    # AUDIO URL
    # -----------------------------------------------------

    audio_url = (

        f"http://localhost:8000"
        f"/audio/{audio_filename}"
    )


    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    response = {

        "success": True,

        "trigger": True,

        "title":
            intervention["title"],

        "message":
            intervention["message"],

        "activity":
            intervention["activity"],

        "duration_seconds":
            intervention["duration_seconds"],

        "audio_url":
            audio_url,

        "language":
            data.language,

        "emotion":
            data.emotion.dominant_emotion,

        "negative_score":
            data.emotion.negative_score
    }


    print("\n================================")
    print("SERENITY PIPELINE COMPLETE")
    print("================================")

    print(
        "Audio:",
        audio_url
    )

    print("================================\n")


    return response