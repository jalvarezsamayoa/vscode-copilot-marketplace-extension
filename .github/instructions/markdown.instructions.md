---
name: Markdown Formatting
description: A guide to formatting text in Markdown
applyTo: *.md
---

# Markdown Formatting

This guide provides instructions for formatting text in Markdown and using tools to ensure consistency.

## Using markdownlint-cli

`markdownlint-cli` is a command-line tool to lint and fix Markdown files according to common style rules.

### Installation

Install `markdownlint-cli` globally or as a dev dependency:

```bash
npm install -g markdownlint-cli
# or
npm install --save-dev markdownlint-cli
```

### Linting Files

To lint a single file:

```bash
markdownlint file.md
```

To lint all Markdown files in the current directory and subdirectories:

```bash
markdownlint '**/*.md'
```

To lint specific files or patterns:

```bash
markdownlint README.md docs/*.md
```

### Fixing Issues

To automatically fix fixable issues:

```bash
markdownlint --fix file.md
```

For multiple files:

```bash
markdownlint --fix '**/*.md'
```

Note: Not all issues can be auto-fixed; some require manual correction.

### Configuration

Create a `.markdownlint.json` or `.markdownlint.jsonc` file in the project root to customize rules:

```json
{
  "default": true,
  "MD013": false, // Disable line length rule
  "MD024": { "siblings_only": true } // Allow duplicate headers if not siblings
}
```

Common rules include:

- MD001: Header levels should only increment by one level at a time
- MD013: Line length
- MD024: Multiple headers with the same content
- MD032: Lists should be surrounded by blank lines

Refer to the [markdownlint documentation](https://github.com/DavidAnson/markdownlint) for all rules.

### Integration with Build Tools

Add to `package.json` scripts for easy access:

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md'",
    "lint:md:fix": "markdownlint --fix '**/*.md'"
  }
}
```

Then run:

```bash
npm run lint:md
npm run lint:md:fix
```
