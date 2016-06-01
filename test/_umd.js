/*!
 * test/_umd.js
 */


define(function (require) {


/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var assert = require('proclaim');
var phoxy = require('phoxy/phoxy');


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('umd - phoxy.js', function () {

  it('Should expose methods.', function () {
    assert.isFunction(phoxy.configure);
    assert.isFunction(phoxy.create);
    assert.isFunction(phoxy.upload);
  });

});


});