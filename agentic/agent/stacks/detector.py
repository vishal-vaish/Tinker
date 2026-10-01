"""
agent.stacks.detector — Single Stack Detection & Startup Validation

WHAT THIS FILE DOES:
- Detects and resolves strictly ONE primary framework stack for a project.
- Rejects mixed/multiple stack requests (enforces one stack at a time).
- Validates user-specified stack against actual project markers to fail fast on mismatches.
- Resolves the single active stack into a ResolvedProjectStack configuration.
"""
import os
import json
from dataclasses import dataclass
from typing import Optional

from agent.stacks.registry import (
    StackProfile, STACK_REGISTRY, get_stack_profile,
    PYTHON_PROFILE, HTML_PROFILE, REACT_PROFILE, VITE_PROFILE, NEXTJS_PROFILE
)


class StackValidationError(Exception):
    """Raised when the specified framework stack does not match the project or multiple stacks are requested."""
    pass


@dataclass
class ResolvedProjectStack:
    """Configuration for the single active stack in the project."""
    active_stack: StackProfile
    name: str
    allowed_commands: list[str]
    test_patterns: list[str]
    file_extensions: list[str]
    default_verify_command: str
    prompt_guidance: str

    def summary(self) -> str:
        """Formatted summary string for startup logging."""
        verify = self.default_verify_command or "(custom / none)"
        return f"Stack: {self.active_stack.display_name} | Verify Command: '{verify}'"


