"""Test suite verifying DOM and script synchronization."""
import unittest
import os
import re


class TestDOMBinding(unittest.TestCase):
    def setUp(self):
        self.base_dir = os.path.dirname(__file__)
        with open(os.path.join(self.base_dir, "index.html"), "r", encoding="utf-8") as f:
            self.html = f.read()
        with open(os.path.join(self.base_dir, "app.js"), "r", encoding="utf-8") as f:
            self.js = f.read()

    def test_submit_button_id_synchronized(self):
        """Verify the button ID in index.html matches the getElementById call in app.js."""
        # Find button ID in index.html
        btn_match = re.search(r'<button\s+id=["\']([^"\']+)["\']', self.html)
        self.assertIsNotNone(btn_match, "Button element with id attribute not found in index.html")
        btn_id = btn_match.group(1)

        # Find target ID in app.js
        js_match = re.search(r'getElementById\(["\']([^"\']+)["\']\)', self.js)
        self.assertIsNotNone(js_match, "document.getElementById call not found in app.js")
        js_id = js_match.group(1)

        self.assertEqual(
            btn_id, js_id,
            f"ID mismatch: index.html defines button id='{btn_id}' but app.js queries '{js_id}'"
        )


if __name__ == "__main__":
    unittest.main()
