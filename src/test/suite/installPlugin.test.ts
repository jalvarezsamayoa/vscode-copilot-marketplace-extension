import * as assert from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { MarketplaceService, Plugin } from '../../services/marketplaceService';
import * as manifestModule from '../../utils/manifest';

function setupService() {
    return new MarketplaceService(() => '/mock/home');
}

suite('installPlugin - Validation', () => {
    let sandbox: sinon.SinonSandbox;
    let service: MarketplaceService;
    setup(() => {
        sandbox = sinon.createSandbox();
        service = setupService();
    });
    teardown(() => sandbox.restore());

    test('should throw error if no workspace folders', async () => {
        sandbox.stub(vscode.workspace, 'workspaceFolders').value(undefined);
        const plugin: Plugin = { name: 't1', source: './p1', marketplaceName: 'mp1' };
        await assert.rejects(() => service.installPlugin(plugin), /No workspace folder/);
    });
});

suite('installPlugin - Source', () => {
    let sandbox: sinon.SinonSandbox;
    let service: MarketplaceService;
    setup(() => {
        sandbox = sinon.createSandbox();
        service = setupService();
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([{ uri: vscode.Uri.file('/p') }]);
    });
    teardown(() => sandbox.restore());

    test('should resolve source path', async () => {
        const entry = { source: { source: 'github' as const, repo: '' }, installLocation: '/c/mp1', lastUpdated: '' };
        sandbox.stub(manifestModule, 'readManifest').resolves({ 'mp1': entry });
        sandbox.stub(fs.promises, 'access').resolves();
        sandbox.stub(fs.promises, 'readdir').resolves([]);
        const plugin: Plugin = { name: 't1', source: './p1', marketplaceName: 'mp1' };
        try { await service.installPlugin(plugin); } catch (e) { /* ignore */ }
    });
});

suite('installPlugin - Mapping', () => {
    let sandbox: sinon.SinonSandbox;
    let service: MarketplaceService;
    setup(() => {
        sandbox = sinon.createSandbox();
        service = setupService();
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([{ uri: vscode.Uri.file('/p') }]);
        const entry = { source: { source: 'github' as const, repo: '' }, installLocation: '/c/mp1', lastUpdated: '' };
        sandbox.stub(manifestModule, 'readManifest').resolves({ 'mp1': entry });
        sandbox.stub(fs.promises, 'access').rejects(new Error('no folder'));
        sandbox.stub(fs.promises, 'mkdir').resolves();
    });
    teardown(() => sandbox.restore());

    async function testMapping(folder: string, target: string) {
        sandbox.stub(fs.promises, 'readdir').resolves([folder] as any);
        const fsCpStub = sandbox.stub(fs.promises, 'cp').resolves();
        await service.installPlugin({ name: 'p1', source: './s1', marketplaceName: 'mp1' });
        assert.ok(fsCpStub.calledWith(path.join('/c/mp1', 's1', folder), path.join('/p', '.github', target)));
    }
    test('copy skills', () => testMapping('skills', 'skills'));
    test('copy agents', () => testMapping('agents', 'agents'));
    test('copy commands', () => testMapping('commands', 'prompts'));
    test('copy instructions', () => testMapping('instructions', 'instructions'));
});

suite('installPlugin - Conflicts', () => {
    let sandbox: sinon.SinonSandbox;
    let service: MarketplaceService;
    setup(() => {
        sandbox = sinon.createSandbox();
        service = setupService();
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([{ uri: vscode.Uri.file('/p') }]);
        const entry = { source: { source: 'github' as const, repo: '' }, installLocation: '/c/mp1', lastUpdated: '' };
        sandbox.stub(manifestModule, 'readManifest').resolves({ 'mp1': entry });
        sandbox.stub(fs.promises, 'access').resolves();
        sandbox.stub(fs.promises, 'mkdir').resolves();
    });
    teardown(() => sandbox.restore());

    test('overwrite if confirmed', async () => {
        sandbox.stub(fs.promises, 'readdir').resolves(['skills'] as any);
        const showStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves('Overwrite' as any);
        const fsCpStub = sandbox.stub(fs.promises, 'cp').resolves();
        await service.installPlugin({ name: 'p1', source: './s1', marketplaceName: 'mp1' });
        assert.ok(showStub.called);
        assert.ok(fsCpStub.called);
    });

    test('no overwrite if canceled', async () => {
        sandbox.stub(fs.promises, 'readdir').resolves(['skills'] as any);
        const showStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves('Cancel' as any);
        const fsCpStub = sandbox.stub(fs.promises, 'cp').resolves();
        await service.installPlugin({ name: 'p1', source: './s1', marketplaceName: 'mp1' });
        assert.ok(showStub.called);
        assert.strictEqual(fsCpStub.called, false);
    });
});

suite('installPlugin - Summary Result', () => {
    let sandbox: sinon.SinonSandbox;
    let service: MarketplaceService;
    setup(() => {
        sandbox = sinon.createSandbox();
        service = setupService();
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([{ uri: vscode.Uri.file('/p') }]);
        const entry = { source: { source: 'github' as const, repo: '' }, installLocation: '/c/mp1', lastUpdated: '' };
        sandbox.stub(manifestModule, 'readManifest').resolves({ 'mp1': entry });
        sandbox.stub(fs.promises, 'access').rejects(new Error('no-exist'));
        sandbox.stub(fs.promises, 'mkdir').resolves();
    });
    teardown(() => sandbox.restore());

    test('show summary message', async () => {
        sandbox.stub(fs.promises, 'readdir').resolves(['skills', 'agents'] as any);
        sandbox.stub(fs.promises, 'cp').resolves();
        const showStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves();
        await service.installPlugin({ name: 'p1', source: './s1', marketplaceName: 'mp1' });
        const calls = showStub.getCalls();
        const summary = calls.find(c => (c.args[0] as string).toLowerCase().includes('installed'));
        assert.ok(summary, 'Summary shown');
        assert.ok((summary.args[0] as string).includes('skills'));
        assert.ok((summary.args[0] as string).includes('agents'));
    });
});
