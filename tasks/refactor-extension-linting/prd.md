# Product Requirements Document: Refactor src/extension.ts to Fix Linting Issues

## 1. Introduction/Overview

The `src/extension.ts` file currently violates ESLint's max-lines-per-function rule. The `activate()` function contains 122 lines, and the `removeMarketplace` command handler contains 36 lines, both exceeding the 30-line maximum. This refactoring will break down these large functions into smaller, focused functions while maintaining full functionality and ensuring all tests continue to pass.

**Goal**: Extract command handlers into separate, testable functions that comply with the project's strict ESLint complexity rules.

---

## 2. Codebase Context

### Similar Existing Features

The current `src/extension.ts` implements command registration following the VS Code extension pattern:

- **Lines 17-32**: `listMarketplace` command (good pattern, ~16 lines)
- **Lines 35-60**: `addMarketplace` command (violates rule, 26 lines + async handler is 36 lines)
- **Lines 62-104**: `removeMarketplace` command (violates rule, 36 lines inline)
- **Lines 106-139**: `updateMarketplace` command (violates rule, 34 lines inline)
- **Lines 141-157**: Plugin commands (stub implementations, ~5-7 lines each)

### Patterns to Follow

1. **Command Registration Pattern** (existing in `src/extension.ts`):
   - Register commands with `vscode.commands.registerCommand()`
   - Push disposables to `context.subscriptions`
   - This pattern should NOT change

2. **Async Operation Pattern** (from `addMarketplace` at lines 46-60):
   - Use `vscode.window.withProgress()` for long-running operations
   - Extract async logic into separate functions to maintain readability

3. **Error Handling Pattern** (existing throughout):
   - Use try-catch blocks in async handlers
   - Display error messages with `vscode.window.showErrorMessage()`
   - Use `error instanceof Error ? error.message : String(error)` for type-safe error handling

4. **Service Architecture** (from `src/services/marketplaceService.ts`):
   - All business logic delegates to `MarketplaceService`
   - Extension.ts should only handle UI orchestration

### Reusable Components

- `MarketplaceService` - Already handles marketplace operations (add, remove, update, get)
- VS Code API utilities - QuickPick, InputBox, Progress, Window messages

### Naming Conventions

- Handler functions should be named with verb-first pattern: `handleAddMarketplace`, `handleRemoveMarketplace`, etc.
- File names use kebab-case: already named `extension.ts` (appropriate)
- Method/function names use camelCase (existing pattern)
- **REQUIRED**: Helper/internal functions MUST use underscore prefix for clarity: `_selectMarketplace()`, `_performRemoval()`, etc. This distinguishes internal functions from public handlers

---

## 3. Goals

1. Reduce `activate()` function from 122 lines to under 30 lines by extracting command handlers
2. Ensure all command handler functions are under 30 lines each
3. Maintain 100% functional parity - all commands work identically before and after refactoring
4. Pass `npm run lint` with zero violations
5. All existing tests continue to pass
6. Code remains readable and follows DRY principles

---

## 4. User Stories

As a **maintainer**, I want the `src/extension.ts` file to comply with ESLint rules so that:
- The codebase maintains consistent code quality standards across all files
- New developers can easily understand the extension activation flow
- Functions remain testable and focused on single responsibilities
- CI/CD pipelines pass without linting warnings

---

## 5. Functional Requirements

1. **Extract Command Handlers**: Create separate handler functions for each marketplace command:
   - `handleListMarketplace()` - query and display marketplaces (if not already compliant)
   - `handleAddMarketplace()` - add a new marketplace with progress UI
   - `handleRemoveMarketplace()` - remove marketplace with confirmation
   - `handleUpdateMarketplace()` - update marketplace with progress UI

2. **Create Helper Functions**: Extract repeated logic into reusable helpers with underscore prefix:
   - `_selectMarketplaceFromUser(marketplaces: QuickPickItem[])` - standardized marketplace selection
   - `_selectMarketplaceWithRemovalWarning(marketplaces: QuickPickItem[])` - marketplace selection with confirmation
   - Any other common patterns identified during refactoring

3. **Extract Plugin Command Handlers**: Create separate functions for plugin commands:
   - `handleListPlugins()`
   - `handleAddPlugin()`
   - `handleRemovePlugin()`

