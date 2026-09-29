---
title: JavaScript Introduction
url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
---

# JavaScript Introduction

JavaScript is the language of the web runtime (browsers and Node.js), dynamically typed with first-class functions.

## Values and variables

```javascript
const name = "Ada";
let count = 0;
count += 1;
```

Prefer `const` by default; use `let` when reassignment is required. Avoid `var` in modern code (function scoping and hoisting surprises).

## Objects and arrays

```javascript
const user = { id: 1, name: "Ada" };
const tags = ["docs", "rag"];
const { name } = user;
```

Objects are key/value maps. Arrays are ordered lists with methods like `map`, `filter`, and `reduce`.

## Functions

```javascript
function add(a, b) {
  return a + b;
}

const multiply = (a, b) => a * b;
```

Arrow functions inherit `this` lexically. Functions are values and can be passed as callbacks.

## Modules

ES modules use `import` / `export`. In browsers and modern Node, treat each file as a module rather than relying on globals.
