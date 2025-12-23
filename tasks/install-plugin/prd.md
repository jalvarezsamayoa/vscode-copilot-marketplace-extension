# PRD: Implement Plugin Installation (`installPlugin`)

## 1. Introduction/Overview

This feature implements the plugin installation logic in `MarketplaceService`. When a user selects a plugin from a marketplace, the system will copy the relevant files from the plugin's source directory to the workspace's `.github/` folder, following a specific mapping based on the folder types inside the plugin.

## 2. Codebase Context

**This section grounds the PRD in the actual codebase architecture.**

- **Similar Features**:
  - `MarketplaceService.installMarketplace` (line 223 in `src/services/marketplaceService.ts`) handles directory copying from local sources.
  - `MarketplaceService.addMarketplace` (line 93 in `src/services/marketplaceService.ts`) shows the flow of fetching, validating, and installing components.
- **Patterns to Follow**:
  - Use `fs.promises.cp` for directory copying (refer to `installMarketplace` at line 236).
  - Follow the stubbed method signature for `installPlugin` in `src/services/marketplaceService.ts` (line 343).
  - Use the `Plugin` interface defined in `src/services/marketplaceService.ts` (line 11).
  - Refer to `src/schemas/plugin-schema.json` for the expected structure of plugin metadata.
- **Reusable Components**:
  - `MarketplaceService.getHomeDir()` for path resolution.
  - `vscode.workspace.workspaceFolders` for determining the destination root.
  - `Ajv` for schema validation (already initialized in `MarketplaceService` constructor).
- **Naming Conventions**:
  - New private helper methods should follow `camelCase`.
  - Internal state should be managed within `MarketplaceService`.

## 3. Goals

- Implement the `installPlugin` method to copy plugin files to the workspace.
- Handle four specific plugin folder types: `skills`, `agents`, `commands`, and `instructions`.
- Ensure files are placed in the correct `.github/` subdirectories.
- Support resolving the plugin's source path, which is relative to the marketplace's installation location.
- Handle file conflicts by prompting the user for overwrite confirmation.
- Provide a summary of installed components to the user.
- Adhere to the project's strict TDD and complexity requirements.

## 4. User Stories

As a developer using Copilot Marketplace,
I want to select a plugin and have its skills, agents, commands, and instructions automatically installed into my workspace's `.github/` folder,
So that I can immediately start using the plugin's capabilities.

## 5. Functional Requirements

1. **Source Resolution**: The system must determine the absolute path to the plugin files.
   - If `plugin.source` is a relative path (string), it is relative to the marketplace's `installLocation`.
   - The `installLocation` of the marketplace can be retrieved from the known marketplaces manifest.
2. **Installation Root**: The installation must target the `.github/` directory of the current workspace root.
3. **Folder Mapping**:
   - If the plugin contains a `skills/` folder, its contents must be copied to `.github/skills/`.
   - If the plugin contains an `agents/` folder, its contents must be copied to `.github/agents/`.
   - If the plugin contains a `commands/` folder, its contents must be copied to `.github/prompts/`.
   - If the plugin contains an `instructions/` folder, its contents must be copied to `.github/instructions/`.
4. **Directory Management**: Destination directories must be created if they do not exist.
5. **Conflict Handling**:
   - If a folder or file already exists in the destination `.github/` subdirectory, the system must ask the user if they would like to overwrite it.
   - Use `vscode.window.showQuickPick` or `vscode.window.showInformationMessage` with custom buttons for confirmation.
6. **Installation Summary**:
   - After the installation process completes, the system must provide a summary of what was installed (e.g., "Installed 2 skills, 1 agent").
   - This summary should be returned by `installPlugin` or reported back to the extension host.
7. **Async Operations**: The operation must be asynchronous and respect VS Code workspace boundaries.

## 6. Technical Implementation Guidance

### 6.1 Code Complexity Constraints

All implementations MUST satisfy these ESLint rules:

- **Cyclomatic Complexity**: Maximum 5 per function.
- **Nesting Depth**: Maximum 3 levels.
- **Function Length**: Maximum 30 lines.
- **Parameters**: Maximum 3 per function.

**Guidance**:

- Create a helper method `_getPluginSourcePath(plugin: Plugin)` to resolve the absolute path.
- Use a dedicated helper for each mapping step or a loop-based approach with a configuration object to keep complexity low.
- For conflict resolution, extract the check-and-prompt logic into a separate method.
- Use `vscode.workspace.workspaceFolders` safely (handle the undefined case).

### 6.2 TDD Requirements

This feature MUST be developed using strict TDD workflow:

1. **Red Phase**: Write failing tests in `src/test/suite/installPlugin.test.ts`.
2. **Green Phase**: Implement `installPlugin` in `src/services/marketplaceService.ts`.
3. **Refactor Phase**: Optimize complexity and ensure DRY principles while keeping tests green.

**Test File Location**: `src/test/suite/installPlugin.test.ts`

### 6.3 Architecture Patterns to Follow

- **Service Layer**: All logic stays within `MarketplaceService`.
- **File Operations**: Use `fs.promises` for asynchronous file and directory management.
- **Path Handling**: Use the `path` module for cross-platform compatibility.
- **Error Handling**: Throw descriptive errors if the workspace is missing or the source cannot be resolved.

### 6.4 Files to Create/Modify

- `src/services/marketplaceService.ts` - Implement `installPlugin` and any necessary private helpers.
- `src/test/suite/installPlugin.test.ts` - New test suite for the installation logic.

## 7. Non-Goals (Out of Scope)

- Uninstalling plugins (tracked separately in `removePlugin`).
- Git-based plugin installation (assuming local source for now).
- Automatic merging of file contents (only overwrite or skip).

## 8. Design Considerations

- Use `vscode.workspace.workspaceFolders[0].uri.fsPath` for the destination root.
- Ensure that the path resolution handles the `source` attribute correctly.
- Implement a `ConfirmationService` pattern or similar if prompting is needed from within the service layer (though it might be better to handle the prompt in `extension.ts` or via a callback).

## 9. Success Metrics

- `installPlugin` successfully copies files to the correct `.github/` subdirectories.
- Conflict prompting works correctly and respects user selection.
- A summary message is displayed to the user after installation.
- All tests in `installPlugin.test.ts` pass.
- `npm run lint` shows no complexity or style violations.

## 10. Open Questions

- None. (Questions regarding overwrite behavior and feedback have been addressed).
