---
title: FastAPI Middleware
url: https://fastapi.tiangolo.com/tutorial/middleware/
---

# Middleware

Middleware is code that runs before and after each request.

## Add middleware

Use `app.add_middleware` or the `@app.middleware("http")` decorator.

```python
import time
from fastapi import FastAPI, Request

app = FastAPI()


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## CORS middleware

For browser clients, add CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Order of execution

Middleware forms a stack. The last middleware added is the outermost and runs first on the way in.
