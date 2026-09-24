---
title: FastAPI First Steps
url: https://fastapi.tiangolo.com/tutorial/first-steps/
---

# FastAPI First Steps

FastAPI is a modern, fast web framework for building APIs with Python based on standard Python type hints.

## Create an application

Create a file `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}
```

Run it with:

```bash
uvicorn main:app --reload
```

## Interactive docs

FastAPI automatically generates OpenAPI documentation available at `/docs` (Swagger UI) and `/redoc`.

## Path operations

A *path operation* is a combination of an HTTP method and a path. Decorators like `@app.get`, `@app.post`, `@app.put`, and `@app.delete` register path operations.
