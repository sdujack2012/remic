import React from "react";
import { createStore } from "./store";
import { wait, throttle } from "./utils";
import { DEFAULT_RERENDER_INTERVAL } from "./constants";
const StoreContext = React.createContext();

export class StoreProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    store: PropTypes.instanceOf(createStore).isRequired,
    rerenderInterval: PropTypes.number
  };

  static defaultProps = {
    rerenderInterval: DEFAULT_RERENDER_INTERVAL
  };

  constructor(props) {
    super(props);
    this.state = { ts: Date.now() };

    const throttledSetState = throttle(() => {
      const awaiter = wait(props.rerenderInterval);
      this.renderPromise = Promise.all([
        new Promise(resolve => {
          this.setState({ ts: Date.now() }, resolve);
        }),
        awaiter
      ]);
      return this.renderPromise;
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

export const connectToStore = (selectors, updaters) => Component =>
  class ConnectedComponent extends React.Component {
    static contextType = StoreContext;

    getUpdatersAndProps = () => {
      const { store, getRenderPromise } = this.context;
      this.updaters =
        this.updaters ||
        Object.keys(updaters || {}).reduce((result, current) => {
          return {
            ...result,
            [current]: async (...reset) => {
              const newState = await store.update(updaters[current](...reset));
              await getRenderPromise(); //await rerender cycle to finish
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

      return { ...this.updaters, ...selectedProps };
    };

    render() {
      return <Component {...this.getUpdatersAndProps()} {...this.props} />;
    }
  };
