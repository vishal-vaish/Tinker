"""
agent.safety.allowlist — Shell Command Allowlist & Injection Prevention

WHAT THIS FILE DOES:
- Enforces an allowlist of permissible command prefixes (e.g. 'python -m unittest', 'git status').
- Detects and rejects shell chaining operators (&&, ||, ;, |) to prevent arbitrary code execution.
- Ensures no unapproved system or network commands can be executed by the agent.
"""
import shlex
import re

class CommandAllowlist:
    """Controls which shell commands the agent may execute."""
    
    SHELL_CHAIN_PATTERN = re.compile(r'[;&|]|\|\||&&')
    
    def __init__(self, allowed_commands: list[str]):
        """
        Args:
            allowed_commands: List of allowed command prefixes,
                e.g. ['python -m unittest', 'git status', 'git diff']
        """
        self.allowed = [cmd.strip() for cmd in allowed_commands]
    
    def is_allowed(self, command: str) -> tuple[bool, str]:
        """
        Check if a command is in the allowlist.
        
        Returns:
            (allowed: bool, reason: str)
        """
        command = command.strip()
        
        # Check for shell chaining
        if self.has_shell_chaining(command):
            return False, f"Shell chaining not allowed: '{command}'"
        
        # Check against allowlist (prefix match)
        for allowed_cmd in self.allowed:
            if command == allowed_cmd or command.startswith(allowed_cmd + ' '):
                return True, 'allowed'
        
        return False, f"Command not in allowlist: '{command}'. Allowed: {self.allowed}"
    
    def has_shell_chaining(self, command: str) -> bool:
        """Check for shell chaining operators (&&, ||, ;, |)."""
        # Simple check - look for chaining operators outside of quotes
        # For safety, we check the raw string
        return bool(self.SHELL_CHAIN_PATTERN.search(command))
