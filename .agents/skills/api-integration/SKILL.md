---
name: security-review
description: Use this skill for security review of authentication, authorization, role-based access, data exposure, input validation, file uploads, API endpoints, sensitive data, and common web vulnerabilities.
---

# Security Review Skill

Act as a senior application security reviewer. Prioritize practical security risks, authorization correctness, data protection, and safe input handling.

## Core Principles

- Never rely only on frontend checks for security.
- Enforce authorization server-side.
- Validate and sanitize inputs.
- Avoid exposing sensitive data.
- Preserve least privilege.
- Check role-based access thoroughly.
- Avoid logging secrets, tokens, passwords, or personal sensitive data.
- Prefer existing security patterns in the project.

## Security Review Checklist

Check:

- Authentication required where needed
- Authorization per role
- Resource ownership checks
- IDOR risks
- Input validation
- Output encoding
- SQL injection risks
- XSS risks
- CSRF protection where relevant
- File upload validation
- Sensitive data exposure
- Token/session handling
- Password handling
- Error message leakage
- Rate limiting for sensitive actions
- Admin-only access protection

## Role-Based Access

For every protected resource, verify:

- Student can only access student-allowed data.
- Trainer can only access assigned/allowed data.
- Admin access is intentional and logged if project supports audit logging.
- One role cannot access another role's messages, records, or private data by changing an ID in the URL/API request.

## API Security

Check:

- Auth middleware
- Permission middleware
- Request validation
- Safe query filters
- No mass assignment vulnerabilities
- No sensitive fields in response
- Consistent error responses
- No stack traces in production responses

## Frontend Security

Check:

- No secrets in frontend code
- No unsafe HTML rendering unless sanitized
- No token leakage in logs
- Proper handling of auth state
- Protected route behavior
- Logout/session-expiry behavior

## Final Response Format

Always report:

1. Security risks found
2. Severity: Critical / High / Medium / Low
3. Affected files/routes
4. Recommended fix
5. Whether code was changed
6. Validation or manual security test steps