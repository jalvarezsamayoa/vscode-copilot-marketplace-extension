## Relevant Files

- `tasks/install-plugin/prd.md` - The PRD document that outlines the feature requirements.
- `src/services/marketplaceService.ts` - Main implementation of `installPlugin`.
- `src/test/suite/installPlugin.test.ts` - Unit tests for `installPlugin`.
- `src/schemas/plugin-schema.json` - Schema for plugin metadata validation.

### Notes

- Use `npm test` to run tests.
- All code must comply with ESLint complexity rules (Max complexity 5, Max lines 30, Max params 3).

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch `feature/install-plugin`
- [x] 1.0 TDD Phase 1: Source Resolution and Workspace Validation
  - [x] 1.1 [RED] Write tests for absolute source path resolution from relative plugin source
  - [x] 1.2 [RED] Write tests for workspace validation guard clauses
  - [x] 1.3 [GREEN] Implement `_resolvePluginSourcePath` helper
  - [x] 1.4 [GREEN] Implement workspace validation in `installPlugin`
  - [x] 1.5 [REFACTOR] Clean up logic to ensure cyclomatic complexity <= 5
- [x] 2.0 TDD Phase 2: Folder Mapping and Copying Logic
  - [x] 2.1 [RED] Write tests for mapping `skills`, `agents`, `commands`, `instructions` folders
  - [x] 2.2 [GREEN] Implement core `_copyPluginFiles` method using `fs.promises.cp`
  - [x] 2.3 [REFACTOR] Extract directory creation to focused helper
- [x] 3.0 TDD Phase 3: Conflict Handling and User Selection
  - [x] 3.1 [RED] Write tests that mock file existence and simulate user confirmation/rejection
  - [x] 3.2 [GREEN] Implement `_handleFileConflict` to prompt user via `vscode.window.showInformationMessage`
  - [x] 3.3 [REFACTOR] Ensure early return if user cancels overwrite
- [x] 4.0 TDD Phase 4: Installation Summary and User Feedback
  - [x] 4.1 [RED] Write tests for aggregating and returning installation results
  - [x] 4.2 [GREEN] Implement summary message display after completion
  - [x] 4.3 [REFACTOR] Ensure all functions are under 30 lines
- [ ] 5.0 Final Refactoring and Integration Testing
  - [x] 5.1 Run `npm run lint` and fix any remaining violations
  - [ ] 5.2 Perform manual verification in extension host
  - [ ] 5.3 Squash all commits into a single commit
  - [ ] 5.4 Prepare walkthrough
- [/] 6.0 Resolve Skipped Tests (Refactor to Unit Tests)
  - [/] 6.1 [RED] Write unit test for `listPlugins` error handling
  - [ ] 6.2 [GREEN] Refactor `listPlugins` to pass unit test
  - [ ] 6.3 [RED] Write unit test for `listPlugins` formatting
  - [ ] 6.4 [GREEN] Ensure `listPlugins` formatting passes
  - [ ] 6.5 [RED] Write unit test for `addPlugin` empty plugins error
  - [ ] 6.6 [GREEN] Refactor `addPlugin` to pass unit test
  - [ ] 6.7 [RED] Write unit test for `addPlugin` installation flow
  - [ ] 6.8 [GREEN] Ensure `addPlugin` installation flow passes
