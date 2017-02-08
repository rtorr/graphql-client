// import { createStore } from 'redux';
// import { gclient } from './reducer';

import { query, run } from './index';

const q = `
{ 
  test: todos {
    id
  }
  test_one: todos {
    id
  }
}

`;

const b = `
{ 
  todos {
    id
    title
  }
}

`;

// let store = createStore(gclient);

// store.subscribe(_ => _)

// store.dispatch({ type: 'INCREMENT' });

// store.dispatch({ type: 'INCREMENT' });

// store.dispatch({ type: 'DECREMENT' });

query(q, {
  variables: {},
  force: false
});

query(q, {
  variables: {},
  force: false
});

query(b, {
  variables: {},
  force: false
});

setInterval(function() {
  run()
}, 1000);
