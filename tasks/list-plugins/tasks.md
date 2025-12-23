## Relevant Files

- `tasks/list-plugins/prd.md` - The PRD document that outlines the feature requirements.
- `src/services/marketplaceService.ts` - Contains the logic for aggregating plugins from marketplaces.
- `src/test/suite/marketplaceService.test.ts` - Unit tests for `MarketplaceService`.
- `src/extension.ts` - Contains the command handler and UI logic for listing plugins.
- `src/test/suite/listPlugins.test.ts` - New test file for the `listPlugins` command and UI interactions.
- `src/utils/manifest.ts` - Utility for reading/writing the `known_marketplaces.json` manifest.
- `src/schemas/marketplace-schema.json` - Schema used to validate marketplace manifest files.

### Notes

- Follow the Red-Green-Refactor cycle strictly. Commit after each phase if appropriate.
- Use `sinon` for mocking `fs`, `os`, and `vscode` APIs.
- Ensure all code complies with ESLint complexity rules (max-depth 3, complexity 5, max-lines-per-function 30).
- Run `npm test` to execute the suite.

## Development Instructions

- `.github/instructions/development-bestpractices.md` - General TDD and SOLID guidelines.
- `.github/instructions/tasks.instructions.md` - Instructions for task management and git checkpoints.
- `.github/agents/tdd-red.agent.md` - Guide for writing failing tests.
- `.github/agents/tdd-green.agent.md` - Guide for minimal implementation to pass tests.
- `.github/agents/tdd-refactor.agent.md` - Guide for code quality and security improvements.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch `feature/list-plugins`
  - [ ] 0.2 Run baseline tests and linting: `npm test && npm run lint`
  - [ ] 0.3 Save baseline reports to `tmp/baseline_test.log` and `tmp/baseline_lint.log`
- [ ] 1.0 Extend `MarketplaceService` with `getAllPlugins` (TDD)
  - [ ] 1.1 **Red** (@.github/agents/tdd-red.agent.md): Write a test in `marketplaceService.test.ts` for `getAllPlugins()` when the manifest is empty.
  - [ ] 1.2 **Green** (@.github/agents/tdd-green.agent.md): Implement `getAllPlugins()` in `MarketplaceService` to return an empty array if no marketplaces are found.
  - [ ] 1.3 **Refactor** (@.github/agents/tdd-refactor.agent.md): Ensure the logic is clean and follows project standards.
  - [ ] 1.4 **Red** (@.github/agents/tdd-red.agent.md): Write a test for `getAllPlugins()` that mocks multiple marketplaces with valid `marketplace.json` files and plugins.
  - [ ] 1.5 **Green** (@.github/agents/tdd-green.agent.md): Implement the discovery logic: read `known_marketplaces.json`, iterate through `installLocation`, and aggregate plugins.
  - [ ] 1.6 **Refactor** (@.github/agents/tdd-refactor.agent.md): Extract helper methods if needed to keep `getAllPlugins` under 30 lines.
  - [ ] 1.7 **Red** (@.github/agents/tdd-red.agent.md): Write tests for edge cases: missing `marketplace.json`, invalid JSON, and sorting (case-insensitive by name).
  - [ ] 1.8 **Green** (@.github/agents/tdd-green.agent.md): Update implementation to handle validation using `Ajv` and apply alphabetical sorting.
  - [ ] 1.9 **Refactor** (@.github/agents/tdd-refactor.agent.md): Ensure efficient file I/O and proper schema validation integration.
- [ ] 2.0 Implement `listPlugins` command handler in `extension.ts` (TDD)
  - [ ] 2.1 **Red** (@.github/agents/tdd-red.agent.md): Write a test in `src/test/suite/listPlugins.test.ts` that verifies `vscode.window.showErrorMessage` is called when no marketplaces are available.
  - [ ] 2.2 **Green** (@.github/agents/tdd-green.agent.md): Implement `_handleListPlugins` in `extension.ts` to check `getAllPlugins()` and show the specific error message.
  - [ ] 2.3 **Refactor** (@.github/agents/tdd-refactor.agent.md): Ensure proper async/await handling.
  - [ ] 2.4 **Red** (@.github/agents/tdd-red.agent.md): Write a test that verifies `vscode.window.showQuickPick` is called with correctly formatted items (`[Marketplace] Name`).
  - [ ] 2.5 **Green** (@.github/agents/tdd-green.agent.md): Implement the QuickPick UI logic and display aggregated plugins.
  - [ ] 2.6 **Red** (@.github/agents/tdd-red.agent.md): Write a test that verifies `vscode.window.showInformationMessage` displays the correct plugin details upon selection.
  - [ ] 2.7 **Green** (@.github/agents/tdd-green.agent.md): Add the selection handler to the QuickPick logic.
  - [ ] 2.8 **Refactor** (@.github/agents/tdd-refactor.agent.md): Review `extension.ts` for complexity and nesting depth.
- [ ] 3.0 Documentation and Standards
  - [ ] 3.1 Update `README.md` to include the new `List Plugins` command in the features section.
  - [ ] 3.2 Run final linting and type checking: `npm run lint && npx tsc`.
- [ ] 4.0 Final Tasks
  - [ ] 4.1 Update `CHANGELOG.md` with the new `listPlugins` feature under `[Unreleased]`.
  - [ ] 4.2 Commit the changelog.
  - [ ] 4.3 Use `git fixup` or manual squash to consolidate commits into a clean feature commit.