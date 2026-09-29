import os
from agent.tools.registry import ToolDef, ToolRegistry


def _edit_file(path: str, old_string: str, new_string: str, project_root: str = '') -> str:
    """
    Replace a UNIQUE string in a file.
    Fails if:
    - old_string is not found in the file
    - old_string appears more than once
    - path is outside the jail (basic check)
    """
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
        return f"ERROR: File '{path}' does not exist."
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except PermissionError:
        return f"ERROR: Permission denied for '{path}'."
    
    # Check uniqueness
    count = content.count(old_string)
    if count == 0:
        return f"ERROR: String not found in '{path}'. Make sure you copy the exact string including whitespace."
    if count > 1:
        return f"ERROR: String appears {count} times in '{path}'. It must be unique (appear exactly once)."
    
    # Apply edit
    new_content = content.replace(old_string, new_string, 1)
    
    try:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
    except PermissionError:
        return f"ERROR: Permission denied writing to '{path}'."
    
    # Report what changed
    rel = os.path.relpath(full_path, project_root)
    old_lines = old_string.count('\n') + 1
    new_lines = new_string.count('\n') + 1
    return f"OK: Edited '{rel}' — replaced {old_lines} line(s) with {new_lines} line(s)."


def _create_file(path: str, content: str, project_root: str = '') -> str:
    """
    Create a new file. Fails if it already exists.
    """
    if not os.path.isabs(path):
        full_path = os.path.normpath(os.path.join(project_root, path))
    else:
        full_path = os.path.normpath(path)
    
    # Basic jail check
    real_path = os.path.realpath(full_path)
    real_root = os.path.realpath(project_root)
    if not real_path.startswith(real_root):
        return f"ERROR: Path '{path}' is outside the project root."
    
    if os.path.exists(full_path):
        return f"ERROR: File '{path}' already exists. Use edit_file to modify it."
    
    # Create parent directories if needed
    parent = os.path.dirname(full_path)
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)
    
    try:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except PermissionError:
        return f"ERROR: Permission denied creating '{path}'."
    
    rel = os.path.relpath(full_path, project_root)
    lines = content.count('\n') + 1
    return f"OK: Created '{rel}' ({lines} lines)."


def register_write_tools(registry: ToolRegistry, project_root: str):
    """Register file editing and creation tools."""
    
    def edit_file_handler(path: str, old_string: str, new_string: str) -> str:
        return _edit_file(path, old_string, new_string, project_root)
    
    def create_file_handler(path: str, content: str) -> str:
        return _create_file(path, content, project_root)
    
    registry.register(ToolDef(
        name='edit_file',
        description='Replace a UNIQUE string in a file with a new string. The old_string must appear exactly once in the file. Include enough context (surrounding lines) to make the match unique.',
        parameters={
            'type': 'object',
            'properties': {
                'path': {'type': 'string', 'description': 'File path relative to project root'},
                'old_string': {'type': 'string', 'description': 'The exact string to find and replace (must appear exactly once)'},
                'new_string': {'type': 'string', 'description': 'The replacement string'},
            },
            'required': ['path', 'old_string', 'new_string']
        },
        risk='write',
        handler=edit_file_handler,
    ))
    
    registry.register(ToolDef(
        name='create_file',
        description='Create a new file with the given content. Fails if the file already exists.',
        parameters={
            'type': 'object',
            'properties': {
                'path': {'type': 'string', 'description': 'File path relative to project root'},
                'content': {'type': 'string', 'description': 'Content to write to the file'},
            },
            'required': ['path', 'content']
        },
        risk='write',
        handler=create_file_handler,
    ))
