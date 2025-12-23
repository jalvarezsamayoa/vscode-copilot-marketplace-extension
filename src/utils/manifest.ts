import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as knownMarketplacesSchema from '../schemas/known-marketplaces-schema.json';

// Type definitions
export interface ManifestEntry {
	source: {
		source: 'github' | 'directory';
		repo: string;
	};
	installLocation: string;
	lastUpdated: string;
}

export interface ValidationResult {
	valid: boolean;
	errors?: Array<{ message: string }>;
}

export interface Manifest {
	[marketplaceName: string]: ManifestEntry;
}

// Initialize AJV for schema validation
const ajv = new Ajv();
addFormats(ajv);

/**
 * Reads the manifest file from disk. Returns empty object if file doesn't exist or is corrupted.
 */
export async function readManifest(filePath: string): Promise<Manifest> {
	try {
		const content = await fs.promises.readFile(filePath, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.warn('Manifest file corrupted, recreating with empty object');
		}
		// Return empty object for any error (ENOENT, corrupted JSON, etc)
		return {};
	}
}

/**
 * Writes the manifest to disk. Creates directories recursively if needed.
 */
export async function writeManifest(filePath: string, manifest: Manifest): Promise<void> {
	const dirPath = path.dirname(filePath);

	try {
		// Create directories recursively if they don't exist
		await fs.promises.mkdir(dirPath, { recursive: true });
		// Write manifest file
		await fs.promises.writeFile(filePath, JSON.stringify(manifest, null, 2));
	} catch (error) {
		if (error instanceof Error) {
			if ('code' in error && error.code === 'EACCES') {
				throw new Error(`Unable to write manifest: permission denied at ${filePath}`);
			}
			throw new Error(`Unable to write manifest: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Validates a manifest entry against the schema.
 */
export async function validateManifestEntry(entry: unknown): Promise<ValidationResult> {
	const validate = ajv.compile(knownMarketplacesSchema);

	// Create a test manifest with single entry to validate against schema
	const testManifest = { 'test': entry };

	const isValid = validate(testManifest);

	if (!isValid) {
		return {
			valid: false,
			errors: validate.errors?.map(err => ({ message: err.message || 'Validation failed' })) ?? []
		};
	}

	return { valid: true };
}
