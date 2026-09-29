"""
agent.stacks package — Framework and Stack Profiles Registry

WHAT THIS PACKAGE CONTAINS:
- registry.py: Defines StackProfile and built-in profiles for Python, HTML, React, Vite, and Next.js.
- detector.py: Detects strictly ONE primary stack per project and validates single-stack selection.
"""
from agent.stacks.registry import StackProfile, STACK_REGISTRY, get_stack_profile
from agent.stacks.detector import (
    detect_all_matching_stacks,
    detect_single_primary_stack,
    validate_and_resolve_stack,
    ResolvedProjectStack,
    StackValidationError,
)
