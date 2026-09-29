"""
eval package — Evaluation Benchmark Harness & Testbed

WHAT THIS PACKAGE CONTAINS:
- runner.py: Automated benchmark runner that executes the agent over all sample tasks and writes results to SQLite.
- test_core_modules.py: 17 self-contained unit tests covering all safety, tool, plan, context, and report logic.
- test_phase1_acceptance.py: Verifies intentional bugs in tasks and checks that manual fixes pass.
- tasks/: Directory containing 5 sample bug tasks with unittest suites.
"""
