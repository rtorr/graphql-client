import gql from 'graphql-tag';
import { print } from 'graphql-tag/printer';
import { createStore, combineReducers } from 'redux';
import gclient from './reducer';

const NO_RUDUCER_KEY_ERROR = 'If you are using gql-lite with your own redux, please pass in the reducer key used with its store';
const NO_FETCH_ERROR = 'You do not have fetch implmented in your plaform, please use the create method and provide a fetch method';

export default class Gql {
  constructor(options) {
    this.url = options.url;
    this.store = options.store;
    this.reducerKey = options.reducerKey;
    this.fetch = typeof fetch === 'function' ? fetch : options.fetch;
    if (!this.fetch) {
      throw Error(NO_FETCH_ERROR);
    }
    this.queue = [];
    this.cache = {};
    if (options.store && !this.reducerKey) {
      throw Error(NO_RUDUCER_KEY_ERROR);
    }
    if (!this.store) {
      this.store = createStore(combineReducers({ gclient }));
      this.reducerKey = 'gclient';
    }
  }
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
  batchRequest(item) {
    if (!this.fetch) {
      throw Error(NO_FETCH_ERROR);
    }

    const variables = item.options && item.options.variables ? item.options.variables : {};
    const operations = item.ast.definitions.map(i => i.operation);
    return fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: item.print,
        operations: operations ? operations : [],
        variables
      })
    })
      .then(response => {
        return response.json();
      })
      .then(({ data, errors }) => {
        if (errors) {
          let error_messages = errors.map(e => e.message);
          item.reject(error_messages);
          if (this.store) {
            this.store.dispatch({
              type: '@@GQ_CLIENT/QUERY/ERROR',
              data: { errors: error_messages }
            });
          }
        } else {
          item.resolve(data);
          this.cache[item.id].data = data;
          if (this.store) {
            this.store.dispatch({ type: '@@GQ_CLIENT/QUERY/SUCCESS', data });
          }
        }
        this.queue.length = 0;
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
  query(q, options) {
    const _options = options ? options : {};
    if (this.store) {
      this.store.dispatch({ type: '@@GQ_CLIENT/QUERY/START' });
    }

    // This will later be replaced by parsing the AST for building
    // the store data objects. For now we are repoving a bunch of
    // characters and using that is a key in our cache map
    const b = q.replace(/[{()}:(\r\n|\n||\r)(?:(?:^|\n)|\s+(?:$|\n))]/g, '');
    const g = gql`${q}`;
    const v = { id: b, source: q, print: print(g), options: _options };

    const finalObj = Object.assign({}, v, { ast: g });
    return new Promise((resolve, reject) => {
      if (!this.cache[b] || _options.variables || _options.force) {
        this.cache[b] = v;
        return this.queue.push(Object.assign({}, finalObj, { resolve, reject }));
      }
      return resolve(this.cache[b]);
    }).catch(e => e.forEach(i => console.error(`GQ_CLIENT_ERROR: ${i}`)));
  }
  /**
 * run
 * run through the list of queries
 */
  run() {
    return this.queue.forEach(item => {
      return this.batchRequest(item);
    });
  }
}
