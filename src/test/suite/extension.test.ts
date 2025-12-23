import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { MarketplaceService } from '../../services/marketplaceService';

suite('Extension Test Suite', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    test('listMarketplace command should handle selection', async () => {
        // Stub MarketplaceService.getMarketplaces
        sandbox.stub(MarketplaceService.prototype, 'getMarketplaces').resolves([
            { label: 'Marketplace 1', detail: 'Desc 1' },
            { label: 'Marketplace 2', detail: 'Desc 2' }
        ]);

        // Stub showQuickPick to return 'Marketplace 1'
        const showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick').resolves({
            label: 'Marketplace 1',
            detail: 'Desc 1'
        } as any);

        // Stub showInformationMessage
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves(undefined);

        // Execute command
        await vscode.commands.executeCommand('vscode-copilot-marketplace.listMarketplace');

        assert.ok(showQuickPickStub.called, 'showQuickPick should be called');
        assert.ok(showInfoStub.calledWith('Selected: Marketplace 1'), 'showInformationMessage should be called with selection');
    });
});
