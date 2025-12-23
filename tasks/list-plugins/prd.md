# PRD: listPlugins Feature

## Introduction/Overview

The `listPlugins` feature allows users to browse all available plugins across all configured marketplaces. This provides a centralized view of what can be installed or managed within the extension.

## Goals

- Provide a user-friendly interface to list all plugins from multiple marketplaces.
- Handle missing or invalid marketplace configurations gracefully.
- Ensure the plugin list is easily searchable and readable.
- Leverage existing `MarketplaceService` and schemas for consistency.
- Follow the established pattern of separating service logic from VS Code command handlers.

## User Stories

- **As a user**, I want to see a list of all available plugins so I can know what options are available to me.
- **As a user**, I want to see which marketplace each plugin belongs to.
- **As a user**, I want to see a brief description of each plugin before deciding to act on it.
- **As a user**, if I haven't added any marketplaces yet, I want to be informed on how to do so.

## Functional Requirements

1. **Command Implementation**: Implement the `vscode-copilot-marketplace.listPlugins` command handler in `src/extension.ts`. It should replace the current placeholder `_handleListPlugins`.
2. **Configuration Access**:
   - Use `MarketplaceService` to access configured marketplaces.
   - The service should read the manifest file at `~/.copilot/plugins/known_marketplaces.json`.
   - If no marketplaces are configured, show an error message: "no market places are availible please use add marketplace option".
3. **Marketplace Discovery & Plugin Extraction**:
   - For each marketplace entry in the manifest:
     - Use its `installLocation`.
     - Read `.copilot-plugin/marketplace.json`.
     - Validate it against `src/schemas/marketplace-schema.json`.
     - If valid, extract the `plugins` array.
     - Skip marketplaces with missing or invalid `marketplace.json` files.
4. **Plugin Aggregation**:
   - Aggregate all plugins from all valid marketplaces.
   - Each plugin entry must include:
     - `name`: The plugin's name.
     - `description`: The plugin's description.
     - `marketplaceName`: The name of the marketplace it belongs to.
5. **User Interface (QuickPick)**:
   - Display the aggregated list in a VS Code QuickPick.
   - **Label format**: `[Marketplace Name] Plugin Name` (e.g., `[official] my-plugin`).
   - **Description format**: Plugin's `description`.
   - **Sorting**: Sort alphabetically by plugin name (case-insensitive, ignoring the `[Marketplace Name]` prefix for sorting).
6. **Selection Action**:
   - When a plugin is selected, show an Information Message: `Name: [Plugin Name], Marketplace: [Marketplace Name], Description: [Description]`.

## Non-Goals (Out of Scope)

- Installing or uninstalling plugins.
- Editing marketplace configurations.
- Real-time synchronization of marketplaces (updating marketplaces is a separate command).

## Technical Considerations

### Data Structures

New interface in `MarketplaceService`:
```typescript
interface PluginWithMarketplace {
    name: string;
    description: string;
    marketplaceName: string;
}
```

### MarketplaceService

Add `public async getAllPlugins(): Promise<PluginWithMarketplace[]>`:
- Logic for reading manifest and iterating through marketplaces.
- Uses `Ajv` for schema validation (matching existing `addMarketplace` logic).

### Error Handling

- If manifest reading fails or is empty: throw/return appropriate state to trigger "no market places are availible..." error.
- If a specific marketplace fails (e.g., file not found): log to console and continue.

### Testing

- Use `sinon` for mocking `fs` and `os.homedir`.
- Test cases:
  - No marketplaces configured.
  - Multiple marketplaces with plugins.
  - Marketplaces with missing `marketplace.json`.
  - Marketplaces with invalid `marketplace.json`.
  - Alphabetical sorting.

## Success Metrics

- Successfully listing plugins from multiple local directories.
- Correct error message shown when no marketplaces exist.
- Alphabetical sorting works correctly by plugin name.
- Selecting a plugin displays the correct information message.

## Open Questions

- None.