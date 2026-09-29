def sum_range(start: int, end: int) -> int:
    """Return the sum of all integers from start to end (inclusive)."""
    total = 0
    for num in range(start, end):
        total += num
    return total
