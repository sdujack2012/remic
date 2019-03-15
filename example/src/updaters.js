import { createPartialUpdater, updateInSequence } from 'remic';

const updateTodos = createPartialUpdater('toDos');
const updateLoadingStatus = createPartialUpdater('loadingStatus');

export const retrieveToDos = () => () => new Promise(resolve => {
  setTimeout(
    () => resolve({
      1: { description: 'todo1', isFinished: false, key: 1 },
      2: { description: 'todo2', isFinished: false, key: 2 },
      3: { description: 'todo3', isFinished: true, key: 3 },
      4: { description: 'todo4', isFinished: false, key: 4 },
    }),
    2000,
  );
});

export const removeToDo = key => toDosState => {
  const newToDosState = { ...toDosState };
  delete newToDosState[key];

  return newToDosState;
};

export const addToDo = newToDo => toDosState => ({
  ...toDosState,
  [newToDo.key]: newToDo,
});

export const toggleToDo = (key, isFinished) => toDosState => {
  const newToDosState = { ...toDosState };
  newToDosState[key] = { ...newToDosState[key], isFinished };

  return newToDosState;
};

export const updateIsLoadingToDos = updateLoadingStatus(
  isLoadingToDos => loadingStatusState => ({
    ...loadingStatusState,
    isLoadingToDos,
  }),
);

export const toDoUpdaters = updateTodos({
  removeToDo,
  addToDo,
  toggleToDo,
  retrieveToDos,
});

export const startRetrievingToDos = () => updateInSequence(
  updateIsLoadingToDos(true),
  toDoUpdaters.retrieveToDos(),
  updateIsLoadingToDos(false),
);
