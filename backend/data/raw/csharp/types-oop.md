---
title: C# Types and OOP
url: https://learn.microsoft.com/dotnet/csharp/fundamentals/types/
---

# Types and OOP

C# supports classes, interfaces, structs, records, and enums with clear inheritance rules.

## Classes and interfaces

```csharp
public interface ILogger
{
    void Log(string message);
}

public class ConsoleLogger : ILogger
{
    public void Log(string message) => Console.WriteLine(message);
}
```

A class inherits at most one base class but may implement many interfaces. Prefer depending on interfaces for testability.

## Access modifiers

`public`, `internal`, `protected`, `private`, and combinations like `protected internal` control visibility. Default class members are `private`.

## Records

```csharp
public record Person(string Name, int Age);
```

Records give value-based equality and concise immutable data shapes useful for DTOs.

## Generics

```csharp
public class Repository<T> where T : class
{
    private readonly List<T> _items = new();
    public void Add(T item) => _items.Add(item);
}
```

Constraints (`where T : ...`) document what callers may pass and unlock type-safe APIs.
