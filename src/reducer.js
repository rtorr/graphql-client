import Immutable from 'immutable';
const immutableInitialState = Immutable.Map();

export function gclient(state = immutableInitialState, action) {
  switch (action.type) {
    case '@@GQ_CLIENT/QUERY/SUCCESS':
    case '@@GQ_CLIENT/QUERY/ERROR':
      return state.merge(action.data);
    default:
      return state;
  }
}
