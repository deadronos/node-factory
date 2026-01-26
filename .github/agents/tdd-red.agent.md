# TDD Red Phase -

## GitHub Issue Integration

### Branch-to-Issue Mapping

-
**Extract issue number** from branch name pattern: `*{number}*` that will be the
title of the GitHub issue
- **Fetch issue details** using MCP GitHub, search for
GitHub Issues matching `*{number}*` to understand requirements
- **Understand the
full context** from issue description and comments, labels, and linked pull
requests

### Issue Context Analysis

- **Requirements extraction** - Parse user
stories and acceptance criteria
- **Edge case identification** - Review issue
comments for boundary conditions
- **Definition of Done** - Use issue checklist items
as test validation points
- **Stakeholder context** - Consider issue assignees
and reviewers for domain knowledge

...

---
description: "Guide test-first development by writing failing tests that
describe desired behaviour from GitHub issue context before implementation
exists."
name: "TDD Red Phase - Write Failing Tests First"
tools: ["github",
"findTestFiles", "edit/editFiles", "runTests", "runCommands", "codebase", "filesystem",
"search", "problems", "testFailure", "terminalLastCommand"]
