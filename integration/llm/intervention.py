import os
import json

from dotenv import load_dotenv
from google import genai


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ==========================================
# GENERATE SERENITY INTERVENTION
# ==========================================

def generate_intervention(emotion_data, language="english"):

    # ------------------------------------------
    # SUPPORTED LANGUAGES
    # ------------------------------------------

    language_instructions = {

        "english": (
            "Generate the intervention in natural, "
            "conversational English."
        ),

        "hindi": (
            "Generate the intervention in natural "
            "conversational Hindi. "
            "Use Devanagari script."
        ),

        "hinglish": (
            "Generate the intervention in natural "
            "conversational Hinglish. "
            "Use Hindi written in Roman/English script "
            "and naturally mix English words where appropriate. "
            "Do NOT use Devanagari script."
        ),

        "tamil": (
            "Generate the intervention in natural "
            "conversational Tamil. "
            "Use Tamil script."
        ),

        "spanish": (
            "Generate the intervention in natural "
            "conversational Spanish."
        ),

        "french": (
            "Generate the intervention in natural "
            "conversational French."
        )
    }


    # ------------------------------------------
    # CHECK LANGUAGE
    # ------------------------------------------

    if language not in language_instructions:

        raise ValueError(
            f"Unsupported language: {language}. "
            f"Supported languages are: "
            f"{', '.join(language_instructions.keys())}"
        )


    language_instruction = language_instructions[language]


    # ------------------------------------------
    # GEMINI PROMPT
    # ------------------------------------------

    prompt = f"""
You are Serenity, a digital wellbeing assistant.

Your job is to help a user take a gentle break when they have
been consuming emotionally negative or unhealthy content.

Here is the analysis of the user's current browsing session:

Dominant emotion:
{emotion_data["dominant_emotion"]}

Negative score:
{emotion_data["negative_score"]}

Content type:
{emotion_data["content_type"]}

Content the user was consuming:
{emotion_data["content_text"]}


USER'S SELECTED LANGUAGE:
{language}


LANGUAGE INSTRUCTION:
{language_instruction}


Generate a personalized digital wellbeing intervention.

IMPORTANT RULES:

- Understand the actual content before responding.
- Do NOT assume the user is reading news.
- Adapt your response to the content type.
- Be compassionate and non-judgmental.
- Never shame the user.
- Do not make medical claims.
- Do not diagnose the user.
- Encourage one small positive activity.
- Keep the intervention suitable for approximately 2 minutes of audio.
- Do not tell the user to permanently stop using social media.
- The goal is a gentle interruption, not punishment.
- The entire title, message, and activity must follow the selected language.
- Make the response sound natural when spoken aloud.
- Do not provide explanations outside the JSON.
- Do not use Markdown.
- Return ONLY valid JSON.


Use exactly this format:

{{
    "title": "short intervention title",
    "message": "compassionate personalized intervention message",
    "activity": "one small positive activity",
    "duration_seconds": 120
}}
"""


    # ------------------------------------------
    # CALL GEMINI
    # ------------------------------------------

    response = client.models.generate_content(

        model="gemini-3.6-flash",

        contents=prompt
    )


    # ------------------------------------------
    # GET GEMINI RESPONSE
    # ------------------------------------------

    raw_response = response.text.strip()


    print("\n==============================")
    print("RAW GEMINI RESPONSE")
    print("==============================")

    print(raw_response)


    # ------------------------------------------
    # PARSE JSON
    # ------------------------------------------

    try:

        intervention = json.loads(
            raw_response
        )

    except json.JSONDecodeError:

        print(
            "\nERROR: Gemini did not return valid JSON."
        )

        raise ValueError(
            "Invalid JSON returned by Gemini."
        )


    # ------------------------------------------
    # CHECK REQUIRED FIELDS
    # ------------------------------------------

    required_fields = [

        "title",

        "message",

        "activity",

        "duration_seconds"
    ]


    for field in required_fields:

        if field not in intervention:

            raise ValueError(
                f"Gemini response is missing "
                f"required field: {field}"
            )


    # ------------------------------------------
    # RETURN STRUCTURED INTERVENTION
    # ------------------------------------------

    return intervention
