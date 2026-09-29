---
title: Java Introduction
url: https://docs.oracle.com/en/java/
---

# Java Introduction

Java is a compiled, statically typed language that runs on the JVM with a large standard library and ecosystem.

## Entry point

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}
```

Source files typically match the public class name. Packages organize types; `import` brings other packages into scope.

## Primitive vs reference types

Primitives (`int`, `boolean`, `double`, …) are not objects. Reference types are classes, interfaces, arrays, and enums. Autoboxing converts between primitives and wrappers (`Integer`, `Boolean`) but can hide allocations and nulls.

## Build tools

Most projects use Maven or Gradle. A JDK (17+ LTS recommended) provides `javac` and `java`. Modules (`module-info.java`) are optional for many apps.

## Memory and GC

The JVM manages heap memory with garbage collection. Developers still avoid leaks by releasing native resources (`try-with-resources`) and clearing unused references from long-lived collections.
