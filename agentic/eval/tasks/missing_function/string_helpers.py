"""String helper utility functions."""


def capitalize_first(s: str) -> str:
    """Capitalize the first letter of a string."""
    if not s:
        return ""
    return s[0].upper() + s[1:]
