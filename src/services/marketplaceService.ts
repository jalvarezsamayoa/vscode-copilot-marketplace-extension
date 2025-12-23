import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export class MarketplaceService {
    private readonly getHomeDir: () => string;

    constructor(getHomeDir: () => string = os.homedir) {
        this.getHomeDir = getHomeDir;
    }

    async ensureCacheDirectoryExists(): Promise<void> {
        const homeDir = this.getHomeDir();
        const cachePath = path.join(homeDir, '.copilot', 'marketplace', 'cache');

        try {
            await fs.promises.access(cachePath);
        } catch {
            await fs.promises.mkdir(cachePath, { recursive: true });
        }
    }

    async getMarketplaces(): Promise<string[]> {
        const homeDir = this.getHomeDir();
        const cachePath = path.join(homeDir, '.copilot', 'marketplace', 'cache');
        
        await this.ensureCacheDirectoryExists();

        const entries = await fs.promises.readdir(cachePath);
        const marketplaces: string[] = [];

        for (const entry of entries) {
            const entryPath = path.join(cachePath, entry);
            const stats = await fs.promises.stat(entryPath);

            if (stats.isDirectory()) {
                const manifestPath = path.join(entryPath, '.copilot-plugin', 'marketplace.json');
                const name = await this.parseManifest(manifestPath);
                if (name) {
                    marketplaces.push(name);
                }
            }
        }

        return marketplaces;
    }

    private async parseManifest(manifestPath: string): Promise<string | null> {
        try {
            await fs.promises.access(manifestPath);
            const content = await fs.promises.readFile(manifestPath, 'utf-8');
            const json = JSON.parse(content);
            return json.name || null;
        } catch {
            return null;
        }
    }
}
