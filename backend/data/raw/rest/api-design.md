---
title: REST API Design
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
---

# API Design

Good REST APIs stay predictable: clear resources, pagination, versioning strategy, and security defaults.

## Pagination and filtering

```http
GET /api/items?limit=20&cursor=abc&status=active
```

Prefer cursor or keyset pagination for large datasets. Document query parameters and default limits.

## Versioning

Common approaches: URL prefix (`/v1/...`), header version, or evolving a single version carefully with backward-compatible changes. Pick one strategy and stick to it.

## Authentication

Use standard schemes such as Bearer tokens (OAuth2/JWT) over HTTPS. Never put secrets in query strings. Scope tokens to the least privilege needed.

## CORS and browsers

Browser clients need CORS headers from the API origin. Restrict `Access-Control-Allow-Origin` in production; wildcards with credentials are unsafe.

## Documentation

Publish OpenAPI/Swagger (or equivalent) so clients know paths, schemas, and errors. Keep examples aligned with the live API.
