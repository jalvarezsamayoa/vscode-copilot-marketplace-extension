---
name: prompting-best-practices
description: Agents should use this skill when writing or refining prompts. Comprehensive guide to prompt engineering best practices covering clarity, context, output format, examples, constraints, iterative refinement, and token efficiency.
---

# Prompt Engineering Best Practices

Master the art of writing effective prompts that consistently produce high-quality
results. This skill covers the core principles that separate good prompts from
exceptional ones.

## Quick Reference

**Core Principle**: Clear intent + sufficient context + explicit format =
better results

**Always include:**

1. Clear statement of what you want
2. Relevant context and background
3. Explicit output format specification
4. Examples (if handling complex tasks)
5. Constraints and guardrails

---

## 1. Clarity and Specificity

The most critical principle: be explicit about what you want.

### ❌ Bad Prompt

```
Summarize this article.
```

**Problems**: Vague length expectations, unclear emphasis, no format specified.

### ✅ Good Prompt

```
Summarize the following article in 3-5 bullet points. Focus on:
- Main findings or conclusions
- Key data or statistics
- Practical implications

Format as a markdown list.
```

**Why it works**: Specific length, clear priorities, defined format.

### Key Principles

- **Use imperative form**: "Create", "Analyze", "Generate" (not "Can you...")
- **Be specific about quantity**: "3-5 bullet points" (not "a few")
- **Define success criteria**: What makes a good response?
- **Avoid jargon without context**: Define technical terms if needed

---

## 2. Context and Role-Playing

Provide sufficient background and establish context through role assignment.

### ❌ Bad Prompt

```
Explain machine learning.
```

**Problems**: No indication of audience level or depth needed.

### ✅ Good Prompt

```
You are an expert technical writer explaining concepts to beginners. Explain
machine learning in 2-3 paragraphs, using analogies from everyday life. Avoid
technical jargon. Focus on the intuition, not the mathematics.
```

**Why it works**: Defines role, audience level, length, and approach.

### Context Elements

- **Define the role**: "You are a..." (expert, beginner, translator, critic)
- **Specify audience**: Who will read this? What's their background?
- **Set the tone**: Formal, conversational, academic, casual?
- **Provide background**: What information does the AI need to know?

### Role-Playing Examples

- "Act as a code reviewer" → More critical, specific feedback
- "You are a marketing expert" → Focus on audience appeal and positioning
- "Assume the reader is a beginner" → Simplify explanations

---

## 3. Output Format Specification

Never assume the format. Specify it explicitly.

### ❌ Bad Prompt

```
List the benefits of exercise.
```

**Problems**: Could be paragraph form, bullet points, table, etc.

### ✅ Good Prompt

```
List the benefits of exercise as a markdown table with columns:
- Benefit (name)
- Category (physical/mental/social)
- Timeframe (how long to see results)

Include 8-10 rows. Use clear, concise descriptions (1-2 sentences each).
```

**Why it works**: Exact format, structure, and quantity specified.

### Format Specification Techniques

```
# Markdown List
Generate a markdown list with:
- Level 2 headers for main categories
- Bullet points for details
- Bold for key terms

# JSON
Return valid JSON with structure:
{
  "items": [{"name": "...", "value": "..."}]
}

# Structured Text
Use this format:
CATEGORY: [value]
DESCRIPTION: [value]
---
(repeat for each item)

# Table
Create a markdown table with columns: A, B, C
Keep descriptions under 50 characters.
```

---

## 4. Examples and Few-Shot Prompting

Show examples of what good output looks like.

### ❌ Bad Prompt

```
Convert text to JSON format.
```

**Problems**: Ambiguous structure, unknown formatting preferences.

### ✅ Good Prompt

```
Convert the following text descriptions into JSON. Follow this exact format:

Example:
Input: "A red car, fast, costs $30,000"
Output: {"color": "red", "type": "car", "attributes": ["fast"],
"price": 30000}

Now convert:
"A blue bicycle, mountain bike, costs $500"
```

**Why it works**: Example shows exact format, structure, and extraction logic.

### Few-Shot Techniques

- **One example**: Basic format demonstration
- **Two examples**: Clarify patterns and edge cases
- **Three+ examples**: Complex logic or multiple patterns
- **Show edge cases**: Include examples of special scenarios

### Example Quality Checklist

- ✅ Input and output both shown
- ✅ Format exactly matches expected output
- ✅ Covers typical and edge cases
- ✅ Comments explain non-obvious choices

---

## 5. Constraints and Guardrails

Define what NOT to do and the boundaries of acceptable responses.

### ❌ Bad Prompt

```
Write a blog post about productivity.
```

**Problems**: No limits on length, tone, scope, or content restrictions.

### ✅ Good Prompt

```
Write a blog post about productivity. Constraints:
- Length: 800-1000 words
- Tone: Professional but conversational
- Structure: Introduction, 3 main tips with examples, conclusion
- DO include: Specific, actionable advice
- DO NOT include: Vague platitudes, unverified claims, marketing hype
- Audience: Busy professionals with 15+ years experience
```

**Why it works**: Clear boundaries and explicit restrictions.

### Constraint Types

**Scope constraints**: "Focus only on...", "Avoid...", "Don't mention..."

