import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))

from converter import celsius_to_fahrenheit


class TestConverter(unittest.TestCase):
    def test_celsius_to_fahrenheit_zero(self):
        self.assertEqual(celsius_to_fahrenheit(0), 32.0)

    def test_celsius_to_fahrenheit_boiling(self):
        self.assertEqual(celsius_to_fahrenheit(100), 212.0)

    def test_celsius_to_fahrenheit_negative_forty(self):
        self.assertEqual(celsius_to_fahrenheit(-40), -40.0)


if __name__ == "__main__":
    unittest.main()
