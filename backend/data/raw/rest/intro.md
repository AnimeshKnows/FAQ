---
title: REST API Introduction
url: https://developer.mozilla.org/en-US/docs/Glossary/REST
---

# REST API Introduction

REST-style HTTP APIs expose resources as URLs and use standard methods and status codes for client-server communication.

## Resources and URLs

Identify nouns as resources: `/users`, `/users/42`, `/users/42/orders`. Prefer plural names and stable paths. Nested resources should stay shallow when possible.

## Stateless requests

Each request carries enough context (auth headers, IDs) for the server to handle it without relying on hidden server session for resource state. Caching and scaling are easier when servers stay stateless.

## Representations

JSON is the common payload format:

```http
GET /api/users/42 HTTP/1.1
Accept: application/json
```

```json
{ "id": 42, "name": "Ada" }
```

Use `Content-Type` and `Accept` headers to negotiate formats when you support more than one.

## Uniform interface

Clients interact through a consistent vocabulary of methods, status codes, and media types rather than custom RPC verbs for every action. Actions that are not CRUD-shaped can still map to POST on a dedicated sub-resource (e.g. `/orders/42/cancel`).
