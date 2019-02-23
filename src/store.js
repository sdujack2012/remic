function Store(initialState) {
  let subscribers = [];
  let state = initialState;

  let updateOnce = async updator => {
    const previousState = state;
    const newState = await updator(previousState);
    state = newState;
    subscribers.forEach(subscriber => subscriber(newState, previousState));
    return newState;
  };

  this.subscribe = callback => {
    subscribers = [...subscribers, callback];
    return () => subscribers.filter(subscriber => subscriber !== callback);
  };

  this.getState = () => state;

  this.select = selector => {
    return selector(state);
  };

  this.update = async updators => {
    if (Array.isArray(updators)) {
      for (let i = 0; i < updators.length; i++) {
        await updateOnce(updators[i]);
      }
    } else {
      await updateOnce(updators);
    }
    return this.getState();
  };
}

export const createStore = initialState => new Store(initialState);
