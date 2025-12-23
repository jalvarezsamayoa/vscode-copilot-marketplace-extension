# Change Log

All notable changes to the "vscode-copilot-marketplace" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added

- `MarketplaceService` for managing marketplace repositories.

- `listMarketplace` command implementation to show available marketplaces.

- `updateMarketplace` command to pull changes from git-based marketplaces.

- Slash commands for Gemini CLI: `/create-prd` and `/create-tasks`.

- Unit tests for `MarketplaceService` using `sinon`.

- Unit tests for `updateMarketplace`.

- JSON schemas for marketplace and plugins (`src/schemas/marketplace-schema.json`, `src/schemas/plugin-schema.json`).

- Development prompts: `plan-create-prd` and `plan-generate-tasks` in `.github/prompts/`.

- Development instructions: `tasks.instructions.md` in `.github/instructions/`.

### Fixed

- Allow `repository` field in marketplace schema to support manifests with repository URLs.

- Added `sinon` and `@types/sinon` as dev dependencies.

### Changed

- Refactored `src/extension.ts` to use `MarketplaceService`.

- Refactored `listMarketplace` to better handle marketplace selection.

- Updated `MarketplaceService` to improve data fetching and validation.

- Updated documentation in `docs/api.md`.

- Updated `.gitignore` and `.markdownlint.json`.
