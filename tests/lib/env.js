/*!
 * tests/lib/env.js
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var sauceConnectLauncher = require('sauce-connect-launcher');
var webdriver = require('selenium-webdriver');
var Q = require('q');


/* -----------------------------------------------------------------------------
 * env
 * ---------------------------------------------------------------------------*/

module.exports = {

  /* ---------------------------------------------------------------------------
   * formatted device capabilities
   * -------------------------------------------------------------------------*/

  capabilities: {
    chrome: {
      'browserName': 'chrome'
    }
  },


  /* ---------------------------------------------------------------------------
   * public api
   * -------------------------------------------------------------------------*/

  create: function (envName, serverType) {
    var tasks = [this.getDriver(this.capabilities[envName], serverType)];
    if (serverType === 'sauce') {
      tasks.push(this.connectToTunnel());
    }

    return Q.all(tasks).then(function (results) {
      this.driver = results[0];
      this.tunnel = results[1];
    }.bind(this));
  },

  destroy: function () {
    var tasks = [this.driver.quit()];
    if (this.tunnel) {
      tasks.push(this.tunnel.close());
    }

    return Q.all(tasks);
  },


  /* ---------------------------------------------------------------------------
   * helpers
   * -------------------------------------------------------------------------*/

  connectToTunnel: function () {
    return Q.nfcall(sauceConnectLauncher);
  },

  getDriver: function (capabilities, serverType) {
    var builder = new webdriver.Builder();

    if (serverType === 'sauce') {
      builder.usingServer('http://' + process.env.SAUCE_USERNAME + ':' +
      process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
    }

    return builder.withCapabilities(capabilities)
      .buildAsync();
  }

};