---
title: JavaScript Async and Promises
url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
---

# Async and Promises

Asynchronous work in JavaScript is modeled with promises and `async`/`await`, not blocking threads.

## Promises

```javascript
fetch("/api/health")
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

A promise is pending, fulfilled, or rejected. Always handle rejections to avoid unhandled promise errors.

## async / await

```javascript
async function loadHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}
```

`await` pauses the async function until the promise settles. The surrounding function must be `async`.

## Parallelism

```javascript
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

Use `Promise.all` for independent concurrent work. Use `Promise.allSettled` when you want every result even if some fail.

## Event loop

JavaScript runs on an event loop. Long CPU work blocks the loop; split heavy tasks or move them off-thread (Web Workers / worker threads).
