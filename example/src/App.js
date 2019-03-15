import React from 'react';

import { createStore, StoreProvider } from 'remic';

import { ToDos } from './ToDos';

const store = createStore({
  toDos: {},
  loadingStatus: { isLoadingToDos: true },
});
window.store = store;
export const App = () => (
  <StoreProvider store={store}>
    <ToDos />
  </StoreProvider>
);
