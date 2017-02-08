import gql from 'graphql-tag';
import { print } from 'graphql-tag/printer';
const queue = [];
const cache = {};
const NO_FETCH_ERROR = 'You do not have fetch implmented in your plaform, please use the create method and provide a fetch method';
let store = undefined;
let f = typeof fetch === 'function' ? fetch : undefined;
let url = undefined;
/**
 * batchRequest
 * The name is kind of missleading at the moment.
 * Right now this will go though the list of queries we have
 * qued up and run then and then empty the queue.
 * 
 * Future:
 * We will combine queries into one request, by namespacing
 * using http://graphql.org/learn/queries/#aliases
 *
 * @param {object} item 
 */
function batchRequest(item) {
  if (!f) {
    throw Error(NO_FETCH_ERROR);
  }
  const operations = item.ast.definitions.map(i => i.operation);
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: item.print,
      operations: operations ? operations : [],
      variables: item.options.variables
    })
  })
    .then(response => {
      return response.json();
    })
    .then(({ data, errors }) => {
      if (errors) {
        let error_messages = errors.map(e => e.message);
        item.reject(error_messages);
        if (store) {
          store.dispatch({ type: '@@GQ_CLIENT/QUERY/ERROR', data: { errors: error_messages } });
        }
      } else {
        item.resolve(data);
        cache[item.id].data = data;
        if (store) {
          store.dispatch({ type: '@@GQ_CLIENT/QUERY/SUCCESS', data });
        }
      }
      queue.length = 0;
    });
}

/**
 * query
 * this method will add a query to the queue
 * if the query has already been executed before, resolve and return
 * that data;
 * @param {string} q - Query string
 * @param {object} options - Configuration options 
 * @param {object} options.variables - Variables to send with your graphql query
 * @param {object} options.force - Force update a cached query
 */
export function query(q, options) {
  if (store) {
    store.dispatch({ type: '@@GQ_CLIENT/QUERY/START' });
  }
  // This will later be replaced by parsing the AST for building
  // the store data objects. For now we are repoving a bunch of
  // characters and using that is a key in our cache map
  const b = q.replace(/[{()}:(\r\n|\n||\r)(?:(?:^|\n)|\s+(?:$|\n))]/g, '');
  const g = gql`${q}`;
  const v = { id: b, source: q, print: print(g), options };

  const finalObj = Object.assign({}, v, { ast: g });
  return new Promise((resolve, reject) => {
    if (!cache[b] || options.force) {
      cache[b] = v;
      return queue.push(Object.assign({}, finalObj, { resolve, reject }));
    }
    return resolve(cache[b]);
  }).catch(e => e.forEach(i => console.error(`GQ_CLIENT_ERROR: ${i}`)));
}

/**
 * run
 * run through the list of queries
 */
function run() {
  return queue.forEach(item => {
    return batchRequest(item);
  });
}

/**
 * create
 * @param {string} _url - graphql url
 * @param {object} _store - redux store
 * @param {fucntion} _fetch - fetch function
 */
export function create(_url, _store, _fetch) {
  url = _url;
  store = _store;
  f = _fetch ? _fetch : fetch;
  if (!f) {
    throw Error(NO_FETCH_ERROR);
  }
  return { run, query };
}
