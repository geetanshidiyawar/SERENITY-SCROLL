from tts.elevenlabs import generate_audio


text = """
Hey, take a tiny pause for yourself.

You've been taking in a lot of information.
There's nothing you need to solve right now.

Take a slow breath, relax your shoulders,
and give yourself two quiet minutes.

When you're ready, step away from the screen
and do one small thing that feels good.
"""


output_file = generate_audio(text)

print("\n==============================")
print("SERENITY TTS TEST COMPLETE")
print("==============================")
print("Audio file:", output_file)
print("==============================")
