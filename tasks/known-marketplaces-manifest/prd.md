# Product Requirements Document: Known Marketplaces Manifest Management

## Introduction/Overview

The Known Marketplaces manifest implementation integrates persistent tracking of installed marketplaces into the existing VS Code Copilot Marketplace extension. Currently, the extension provides VS Code commands to add and remove marketplaces (`addMarketplace` and `removeMarketplace`), which install them to the cache directory at `~/.copilot/plugins/marketplaces/`. However, **the manifest file at `$HOME/.copilot/plugins/known_marketplaces.json` is not currently being used or tracked**.

This feature will implement the missing link: when users add or remove marketplaces via the existing VS Code UI, the system will also persist their marketplace metadata (source, install location, last updated timestamp) to the `known_marketplaces.json` file. This enables a centralized registry of known marketplaces following the schema defined in `src/schemas/known-marketplaces-schema.json`.

## Goals

1. Persist marketplace metadata to `known_marketplaces.json` when marketplaces are added via existing VS Code UI commands
2. Remove marketplace entries from `known_marketplaces.json` when marketplaces are removed via existing VS Code UI commands
3. Ensure all persisted entries validate against the `known-marketplaces-schema.json` schema
4. Automatically initialize the manifest file on first use with an empty object `{}`
5. Maintain consistency between the cache directory and the manifest file registry

## User Stories

1. **As a user adding a marketplace via the VS Code command**, I want the marketplace to be recorded in my known marketplaces registry so that I have a persistent record of what I've installed

   - When I run the "Add Copilot Marketplace" command and successfully add a marketplace, it should be recorded in `known_marketplaces.json`
   - The registry should include the marketplace name, source (repository and type), install location, and when it was added

2. **As a user removing a marketplace via the VS Code command**, I want it removed from my known marketplaces registry so my registry stays synchronized with installed marketplaces

   - When I run the "Remove Copilot Marketplace" command and successfully remove a marketplace, it should also be removed from `known_marketplaces.json`

3. **As a developer reading the manifest**, I want the entries to be structured consistently so I can reliably parse and use the marketplace metadata

   - All entries in `known_marketplaces.json` should conform to the defined schema with required fields: source (with source type and repo), installLocation, and lastUpdated timestamp

4. **As a new user**, I want the manifest file to be created automatically so I don't have to manually set it up
   - On first marketplace addition, if `known_marketplaces.json` doesn't exist, the system should create the file and any necessary directories

5. **As a user updating a marketplace via the VS Code command**, I want the manifest to reflect the latest update time so I have an accurate record
   - When I run the "Update Copilot Marketplace" command, the `lastUpdated` timestamp in the manifest should be refreshed to the current time
   - The marketplace entry should remain in the manifest with updated metadata

## Functional Requirements

1. The system must read the known marketplaces manifest from `$HOME/.copilot/plugins/known_marketplaces.json` when loading marketplace information
2. When a marketplace is successfully added via the `addMarketplace` command, the system must record it in `known_marketplaces.json` with:
   - Key: The marketplace name
   - Value: An object containing `source` (with `source` type and `repo` identifier), `installLocation`, and `lastUpdated` timestamp
3. The system must validate all marketplace entries against the schema in `src/schemas/known-marketplaces-schema.json` before persisting to the manifest
4. When a marketplace is removed via the `removeMarketplace` command, the system must delete the corresponding entry from `known_marketplaces.json`
5. When a marketplace is updated via the `updateMarketplace` command, the system must update the `lastUpdated` timestamp in `known_marketplaces.json` to the current time
6. The schema entry for source must include:
   - `source.source`: Either "github" or "directory" (enum)
   - `source.repo`: Repository identifier matching the pattern `^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$` for github sources, or a directory path for local sources
7. All marketplace entries must include an `installLocation` field with the full file system path where the marketplace is installed
8. All marketplace entries must include a `lastUpdated` field with an ISO 8601 formatted timestamp
9. If the manifest file does not exist when a marketplace is first added, the system must automatically create it with an empty object `{}`
10. If the `.copilot/plugins/` directory does not exist, the system must create it recursively
11. If the manifest file exists but is corrupted (invalid JSON), the system must:
    - Log a warning message indicating the manifest was corrupted
    - Recreate the manifest file with an empty object `{}`
    - Continue with the marketplace operation (add/remove/update)
12. The system must handle file system errors gracefully (e.g., permission denied, disk full) with descriptive error messages
13. Updates to the manifest must be written synchronously to disk immediately after any add/remove/update operation

## Non-Goals (Out of Scope)

