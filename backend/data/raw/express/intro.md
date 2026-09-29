---
title: Express Introduction
url: https://expressjs.com/en/starter/installing.html
---

# Express Introduction

Express is a minimal Node.js web framework for HTTP APIs and server-rendered apps.

## Minimal server

```javascript
import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("listening on :3000");
});
```

Install with `npm install express`. Use the official docs for the major version you pin.

## Request and response

Handlers receive `req` (query, params, body, headers) and `res` (status, json, send). Middleware can read/write both before the final handler runs.

## Project layout

Common pattern: `routes/` for path groups, `middleware/` for cross-cutting concerns, and a thin `app.js`/`index.js` that wires them. Keep business logic out of route files when the app grows.

## Error safety

Always send a response or call `next(err)`. Unhandled async rejections in handlers can hang requests unless you forward errors to Express error middleware.
