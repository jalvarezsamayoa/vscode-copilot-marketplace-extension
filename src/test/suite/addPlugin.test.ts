import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { MarketplaceService } from '../../services/marketplaceService';

suite('MarketplaceService - installPlugin', () => {
    test('1.1: installPlugin should exist as a function', () => {
        const service = new MarketplaceService();
        assert.strictEqual(typeof (service as any).installPlugin, 'function');
    });

    test('1.3: installPlugin should return a Promise', () => {
        const service = new MarketplaceService();
        const result = (service as any).installPlugin({ name: 'test' } as any);
        assert.ok(result instanceof Promise);
    });
});

suite('Add Plugin Command - Selection', () => {
    let sandbox: sinon.SinonSandbox;
    setup(() => { sandbox = sinon.createSandbox(); });
    teardown(() => { sandbox.restore(); });

    test('2.1: addPlugin command should fetch plugins and show QuickPick', async () => {
        sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves([
            { name: 'Plugin 1', marketplaceName: 'MP 1', description: 'Desc 1' } as any
        ]);
        const showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);
        await vscode.commands.executeCommand('vscode-copilot-marketplace.addPlugin');
        assert.ok(showQuickPickStub.called, 'showQuickPick should be called');
    });
});

suite('Add Plugin Command - Selection Errors', () => {
    let sandbox: sinon.SinonSandbox;
    setup(() => { sandbox = sinon.createSandbox(); });
    teardown(() => { sandbox.restore(); });

    test('2.3: addPlugin should show error message when no plugins found', async () => {
        sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves([]);
        const showErrorStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves(undefined);
        await vscode.commands.executeCommand('vscode-copilot-marketplace.addPlugin');
        assert.ok(showErrorStub.calledWith('No plugins found. Please add a marketplace first.'));
    });
});

suite('Add Plugin Command - Details', () => {
    let sandbox: sinon.SinonSandbox;
    setup(() => { sandbox = sinon.createSandbox(); });
    teardown(() => { sandbox.restore(); });

    test('3.1: should show plugin details', async () => {
        const plugin = { name: 'P1', version: '1.0.0', marketplaceName: 'M1', description: 'D1' };
        sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves([plugin as any]);
        const showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick').resolves({ label: 'P1', plugin } as any);
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined);

        await vscode.commands.executeCommand('vscode-copilot-marketplace.addPlugin');

        const expectedMsg = 'Plugin: P1\nVersion: 1.0.0\nMarketplace: M1\nDescription: D1';
        assert.ok(showInfoStub.calledWith(expectedMsg), 'Information message should be shown');
    });
});

suite('Add Plugin Command - Installation', () => {
    let sandbox: sinon.SinonSandbox;
    setup(() => { sandbox = sinon.createSandbox(); });
    teardown(() => { sandbox.restore(); });

    test('4.1: should call withProgress and installPlugin', async function () {
        this.timeout(5000);
        const plugin = { name: 'P1' };
        sandbox.stub(MarketplaceService.prototype, 'getAllPlugins').resolves([plugin as any]);
        const installPluginStub = sandbox.stub(MarketplaceService.prototype, 'installPlugin').resolves();

        const showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
        showQuickPickStub.onFirstCall().resolves({ label: 'P1', plugin } as any);
        showQuickPickStub.onSecondCall().resolves({ label: 'Yes' } as any);

        sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined);
        const withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(async (options, task) => {
            return task({ report: () => { } } as any, new vscode.CancellationTokenSource().token);
        });

        await vscode.commands.executeCommand('vscode-copilot-marketplace.addPlugin');

        assert.ok(withProgressStub.calledOnce, 'withProgress should be called');
        assert.ok(installPluginStub.calledOnce, 'installPlugin should be called');
    });
});
