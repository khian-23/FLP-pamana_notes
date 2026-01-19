import markdown
import bleach

ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    "p",
    "pre",
    "code",
    "strong",
    "em",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
]

ALLOWED_ATTRIBUTES = {
    "a": ["href", "title", "rel"],
    "code": ["class"],
    "pre": ["class"],
}

def render_markdown(text):
    html = markdown.markdown(
        text,
        extensions=["fenced_code", "codehilite"]
    )

    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True,
    )
