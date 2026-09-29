---
title: Django Introduction
url: https://docs.djangoproject.com/en/stable/intro/overview/
---

# Django Introduction

Django is a batteries-included Python web framework with an ORM, admin, auth, and a clear project layout.

## Projects and apps

`django-admin startproject` creates the project settings package. Apps (`startapp`) group models, views, and templates for a feature area. Register apps in `INSTALLED_APPS`.

## Settings and WSGI/ASGI

Configuration lives in `settings.py` (databases, middleware, templates, static files). Deploy with WSGI or ASGI servers. Keep secrets in environment variables, not source control.

## MVT pattern

Django follows Model–View–Template: models define data, views handle requests, templates render HTML. For JSON APIs, views (or Django REST Framework) return serialized responses instead of templates.

## Management commands

```bash
python manage.py migrate
python manage.py runserver
python manage.py createsuperuser
```

`migrate` applies schema changes; `runserver` is for local development only.
