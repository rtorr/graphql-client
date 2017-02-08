import Immutable from 'immutable';
const immutableInitialState = Immutable.Map();

export function gclient(state = immutableInitialState, action) {
  console.log(action);
  switch (action.type) {
    case '@@GQ_CLIENT/QUERY/SUCCESS':
    case '@@GQ_CLIENT/QUERY/ERROR':
      return state.mergeDeep(action.data);
    default:
      return state;
  }
}
