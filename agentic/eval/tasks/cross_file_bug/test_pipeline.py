import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from data_loader import load_records
from formatter import format_report


class TestPipeline(unittest.TestCase):

    def test_load_records(self):
        records = load_records("scores.csv")
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["name"], "Alice")
        self.assertEqual(records[0]["score"], 90)
        self.assertEqual(records[1]["name"], "Bob")
        self.assertEqual(records[1]["score"], 85)

    def test_format_report(self):
        report = format_report("scores.csv")
        self.assertIn("Alice", report)
        self.assertIn("90", report)
        self.assertIn("Bob", report)
        self.assertIn("85", report)


if __name__ == "__main__":
    unittest.main()
