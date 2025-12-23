import * as assert from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { MarketplaceService } from '../../services/marketplaceService';

suite('MarketplaceService Test Suite', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should create cache directory if it does not exist', async () => {
        const mockHomeDir = () => '/mock/home';
        const fsAccessStub = sandbox.stub(fs.promises, 'access').rejects(new Error('ENOENT'));
        const fsMkdirStub = sandbox.stub(fs.promises, 'mkdir').resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        await service.ensureCacheDirectoryExists();

        const expectedPath = path.join('/mock/home', '.copilot', 'marketplace', 'cache');
        
        assert.ok(fsMkdirStub.calledOnceWith(expectedPath, { recursive: true }), 'fs.mkdir was not called with correct path and options');
    });

    test('should return empty list if cache is empty', async () => {
        const mockHomeDir = () => '/mock/home';
        const cachePath = path.join('/mock/home', '.copilot', 'marketplace', 'cache');

        // Mock access to succeed for cache dir
        sandbox.stub(fs.promises, 'access').withArgs(cachePath).resolves(undefined);
        
        const fsReaddirStub = sandbox.stub(fs.promises, 'readdir').resolves([]);
        
        const service = new MarketplaceService(mockHomeDir);
        const result = await service.getMarketplaces();
        
        assert.deepStrictEqual(result, [], 'Should return empty array');
        assert.ok(fsReaddirStub.calledWith(cachePath), 'readdir called with wrong path');
    });

    test('should ignore directories without marketplace.json', async () => {
        const mockHomeDir = () => '/mock/home';
        const cachePath = path.join('/mock/home', '.copilot', 'marketplace', 'cache');
        
        // Mock access to succeed for cache dir, but fail for manifest
        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(cachePath).resolves(undefined);
        fsAccessStub.withArgs(path.join(cachePath, 'dir1', '.copilot-plugin', 'marketplace.json')).rejects(new Error('ENOENT'));

        const fsReaddirStub = sandbox.stub(fs.promises, 'readdir').resolves(['dir1'] as any);
        
        // Mock stat to say it's a directory
        const fsStatStub = sandbox.stub(fs.promises, 'stat').resolves({
            isDirectory: () => true
        } as fs.Stats);

        const service = new MarketplaceService(mockHomeDir);
        const result = await service.getMarketplaces();

        assert.deepStrictEqual(result, [], 'Should return empty array for invalid plugins');
        
        // Verify stat was called for the directory
        assert.ok(fsStatStub.calledWith(path.join(cachePath, 'dir1')), 'stat not called for subdir');
    });

    test('should return marketplace names from valid manifests', async () => {
        const mockHomeDir = () => '/mock/home';
        const cachePath = path.join('/mock/home', '.copilot', 'marketplace', 'cache');
        const manifestPath = path.join(cachePath, 'pluginA', '.copilot-plugin', 'marketplace.json');

        const fsAccessStub = sandbox.stub(fs.promises, 'access').resolves(undefined);
        
        sandbox.stub(fs.promises, 'readdir').resolves(['pluginA'] as any);
        sandbox.stub(fs.promises, 'stat').resolves({ isDirectory: () => true } as fs.Stats);
        
        const fsReadFileStub = sandbox.stub(fs.promises, 'readFile').withArgs(manifestPath).resolves('{"name": "Plugin A"}');

        const service = new MarketplaceService(mockHomeDir);
        const result = await service.getMarketplaces();

        assert.deepStrictEqual(result, ['Plugin A'], 'Should return parsed name');
        assert.ok(fsReadFileStub.calledOnce, 'readFile not called');
    });
});