4. **Simplify activate() Function**: Reduce to approximately:

   ```typescript
   export function activate(context: vscode.ExtensionContext) {
     // Command registration only - max 10-15 lines
     context.subscriptions.push(
       vscode.commands.registerCommand('...', handleListMarketplace),
       vscode.commands.registerCommand('...', handleAddMarketplace),
       // ... remaining commands
     );
   }
   ```

5. **Maintain Error Handling**: All error handling patterns must be preserved:
   - Try-catch blocks in async handlers
   - User-friendly error messages via `vscode.window.showErrorMessage()`
   - Special handling for `NOT_A_GIT_REPO` errors in `updateMarketplace`

6. **Preserve UI Patterns**: Keep all existing UI patterns:
   - QuickPick for marketplace selection
   - InputBox for git URL/path entry
   - Progress notifications for async operations
   - Success/error message display

---

## 6. Technical Implementation Guidance

### 6.1 Code Complexity Constraints

ALL refactored code MUST satisfy these ESLint rules (enforced by `eslint.config.mjs`):

- **Max Lines Per Function**: 30 lines (excluding blank lines and comments)
- **Cyclomatic Complexity**: Maximum 5 per function
- **Max Nesting Depth**: Maximum 3 levels
- **Max Parameters**: Maximum 3 per function

**Key Implementation Strategies**:

1. **For `handleRemoveMarketplace()` (currently 36 lines)**:
   - Extract marketplace selection into `_selectMarketplaceToRemove()` helper
   - Extract confirmation dialog into `_confirmRemoval(marketplace)` helper
   - Extract removal logic into `_performRemoval(marketplace)` helper
   - Use early returns to reduce nesting

2. **For `handleAddMarketplace()` (currently async with 36 lines)**:
   - Extract input prompt into `_getMarketplaceInput()` helper
   - Extract progress operation into `_performAddMarketplace(input)` helper
   - Each function should handle one concern

3. **For `handleUpdateMarketplace()` (currently 34 lines)**:
   - Extract marketplace selection into `_selectMarketplaceToUpdate()` helper
   - Extract progress operation into `_performUpdateMarketplace(marketplace)` helper

4. **Guard Clauses & Early Returns**:
   - Use early returns to eliminate deep nesting
   - Example: Check for empty list at start, return early if empty
   - Check for no selection and return immediately

5. **Async Decision**:
   - Use async ONLY where required by VS Code API (e.g., `await` calls, Promise handling)
   - Keep handlers sync where possible to reduce function signature complexity
   - Example: `handleListPlugins()` should be sync unless it needs async service calls

### 6.2 TDD Requirements

This refactoring involves NO new functionality, only code reorganization. Therefore:

- **Existing Tests**: Review tests in `src/test/suite/` to understand expected behavior
- **Test-Driven Approach**: Run tests before refactoring to ensure baseline passes
- **Red-Green-Refactor**: Not applicable here since we're refactoring, not adding features
- **Validation**: Ensure all tests pass after refactoring (Green phase)
- **No Test Changes**: Tests should NOT need modification - the refactoring is internal only

Run: `npm test` after refactoring to validate behavior preservation

### 6.3 Architecture Patterns to Follow

1. **Module Organization** (DECISION: Keep in same file):
   - REQUIRED: Keep ALL handler and helper functions in `src/extension.ts` (no separate files)
   - Do NOT create new files or directories to avoid over-engineering
   - Use consistent function naming: `handle[CommandName]` for entry points
   - Use `_` prefix for ALL internal helper functions (e.g., `_selectMarketplace`, `_performRemoval`)

2. **Error Handling**:
   - Maintain existing try-catch patterns
   - Preserve error message formatting: `error instanceof Error ? error.message : String(error)`
   - Keep special case for `NOT_A_GIT_REPO` error in `updateMarketplace`

3. **VS Code API Usage**:
   - Maintain all existing QuickPick, InputBox, and Progress patterns
   - Don't introduce new UI patterns (consistency with existing code)
   - Preserve placeholder texts and option labels

4. **Service Delegation**:
   - All business logic continues to use `MarketplaceService`
   - Handler functions ONLY orchestrate UI and service calls
   - No new service methods needed