**Quality constraints**: "Must be factually accurate", "No speculation"

**Style constraints**: "Use simple language", "Be concise", "Maintain formal tone"

**Content constraints**: "Include X but exclude Y", "Must cite sources"

**Format constraints**: "Maximum 500 words", "Exactly 5 items", "No tables"

---

## 6. Iterative Refinement

Use feedback to improve prompts progressively.

### The Iteration Cycle

```
1. Write initial prompt (clear + context + format)
2. Get response from AI
3. Evaluate: Did it meet expectations?
4. Refine: Adjust prompt based on gaps
5. Repeat until satisfied
```

### Refinement Strategies

**When output is too long/short**: Adjust length constraints
**When missing details**: Add specific examples or ask explicitly
**When wrong format**: Show exact format example
**When tone is off**: Clarify the role or add context
**When inaccurate**: Add constraint: "Must cite sources"

### Example Refinement

```
Iteration 1:
"Explain quantum computing"
→ Output: Too technical, assumes physics knowledge

Iteration 2 (Refine):
"Explain quantum computing to someone with no physics background.
Use everyday analogies. 2-3 paragraphs."
→ Output: Better, but still uses some jargon

Iteration 3 (Refine):
"Explain quantum computing as if to a 10-year-old.
Use analogies from toys, games, or sports.
Maximum 100 words."
→ Output: Perfect! Clear and engaging
```

---

## 7. Token Efficiency

Write prompts that are clear but not wasteful with tokens.

### ❌ Inefficient Prompt

```
I am writing a comprehensive guide about best practices in software
engineering. I need you to help me write a section about code review
processes. This section should be detailed and informative, covering
multiple aspects of code review practices in modern software development
organizations. It should be thorough and well-structured. The section
should be approximately 500 words in length and should be written in a
professional tone suitable for a technical audience of experienced
developers.
```

**Problems**: Repetitive, verbose, wastes ~100 tokens.

### ✅ Efficient Prompt

```
Write a 500-word technical guide section on code review best practices
for experienced developers. Include: purpose, key practices, tools,
common pitfalls.
```

**Why it works**: Same information, ~50 tokens saved.

### Efficiency Techniques

- **Remove redundancy**: Don't repeat the same requirement
- **Use structure over explanation**: Lists beat paragraphs
- **Specify quantity precisely**: "3-5 items" not "several items"
- **Trust context**: You don't need to explain obvious things
- **Use examples efficiently**: One good example beats three okay ones

### Word Count Impact

- Verbose prompt: "Could you possibly consider..." = wasted tokens
- Concise prompt: "List..." = direct, efficient
- Token savings: 20-30% reduction possible without losing quality

---

## 8. Real-World Examples and Templates

Combine all principles into practical patterns.

### Template: Simple Task

```
[Task verb] [target]: [specific requirements]
Format: [output format]
Length: [word count or item count]
```

**Example**:

```
Analyze this code snippet: [code]
Format: A bulleted list of issues
Length: 5-8 bullet points
```

### Template: Complex Analysis

```
Role: [Your expertise area]
Task: [What to do]
Context: [Background information]
Scope: [What to include/exclude]
Format: [Structure of output]
Constraints: [Limits and guardrails]
```

**Example**:

```
Role: System architect
Task: Identify potential scalability bottlenecks
Context: E-commerce platform serving 1M daily users
Scope: Focus on database and API layer; ignore frontend
Format: Markdown with sections for each bottleneck, including
  risk level and mitigation strategies
Constraints: Be specific (no vague concerns), cite actual architectural
  patterns, keep each issue to 100 words max
```

### Template: Creative Work

```
You are [role with relevant expertise]
Create: [specific output]
For: [target audience]
In: [tone/style]
Including: [must-have elements]
Avoiding: [what not to do]
Examples: [show 1-2 reference examples]
```

---

## Common Mistakes to Avoid

❌ **Assuming understanding**: Never assume the AI knows what you mean

❌ **Vague success criteria**: "Make it better" vs "Improve readability"

❌ **Missing context**: Don't assume background knowledge

❌ **Implicit requirements**: "Write this" ≠ "Write this in JSON format"

❌ **No examples for complex tasks**: Describe complex logic, don't just ask

❌ **Contradictory constraints**: "Brief but comprehensive" ≠ helpful

❌ **Single-pass prompts**: Iterate to refine, don't expect perfection immediately

---

## Quick Checklist: Prompt Quality

Before sending a prompt, verify:

- [ ] **Clear intent**: What exactly do I want?
- [ ] **Context provided**: Does the AI have enough background?
- [ ] **Format specified**: Is the output format explicit?
- [ ] **Constraints clear**: What are the boundaries?
- [ ] **Example included** (if complex): Is there an example?
- [ ] **Length defined**: Is quantity specified?
- [ ] **Role established** (if helpful): Is the role clear?
- [ ] **Success criteria**: How will I know if it's good?

---

## When to Use This Skill

This skill is useful when:

- Writing prompts for AI assistants
- Creating custom Claude commands
- Training other AI models
- Documenting requirements
- Designing user-facing AI interactions
- Troubleshooting AI output quality

Apply these principles to any scenario where you need consistent,
high-quality results from language models.
