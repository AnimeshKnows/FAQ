---
title: React State useState
url: https://react.dev/reference/react/useState
---

# useState

`useState` is a React Hook that lets you add a state variable to your component.

## Usage

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

Calling the setter function (`setCount`) queues a re-render with the new state value.

## Updating state based on previous state

Prefer the functional updater form when the next value depends on the previous one:

```jsx
setCount((c) => c + 1);
```

## Multiple state variables

You can call `useState` multiple times in one component for independent pieces of state.
