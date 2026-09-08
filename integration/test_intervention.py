from llm.intervention import generate_intervention
from tts.elevenlabs import generate_audio


# --------------------------------------------------
# SAMPLE EMOTION DATA
# This simulates the output from your friend's
# Hugging Face emotion classifier.
# --------------------------------------------------

emotion_data = {
    "dominant_emotion": "anger",
    "negative_score": 0.87,
    "content_type": "social_media",

    "content_text": """
    Users are arguing about a controversial political topic.
    Several comments contain angry and hostile language.
    The discussion is becoming increasingly negative.
    """
}


# --------------------------------------------------
# LANGUAGE
# Later, this will come from the frontend.
# For now, change this value to test languages.
# --------------------------------------------------

language = "hinglish"


# --------------------------------------------------
# STEP 1: GEMINI GENERATES THE INTERVENTION
# --------------------------------------------------

print("\n==============================")
print("STEP 1: GENERATING INTERVENTION")
print("==============================")

intervention = generate_intervention(
    emotion_data,
    language=language
)

print("\nGemini generated:")
print(intervention)


# --------------------------------------------------
# STEP 2: GET GEMINI'S GENERATED MESSAGE
# --------------------------------------------------

message = intervention["message"]

print("\n==============================")
print("GEMINI MESSAGE")
print("==============================")
print(message)


# --------------------------------------------------
# STEP 3: SEND GEMINI'S MESSAGE TO ELEVENLABS
# --------------------------------------------------

print("\n==============================")
print("STEP 2: GENERATING AUDIO")
print("==============================")

audio_file = generate_audio(
    text=message,
    language=language,
    output_file=f"serenity_{language}.mp3"
)


# --------------------------------------------------
# FINAL RESULT
# --------------------------------------------------

print("\n==============================")
print("SERENITY PIPELINE COMPLETE")
print("==============================")

print("Language:", language)

print("\nGenerated intervention:")
print(intervention)

print("\nAudio file:")
print(audio_file)

print("==============================")
