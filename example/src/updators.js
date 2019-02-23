import { createPartialUpdator, updateInSequence } from 'react-state-store';

const updateTodos = createPartialUpdator('toDos');
const updateLoadingStatus = createPartialUpdator('loadingStatus');

export const retrieveToDos = updateTodos(() => () => new Promise(resolve => {
  setTimeout(
    () => resolve({
      1: { description: 'todo1', isFinished: false, key: 1 },
      2: { description: 'todo2', isFinished: false, key: 2 },
      3: { description: 'todo3', isFinished: true, key: 3 },
      4: { description: 'todo4', isFinished: false, key: 4 },
    }),
    2000,
  );
}));

export const removeToDo = updateTodos(key => toDosState => {
  const newToDosState = { ...toDosState };
  delete newToDosState[key];

  return newToDosState;
});

export const addToDo = updateTodos(newToDo => toDosState => ({
  ...toDosState,
  [newToDo.key]: newToDo,
}));

export const toggleToDo = updateTodos((key, isFinished) => toDosState => {
  const newToDosState = { ...toDosState };
  newToDosState[key] = { ...newToDosState[key], isFinished };

  return newToDosState;
});

export const updateIsLoadingToDos = updateLoadingStatus(
  isLoadingToDos => loadingStatusState => ({
    ...loadingStatusState,
    isLoadingToDos,
  }),
);

export const startRetrievingToDos = () => updateInSequence(
  updateIsLoadingToDos(true),
  retrieveToDos(),
  updateIsLoadingToDos(false),
);
