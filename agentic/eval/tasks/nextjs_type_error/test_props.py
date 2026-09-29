"""Test suite verifying Next.js component props conformity."""
import unittest
import os
import re


class TestTypeScriptProps(unittest.TestCase):
    def setUp(self):
        self.page_path = os.path.join(os.path.dirname(__file__), "app", "page.tsx")
        with open(self.page_path, "r", encoding="utf-8") as f:
            self.content = f.read()

    def test_required_props_supplied(self):
        """Verify that UserCard invocation provides the required 'age' prop."""
        # Find UserCard invocation
        call_match = re.search(r'<UserCard\s+([^>]+)/>', self.content)
        self.assertIsNotNone(call_match, "UserCard invocation not found in app/page.tsx")
        props_str = call_match.group(1)

        self.assertIn(
            "age=", props_str,
            "UserCard is missing the required 'age' prop in app/page.tsx"
        )
        self.assertNotIn(
            "email=", props_str,
            "UserCard should not be passed undeclared 'email' prop in app/page.tsx"
        )


if __name__ == "__main__":
    unittest.main()
