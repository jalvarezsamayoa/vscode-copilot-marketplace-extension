import * as assert from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import { readManifest, writeManifest, validateManifestEntry } from './manifest';

let sandbox: sinon.SinonSandbox;

setup(() => {
	sandbox = sinon.createSandbox();
});

teardown(() => {
	sandbox.restore();
});

suite('readManifest - File Operations', () => {
	test('should return empty object if file does not exist', async () => {
		const result = await readManifest('/nonexistent/path/known_marketplaces.json');
		assert.deepStrictEqual(result, {});
	});

	test('should parse valid JSON manifest', async () => {
		const expectedManifest: Record<string, any> = {
			'test-marketplace': {
				source: { source: 'github', repo: 'user/repo' },
				installLocation: '/test/location',
				lastUpdated: '2025-12-23T00:00:00.000Z'
			}
		};
		sandbox.stub(fs.promises, 'readFile').resolves(JSON.stringify(expectedManifest));
		const result = await readManifest('/test/path');
		assert.deepStrictEqual(result, expectedManifest);
	});
});

suite('readManifest - Error Handling', () => {
	test('should handle corrupted JSON gracefully', async () => {
		sandbox.stub(fs.promises, 'readFile').resolves('invalid json {{{');
		const consoleWarnStub = sandbox.stub(console, 'warn');
		const result = await readManifest('/test/path');
		assert.deepStrictEqual(result, {});
		assert.ok(consoleWarnStub.called);
	});

	test('should handle file system errors', async () => {
		sandbox.stub(fs.promises, 'readFile').rejects(new Error('EACCES: permission denied'));
		try {
			await readManifest('/test/path');
		} catch (err) {
			assert.ok(err instanceof Error);
		}
	});
});

suite('writeManifest - File Creation', () => {
	test('should create manifest file', async () => {
		sandbox.stub(fs.promises, 'mkdir').resolves();
		const writeFileStub = sandbox.stub(fs.promises, 'writeFile').resolves();
		const manifest: Record<string, any> = { 'test': { source: { source: 'github', repo: 'a/b' }, installLocation: '/loc', lastUpdated: '2025-01-01T00:00:00Z' } };
		await writeManifest('/test/path/known_marketplaces.json', manifest);
		assert.ok(writeFileStub.called);
	});

	test('should create directories recursively', async () => {
		const mkdirStub = sandbox.stub(fs.promises, 'mkdir').resolves();
		sandbox.stub(fs.promises, 'writeFile').resolves();
		const manifest: Record<string, any> = { 'test': { source: { source: 'github', repo: 'a/b' }, installLocation: '/loc', lastUpdated: '2025-01-01T00:00:00Z' } };
		await writeManifest('/test/path/known_marketplaces.json', manifest);
		assert.ok(mkdirStub.called);
	});
});

suite('writeManifest - Content Persistence', () => {
	test('should write manifest to disk', async () => {
		const writeFileStub = sandbox.stub(fs.promises, 'writeFile').resolves();
		sandbox.stub(fs.promises, 'mkdir').resolves();
		const manifest: Record<string, any> = { 'test': { source: { source: 'github', repo: 'a/b' }, installLocation: '/loc', lastUpdated: '2025-01-01T00:00:00Z' } };
		await writeManifest('/test/path/known_marketplaces.json', manifest);
		assert.ok(writeFileStub.called);
		const callArgs = writeFileStub.firstCall?.args;
		const writtenContent = callArgs?.[1] as string;
		assert.ok(writtenContent?.includes('test'));
	});

	test('should handle permission errors', async () => {
		sandbox.stub(fs.promises, 'mkdir').rejects(new Error('EACCES: permission denied'));
		const manifest: Record<string, any> = { 'test': { source: { source: 'github', repo: 'a/b' }, installLocation: '/loc', lastUpdated: '2025-01-01T00:00:00Z' } };
		try {
			await writeManifest('/test/path/known_marketplaces.json', manifest);
			assert.fail('Should have thrown an error');
		} catch (err) {
			assert.ok(err instanceof Error);
			assert.ok(err.message.includes('Unable to write manifest'));
		}
	});
});

suite('validateManifestEntry - Valid Entries', () => {
	test('should validate entries with all fields', async () => {
		const entry = {
			source: { source: 'github', repo: 'user/repo' },
			installLocation: '/test/location',
			lastUpdated: '2025-12-23T14:40:40.045Z'
		};
		const result = await validateManifestEntry(entry);
		assert.strictEqual(result.valid, true);
	});
});

suite('validateManifestEntry - Invalid Entries', () => {
	test('should fail validation for missing fields', async () => {
		const entry = {
			installLocation: '/test/location',
			lastUpdated: '2025-12-23T14:40:40.045Z'
		};
		const result = await validateManifestEntry(entry);
		assert.strictEqual(result.valid, false);
	});

	test('should fail validation for invalid source types', async () => {
		const entry = {
			source: { source: 'invalid-type', repo: 'user/repo' },
			installLocation: '/test/location',
			lastUpdated: '2025-12-23T14:40:40.045Z'
		};
		const result = await validateManifestEntry(entry);
		assert.strictEqual(result.valid, false);
	});

	test('should fail validation for invalid timestamps', async () => {
		const entry = {
			source: { source: 'github', repo: 'user/repo' },
			installLocation: '/test/location',
			lastUpdated: 'not-a-valid-timestamp'
		};
		const result = await validateManifestEntry(entry);
		assert.strictEqual(result.valid, false);
	});
});
