---
title: React Middleware Patterns in Frontend Apps
url: https://react.dev/learn/escaping-references
---

# Middleware-like patterns in React apps

React itself does not provide Express-style HTTP middleware. In frontend applications, "middleware" usually means:

## Routing middleware / loaders

Libraries such as React Router support loaders and actions that run before rendering a route. These can fetch data, redirect, or enforce auth checks.

## Request middleware with fetch wrappers

You can wrap `fetch` to attach auth headers, log requests, or handle errors uniformly:

```js
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}
```

## Context providers as cross-cutting layers

Providers for auth, theme, and analytics wrap the component tree and act as cross-cutting "middleware" for UI state.

Do not confuse React middleware-like patterns with ASP.NET Core or Express server middleware.
