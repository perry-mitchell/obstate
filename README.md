# ObState
> Generic object state management with events

[![obstate](https://img.shields.io/npm/v/obstate?color=blue&label=obstate&logo=npm&style=flat-square)](https://www.npmjs.com/package/obstate) ![Tests](https://github.com/perry-mitchell/obstate/actions/workflows/test.yml/badge.svg)

Simple state manager that uses objects to store and track state. Manage the object normally as it additionally provides events to listen to state changes.

ObState uses `Proxy`s to handle state changes, and then emits events using a standard `EventEmitter` interface.

## Usage

Import the `createStateObject` method and use it to wrap an object (a new object is returned, the old is not mutated):

```typescript
import { createStateObject } from "obstate";

const state = createStateObject({
    name: "Jane Doe",
    age: 24
});

state.on(
    "before",
    ({ property, newValue, currentValue }) =>
        console.log(`Will update '${property}': ${currentValue} => ${newValue}`)
);
state.on(
    "update",
    ({ property, newValue, oldValue }) =>
        console.log(`Did update '${property}':  ${oldValue} => ${newValue}`)
);

Object.assign(state, {
    name: "John Doe",
    age: 22
});
```

The example above would output:

```
Will update 'name': Jane Doe => John Doe
Did update 'name':  Jane Doe => John Doe
Will update 'age': 24 => 22
Did update 'age':  24 => 22
```

### React

_TBA._
