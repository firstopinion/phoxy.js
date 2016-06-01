/*!
 * service.js
 */




/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var $ = require('jQuery');
var extend = require('utl/extend');


/* -----------------------------------------------------------------------------
 * Service
 * ---------------------------------------------------------------------------*/

/**
 * @global
 * @public
 * @constructor
 *
 * @name Service
 * @desc Class sued to communicate to phoxy service.
 *
 * @example
 * var service = new Service('PHOXY_URL`, {
 *   id: 'PHOXY_ID',
 *   secret: 'PHOXY_SECRET'
 * });
 *
 * @param {string} url - The root url of the phoxy service.
 * @param {object} credentials - Phoxy service credentials.
 * @param {string} credentials.id - Phoxy authentication id.
 * @param {string} credentials.secret - Phoxy authentication secret.
 */
var Service = function (url, credentials) {
  var encoded = window.btoa(credentials.id + ':' + credentials.secret);

  this.defaultOptions = {
    url: url,
    type: 'POST',
    headers: { 'Authorization': 'Basic ' + encoded },
    processData: false,
    contentType: false,
  };
};

/**
 * @public
 * @memberof Service
 *
 * @desc Upload an image to a phoxy compatible server.
 *
 * @param {object} image - Phoxy image instance to upload.
 * @param {function} callback - Function to execute once image upload has
 *   completed.
 */
Service.prototype.upload = function (image, callback) {
  var formData = new FormData();
  formData.append('image', image.blob);
  formData.append('ext', image.ext);

  $.ajax(extend({}, this.defaultOptions, {
    data: formData,
    complete: callback
  }));
};


/* -----------------------------------------------------------------------------
 * expose
 * ---------------------------------------------------------------------------*/

module.exports = Service;


