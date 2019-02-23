# react-state-store

React-state-store is a simple and light weight react state management library without too much boilerplate. Redux is great and it enforces unified data flow. But as projects get big you will find your project flooded with actions, reducers and a lot constants. Also since redux doesn't natively support async actions, you have to install third party librarys as middleware. It adds a lot to development and maintanence efforts. React-state-store is designed to tackle these issues. It has some similar concepts, such as store and selectors. It also supports state separation. However, the most significant difference between them is that react-state-store replaces reducers and actions with updators that natively support acsync api call. Updators are higher order functions that take state as argument and return a new state, which replaces the current state. You can also return a promise that resoves to a new state. That is how it deals with async api calls

>

[![NPM](https://img.shields.io/npm/v/react-state-store.svg)](https://www.npmjs.com/package/react-state-store) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm i --save @sdujack2012/react-state-store
```

## Usage

# Basic example

```jsx
import React from "react";

import { createStore, StoreProvider, connectToStore } from "react-state-store";

// create selector
const selectText = state => state.text;

const selectors = {
  text: selectText
};

// create updator
const updateText = text => state => ({ ...state, text });

const updators = { updateText };

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

export const ConntectedTitle = connectToStore(selectors, updators)(Title);

export const App = () => (
  <StoreProvider store={store}>
    <ConntectedTitle />
  </StoreProvider>
);
```

# Deal with api calls example

```jsx
import React from "react";

import { createStore, StoreProvider, connectToStore } from "react-state-store";

// create selector
const selectTodos = state => state.todos;

const selectors = {
  todos: selectTodos
};

// create updator
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

const updators = { retrieveTodos };

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

export const ConntectedTodos = connectToStore(selectors, updators)(Todos);

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
  createPartialUpdator
} from "react-state-store";
// create selector
const selectTodos = state => state.data.todos;

const selectors = {
  todos: selectTodos
};

// create updator
// createPartialUpdator takes the path of the state as argument and returns a function. Pass updators in this function to create updators that only change part point by the path. Note path can be more than one level. Separate each level by "."
const updateTodos = createPartialUpdator("data.todos");
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

const updators = { retrieveTodos };

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

export const ConntectedTodos = connectToStore(selectors, updators)(Todos);

export const App = () => (
  <StoreProvider store={store}>
    <ConntectedTodos />
  </StoreProvider>
);
```

# compose existing updator

There are two functions that combine updators in two different ways.

# mergeUpdators

mergeUpdators merges existing updators into one that only triggers rerender once. It helps when you want to make multiple changes to the state at the same time

# mergeUpdators example

```jsx
import { combineUpdators } from "react-state-store";

// create updator
const setLearningReact = isLearningReact => state => ({
  ...state,
  isLearningReact
});
const setLearningRedux = isLearningRedux => state => ({
  ...state,
  isLearningRedux
});

const setLearningReactAndReduxAtOnce = (isLearningReact, isLearningRedux) =>
  combineUpdators(
    setLearningReact(isLearningReact),
    setLearningRedux(isLearningRedux)
  );
```

# UpdateInSequence example

UpdateInSequence triggers updators in the order of argument list. Async updators will be awaited before next one.

```jsx
import { UpdateInSequence } from "react-state-store";

// create updator
const setLearningReact = isLearningReact => state => ({
  ...state,
  isLearningReact
});
const setLearningRedux = isLearningRedux => state => ({
  ...state,
  isLearningRedux
});

const setLearningReactThenRedux = (isLearningReact, isLearningRedux) =>
  UpdateInSequence(
    setLearningReact(isLearningReact),
    setLearningRedux(isLearningRedux)
  );
```

## License

MIT © [](https://github.com/)
