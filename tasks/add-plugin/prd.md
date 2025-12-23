# PRD - Implement addPlugin Command

## 1. Introduction/Overview

The `addPlugin` command allows users to discover and "install" (currently stubbed) plugins from added marketplaces within VS Code. It provides a guided UI flow to browse, view details, and confirm installation.

## 2. Codebase Context

- **Similar Features**:
  - `listPlugins` (`src/extension.ts` lines 155-180) provides the base logic for listing all plugins.
  - `addMarketplace` (`src/extension.ts` lines 34-52) and `removeMarketplace` (`src/extension.ts` lines 90-107) provide the pattern for progress notifications and async operations.
  - `_getRemovalConfirmation` (`src/extension.ts` lines 77-88) provides a pattern for Yes/No confirmations using `QuickPick`.
- **Patterns to Follow**:
  - **UI**: Use `vscode.window.showQuickPick` for selection and confirmation.
  - **Progress**: Use `vscode.window.withProgress` for the installation phase.
  - **Services**: Use `MarketplaceService` for plugin retrieval and installation logic.
  - **Async/Await**: Maintain consistent async behavior for all UI and service calls.

## 3. Goals

- Provide a user-friendly interface to browse all plugins from all marketplaces.
- Display detailed information before confirming installation.
- Show a clear progress notification during the "installation" process.
- Maintain a clean separation between UI (extension.ts) and business logic (MarketplaceService.ts).

## 4. User Stories

As a VS Code user, I want to:

1. Trigger the `addPlugin` command.
2. See a list of all available plugins across all my marketplaces.
3. Select a plugin and see its full details (Version, Marketplace, Description).
4. Be asked for confirmation ("Yes/No") before installation begins.
5. See a progress notification while the plugin is being installed.

## 5. Functional Requirements

1. The command `vscode-copilot-marketplace.addPlugin` must be implemented in `src/extension.ts`.
2. The command must fetch all plugins using `MarketplaceService.getAllPlugins()`.
3. If no plugins are available, show an error message.
4. Plugin list should show Name, Marketplace (in brackets/description), and Description (in detail).
5. Selecting a plugin must show an Information Message with full details (Name, Version, Marketplace, Description).
6. After viewing details, a `QuickPick` with "Yes" and "No" options must appear.
7. If "Yes" is selected:
   - Trigger `MarketplaceService.installPlugin(plugin)`.
   - Show `vscode.window.withProgress` with title "Installing plugin...".
8. `MarketplaceService` must have a new method `installPlugin(plugin: Plugin): Promise<void>` (can be stubbed for now).

## 6. Technical Implementation Guidance

### 6.1 Code Complexity Constraints

- **Cyclomatic Complexity**: Max 5.
- **Nesting Depth**: Max 3.
- **Function Length**: Max 30 lines.
- **Parameters**: Max 3 per function.

### 6.2 TDD Requirements

- Write tests in `src/test/suite/addPlugin.test.ts`.
- Focus on mocking `MarketplaceService` to verify the extension UI flow.

### 6.3 Architecture Patterns

- **Service Layer**: Keep data logic in `MarketplaceService`.
- **Helper Functions**: Split the UI flow into granular functions (e.g., `_selectPlugin`, `_confirmInstallation`, `_performInstallation`).

### 6.4 Files to Create/Modify

- `[MODIFY]` `src/extension.ts`: Implement `_handleAddPlugin` and helper functions.
- `[MODIFY]` `src/services/marketplaceService.ts`: Add `Plugin` interface updates if needed and `installPlugin` stub.
- `[NEW]` `src/test/suite/addPlugin.test.ts`: TDD tests.

## 7. Non-Goals

- Actual binary/file-level installation of plugins (logic is stubbed).
- Uninstalling plugins (covered by `removePlugin` command, out of scope here).

## 8. Success Metrics

- Command successfully lists plugins.
- UI follows the "Details -> Confirmation -> Progress" flow.
- Code passes all complexity and linting rules.
- Tests verify the logic flow.
