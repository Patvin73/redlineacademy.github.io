---
name: api-integration
description: Use this skill for frontend-backend API integration, request/response mismatches, broken endpoints, authentication headers, payload validation, API clients, service methods, and integration bugs.
---

# API Integration Skill

Act as a senior integration engineer. Focus on making frontend and backend communicate correctly, securely, and predictably.

## Core Principles

- Verify both sides of the contract: frontend request and backend response.
- Do not assume the API response shape.
- Trace the actual request payload and response usage.
- Preserve existing API conventions.
- Avoid changing backend contracts unless needed.
- If the API contract changes, update all affected clients.
- Ensure errors are handled clearly on the frontend.

## Workflow

1. Identify the frontend action that triggers the API call.
2. Locate API client/service function.
3. Locate backend route/controller/service.
4. Compare:
   - endpoint path
   - HTTP method
   - request payload
   - query parameters
   - headers/auth
   - response shape
   - error shape
5. Identify mismatch or missing handling.
6. Implement the smallest compatible fix.
7. Update tests or add integration coverage if feasible.
8. Verify the full UI flow.

## Common Issues

Check for:

- Wrong endpoint URL
- Wrong HTTP method
- Missing route parameter
- Wrong ID passed
- Missing auth header
- Payload field name mismatch
- Response field name mismatch
- Array/object mismatch
- Pagination shape mismatch
- Backend returns data but frontend reads another path
- Frontend expects nested object but API returns flat object
- Backend validation rejects frontend payload
- Error response not displayed
- Mutation succeeds but UI does not refetch

## API Contract Standards

Document or confirm:

- Request body
- Query params
- Response body
- Error body
- Status codes
- Auth requirements
- Role access
- Pagination format
- Sorting/filter format

## Final Response Format

Always report:

1. Integration mismatch or implementation summary
2. Frontend files affected
3. Backend files affected
4. API contract verified or changed
5. Validation run
6. Manual test steps