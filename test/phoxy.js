/*!
 * test/phoxy.js
 */


define(function (require) {


/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var assert = require('proclaim');
var phoxy = require('phoxy');


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('phoxy.js', function () {

  it('Should expose methods.', function () {
    assert.isFunction(phoxy.configure);
    assert.isFunction(phoxy.create);
    assert.isFunction(phoxy.upload);
  });

});


});