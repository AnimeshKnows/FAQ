---
title: C++ STL Containers
url: https://en.cppreference.com/w/cpp/container
---

# STL Containers

The Standard Template Library provides sequence and associative containers with consistent iterator interfaces.

## Common containers

- `std::vector<T>` — contiguous dynamic array; default choice for most lists
- `std::array<T, N>` — fixed-size stack array
- `std::string` — contiguous character sequence
- `std::unordered_map<K,V>` — hash map for average O(1) lookup
- `std::map<K,V>` — ordered tree map

```cpp
#include <vector>
#include <string>

std::vector<std::string> names{"ann", "bob"};
names.push_back("cara");
for (const auto& name : names) {
    // iterate by const reference
}
```

## Choosing a container

Use `vector` unless you need frequent middle inserts (`list`/`deque` rarely win), keyed lookup (`unordered_map`/`map`), or uniqueness (`set`/`unordered_set`).

## Iterators and algorithms

Containers expose iterators used by `<algorithm>` (`std::sort`, `std::find_if`, `std::ranges` in C++20). Invalidating iterators (e.g. reallocation of `vector`) is a common bug — treat references into a growing vector carefully.

## Ownership with smart pointers

Store owning pointers as `std::unique_ptr` or `std::shared_ptr` in containers. Prefer values when possible to keep ownership simple.
