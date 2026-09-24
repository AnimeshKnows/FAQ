---
title: FastAPI Dependencies
url: https://fastapi.tiangolo.com/tutorial/dependencies/
---

# Dependencies

FastAPI has a powerful dependency injection system. Dependencies are declared with `Depends`.

## What is Depends

`Depends` tells FastAPI to call a dependency function and inject its return value into a path operation parameter.

```python
from fastapi import Depends, FastAPI

app = FastAPI()


async def common_parameters(skip: int = 0, limit: int = 100):
    return {"skip": skip, "limit": limit}


@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons
```

## Why use dependencies

Dependencies are useful for shared logic such as:

- Database sessions
- Authentication and authorization
- Common query parameter parsing
- Reusable business rules

## Nested dependencies

Dependencies can declare other dependencies. FastAPI resolves the full dependency tree automatically.

## Classes as dependencies

A class can be used as a dependency. FastAPI will instantiate it using its `__init__` parameters as dependencies or query parameters.
