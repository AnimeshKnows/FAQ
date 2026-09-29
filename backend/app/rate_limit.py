"""Shared rate limiter (Redis when available, in-memory fallback)."""

from __future__ import annotations

import logging

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

logger = logging.getLogger(__name__)


def client_ip(request: Request) -> str:
    """Prefer first X-Forwarded-For hop (nginx), else direct client host."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip() or get_remote_address(request)
    return get_remote_address(request)


def _storage_uri() -> str:
    settings = get_settings()
    if not settings.rate_limit_enabled:
        return "memory://"
    try:
        import redis

        client = redis.from_url(settings.redis_url, socket_connect_timeout=1.0)
        client.ping()
        return settings.redis_url
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Redis unavailable (%s); using in-memory rate limits. "
            "Shared limits across replicas require Redis at %s",
            exc,
            settings.redis_url,
        )
        return "memory://"


_settings = get_settings()
limiter = Limiter(
    key_func=client_ip,
    storage_uri=_storage_uri(),
    enabled=_settings.rate_limit_enabled,
    default_limits=[],
)
