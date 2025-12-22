---
name: "Conventional Commits"
about: "A guide to writing conventional commits for better version control and collaboration."
applyTo: **
---

# Conventional Commits

This repository follows the Conventional Commits standard to ensure consistent and meaningful commit messages. Conventional Commits help in generating changelogs and version numbers automatically. Here’s a guide to writing conventional commits:

## Commit Message Format

The commit message format is: `<type>[optional scope]: <description>`

- **type**: Describes the kind of change (e.g., `feat`, `fix`, `docs`).
- **scope** (optional): Specifies the part of the codebase affected (e.g., `api`, `ui`).
- **description**: A brief, imperative description of the change.

### Common Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (e.g., build scripts)

### Examples

- `feat: add user authentication`
- `fix(api): resolve login timeout issue`
- `docs: update README with installation steps`
- `refactor: simplify user model logic`

## Managing Conventional Commits

### Writing Commits

- Use the format strictly.
- Keep descriptions concise but descriptive.
- Use present tense (e.g., "add" not "added").

### Tools and Automation

- **Commitizen**: Interactive CLI for generating conventional commits.
  ```bash
  npm install -g commitizen
  commitizen init cz-conventional-changelog --save-dev --save-exact
  ```
- **Husky**: Git hooks to enforce commit message format.
  ```bash
  npm install husky --save-dev
  npx husky install
  npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
  ```
- **Commitlint**: Lints commit messages.
  ```bash
  npm install @commitlint/cli @commitlint/config-conventional --save-dev
  ```
  Create `.commitlintrc.js`:
  ```javascript
  module.exports = { extends: ["@commitlint/config-conventional"] };
  ```

### Enforcing in CI/CD

Use tools like commitlint in GitHub Actions to validate PRs.

### Benefits

- Automated changelog generation with tools like `standard-version`.
- Easier release management.
- Better collaboration and code review.
