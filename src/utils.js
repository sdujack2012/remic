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

export const mergeUpdators = (...rest) => state =>
  rest.reduce(
    (newStatePromise, currentUpdator) => newStatePromise.then(currentUpdator),
    Promise.resolve(state)
  );

export const updateInSequence = (...rest) => rest;

export const createCustomPartialUpdator = (reader, writer) => (...updators) => {
  const createPartialUpdator = updator => (...rest) => async state => {
    const partialState = reader(state);
    const newPartialState = await updator(...rest)(partialState);
    return writer(state, newPartialState);
  };

  if (typeof updators[0] === "function") {
    const partialUpdators = updators.map(createPartialUpdator);
    return partialUpdators.length > 1 ? partialUpdators : partialUpdators[0];
  } else if (typeof updators[0] === "object" && updators[0] !== null) {
    return Object.keys(updators[0]).reduce(
      (partialUpdators, updatorKey) => ({
        ...partialUpdators,
        [updatorKey]: createPartialUpdator(updators[0][updatorKey])
      }),
      {}
    );
  }
};

export const createPartialUpdator = path =>
  createCustomPartialUpdator(
    state => get(state, path),
    (state, newPartialState) => set(state, path, newPartialState)
  );
