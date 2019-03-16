# remic

remic is a simple and light weight react state management library without too much boilerplate. Redux is great and it enforces unified data flow. But as projects get big you will find your project flooded with actions, reducers and constants. Also since redux doesn't natively support async actions, you have to install third party middleware. It adds a lot to development and maintanence efforts. remic is designed to tackle these issues. It has some similar concepts, such as store and selectors. It also supports react hooks. However, the most significant difference between them is that remic replaces reducers and actions with updaters that natively support acsync api call. Updaters are higher order functions that take state as argument and return a new state, which replaces the current state. You can also return a promise that resoves to a new state. That is how it deals with async api calls.

>

[![NPM](https://img.shields.io/npm/v/remic.svg)](https://www.npmjs.com/package/remic) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm i --save remic
```

## Usage

# Basic example

```jsx
import React from "react";

import { createStore, StoreProvider, connectToStore } from "remic";

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

Remic natively supports async api calls. Once connected with store, updaters will return a promise that only resolves
when the async api call or the current render cycle is finished, whichever finishes later. The default render interval is
16ms. Rerender doesn't happen right after updater are excuted instead it is deferred until the end of each render cycle.

```jsx
import React from "react";

import { createStore, StoreProvider, connectToStore } from "remic";

// create selector
const selectTodos = state => state.todos;
const selectIsLoading = state => state.isLoading;

const selectors = {
  isLoading: selectIsLoading,
  todos: selectTodos
};

// create updater
const setIsLoading = isLoading => state => ({ ...state, isLoading });

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

const updaters = { retrieveTodos, setIsLoading };

// create store with initial state
const store = createStore({ todos: [] });

export class Todos extends React.Component {
  async componentDidMount() {
    const { retrieveTodos, setIsLoading } = this.props;
    setIsLoading(true);
    await retrieveTodos();
    setIsLoading(false);
  }

  render() {
    const { todos, isLoading } = this.props;

    return isLoading ? (
      <span>Loading</span>
    ) : (
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

# Used with react hook

```jsx
import React, { useEffect } from "react";

import { createStore, StoreProvider, useRemic } from "remic";

// create selector
const selectTodos = state => state.todos;
const selectIsLoading = state => state.isLoading;

const selectors = {
  isLoading: selectIsLoading,
  todos: selectTodos
};

// create updater
const setIsLoading = isLoading => state => ({ ...state, isLoading });
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

const updaters = { retrieveTodos, setIsLoading };

// create store with initial state
const store = createStore({ todos: [] });

export const Todos = () => {
  const [{ todos, isLoading }, { retrieveTodos, setIsLoading }] = useRemic(
    selectors,
    updaters
  );

  useEffect(async () => {
    setIsLoading(true);
    await retrieveTodos();
    setIsLoading(false);
  }, []); //so that it only gets called on first render

  return (
    <div>
      {" "}
      {isLoading ? (
        <span>Loading</span>
      ) : (
        <ul>
          {todos &&
            todos.map(todo => <li key={todo.key}>{todo.description}</li>)}
        </ul>
      )}
    </div>
  );
};

export const App = () => (
  <StoreProvider store={store}>
    <Todos />
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
} from "remic";
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
import { combineUpdaters } from "remic";

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
import { updateInSequence } from "remic";

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
