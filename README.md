# gql-lite

I had some simpe needs to request a graphql serer, so i made a simple librayy.

## API (WIP)

```javascript
import { createStore } from 'redux';
import { query, create } from 'gql-lite';
import { gclient } from 'gql-lite/reducer';

let store = createStore(gclient);
const graphql = create('http://localhost:4000/graphql', store);

query(`
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