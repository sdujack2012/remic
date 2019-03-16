import React, { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';

import { useRemic } from 'remic';

import { selectTodos, selectIsLoadingToDos } from './selectors';
import { startRetrievingToDos, toDoUpdaters } from './updaters';

const selectors = { toDos: selectTodos, isLoadingToDos: selectIsLoadingToDos };
const updaters = {
  ...toDoUpdaters,
  startRetrievingToDos,
};

export const ToDosWithHooks = () => {
  const [
    { toDos, isLoadingToDos },
    {
      addToDo, removeToDo, toggleToDo, startRetrievingToDos,
    },
  ] = useRemic(selectors, updaters);
  const [todoDescription, setTodoDescription] = useState('');

  useEffect(() => {
    startRetrievingToDos();
  }, []);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-6">
          <h1>Number of todos: {toDos.length}</h1>
          {isLoadingToDos ? (
            <Loader type="Circles" color="#00BFFF" height="100" width="100" />
          ) : (
            <ul className="list-group">
              {toDos.map(toDo => (
                <li
                  className={`list-group-item ${
                    toDo.isFinished ? 'list-group-item-success' : ''
                  }`}
                  key={toDo.key}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={toDo.isFinished}
                      onChange={() => toggleToDo(toDo.key, !toDo.isFinished)}
                    />
                    <label htmlFor="defaultCheck1" className="form-check-label">
                      <h3>{toDo.description}</h3>
                    </label>
                    <div className="float-right">
                      <button
                        className="btn btn-secondary"
                        onClick={() => removeToDo(toDo.key)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form className="form-inline">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                value={todoDescription}
                onChange={event => setTodoDescription(event.target.value)}
                placeholder="Enter todo"
              />
            </div>
            <button
              className="btn btn-info"
              type="button"
              onClick={() => addToDo({
                description: todoDescription,
                isFinished: false,
                key: new Date().getTime(),
              })
              }
            >
              Add todo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
