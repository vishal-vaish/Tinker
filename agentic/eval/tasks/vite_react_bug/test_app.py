"""Test suite verifying React component state hooks in App.jsx."""
import unittest
import os
import re


class TestReactComponent(unittest.TestCase):
    def setUp(self):
        self.app_path = os.path.join(os.path.dirname(__file__), "src", "App.jsx")
        with open(self.app_path, "r", encoding="utf-8") as f:
            self.content = f.read()

    def test_state_setter_consistency(self):
        """Verify the useState setter name matches all update calls."""
        # Find useState hook declaration: const [count, setCount] = useState(...)
        hook_match = re.search(r'const\s*\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=\s*useState', self.content)
        self.assertIsNotNone(hook_match, "useState hook declaration not found in App.jsx")
        state_var, setter_var = hook_match.group(1), hook_match.group(2)

        # Check for calls like setCounter(...) when setter_var is setCount
        calls = re.findall(r'(\bset\w+)\s*\(', self.content)
        for call in calls:
            self.assertEqual(
                call, setter_var,
                f"State setter mismatch: declared '{setter_var}' but called undefined '{call}' in App.jsx"
            )

    def test_default_export_exists(self):
        """Verify default export App is present."""
        self.assertTrue(
            "export default function App" in self.content or "export default App" in self.content,
            "Default export for App component not found in App.jsx"
        )


if __name__ == "__main__":
    unittest.main()
