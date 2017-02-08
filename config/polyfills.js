if (typeof Promise === 'undefined') {
  require('es6-promise').polyfill();
  require('isomorphic-fetch');
}
