# Cursor MCP Workflows

This document provides comprehensive workflows for using Cursor with MCP (Model Context Protocol) tools in the Medic-Bot codebase.

## Table of Contents

1. [MCP Server Overview](#mcp-server-overview)
2. [Development Workflows](#development-workflows)
3. [Testing Workflows](#testing-workflows)
4. [GitHub Integration Workflows](#github-integration-workflows)
5. [Supabase Database Workflows](#supabase-database-workflows)
6. [Netlify Deployment Workflows](#netlify-deployment-workflows)
7. [Memory & Sequential Thinking Workflows](#memory--sequential-thinking-workflows)
8. [Debugging Workflows](#debugging-workflows)
9. [Code Review Workflows](#code-review-workflows)

---

## MCP Server Overview

### Available MCP Servers

The following MCP servers are configured (see `.cursor/mcp.json`):

| Server | Purpose | Use Cases |
|--------|---------|-----------|
| **GitHub** | Code search, PRs, issues | Code search, PR management, issue tracking |
| **Supabase** | Database operations | Migrations, queries, function deployment |
| **Supabase PostgREST** | Direct DB access | Raw SQL queries, data inspection |
| **Netlify** | Deployment management | Deploy sites, manage env vars, view logs |
| **Memory** | Knowledge graph | Store complex relationships, project knowledge |
| **Sequential Thinking** | Problem solving | Break down complex multi-step problems |
| **Filesystem** | File operations | Read workspace files, understand structure |
| **GitKraken** | Git operations | Branch management, commit history |
| **Notion** | Documentation | Sync documentation, knowledge base |
| **Stripe** | Payments | Payment operations (if applicable) |
| **Brave Search** | Web search | Search for documentation, examples |
| **Puppeteer** | Browser automation | E2E testing, scraping |
| **Chrome DevTools** | Debugging | Browser debugging, performance analysis |

### Authentication

Most MCP servers require authentication:
- **GitHub**: `GITHUB_PERSONAL_ACCESS_TOKEN` (configured in mcp.json)
- **Supabase**: Project ID and API keys (configured in mcp.json)
- **Netlify**: `NETLIFY_AUTH_TOKEN` (configured in mcp.json)
- **Stripe**: API key (configured in mcp.json)

---

## Development Workflows

### 1. Starting a New Feature

**Workflow**:
1. **Create Branch**: Use GitHub MCP to create feature branch
   ```
   Create branch: feature/new-medication-calculator
   From: main
   ```

2. **Understand Existing Patterns**: Use Filesystem MCP to explore similar code
   ```
   Read: lib/dosing/calculators/epinephrine.ts
   Read: lib/dosing/registry.ts
   ```

3. **Use Sequential Thinking**: For complex features, break down with Sequential Thinking MCP
   ```
   Problem: Add new medication calculator
   Steps:
   1. Create calculator class
   2. Implement calculation logic
   3. Register in registry
   4. Add tests
   5. Update documentation
   ```

4. **Write Code**: Follow patterns from existing code

5. **Test Locally**:
   ```bash
   npm run test:unit -- medication-name
   npm run lint
   ```

### 2. Exploring Codebase Structure

**Use Filesystem MCP**:
```
# Find all managers
Search: lib/managers/*.ts

# Find API routes
Search: app/api/**/route.ts

# Find test files
Search: tests/unit/**/*.test.ts
```

**Use GitHub MCP** (Code Search):
```
# Search for specific pattern
Search: "class.*Manager" language:TypeScript

# Find usage of a function
Search: "handleChatRequest" language:TypeScript

# Find test files for a manager
Search: "ChatService" path:tests/
```

### 3. Understanding Dependencies

**Workflow**:
1. **Check package.json**: Use Filesystem MCP to read `package.json`
2. **Find Usage**: Use GitHub MCP to search for imports
   ```
   Search: "from.*chat-service" language:TypeScript
   ```
3. **Check Tests**: Find test files to understand expected behavior
   ```
   Search: "ChatService" path:tests/
   ```

---

## Testing Workflows

### 1. Running Tests

**Standard Workflow**:
```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:unit -- managers/chat-service

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**With MCP Tools**:
- Use Filesystem MCP to read test files
- Use GitHub MCP to search for test patterns
- Use Sequential Thinking for complex test scenarios

### 2. Writing Tests

**Pattern**:
1. **Find Similar Tests**: Use GitHub MCP to find similar test files
   ```
   Search: "describe.*Calculator" path:tests/
   ```

2. **Use Sequential Thinking**: Break down test cases
   ```
   Test cases for EpinephrineCalculator:
   1. Adult IM dose (70kg, arrest)
   2. Pediatric dose (20kg, arrest)
   3. Weight bounds (too low, too high)
   4. Route variations (IM, IV, Neb)
   5. Error handling (invalid input)
   ```

3. **Write Test File**: Follow existing patterns

### 3. Debugging Test Failures

**Workflow**:
1. **Run Test**: `npm run test:unit -- failing-test`
2. **Check Logs**: Look for error messages
3. **Use Chrome DevTools MCP**: If browser-related issue
4. **Use Sequential Thinking**: Break down failure scenario
5. **Fix Code**: Address root cause

---

## GitHub Integration Workflows

### 1. Code Search

**Searching for Code Patterns**:
```
# Find all Manager classes
Search: "export class.*Manager" language:TypeScript

# Find API route handlers
Search: "export async function POST" path:app/api/

# Find test patterns
Search: "describe.*should" path:tests/
```

**Finding Usage**:
```
# Find where a function is called
Search: "ChatService" language:TypeScript

# Find imports
Search: "from.*chat-service" language:TypeScript
```

### 2. Pull Request Management

**Creating PRs**:
1. **Create Branch**: Use GitHub MCP to create feature branch
2. **Make Changes**: Write code following guidelines
3. **Push Changes**: Git push to branch
4. **Create PR**: Use GitHub MCP to create pull request
   ```
   Title: feat: add morphine dosing calculator
   Body: 
   - Implements MorphineCalculator class
   - Adds unit tests
   - Registers in dosing registry
   - Updates documentation
   Base: main
   Head: feature/morphine-calculator
   ```

**Reviewing PRs**:
1. **View PR**: Use GitHub MCP to get PR details
2. **Check Files**: Review changed files
3. **Run Tests**: Ensure CI passes
4. **Review Code**: Check against coding standards

### 3. Issue Management

**Creating Issues**:
```
Title: Bug: Epinephrine calculator returns incorrect dose for pediatric patients
Body:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
```

**Tracking Issues**:
- Use GitHub MCP to list open issues
- Link PRs to issues in PR body: `Fixes #123`

---

## Supabase Database Workflows

### 1. Running Migrations

**Workflow**:
1. **Create Migration**: Use Supabase MCP to create migration
   ```
   Operation: apply_migration
   Project ID: <project-id>
   Name: add_protocol_citations_table
   Query: CREATE TABLE protocol_citations (...)
   ```

2. **Execute SQL**: Use Supabase MCP to run queries
   ```
   Operation: execute_sql
   Project ID: <project-id>
   Query: SELECT * FROM protocol_citations LIMIT 10
   ```

3. **Verify**: Check migration status
   ```
   Operation: list_migrations
   Project ID: <project-id>
   ```

### 2. Database Queries

**Direct Queries** (PostgREST):
```
# Get audit logs
GET /rest/v1/audit_logs?limit=10

# Filter by date
GET /rest/v1/audit_logs?created_at=gte.2025-01-01
```

**Via Supabase MCP**:
```
Operation: execute_sql
Query: SELECT * FROM audit_logs WHERE created_at >= '2025-01-01' LIMIT 10
```

### 3. Schema Inspection

**List Tables**:
```
Operation: list_tables
Project ID: <project-id>
Schemas: ["public"]
```

**Get Table Structure**:
```
Operation: execute_sql
Query: SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'audit_logs'
```

---

## Netlify Deployment Workflows

### 1. Deploying Changes

**Manual Deployment**:
1. **Build**: `npm run build`
2. **Deploy**: Use Netlify MCP to deploy
   ```
   Operation: deploy-site
   Site ID: <site-id>
   Deploy Directory: .next
   ```

**Git-Based Deployment**:
- Push to `main` branch triggers automatic deployment
- Use Netlify MCP to check deployment status

### 2. Managing Environment Variables

**View Variables**:
```
Operation: manage-env-vars
Site ID: <site-id>
Get All Env Vars: true
```

**Update Variables**:
```
Operation: manage-env-vars
Site ID: <site-id>
Upsert Env Var: true
Env Var Key: LLM_API_KEY
Env Var Value: <new-key>
Env Var Is Secret: true
New Var Context: production
```

### 3. Viewing Deployment Logs

**Check Deployment Status**:
```
Operation: get-deploy-for-site
Site ID: <site-id>
Deploy ID: <deploy-id>
```

---

## Memory & Sequential Thinking Workflows

### 1. Complex Problem Solving

**Using Sequential Thinking**:
```
Problem: Refactor ChatService to reduce complexity

Thoughts:
1. Current ChatService is 350 lines, handles multiple concerns
2. Extract RetrievalManager (already exists, verify usage)
3. Extract GuardrailService (check if exists)
4. Extract TriageService (check if exists)
5. ChatService becomes thin orchestrator (target: <200 lines)
6. Test each extracted service independently
7. Update ChatService to use extracted services
8. Run full test suite
```

**Benefits**:
- Breaks down complex problems into steps
- Allows revision of approach
- Documents reasoning

### 2. Knowledge Graph (Memory)

**Storing Project Knowledge**:
```
Operation: create_entities
Entities:
  - Name: ChatService
    Type: Manager
    Observations:
      - Main chat orchestration manager
      - Uses RetrievalManager, GuardrailManager, TriageService
      - Handles chat requests and returns formatted responses
      - Located in lib/managers/chat-service.ts
```

**Retrieving Knowledge**:
```
Operation: search_nodes
Query: ChatService dependencies
```

**Benefits**:
- Stores relationships between components
- Helps understand codebase structure
- Useful for onboarding new agents

---

## Debugging Workflows

### 1. Debugging API Routes

**Workflow**:
1. **Check Logs**: Use `createLogger()` output
2. **Test Endpoint**: Use curl or Postman
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"test"}]}'
   ```
3. **Use Chrome DevTools**: If browser-related
4. **Check Error Messages**: Review error responses

### 2. Debugging Tests

**Workflow**:
1. **Run Specific Test**: `npm run test:unit -- specific-test`
2. **Add Debug Logging**: Add `console.log` (allowed in tests)
3. **Use Sequential Thinking**: Break down test failure
4. **Check Mocks**: Verify mocks are set up correctly

### 3. Performance Debugging

**Workflow**:
1. **Profile Chat**: `npm run profile:chat`
2. **Profile Dosing**: `npm run profile:dosing`
3. **Check Metrics**: `/api/metrics` endpoint
4. **Use Chrome DevTools**: Performance profiling

---

## Code Review Workflows

### 1. Pre-Commit Checklist

**Run Before Committing**:
```bash
# Lint
npm run lint:strict

# Type check
npm run build

# Run tests
npm run test:unit
npm run test:integration

# Check for secrets
npm run scan:secrets
```

### 2. Reviewing Changes

**Use GitHub MCP**:
1. **Get PR Files**: List files changed in PR
2. **Review Each File**: Check against coding standards
3. **Verify Tests**: Ensure tests pass
4. **Check Documentation**: Verify docs updated

**Code Review Checklist**:
- [ ] File size < 500 lines
- [ ] Functions < 40 lines (or exception)
- [ ] Tests added for new features
- [ ] Medical code has protocol citations
- [ ] Error handling implemented
- [ ] ESLint passes
- [ ] No hardcoded secrets

### 3. Requesting Changes

**Use GitHub MCP**:
```
Operation: create_pull_request_review
Pull Number: <pr-number>
Event: REQUEST_CHANGES
Body: 
Please address:
1. Function exceeds 40 lines - split into smaller functions
2. Missing tests for edge cases
3. Protocol citation missing for medical recommendation
Comments:
  - Path: lib/dosing/calculators/morphine.ts
    Line: 45
    Body: Add weight bounds validation
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Check code style
npm run lint:strict      # Zero warnings

# Testing
npm run test             # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests
npm run test:coverage    # Coverage report

# Utilities
npm run smoke            # Smoke test deployment
npm run scan:secrets     # Check for secrets
```

### MCP Tool Quick Reference

| Task | Tool | Operation |
|------|------|-----------|
| Search code | GitHub | `search_code` |
| Create PR | GitHub | `create_pull_request` |
| List tables | Supabase | `list_tables` |
| Run SQL | Supabase | `execute_sql` |
| Deploy | Netlify | `deploy-site` |
| Complex problem | Sequential Thinking | `sequentialthinking` |
| Store knowledge | Memory | `create_entities` |

---

**For Detailed Tool Documentation**: See `docs/mcp-tools-reference.md`
**For Coding Standards**: See `docs/cursor-rules.md`
**For Agent Guide**: See `AGENTS.md`
