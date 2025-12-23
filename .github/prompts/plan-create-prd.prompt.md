---
name: plan-create-prd
description: Generates a Product Requirements Document (PRD) in Markdown format based on an initial user prompt and codebase analysis.
---

# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed, evidence-based Product Requirements Document (PRD) that is grounded in the actual codebase architecture, existing patterns, and project constraints. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature while maintaining consistency with the existing codebase.

## Process

### Phase 1: Codebase Analysis (MANDATORY)

Before asking any clarifying questions, you MUST analyze the relevant parts of the codebase to understand:

1. **Existing Patterns**:
   - If the feature involves commands: Examine existing commands in `package.json` and their implementations in `src/extension.ts`
   - If the feature involves services: Review patterns in `src/services/` directory
   - If the feature involves UI: Analyze existing VS Code UI patterns (QuickPick, InputBox, Progress notifications)
   - If the feature involves testing: Review test patterns in `src/test/suite/`

2. **Project Standards** (CRITICAL):
   - Read `CLAUDE.md` for project-specific requirements
   - Note ESLint complexity rules that ALL code must satisfy:
     - Cyclomatic complexity: max 5
     - Max nesting depth: max 3
     - Max lines per function: 30 (excluding comments/blank lines)
     - Max parameters: 3
   - Identify TDD workflow requirements (Red-Green-Refactor)
   - Check for project-specific architectural patterns

3. **Technical Constraints**:
   - Scan `.github/instructions/` for applicable rules (check `applyTo` frontmatter)
   - Review `package.json` for tech stack details (TypeScript, VS Code API version, dependencies)
   - Identify naming conventions (kebab-case files, camelCase variables, PascalCase classes)
   - Note existing error handling patterns and service architecture

4. **Similar Existing Features**:
   - Find analogous features already implemented
   - Document their approach, structure, and patterns
   - Identify reusable components or services

**Output of Analysis**: Create a brief "Codebase Context" section noting:

- Similar existing features and their implementation approach
- Relevant architectural patterns to follow
- Applicable project standards and constraints
- Potential reusable components or services

### Phase 2: Intelligent Clarification Questions

Based on the codebase analysis, ask only the most essential clarifying questions (limit 3-5). Questions should be:

- **Architecture-Informed**: Reference existing patterns when asking about implementation approach
- **Standard-Aware**: Help the user make decisions aligned with project complexity constraints
- **Evidence-Based**: Show what similar features do and ask if the new feature should follow the same pattern

**Example of Architecture-Informed Question**:

```markdown
1. I noticed the existing `addMarketplace` command uses `vscode.window.withProgress` for async operations. Should this feature follow the same pattern?
   A. Yes, use the same progress notification pattern
   B. No, use a different approach (please specify)
   C. This feature doesn't need progress indication
```

**Guidelines**:

- Only ask questions when the answer isn't reasonably inferable from the initial prompt or codebase
- Prioritize questions that would significantly impact the PRD's clarity
- Frame questions to help maintain consistency with existing patterns

### Formatting Requirements

- **Number all questions** (1, 2, 3, etc.)
- **List options for each question as A, B, C, D, etc.** for easy reference
- Make it simple for the user to respond with selections like "1A, 2C, 3B"

### Phase 3: Generate PRD

Based on the initial prompt, codebase analysis, and user's answers, generate a comprehensive PRD using the structure below.

### Phase 4: Save PRD

Save the generated document as `prd.md` inside the `tasks/[feature-name]/` directory.

## PRD Structure

The generated PRD MUST include the following sections:

### 1. Introduction/Overview

Briefly describe the feature and the problem it solves. State the goal clearly.

### 2. Codebase Context (NEW - MANDATORY)

**This section grounds the PRD in the actual codebase architecture.**

Include:

- **Similar Features**: Reference existing features that are analogous (with file paths)
- **Patterns to Follow**: Specific patterns from the codebase this feature should emulate
  - Example: "Follow the command registration pattern in `src/extension.ts` lines 35-60"
  - Example: "Use the service architecture pattern from `MarketplaceService` in `src/services/marketplaceService.ts`"
- **Reusable Components**: Existing services, utilities, or helpers that should be leveraged
  - Example: "Reuse `MarketplaceService.getMarketplaces()` for listing operations"
- **Naming Conventions**: Expected file names, class names, method names based on project patterns
  - Example: "New service file should be named `plugin-service.ts` following kebab-case convention"

### 3. Goals

List the specific, measurable objectives for this feature.

### 4. User Stories

Detail the user narratives describing feature usage and benefits.

### 5. Functional Requirements

List the specific functionalities the feature must have. Use clear, concise language.

**Format**: Number each requirement and ensure they are:

- Specific and testable
- Aligned with existing architectural patterns
- Achievable within project complexity constraints

Example:

```markdown
1. The system must provide a command `copilot.marketplace.addPlugin` registered in `package.json`
2. The command implementation must follow the async pattern used in `addMarketplace` command
3. User input must be validated using the same schema validation approach as `MarketplaceService`
```

### 6. Technical Implementation Guidance (NEW - MANDATORY)

