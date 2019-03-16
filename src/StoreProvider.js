import React from "react";
import { createStore } from "./store";
import { wait } from "./utils";
import { DEFAULT_RERENDER_INTERVAL } from "./constants";
export const StoreContext = React.createContext();

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
    this.isRendering = false;
    const createRenderCyclePromise = () =>
      wait(props.rerenderInterval)
        .then(() => {
          if (this.isRendering) {
            this.isRendering = false;
            return new Promise(resolve => {
              this.setState({ ts: Date.now() }, resolve);
            });
          }
        })
        .then(() => {
          this.renderCyclePromise = createRenderCyclePromise();
        });

    this.renderCyclePromise = createRenderCyclePromise();

    this.unSubscribeFromStore = this.props.store.subscribe(() => {
      this.isRendering = true;
    });
  }

  getCurrentRenderCyclePromise = () => this.renderCyclePromise;

  componentWillUnmount() {
    this.unSubscribeFromStore();
  }

  render() {
    return (
      <StoreContext.Provider
        value={{
          store: this.props.store,
          getCurrentRenderCyclePromise: this.getCurrentRenderCyclePromise,
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
      const { store, getCurrentRenderCyclePromise } = this.context;
      this.updaters =
        this.updaters ||
        Object.keys(updaters || {}).reduce((result, current) => {
          return {
            ...result,
            [current]: async (...reset) => {
              const newState = await store.update(updaters[current](...reset));
              await getCurrentRenderCyclePromise();
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
