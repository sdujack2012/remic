function set(object, path, value) {
  let a = path.split(".");
  let newObject = { ...object };

  let temp = newObject;
  for (let i = 0; i < a.length - 1; i++) {
    let n = a[i];
    if (n in temp) {
      temp[n] = { ...temp[n] };
    } else {
      temp[n] = {};
    }
    temp = temp[n];
  }

  temp[a[a.length - 1]] = value;

  return newObject;
}

function get(obj, path) {
  let paths = path.split(".");
  let current = obj;

  for (let i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}

export const mergeUpdaters = (...rest) => state =>
  rest.reduce(
    (newStatePromise, currentUpdater) => newStatePromise.then(currentUpdater),
    Promise.resolve(state)
  );

export const updateInSequence = (...rest) => rest;

export const createCustomPartialUpdater = (reader, writer) => (...updaters) => {
  const createPartialUpdater = updater => (...rest) => async state => {
    const partialState = reader(state);
    const newPartialState = await updater(...rest)(partialState);
    return writer(state, newPartialState);
  };

  if (typeof updaters[0] === "function") {
    const partialUpdaters = updaters.map(createPartialUpdater);
    return partialUpdaters.length > 1 ? partialUpdaters : partialUpdaters[0];
  } else if (typeof updaters[0] === "object" && updaters[0] !== null) {
    return Object.keys(updaters[0]).reduce(
      (partialUpdaters, updaterKey) => ({
        ...partialUpdaters,
        [updaterKey]: createPartialUpdater(updaters[0][updaterKey])
      }),
      {}
    );
  }
};

export const createPartialUpdater = path =>
  createCustomPartialUpdater(
    state => get(state, path),
    (state, newPartialState) => set(state, path, newPartialState)
  );

export const wait = time => new Promise(resolve => setTimeout(resolve, time));
