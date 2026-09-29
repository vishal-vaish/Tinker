"""
Phase 1 Acceptance Test Script
Applies the documented fix for each sample project, runs unittest,
verifies it passes, then reverts to the buggy version.
"""
import subprocess
import os
import shutil
import sys

BASE = r"e:\vishal\Tinker\agentic\eval\tasks"

# Define projects: (name, file_to_fix, buggy_content, fixed_content)
PROJECTS = [
    (
        "off_by_one",
        "math_utils.py",
        # BUGGY
        '''def sum_range(start: int, end: int) -> int:
    """Return the sum of all integers from start to end (inclusive)."""
    total = 0
    for num in range(start, end):
        total += num
    return total
''',
        # FIXED
        '''def sum_range(start: int, end: int) -> int:
    """Return the sum of all integers from start to end (inclusive)."""
    total = 0
    for num in range(start, end + 1):
        total += num
    return total
''',
    ),
    (
        "missing_function",
        "string_helpers.py",
        # BUGGY
        '''"""String helper utility functions."""


def capitalize_first(s: str) -> str:
    """Capitalize the first letter of a string."""
    if not s:
        return ""
    return s[0].upper() + s[1:]
''',
        # FIXED
        '''"""String helper utility functions."""


def capitalize_first(s: str) -> str:
    """Capitalize the first letter of a string."""
    if not s:
        return ""
    return s[0].upper() + s[1:]


def reverse_words(s: str) -> str:
    """Reverse the order of words in a string."""
    return " ".join(s.split()[::-1])
''',
    ),
    (
        "wrong_import",
        "converter.py",
        # BUGGY
        '''def celsius_to_fahrenheit(c: float) -> float:
    """Convert Celsius temperature to Fahrenheit."""
    return c * 9 / 5 + offset
''',
        # FIXED
        '''def celsius_to_fahrenheit(c: float) -> float:
    """Convert Celsius temperature to Fahrenheit."""
    return c * 9 / 5 + 32
''',
    ),
    (
        "small_feature",
        "calculator.py",
        # BUGGY
        '''class Calculator:
    """A basic arithmetic calculator."""

    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b
''',
        # FIXED
        '''class Calculator:
    """A basic arithmetic calculator."""

    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b

    def modulo(self, a, b):
        return a % b
''',
    ),
    (
        "cross_file_bug",
        "formatter.py",
        # BUGGY
        '''from data_loader import load_records


def format_report(filepath):
    records = load_records()
    lines = []
    for record in records:
        lines.append(f"{record['name']}: {record['grade']}")
    return "\\n".join(lines)
''',
        # FIXED
        '''from data_loader import load_records


def format_report(filepath):
    records = load_records(filepath)
    lines = []
    for record in records:
        lines.append(f"{record['name']}: {record['score']}")
    return "\\n".join(lines)
''',
    ),
]


def run_tests(project_dir):
    """Run unittest in the project directory. Returns (returncode, output)."""
    result = subprocess.run(
        [sys.executable, "-m", "unittest", "discover", "-s", ".", "-p", "test_*.py"],
        cwd=project_dir,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.returncode, result.stdout + result.stderr


def main():
    print("=" * 70)
    print("PHASE 1 ACCEPTANCE TEST — Apply Fix → Run Tests → Revert")
    print("=" * 70)
    
    all_passed = True
    results = []

    for name, fix_file, buggy, fixed in PROJECTS:
        project_dir = os.path.join(BASE, name)
        filepath = os.path.join(project_dir, fix_file)
        print(f"\n{'─' * 50}")
        print(f"📁 Project: {name}")
        print(f"{'─' * 50}")

        # Step 1: Confirm tests FAIL with buggy code
        print("  🔴 Testing BUGGY version...")
        code, output = run_tests(project_dir)
        if code == 0:
            print(f"  ❌ UNEXPECTED: Tests PASS with buggy code!")
            all_passed = False
            results.append((name, "FAIL", "Tests pass with buggy code"))
            continue
        # Count failures
        fail_line = [l for l in output.split('\n') if 'Ran' in l]
        print(f"  ✓ Tests fail as expected: {fail_line[0].strip() if fail_line else 'yes'}")

        # Step 2: Apply fix
        print(f"  🔧 Applying fix to {fix_file}...")
        with open(filepath, 'w') as f:
            f.write(fixed)

        # Clear pycache
        cache_dir = os.path.join(project_dir, "__pycache__")
        if os.path.exists(cache_dir):
            shutil.rmtree(cache_dir)

        # Step 3: Run tests with fix
        print("  🟢 Testing FIXED version...")
        code, output = run_tests(project_dir)
        if code == 0:
            ok_line = [l for l in output.split('\n') if 'Ran' in l or 'OK' in l]
            print(f"  ✅ PASS: {' | '.join(l.strip() for l in ok_line)}")
            results.append((name, "PASS", "Fix verified"))
        else:
            print(f"  ❌ FAIL: Tests still fail after fix!")
            print(f"     {output[-200:]}")
            all_passed = False
            results.append((name, "FAIL", "Fix didn't work"))

        # Step 4: Revert to buggy
        print(f"  ↩️  Reverting {fix_file} to buggy version...")
        with open(filepath, 'w') as f:
            f.write(buggy)

        # Clear pycache again
        if os.path.exists(cache_dir):
            shutil.rmtree(cache_dir)

    # Summary
    print(f"\n{'=' * 70}")
    print("RESULTS SUMMARY")
    print(f"{'=' * 70}")
    print(f"{'Project':<25} {'Result':<10} {'Details'}")
    print(f"{'─' * 25} {'─' * 10} {'─' * 30}")
    for name, result, detail in results:
        emoji = "✅" if result == "PASS" else "❌"
        print(f"{emoji} {name:<23} {result:<10} {detail}")
    
    print(f"\n{'=' * 70}")
    if all_passed:
        print("🎉 ALL PROJECTS VERIFIED — Phase 1 acceptance PASSED")
    else:
        print("⚠️  SOME PROJECTS FAILED — Phase 1 needs fixes")
    print(f"{'=' * 70}")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
