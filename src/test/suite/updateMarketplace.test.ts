import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import { MarketplaceService } from '../../services/marketplaceService';
import { SimpleGit } from 'simple-git';

suite('MarketplaceService Update Test Suite', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('updateMarketplace should pull if git repo with remote exists', async () => {
        const mockHomeDir = () => '/mock/home';
        const mpName = 'test-mp';
        const targetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', mpName);

        const gitMock = {
            checkIsRepo: sandbox.stub().resolves(true),
            getRemotes: sandbox.stub().resolves([{ name: 'origin', refs: { fetch: '...', push: '...' } }]),
            pull: sandbox.stub().resolves()
        };
        
        const gitFactory = sandbox.stub().withArgs(targetPath).returns(gitMock as unknown as SimpleGit);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        await service.updateMarketplace(mpName);

        assert.ok(gitMock.checkIsRepo.calledOnce);
        assert.ok(gitMock.getRemotes.calledOnce);
        assert.ok(gitMock.pull.calledOnce);
    });

    test('updateMarketplace should throw NOT_A_GIT_REPO if not a git repo', async () => {
        const mockHomeDir = () => '/mock/home';
        const mpName = 'local-mp';
        const targetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', mpName);

        const gitMock = {
            checkIsRepo: sandbox.stub().resolves(false),
            getRemotes: sandbox.stub().resolves([]),
            pull: sandbox.stub().resolves()
        };
        
        const gitFactory = sandbox.stub().withArgs(targetPath).returns(gitMock as unknown as SimpleGit);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        
        await assert.rejects(async () => {
            await service.updateMarketplace(mpName);
        }, (err: Error) => {
            return err.message === 'NOT_A_GIT_REPO';
        });
    });

    test('updateMarketplace should throw NOT_A_GIT_REPO if no remotes', async () => {
        const mockHomeDir = () => '/mock/home';
        const mpName = 'no-remote-mp';
        const targetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', mpName);

        const gitMock = {
            checkIsRepo: sandbox.stub().resolves(true),
            getRemotes: sandbox.stub().resolves([]),
            pull: sandbox.stub().resolves()
        };
        
        const gitFactory = sandbox.stub().withArgs(targetPath).returns(gitMock as unknown as SimpleGit);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        
        await assert.rejects(async () => {
            await service.updateMarketplace(mpName);
        }, (err: Error) => {
            return err.message === 'NOT_A_GIT_REPO';
        });
    });

    test('updateMarketplace should throw error if git pull fails', async () => {
        const mockHomeDir = () => '/mock/home';
        const mpName = 'error-mp';
        const targetPath = path.join('/mock/home', '.copilot', 'plugins', 'marketplaces', mpName);

        const gitMock = {
            checkIsRepo: sandbox.stub().resolves(true),
            getRemotes: sandbox.stub().resolves([{ name: 'origin' }]),
            pull: sandbox.stub().rejects(new Error('Conflict'))
        };
        
        const gitFactory = sandbox.stub().withArgs(targetPath).returns(gitMock as unknown as SimpleGit);

        const service = new MarketplaceService(mockHomeDir, gitFactory);
        
        await assert.rejects(async () => {
            await service.updateMarketplace(mpName);
        }, /Git update failed: Conflict/);
    });
});
