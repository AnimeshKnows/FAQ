---
title: JavaScript Modules and DOM
url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
---

# Modules and DOM

Modules structure code; the Document Object Model (DOM) lets scripts read and update web pages.

## ES modules

```javascript
// math.js
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// app.js
import { clamp } from "./math.js";
```

Default exports and named exports both work; named exports scale better for APIs. In HTML, load modules with `<script type="module">`.

## Selecting and updating elements

```javascript
const button = document.querySelector("#save");
button?.addEventListener("click", () => {
  const input = document.querySelector("#title");
  console.log(input?.value);
});
```

Prefer `querySelector` / `querySelectorAll`. Update text with `textContent` and structure with `createElement` / `append` rather than large `innerHTML` strings when handling untrusted data.

## Events

Listen with `addEventListener`. Remove listeners when components unmount (SPAs) to avoid leaks. Use event delegation on a parent when many similar children share behavior.

## Browser vs Node

DOM APIs exist only in browsers. Node focuses on servers, files, and networking. Share pure logic via modules; keep environment-specific APIs behind adapters.
