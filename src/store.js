function Store(initialState) {
  let subscribers = [];
  let state = initialState;

  let updateOnce = async updater => {
    const previousState = state;
    const newState = await updater(previousState);
    state = newState;
    await Promise.all(
      subscribers.map(subscriber => subscriber(newState, previousState))
    );
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

  this.update = async updaters => {
    if (Array.isArray(updaters)) {
      for (let i = 0; i < updaters.length; i++) {
        await updateOnce(updaters[i]);
      }
    } else {
      await updateOnce(updaters);
    }
    return this.getState();
  };
}

export const createStore = initialState => new Store(initialState);
