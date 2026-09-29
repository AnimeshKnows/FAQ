---
title: Django Views and URLs
url: https://docs.djangoproject.com/en/stable/topics/http/views/
---

# Views and URLs

URLconfs map paths to view callables. Views accept an `HttpRequest` and return an `HttpResponse`.

## URL routing

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("articles/", views.article_list, name="article-list"),
    path("articles/<int:pk>/", views.article_detail, name="article-detail"),
]
```

Include app urls from the project root with `include()`. Named routes support `reverse()` and `{% url %}` in templates.

## Function views

```python
from django.http import JsonResponse, Http404
from .models import Article

def article_detail(request, pk):
    try:
        article = Article.objects.get(pk=pk)
    except Article.DoesNotExist:
        raise Http404("No such article")
    return JsonResponse({"id": article.pk, "title": article.title})
```

## Class-based views

Generic CBVs (`ListView`, `DetailView`, `CreateView`) reduce boilerplate for common patterns. Override hooks like `get_queryset` for customization.

## Middleware and request flow

Middleware wraps every request. Views should stay focused: parse input, call services/ORM, return a response. Push cross-cutting auth, logging, and security headers into middleware or decorators.
