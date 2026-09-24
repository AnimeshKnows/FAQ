---
title: FastAPI Path Parameters and Query Parameters
url: https://fastapi.tiangolo.com/tutorial/path-params/
---

# Path Parameters and Query Parameters

## Path parameters

Declare path parameters with Python function parameters matching path placeholders:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
```

FastAPI validates and converts types using type annotations.

## Query parameters

Function parameters that are not path parameters are interpreted as query parameters:

```python
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

Optional query parameters use `None` defaults or `Optional` types.

## Request body

Use Pydantic models for request bodies:

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None

@app.post("/items/")
def create_item(item: Item):
    return item
```
