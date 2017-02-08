import { createStore } from 'redux';
import { gclient } from './reducer';

import { query, create } from './index';

const q = `
{
  categories {
    id
    name
    titles {
      id
      images {
        url
        type
      }
    }
  }
}
`;

const b = `
{
  locale(lang: "en-us") {
    msg_2ch_psn
  }
}
`;

const c = `
query Wat($lang: String) {
  locale(lang: $lang) {
    msg_3d_psn
  }
}
`;

const d = `
{
  locale(lang: "en-us") {
    wat
  }
}
`;

let store = createStore(gclient);
store.subscribe(_ => {
  console.log(store.getState().toJS());
});
// store.dispatch({ type: 'INCREMENT' });
// store.dispatch({ type: 'INCREMENT' });
// store.dispatch({ type: 'DECREMENT' });
const graphql = create('http://localhost:4000/graphql', store);

query(q, { variables: {}, force: false });

query(q, { variables: {}, force: false });

query(b, { variables: {}, force: false });
query(c, { variables: { lang: 'en-us' }, force: false });
query(c, { variables: { lang: 'en-us' }, force: false });
query(c, { variables: { lang: 'en-us' }, force: false });
query(d, { variables: { lang: 'en-us' }, force: false });

setInterval(
  function() {
    graphql.run();
  },
  1000
);
