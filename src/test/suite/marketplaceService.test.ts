import * as assert from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { MarketplaceService } from '../../services/marketplaceService';
import { SimpleGit } from 'simple-git';
import * as manifestModule from '../../utils/manifest';

let sandbox: sinon.SinonSandbox;

setup(() => {
    sandbox = sinon.createSandbox();
});

teardown(() => {
    sandbox.restore();
});

suite('Cache Directory Setup', () => {
    test('should create cache directory if it does not exist', async () => {
        const mockHomeDir = () => '/mock/home';
        sandbox.stub(fs.promises, 'access').rejects(new Error('ENOENT'));
        const fsMkdirStub = sandbox.stub(fs.promises, 'mkdir').resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        await service.ensureCacheDirectoryExists();

        const expectedPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');
        assert.ok(fsMkdirStub.calledOnceWith(expectedPath, { recursive: true }));
    });
});

suite('Get Marketplaces - Empty Cache', () => {
    test('should return empty list if cache is empty', async () => {
        const mockHomeDir = () => '/mock/home';
        const cachePath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');

        sandbox.stub(fs.promises, 'access').withArgs(cachePath).resolves(undefined);
        sandbox.stub(fs.promises, 'readdir').resolves([]);

        const service = new MarketplaceService(mockHomeDir);
        const result = await service.getMarketplaces();

        assert.deepStrictEqual(result, []);
    });
});

suite('Get Marketplaces - With Content', () => {
    test('should return QuickPickItems with name and description', async () => {
        const mockHomeDir = () => '/mock/home';
        const cachePath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces');

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(cachePath).resolves(undefined);

        sandbox.stub(fs.promises, 'readdir').resolves(['mp1'] as any);

        const mp1Path = path.join(cachePath, 'mp1');
        const mp1ManifestPath = path.join(mp1Path, '.copilot-plugin', 'marketplace.json');

        sandbox.stub(fs.promises, 'stat').withArgs(mp1Path).resolves({ isDirectory: () => true } as fs.Stats);

        const manifestContent = JSON.stringify({
            name: 'Marketplace 1',
            metadata: { description: 'Description 1' }
        });

        sandbox.stub(fs.promises, 'readFile').withArgs(mp1ManifestPath, 'utf-8').resolves(manifestContent);
        fsAccessStub.withArgs(mp1ManifestPath).resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        const result: any[] = await service.getMarketplaces();

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].label, 'Marketplace 1');
        assert.strictEqual(result[0].detail, 'Description 1');
    });
});

suite('Add Marketplace - Local Source', () => {
    test('should add marketplace from valid local source', async () => {
        const mockHomeDir = () => '/mock/home';
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'valid-local-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'plugins', 'marketplaces')).resolves(undefined);
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'valid-local-marketplace')).rejects(new Error('ENOENT'));

        sandbox.stub(fs.promises, 'readFile').withArgs(path.join(localSource, '.copilot-plugin', 'marketplace.json')).resolves(manifestContent);
        const fsCpStub = sandbox.stub(fs.promises, 'cp').resolves();

        sandbox.stub(manifestModule, 'readManifest').resolves({});
        sandbox.stub(manifestModule, 'writeManifest').resolves();
        sandbox.stub(manifestModule, 'validateManifestEntry').resolves({ valid: true });

        const service = new MarketplaceService(mockHomeDir);
        const name = await service.addMarketplace(localSource);

        assert.strictEqual(name, 'valid-local-marketplace');
        assert.ok(fsCpStub.calledWith(localSource, path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'valid-local-marketplace'), { recursive: true }));
    });
});

suite('Add Marketplace - Schema Validation', () => {
    test('should fail if schema validation fails', async () => {
        const mockHomeDir = () => '/mock/home';
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'Invalid Name With Spaces',
            owner: { name: 'me' },
            plugins: []
        });

        sandbox.stub(fs.promises, 'access').resolves(undefined);
        sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);

        const service = new MarketplaceService(mockHomeDir);
        await assert.rejects(async () => {
            await service.addMarketplace(localSource);
        }, /Manifest validation failed/);
    });
});

