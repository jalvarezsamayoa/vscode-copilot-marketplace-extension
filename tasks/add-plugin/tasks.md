# Add Plugin Command Tasks

## Relevant Files

- `tasks/add-plugin/prd.md` - The PRD document that outlines the feature requirements.
- `src/extension.ts` - Main entry point where the `addPlugin` command is registered and UI logic resides.
- `src/services/marketplaceService.ts` - Service layer where the `installPlugin` stub will be added.
- `src/test/suite/addPlugin.test.ts` - Unit tests for the `addPlugin` command and service logic.

### Notes

- Follow **Strict TDD**: Write failing tests before any implementation.
- All code MUST comply with ESLint complexity rules (Max complexity 5, Max lines 30, Max params 3).
- Use `npm test` to run tests.

## Development Instructions

- `.agent/rules/test-driven-development.instructions.md` - Strict TDD Workflow.
- `.agent/rules/typescript-5-es2022.instructions.md` - TypeScript guidelines.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch `feature/add-plugin`
- [x] 1.0 **TDD: Service Layer (`MarketplaceService.installPlugin`)**
  - [x] 1.1 **Red**: Add test case for `installPlugin` in `addPlugin.test.ts` (verify it exists as a function).
  - [x] 1.2 **Green**: Add stub for `installPlugin` in `MarketplaceService`.
  - [x] 1.3 **Red**: Add test case to verify `installPlugin` returns a Promise.
  - [x] 1.4 **Green**: Ensure `installPlugin` is `async`.
  - [x] 1.5 **Refactor**: Ensure method follows naming conventions and complexity rules.
- [x] 2.0 **TDD: UI Flow Selection (`_handleAddPlugin`)**
  - [x] 2.1 **Red**: Write test to verify `_handleAddPlugin` calls `getAllPlugins`.
  - [x] 2.2 **Green**: Implement basic `_handleAddPlugin` that fetches plugins.
  - [x] 2.3 **Red**: Write test for "No plugins found" error message.
  - [x] 2.4 **Green**: Implement error handling if plugin list is empty.
- [x] 3.0 **TDD: UI Flow Details and Confirmation**
  - [x] 3.1 **Red**: Write test to verify selecting a plugin shows information message with details.
  - [x] 3.2 **Green**: Implement `_showPluginDetails` helper function.
  - [x] 3.3 **Red**: Write test for Yes/No confirmation prompt appearing after details.
  - [x] 3.4 **Green**: Implement `_getInstallationConfirmation` helper function using `showQuickPick`.
- [x] 4.0 **TDD: UI Flow Installation Progress**
  - [x] 4.1 **Red**: Write test to verify `withProgress` is called when "Yes" is selected.
  - [x] 4.2 **Green**: Implement `_performInstallation` helper function with `withProgress`.
  - [x] 4.3 **Refactor**: Review and refactor all new functions in `extension.ts` to ensure max 30 lines and max 5 complexity.
- [x] 5.0 **Final Verification**
  - [x] 5.1 Run `npm run lint` to verify complexity and style compliance.
  - [x] 5.2 Run all tests with `npm test`.
  - [x] 5.3 Update `README.md` with the new command information.
  - [x] 5.4 Finalize the feature branch and prepare for walkthrough.
