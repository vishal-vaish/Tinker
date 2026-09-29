"""
agent.safety package — Sandbox, Path Jail, Command Allowlist & Permission Gate

WHAT THIS PACKAGE CONTAINS:
- jail.py: PathJail enforcing that file accesses remain inside the designated project root.
- allowlist.py: CommandAllowlist restricting executable commands and blocking shell chaining.
- permissions.py: PermissionGate coordinating risk levels, approval prompts, and test file protection.
"""
from agent.safety.jail import PathJail
from agent.safety.allowlist import CommandAllowlist
from agent.safety.permissions import PermissionGate