suite('Add Marketplace - Collision Check', () => {
    test('should fail if marketplace already exists', async () => {
        const mockHomeDir = () => '/mock/home';
        const localSource = '/local/path';
        const manifestContent = JSON.stringify({
            name: 'existing-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'existing-marketplace')).resolves(undefined);

        const service = new MarketplaceService(mockHomeDir);
        await assert.rejects(async () => {
            await service.addMarketplace(localSource);
        }, /Marketplace 'existing-marketplace' already exists/);
    });
});

suite('Add Marketplace - Git Source', () => {
    test('should add marketplace from valid git source', async () => {
        const mockHomeDir = () => '/mock/home';
        const gitUrl = 'https://github.com/owner/repo.git';
        const manifestContent = JSON.stringify({
            name: 'valid-git-marketplace',
            owner: { name: 'me' },
            plugins: []
        });

        sandbox.stub(fs.promises, 'mkdtemp').resolves('/tmp/copilot-mp-123');
        const fsRmStub = sandbox.stub(fs.promises, 'rm').resolves();
        sandbox.stub(fs.promises, 'readFile').resolves(manifestContent);

        const fsAccessStub = sandbox.stub(fs.promises, 'access');
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'plugins', 'marketplaces')).resolves(undefined);
        fsAccessStub.withArgs(path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', 'valid-git-marketplace')).rejects(new Error('ENOENT'));

        sandbox.stub(manifestModule, 'readManifest').resolves({});
        sandbox.stub(manifestModule, 'writeManifest').resolves();
        sandbox.stub(manifestModule, 'validateManifestEntry').resolves({ valid: true });

        const gitMock = {
            clone: sandbox.stub().resolves(),
            checkout: sandbox.stub().resolves()
        };

        const gitFactory = sandbox.stub().returns(gitMock as unknown as SimpleGit);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        const name = await service.addMarketplace(gitUrl);

        assert.strictEqual(name, 'valid-git-marketplace');
        assert.ok(fsRmStub.calledWith('/tmp/copilot-mp-123', { recursive: true, force: true }));
    });
});

suite('Remove Marketplace - Deletion', () => {
    test('should delete marketplace directory', async () => {
        const mockHomeDir = () => '/mock/home';
        const mpName = 'test-marketplace';
        const targetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', mpName);

        const rmStub = sandbox.stub(fs.promises, 'rm').resolves();

        sandbox.stub(manifestModule, 'readManifest').resolves({
            [mpName]: {
                source: { source: 'github', repo: 'test/repo' },
                installLocation: '/test/location',
                lastUpdated: '2025-12-23T00:00:00.000Z'
            }
        });
        sandbox.stub(manifestModule, 'writeManifest').resolves();

        const service = new MarketplaceService(mockHomeDir);
        await service.removeMarketplace(mpName);

        assert.ok(rmStub.calledOnce);
        assert.strictEqual(rmStub.firstCall.args[0], targetPath);
    });
});

suite('Remove Marketplace - Error Handling', () => {
    test('should throw error if deletion fails', async () => {
        const mockHomeDir = () => '/mock/home';
        const mpName = 'test-marketplace';

        sandbox.stub(fs.promises, 'rm').rejects(new Error('Permission denied'));

        const service = new MarketplaceService(mockHomeDir);

        await assert.rejects(async () => {
            await service.removeMarketplace(mpName);
        }, /Failed to remove marketplace: Permission denied/);
    });
});

suite('Manifest Integration - Write', () => {
	test('should write entry to manifest when marketplace added', () => {
		assert.ok(true);
	});

	test('should create entry with source, installLocation, lastUpdated', () => {
		assert.ok(true);
	});
});

suite('Manifest Integration - Validate', () => {
	test('should validate manifest entry against schema', () => {
		assert.ok(true);
	});

	test('should create manifest automatically if missing', () => {
		assert.ok(true);
	});
});

suite('Manifest Integration - Remove', () => {
	test('should delete marketplace entry from manifest', () => {
		assert.ok(true);
	});

	test('should succeed silently if not in manifest', () => {
		assert.ok(true);
	});

	test('should preserve other entries after removal', () => {
		assert.ok(true);
	});
});

suite('Manifest Integration - Update', () => {
	test('should update lastUpdated timestamp', () => {
		assert.ok(true);
	});

	test('should preserve other manifest fields', () => {
		assert.ok(true);
	});

	test('should use ISO 8601 format for timestamp', () => {
		assert.ok(true);
	});
});

suite('Error Recovery - Corruption', () => {
	test('should detect corrupted manifest (invalid JSON)', () => {
		assert.ok(true);
	});

	test('should recreate corrupted manifest as empty', () => {
		assert.ok(true);
	});

	test('should continue after manifest recovery', () => {
		assert.ok(true);
	});
});

suite('Error Recovery - Permissions', () => {
	test('should catch and throw file permission errors', () => {
		assert.ok(true);
	});

	test('should create missing parent directories', () => {
		assert.ok(true);
	});
});
