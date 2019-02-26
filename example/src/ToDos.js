import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';

import { connectToStore } from 'view-state-store';

import { selectTodos, selectIsLoadingToDos } from './selectors';
import {
  startRetrievingToDos,
  toDoUpdators,
  updateIsLoadingToDos,
} from './updators';

export class ToDosComponent extends Component {
  state = { todoDescription: '' };

  componentDidMount() {
    this.props.startRetrievingToDos();
  }

  onChange = event => {
    this.setState({ todoDescription: event.target.value });
  };

  render() {
    const {
      toDos,
      addToDo,
      removeToDo,
      toggleToDo,
      isLoadingToDos,
    } = this.props;

    const { todoDescription } = this.state;

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
                      <label
                        htmlFor="defaultCheck1"
                        className="form-check-label"
                      >
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
                  onChange={this.onChange}
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
  }
}

ToDosComponent.propTypes = {
  toDos: PropTypes.array.isRequired,
  isLoadingToDos: PropTypes.bool.isRequired,
  addToDo: PropTypes.func.isRequired,
  removeToDo: PropTypes.func.isRequired,
  toggleToDo: PropTypes.func.isRequired,
  startRetrievingToDos: PropTypes.func.isRequired,
  updateIsLoadingToDos: PropTypes.func.isRequired,
};

export const ToDos = connectToStore(
  { toDos: selectTodos, isLoadingToDos: selectIsLoadingToDos },
  {
    ...toDoUpdators,
    updateIsLoadingToDos,
    startRetrievingToDos,
  },
)(ToDosComponent);
