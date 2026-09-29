"""
agent.stacks.registry — Framework & Language Stack Profiles

WHAT THIS FILE DOES:
- Defines the StackProfile dataclass encapsulating build, test, and sandbox settings per framework.
- Houses built-in profiles for Python, HTML/Vanilla Web, React, Vite, and Next.js.
- Provides helper lookups for registered stacks.
"""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class StackProfile:
    """Configuration profile for a specific language or framework."""
    name: str
    display_name: str
    file_markers: list[str]
    package_dependencies: list[str]
    default_verify_cmd: str
    allowed_cmd_prefixes: list[str]
    test_file_patterns: list[str]
    file_extensions: list[str]
    prompt_guidelines: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# Built-in Stack Profiles
# ─────────────────────────────────────────────────────────────────────────────

PYTHON_PROFILE = StackProfile(
    name="python",
    display_name="Python",
    file_markers=[
        "requirements.txt", "pyproject.toml", "setup.py", "Pipfile",
        "manage.py", "poetry.lock"
    ],
    package_dependencies=[],
    default_verify_cmd="python -m unittest discover -s . -p 'test_*.py'",
    allowed_cmd_prefixes=[
        "python", "python3", "pytest", "ruff", "black", "mypy", "git"
    ],
    test_file_patterns=[
        "test_*.py", "*_test.py", "tests/*.py"
    ],
    file_extensions=[
        ".py", ".txt", ".md", ".toml", ".json", ".cfg", ".ini", ".yaml", ".yml"
    ],
    prompt_guidelines="""- Python Stack: Follow PEP 8 conventions. Use type hints where appropriate.
- When fixing tests, inspect unittest or pytest assertion tracebacks carefully."""
)

HTML_PROFILE = StackProfile(
    name="html",
    display_name="HTML / Vanilla Web",
    file_markers=["index.html", "*.html"],
    package_dependencies=[],
    default_verify_cmd="",  # Verified via DOM assertions or browser tests
    allowed_cmd_prefixes=["node", "npx", "git"],
    test_file_patterns=["*.test.html", "test_*.js", "*.spec.js"],
    file_extensions=[
        ".html", ".htm", ".css", ".js", ".json", ".svg", ".txt", ".md"
    ],
    prompt_guidelines="""- HTML/Vanilla Web Stack: Write modern, semantic HTML5 and clean CSS/vanilla JavaScript.
- Avoid external framework syntax (like JSX) unless explicitly configured."""
)

REACT_PROFILE = StackProfile(
    name="react",
    display_name="React",
    file_markers=[
        "src/App.jsx", "src/App.tsx", "src/index.js", "src/main.jsx", "src/main.tsx"
    ],
    package_dependencies=["react", "react-dom"],
    default_verify_cmd="npm test -- --watchAll=false",
    allowed_cmd_prefixes=[
        "npm", "npx", "pnpm", "yarn", "node", "git"
    ],
    test_file_patterns=[
        "*.test.js", "*.test.jsx", "*.test.ts", "*.test.tsx",
        "*.spec.js", "*.spec.jsx", "*.spec.ts", "*.spec.tsx"
    ],
    file_extensions=[
        ".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".json", ".html"
    ],
    prompt_guidelines="""- React Stack: Follow React functional component and hooks rules (useState, useEffect, etc.).
- Never violate hooks rules (no conditional hooks, call hooks only at top-level).
- Ensure JSX/TSX syntax is strictly valid and imports match the bundler setup."""
)

VITE_PROFILE = StackProfile(
    name="vite",
    display_name="Vite (React / Vue / Vanilla)",
    file_markers=[
        "vite.config.js", "vite.config.ts", "vite.config.mjs", "vite.config.cjs"
    ],
    package_dependencies=["vite"],
    default_verify_cmd="npm run build",
    allowed_cmd_prefixes=[
        "npm", "npx", "pnpm", "yarn", "node", "vitest", "git"
    ],
    test_file_patterns=[
        "*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx",
        "*.test.js", "*.test.jsx", "*.spec.js", "*.spec.jsx"
    ],
    file_extensions=[
        ".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".svg"
    ],
    prompt_guidelines="""- Vite Stack: Use standard ESM imports. Assets and CSS should be imported using Vite conventions.
- For verification, 'npm run build' or 'npx vitest run' can be executed to confirm zero compiler errors."""
)

NEXTJS_PROFILE = StackProfile(
    name="nextjs",
    display_name="Next.js (App / Pages Router)",
    file_markers=[
        "next.config.js", "next.config.mjs", "next.config.ts"
    ],
    package_dependencies=["next"],
    default_verify_cmd="npm run build",
    allowed_cmd_prefixes=[
        "npm", "npx", "pnpm", "yarn", "node", "next", "git"
    ],
    test_file_patterns=[
        "*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx",
        "__tests__/**"
    ],
    file_extensions=[
        ".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".scss", ".mjs"
    ],
    prompt_guidelines="""- Next.js Stack: Distinguish between Server Components (default in App Router) and Client Components ('use client').
- Ensure TypeScript types match Next.js PageProps, LayoutProps, or API Route handler signatures.
- Running 'npm run build' validates TypeScript types, ESLint rules, and route tree compilation."""
)

# Registry dictionary
STACK_REGISTRY: dict[str, StackProfile] = {
    "python": PYTHON_PROFILE,
    "html": HTML_PROFILE,
    "react": REACT_PROFILE,
    "vite": VITE_PROFILE,
    "nextjs": NEXTJS_PROFILE,
}


def get_stack_profile(name: str) -> Optional[StackProfile]:
    """Retrieve a stack profile by its canonical name."""
    return STACK_REGISTRY.get(name.lower().strip())
