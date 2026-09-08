import json

from ai.emotion import analyze_emotion
from ai.scoring import (
    calculate_negative_score,
    get_dominant_emotion
)


# Test text
text = "I feel very sad and worried after reading this news."

# Run emotion model
scores = analyze_emotion(text)

# Calculate results
dominant_emotion = get_dominant_emotion(scores)
negative_score = calculate_negative_score(scores)

# Create JSON output
output = {
    "text": text,
    "dominant_emotion": dominant_emotion,
    "scores": scores,
    "negative_score": negative_score,
    "content_type": "news",
    "exposure_count": 1,
    "time_spent_minutes": 0.0,
    "trigger": negative_score >= 0.75
}


# Save JSON file
with open("emotion_output.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=4)

print("✅ Emotion output saved to emotion_output.json")
print(json.dumps(output, indent=4))