import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { MarketplaceService } from '../../services/marketplaceService';

async function runEmptyTest(sandbox: sinon.SinonSandbox) {
    sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves([]);
    const showErrorStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves(undefined);

    await vscode.commands.executeCommand('vscode-copilot-marketplace.listPlugins');

    assert.ok(showErrorStub.calledWith('No plugins found. Please add a marketplace first.'), 'showErrorMessage should be called');
}

async function runFormattingTest(sandbox: sinon.SinonSandbox) {
    const plugins = [
        { name: 'plugin1', marketplaceName: 'mp1', description: 'desc1' },
        { name: 'plugin2', marketplaceName: 'mp2', description: 'desc2' }
    ];

    sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves(plugins as any);
    const showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);

    await vscode.commands.executeCommand('vscode-copilot-marketplace.listPlugins');

    assert.ok(showQuickPickStub.calledOnce, 'showQuickPick should be called');
    const items = showQuickPickStub.firstCall.args[0] as vscode.QuickPickItem[];
    assert.strictEqual(items[0].label, 'plugin1');
    assert.strictEqual(items[0].description, '[mp1]');
    assert.strictEqual(items[0].detail, 'desc1');
}

async function runDetailsTest(sandbox: sinon.SinonSandbox) {
    const plugins = [
        { name: 'plugin1', marketplaceName: 'mp1', description: 'desc1', version: '1.0.0' }
    ];

    sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves(plugins as any);
    sandbox.stub(vscode.window, 'showQuickPick').resolves({
        label: 'plugin1',
        description: '[mp1]',
        detail: 'desc1',
        plugin: plugins[0]
    } as any);

    const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined);

    await vscode.commands.executeCommand('vscode-copilot-marketplace.listPlugins');

    const expectedMsg = 'Plugin: plugin1\nVersion: 1.0.0\nMarketplace: mp1\nDescription: desc1';
    assert.ok(showInfoStub.calledWith(expectedMsg), 'showInformationMessage should be called with details');
}

suite('List Plugins Command Test Suite', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should show error message when no plugins are found', () => runEmptyTest(sandbox));
    test('should show QuickPick with correctly formatted plugins', () => runFormattingTest(sandbox));
    test('should show plugin details when selected', () => runDetailsTest(sandbox));
});
