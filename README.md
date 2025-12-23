# vscode-copilot-marketplace

VS Code extension for managing and discovering Copilot extensions and agents.

## Features

### Marketplace Management

- **Add Marketplaces**: Install marketplaces from Git repositories or local directories via the "Add Copilot Marketplace" command.
- **List Marketplaces**: View installed marketplaces with the "List Marketplaces" command.
- **List Plugins**: Aggregate and view all plugins available from your installed marketplaces via the "List Plugins" command.
- **Add Plugin**: Browse and install plugins from all available marketplaces via the "Add Copilot Plugin" command.
- **Update Marketplaces**: Pull the latest changes from git-based marketplaces via the "Update Copilot Marketplace" command.
- **Marketplace Persistence**: Automatically tracks installed marketplaces in `~/.copilot/plugins/known_marketplaces.json` with metadata including source, installation location, and last update timestamp.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [Visual Studio Code](https://code.visualstudio.com/)

### Building the Extension

1. Clone the repository:

   ```bash
   git clone https://github.com/jalvarezsamayoa/vscode-copilot-marketplace-extension.git
   cd vscode-copilot-marketplace-extension
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile the extension:

   ```bash
   npm run compile
   ```

   Or start the watch mode to automatically recompile on changes:

   ```bash
   npm run watch
   ```

### Testing

#### Unit Tests

Run the full test suite using:

```bash
npm test
```

#### Manual Testing (Extension Development Host)

To test the extension features manually within VS Code:

1. Open the project folder in VS Code.
2. Press `F5` (or go to **Run and Debug** and click **Run Extension**).
3. A new window **[Extension Development Host]** will open with the extension loaded.
4. You can now execute the Copilot Marketplace commands from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).

### Installing Locally

To package the extension and install it locally as a `.vsix` file:

1. Generate the package:

   ```bash
   npx @vscode/vsce package
   ```

2. Install the generated `.vsix` file:

   ```bash
   code --install-extension vscode-copilot-marketplace-0.0.1.vsix
   ```

---

## Release Notes

### 0.0.1

Initial release of the VS Code Copilot Marketplace extension.

- Marketplace management (Add, List, Update, Remove).
- Plugin discovery and installation from marketplaces.
- Local persistence for configuration.

---

## Documentation

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)

**Enjoy!**
