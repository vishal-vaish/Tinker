"""
agent.safety.permissions — Risk-Based Permission Gate & Approval System

WHAT THIS FILE DOES:
- Categorizes all tool calls into risk levels (read, write, execute, destructive, control).
- Auto-approves safe actions (reading within jail, allowlisted commands).
- Intercepts edits to test files (treating them as destructive) to preserve verification integrity.
- Routes approval requests through the EventEmitter with timeout-to-deny logic.
- Tracks all modified files during the run.
"""
import time
import threading
from agent.safety.jail import PathJail, SecurityError
from agent.safety.allowlist import CommandAllowlist

# Risk levels
RISK_READ = 'read'
RISK_WRITE = 'write' 
RISK_EXECUTE = 'execute'
RISK_DESTRUCTIVE = 'destructive'
RISK_CONTROL = 'control'


class PermissionGate:
    """
    Central permission system. Checks path jail, command allowlist,
    and risk levels before allowing tool execution.
    """
    
    def __init__(self, jail: PathJail, allowlist: CommandAllowlist, 
                 emitter, approval_timeout: int = 60):
        """
        Args:
            jail: PathJail instance for path checking
            allowlist: CommandAllowlist for command checking
            emitter: EventEmitter for approval requests
            approval_timeout: Seconds to wait for approval (default: deny)
        """
        self.jail = jail
        self.allowlist = allowlist
        self.emitter = emitter
        self.approval_timeout = approval_timeout
        self.test_files_modified: list[str] = []  # Track modified test files
        self.files_modified: list[str] = []  # Track all modified files
        self._snapshot_taken = False
    
    def check_path(self, path: str) -> str:
        """
        Check a path through the jail. Returns safe resolved path.
        Raises SecurityError if outside project root.
        """
        return self.jail.check(path)
    
    def check_command(self, command: str) -> tuple[bool, str]:
        """Check if a command is allowed."""
        return self.allowlist.is_allowed(command)
    
    def check_tool(self, tool_name: str, risk: str, args: dict) -> tuple[bool, str]:
        """
        Check if a tool call is permitted based on risk level.
        
        Returns:
            (allowed: bool, reason: str)
        """
        # Control tools (finish) are always allowed
        if risk == RISK_CONTROL:
            return True, 'control tool'
        
        # Read tools are always auto-approved
        if risk == RISK_READ:
            return True, 'read auto-approved'
        
        # Write tools: check path jail, check if test file
        if risk == RISK_WRITE:
            path = args.get('path', '')
            if path:
                try:
                    safe_path = self.jail.check(path)
                except SecurityError as e:
                    return False, str(e)
                
                # Test file protection
                if self.jail.is_test_file(safe_path):
                    approved = self._request_approval(
                        action=f'{tool_name} on test file {path}',
                        risk='destructive',
                        reason='Test files are read-only by default. Modifying tests may invalidate the run.'
                    )
                    if not approved:
                        return False, f'Approval denied: modifying test file {path}'
                    self.test_files_modified.append(safe_path)
            return True, 'write auto-approved inside jail'
        
        # Execute tools: check command allowlist
        if risk == RISK_EXECUTE:
            command = args.get('command', '')
            if command:
                allowed, reason = self.allowlist.is_allowed(command)
                if not allowed:
                    return False, reason
            return True, 'command allowlisted'
        
        # Destructive: always needs approval
        if risk == RISK_DESTRUCTIVE:
            approved = self._request_approval(
                action=f'{tool_name}({args})',
                risk='destructive',
                reason='This action is destructive and requires explicit approval.'
            )
            if not approved:
                return False, 'Approval denied for destructive action'
            return True, 'destructive action approved'
        
        return False, f'Unknown risk level: {risk}'
    
    def record_file_modified(self, path: str):
        """Record that a file was modified."""
        if path not in self.files_modified:
            self.files_modified.append(path)
    
    def _request_approval(self, action: str, risk: str, reason: str) -> bool:
        """
        Request approval through the event system.
        Blocks until approved, denied, or timeout (timeout = deny).
        """
        from agent.events import APPROVAL_REQUEST, APPROVAL_ANSWER
        import uuid
        
        approval_id = str(uuid.uuid4())
        
        # Emit approval request
        self.emitter.emit(APPROVAL_REQUEST, {
            'approval_id': approval_id,
            'action': action,
            'risk': risk,
            'reason': reason,
        })
        
        # Wait for approval answer
        answer_event = self.emitter.wait_for(APPROVAL_ANSWER, timeout=self.approval_timeout)
        
        if answer_event is None:
            return False  # Timeout = deny
        
        return answer_event.payload.get('approved', False)
    
    @property
    def has_modified_tests(self) -> bool:
        """Check if any test files were modified."""
        return len(self.test_files_modified) > 0
