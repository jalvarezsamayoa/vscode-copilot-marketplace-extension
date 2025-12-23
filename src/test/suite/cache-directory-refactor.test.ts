import * as assert from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MarketplaceService } from '../../services/marketplaceService';

suite('Cache Directory Refactor Test Suite', () => {
    let sandbox: sinon.SinonSandbox;
    let originalEnv: string | undefined;

    setup(() => {
        sandbox = sinon.createSandbox();
        originalEnv = process.env.COPILOT_PLUGINS_DIR;
    });

    teardown(() => {
        sandbox.restore();
        process.env.COPILOT_PLUGINS_DIR = originalEnv;
    });

    test('should resolve default cache path to ~/.copilot/plugins/marketplaces', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const fsAccessStub = sandbox.stub(fs.promises, 'access').rejects(new Error('ENOENT'));
        const fsMkdirStub = sandbox.stub(fs.promises, 'mkdir').resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        await service.ensureCacheDirectoryExists();

        const expectedPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');

        assert.ok(fsMkdirStub.calledOnceWith(expectedPath, { recursive: true }),
            'fs.mkdir was not called with expected default path ~/.copilot/plugins/marketplaces');
    });

    test('should use COPILOT_PLUGINS_DIR environment variable if set', async () => {
        const mockHomeDir = () => '/mock/home';
        const customPath = '/custom/marketplace/location';
        process.env.COPILOT_PLUGINS_DIR = customPath;

        const fsAccessStub = sandbox.stub(fs.promises, 'access').rejects(new Error('ENOENT'));
        const fsMkdirStub = sandbox.stub(fs.promises, 'mkdir').resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        await service.ensureCacheDirectoryExists();

        assert.ok(fsMkdirStub.calledOnceWith(customPath, { recursive: true }),
            'fs.mkdir was not called with custom path from COPILOT_PLUGINS_DIR env var');
    });

    test('should create directory at new path location', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        sandbox.stub(fs.promises, 'access').rejects(new Error('ENOENT'));
        const fsMkdirStub = sandbox.stub(fs.promises, 'mkdir').resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        await service.ensureCacheDirectoryExists();

        const expectedPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');
        assert.strictEqual(fsMkdirStub.callCount, 1);
        assert.strictEqual(fsMkdirStub.firstCall.args[0], expectedPath);
        assert.deepStrictEqual(fsMkdirStub.firstCall.args[1], { recursive: true });
    });

    test('should support getMarketplaces with new cache path', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const expectedCachePath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(expectedCachePath).resolves(undefined);

        const fsReaddirStub = sandbox.stub(fs.promises, 'readdir').resolves([]);

        const service = new MarketplaceService(mockHomeDir);
        await service.getMarketplaces();

        assert.ok(fsReaddirStub.calledWith(expectedCachePath),
            'readdir should be called with new cache path');
    });

    test('should support checkCollision with new cache path', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const expectedMarketplacePath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'test-marketplace');

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'plugins', 'marketplaces')).rejects(new Error('ENOENT'));
        fsAccessStub.withArgs(expectedMarketplacePath).rejects(new Error('ENOENT'));

        sandbox.stub(fs.promises, 'mkdir').resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);

        // Access the private checkCollision method through the public addMarketplace flow
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'test-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        sandbox.stub(fs.promises, 'readFile').withArgs(path.join(localSource, '.copilot-plugin', 'marketplace.json')).resolves(manifestContent);
        sandbox.stub(fs.promises, 'cp').resolves();

        // The assertion will verify through the fs.access stub that was called with expectedMarketplacePath
        const name = await service.addMarketplace(localSource);

        assert.ok(fsAccessStub.calledWith(expectedMarketplacePath),
            'collision check should use new cache path');
    });

    test('should support installMarketplace with new cache path', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const localSource = '/local/path';
        const expectedTargetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'test-marketplace');

        const manifestContent = JSON.stringify({
            name: 'test-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        const fsAccessStub = sandbox.stub(fs.promises, 'access').rejects(new Error('ENOENT'));
        sandbox.stub(fs.promises, 'mkdir').resolves(undefined);
        sandbox.stub(fs.promises, 'readFile').withArgs(path.join(localSource, '.copilot-plugin', 'marketplace.json')).resolves(manifestContent);
        const fsCpStub = sandbox.stub(fs.promises, 'cp').resolves();

        const service = new MarketplaceService(mockHomeDir);
        await service.addMarketplace(localSource);

        assert.ok(fsCpStub.calledWith(localSource, expectedTargetPath, { recursive: true }),
            'installMarketplace should use new cache path');
    });

    test('should support updateMarketplace with new cache path', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const expectedTargetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'test-marketplace');

        const gitMock = {
            checkIsRepo: sandbox.stub().resolves(true),
            getRemotes: sandbox.stub().resolves([{ name: 'origin' }]),
            pull: sandbox.stub().resolves()
        };

        const gitFactory = sandbox.stub().returns(gitMock as any);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        await service.updateMarketplace('test-marketplace');

        assert.ok(gitFactory.calledWith(expectedTargetPath),
            'updateMarketplace should initialize git with new cache path');
    });

    test('should support removeMarketplace with new cache path', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const expectedTargetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'test-marketplace');

        const rmStub = sandbox.stub(fs.promises, 'rm').resolves();

        const service = new MarketplaceService(mockHomeDir);
        await service.removeMarketplace('test-marketplace');

        assert.ok(rmStub.calledWith(expectedTargetPath, { recursive: true, force: true }),
            'removeMarketplace should use new cache path');
    });

    test('backward compatibility: marketplace operations work identically with new path', async () => {
        const mockHomeDir = () => '/mock/home';
        delete process.env.COPILOT_PLUGINS_DIR;

        const expectedCachePath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'compat-test-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(expectedCachePath).resolves(undefined);
        fsAccessStub.withArgs(path.join(expectedCachePath, 'compat-test-marketplace')).rejects(new Error('ENOENT'));

        sandbox.stub(fs.promises, 'mkdir').resolves(undefined);
        sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);
        sandbox.stub(fs.promises, 'cp').resolves();

        const service = new MarketplaceService(mockHomeDir);

        // Execute all cache operations
        const name = await service.addMarketplace(localSource);
        assert.strictEqual(name, 'compat-test-marketplace');

        // Reset stubs for getMarketplaces
        fsAccessStub.withArgs(expectedCachePath).resolves(undefined);
        sandbox.stub(fs.promises, 'readdir').resolves([]);

        const marketplaces = await service.getMarketplaces();
        assert.ok(Array.isArray(marketplaces));
    });
});
