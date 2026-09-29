---
title: C# Introduction
url: https://learn.microsoft.com/dotnet/csharp/
---

# C# Introduction

C# is a modern, strongly typed language on .NET used for web APIs, desktop, cloud, and game development.

## Program entry

```csharp
Console.WriteLine("Hello, C#");
```

With top-level statements, a simple console app needs no explicit `Main`. Types live in namespaces; projects use SDK-style `.csproj` files.

## Common types

Value types (`int`, `bool`, `struct`) and reference types (`class`, `string`, arrays) differ in copy semantics. Prefer `string`, `List<T>`, and `Dictionary<TKey,TValue>` from the BCL.

## Properties and methods

```csharp
public class User
{
    public string Name { get; set; } = "";
    public int Age { get; init; }

    public string Greet() => $"Hi, {Name}";
}
```

Auto-properties, expression-bodied members, and records reduce boilerplate.

## Tooling

Build and run with the .NET CLI (`dotnet build`, `dotnet run`). Target a supported TFM such as `net8.0` and enable nullable reference types for safer null handling.
