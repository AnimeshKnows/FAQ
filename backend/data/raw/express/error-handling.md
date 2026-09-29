---
title: Express Error Handling
url: https://expressjs.com/en/guide/error-handling.html
---

# Error Handling

Centralized error middleware keeps route handlers thin and responses consistent.

## Error middleware signature

```javascript
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
}

app.use(errorHandler);
```

Error handlers take **four** arguments. Register them after routes.

## Async handlers

```javascript
app.get("/items/:id", async (req, res, next) => {
  try {
    const item = await loadItem(req.params.id);
    if (!item) {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});
```

Wrap async work and pass failures to `next(err)`. Libraries or wrappers can reduce try/catch boilerplate.

## Operational vs programmer errors

Map known cases (validation, not found, unauthorized) to 4xx. Log unexpected 5xx with stack traces server-side; avoid leaking internals to clients in production.
