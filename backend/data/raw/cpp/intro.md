---
title: C++ Introduction
url: https://en.cppreference.com/w/cpp
---

# C++ Introduction

C++ builds on C with classes, templates, RAII, and a rich standard library while remaining suitable for systems and performance-critical code.

## Hello world

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, C++\n";
    return 0;
}
```

Prefer the C++ standard library over C APIs when both exist (`std::string` over raw `char*`, `std::vector` over manual arrays).

## Compilation and namespaces

Headers typically use `.hpp` or `.h`. The standard library lives in namespace `std`. Avoid `using namespace std;` in headers.

## Value categories and references

Objects can be passed by value, lvalue reference (`T&`), or const reference (`const T&`). Move semantics (`T&&`) transfer ownership of resources efficiently.

## Modern C++ habits

Use `auto` where it improves clarity, prefer range-based `for`, and enable warnings. Target a known standard (C++17/C++20) and document it for the project.
