"""Unit tests for string helper utilities."""

import unittest
import string_helpers


class TestStringHelpers(unittest.TestCase):
    def test_capitalize_first(self):
        self.assertEqual(string_helpers.capitalize_first("hello"), "Hello")
        self.assertEqual(string_helpers.capitalize_first("world"), "World")
        self.assertEqual(string_helpers.capitalize_first(""), "")
        self.assertEqual(string_helpers.capitalize_first("a"), "A")

    def test_reverse_words(self):
        self.assertEqual(string_helpers.reverse_words("hello world"), "world hello")
        self.assertEqual(string_helpers.reverse_words("the quick brown fox"), "fox brown quick the")
        self.assertEqual(string_helpers.reverse_words("single"), "single")
        self.assertEqual(string_helpers.reverse_words(""), "")


if __name__ == "__main__":
    unittest.main()
