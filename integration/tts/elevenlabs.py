import os

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)


def generate_audio(
    text,
    language="english",
    output_file="serenity_intervention.mp3"
):
    """
    Generate Serenity intervention audio.

    The language comes from the frontend/user selection.
    """

    supported_languages = [
        "english",
        "hindi",
        "hinglish",
        "tamil",
        "spanish",
        "french"
    ]

    if language not in supported_languages:
        raise ValueError(
            f"Unsupported language: {language}"
        )

    print("\n==============================")
    print("SERENITY TTS")
    print("==============================")
    print("Language:", language)
    print("Generating audio...")

    audio = client.text_to_speech.convert(
        voice_id={

    "english": "Xh5NN1TskuzHW2MGp2OV",

    "hindi": "gHu9GtaHOXcSqFTK06ux",

    "hinglish":"tW86gkLZCsTL5jRrTBBw",

    "tamil": "hhPtGvkQC1ce5z3pPhYh",

    "punjabi": "1PuVf16QHAMH3JccjqB0",

    "marathi": "OlyuFBQHfYN9SaX9lFEK"
}

,
        model_id="eleven_flash_v2_5",
        text=text,
        output_format="mp3_44100_128"
    )

    with open(output_file, "wb") as f:
        for chunk in audio:
            f.write(chunk)

    print("Audio generated successfully!")
    print("Saved to:", output_file)
    print("==============================")

    return output_file
