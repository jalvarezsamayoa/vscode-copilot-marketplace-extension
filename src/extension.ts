// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MarketplaceService } from './services/marketplaceService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-copilot-marketplace" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const listMarketplace = vscode.commands.registerCommand('vscode-copilot-marketplace.listMarketplace', async () => {
		const service = new MarketplaceService();
		const marketplaces = await service.getMarketplaces();

		if (marketplaces.length === 0) {
			vscode.window.showErrorMessage('No marketplaces found. Please add a marketplace repository first.');
		} else {			
			const selection = await vscode.window.showQuickPick(marketplaces, {
				placeHolder: 'Select a marketplace'
			});
			
			if (selection) {
				vscode.window.showInformationMessage(`Selected: ${selection.label}`);
			}
		}
	});

	// Add a Marketplace command
	const addMarketplace = vscode.commands.registerCommand('vscode-copilot-marketplace.addMarketplace', async () => {
		const input = await vscode.window.showInputBox({
			prompt: 'Enter Marketplace Git URL or Local Path',
			placeHolder: 'https://github.com/owner/repo.git or /path/to/local/dir',
			ignoreFocusOut: true
		});

		if (!input) {
			return;
		}

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Adding Marketplace...',
			cancellable: false
		}, async (progress) => {
			const service = new MarketplaceService();
			try {
				progress.report({ message: 'Fetching and validating manifest...' });
				const name = await service.addMarketplace(input);
				vscode.window.showInformationMessage(`Marketplace '${name}' added successfully.`);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to add marketplace: ${error instanceof Error ? error.message : String(error)}`);
			}
		});
	});

	const removeMarketplace = vscode.commands.registerCommand('vscode-copilot-marketplace.removeMarketplace', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Remove a marketplace repository.');
	});

	const updateMarketplace = vscode.commands.registerCommand('vscode-copilot-marketplace.updateMarketplace', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Update a marketplace repository.');
	});

	const listPlugins = vscode.commands.registerCommand('vscode-copilot-marketplace.listPlugins', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('List of installed plugins.');
	});

	const addPlugin = vscode.commands.registerCommand('vscode-copilot-marketplace.addPlugin', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Add a new plugin.');
	});

	const removePlugin = vscode.commands.registerCommand('vscode-copilot-marketplace.removePlugin', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Remove a plugin.');
	});

	// Add the commands to the context subscriptions

	context.subscriptions.push(listMarketplace);
	context.subscriptions.push(addMarketplace);
	context.subscriptions.push(removeMarketplace);
	context.subscriptions.push(listPlugins);
	context.subscriptions.push(addPlugin);
	context.subscriptions.push(removePlugin);
}

// This method is called when your extension is deactivated
export function deactivate() {}
