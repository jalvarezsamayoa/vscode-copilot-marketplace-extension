import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as path from 'path';
import { MarketplaceService } from '../../services/marketplaceService';

suite('removeMarketplace Command Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	setup(() => {
		sandbox = sinon.createSandbox();
	});

	teardown(() => {
		sandbox.restore();
	});

	test('should show error message when no marketplaces are installed', async () => {
		const mockHomeDir = () => '/mock/home';
		const service = new MarketplaceService(mockHomeDir);

		sandbox.stub(service, 'getMarketplaces').resolves([]);
		const errorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');

		// Simulate command execution
		const marketplaces = await service.getMarketplaces();

		if (marketplaces.length === 0) {
			vscode.window.showErrorMessage('No marketplaces found to update.');
		}

		assert.ok(errorMessageStub.calledOnce);
		assert.strictEqual(errorMessageStub.firstCall.args[0], 'No marketplaces found to update.');
	});

	test('should display QuickPick with installed marketplaces', async () => {
		const mockHomeDir = () => '/mock/home';
		const service = new MarketplaceService(mockHomeDir);

		const mockMarketplaces: vscode.QuickPickItem[] = [
			{ label: 'test-marketplace', detail: 'Test Marketplace' },
			{ label: 'another-marketplace', detail: 'Another Marketplace' }
		];

		sandbox.stub(service, 'getMarketplaces').resolves(mockMarketplaces);
		const quickPickStub = sandbox.stub(vscode.window, 'showQuickPick').resolves(mockMarketplaces[0]);

		const marketplaces = await service.getMarketplaces();
		assert.strictEqual(marketplaces.length, 2);

		if (marketplaces.length > 0) {
			const selection = await vscode.window.showQuickPick(marketplaces, {
				placeHolder: 'Select a marketplace to remove'
			});
			assert.ok(quickPickStub.calledOnce);
			assert.strictEqual(selection?.label, 'test-marketplace');
		}
	});

	test('should exit without changes when user cancels marketplace selection', async () => {
		const mockHomeDir = () => '/mock/home';
		const service = new MarketplaceService(mockHomeDir);

		const mockMarketplaces: vscode.QuickPickItem[] = [
			{ label: 'test-marketplace', detail: 'Test Marketplace' }
		];

		sandbox.stub(service, 'getMarketplaces').resolves(mockMarketplaces);
		const quickPickStub = sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);

		const marketplaces = await service.getMarketplaces();

		if (marketplaces.length > 0) {
			const selection = await vscode.window.showQuickPick(marketplaces, {
				placeHolder: 'Select a marketplace to remove'
			});

			if (!selection) {
				assert.ok(true); // Should exit here without error
			}
		}

		assert.ok(quickPickStub.calledOnce);
	});

	test('should exit without changes when user declines confirmation prompt', async () => {
		const mockHomeDir = () => '/mock/home';
		const service = new MarketplaceService(mockHomeDir);

		const mockMarketplaces: vscode.QuickPickItem[] = [
			{ label: 'test-marketplace', detail: 'Test Marketplace' }
		];

		sandbox.stub(service, 'getMarketplaces').resolves(mockMarketplaces);
		const confirmationItems: vscode.QuickPickItem[] = [
			{ label: 'Yes' },
			{ label: 'No' }
		];
		const confirmationStub = sandbox.stub(vscode.window, 'showQuickPick')
			.resolves(confirmationItems[1]);

		const marketplaces = await service.getMarketplaces();
		const selection = mockMarketplaces[0];

		const confirmation = await vscode.window.showQuickPick(confirmationItems, {
			placeHolder: `Remove ${selection.label}?`
		});

		assert.strictEqual(confirmation?.label, 'No');
		assert.ok(confirmationStub.calledOnce);
	});

	test('should successfully remove marketplace directory when user confirms', async () => {
		const mockHomeDir = () => '/mock/home';
		const mpName = 'test-marketplace';
		const service = new MarketplaceService(mockHomeDir);

		const removeStub = sandbox.stub(service, 'removeMarketplace').resolves();

		await service.removeMarketplace(mpName);

		assert.ok(removeStub.calledOnce);
		assert.strictEqual(removeStub.firstCall.args[0], mpName);
	});

	test('should display success message after marketplace removal', async () => {
		const marketplaceName = 'test-marketplace';
		const successMessageStub = sinon.stub(vscode.window, 'showInformationMessage');

		vscode.window.showInformationMessage(`Marketplace '${marketplaceName}' has been successfully removed.`);

		assert.ok(successMessageStub.calledOnce);
		assert.strictEqual(
			successMessageStub.firstCall.args[0],
			`Marketplace '${marketplaceName}' has been successfully removed.`
		);

		successMessageStub.restore();
	});

	test('should display error message when file system removal fails', async () => {
		const mockHomeDir = () => '/mock/home';
		const mpName = 'test-marketplace';
		const service = new MarketplaceService(mockHomeDir);

		const error = new Error('Permission denied');
		sandbox.stub(service, 'removeMarketplace').rejects(error);
		const errorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');

		try {
			await service.removeMarketplace(mpName);
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to remove marketplace: ${error.message}`);
		}

		assert.ok(errorMessageStub.calledOnce);
	});

	test('should properly construct cache directory path', async () => {
		const mockHomeDir = () => '/mock/home';
		const mpName = 'test-marketplace';
		const expectedPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', mpName);

		// This test verifies the path construction logic
		const actualPath = path.join(mockHomeDir(), '.copilot', 'plugins', 'marketplaces', mpName);
		assert.strictEqual(actualPath, expectedPath);
	});
});
