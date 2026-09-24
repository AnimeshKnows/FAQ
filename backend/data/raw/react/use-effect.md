---
title: React Effects useEffect
url: https://react.dev/reference/react/useEffect
---

# useEffect

`useEffect` lets you synchronize a component with an external system.

## Basic usage

```jsx
import { useEffect, useState } from "react";

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  // ...
}
```

## Dependency array

- Omit the array: effect runs after every render (rarely what you want)
- `[]`: run once after mount (and clean up on unmount)
- `[roomId]`: re-run when `roomId` changes

## Cleanup

Return a function from the effect to clean up subscriptions, timers, or connections.

## Not for transforming data

If you can calculate something during render, do not put it in `useEffect`. Effects are for side effects such as networking, DOM integration, and subscriptions.
