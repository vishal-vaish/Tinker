import unittest
from math_utils import sum_range


class TestMathUtils(unittest.TestCase):
    def test_sum_range_multiple_numbers(self):
        self.assertEqual(sum_range(1, 5), 15)

    def test_sum_range_single_zero(self):
        self.assertEqual(sum_range(0, 0), 0)

    def test_sum_range_single_number(self):
        self.assertEqual(sum_range(3, 3), 3)


if __name__ == "__main__":
    unittest.main()
