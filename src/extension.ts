// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MarketplaceService } from './services/marketplaceService';

async function _handleListMarketplace(): Promise<void> {
	const service = new MarketplaceService();
	const marketplaces = await service.getMarketplaces();

	if (marketplaces.length === 0) {
		vscode.window.showErrorMessage(
			'No marketplaces found. Please add a marketplace repository first.'
		);
		return;
	}

	const selection = await vscode.window.showQuickPick(marketplaces, {
		placeHolder: 'Select a marketplace'
	});

	if (selection) {
		vscode.window.showInformationMessage(`Selected: ${selection.label}`);
	}
}

async function _getMarketplaceInput(): Promise<string | undefined> {
	return vscode.window.showInputBox({
		prompt: 'Enter Marketplace Git URL or Local Path',
		placeHolder: 'https://github.com/owner/repo.git or /path/to/local/dir',
		ignoreFocusOut: true
	});
}

async function _performAddMarketplace(input: string): Promise<void> {
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Adding Marketplace...',
		cancellable: false
	}, async (progress) => {
		const service = new MarketplaceService();
		try {
			progress.report({ message: 'Fetching and validating manifest...' });
			const name = await service.addMarketplace(input);
			vscode.window.showInformationMessage(
				`Marketplace '${name}' added successfully.`
			);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`Failed to add marketplace: ${msg}`);
		}
	});
}

async function _handleAddMarketplace(): Promise<void> {
	const input = await _getMarketplaceInput();
	if (input) {
		await _performAddMarketplace(input);
	}
}

async function _selectMarketplaceFromUser(
	action: string
): Promise<vscode.QuickPickItem | undefined> {
	const service = new MarketplaceService();
	const marketplaces = await service.getMarketplaces();

	if (marketplaces.length === 0) {
		vscode.window.showErrorMessage(`No marketplaces found to ${action}.`);
		return;
	}

	return vscode.window.showQuickPick(marketplaces, {
		placeHolder: `Select a marketplace to ${action}`
	});
}

async function _getRemovalConfirmation(label: string): Promise<boolean> {
	const confirmationOptions: vscode.QuickPickItem[] = [
		{ label: 'Yes' },
		{ label: 'No' }
	];

	const confirmation = await vscode.window.showQuickPick(confirmationOptions, {
		placeHolder: `Remove ${label}?`
	});

	return confirmation?.label === 'Yes';
}

async function _performRemoval(label: string): Promise<void> {
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Removing ${label}...`,
		cancellable: false
	}, async () => {
		const service = new MarketplaceService();
		try {
			await service.removeMarketplace(label);
			vscode.window.showInformationMessage(
				`Marketplace '${label}' has been successfully removed.`
			);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`Failed to remove marketplace: ${msg}`);
		}
	});
}

async function _handleRemoveMarketplace(): Promise<void> {
	const selection = await _selectMarketplaceFromUser('remove');
	if (!selection) {
		return;
	}

	const confirmed = await _getRemovalConfirmation(selection.label);
	if (confirmed) {
		await _performRemoval(selection.label);
	}
}

async function _performUpdateMarketplace(label: string): Promise<void> {
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Updating ${label}...`,
		cancellable: false
	}, async () => {
		const service = new MarketplaceService();
		try {
			await service.updateMarketplace(label);
			vscode.window.showInformationMessage(
				`Marketplace '${label}' updated successfully.`
			);
		} catch (error) {
			if (error instanceof Error && error.message === 'NOT_A_GIT_REPO') {
				vscode.window.showInformationMessage(
					'This only works for git repositories.'
				);
			} else {
				const msg = error instanceof Error ? error.message : String(error);
				vscode.window.showErrorMessage(
					`Failed to update marketplace: ${msg}`
				);
			}
		}
	});
}

async function _handleUpdateMarketplace(): Promise<void> {
	const selection = await _selectMarketplaceFromUser('update');
	if (selection) {
		await _performUpdateMarketplace(selection.label);
	}
}

