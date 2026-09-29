# Phase 1 Plan: Sample Projects with Failing Tests

## Objective
Create 5 tiny Python projects under `eval/tasks/` that serve as the test bed for the entire agent. Each has intentional bugs, correct unittest suites, a task description, and a documented fix.

## Tasks

### Wave 1 (parallel — no dependencies between projects)

#### Task 1.1: `off_by_one` project
- `math_utils.py` — a function with an off-by-one error (e.g., `range(1, n)` instead of `range(1, n+1)`)
- `test_math_utils.py` — correct tests that catch the bug
- `task.txt` — "Fix the off-by-one error in the sum_range function"

#### Task 1.2: `missing_function` project
- `string_helpers.py` — module missing a function that tests import
- `test_string_helpers.py` — tests for the missing function
- `task.txt` — "Implement the missing reverse_words function in string_helpers.py"

#### Task 1.3: `wrong_import` project
- `converter.py` — has a NameError (wrong variable/function name or bad import)
- `test_converter.py` — correct tests that trigger the error
- `task.txt` — "Fix the NameError in converter.py"

#### Task 1.4: `small_feature` project
- `calculator.py` — calculator class missing a method
- `test_calculator.py` — tests already written for the unimplemented method
- `task.txt` — "Implement the modulo method in the Calculator class"

#### Task 1.5: `cross_file_bug` project
- `data_loader.py` — loads data correctly
- `formatter.py` — calls data_loader with wrong arguments or wrong key
- `test_pipeline.py` — tests the pipeline end-to-end
- `task.txt` — "Fix the argument mismatch between formatter.py and data_loader.py"

### Wave 2 (sequential — after all projects created)

#### Task 1.6: Verification
- Run `python -m unittest` in each project → confirm all fail
- Apply documented fix to each → confirm all pass
- Produce acceptance table

## Acceptance Criteria
- [ ] Each project's tests FAIL before fix
- [ ] Each project's tests PASS after documented fix
- [ ] Acceptance table with project, failing test(s), and fix produced

## Estimated Files
15-20 files across 5 project directories
