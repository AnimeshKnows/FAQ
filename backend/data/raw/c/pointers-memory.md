---
title: C Pointers and Memory
url: https://en.cppreference.com/w/c/language/pointer
---

# Pointers and Memory

Pointers store addresses. Dereferencing a pointer accesses the value at that address.

## Pointer basics

```c
int x = 42;
int *p = &x;   /* p holds the address of x */
*p = 7;        /* writes through the pointer */
```

A null pointer (`NULL`) means "no valid object". Always check before dereference when a pointer may be null.

## Dynamic allocation

Heap memory is allocated with `malloc` / `calloc` and released with `free`.

```c
#include <stdlib.h>

int *buf = malloc(10 * sizeof *buf);
if (buf == NULL) {
    /* handle allocation failure */
}
/* use buf ... */
free(buf);
buf = NULL;
```

Every successful `malloc` needs a matching `free`. Double-free and use-after-free are undefined behavior.

## Arrays and pointer arithmetic

`buf[i]` is equivalent to `*(buf + i)`. Pointer arithmetic scales by the pointed-to type size. Do not form pointers outside the array bounds (one-past-the-end is allowed for comparison only).

## Ownership conventions

Document who frees memory. Prefer allocating and freeing in the same module when possible, or use clear transfer-of-ownership APIs.
