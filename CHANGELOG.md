# Change Log

All notable changes to the "vscode-copilot-marketplace" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]



### Added

- `MarketplaceService` for managing marketplace repositories.

- `listMarketplace` command implementation to show available marketplaces.

- Slash commands for Gemini CLI: `/create-prd` and `/create-tasks`.

- Unit tests for `MarketplaceService` using `sinon`.

- Added `sinon` and `@types/sinon` as dev dependencies.



### Changed

- Refactored `src/extension.ts` to use `MarketplaceService`.

- Updated documentation in `docs/api.md`.
