import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as marketplaceSchema from '../schemas/marketplace-schema.json';
import { readManifest, writeManifest, validateManifestEntry } from '../utils/manifest';

export class MarketplaceService {
    private readonly getHomeDir: () => string;
    private readonly gitFactory: (baseDir?: string) => SimpleGit;
    private readonly ajv: Ajv;

    constructor(getHomeDir: () => string = os.homedir, gitFactory: (baseDir?: string) => SimpleGit = simpleGit) {
        this.getHomeDir = getHomeDir;
        this.gitFactory = gitFactory;
        this.ajv = new Ajv();
        addFormats(this.ajv);
    }

    private getCacheDirectory(): string {
        const envPath = process.env.COPILOT_PLUGINS_DIR;
        if (envPath) {
            return envPath;
        }
        return path.join(this.getHomeDir(), '.copilot', 'plugins', 'marketplaces');
    }

    private getManifestPath(): string {
        return path.join(this.getHomeDir(), '.copilot', 'plugins', 'known_marketplaces.json');
    }

    async ensureCacheDirectoryExists(): Promise<void> {
        const cachePath = this.getCacheDirectory();

        try {
            await fs.promises.access(cachePath);
        } catch {
            await fs.promises.mkdir(cachePath, { recursive: true });
        }
    }

    async getMarketplaces(): Promise<vscode.QuickPickItem[]> {
        const cachePath = this.getCacheDirectory();
        
        await this.ensureCacheDirectoryExists();

        const entries = await fs.promises.readdir(cachePath);
        const marketplaces: vscode.QuickPickItem[] = [];

        for (const entry of entries) {
            const entryPath = path.join(cachePath, entry);
            const stats = await fs.promises.stat(entryPath);

            if (stats.isDirectory()) {
                const manifestPath = path.join(entryPath, '.copilot-plugin', 'marketplace.json');
                const info = await this.parseManifest(manifestPath);
                
                if (info) {
                    marketplaces.push({
                        label: info.name,
                        detail: info.description
                    });
                } else {
                    marketplaces.push({
                        label: entry,
                        detail: ''
                    });
                }
            }
        }

        return marketplaces;
    }

    public async addMarketplace(source: string): Promise<string> {
        const manifest = await this.fetchManifest(source);
        this.validateManifest(manifest);

        const name = manifest.name;
        await this.checkCollision(name);

        await this.installMarketplace(source, name);

        // Persist marketplace to manifest
        await this.persistMarketplaceToManifest(source, name);

        return name;
    }

