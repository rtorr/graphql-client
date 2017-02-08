import gql from 'graphql-tag';
import { print } from 'graphql-tag/printer';
const queue = [];
const cache = {};
const URL = 'http://localhost:4000/graphql';


function batchRequest(item) {
  return fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: item.print,
      operations: [],
      variables: item.options.variables
    })
  })
    .then(response => {
      return response.json();
    })
    .then(json => {
      const result = cache[item.id].data = json.data;
      item.resolve(result);
      queue.length = 0;
    });
}

export function query(q, options) {
  const b = q.replace(/[{()}:(\r\n|\n||\r)(?:(?:^|\n)|\s+(?:$|\n))]/g, '');
  const g = gql`${q}`;
  const v = {
    id: b,
    source: q,
    print: print(g),
    options
  };
  
  const finalObj = Object.assign({}, v, { ast: g });
  return new Promise((resolve, reject) => {
    if (!cache[b] || options.force) {
      cache[b] = v;
      return queue.push(Object.assign({}, finalObj, { resolve }));
    }
    return resolve(cache[b]);
  });
}

export function run() {
  return queue.forEach(item => {
    return batchRequest(item);
  });
}
