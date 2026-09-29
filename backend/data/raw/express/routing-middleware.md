---
title: Express Routing and Middleware
url: https://expressjs.com/en/guide/routing.html
---

# Routing and Middleware

Routes map HTTP methods and paths to handlers. Middleware runs in a pipeline around those handlers.

## Route definitions

```javascript
const router = express.Router();

router.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id });
});

router.post("/users", (req, res) => {
  res.status(201).json(req.body);
});

app.use("/api", router);
```

Path parameters (`:id`), query strings (`req.query`), and mounted routers keep URLs organized.

## Middleware shape

```javascript
function requestId(req, res, next) {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

app.use(requestId);
```

Middleware is `(req, res, next)`. Call `next()` to continue or `next(err)` to jump to error handlers. Order matters: earlier `app.use` runs first on the way in.

## Built-in and third-party middleware

`express.json()` parses JSON bodies. Popular packages handle CORS, logging, compression, and auth. Apply expensive middleware only to routes that need it.