5. **Async/Sync Decision** (DECISION: Use async only when needed):
   - Functions must be async ONLY if they contain `await` calls
   - Do NOT add async wrappers around sync code
   - Keep handler signatures as simple as possible
   - Example: `handleListPlugins()` is sync; `handleAddMarketplace()` is async (contains awaits)

### 6.4 Files to Create/Modify

**Modify:**

- `src/extension.ts` - Extract handlers and helpers, maintain command registration pattern

**Test:**

- `npm test` - Run existing tests to validate behavior preservation
- `npm run lint` - Verify zero ESLint violations after refactoring

**No New Files Required**: This is a refactoring within a single file, not a feature addition.

---

## 7. Non-Goals (Out of Scope)

- Adding new commands or functionality
- Changing UI behavior or user experience
- Modifying `MarketplaceService` or other services
- Updating documentation or test files (unless tests fail)
- Renaming commands or changing command IDs
- Adding error recovery or fallback logic

---

## 8. Design Considerations

### Code Structure Example

After refactoring, the file structure should look like:

```typescript
import * as vscode from 'vscode';
import { MarketplaceService } from './services/marketplaceService';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension activated');

  context.subscriptions.push(
    vscode.commands.registerCommand('...', handleListMarketplace),
    vscode.commands.registerCommand('...', handleAddMarketplace),
    vscode.commands.registerCommand('...', handleRemoveMarketplace),
    vscode.commands.registerCommand('...', handleUpdateMarketplace),
    vscode.commands.registerCommand('...', handleListPlugins),
    vscode.commands.registerCommand('...', handleAddPlugin),
    vscode.commands.registerCommand('...', handleRemovePlugin),
  );
}

async function handleListMarketplace() { /* < 30 lines */ }
async function handleAddMarketplace() { /* < 30 lines */ }
async function handleRemoveMarketplace() { /* < 30 lines */ }
async function handleUpdateMarketplace() { /* < 30 lines */ }
function handleListPlugins() { /* < 30 lines */ }
function handleAddPlugin() { /* < 30 lines */ }
function handleRemovePlugin() { /* < 30 lines */ }

// Helper functions (private, use _ prefix)
async function _selectMarketplace(marketplaces) { /* helper */ }
async function _performRemoval(marketplace) { /* helper */ }
// ... other helpers as needed
```

### Validation Approach

- Run `npm run lint` to verify no violations
- Run `npm test` to verify behavior preservation
- Manual testing: Verify each command still works as expected in VS Code

---

## 9. Success Metrics

- ✅ `npm run lint` passes with zero violations (0 warnings, 0 errors)
- ✅ `npm test` passes all existing tests (100% of baseline tests)
- ✅ All command handler functions are ≤ 30 lines
- ✅ Main `activate()` function is ≤ 30 lines
- ✅ Code follows naming conventions and SOLID principles
- ✅ No changes to user-visible behavior or command functionality
- ✅ All ES2022/TypeScript syntax conventions maintained

---

## 10. Key Decisions (Resolved)

This section documents decisions made during PRD creation to guide implementation:

1. **Helper Function Naming**: All internal helper functions MUST use underscore prefix (e.g., `_selectMarketplace()`) to clearly distinguish them from public handlers and improve code clarity.

2. **Code Organization**: Keep ALL functions in `src/extension.ts` without creating separate directories. This avoids over-engineering for the current scope. Future refactoring can be considered if the file grows significantly larger.

3. **Async Usage**: Use async ONLY when required by the VS Code API (i.e., when functions contain `await` calls). Do NOT wrap sync operations in async to keep function signatures simple and reduce cognitive complexity.
go
---

## Implementation Readiness Checklist

Before starting implementation:

- [ ] Read and understand the current `src/extension.ts` implementation (lines 1-171)
- [ ] Run `npm test` to establish baseline (all tests should pass)
- [ ] Run `npm run lint` to see current violations
- [ ] Review similar refactoring patterns in other VS Code extensions
- [ ] Identify all handler functions and their current line counts
- [ ] Plan extraction strategy for each handler
- [ ] Set up branch for refactoring work
- [ ] Execute refactoring in small, testable steps
- [ ] Run `npm test` after each major change to validate
- [ ] Final validation: `npm run lint` and `npm test` both pass
- [ ] Commit with clear message: "refactor: break down activate function to comply with max-lines-per-function"
