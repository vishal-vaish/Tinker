"""
agent.tools.exec_tools — Command Execution & Test Running Tools

WHAT THIS FILE DOES:
- run_command: Executes allowlisted shell commands with timeouts and strict output byte limits.
- run_tests: Executes the configured unittest command, parses output, and extracts only failing test names and key traceback lines. Never returns noisy full logs to the LLM.
"""
import os
import subprocess
import sys
import re
from agent.tools.registry import ToolDef, ToolRegistry


def _run_command(command: str, project_root: str = '', 
                 timeout: int = 30, output_cap: int = 10000) -> str:
    """
    Run a shell command inside the project directory.
    The command must be in the allowlist (checked by permission gate before this).
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return f"ERROR: Command timed out after {timeout}s: {command}"
    except Exception as e:
        return f"ERROR: Failed to run command: {e}"
    
    output = result.stdout + result.stderr
    
    # Cap output size
    truncated = False
    if len(output) > output_cap:
        output = output[:output_cap]
        truncated = True
    
    exit_info = f"Exit code: {result.returncode}"
    if truncated:
        exit_info += " [OUTPUT TRUNCATED]"
    
    return f"{exit_info}\n{output}"


def _run_tests(command: str = '', project_root: str = '',
               timeout: int = 60, output_cap: int = 10000) -> str:
    """
    Run the test command and parse output to return only:
    - Number of tests run
    - Failing test names
    - Key error lines
    Never returns the full log.
    """
    if not command:
        command = f'{sys.executable} -m unittest discover -s . -p "test_*.py"'
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return f"ERROR: Tests timed out after {timeout}s"
    except Exception as e:
        return f"ERROR: Failed to run tests: {e}"
    
    full_output = result.stdout + result.stderr
    
    # Parse test results
    lines = full_output.split('\n')
    
    # Find summary line (e.g., "Ran 5 tests in 0.001s")
    summary_line = ''
    result_line = ''
    for line in lines:
        if line.strip().startswith('Ran ') and 'test' in line:
            summary_line = line.strip()
        if 'OK' == line.strip() or line.strip().startswith('FAILED') or line.strip().startswith('OK'):
            result_line = line.strip()
    
    # Find failing test names and errors (Python, Jest, Vitest, TypeScript compiler, Next.js)
    failing_tests = []
    error_lines = []
    current_test = ''
    in_traceback = False
    
    for line in lines:
        stripped = line.strip()
        # 1. Python unittest: "FAIL: test_name ..." or "ERROR: test_name ..."
        fail_match = re.match(r'^(FAIL|ERROR): (\S+)', line)
        if fail_match:
            current_test = line.strip()
            failing_tests.append(current_test)
            in_traceback = True
            continue
        
        # 2. Jest / Vitest: "FAIL src/App.test.tsx" or "✕ should do something"
        if stripped.startswith(('FAIL ', '✕ ', '× ')):
            failing_tests.append(stripped)
            continue

        # 3. TypeScript / Next.js / Vite build errors
        if any(keyword in stripped for keyword in [
            'Type error:', 'Failed to compile', 'SyntaxError:', '[vite]', 'TS2304:', 'TS2322:', 'TS2339:', 'TS2345:'
        ]):
            error_lines.append(stripped[:250])
            continue
        
        # Capture key Python error lines
        if in_traceback:
            if stripped.startswith(('AssertionError', 'AssertionError:', 
                                   'AttributeError', 'TypeError', 'NameError',
                                   'KeyError', 'ValueError', 'ImportError',
                                   'ModuleNotFoundError', 'IndexError',
                                   'FileNotFoundError', 'RuntimeError',
                                   'SyntaxError', 'IndentationError')):
                error_lines.append(stripped[:200])
                in_traceback = False
            elif stripped.startswith('----'):
                in_traceback = False
    
    # Build concise report
    parts = []
    if summary_line:
        parts.append(summary_line)
    if result_line:
        parts.append(f"Result: {result_line}")
    
    if result.returncode == 0:
        parts.insert(0, "TESTS PASSED")
    else:
        parts.insert(0, f"TESTS FAILED (exit code {result.returncode})")
        if failing_tests:
            parts.append(f"\nFailing tests ({len(failing_tests)}):")
            for i, test in enumerate(failing_tests[:10]):  # Limit to 10
                parts.append(f"  {i+1}. {test}")
                if i < len(error_lines):
                    parts.append(f"     → {error_lines[i]}")
            if len(failing_tests) > 10:
                parts.append(f"  ... and {len(failing_tests) - 10} more")
        elif error_lines:
            parts.append(f"\nError details ({len(error_lines)}):")
            for i, err in enumerate(error_lines[:10]):
                parts.append(f"  - {err}")
        else:
            # Fallback: show last few non-empty lines of output
            tail_lines = [l.strip() for l in lines if l.strip()][-8:]
            if tail_lines:
                parts.append("\nOutput summary:")
                parts.append('\n'.join(tail_lines))
    
    report = '\n'.join(parts)
    
    # Cap total output
    if len(report) > output_cap:
        report = report[:output_cap] + '\n... [TRUNCATED]'
    
    return report


def register_exec_tools(registry: ToolRegistry, project_root: str,
                        command_timeout: int = 30, output_cap: int = 10000,
                        test_command: str = ''):
    """Register command execution and test running tools."""
    
    def run_command_handler(command: str) -> str:
        return _run_command(command, project_root, command_timeout, output_cap)
    
    def run_tests_handler(command: str = '') -> str:
        cmd = command or test_command or f'{sys.executable} -m unittest discover -s . -p "test_*.py"'
        return _run_tests(cmd, project_root, timeout=command_timeout * 2, output_cap=output_cap)
    
    registry.register(ToolDef(
        name='run_command',
        description='Run an allowed shell command in the project directory. Only allowlisted commands can be run.',
        parameters={
            'type': 'object',
            'properties': {
                'command': {'type': 'string', 'description': 'The command to run (must be in the allowlist)'},
            },
            'required': ['command']
        },
        risk='execute',
        handler=run_command_handler,
    ))
    
    registry.register(ToolDef(
        name='run_tests',
        description='Run the project test suite. Returns only failing test names and key error lines, never the full log. Call with no arguments to use the default test command.',
        parameters={
            'type': 'object',
            'properties': {
                'command': {'type': 'string', 'description': 'Optional: custom test command. Leave empty for default.'},
            },
            'required': []
        },
        risk='execute',
        handler=run_tests_handler,
    ))
