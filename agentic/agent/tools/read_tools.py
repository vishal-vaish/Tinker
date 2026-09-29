import os
import re
from agent.tools.registry import ToolDef, ToolRegistry

def _list_files(path: str = '.', project_root: str = '') -> str:
    """List files in a directory inside the project root."""
    # Resolve path relative to project_root
    if not os.path.isabs(path):
        full_path = os.path.normpath(os.path.join(project_root, path))
    else:
        full_path = os.path.normpath(path)
    
    # Basic jail check (full sandbox comes in Phase 4)
    real_path = os.path.realpath(full_path)
    real_root = os.path.realpath(project_root)
    if not real_path.startswith(real_root):
        return f"ERROR: Path '{path}' is outside the project root."
    
    if not os.path.isdir(full_path):
        return f"ERROR: '{path}' is not a directory."
    
    entries = []
    try:
        for entry in sorted(os.listdir(full_path)):
            entry_path = os.path.join(full_path, entry)
            if os.path.isdir(entry_path):
                entries.append(f"  📁 {entry}/")
            else:
                size = os.path.getsize(entry_path)
                entries.append(f"  📄 {entry} ({size} bytes)")
    except PermissionError:
        return f"ERROR: Permission denied for '{path}'."
    
    rel = os.path.relpath(full_path, project_root)
    header = f"Directory: {rel}/ ({len(entries)} items)"
    if not entries:
        return f"{header}\n  (empty)"
    # Limit to 50 entries
    if len(entries) > 50:
        shown = entries[:50]
        shown.append(f"  ... and {len(entries) - 50} more items (use a subdirectory)")
        entries = shown
    return header + '\n' + '\n'.join(entries)


def _read_file(path: str, start_line: int = 1, end_line: int = 0, 
               project_root: str = '') -> str:
    """Read a file with optional line range. Limits output size."""
    if not os.path.isabs(path):
        full_path = os.path.normpath(os.path.join(project_root, path))
    else:
        full_path = os.path.normpath(path)
    
    # Basic jail check
    real_path = os.path.realpath(full_path)
    real_root = os.path.realpath(project_root)
    if not real_path.startswith(real_root):
        return f"ERROR: Path '{path}' is outside the project root."
    
    if not os.path.isfile(full_path):
        return f"ERROR: '{path}' is not a file."
    
    # Size check
    size = os.path.getsize(full_path)
    if size > 100_000:
        return f"ERROR: File too large ({size} bytes). Use line ranges to read portions."
    
    try:
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
    except PermissionError:
        return f"ERROR: Permission denied for '{path}'."
    
    total_lines = len(lines)
    
    # Apply line range
    start = max(1, start_line) - 1  # Convert to 0-indexed
    end = end_line if end_line > 0 else total_lines
    end = min(end, total_lines)
    
    selected = lines[start:end]
    
    # Limit output
    MAX_OUTPUT = 8000  # characters
    content = ''.join(selected)
    truncated = False
    if len(content) > MAX_OUTPUT:
        content = content[:MAX_OUTPUT]
        truncated = True
    
    rel = os.path.relpath(full_path, project_root)
    header = f"File: {rel} (lines {start+1}-{end} of {total_lines})"
    result = header + '\n' + content
    if truncated:
        result += '\n... [TRUNCATED — use line ranges to see more]'
    return result


def _search_text(pattern: str, path: str = '.', project_root: str = '') -> str:
    """Search for a pattern across project files. Returns matching lines."""
    if not os.path.isabs(path):
        search_dir = os.path.normpath(os.path.join(project_root, path))
    else:
        search_dir = os.path.normpath(path)
    
    # Basic jail check
    real_path = os.path.realpath(search_dir)
    real_root = os.path.realpath(project_root)
    if not real_path.startswith(real_root):
        return f"ERROR: Path '{path}' is outside the project root."
    
    matches = []
    MAX_MATCHES = 30
    
    try:
        regex = re.compile(pattern, re.IGNORECASE)
    except re.error as e:
        # Fall back to literal search
        regex = re.compile(re.escape(pattern), re.IGNORECASE)
    
    for root, dirs, files in os.walk(search_dir):
        # Skip hidden dirs and __pycache__
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
        for fname in sorted(files):
            if not fname.endswith(('.py', '.txt', '.md', '.toml', '.json', '.cfg', '.ini', '.yaml', '.yml')):
                continue
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
                    for i, line in enumerate(f, 1):
                        if regex.search(line):
                            rel = os.path.relpath(fpath, project_root)
                            matches.append(f"  {rel}:{i}: {line.rstrip()[:120]}")
                            if len(matches) >= MAX_MATCHES:
                                break
            except (PermissionError, OSError):
                continue
            if len(matches) >= MAX_MATCHES:
                break
        if len(matches) >= MAX_MATCHES:
            break
    
    if not matches:
        return f"No matches found for '{pattern}'."
    
    result = f"Search: '{pattern}' ({len(matches)} matches"
    if len(matches) >= MAX_MATCHES:
        result += ', showing first 30'
    result += ')\n' + '\n'.join(matches)
    return result


def _finish(summary: str, **kwargs) -> str:
    """Declare task completion with a summary."""
    return f"FINISH: {summary}"


def register_read_tools(registry: ToolRegistry, project_root: str):
    """Register all read-only tools and the finish tool with the registry."""
    
    # Bind project_root into each handler using closures
    def list_files_handler(path: str = '.') -> str:
        return _list_files(path, project_root)
    
    def read_file_handler(path: str, start_line: int = 1, end_line: int = 0) -> str:
        return _read_file(path, start_line, end_line, project_root)
    
    def search_text_handler(pattern: str, path: str = '.') -> str:
        return _search_text(pattern, path, project_root)
    
    def finish_handler(summary: str) -> str:
        return _finish(summary)
    
    registry.register(ToolDef(
        name='list_files',
        description='List files and directories in a path within the project. Returns names, types, and sizes.',
        parameters={
            'type': 'object',
            'properties': {
                'path': {'type': 'string', 'description': 'Directory path relative to project root. Defaults to "."'}
            },
            'required': []
        },
        risk='read',
        handler=list_files_handler,
    ))
    
    registry.register(ToolDef(
        name='read_file',
        description="Read a file's contents. Use start_line/end_line to read specific portions. Never loads the entire project.",
        parameters={
            'type': 'object',
            'properties': {
                'path': {'type': 'string', 'description': 'File path relative to project root'},
                'start_line': {'type': 'integer', 'description': 'First line to read (1-indexed, default 1)'},
                'end_line': {'type': 'integer', 'description': 'Last line to read (0 = end of file)'},
            },
            'required': ['path']
        },
        risk='read',
        handler=read_file_handler,
    ))
    
    registry.register(ToolDef(
        name='search_text',
        description='Search for a text pattern (regex supported) across project files. Returns matching file:line:content.',
        parameters={
            'type': 'object',
            'properties': {
                'pattern': {'type': 'string', 'description': 'Search pattern (regex or plain text)'},
                'path': {'type': 'string', 'description': 'Directory to search in, relative to project root. Defaults to "."'},
            },
            'required': ['pattern']
        },
        risk='read',
        handler=search_text_handler,
    ))
    
    registry.register(ToolDef(
        name='finish',
        description='Declare that the task is complete. Provide a summary of what was found or accomplished.',
        parameters={
            'type': 'object',
            'properties': {
                'summary': {'type': 'string', 'description': 'A summary of what was found or done'},
            },
            'required': ['summary']
        },
        risk='control',
        handler=finish_handler,
    ))
