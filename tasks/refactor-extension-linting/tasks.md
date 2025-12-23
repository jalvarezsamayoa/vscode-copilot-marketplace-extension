# Task List: Refactor src/extension.ts to Fix Linting Issues

## Relevant Files

- `tasks/refactor-extension-linting/prd.md` - The PRD document that outlines the refactoring requirements and code complexity constraints.
- `src/extension.ts` - Main extension file containing command registration and handlers that need refactoring.
- `src/services/marketplaceService.ts` - Service layer that handles marketplace operations (referenced by handlers).
- `src/test/suite/extension.test.ts` - Unit tests for extension commands and handlers.

### Notes

- This is a refactoring task with NO new functionality added. All existing tests must continue to pass.
- All code changes must comply with ESLint rules enforced by `eslint.config.mjs`:
  - Max 30 lines per function (excluding blank lines and comments)
  - Max cyclomatic complexity of 5
  - Max nesting depth of 3
  - Max 3 parameters per function
- Use `npm run lint` to verify compliance after refactoring.
- Use `npm test` to validate behavior preservation after each major change.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this refactoring (e.g., `git checkout -b refactor/extension-linting`)

- [x] 1.0 Establish baseline and understand current structure
  - [x] 1.1 Run `npm test` to establish baseline (all tests should pass)
  - [x] 1.2 Run `npm run lint` to confirm current violations in extension.ts
  - [x] 1.3 Read and understand the current `src/extension.ts` implementation (lines 1-171)
  - [x] 1.4 Review `src/services/marketplaceService.ts` to understand service layer patterns
  - [x] 1.5 Review existing test file `src/test/suite/extension.test.ts` to understand expected behavior

- [x] 2.0 Extract marketplace command handlers
  - [x] 2.1 Extract `handleListMarketplace()` handler function (lines 17-32)
  - [x] 2.2 Extract `handleAddMarketplace()` handler function (lines 35-60) with async logic
  - [x] 2.3 Extract `handleRemoveMarketplace()` handler function (lines 62-104) with confirmation logic
  - [x] 2.4 Extract `handleUpdateMarketplace()` handler function (lines 106-139) with special error handling
  - [x] 2.5 Verify all marketplace handlers are ≤ 30 lines each
  - [x] 2.6 Run `npm test` after extracting marketplace handlers to ensure behavior preservation

- [x] 3.0 Create helper functions for repeated logic
  - [x] 3.1 Create `_selectMarketplaceFromUser()` helper function for marketplace selection
  - [x] 3.2 Create `_selectMarketplaceWithRemovalWarning()` helper if needed for remove confirmation flow
  - [x] 3.3 Create `_getMarketplaceInput()` helper for input box prompts
  - [x] 3.4 Create `_performAddMarketplace()` helper for add operation with progress UI
  - [x] 3.5 Create `_performRemoval()` helper for removal operation
  - [x] 3.6 Create `_performUpdateMarketplace()` helper for update operation with progress UI
  - [x] 3.7 Verify all helper functions use underscore prefix (`_functionName()`)
  - [x] 3.8 Run `npm test` after creating helper functions

- [x] 4.0 Extract plugin command handlers and simplify activate()
  - [x] 4.1 Extract `handleListPlugins()` handler function (stub implementation)
  - [x] 4.2 Extract `handleAddPlugin()` handler function (stub implementation)
  - [x] 4.3 Extract `handleRemovePlugin()` handler function (stub implementation)
  - [x] 4.4 Refactor `activate()` function to only contain command registration (target: 10-15 lines)
  - [x] 4.5 Ensure `activate()` uses command registration pattern: `vscode.commands.registerCommand(commandId, handler)`
  - [x] 4.6 Push all disposables to `context.subscriptions` array
  - [x] 4.7 Run `npm test` after refactoring activate() function

- [x] 5.0 Validate refactoring and commit changes
  - [x] 5.1 Run `npm run lint` to verify zero ESLint violations
  - [x] 5.2 Run `npm test` to verify all tests pass
  - [x] 5.3 Verify `activate()` function is ≤ 30 lines
  - [x] 5.4 Verify all handler functions are ≤ 30 lines
  - [x] 5.5 Verify all helper functions use underscore prefix
  - [x] 5.6 Verify error handling patterns are preserved (try-catch blocks, error messages)
  - [x] 5.7 Verify special case for `NOT_A_GIT_REPO` error in `updateMarketplace` is preserved
  - [x] 5.8 Verify UI patterns are unchanged (QuickPick, InputBox, Progress, messages)
  - [x] 5.9 Verify no behavior changes from user perspective
  - [ ] 5.10 Stage and commit changes with message: "refactor: break down activate function to comply with max-lines-per-function"
  - [ ] 5.11 Push branch to remote

## Implementation Notes

- **Early Returns**: Use early returns and guard clauses to eliminate deep nesting and keep functions under the line limit.
- **Async Decision**: Only mark functions as async if they contain `await` calls. Example: `handleListPlugins()` is sync; `handleAddMarketplace()` is async.
- **Error Handling**: Preserve all existing error handling patterns including `error instanceof Error ? error.message : String(error)` formatting.
- **No Service Changes**: Do NOT modify `MarketplaceService` or add new service methods. Handler functions should only orchestrate UI and existing service calls.
- **Single File**: Keep all handler and helper functions in `src/extension.ts`. Do NOT create separate files or directories.
- **Test Compatibility**: The refactoring is internal only. Existing tests should NOT require modification since behavior is preserved.
