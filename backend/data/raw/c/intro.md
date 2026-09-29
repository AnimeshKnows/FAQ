---
title: C Language Introduction
url: https://en.cppreference.com/w/c
---

# C Language Introduction

C is a systems programming language with manual memory control, simple types, and direct mapping to machine operations.

## Compilation model

A typical C program is compiled from source (`.c`) into object files, then linked into an executable. Headers (`.h`) declare interfaces shared across translation units.

```c
#include <stdio.h>

int main(void) {
    printf("Hello, C\n");
    return 0;
}
```

## Core types

Scalar types include `int`, `char`, `float`, `double`, and unsigned variants. Arrays and pointers are closely related: an array name decays to a pointer to its first element in most expressions.

## Control flow

C provides `if`/`else`, `switch`, `for`, `while`, and `do`/`while`. Functions are the primary unit of abstraction. There is no built-in exception system; errors are usually signaled with return codes or `errno`.

## Standard library

The C standard library covers I/O (`stdio.h`), strings (`string.h`), memory (`stdlib.h`), and math (`math.h`). Prefer standard APIs over platform-specific calls when writing portable code.
