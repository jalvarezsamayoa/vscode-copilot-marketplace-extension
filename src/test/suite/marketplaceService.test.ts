import * as assert from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MarketplaceService } from '../../services/marketplaceService';
import { SimpleGit } from 'simple-git';

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

    // ... existing tests ...

    test('should add marketplace from valid local source', async () => {
        const mockHomeDir = () => '/mock/home';
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'valid-local-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        // Cache dir check
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'marketplace', 'cache')).resolves(undefined);
        // Collision check (should fail -> ENOENT means no collision)
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'marketplace', 'cache', 'valid-local-marketplace')).rejects(new Error('ENOENT'));

        const fsReadFileStub = sandbox.stub(fs.promises, 'readFile').withArgs(path.join(localSource, '.copilot-plugin', 'marketplace.json')).resolves(manifestContent);
        const fsCpStub = sandbox.stub(fs.promises, 'cp').resolves();

        const service = new MarketplaceService(mockHomeDir);
        const name = await service.addMarketplace(localSource);

        assert.strictEqual(name, 'valid-local-marketplace');
        assert.ok(fsCpStub.calledWith(localSource, path.join('/mock/home', '.copilot', 'marketplace', 'cache', 'valid-local-marketplace'), { recursive: true }));
    });

    test('should fail if schema validation fails', async () => {
        const mockHomeDir = () => '/mock/home';
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'Invalid Name With Spaces', // Invalid pattern
            owner: { name: 'me' },
            plugins: []
        });

        sandbox.stub(fs.promises, 'access').resolves(undefined); // simplified
        sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);

        const service = new MarketplaceService(mockHomeDir);
        
        await assert.rejects(async () => {
            await service.addMarketplace(localSource);
        }, /Manifest validation failed/);
    });

    test('should fail if marketplace already exists', async () => {
        const mockHomeDir = () => '/mock/home';
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'existing-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        // Manifest read
        sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);
        
        // Collision check: resolve means it exists
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'marketplace', 'cache', 'existing-marketplace')).resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        
        await assert.rejects(async () => {
            await service.addMarketplace(localSource);
        }, /Marketplace 'existing-marketplace' already exists/);
    });

    test('should add marketplace from valid git source', async () => {
        const mockHomeDir = () => '/mock/home';
        const gitUrl = 'https://github.com/owner/repo.git';
        const manifestContent = JSON.stringify({
            name: 'valid-git-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        // Mocks for fs
        const fsMkdtempStub = sandbox.stub(fs.promises, 'mkdtemp').resolves('/tmp/copilot-mp-123');
        const fsRmStub = sandbox.stub(fs.promises, 'rm').resolves();
        const fsReadFileStub = sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);
        
        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        // Cache dir check
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'marketplace', 'cache')).resolves(undefined);
        // Collision check
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'marketplace', 'cache', 'valid-git-marketplace')).rejects(new Error('ENOENT'));

        // Mock Git
        const gitMock = {
            clone: sandbox.stub().resolves(),
            checkout: sandbox.stub().resolves()
        };
        
        const gitFactory = sandbox.stub().returns(gitMock as unknown as SimpleGit);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        const name = await service.addMarketplace(gitUrl);

        assert.strictEqual(name, 'valid-git-marketplace');
        assert.ok(gitMock.clone.calledWith(gitUrl, '/tmp/copilot-mp-123', ['--depth', '1', '--no-checkout']));
        assert.ok(gitMock.checkout.calledWith(['HEAD', '--', '.copilot-plugin/marketplace.json']));
        
        // Check install clone
        assert.ok(gitMock.clone.calledWith(gitUrl, path.join('/mock/home', '.copilot', 'marketplace', 'cache', 'valid-git-marketplace')));
        
        assert.ok(fsRmStub.calledWith('/tmp/copilot-mp-123', { recursive: true, force: true }));
    });

    test('should return QuickPickItems with name and description', async () => {
        const mockHomeDir = () => '/mock/home';
        const cachePath = path.join('/mock/home', '.copilot', 'marketplace', 'cache');

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        // Mock access to succeed for cache dir
        fsAccessStub.withArgs(cachePath).resolves(undefined);
        
        const fsReaddirStub = sandbox.stub(fs.promises, 'readdir').resolves(['mp1'] as any);
        
        const mp1Path = path.join(cachePath, 'mp1');
        const mp1ManifestPath = path.join(mp1Path, '.copilot-plugin', 'marketplace.json');
        
        const fsStatStub = sandbox.stub(fs.promises, 'stat');
        fsStatStub.withArgs(mp1Path).resolves({ isDirectory: () => true } as fs.Stats);
        
        // Mock manifest content with description
        const manifestContent = JSON.stringify({
            name: 'Marketplace 1',
            metadata: {
                description: 'Description 1'
            }
        });
        
        sandbox.stub(fs.promises, 'readFile').withArgs(mp1ManifestPath, 'utf-8').resolves(manifestContent);
        // Access check for manifest
        fsAccessStub.withArgs(mp1ManifestPath).resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        const result: any[] = await service.getMarketplaces();
        
        // This is expected to fail initially as it returns string[]
        assert.strictEqual(result.length, 1);
        // assert structure matches QuickPickItem
        assert.strictEqual(result[0].label, 'Marketplace 1');
        assert.strictEqual(result[0].detail, 'Description 1');
    });
});
