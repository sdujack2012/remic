# view-state-store

view-state-store is a simple and light weight react state management library without too much boilerplate. Redux is great and it enforces unified data flow. But as projects get big you will find your project flooded with actions, reducers and a lot constants. Also since redux doesn't natively support async actions, you have to install third party librarys as middleware. It adds a lot to development and maintanence efforts. view-state-store is designed to tackle these issues. It has some similar concepts, such as store and selectors. It also supports state separation. However, the most significant difference between them is that view-state-store replaces reducers and actions with updaters that natively support acsync api call. Updaters are higher order functions that take state as argument and return a new state, which replaces the current state. You can also return a promise that resoves to a new state. That is how it deals with async api calls

>

[![NPM](https://img.shields.io/npm/v/view-state-store.svg)](https://www.npmjs.com/package/view-state-store) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm i --save view-state-store
```

## Usage

# Basic example

```jsx
import React from "react";

import { createStore, StoreProvider, connectToStore } from "view-state-store";

// create selector
const selectText = state => state.text;

const selectors = {
  text: selectText
};

// create updater
const updateText = text => state => ({ ...state, text });

const updaters = { updateText };

// create store with initial state
const store = createStore({ text: "" });

export class Title extends React.Component {
  componentDidMount() {
    this.props.updateText("Hello World");
  }

  render() {
    const { text } = this.props;

    return <h1>{text}</h1>;
  }
}

export const ConntectedTitle = connectToStore(selectors, updaters)(Title);

export const App = () => (
  <StoreProvider store={store}>
    <ConntectedTitle />
  </StoreProvider>
);
```

# Deal with api calls example

```jsx
import React from "react";

import { createStore, StoreProvider, connectToStore } from "view-state-store";

// create selector
const selectTodos = state => state.todos;

const selectors = {
  todos: selectTodos
};

// create updater
const retrieveTodos = () => state =>
  new Promise(resolve => {
    // mimicing api call
    setTimeout(() => {
      resolve({
        ...state,
        todos: [
          { description: "Learn react", key: 0 },
          { description: "Learn redux", key: 1 }
        ]
      });
    }, 2000);
  });

const updaters = { retrieveTodos };

// create store with initial state
const store = createStore({ text: "" });

export class Todos extends React.Component {
  componentDidMount() {
    this.props.retrieveTodos();
  }

  render() {
    const { todos } = this.props;

    return (
      <ul>
        {todos && todos.map(todo => <li key={todo.key}>{todo.description}</li>)}
      </ul>
    );
  }
}

export const ConntectedTodos = connectToStore(selectors, updaters)(Todos);

export const App = () => (
  <StoreProvider store={store}>
    <ConntectedTodos />
  </StoreProvider>
);
```

# state separation example

```jsx
import React from "react";

import {
  createStore,
  StoreProvider,
  connectToStore,
  createPartialUpdater
} from "view-state-store";
// create selector
const selectTodos = state => state.data.todos;

const selectors = {
  todos: selectTodos
};

// create updater
// createPartialUpdater takes the path of the state as argument and returns a function. Pass updaters in this function to create updaters that only change part point by the path. Note path can be more than one level. Separate each level by "."
const updateTodos = createPartialUpdater("data.todos");
const retrieveTodos = updateTodos(() => () =>
  new Promise(resolve => {
    // mimicing api call
    setTimeout(() => {
      resolve([
        { description: "Learn react", key: 0 },
        { description: "Learn redux", key: 1 }
      ]);
    }, 2000);
  })
);

const updaters = { retrieveTodos };

// create store with initial state
const store = createStore({ data: { todos: [] } });
window.store = store;
export class Todos extends React.Component {
  componentDidMount() {
    this.props.retrieveTodos();
  }

  render() {
    const { todos } = this.props;

    return (
      <ul>
        {todos && todos.map(todo => <li key={todo.key}>{todo.description}</li>)}
      </ul>
    );
  }
}

export const ConntectedTodos = connectToStore(selectors, updaters)(Todos);

export const App = () => (
  <StoreProvider store={store}>
    <ConntectedTodos />
  </StoreProvider>
);
```

# compose existing updater

There are two functions that combine updaters in two different ways.

# mergeUpdaters

mergeUpdaters merges existing updaters into one that only triggers rerender once. It helps when you want to make multiple changes to the state at the same time

# mergeUpdaters example

```jsx
import { combineUpdaters } from "view-state-store";

// create updater
const setLearningReact = isLearningReact => state => ({
  ...state,
  isLearningReact
});
const setLearningRedux = isLearningRedux => state => ({
  ...state,
  isLearningRedux
});

const setLearningReactAndReduxAtOnce = (isLearningReact, isLearningRedux) =>
  combineUpdaters(
    setLearningReact(isLearningReact),
    setLearningRedux(isLearningRedux)
  );
```

# updateInSequence example

updateInSequence triggers updaters in the order of argument list. Async updaters will be awaited before next one.

```jsx
import { updateInSequence } from "view-state-store";

// create updater
const setLearningReact = isLearningReact => state => ({
  ...state,
  isLearningReact
});
const setLearningRedux = isLearningRedux => state => ({
  ...state,
  isLearningRedux
});

const setLearningReactThenRedux = (isLearningReact, isLearningRedux) =>
  updateInSequence(
    setLearningReact(isLearningReact),
    setLearningRedux(isLearningRedux)
  );
```

## License

MIT © [](https://github.com/)
