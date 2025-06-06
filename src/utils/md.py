import re

def markdown_to_text(md: str) -> str:
    """Convert markdown to clean text while preserving some structure."""
    # Remove code blocks
    text = re.sub(r'```.*?```', '', md, flags=re.DOTALL)
    text = re.sub(r'`[^`]*`', '', text)

    # Convert headers to plain text with extra spacing
    text = re.sub(r'^#{1,6}\s*(.+)$', r'\1\n', text, flags=re.MULTILINE)

    # Remove markdown formatting but preserve emphasis with spacing
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)      # Italic
    text = re.sub(r'__([^_]+)__', r'\1', text)      # Bold
    text = re.sub(r'_([^_]+)_', r'\1', text)        # Italic

    # Handle links - keep the text, optionally keep URL
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)

    # Clean up lists
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)

    # Clean up extra whitespace
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = text.strip()

    return text
