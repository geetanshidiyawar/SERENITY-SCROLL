import os

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# ELEVENLABS CLIENT
# ==========================================

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)


# ==========================================
# SERENITY VOICE IDs
# ==========================================

VOICE_IDS = {

    "english": "Xh5NN1TskuzHW2MGp2OV",

    "hindi": "Xh5NN1TskuzHW2MGp2OV",

    "hinglish": "Xh5NN1TskuzHW2MGp2OV",

    "tamil": "Xh5NN1TskuzHW2MGp2OV",

    "punjabi": "Xh5NN1TskuzHW2MGp2OV",

    "marathi": "Xh5NN1TskuzHW2MGp2OV"

}


# ==========================================
# GENERATE SERENITY AUDIO
# ==========================================

def generate_audio(
    text,
    language="english",
    output_file="serenity_intervention.mp3"
):

    # --------------------------------------
    # Validate language
    # --------------------------------------

    if language not in VOICE_IDS:

        raise ValueError(
            f"Unsupported language: {language}. "
            f"Supported languages: "
            f"{', '.join(VOICE_IDS.keys())}"
        )


    # --------------------------------------
    # Select correct voice automatically
    # --------------------------------------

    voice_id = VOICE_IDS[language]


    print("\n==============================")
    print("SERENITY TTS")
    print("==============================")

    print("Language:", language)
    print("Voice ID:", voice_id)

    print("Generating audio...")


    # --------------------------------------
    # ElevenLabs generation
    # --------------------------------------

    audio = client.text_to_speech.convert(

        voice_id=voice_id,

        model_id="eleven_flash_v2_5",

        text=text,

        output_format="mp3_44100_128"

    )


    # --------------------------------------
    # Save MP3
    # --------------------------------------

    with open(output_file, "wb") as f:

        for chunk in audio:

            f.write(chunk)


    print("Audio generated successfully!")

    print("Saved to:", output_file)

    print("==============================")


    return output_file