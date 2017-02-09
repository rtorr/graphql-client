// import { createStore } from 'redux';
// import { gclient } from './reducer';
import Gql from './gql';
// import { query, create } from './index';
// let store = createStore(gclient);
// store.subscribe(_ => {
//   console.log(store.getState().toJS());
// });
const graphql = new Gql({ url: 'http://localhost:4000/graphql' });

graphql.store.subscribe(_ => {
  console.log(graphql.store.getState().gclient.toJS());
});

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

const e = `
{
  test_one: locale(lang: "en-us") {
    msg_3d_psn
  }
  test_two: locale(lang: "en-us") {
    msg_about_ratings_psn
  }
}
`;

const f = `
{
  test_one: locale(lang: "en-us") {
    msg_3d_psn
  }
  test_two: locale(lang: "en-us") {
    msg_about_ratings_psn
  }
}
`;

graphql.query(q, { variables: {}, force: false });
graphql.query(q, { variables: {}, force: false });
graphql.query(b, { variables: {}, force: false });

graphql.query(c, { variables: { lang: 'en-us' }, force: false });
graphql.query(c, { variables: { lang: 'de-de' }, force: false });
graphql.query(c, { variables: { lang: 'en-us' }, force: false });
graphql.query(d);
graphql.query(e);
graphql.query(f);
setInterval(
  function() {
    graphql.run();
  },
  1000
);
