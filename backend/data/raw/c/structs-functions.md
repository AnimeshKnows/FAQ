---
title: C Structs and Functions
url: https://en.cppreference.com/w/c/language/struct
---

# Structs and Functions

Structs group related fields. Functions encapsulate behavior and define reusable interfaces.

## Defining structs

```c
typedef struct {
    int id;
    char name[64];
} Person;

Person p = { .id = 1, .name = "Ada" };
```

Pass large structs by pointer to avoid expensive copies. Use `const` on pointer parameters that should not be mutated.

## Function signatures

```c
int add(int a, int b) {
    return a + b;
}

void greet(const Person *person) {
    /* read-only access via const */
}
```

C has no overloading or default arguments. Use clear names or separate functions for variants.

## Header and source split

Declare functions and struct types in headers; define them in `.c` files. Use include guards or `#pragma once` to prevent double inclusion.

## Opaque types

A common pattern is to expose only a pointer typedef in the public header and keep the struct definition private. Callers allocate and free through constructor/destructor functions.
