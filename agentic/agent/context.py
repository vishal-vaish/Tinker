"""Context management — keeps the agent within its context budget.

Local models degrade on long contexts, so this is a first-class module.
Strategy:
- Always keep: system prompt, task, current plan, last N steps in full
- Older steps: compressed to one-line summaries
- Token estimation: rough heuristic (no tokenizer dependency)
"""


def estimate_tokens(text: str) -> int:
    """
    Rough token estimation without a tokenizer.
    Heuristic: ~1.3 tokens per word for English text, ~2.5 tokens per word for code.
    We use a blended estimate of ~1.5 tokens per word to be conservative.
    """
    if not text:
        return 0
    words = len(text.split())
    # Also account for special characters common in code
    special_chars = sum(1 for c in text if c in '{}[]()=<>:;,./\\!@#$%^&*')
    return int(words * 1.5 + special_chars * 0.5)


def summarize_step(step: dict) -> str:
    """
    Create a one-line summary of a step for context compression.
    
    Args:
        step: Dict with keys like 'step', 'tool', 'tool_args', 'tool_result', 'text'
    
    Returns:
        One-line summary like: "Step 3: read_file(math_utils.py) → found sum_range function with off-by-one bug"
    """
    step_num = step.get('step', '?')
    tool = step.get('tool', '')
    
    if tool:
        # Summarize tool call
        args = step.get('tool_args', {})
        result = str(step.get('tool_result', ''))[:100]
        
        if tool == 'list_files':
            path = args.get('path', '.')
            return f"Step {step_num}: list_files({path}) → {result.split(chr(10))[0]}"
        elif tool == 'read_file':
            path = args.get('path', '?')
            return f"Step {step_num}: read_file({path}) → read file content"
        elif tool == 'search_text':
            pattern = args.get('pattern', '?')
            return f"Step {step_num}: search_text('{pattern}') → {result.split(chr(10))[0]}"
        elif tool == 'edit_file':
            path = args.get('path', '?')
            return f"Step {step_num}: edit_file({path}) → {result[:80]}"
        elif tool == 'create_file':
            path = args.get('path', '?')
            return f"Step {step_num}: create_file({path}) → {result[:80]}"
        elif tool == 'run_command':
            cmd = args.get('command', '?')[:40]
            return f"Step {step_num}: run_command({cmd}) → {result.split(chr(10))[0]}"
        elif tool == 'run_tests':
            return f"Step {step_num}: run_tests() → {result.split(chr(10))[0]}"
        elif tool == 'finish':
            summary = args.get('summary', '?')[:80]
            return f"Step {step_num}: finish({summary})"
        else:
            args_str = str(args)[:50]
            return f"Step {step_num}: {tool}({args_str}) → {result[:60]}"
    elif step.get('text'):
        return f"Step {step_num}: (model text response, no tool call)"
    else:
        return f"Step {step_num}: (empty response)"


