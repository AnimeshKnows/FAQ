---
title: React Quick Start
url: https://react.dev/learn
---

# React Quick Start

React is a JavaScript library for building user interfaces with reusable components.

## Creating and nesting components

Components are JavaScript functions that return markup:

```jsx
function MyButton() {
  return <button>I'm a button</button>;
}

export default function MyApp() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton />
    </div>
  );
}
```

## Adding markup

JSX lets you write HTML-like markup inside JavaScript. Component names must start with a capital letter.

## Displaying data

Use curly braces to embed JavaScript expressions in JSX:

```jsx
const user = { name: "Ada" };
return <h1>{user.name}</h1>;
```
