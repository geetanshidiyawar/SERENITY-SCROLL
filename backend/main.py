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

from ai.pipeline import analyze_content
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

# Kept for compatibility with the previous integration.
# The frontend will now choose the actual audio language.
DEFAULT_INTERVENTION_LANGUAGE = "english"


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


class PreviewRequest(BaseModel):
    page: PageData
    emotion: EmotionData


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
# PAGE DATA + AIML
#
# IMPORTANT:
# This endpoint ONLY performs AIML analysis.
# It does NOT call Gemini or ElevenLabs.
#
# The language-specific intervention happens later through
# /intervention after the user selects a language.
# =========================================================

@app.post("/page-data")
def receive_page_data(
    data: PageData
):

    print("\n========================================")
    print("SERENITY PAGE PROCESSING")
    print("========================================")

    print("URL:")
    print(data.url)

    print("\nTITLE:")
    print(data.title)

    print(
        "\nTIME SPENT:",
        data.time_spent_seconds,
        "seconds"
    )

    time_spent_minutes = (
        data.time_spent_seconds / 60
    )

    print(
        "TIME SPENT:",
        round(time_spent_minutes, 2),
        "minutes"
    )

    print("\nTEXT:")
    print(data.text[:500])


    # =====================================================
    # STEP 1: AIML ANALYSIS
    # =====================================================

    print("\n----------------------------------------")
    print("STEP 1: AIML ANALYSIS")
    print("----------------------------------------")

    try:

        analysis = analyze_content(
            text=data.text,
            content_type="unknown",
            time_spent_minutes=time_spent_minutes,
            exposure_count=1
        )

    except Exception as e:

        print(
            "AIML error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail={
                "stage": "aiml",
                "error": str(e)
            }
        )


    # =====================================================
    # PRINT AIML RESULT
    # =====================================================

    print("\nAIML RESULT:")

    print(
        "Dominant emotion:",
        analysis.get("dominant_emotion")
    )

    print(
        "Dominant score:",
        analysis.get("dominant_score")
    )

    print(
        "Negative score:",
        analysis.get("negative_score")
    )

    print(
        "Risk level:",
        analysis.get("trigger_reason")
    )

    print(
        "Trigger:",
        analysis.get("trigger")
    )


    # =====================================================
    # STEP 2: CHECK TRIGGER
    # =====================================================

    trigger = bool(
        analysis.get("trigger")
    )

    print("\n----------------------------------------")
    print("STEP 2: INTERVENTION DECISION")
    print("----------------------------------------")

    print(
        "Trigger:",
        trigger
    )


    # =====================================================
    # NO INTERVENTION
    # =====================================================

    if not trigger:

        print(
            "\nNo intervention required."
        )

        print(
            "========================================\n"
        )

        return {
            "success": True,
            "trigger": False,
            "message": "No intervention required.",
            "aiml": analysis,
            "page": {
                "url": data.url,
                "title": data.title,
                "text": data.text[:5000],
                "time_spent_seconds": data.time_spent_seconds
            }
        }


    # =====================================================
    # TRIGGERED
    #
    # IMPORTANT:
    # Gemini and ElevenLabs are NOT called here.
    #
    # We return the actual AIML context so the extension
    # and frontend can use it.
    # =====================================================

    print("\n----------------------------------------")
    print("STEP 3: INTERVENTION TRIGGERED")
    print("----------------------------------------")

    emotion_data = {
        "dominant_emotion": analysis.get(
            "dominant_emotion"
        ),
        "negative_score": analysis.get(
            "negative_score",
            0.0
        ),
        "content_type": "unknown",
        "content_text": data.text[:5000]
    }

    response = {
        "success": True,
        "trigger": True,

        "emotion": emotion_data,

        "aiml": analysis,

        "page": {
            "url": data.url,
            "title": data.title,
            "text": data.text[:5000],
            "time_spent_seconds": data.time_spent_seconds
        }
    }

    print(
        "\nAIML trigger returned to client."
    )

    print(
        "No Gemini call was made."
    )

    print(
        "No ElevenLabs call was made."
    )

    print("\n========================================")
    print("SERENITY AIML STAGE COMPLETE")
    print("========================================\n")

    return response


# =========================================================
# ENGLISH PREVIEW
#
# Used by the Serenity frontend to generate the visible
# intervention content.
#
# IMPORTANT:
# This preview is ALWAYS generated in English.
# It does NOT generate audio.
# =========================================================

@app.post("/intervention/preview")
def create_intervention_preview(
    data: PreviewRequest
):

    print("\n========================================")
    print("SERENITY ENGLISH PREVIEW")
    print("========================================")

    print(
        "Emotion:",
        data.emotion.dominant_emotion
    )

    print(
        "Negative score:",
        data.emotion.negative_score
    )


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


    # =====================================================
    # GEMINI — ENGLISH DISPLAY CONTENT
    # =====================================================

    try:

        intervention = generate_intervention(
            emotion_data,
            language="english"
        )

    except Exception as e:

        print(
            "Gemini preview error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail={
                "stage": "gemini_preview",
                "error": str(e)
            }
        )


    print(
        "English intervention generated."
    )

    print(
        "Title:",
        intervention.get("title")
    )

    print("\n========================================\n")


    return {
        "success": True,
        "trigger": True,
        "intervention": intervention,
        "language": "english",
        "emotion": data.emotion.dominant_emotion,
        "negative_score": data.emotion.negative_score
    }


# =========================================================
# SELECTED-LANGUAGE INTERVENTION
#
# Called ONLY after the user selects a language in the
# Serenity frontend.
#
# Flow:
#
# frontend
#     ↓
# /intervention
#     ↓
# Gemini
#     ↓
# selected-language intervention text
#     ↓
# ElevenLabs
#     ↓
# audio URL
#
# The frontend can use the returned audio URL while keeping
# its visible English intervention unchanged.
# =========================================================

@app.post("/intervention")
def create_intervention(
    data: InterventionRequest
):

    print("\n================================")
    print("SERENITY LANGUAGE INTERVENTION")
    print("================================")

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


    # =====================================================
    # STEP 1: GEMINI
    #
    # The selected language is used here because this
    # content will become the spoken audio.
    # =====================================================

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


    # =====================================================
    # STEP 2: PREPARE AUDIO TEXT
    # =====================================================

    audio_text = (
        f"{intervention['message']} "
        f"{intervention['activity']}"
    )


    # =====================================================
    # STEP 3: UNIQUE AUDIO FILE
    # =====================================================

    audio_filename = (
        f"serenity_"
        f"{data.language}_"
        f"{uuid.uuid4().hex}.mp3"
    )

    audio_path = (
        AUDIO_DIR /
        audio_filename
    )


    # =====================================================
    # STEP 4: ELEVENLABS
    # =====================================================

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


    # =====================================================
    # STEP 5: AUDIO URL
    # =====================================================

    audio_url = (
        f"http://localhost:8000"
        f"/audio/{audio_filename}"
    )


    # =====================================================
    # STEP 6: FINAL RESPONSE
    # =====================================================

    response = {

        "success": True,

        "trigger": True,

        "intervention": intervention,

        "audio_url": audio_url,

        "language": data.language,

        "emotion":
            data.emotion.dominant_emotion,

        "negative_score":
            data.emotion.negative_score
    }


    print("\n================================")
    print("SERENITY LANGUAGE PIPELINE COMPLETE")
    print("================================")

    print(
        "Language:",
        data.language
    )

    print(
        "Audio:",
        audio_url
    )

    print(
        "================================\n"
    )


    return response