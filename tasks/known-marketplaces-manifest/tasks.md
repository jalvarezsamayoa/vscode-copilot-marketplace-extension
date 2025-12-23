# Known Marketplaces Manifest Implementation - Task List

## Relevant Files

- `tasks/known-marketplaces-manifest/prd.md` - The PRD document that outlines the feature requirements.
- `src/utils/manifest.ts` - New utility file for manifest I/O and validation operations.
- `src/utils/manifest.test.ts` - Unit tests for manifest utility functions.
- `src/services/marketplaceService.ts` - Existing service file that will be modified to integrate manifest persistence.
- `src/services/marketplaceService.test.ts` - Tests for manifest integration in marketplace service.
- `src/schemas/known-marketplaces-schema.json` - Existing schema file for manifest validation.
- `CHANGELOG.md` - Project changelog to document the new feature.

### Notes

- Unit tests should be placed alongside the code files they are testing (e.g., `manifest.ts` and `manifest.test.ts` in the same directory).
- Use `npm test` to run tests. Running without a path executes all tests found by the test configuration.
- ESLint complexity rules must be followed: max cyclomatic complexity of 5, max nesting depth of 3, max 30 lines per function, max 3 parameters per function.

## Development Instructions

- Strict TDD workflow: Write all failing tests first, then implement functionality to pass them.
- All code must pass `npm run lint` before committing.
- All tests must pass before committing.
- Run `npm run compile` to ensure TypeScript compilation succeeds.

## Workflow

