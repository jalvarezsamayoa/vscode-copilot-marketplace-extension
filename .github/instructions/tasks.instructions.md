---
name: "Task Files"
description: "Task Files"
applyTo: tasks/**/task.md
---

# Task Files

The tasks should follow the following guidelines:

- Tasks should follow a strict TDD (Test-Driven Development) approach (Red, Green, Refactor).
- Task should use a feature branch.
- After creating the branch it should run tests and lint to get a baseline of the state of the codebase. The reports should be saved under tmp/
- The final subtask of each task should use git fixup to create a checkpoint commit.
- The task list should include final tasks section with:
  - Update the change log for unreleased changes
  - Commit the change log
  - Squash all commits in a non interactive way