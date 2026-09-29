import os

class SecurityError(Exception):
    """Raised when a security check fails."""
    pass

class PathJail:
    """Restricts file access to within a project root directory."""
    
    def __init__(self, project_root: str):
        self.project_root = os.path.realpath(os.path.abspath(project_root))
    
    def check(self, path: str) -> str:
        """
        Validate that a path is inside the project root.
        Resolves relative paths, '..', and symlinks before checking.
        
        Args:
            path: Relative or absolute path to check
            
        Returns:
            Resolved absolute path (safe to use)
            
        Raises:
            SecurityError: If path is outside the project root
        """
        # Resolve relative to project root
        if not os.path.isabs(path):
            resolved = os.path.realpath(os.path.join(self.project_root, path))
        else:
            resolved = os.path.realpath(path)
        
        # Check if resolved path is inside project root
        # Use os.path.commonpath or startswith with trailing separator
        if not (resolved == self.project_root or 
                resolved.startswith(self.project_root + os.sep)):
            raise SecurityError(
                f"Access denied: '{path}' resolves to '{resolved}' "
                f"which is outside project root '{self.project_root}'"
            )
        
        return resolved
    
    def is_test_file(self, path: str) -> bool:
        """Check if a file is a test file (matches test_*.py or *_test.py)."""
        basename = os.path.basename(path).lower()
        return (
            basename.startswith('test_') and basename.endswith('.py')
        ) or (
            basename.endswith('_test.py')
        )
    
    def relative(self, path: str) -> str:
        """Return the path relative to project root."""
        return os.path.relpath(path, self.project_root)
