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
  rest.reduce((newStatePromise, currentUpdator) =>
      newStatePromise.then(currentUpdator),
      Promise.resolve(state)
    )
  );

export const updateInSequence = (...rest) => rest;

export const createCustomPartialUpdator = (reader, writer) => updator => (
  ...rest
) => async state => {
  const partialState = reader(state);
  const newPartialState = await updator(...rest)(partialState);
  return writer(state, newPartialState);
};

export const createPartialUpdator = path =>
  createCustomPartialUpdator(
    state => get(state, path),
    (state, newPartialState) => set(state, path, newPartialState)
  );