- Execute the following steps one at a time.
- Do not proceed to the next step until the previous one is completed and verified. If you encounter any issues, address them before moving on.
- Update the status of each task as you complete it. If a task is not completed, do not mark it as done.
- Use the tdd-green, tdd-red and tdd-refactor subagents for the corresponding tasks.
- **Checkpoint Commits**: After each major task (0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0) is completed, create a checkpoint commit with a descriptive message. This ensures progress is saved and allows for easy rollback if needed.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/known-marketplaces-manifest`)
  - [ ] 0.2 Create checkpoint commit: `git commit --allow-empty -m "chore: create feature branch for known-marketplaces-manifest"`

- [ ] 1.0 Write all failing tests for manifest functionality
  - [ ] 1.1 Create `src/utils/manifest.test.ts` with tests for reading the manifest file
    - [ ] 1.1.1 Test that reading a non-existent manifest returns an empty object
    - [ ] 1.1.2 Test that reading an existing manifest parses and returns the JSON object
    - [ ] 1.1.3 Test that reading a corrupted manifest logs a warning and returns an empty object
    - [ ] 1.1.4 Test that reading handles file system errors gracefully with descriptive messages
  - [ ] 1.2 Add tests for writing/persisting the manifest file
    - [ ] 1.2.1 Test that writing creates the manifest file if it doesn't exist
    - [ ] 1.2.2 Test that writing creates the `.copilot/plugins/` directory if it doesn't exist
    - [ ] 1.2.3 Test that writing persists the manifest object to disk synchronously
    - [ ] 1.2.4 Test that writing handles permission errors gracefully with descriptive messages
  - [ ] 1.3 Add tests for validating manifest entries against schema
    - [ ] 1.3.1 Test that valid entries pass schema validation
    - [ ] 1.3.2 Test that entries missing required fields fail validation
    - [ ] 1.3.3 Test that entries with invalid source types fail validation
    - [ ] 1.3.4 Test that entries with invalid timestamps fail validation
  - [ ] 1.4 Add tests for addMarketplace manifest integration in `src/services/marketplaceService.test.ts`
    - [ ] 1.4.1 Test that adding a marketplace writes an entry to the manifest
    - [ ] 1.4.2 Test that the manifest entry contains source, installLocation, and lastUpdated fields
    - [ ] 1.4.3 Test that the manifest entry validates against the schema
    - [ ] 1.4.4 Test that the manifest is created automatically if it doesn't exist
  - [ ] 1.5 Add tests for removeMarketplace manifest integration
    - [ ] 1.5.1 Test that removing a marketplace deletes the entry from the manifest
    - [ ] 1.5.2 Test that removing a marketplace that doesn't exist in the manifest succeeds silently
    - [ ] 1.5.3 Test that other entries in the manifest remain unchanged after removal
  - [ ] 1.6 Add tests for updateMarketplace manifest integration
    - [ ] 1.6.1 Test that updating a marketplace updates the lastUpdated timestamp in the manifest
    - [ ] 1.6.2 Test that updating a marketplace preserves other manifest entry fields
    - [ ] 1.6.3 Test that the updated timestamp is in ISO 8601 format
  - [ ] 1.7 Add tests for error handling and corrupted manifest recovery
    - [ ] 1.7.1 Test that a corrupted manifest (invalid JSON) is detected and logged as a warning
    - [ ] 1.7.2 Test that a corrupted manifest is recreated as an empty object
    - [ ] 1.7.3 Test that the add/remove/update operation continues after manifest recovery
    - [ ] 1.7.4 Test that file permission errors are caught and thrown with descriptive messages
    - [ ] 1.7.5 Test that missing parent directories are created recursively
  - [ ] 1.8 Create checkpoint commit after all tests are written
    - [ ] 1.8.1 Verify all test files are created but tests are failing (Red phase)
    - [ ] 1.8.2 Create checkpoint commit: `git commit -m "test(red): add all failing tests for known-marketplaces-manifest feature"`

- [ ] 2.0 Implement manifest utility functions to pass tests
  - [ ] 2.1 Create `src/utils/manifest.ts` with function to read the manifest file
    - [ ] 2.1.1 Implement `readManifest()` that returns an empty object if the file doesn't exist
    - [ ] 2.1.2 Handle corrupted JSON by logging a warning and returning an empty object
    - [ ] 2.1.3 Handle file system errors gracefully with descriptive error messages
  - [ ] 2.2 Implement function to write/persist the manifest file
    - [ ] 2.2.1 Implement `writeManifest(manifest: object)` that persists to disk synchronously
    - [ ] 2.2.2 Create directories recursively if `.copilot/plugins/` doesn't exist
    - [ ] 2.2.3 Throw descriptive errors for permission and disk errors
  - [ ] 2.3 Implement function to validate manifest entries against schema
    - [ ] 2.3.1 Implement `validateManifestEntry(entry: unknown)` using the AJV validator
    - [ ] 2.3.2 Return validation result with error details if validation fails
  - [ ] 2.4 Run all tests to verify manifest utilities pass
    - [ ] 2.4.1 Execute `npm test -- src/utils/manifest.test.ts` and confirm all tests pass
  - [ ] 2.5 Create checkpoint commit after manifest utilities are implemented
    - [ ] 2.5.1 Verify all manifest utility tests pass
    - [ ] 2.5.2 Verify linting passes with `npm run lint`
    - [ ] 2.5.3 Verify TypeScript compilation with `npm run compile`
    - [ ] 2.5.4 Create checkpoint commit: `git commit -m "feat: implement manifest utility functions (read, write, validate)"`

- [ ] 3.0 Implement addMarketplace manifest integration to pass tests
  - [ ] 3.1 Update `src/services/marketplaceService.ts` addMarketplace function
    - [ ] 3.1.1 After successful marketplace installation, extract marketplace metadata (name, source, installLocation)
    - [ ] 3.1.2 Create a manifest entry object with source, installLocation, and lastUpdated fields
    - [ ] 3.1.3 Validate the entry against the schema before persisting
    - [ ] 3.1.4 Read the existing manifest, add the new entry, and write it back to disk
  - [ ] 3.2 Ensure error handling propagates manifest errors to the user
    - [ ] 3.2.1 Catch manifest write errors and throw them with context about the failure
  - [ ] 3.3 Run tests to verify addMarketplace integration passes
    - [ ] 3.3.1 Execute `npm test -- src/services/marketplaceService.test.ts` and confirm all integration tests pass
  - [ ] 3.4 Create checkpoint commit after addMarketplace integration is implemented
    - [ ] 3.4.1 Verify all addMarketplace tests pass
    - [ ] 3.4.2 Verify linting passes with `npm run lint`
    - [ ] 3.4.3 Verify TypeScript compilation with `npm run compile`
    - [ ] 3.4.4 Create checkpoint commit: `git commit -m "feat: integrate manifest persistence into addMarketplace command"`

- [ ] 4.0 Implement removeMarketplace manifest integration to pass tests
  - [ ] 4.1 Update `src/services/marketplaceService.ts` removeMarketplace function
    - [ ] 4.1.1 After successfully removing a marketplace from cache, read the manifest
    - [ ] 4.1.2 Delete the marketplace entry from the manifest by marketplace name
    - [ ] 4.1.3 Write the updated manifest back to disk
  - [ ] 4.2 Ensure removal succeeds silently if the marketplace isn't in the manifest
    - [ ] 4.2.1 Check if entry exists before attempting deletion; continue if not found
  - [ ] 4.3 Run tests to verify removeMarketplace integration passes
    - [ ] 4.3.1 Execute `npm test -- src/services/marketplaceService.test.ts` and confirm removal tests pass
  - [ ] 4.4 Create checkpoint commit after removeMarketplace integration is implemented
    - [ ] 4.4.1 Verify all removeMarketplace tests pass
    - [ ] 4.4.2 Verify linting passes with `npm run lint`
    - [ ] 4.4.3 Verify TypeScript compilation with `npm run compile`
    - [ ] 4.4.4 Create checkpoint commit: `git commit -m "feat: integrate manifest removal into removeMarketplace command"`

- [ ] 5.0 Implement updateMarketplace manifest integration to pass tests
  - [ ] 5.1 Update `src/services/marketplaceService.ts` updateMarketplace function
    - [ ] 5.1.1 After successfully updating a marketplace, read the manifest
    - [ ] 5.1.2 Find the marketplace entry by name and update its lastUpdated field to current ISO 8601 timestamp
    - [ ] 5.1.3 Preserve other fields in the entry (source, installLocation)
    - [ ] 5.1.4 Write the updated manifest back to disk
  - [ ] 5.2 Ensure update succeeds silently if the marketplace isn't in the manifest
    - [ ] 5.2.1 Check if entry exists; continue if not found (no error thrown)
  - [ ] 5.3 Run tests to verify updateMarketplace integration passes
    - [ ] 5.3.1 Execute `npm test -- src/services/marketplaceService.test.ts` and confirm update tests pass
  - [ ] 5.4 Create checkpoint commit after updateMarketplace integration is implemented
    - [ ] 5.4.1 Verify all updateMarketplace tests pass
    - [ ] 5.4.2 Verify linting passes with `npm run lint`
    - [ ] 5.4.3 Verify TypeScript compilation with `npm run compile`
    - [ ] 5.4.4 Create checkpoint commit: `git commit -m "feat: integrate manifest timestamp update into updateMarketplace command"`

- [ ] 6.0 Implement error handling and recovery logic to pass tests
  - [ ] 6.1 Implement corrupted manifest detection and recovery
    - [ ] 6.1.1 In `readManifest()`, catch JSON.parse errors and log a warning
    - [ ] 6.1.2 Recreate the corrupted manifest file with an empty object `{}`
    - [ ] 6.1.3 Return the empty object to allow the operation to continue
  - [ ] 6.2 Implement file system error handling
    - [ ] 6.2.1 Catch permission errors and throw with a message like "Unable to write manifest: permission denied"
    - [ ] 6.2.2 Catch disk full errors and throw with a descriptive message
    - [ ] 6.2.3 Create missing directories recursively before writing
  - [ ] 6.3 Run all tests to ensure error handling passes
    - [ ] 6.3.1 Execute `npm test` and confirm all tests pass (no failing tests)
  - [ ] 6.4 Run ESLint to ensure code complexity compliance
    - [ ] 6.4.1 Execute `npm run lint` and verify no violations (all functions meet complexity limits)
  - [ ] 6.5 Run TypeScript compilation to verify type safety
    - [ ] 6.5.1 Execute `npm run compile` and confirm successful compilation
  - [ ] 6.6 Create checkpoint commit after error handling is implemented
    - [ ] 6.6.1 Verify all tests pass with `npm test`
    - [ ] 6.6.2 Verify linting passes with `npm run lint`
    - [ ] 6.6.3 Verify TypeScript compilation with `npm run compile`
    - [ ] 6.6.4 Create checkpoint commit: `git commit -m "feat: implement error handling and corrupted manifest recovery"`

- [ ] 7.0 Update changelog and documentation
  - [ ] 7.1 Update `CHANGELOG.md` with the new feature
    - [ ] 7.1.1 Add entry describing the Known Marketplaces Manifest feature under the appropriate version section
    - [ ] 7.1.2 Include details about manifest persistence for add/remove/update operations
  - [ ] 7.2 Update project documentation if needed
    - [ ] 7.2.1 Review `README.md` and add any relevant information about marketplace persistence (if applicable)
    - [ ] 7.2.2 Ensure documentation is clear and reflects the new behavior
  - [ ] 7.3 Final verification and commit
    - [ ] 7.3.1 Run `npm test` one final time to ensure all tests pass
    - [ ] 7.3.2 Run `npm run lint` to ensure no linting violations
    - [ ] 7.3.3 Verify TypeScript compilation with `npm run compile`
    - [ ] 7.3.4 Create final checkpoint commit: `git commit -m "docs: update changelog and documentation for known-marketplaces-manifest feature"`

- [ ] 8.0 Squash all commits into a single clean commit
  - [ ] 8.1 Verify the feature branch has all checkpoint commits
    - [ ] 8.1.1 Run `git log` to review all commits on the feature branch
  - [ ] 8.2 Squash all commits into a single commit
    - [ ] 8.2.1 Run `git rebase -i main` (or use `./scripts/squash-and-merge.sh` if available)
    - [ ] 8.2.2 Mark all commits as `squash` (or `s`) except the first one, which should be `pick` (or `p`)
    - [ ] 8.2.3 Edit the commit message to create a comprehensive message describing all changes
    - [ ] 8.2.4 Complete the rebase and verify the branch now has a single commit
  - [ ] 8.3 Verify the squashed commit is clean
    - [ ] 8.3.1 Run `npm test` to ensure all tests pass
    - [ ] 8.3.2 Run `npm run lint` to ensure no linting violations
    - [ ] 8.3.3 Run `npm run compile` to verify TypeScript compilation
  - [ ] 8.4 Create final squashed commit message
    - [ ] 8.4.1 Craft a comprehensive commit message that summarizes all changes to the known-marketplaces-manifest feature
    - [ ] 8.4.2 Example: `feat: implement known-marketplaces-manifest with persistent tracking` with body describing all added functionality