def _read_package_json(project_root: str) -> dict:
    """Safely read and parse package.json if present."""
    pkg_path = os.path.join(project_root, "package.json")
    if os.path.isfile(pkg_path):
        try:
            with open(pkg_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def detect_all_matching_stacks(project_root: str) -> list[StackProfile]:
    """Scan project markers and return all stacks that have evidence in the project."""
    detected: dict[str, StackProfile] = {}
    project_root = os.path.abspath(project_root)

    scan_dirs = [project_root]
    for sub in ["frontend", "backend", "client", "server", "web", "api", "app", "src"]:
        candidate = os.path.join(project_root, sub)
        if os.path.isdir(candidate):
            scan_dirs.append(candidate)

    has_python_files = False
    has_html_files = False

    for directory in scan_dirs:
        if not os.path.isdir(directory):
            continue

        try:
            files_in_dir = set(os.listdir(directory))
        except (PermissionError, OSError):
            continue

        pkg = _read_package_json(directory)
        all_deps = {}
        if isinstance(pkg, dict):
            all_deps.update(pkg.get("dependencies", {}))
            all_deps.update(pkg.get("devDependencies", {}))

        # Next.js
        if (
            "next" in all_deps or
            "next.config.js" in files_in_dir or
            "next.config.mjs" in files_in_dir or
            "next.config.ts" in files_in_dir
        ):
            detected["nextjs"] = NEXTJS_PROFILE

        # Vite
        if (
            "vite" in all_deps or
            any(f.startswith("vite.config.") for f in files_in_dir)
        ):
            detected["vite"] = VITE_PROFILE

        # React
        if "react" in all_deps or any(f.endswith((".jsx", ".tsx")) for f in files_in_dir):
            detected["react"] = REACT_PROFILE

        # Python
        if any(f in files_in_dir for f in [
            "requirements.txt", "pyproject.toml", "setup.py", "Pipfile", "poetry.lock"
        ]):
            detected["python"] = PYTHON_PROFILE

        for f in files_in_dir:
            if f.endswith(".py"):
                has_python_files = True
            elif f.endswith(".html"):
                has_html_files = True

    if has_python_files and "python" not in detected:
        detected["python"] = PYTHON_PROFILE

    if has_html_files and "html" not in detected:
        detected["html"] = HTML_PROFILE

    return list(detected.values())


def detect_single_primary_stack(
    project_root: str,
    task: str = "",
    default_stack: str = "nextjs"
) -> StackProfile:
    """
    Selects strictly ONE primary stack based on standard project priority:
    Next.js > Vite > React > Python > HTML.
    Fallback when no markers are detected: dynamically resolved from config.toml default_stack.
    """
    all_matching = {p.name: p for p in detect_all_matching_stacks(project_root)}

    # If task explicitly specifies a stack, honor it
    if task:
        t = task.lower()
        if any(k in t for k in ["python", "pytest", "unittest", "django", "fastapi", "flask"]) or ".py" in t:
            return PYTHON_PROFILE
        if any(k in t for k in ["vanilla html", "plain html", "single html", "raw html"]):
            return HTML_PROFILE
        if "vite" in t:
            return VITE_PROFILE
        if "next" in t or "nextjs" in t or "react" in t:
            return NEXTJS_PROFILE

    # Hierarchy: Choose the most specific framework
    if "nextjs" in all_matching:
        return NEXTJS_PROFILE
    if "vite" in all_matching:
        return VITE_PROFILE
    if "react" in all_matching:
        return REACT_PROFILE
    if "python" in all_matching:
        return PYTHON_PROFILE
    if "html" in all_matching and (default_stack == "html" or "html" in task.lower()):
        return HTML_PROFILE

    # Config-driven fallback (defaults to Next.js TypeScript)
    fallback_profile = get_stack_profile(default_stack)
    return fallback_profile or NEXTJS_PROFILE


def validate_and_resolve_stack(
    project_root: str,
    requested_stack: str = "auto",
    task: str = "",
    default_stack: str = "nextjs"
) -> tuple[bool, str, Optional[ResolvedProjectStack]]:
    """
    Validates that strictly ONE stack is requested, verifies it against project markers,
    and returns a ResolvedProjectStack for that single stack.
    
    Args:
        project_root: Absolute path to target project directory
        requested_stack: 'auto', or a single stack name: 'python', 'html', 'react', 'vite', 'nextjs'
        task: Optional task description to aid auto-detection on brand new empty folders
        default_stack: Fallback stack from config.toml (e.g. 'nextjs')
        
    Returns:
        (is_valid, error_or_info_message, resolved_stack)
    """
    req = requested_stack.strip().lower()

    # Reject mixed / multiple stacks explicitly
    if "," in req or ";" in req or " " in req and req not in ("", "auto", "default"):
        return False, (
            "Only ONE stack can be selected at a time (mixed stacks are disabled).\n"
            "Please specify a single stack: --stack python, --stack html, --stack react, "
            "--stack vite, or --stack nextjs."
        ), None

    if req in ("", "auto", "default"):
        # Auto-detect strictly one primary stack with config-driven fallback
        chosen_profile = detect_single_primary_stack(project_root, task=task, default_stack=default_stack)
    else:
        # User specified a single stack
        profile = get_stack_profile(req)
        if not profile:
            available = ", ".join(STACK_REGISTRY.keys())
            return False, f"Unknown stack '{req}'. Available single stacks: {available}", None

        # Verify that project has markers matching this specific stack
        all_matching = detect_all_matching_stacks(project_root)
        matching_names = {p.name for p in all_matching}

        if matching_names and profile.name not in matching_names:
            detected_str = ", ".join([p.display_name for p in all_matching])
            return False, (
                f"Stack mismatch: Project at '{project_root}' was not detected as '{profile.display_name}'.\n"
                f"Detected stack: {detected_str}.\n"
                f"Please select the matching stack or use --stack auto."
            ), None

        chosen_profile = profile

    resolved = ResolvedProjectStack(
        active_stack=chosen_profile,
        name=chosen_profile.name,
        allowed_commands=list(chosen_profile.allowed_cmd_prefixes),
        test_patterns=list(chosen_profile.test_file_patterns),
        file_extensions=list(chosen_profile.file_extensions),
        default_verify_command=chosen_profile.default_verify_cmd,
        prompt_guidance=chosen_profile.prompt_guidelines,
    )

    return True, f"Single stack '{chosen_profile.display_name}' verified", resolved
