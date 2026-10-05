"""
agent.plan — Scratchpad Plan Manager

WHAT THIS FILE DOES:
- Manages reading and writing the scratchpad plan file (runs/<run_id>/plan.md).
- Allows the agent to persist its high-level strategy across context window trimming.
- Re-reads plan.md on every step to inject into the model's system context.
- Appends step-by-step notes as files are modified.
"""
import os


class PlanManager:
    """Manages the agent's scratchpad plan file."""
    
    def __init__(self, plan_path: str):
        self.plan_path = plan_path
    
    def read(self) -> str:
        """Read the current plan. Returns empty string if no plan exists."""
        if not os.path.exists(self.plan_path):
            return '(No plan yet)'
        try:
            with open(self.plan_path, 'r', encoding='utf-8') as f:
                return f.read()
        except (OSError, PermissionError):
            return '(Could not read plan)'
    
    def write(self, content: str):
        """Write or update the plan."""
        try:
            with open(self.plan_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except (OSError, PermissionError):
            pass  # Non-critical — plan is a convenience
    
    def update_step(self, step: int, description: str):
        """Append a step update to the plan."""
        current = self.read()
        update = f"\n## Step {step}\n{description}\n"
        self.write(current + update)

    def mark_item_done(self, pattern: str):
        """Check off matching '- [ ] ...' checklist items in plan.md to reflect live progress."""
        current = self.read()
        if not current or current.startswith('('):
            return
        lines = current.split('\n')
        modified = False
        for i, line in enumerate(lines):
            if line.strip().startswith('- [ ]') and pattern.lower() in line.lower():
                lines[i] = line.replace('- [ ]', '- [x]', 1)
                modified = True
                break
        if modified:
            self.write('\n'.join(lines))