class ContextManager:
    """
    Manages the agent's context window to stay within budget.
    
    Strategy:
    - System prompt, task, and current plan are ALWAYS included
    - Last `keep_recent` steps are included in full
    - Older steps are compressed to one-line summaries
    - Reports context usage each step
    """
    
    def __init__(self, context_limit: int = 8192, keep_recent: int = 4):
        """
        Args:
            context_limit: Maximum tokens for the context window
            keep_recent: Number of recent steps to keep in full
        """
        self.context_limit = context_limit
        self.keep_recent = keep_recent
        self._step_records: list[dict] = []  # All step records
    
    def add_step(self, step_record: dict):
        """Record a completed step for context management."""
        self._step_records.append(step_record)
    
    def build_messages(
        self,
        system_prompt: str,
        task: str,
        plan: str,
        full_message_history: list[dict],
    ) -> tuple[list[dict], dict]:
        """
        Build a context-managed message list that fits within the budget.
        
        Args:
            system_prompt: The system prompt
            task: The task description
            plan: Current plan text
            full_message_history: Complete message history
        
        Returns:
            (messages: list[dict], context_info: dict) where context_info has
            'total_tokens', 'budget_used_pct', 'steps_summarized', 'steps_full'
        """
        # 1. Calculate fixed costs (always included)
        plan_section = f"\n\nCurrent Plan:\n{plan}" if plan and plan != '(No plan yet)' else ''
        system_with_plan = system_prompt + plan_section
        
        system_tokens = estimate_tokens(system_with_plan)
        task_tokens = estimate_tokens(task)
        fixed_cost = system_tokens + task_tokens + 100  # Buffer for formatting
        
        remaining_budget = self.context_limit - fixed_cost
        
        if remaining_budget <= 0:
            # System prompt + task already exceeds budget — just send them
            messages = [
                {'role': 'system', 'content': system_with_plan},
                {'role': 'user', 'content': f'Task: {task}'},
            ]
            return messages, {
                'total_tokens': fixed_cost,
                'budget_used_pct': 100.0,
                'steps_summarized': 0,
                'steps_full': 0,
            }
        
        # 2. Separate message history into pairs (assistant + tool response)
        # Messages after the first user message are tool interaction pairs
        if len(full_message_history) <= 2:
            # Just system + task, no steps yet
            messages = [
                {'role': 'system', 'content': system_with_plan},
                {'role': 'user', 'content': f'Task: {task}'},
            ]
            return messages, {
                'total_tokens': fixed_cost,
                'budget_used_pct': round(fixed_cost / self.context_limit * 100, 1),
                'steps_summarized': 0,
                'steps_full': 0,
            }
        
        # Messages after system+task are the step history
        step_messages = full_message_history[2:]  # Skip system and first user
        
        # 3. Group into step pairs and estimate tokens
        step_groups = []  # list of (messages_list, token_count)
        i = 0
        while i < len(step_messages):
            group = [step_messages[i]]
            i += 1
            # Include the tool response if it follows
            while i < len(step_messages) and step_messages[i].get('role') in ('tool', 'user'):
                group.append(step_messages[i])
                i += 1
            group_text = ' '.join(m.get('content', '') for m in group)
            tokens = estimate_tokens(group_text)
            step_groups.append((group, tokens))
        
        # 4. Keep recent steps in full, summarize older ones
        n_groups = len(step_groups)
        recent_start = max(0, n_groups - self.keep_recent)
        
        # Calculate recent steps cost
        recent_tokens = sum(t for _, t in step_groups[recent_start:])
        
        if recent_tokens > remaining_budget:
            # Even recent steps don't fit — keep fewer
            budget_left = remaining_budget
            kept_groups = []
            for group, tokens in reversed(step_groups):
                if budget_left - tokens >= 0:
                    kept_groups.insert(0, group)
                    budget_left -= tokens
                else:
                    break
            
            messages = [{'role': 'system', 'content': system_with_plan},
                        {'role': 'user', 'content': f'Task: {task}'}]
            for group in kept_groups:
                messages.extend(group)
            
            total_tokens = fixed_cost + (remaining_budget - budget_left)
            return messages, {
                'total_tokens': total_tokens,
                'budget_used_pct': round(total_tokens / self.context_limit * 100, 1),
                'steps_summarized': n_groups - len(kept_groups),
                'steps_full': len(kept_groups),
            }
        
        # 5. Summarize older steps
        summaries = []
        summary_tokens = 0
        steps_summarized = 0
        
        for idx in range(recent_start):
            if idx < len(self._step_records):
                summary = summarize_step(self._step_records[idx])
            else:
                summary = f"Step {idx+1}: (summarized)"
            tokens = estimate_tokens(summary)
            if summary_tokens + tokens + recent_tokens <= remaining_budget:
                summaries.append(summary)
                summary_tokens += tokens
                steps_summarized += 1
            else:
                break  # No room for more summaries
        
        # 6. Build final messages
        messages = [{'role': 'system', 'content': system_with_plan},
                    {'role': 'user', 'content': f'Task: {task}'}]
        
        if summaries:
            summary_text = 'Previous steps (summarized):\n' + '\n'.join(summaries)
            messages.append({'role': 'user', 'content': summary_text})
        
        for group, _ in step_groups[recent_start:]:
            messages.extend(group)
        
        total_tokens = fixed_cost + summary_tokens + recent_tokens
        return messages, {
            'total_tokens': total_tokens,
            'budget_used_pct': round(total_tokens / self.context_limit * 100, 1),
            'steps_summarized': steps_summarized,
            'steps_full': n_groups - recent_start,
        }
    
    def get_usage_report(self) -> str:
        """Get a human-readable context usage report."""
        total_steps = len(self._step_records)
        return f"Context: {total_steps} steps recorded, keep_recent={self.keep_recent}, limit={self.context_limit}"
