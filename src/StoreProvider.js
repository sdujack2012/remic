import React from "react";
import { createStore } from "./store";
const StoreContext = React.createContext();

export class StoreProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    store: PropTypes.instanceOf(createStore).isRequired
  };
  constructor(props) {
    super(props);
    this.state = { ts: Date.now() };
    this.unSubscribeFromStore = this.props.store.subscribe(() =>
      this.setState({ ts: Date.now() })
    );
  }

  componentWillUnmount() {
    this.unSubscribeFromStore();
  }

  render() {
    return (
      <StoreContext.Provider
        value={{ store: this.props.store, ts: this.state.ts }}
      >
        {React.Children.only(this.props.children)}
      </StoreContext.Provider>
    );
  }
}

export const connectToStore = (
  connectPropsToStore,
  connectUpdatorsToStore
) => Component =>
  class ConnectedComponent extends React.Component {
    static contextType = StoreContext;

    getPropsAndUpdators = () => {
      const { store, ts } = this.context;
      console.log(ts);
      const calculatedProps = Object.keys(connectPropsToStore || {}).reduce(
        (result, current) => {
          return {
            ...result,
            [current]: connectPropsToStore[current](store.getState())
          };
        },
        {}
      );

      const updators = Object.keys(connectUpdatorsToStore || {}).reduce(
        (result, current) => {
          return {
            ...result,
            [current]: (...reset) =>
              store.update(connectUpdatorsToStore[current](...reset))
          };
        },
        {}
      );

      return { ...calculatedProps, ...updators };
    };

    render() {
      return <Component {...this.getPropsAndUpdators()} {...this.props} />;
    }
  };
