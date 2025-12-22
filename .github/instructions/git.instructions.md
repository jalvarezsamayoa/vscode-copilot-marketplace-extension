---
name: "Git Instructions"
description: "Instructions for using Git"
applyTo: **
---

# Git Instructions for Using Git

This guide provides instructions for using Git in this repository.

## Agent Rules

- **Authorization Required**: The agent SHOULD NEVER commit without requesting authorization from the user. Always confirm before making commits.
- **Explicit Instructions for Push**: The agent should never push without explicit instructions from the user.
- **File-by-File Adds**: The agent SHOULD NEVER do `git add .`; it should always add files one by one.
- **Staging Responsibility**: The agent should only commit files that the user has staged. The agent should never stage a file.
- **Non-Interactive Commands**: The agent should use non-interactive commands.

## Non-Interactive Git Usage

To ensure Git operations run without prompts or user input, use the following configurations and command options. These are essential for automation and agent interactions.

### Configurations

Set these via `git config --global` or `--local`:

- `core.editor` to `/bin/true` (avoids editor prompts).
- `credential.interactive` to `false` (prevents credential requests).
- `user.name` and `user.email` explicitly.
- `commit.gpgSign` and `push.gpgSign` to `false` (skips signing).
- Use environment variables like `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_ASKPASS` for metadata and credentials.

### Command Examples

- **Commit**: `git commit -m "Message" --no-verify --quiet`
- **Push**: `git push --no-verify --quiet` (or `--force-with-lease` for safety)
- **Merge**: `git merge branch -m "Merge message" --no-edit --no-verify`
- **Pull**: `git pull --no-edit --no-verify --quiet`
- **Rebase**: `git rebase branch --no-edit --no-verify`

Always use `--dry-run` to test commands. Avoid interactive modes like `git add -p` or `git rebase -i`.

## Basic Git Commands

### Cloning a Repository

```bash
git clone <repository-url>
```

### Checking Status

```bash
git status
```

### Adding Changes

```bash
git add <file>
# or
git add .
```

### Committing Changes

```bash
git commit -m "Your commit message"
```

### Pushing Changes

```bash
git push origin <branch>
```

### Pulling Changes

```bash
git pull origin <branch>
```

## Branching

### Creating a Branch

```bash
git checkout -b <branch-name>
```

### Switching Branches

```bash
git checkout <branch-name>
```

### Merging Branches

```bash
git merge <branch-name>
```

## Best Practices

- Always pull before pushing.
- Use descriptive commit messages.
- Follow conventional commits as outlined in `conventional-commits.md`.
- Avoid force pushing unless necessary.
