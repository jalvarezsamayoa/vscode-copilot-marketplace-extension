---
name: Development Best Practices
description: Guidelines for developing high-quality software
applyTo: src/**/*.ts
trigger: model_decision
---

# Development Best Practices

## Core Principles

- **DRY (Don't Repeat Yourself)**: Avoid duplication of logic or data. Every piece of knowledge must have a single, unambiguous, authoritative representation within the system. Extract common functionality into shared utilities or base classes.
- **SOLID Principles**: Adhere to SOLID design principles to ensure the codebase remains flexible and maintainable:
  - **Single Responsibility Principle**: A class or module should have one, and only one, reason to change.
  - **Open/Closed Principle**: Software entities should be open for extension, but closed for modification.
  - **Liskov Substitution Principle**: Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
  - **Interface Segregation Principle**: No client should be forced to depend on methods it does not use.
  - **Dependency Inversion Principle**: Depend upon abstractions, not concretions.
- **Strict TDD (Test-Driven Development)**: Follow a strict Red-Green-Refactor cycle for all new features and bug fixes:
  1. **Red**: Write a failing test that defines the desired improvement or new function.
  2. **Green**: Produce the minimum amount of code to pass that test.
  3. **Refactor**: Clean up the new code, ensuring it fits the project's standards while keeping the tests green.

## Implementation Guidelines

- When working with files under `src/`, always ensure that tests are written or updated before the implementation code.
- Prioritize clear, modular architecture that facilitates testing and reuse.
- Regularly review existing code for opportunities to apply DRY or SOLID principles during the Refactor phase of TDD.
