---
title: FastAPI Security and OAuth2 with Password Bearer
url: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
---

# Security — OAuth2 and JWT

FastAPI includes utilities for OAuth2 password flows and JWT bearer tokens.

## OAuth2PasswordBearer

`OAuth2PasswordBearer` is a dependency that looks for an `Authorization` header with a Bearer token:

```python
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    return {"token": token}
```

## JWT tokens

A common pattern is:

1. Authenticate username/password at a `/token` endpoint
2. Create a signed JWT with an expiration claim
3. Require the JWT on protected routes via `Depends(oauth2_scheme)`
4. Decode and validate the JWT before returning user data

Libraries such as `python-jose` or `PyJWT` are commonly used to encode and decode JWTs. Passwords should be hashed with a library like `passlib`.

## Protecting endpoints

Any path operation that declares `token: str = Depends(oauth2_scheme)` becomes protected. Unauthorized requests without a valid Bearer token receive HTTP 401.
