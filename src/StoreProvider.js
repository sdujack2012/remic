import React from "react";
import { createStore } from "./store";
import { wait, throttle } from "./utils";
const StoreContext = React.createContext();

export class StoreProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    store: PropTypes.instanceOf(createStore).isRequired,
    rerenderInterval: PropTypes.number
  };

  static defaultProps = {
    rerenderInterval: 16
  };

  constructor(props) {
    super(props);
    this.state = { ts: Date.now() };

    const throttledSetState = throttle(() => {
      this.renderPromise = new Promise(resolve => {
        this.setState({ ts: Date.now() }, resolve);
      }).then(() => wait(props.rerenderInterval));
    }, props.rerenderInterval);

    this.unSubscribeFromStore = this.props.store.subscribe(() =>
      throttledSetState()
    );
  }

  getRenderPromise = () => this.renderPromise;

  componentWillUnmount() {
    this.unSubscribeFromStore();
  }

  render() {
    return (
      <StoreContext.Provider
        value={{
          store: this.props.store,
          rerenderInterval: this.props.rerenderInterval,
          getRenderPromise: this.getRenderPromise,
          ts: this.state.ts
        }}
      >
        {React.Children.only(this.props.children)}
      </StoreContext.Provider>
    );
  }
}

export const connectToStore = (selectors, updators) => Component =>
  class ConnectedComponent extends React.Component {
    static contextType = StoreContext;

    getUpdatorsAndProps = () => {
      const { store, getRenderPromise } = this.context;
      this.updators =
        this.updators ||
        Object.keys(updators || {}).reduce((result, current) => {
          return {
            ...result,
            [current]: async (...reset) => {
              const newState = await store.update(updators[current](...reset));
              await getRenderPromise();
              return newState;
            }
          };
        }, {});

      const selectedProps = Object.keys(selectors || {}).reduce(
        (result, current) => {
          return {
            ...result,
            [current]: selectors[current](store.getState())
          };
        },
        {}
      );

      return { ...this.updators, ...selectedProps };
    };

    render() {
      return <Component {...this.getUpdatorsAndProps()} {...this.props} />;
    }
  };
