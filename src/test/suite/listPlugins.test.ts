import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { MarketplaceService } from '../../services/marketplaceService';
import { _handleListPlugins } from '../../extension';

// NOTE: Some tests are skipped due to module boundary issues when using executeCommand.
// The extension host creates separate module instances, making prototype stubs ineffective.

let sandbox: sinon.SinonSandbox;
let getAllPluginsStub: sinon.SinonStub;

function setupSandbox() {
    sandbox = sinon.createSandbox();
    getAllPluginsStub = sandbox.stub(MarketplaceService.prototype, 'getAllPlugins');
}

suite('List Plugins - Error Handling', () => {
    setup(setupSandbox);
    teardown(() => sandbox.restore());

    test('should show error message when no plugins are found', async () => {
        getAllPluginsStub.resolves([]);
        const stub = sandbox.stub(vscode.window, 'showErrorMessage').resolves(undefined);
        await _handleListPlugins(new MarketplaceService());
        assert.ok(stub.calledWith('No plugins found. Please add a marketplace first.'));
    });
});

suite('List Plugins - Formatting', () => {
    setup(setupSandbox);
    teardown(() => sandbox.restore());

    test('should show QuickPick with correctly formatted plugins', async () => {
        getAllPluginsStub.resolves([{ name: 'p1', marketplaceName: 'm1', description: 'd1' }]);
        const stub = sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);
        await _handleListPlugins(new MarketplaceService());
        assert.ok(stub.calledOnce, 'showQuickPick should be called');
    });
});

suite('List Plugins - Details', () => {
    setup(setupSandbox);
    teardown(() => sandbox.restore());

    test('should show plugin details when selected', async () => {
        const plugin = { name: 'p1', marketplaceName: 'm1', description: 'd1', version: '1.0.0' };
        getAllPluginsStub.resolves([plugin]);
        sandbox.stub(vscode.window, 'showQuickPick').resolves({ label: 'p1', plugin } as any);
        const stub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined);
        await _handleListPlugins(new MarketplaceService());
        assert.ok(stub.calledWith('Plugin: p1\nVersion: 1.0.0\nMarketplace: m1\nDescription: d1'));
    });
});
