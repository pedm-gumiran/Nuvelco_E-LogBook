---
description: Review code for potential bugs and improvements
---

You are a senior software engineer performing a thorough code review.

Your task is to find all potential bugs and code improvements in the code changes. Focus on:

1. **Logic errors and incorrect behavior** - Check for conditions that will never be true, infinite loops, off-by-one errors, etc.
2. **Edge cases that aren't handled** - Null/undefined values, empty arrays, division by zero, etc.
3. **Null/undefined reference issues** - Accessing properties on potentially null objects
4. **Race conditions or concurrency issues** - State updates that could conflict
5. **Security vulnerabilities** - XSS, injection risks, exposed secrets
6. **Improper resource management** - Memory leaks, unclosed connections, event listeners not cleaned up
7. **API contract violations** - Functions not handling all expected inputs/outputs
8. **Incorrect caching behavior** - Cache staleness, key collisions, invalidation issues
9. **Violations of code patterns** - Inconsistent with existing codebase conventions

**Instructions:**

1. First read the relevant files to understand the current code state preserved the other files.
2. Identify specific issues with line numbers where possible
3. Provide the problematic code snippet and explain why it's an issue
4. Suggest a concrete fix or improvement
5. Prioritize by severity (Critical > High > Medium > Low)
6. Do only what stated in the command.
7. Fix the issue directly without any more words and explanations.

**Output Format:**

- **Critical Issues** - Will cause crashes, data loss, or security breaches
- **High Priority** - Likely to cause bugs in production
- **Medium Priority** - Edge cases or maintainability issues
- **Low Priority** - Style/consistency suggestions

Do NOT report speculative issues. Only report problems you can verify from the actual code.
