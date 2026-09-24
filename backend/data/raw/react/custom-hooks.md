---
title: React Custom Hooks
url: https://react.dev/learn/reusing-logic-with-custom-hooks
---

# Custom Hooks

Custom Hooks let you extract reusable stateful logic.

## Naming convention

Custom Hooks start with `use`, for example `useFormInput` or `useOnlineStatus`.

## Example

```jsx
import { useState, useEffect } from "react";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return isOnline;
}
```

Custom Hooks can call other Hooks. Share logic, not JSX markup, through hooks.
