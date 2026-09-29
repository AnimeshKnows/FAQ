---
title: Java Collections and Streams
url: https://docs.oracle.com/javase/tutorial/collections/
---

# Collections and Streams

The Collections Framework and Stream API cover most in-memory data processing needs.

## Core collections

- `List` — `ArrayList`, `LinkedList`
- `Set` — `HashSet`, `TreeSet`
- `Map` — `HashMap`, `TreeMap`, `ConcurrentHashMap`

```java
List<String> names = new ArrayList<>();
names.add("ann");
names.add("bob");

Map<String, Integer> ages = Map.of("ann", 30, "bob", 25);
```

Prefer interfaces in signatures (`List`, `Map`) so implementations can change.

## Streams

```java
List<String> adults = people.stream()
    .filter(p -> p.age() >= 18)
    .map(Person::name)
    .sorted()
    .toList();
```

Streams support filter/map/reduce pipelines. Intermediate ops are lazy; terminal ops trigger execution. Prefer sequential streams unless profiling shows a parallel benefit.

## Concurrency notes

Unsynchronized collections are not thread-safe. Use concurrent collections or external synchronization when sharing across threads. For simple cases, confine a collection to one thread.
