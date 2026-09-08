import re

MAX_TEXT_LENGTH = 5000

SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)
HTML_TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
REPEATED_CHAR_RE = re.compile(r"(.)\1{3,}")


def clean_text(text: str) -> str:
    if text is None:
        return ""

    if not isinstance(text, str):
        try:
            text = str(text)
        except Exception:
            return ""

    if text.strip() == "":
        return ""

    cleaned = text
    cleaned = SCRIPT_STYLE_RE.sub(" ", cleaned)
    cleaned = HTML_TAG_RE.sub(" ", cleaned)
    cleaned = WHITESPACE_RE.sub(" ", cleaned)
    cleaned = REPEATED_CHAR_RE.sub(lambda m: m.group(1) * 3, cleaned)
    cleaned = cleaned.strip()

    if len(cleaned) > MAX_TEXT_LENGTH:
        cleaned = cleaned[:MAX_TEXT_LENGTH].rstrip()

    return cleaned


if __name__ == "__main__":
    test_cases = [
        None,
        "   ",
        "Hello   \n\n\t  World!!!",
        "<div>Hi <b>there</b></div><script>alert('x')</script>",
        "I am sooooo happpppy!!!!!! :)",
    ]

    for i, case in enumerate(test_cases, start=1):
        result = clean_text(case)
        print(f"Test {i}: input={case!r}")
        print(f"        output={result!r}")
        print("-" * 60)