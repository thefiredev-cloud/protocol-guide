# MCP Tools Reference

This document provides detailed reference for all MCP (Model Context Protocol) servers configured for the Medic-Bot project. See `.cursor/mcp.json` for configuration details.

## Table of Contents

1. [GitHub](#github)
2. [Supabase](#supabase)
3. [Supabase PostgREST](#supabase-postgrest)
4. [Netlify](#netlify)
5. [Memory](#memory)
6. [Sequential Thinking](#sequential-thinking)
7. [Filesystem](#filesystem)
8. [GitKraken](#gitkraken)
9. [Notion](#notion)
10. [Stripe](#stripe)
11. [Brave Search](#brave-search)
12. [Puppeteer](#puppeteer)
13. [Chrome DevTools](#chrome-devtools)

---

## GitHub

**Purpose**: Code search, pull request management, issue tracking, repository operations

**Configuration**: 
- Command: `node` + `@modelcontextprotocol/server-github`
- Authentication: `GITHUB_PERSONAL_ACCESS_TOKEN` (configured in mcp.json)

### Common Operations

#### Code Search
```
Operation: search_code
Query: "class ChatService" language:TypeScript
Result: Returns matching code snippets across repositories
```

**Use Cases**:
- Find all usages of a class or function
- Search for specific patterns
- Find test files
- Locate imports

**Example Queries**:
```
# Find all Manager classes
"export class.*Manager" language:TypeScript

# Find API route handlers
"export async function POST" path:app/api/

# Find usage of ChatService
"ChatService" language:TypeScript
```

#### Pull Request Management
```
Operation: create_pull_request
Title: feat: add morphine dosing calculator
Head: feature/morphine-calculator
Base: main
Body: Implements MorphineCalculator with tests
```

**Operations**:
- `create_pull_request` - Create new PR
- `get_pull_request` - Get PR details
- `list_pull_requests` - List PRs
- `create_pull_request_review` - Review PR
- `merge_pull_request` - Merge PR
- `get_pull_request_files` - List changed files

#### Issue Management
```
Operation: create_issue
Title: Bug: Incorrect pediatric dose calculation
Body: Description of issue
Labels: ["bug", "dosing"]
```

**Operations**:
- `create_issue` - Create issue
- `get_issue` - Get issue details
- `list_issues` - List issues
- `update_issue` - Update issue
- `add_issue_comment` - Add comment

#### Repository Operations
```
Operation: get_file_contents
Path: lib/managers/chat-service.ts
Branch: main
```

**Use Cases**:
- Read file contents from repository
- Compare branches
- Get directory listings

---

## Supabase

**Purpose**: Database operations, migrations, edge functions, project management

**Configuration**:
- URL: `https://mcp.supabase.com/mcp?features=account,database,debugging,development,docs,functions,storage,branching`
- Features: Account, database, debugging, development, docs, functions, storage, branching

### Common Operations

#### Database Queries
```
Operation: execute_sql
Project ID: <project-id>
Query: SELECT * FROM audit_logs WHERE created_at >= '2025-01-01' LIMIT 10
```

**Use Cases**:
- Run ad-hoc queries
- Inspect data
- Debug database issues
- Export data

#### Migrations
```
Operation: apply_migration
Project ID: <project-id>
Name: add_protocol_citations_table
Query: CREATE TABLE protocol_citations (...)
```

**Operations**:
- `apply_migration` - Create and apply migration
- `list_migrations` - List all migrations
- `execute_sql` - Run raw SQL (non-DDL)

**Migration Best Practices**:
- Use `apply_migration` for DDL (CREATE, ALTER, DROP)
- Use `execute_sql` for data queries
- Always test migrations on branch first

#### Schema Inspection
```
Operation: list_tables
Project ID: <project-id>
Schemas: ["public"]
```

**Operations**:
- `list_tables` - List all tables
- `list_extensions` - List PostgreSQL extensions
- `execute_sql` - Query `information_schema` for details

#### Edge Functions
```
Operation: deploy_edge_function
Project ID: <project-id>
Name: protocol-retrieval
Files: [{ name: "index.ts", content: "..." }]
```

**Operations**:
- `list_edge_functions` - List functions
- `get_edge_function` - Get function code
- `deploy_edge_function` - Deploy new/updated function

#### Project Management
```
Operation: get_project
Project ID: <project-id>
```

**Operations**:
- `list_projects` - List all projects
- `get_project` - Get project details
- `get_project_url` - Get API URL
- `get_anon_key` - Get anonymous key

#### Logs & Debugging
```
Operation: get_logs
Project ID: <project-id>
Service: api
```

**Services**: `api`, `postgres`, `edge-function`, `auth`, `storage`, `realtime`

**Use Cases**:
- Debug API errors
- Monitor database queries
- Check edge function logs
- Troubleshoot authentication

#### Security Advisors
```
Operation: get_advisors
Project ID: <project-id>
Type: security
```

**Types**: `security`, `performance`

**Use Cases**:
- Check for missing RLS policies
- Identify performance issues
- Security vulnerability detection

---

## Supabase PostgREST

**Purpose**: Direct database access via PostgREST API

**Configuration**:
- API URL: `https://xstlnicbnzdxlgfiewmg.supabase.co/rest/v1`
- API Key: Service role key (configured in mcp.json)
- Schemas: `public`, `auth`, `storage`

### Common Operations

#### Query Data
```
GET /rest/v1/audit_logs?limit=10&order=created_at.desc
```

**Use Cases**:
- Quick data inspection
- Filtering and sorting
- Relationship queries

**Example Queries**:
```
# Get recent audit logs
GET /rest/v1/audit_logs?limit=10&order=created_at.desc

# Filter by date
GET /rest/v1/audit_logs?created_at=gte.2025-01-01

# Select specific columns
GET /rest/v1/audit_logs?select=id,created_at,action
```

#### Insert/Update/Delete
```
POST /rest/v1/audit_logs
Content-Type: application/json
{ "action": "test", "user_id": "abc123" }
```

**Use Cases**:
- Insert test data
- Update records
- Delete test records

---

## Netlify

**Purpose**: Deployment management, site configuration, environment variables

**Configuration**:
- Command: `npx -y @netlify/mcp`
- Authentication: `NETLIFY_AUTH_TOKEN` (configured in mcp.json)

### Common Operations

#### Deployment
```
Operation: deploy-site
Site ID: <site-id>
Deploy Directory: .next
```

**Use Cases**:
- Manual deployment
- Testing deployment changes
- Preview deployments

**Workflow**:
1. Build: `npm run build`
2. Deploy: Use Netlify MCP to deploy `.next` directory
3. Check status: Use `get-deploy-for-site` to verify

#### Environment Variables
```
Operation: manage-env-vars
Site ID: <site-id>
Upsert Env Var: true
Env Var Key: LLM_API_KEY
Env Var Value: <new-key>
Env Var Is Secret: true
New Var Context: production
```

**Operations**:
- `manage-env-vars` with `getAllEnvVars: true` - List all vars
- `manage-env-vars` with `upsertEnvVar: true` - Set/update var
- `manage-env-vars` with `deleteEnvVar: true` - Delete var

**Contexts**: `all`, `dev`, `branch-deploy`, `deploy-preview`, `production`, `branch`

**Scopes**: `all`, `builds`, `functions`, `runtime`, `post_processing`

#### Site Management
```
Operation: get-project
Site ID: <site-id>
```

**Operations**:
- `get-project` - Get site details
- `get-projects` - List all sites
- `update-project-name` - Rename site
- `get-deploy-for-site` - Get deployment details

#### Forms (if applicable)
```
Operation: get-forms-for-project
Site ID: <site-id>
```

**Use Cases**:
- Manage form submissions
- Configure form handling

---

## Memory

**Purpose**: Knowledge graph for storing and retrieving project knowledge

**Configuration**:
- Command: `node` + `@modelcontextprotocol/server-memory`

### Common Operations

#### Store Knowledge
```
Operation: create_entities
Entities:
  - Name: ChatService
    Type: Manager
    Observations:
      - Main chat orchestration manager
      - Uses RetrievalManager, GuardrailManager
      - Located in lib/managers/chat-service.ts
```

**Use Cases**:
- Store component relationships
- Document codebase structure
- Track dependencies
- Onboard new agents

#### Retrieve Knowledge
```
Operation: search_nodes
Query: ChatService dependencies
```

**Operations**:
- `search_nodes` - Search by query
- `open_nodes` - Get specific entities
- `read_graph` - Read entire knowledge graph

#### Create Relationships
```
Operation: create_relations
Relations:
  - From: ChatService
    To: RetrievalManager
    RelationType: uses
```

**Use Cases**:
- Map component dependencies
- Track relationships
- Build knowledge graph

#### Update Knowledge
```
Operation: add_observations
Observations:
  - EntityName: ChatService
    Contents:
      - Handles chat requests and responses
      - Returns formatted protocol citations
```

---

## Sequential Thinking

**Purpose**: Complex problem-solving through structured thinking

**Configuration**:
- Command: `node` + `@modelcontextprotocol/server-sequential-thinking`

### Common Operations

#### Break Down Problem
```
Operation: sequentialthinking
Thought: Current ChatService is 350 lines, violates 500-line limit but needs refactoring
Total Thoughts: 5
```

**Use Cases**:
- Complex refactoring tasks
- Multi-step implementation
- Problem analysis
- Architecture decisions

**How It Works**:
1. Start with problem statement
2. Break into sequential thoughts
3. Revise thoughts as understanding deepens
4. Generate solution hypothesis
5. Verify hypothesis

**Example Flow**:
```
Thought 1: Problem - ChatService too large
Thought 2: Identify responsibilities (orchestration, retrieval, validation)
Thought 3: Extract RetrievalManager (already exists, verify)
Thought 4: Extract GuardrailService (check if exists)
Thought 5: Refactor ChatService to thin orchestrator
Solution: Extract services, reduce ChatService to <200 lines
```

---

## Filesystem

**Purpose**: Read and navigate workspace files

**Configuration**:
- Command: `npx -y @modelcontextprotocol/server-filesystem`
- Root: `/Users/tanner-osterkamp` (workspace root)

### Common Operations

#### Read Files
```
Operation: Read file
Path: lib/managers/chat-service.ts
```

**Use Cases**:
- Understand code structure
- Read existing implementations
- Check patterns
- Review test files

#### List Directory
```
Operation: List directory
Path: lib/managers
```

**Use Cases**:
- Explore codebase structure
- Find related files
- Discover patterns

**Limitations**:
- Read-only within workspace
- Cannot write files
- Respects `.gitignore` patterns

---

## GitKraken

**Purpose**: Git operations via GitKraken/GitLens integration

**Configuration**:
- Command: GitKraken CLI from GitLens extension
- Type: `stdio`

### Common Operations

**Use Cases**:
- Branch management
- Commit history
- Repository operations

**Note**: Primary git operations should use standard git commands. GitKraken MCP provides integration with GitKraken UI.

---

## Notion

**Purpose**: Documentation integration

**Configuration**:
- URL: `https://mcp.notion.com/mcp`

### Common Operations

**Use Cases**:
- Sync documentation
- Store project notes
- Knowledge base integration

**Note**: Currently configured but may require Notion API setup for full functionality.

---

## Stripe

**Purpose**: Payment operations (if applicable)

**Configuration**:
- Command: `npx -y @stripe/mcp --tools=all`
- API Key: `sk_live_...` (configured in mcp.json)

### Common Operations

**Use Cases** (if payment features added):
- Create customers
- Process payments
- Manage subscriptions
- Handle invoices

**Note**: Currently configured but Medic-Bot does not currently use payments. Available for future features.

---

## Brave Search

**Purpose**: Web search for documentation and examples

**Configuration**:
- Command: `npx -y @modelcontextprotocol/server-brave-search`
- Authentication: `BRAVE_API_KEY` (requires setup)

### Common Operations

```
Operation: Search web
Query: Next.js 14 App Router API routes
```

**Use Cases**:
- Search for documentation
- Find code examples
- Research best practices
- Troubleshoot issues

**Note**: Requires `BRAVE_API_KEY` to be configured.

---

## Puppeteer

**Purpose**: Browser automation for E2E testing and scraping

**Configuration**:
- Command: `node` + `@hisma/server-puppeteer`

### Common Operations

**Use Cases**:
- E2E test automation
- Screenshot generation
- PDF generation
- Web scraping (if needed)

**Integration**:
- Works with Playwright for E2E tests
- Can be used for visual regression testing

---

## Chrome DevTools

**Purpose**: Browser debugging and performance analysis

**Configuration**:
- Command: `npx -y chrome-devtools-mcp`

### Common Operations

**Use Cases**:
- Debug browser issues
- Performance profiling
- Network inspection
- Console debugging

**Integration**:
- Use with E2E tests for debugging
- Profile client-side performance
- Inspect API calls

---

## Quick Reference Table

| Tool | Primary Use | Key Operations |
|------|-------------|----------------|
| **GitHub** | Code search, PRs | `search_code`, `create_pull_request`, `create_issue` |
| **Supabase** | Database, migrations | `execute_sql`, `apply_migration`, `list_tables` |
| **Supabase PostgREST** | Direct DB access | REST API queries |
| **Netlify** | Deployment | `deploy-site`, `manage-env-vars` |
| **Memory** | Knowledge graph | `create_entities`, `search_nodes` |
| **Sequential Thinking** | Problem solving | `sequentialthinking` |
| **Filesystem** | File operations | Read files, list directories |
| **GitKraken** | Git operations | Branch management |
| **Notion** | Documentation | Sync docs |
| **Stripe** | Payments | Customer, payment operations |
| **Brave Search** | Web search | Search documentation |
| **Puppeteer** | Browser automation | E2E testing |
| **Chrome DevTools** | Debugging | Performance, debugging |

---

## Authentication Reference

### Required Tokens/Keys

| Tool | Variable | Location |
|------|----------|----------|
| GitHub | `GITHUB_PERSONAL_ACCESS_TOKEN` | mcp.json env |
| Supabase | Project ID, API keys | mcp.json config |
| Netlify | `NETLIFY_AUTH_TOKEN` | mcp.json env |
| Stripe | `sk_live_...` | mcp.json args |
| Brave Search | `BRAVE_API_KEY` | Requires setup |

### Security Notes

- **Never commit tokens**: All tokens stored in `.cursor/mcp.json` (local only)
- **Rotate regularly**: Update tokens periodically
- **Use least privilege**: Grant minimum required permissions
- **Review access**: Regularly audit MCP tool access

---

## Integration Examples

### Example: Adding New Medication Calculator

```
1. Use GitHub MCP to search for existing calculator patterns
   search_code: "class.*Calculator implements MedicationCalculator"

2. Use Filesystem MCP to read epinephrine.ts as template

3. Use Sequential Thinking to plan implementation
   sequentialthinking: "Steps to add morphine calculator"

4. Write code following patterns

5. Use Supabase MCP to run tests against database (if needed)

6. Use GitHub MCP to create PR
   create_pull_request: "feat: add morphine calculator"
```

### Example: Debugging Database Issue

```
1. Use Supabase MCP to check logs
   get_logs: service=postgres

2. Use Supabase PostgREST to query data
   execute_sql: "SELECT * FROM table WHERE condition"

3. Use Sequential Thinking to analyze issue
   sequentialthinking: "Why is query slow?"

4. Fix issue and verify with Supabase MCP
```

---

**Configuration File**: `.cursor/mcp.json`
**For Workflows**: See `docs/cursor-workflows.md`
**For Agent Guide**: See `AGENTS.md`

