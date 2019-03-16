import React from 'react';

import { createStore, StoreProvider } from 'remic';

import { ToDosWithHooks } from './ToDosWithHooks';

const store = createStore({
  toDos: {},
  loadingStatus: { isLoadingToDos: true },
});
window.store = store;
export const App = () => (
  <StoreProvider store={store}>
    <ToDosWithHooks />
  </StoreProvider>
);