- Creating new VS Code UI commands (commands already exist; this feature integrates with them)
- Displaying or editing the manifest directly in the VS Code UI
- Syncing the manifest across multiple VS Code instances or machines
- Validating marketplace endpoints by attempting network connections
- Automatically discovering or pre-populating known marketplaces
- Plugin installation or management (separate feature)
- Marketplace rating, reviews, or recommendation features
- Utility commands to display or debug the manifest contents
- Automatic recovery by rebuilding the manifest from cache directory contents

## Design Considerations

- Marketplace metadata must be extracted from the installation process in `marketplaceService.ts` to populate manifest fields:
  - Marketplace name: Already available from marketplace manifest file
  - Source type and repo: Derived from the git URL or directory path input by the user
  - Install location: Known from the cache directory structure
  - Last updated: Should use current timestamp when recording/updating in manifest
- The manifest update logic should be integrated into three existing service methods:
  - `addMarketplace()`: Add new entry with current timestamp
  - `removeMarketplace()`: Delete entry from manifest
  - `updateMarketplace()`: Update the `lastUpdated` timestamp to current time
- Error handling for file I/O operations should distinguish between different failure modes:
  - Invalid JSON: Log warning and recreate with empty object
  - File not writable, disk full, permission denied: Throw descriptive error
  - Missing directories: Create them recursively
- The manifest should be treated as source of truth for which marketplaces were explicitly installed by the user via VS Code commands

## Technical Considerations

- **Schema Compliance**: All manifest entries must strictly conform to `src/schemas/known-marketplaces-schema.json`; use the existing AJV validator in the codebase for validation
- **File Location**: `$HOME/.copilot/plugins/known_marketplaces.json` is computed using `path.join(os.homedir(), '.copilot', 'plugins', 'known_marketplaces.json')`
- **Cache Directory**: The existing `COPILOT_PLUGINS_DIR` environment variable or default cache path is in `src/utils/paths.ts`
- **Integration Points**:
  - `src/services/marketplaceService.ts`: `addMarketplace()` and `removeMarketplace()` functions need to be updated
  - `src/utils/`: May need manifest I/O utilities (read, write, validate)
- **Manifest Structure**: Object with marketplace names as keys; each value contains source, installLocation, and lastUpdated properties
- **Error Recovery for Corrupted Manifest**:
  - When reading the manifest, catch JSON parse errors
  - Log warning: `"Manifest file corrupted, recreating with empty object"`
  - Write empty object `{}` back to disk
  - Continue with the marketplace operation
  - Do not throw error; let the operation proceed
- **Timestamp Format**: ISO 8601 format (e.g., `new Date().toISOString()`)
- **Synchronous I/O**: Use `fs/promises` for file operations, but ensure manifest is persisted before returning success to user
- **Logging**: Use VS Code's built-in logging via `console.warn()` for warning messages about corrupted manifests

## Success Metrics

1. When a user adds a marketplace via the "Add Copilot Marketplace" command, the entry is written to `known_marketplaces.json` with all required fields (source, installLocation, lastUpdated)
2. When a user removes a marketplace via the "Remove Copilot Marketplace" command, the entry is deleted from `known_marketplaces.json`
3. When a user updates a marketplace via the "Update Copilot Marketplace" command, the `lastUpdated` timestamp is refreshed to the current time
4. All entries in the manifest file conform to the schema defined in `src/schemas/known-marketplaces-schema.json`
5. The manifest file is created automatically on first marketplace operation if it doesn't exist
6. If the manifest file is corrupted (invalid JSON), it is automatically recreated with an empty object and a warning is logged
7. File I/O operations that fail (permission denied, disk full, etc.) are handled gracefully with descriptive error messages shown to the user
8. The manifest file is persisted to disk before the add/remove/update operation completes successfully
9. Tests verify that the manifest and cache directory remain in sync after add/remove/update operations

## Resolved Design Decisions

The following questions were clarified and resolved:

1. **Utility command for viewing the manifest**: Out of scope. The manifest is an internal file and doesn't require a dedicated debugging command at this time.
2. **Rebuilding manifest from cache directory**: Out of scope. The manifest is the source of truth for user-installed marketplaces; it will not be automatically rebuilt from cached directories.
3. **Updating manifest on updateMarketplace**: **Included in scope**. When a marketplace is updated via the `updateMarketplace` command, the manifest's `lastUpdated` timestamp should be refreshed.
4. **Handling corrupted manifest files**: **Automatically recreated**. If the manifest exists but contains invalid JSON, it should be recreated as an empty object `{}` and a warning should be logged. This allows the operation to continue without losing the user's ability to manage marketplaces.

These decisions are reflected in the Functional Requirements, Design Considerations, and Success Metrics sections above.
