import { useContext, useState } from "react";
import { StoreContext } from "./StoreProvider";

export const useRemic = (selectors, updaters) => {
  const { store } = useContext(StoreContext);

  const selectorKeys = Object.keys(selectors || {});
  const getSelectedState = state =>
    selectorKeys.reduce(
      (result, selectorKey) => ({
        ...result,
        [selectorKey]: selectors[selectorKey](state)
      }),
      {}
    );

  const [selectedState, setSelectedState] = useState(
    getSelectedState(store.getState())
  );

  const connectedUpdaters = Object.keys(updaters || {}).reduce(
    (result, current) => {
      return {
        ...result,
        [current]: async (...reset) => {
          const newState = await store.update(updaters[current](...reset));
          setSelectedState(getSelectedState(newState));
          return newState;
        }
      };
    },
    {}
  );

  return [selectedState, connectedUpdaters];
};
