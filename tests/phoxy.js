/*!
 * tests/phoxy.js
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var webdriver = require('selenium-webdriver');
var remote = require('selenium-webdriver/remote');
var env = require('./lib/env');
var path = require('path');
var fs = require('fs');
var assert = require('proclaim');
var Promise = require("bluebird");

// webdriver shortcuts
var By = webdriver.By;
var until = webdriver.until;


/* -----------------------------------------------------------------------------
 * reusable helpers
 * ---------------------------------------------------------------------------*/

var uploadImage = function (fileName) {
  env.driver.get('http://0.0.0.0:9999/tests/index.html?' + Date.now());

  // configure proxy using env vars
  env.driver.executeScript(function (url, credentials) {
    phoxy.configure(url, credentials)
  }, process.env.PHOXY_URL, {
    id: process.env.PHOXY_ID,
    secret: process.env.PHOXY_SECRET,
  });

  var imagePath = path.resolve(__dirname, 'fixtures', fileName);
  var screenshotPath = path.resolve(__dirname, 'results', fileName);

  // select file
  env.driver.setFileDetector(new remote.FileDetector);
  env.driver.findElement(By.tagName('input')).sendKeys(imagePath);

  // wait until response from server is added to window
  return env.driver.wait(function () {
    return env.driver.executeScript('return window.imagesLoaded ? window.phoxyResponse : false;')
  }, 10 * 1000).then(function (res) {
    assert.isString(res['original_url']);
  }).then(function () {
    return env.driver.takeScreenshot().then(function (image, err) {
      fs.writeFileSync(screenshotPath, image, 'base64');
    });
  });
};


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('phoxy.js', function () {

  this.timeout(120 * 1000);

  before(function () {
    return env.create('chrome', 'local');
  });

  after(function () {
    return env.destroy();
  });

  it('Should upload the image and return the responsJSON.', function () {
    return Promise.each([
      'Landscape_1.jpg',
      'Landscape_2.jpg',
      'Landscape_3.jpg',
      'Landscape_4.jpg',
      'Landscape_5.jpg',
      'Landscape_6.jpg',
      'Landscape_7.jpg',
      'Landscape_8.jpg',
      'Portrait_1.jpg',
      'Portrait_2.jpg',
      'Portrait_3.jpg',
      'Portrait_4.jpg',
      'Portrait_5.jpg',
      'Portrait_6.jpg',
      'Portrait_7.jpg',
      'Portrait_8.jpg'
    ], uploadImage);
  });

});