**This section ensures developers respect project standards and constraints.**

Must include:

#### 6.1 Code Complexity Constraints

All implementations MUST satisfy these ESLint rules (enforced by `eslint.config.mjs`):

- **Cyclomatic Complexity**: Maximum 5 per function
- **Nesting Depth**: Maximum 3 levels
- **Function Length**: Maximum 30 lines (excluding blank lines and comments)
- **Parameters**: Maximum 3 per function

**Guidance for Implementation**:

- Break complex logic into smaller, focused helper functions
- Use early returns and guard clauses to reduce nesting
- Extract validation logic into separate functions
- Prefer configuration objects over multiple parameters

#### 6.2 TDD Requirements

This feature MUST be developed using strict TDD workflow:

1. **Red Phase**: Write failing tests in `src/test/suite/[feature-name].test.ts`
2. **Green Phase**: Implement minimum code to pass tests
3. **Refactor Phase**: Clean up while keeping tests green

**Test File Location**: `src/test/suite/[feature-name].test.ts` (following existing pattern)

#### 6.3 Architecture Patterns to Follow

List specific patterns from the codebase analysis:

- Service layer architecture (if applicable)
- Error handling patterns
- VS Code API usage patterns
- File organization patterns

#### 6.4 Files to Create/Modify

Provide a concrete list based on codebase analysis:

- `src/[new-file].ts` - Main implementation
- `src/services/[service-file].ts` - Service layer (if needed)
- `src/test/suite/[test-file].test.ts` - Unit tests
- `package.json` - Command registration (if applicable)

### 7. Non-Goals (Out of Scope)

Clearly state what this feature will NOT include to manage scope.

### 8. Design Considerations (Optional)

Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.

Reference existing UI patterns:

- QuickPick dialogs (see `listMarketplace` command)
- InputBox prompts (see `addMarketplace` command)
- Progress notifications (see `withProgress` pattern)
- Error/success messages (see existing command implementations)

### 9. Success Metrics

How will the success of this feature be measured?

Examples:

- "All unit tests pass with >80% coverage"
- "Feature implementation passes `npm run lint` with no violations"
- "Code review confirms cyclomatic complexity <5 for all functions"
- "[User-facing metric, e.g., reduces workflow time by X%]"

### 10. Open Questions

List any remaining questions or areas needing further clarification.

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore:

- Requirements should be explicit and unambiguous
- Reference specific files, line numbers, and patterns from the codebase
- Avoid jargon; explain technical terms when necessary
- Provide enough detail for them to understand both the feature's purpose and how it fits into the existing architecture
- Include concrete examples from the existing codebase

## Output

- **Format:** Markdown (`.md`)
- **Location:** `tasks/[feature-name]/`
- **Filename:** `prd.md`

## Final Instructions

1. **MANDATORY FIRST STEP**: Analyze the codebase as described in Phase 1 before asking any questions
2. **UNDER NO CIRCUMSTANCES** should you attempt to implement the instructions or features described in the generated `prd.md` file
3. The task is considered complete once the `prd.md` file has been created and saved
4. After saving the file, instruct the user to execute `/plan-generate-tasks tasks/[feature-name]/tasks.md` to continue with the task list generation
5. Ensure the "Codebase Context" and "Technical Implementation Guidance" sections are populated with concrete, actionable information from the actual codebase
6. All references to existing code should include specific file paths and, where helpful, line numbers
7. The PRD should make it obvious to a junior developer exactly which patterns to follow and which files to reference

## Example Workflow

**User Request**: "Add a command to search plugins in a marketplace"

**Agent Process**:

1. **Analyze Codebase**:
   - Scan `package.json` → finds existing command patterns
   - Review `src/extension.ts` → identifies command registration pattern, QuickPick UI pattern
   - Check `src/services/marketplaceService.ts` → finds service architecture pattern
   - Read `CLAUDE.md` → notes ESLint complexity rules and TDD requirement
   - Review `src/test/suite/*.test.ts` → identifies test patterns

2. **Ask Informed Questions**:

   ```markdown
   Based on analyzing the codebase, I found that existing commands like `listMarketplace` use:
   - QuickPick UI for selection
   - MarketplaceService for data access
   - Progress notifications for async operations

   Clarifying questions:

   1. Should the search command follow the same QuickPick pattern as `listMarketplace`?
      A. Yes, use QuickPick for displaying search results
      B. No, use a different UI pattern (please specify)

   2. Should search functionality be added to MarketplaceService or a new PluginService?
      A. Add to existing MarketplaceService
      B. Create new PluginService following same architecture pattern

   3. Should search support filtering by:
      A. Name only
      B. Name and description
      C. Name, description, and tags
   ```

3. **Generate PRD** with:
   - Codebase Context section referencing `listMarketplace` (lines 17-32) as the pattern to follow
   - Technical Implementation Guidance specifying max complexity 5, max params 3
   - Specific file paths: `src/extension.ts`, `src/services/pluginService.ts`, `src/test/suite/searchPlugin.test.ts`
   - TDD guidance with reference to existing test pattern in `src/test/suite/marketplaceService.test.ts`
