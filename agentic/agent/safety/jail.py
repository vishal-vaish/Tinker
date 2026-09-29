"""
agent.safety.jail — Path Jail & Symlink Resolution

WHAT THIS FILE DOES:
- Resolves all file paths to absolute, canonical representations (resolving '..' and symlinks).
- Ensures that file read/write operations cannot escape the configured project root directory.
- Raises SecurityError if any path traversal or out-of-bounds access is attempted.
- Detects test files to enforce read-only test protection.
"""
import os

class SecurityError(Exception):
    """Raised when a security check fails."""
    pass

class PathJail:
    """Restricts file access to within a project root directory."""
    
    def __init__(self, project_root: str, test_patterns: list[str] | None = None):
        self.project_root = os.path.realpath(os.path.abspath(project_root))
        self.test_patterns = test_patterns or []

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
        """Check if a file is a test file across Python, React, Next.js, and web stacks."""
        norm = path.replace("\\", "/").lower()
        basename = os.path.basename(norm)

        # 1. Directory based
        if "/__tests__/" in norm or norm.startswith("__tests__/"):
            return True

        # 2. Python patterns
        if (basename.startswith("test_") and basename.endswith(".py")) or basename.endswith("_test.py"):
            return True

        # 3. JavaScript / TypeScript / React / Next.js patterns
        for ext in [".js", ".jsx", ".ts", ".tsx", ".mjs"]:
            if basename.endswith(f".test{ext}") or basename.endswith(f".spec{ext}"):
                return True

        # 4. Custom configured patterns
        import fnmatch
        for pat in self.test_patterns:
            if fnmatch.fnmatch(basename, pat) or fnmatch.fnmatch(norm, pat):
                return True

        return False
    
    def relative(self, path: str) -> str:
        """Return the path relative to project root."""
        return os.path.relpath(path, self.project_root)
