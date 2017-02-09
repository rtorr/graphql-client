# gql-lite

I had some simpe needs to request a graphql serer, so i made a simple libray.

## API (WIP)

```javascript
import { Gql, reducer } from 'gql-lite/reducer';

const graphql = new Gql({ url: 'http://localhost:4000/graphql' });

graphql.store.subscribe(_ => {
  console.log(graphql.store.getState().gclient.toJS());
});


graphql.query(`
{
  test_one: locale(lang: "en-us") {
    foo
  }
  test_two: locale(lang: "en-us") {
    bar
  }
}
`);

setInterval(
  function() {
    graphql.run();
  },
  1000
);
```