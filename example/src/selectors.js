export const selectTodos = state => Object.values(state.toDos);

export const selectIsLoadingToDos = state => state.loadingStatus.isLoadingToDos;
