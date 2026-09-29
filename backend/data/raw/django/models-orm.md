---
title: Django Models and ORM
url: https://docs.djangoproject.com/en/stable/topics/db/models/
---

# Models and ORM

Django models declare database tables as Python classes. The ORM queries them without raw SQL for most cases.

## Defining a model

```python
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

Create migrations with `makemigrations` and apply them with `migrate`.

## Querying

```python
Article.objects.filter(published=True).order_by("-created_at")
Article.objects.get(pk=1)
Article.objects.create(title="Hello", body="...")
```

`filter` returns a queryset (lazy). `get` expects one row and raises if missing or duplicated. Use `select_related` / `prefetch_related` to avoid N+1 queries.

## Relationships

`ForeignKey`, `OneToOneField`, and `ManyToManyField` model relations. Access reverse relations via the related name Django generates (or an explicit `related_name`).

## Integrity

Put constraints in the model (`unique=True`, `UniqueConstraint`) and validate in forms/serializers before save. Keep business rules close to the model when they are about data integrity.
