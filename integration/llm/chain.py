from llm.intervention import generate_intervention
from tts.elevenlabs import generate_audio


def run_intervention(
    emotion_data,
    language,
    output_file
):
    """
    Serenity integration pipeline.

    Emotion analysis
        ↓
    Gemini
        ↓
    Intervention
        ↓
    ElevenLabs
        ↓
    Audio
    """

    # STEP 1: Gemini generates intervention

    intervention = generate_intervention(
        emotion_data,
        language=language
    )


    # STEP 2: Prepare text for audio

    audio_text = (
        f"{intervention['message']} "
        f"{intervention['activity']}"
    )


    # STEP 3: Generate audio using ElevenLabs

    audio_file = generate_audio(
        text=audio_text,
        language=language,
        output_file=output_file
    )


    # STEP 4: Return everything

    return {
        "intervention": intervention,
        "audio_file": audio_file
    }