export async function _handleListPlugins(service = new MarketplaceService()): Promise<void> {
	const plugins = await service.getAllPlugins();

	if (plugins.length === 0) {
		vscode.window.showErrorMessage('No plugins found. Please add a marketplace first.');
		return;
	}

	const items = plugins.map(_formatPluginQuickPickItem);
	const selection = await vscode.window.showQuickPick(items, {
		placeHolder: 'Select a plugin to view details'
	});

	if (selection) {
		await _showPluginDetails(selection.plugin);
	}
}

function _formatPluginQuickPickItem(p: any): vscode.QuickPickItem & { plugin: any } {
	return {
		label: p.name,
		description: `[${p.marketplaceName}]`,
		detail: p.description || '',
		plugin: p
	};
}

async function _showPluginDetails(p: any): Promise<void> {
	const details = `Plugin: ${p.name}\nVersion: ${p.version || 'N/A'}\nMarketplace: ${p.marketplaceName}\nDescription: ${p.description || 'No description'}`;
	await vscode.window.showInformationMessage(details);
}

async function _getInstallationConfirmation(pluginName: string): Promise<boolean> {
	const confirmationOptions: vscode.QuickPickItem[] = [
		{ label: 'Yes' },
		{ label: 'No' }
	];

	const confirmation = await vscode.window.showQuickPick(confirmationOptions, {
		placeHolder: `Install ${pluginName}?`
	});

	return confirmation?.label === 'Yes';
}

async function _performInstallation(plugin: any): Promise<void> {
	await vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Installing ${plugin.name}...`,
		cancellable: false
	}, async () => {
		const service = new MarketplaceService();
		try {
			await service.installPlugin(plugin);
			vscode.window.showInformationMessage(
				`Plugin '${plugin.name}' installed successfully.`
			);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`Failed to install plugin: ${msg}`);
		}
	});
}

export async function _handleAddPlugin(service = new MarketplaceService()): Promise<void> {
	const plugins = await service.getAllPlugins();

	if (plugins.length === 0) {
		vscode.window.showErrorMessage('No plugins found. Please add a marketplace first.');
		return;
	}

	const items = plugins.map(p => ({
		label: p.name,
		description: `[${p.marketplaceName}]`,
		detail: p.description || '',
		plugin: p
	}));

	const selection = await vscode.window.showQuickPick(items, {
		placeHolder: 'Select a plugin to install'
	});

	if (selection) {
		await _showPluginDetails(selection.plugin);
		const confirmed = await _getInstallationConfirmation(selection.plugin.name);
		if (confirmed) {
			await _performInstallation(selection.plugin);
		}
	}
}

function _handleRemovePlugin(): void {
	vscode.window.showInformationMessage('Remove a plugin.');
}

function _registerCommand(
	context: vscode.ExtensionContext,
	commandId: string,
	handler: (...args: any[]) => any
): void {
	const disposable = vscode.commands.registerCommand(commandId, handler);
	context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "vscode-copilot-marketplace" is now active!'
	);

	_registerCommand(context, 'vscode-copilot-marketplace.listMarketplace', _handleListMarketplace);
	_registerCommand(context, 'vscode-copilot-marketplace.addMarketplace', _handleAddMarketplace);
	_registerCommand(context, 'vscode-copilot-marketplace.removeMarketplace', _handleRemoveMarketplace);
	_registerCommand(context, 'vscode-copilot-marketplace.updateMarketplace', _handleUpdateMarketplace);
	_registerCommand(context, 'vscode-copilot-marketplace.listPlugins', _handleListPlugins);
	_registerCommand(context, 'vscode-copilot-marketplace.addPlugin', _handleAddPlugin);
	_registerCommand(context, 'vscode-copilot-marketplace.removePlugin', _handleRemovePlugin);
}

// This method is called when your extension is deactivated
export function deactivate() { }
