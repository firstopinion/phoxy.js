/*!
 * phoxy.js
 */




/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var Image = require('./image');
var Service = require('./service');


/* -----------------------------------------------------------------------------
 * phoxy
 * ---------------------------------------------------------------------------*/

/**
 * @global
 * @public
 * @namespace phoxy
 *
 * @desc Client library to preview and upload images to phoxy server.
 */
module.exports = {

  /**
   * @public
   * @memberof phoxy
   *
   * @example
   * phoxy.configure('PHOXY_URL', {
   *   id: 'PHOXY_ID',
   *   secret: 'PHOXY_SECRET'
   * })
   *
   * @desc Configure the phoxy client.
   *
   * @param {string} url - The root url of the phoxy service.
   * @param {object} credentials - Phoxy service credentials.
   * @param {string} credentials.id - Phoxy authentication id.
   * @param {string} credentials.secret - Phoxy authentication secret.
   */
  configure: function (url, credentials) {
    this.service = new Service(url, credentials);

    return this;
  },

  /**
   * @public
   * @memberof phoxy
   *
   * @example
   * phoxy.create(file, {
   *   maxWidth: 500
   * }, function (err, img) {
   *   // upload? render?
   * });
   *
   * @desc Create a phoxy image instance. A phoxy image instance takes an image
   *   file, optionally resizes it, and exposes an interface for both previewing
   *   and uploading the image.
   *
   * @param {file} file - File (https://developer.mozilla.org/en-US/docs/Web/API/File)
   * @param {object} options - Image options
   * @param {number} options.maxWidth - Maximum width of generated image (will
   *   be resized proportionally).
   * @param {number} options.maxHeight - Maximum height of generated imaged
   *   be resized proportionally).
   * @param {function} callback - Callback once image has been either created
   *   or has thrown an error.
   */
  create: function (file, options, callback) {
    var image = new Image(file, options);
    image.oncreated = callback.bind(this, null);
    image.onerror = callback.bind(this);

    return this;
  },

  /**
   * @public
   * @memberof phoxy
   *
   * @example
   * phoxy.uplad(image, function (jqXHR, textStatus) {
   *   // response handling
   * });
   *
   * @desc Upload an image to a phoxy compatible server.
   *
   * @param {object} image - Phoxy image instance to upload.
   * @param {function} callback - Function to execute once image upload has
   *   completed.
   */
  upload: function (image, callback) {
    this.service.upload(image, callback);

    return this;
  }

};


