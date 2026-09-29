---
title: REST HTTP Methods and Status Codes
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
---

# HTTP Methods and Status Codes

Methods describe intent; status codes describe outcomes.

## Common methods

| Method | Typical use | Idempotent |
|--------|-------------|------------|
| GET | Read a resource | Yes |
| POST | Create or trigger an action | No |
| PUT | Replace a resource | Yes |
| PATCH | Partial update | Usually |
| DELETE | Remove a resource | Yes |

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{"name":"Ada"}
```

Safe methods (GET, HEAD) should not change server state.

## Status codes

- `200 OK` — success with body
- `201 Created` — resource created (often with `Location`)
- `204 No Content` — success without body
- `400 Bad Request` — client input invalid
- `401 Unauthorized` — authentication required/failed
- `403 Forbidden` — authenticated but not allowed
- `404 Not Found` — resource missing
- `409 Conflict` — state conflict (duplicates, versions)
- `500 Internal Server Error` — unexpected server failure

## Error bodies

Return a structured error payload with a machine-readable code and human message. Keep validation errors detailed enough for clients to fix requests without exposing stack traces.