    private async persistMarketplaceToManifest(source: string, name: string): Promise<void> {
        const installLocation = path.join(this.getCacheDirectory(), name);
        const sourceInfo = this.extractSourceInfo(source);

        const entry = {
            source: sourceInfo,
            installLocation,
            lastUpdated: new Date().toISOString()
        };

        // Validate entry against schema
        const validation = await validateManifestEntry(entry);
        if (!validation.valid) {
            throw new Error(`Manifest entry validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
        }

        // Read existing manifest, add entry, write back
        const manifestPath = this.getManifestPath();
        const knownMarketplaces = await readManifest(manifestPath);
        knownMarketplaces[name] = entry;
        await writeManifest(manifestPath, knownMarketplaces);
    }

    private extractSourceInfo(source: string): { source: 'github' | 'directory'; repo: string } {
        if (this.isGitUrl(source)) {
            // Extract owner/repo from git URL
            const match = source.match(/github\.com[/:]([^/]+)\/([^/.]+)(\.git)?/);
            if (match) {
                return { source: 'github', repo: `${match[1]}/${match[2]}` };
            }
            // Fallback for other git URLs
            return { source: 'github', repo: source };
        }

        // For local directories, use a convention: local/dirname
        let dirPath = source;
        if (dirPath.startsWith('~')) {
            dirPath = path.join(this.getHomeDir(), dirPath.slice(1));
        }
        const dirName = path.basename(dirPath);
        return { source: 'directory', repo: `local/${dirName}` };
    }

    private async fetchManifest(source: string): Promise<any> {
        if (this.isGitUrl(source)) {
            return this.fetchGitManifest(source);
        } else {
            return this.fetchLocalManifest(source);
        }
    }

    private isGitUrl(source: string): boolean {
        return /^(https?:\/\/|git@|ssh:\/\/|git:\/\/)/.test(source);
    }

    private async fetchLocalManifest(dirPath: string): Promise<any> {
        // Resolve home directory (~) if present
        if (dirPath.startsWith('~')) {
            dirPath = path.join(this.getHomeDir(), dirPath.slice(1));
        }
        
        const manifestPath = path.join(dirPath, '.copilot-plugin', 'marketplace.json');
        try {
            const content = await fs.promises.readFile(manifestPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to read manifest from ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async fetchGitManifest(url: string): Promise<any> {
        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'copilot-mp-'));
        try {
            const git = this.gitFactory();
            await git.clone(url, tempDir, ['--depth', '1', '--no-checkout']);
            
            const gitInTemp = this.gitFactory(tempDir);
            await gitInTemp.checkout(['HEAD', '--', '.copilot-plugin/marketplace.json']);

            const manifestPath = path.join(tempDir, '.copilot-plugin', 'marketplace.json');
            const content = await fs.promises.readFile(manifestPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to fetch manifest from git ${url}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
    }

    private validateManifest(manifest: any): void {
        const validate = this.ajv.compile(marketplaceSchema);
        const valid = validate(manifest);

        if (!valid) {
            const errors = validate.errors?.map(e => `${e.instancePath} ${e.message}`).join(', ');
            console.error('Schema validation failed:', validate.errors);
            throw new Error(`Manifest validation failed: ${errors}`);
        }
    }

    private async checkCollision(name: string): Promise<void> {
        const cachePath = path.join(this.getCacheDirectory(), name);

        try {
            await fs.promises.access(cachePath);
            throw new Error(`Marketplace '${name}' already exists.`);
        } catch (error) {
            // If it's the specific collision error, rethrow it
            if (error instanceof Error && error.message.includes('already exists')) {
                throw error;
            }
            // Otherwise, assumes it doesn't exist (ENOENT), which is what we want
        }
    }

    private async installMarketplace(source: string, name: string): Promise<void> {
        const targetPath = path.join(this.getCacheDirectory(), name);
        
        await this.ensureCacheDirectoryExists();

        if (this.isGitUrl(source)) {
            await this.gitFactory().clone(source, targetPath);
        } else {
             // Resolve home directory (~) if present
             let dirPath = source;
             if (dirPath.startsWith('~')) {
                 dirPath = path.join(this.getHomeDir(), dirPath.slice(1));
             }
            await fs.promises.cp(dirPath, targetPath, { recursive: true });
        }
    }

    private async parseManifest(manifestPath: string): Promise<{ name: string, description: string } | null> {
        try {
            await fs.promises.access(manifestPath);
            const content = await fs.promises.readFile(manifestPath, 'utf-8');
            const json = JSON.parse(content);
            if (!json.name) {
                return null;
            }
            return {
                name: json.name,
                description: json.metadata?.description || ''
            };
        } catch {
            return null;
        }
    }

    private async validateGitRepository(git: SimpleGit): Promise<void> {
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            throw new Error('NOT_A_GIT_REPO');
        }

        const remotes = await git.getRemotes();
        if (remotes.length === 0) {
            throw new Error('NOT_A_GIT_REPO');
        }
    }

    private async updateGitRepository(git: SimpleGit): Promise<void> {
        try {
            await this.validateGitRepository(git);
            await git.pull();
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_A_GIT_REPO') {
                throw error;
            }
            throw new Error(`Git update failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async updateManifestTimestamp(name: string): Promise<void> {
        const manifestPath = this.getManifestPath();
        const knownMarketplaces = await readManifest(manifestPath);
        if (knownMarketplaces[name]) {
            knownMarketplaces[name].lastUpdated = new Date().toISOString();
            await writeManifest(manifestPath, knownMarketplaces);
        }
    }

    public async updateMarketplace(name: string): Promise<void> {
        const targetPath = path.join(this.getCacheDirectory(), name);
        const git = this.gitFactory(targetPath);

        await this.updateGitRepository(git);
        await this.updateManifestTimestamp(name);
    }

    public async removeMarketplace(name: string): Promise<void> {
        const targetPath = path.join(this.getCacheDirectory(), name);

        try {
            await fs.promises.rm(targetPath, { recursive: true, force: true });
        } catch (error) {
            throw new Error(`Failed to remove marketplace: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Remove from manifest
        const manifestPath = this.getManifestPath();
        const knownMarketplaces = await readManifest(manifestPath);
        delete knownMarketplaces[name];
        await writeManifest(manifestPath, knownMarketplaces);
    }
}
