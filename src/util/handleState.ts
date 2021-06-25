export function addState<T>(
  state: T[] | T,
  newStateValue: T,
  setStateFunction: any
) {
  let newState;
  if (Array.isArray(state)) {
    newState = [...state];
    newState.push(newStateValue);
  } else {
    newState = newStateValue;
  }
  setStateFunction(newState);

  return newState;
}

export function updateState<T>(
  state: T[] | T,
  newStateValue: T,
  setStateFunction: any,
  id?: string | number
) {
  let newState;

  if (Array.isArray(state)) {
    newState = [...state];
    const index = newState.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      newState[index] = newStateValue;
    }
  } else {
    newState = newStateValue;
  }

  setStateFunction(newState);

  return newState;
}

export function removeStateFromArray<T>(
  state: T[],
  setStateFunction: any,
  idToRemove: string | number
) {
  let newState = [...state];
  const index = newState.findIndex((item: any) => item.id === idToRemove);
  if (index !== -1) {
    newState.splice(index, 1);
    setStateFunction(newState);
  }

  return newState;
}
