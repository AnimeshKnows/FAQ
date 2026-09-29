---
title: C# Async and LINQ
url: https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/
---

# Async and LINQ

Asynchronous methods and LINQ queries are core to idiomatic C# for I/O and data transformation.

## async / await

```csharp
public async Task<string> FetchAsync(HttpClient client, string url)
{
    var response = await client.GetAsync(url);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
}
```

`async` methods return `Task` or `Task<T>`. Await non-blocking I/O; avoid `.Result` / `.Wait()` on UI or ASP.NET threads (deadlock risk).

## Cancellation

Accept a `CancellationToken` and pass it to APIs that support it so callers can abort long work.

## LINQ

```csharp
var adults = people
    .Where(p => p.Age >= 18)
    .OrderBy(p => p.Name)
    .Select(p => p.Name)
    .ToList();
```

LINQ works over in-memory sequences (`IEnumerable<T>`) and query providers (`IQueryable<T>` for EF Core). Prefer deferred execution awareness: materialize with `ToList()` when you need a snapshot.

## When to use each

Use async for network, file, and database I/O. Use LINQ for filtering/projection. Combine them carefully: async streams (`IAsyncEnumerable<T>`) help when pulling pages asynchronously.
