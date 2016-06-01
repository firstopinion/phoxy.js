/*!
 * image.js
 */

define(function (require) {


/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

var extend = require('utl/extend');
var waterfall = require('aflow/waterfall');
var loadImage = require('load-image/load-image');
var parseImageMeta = require('load-image/load-image-meta');
var exifImageMeta = require('load-image/load-image-exif');
var exifImageOrientation = require('load-image/load-image-orientation');
var canvasToBlob = require('canvas-to-blob/canvas-to-blob');


/* -----------------------------------------------------------------------------
 * Image
 * ---------------------------------------------------------------------------*/

/**
 * @global
 * @public
 * @constructor
 *
 * @name Image
 * @desc Generate images from file blobs.
 *
 * @example
 * var image = new Image(file, { maxWidth: 1200, maxHeight: 1200 });
 *
 * @param {file} file - File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {object} options - Image options
 * @param {number} options.maxWidth - Maximum width of generated image (will be
 *   resized proportionally).
 * @param {number} options.maxHeight - Maximum height of generated imaged (will
 *   be resized proportionally).
 */
var Image = function (file, options) {
  this.onerror = options.onerror || function () {};
  this.oncreated = options.oncreated || function () {};

  waterfall([
    this.parseMetaData.bind(this, file),
    this.loadImage.bind(this, file, options),
    this.setContents.bind(this, file)
  ], function (err) {
    return err
      ? this.onerror(err)
      : this.oncreated(this);
  }.bind(this));
};

/**
 * @private
 * @memberof Image
 *
 * @desc Small wrapper around parseMetaData to make it compatable with node
 *   style callbacks.
 *
 * @param {file} file - File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {function} callback - Function to execute once image data has been
 *   parsed.
 */
Image.prototype.parseMetaData = function (file, callback) {
  loadImage.parseMetaData(file, function (data) {
    callback(null, data);
  });
};

/**
 * @private
 * @memberof Image
 *
 * @desc Small wrapper around loadImage to handle orientation... and make it
 *   compatable with node style callbacks.
 *
 * @param {file} file - File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {object} options - Image options
 * @param {number} options.maxWidth - Maximum width of generated image (will be
 *   resized proportionally).
 * @param {number} options.maxHeight - Maximum height of generated imaged (will
 *   be resized proportionally).
 * @param {object} data - Parsed image data.
 * @param {function} callback - Function to execute once image has been loaded.
 */
Image.prototype.loadImage = function (file, options, data, callback) {
  loadImage(file, function (canvas) {
    callback(null, canvas);
  }, extend({
    orientation: data.exif ? data.exif.get('Orientation') : null,
    canvas: true
  }, options));
};

/**
 * @private
 * @memberof Image
 *
 * @desc Set instance properties of image (to be utilized after parsing/loading
 *   image contents).
 *
 * @param {file} file - File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {object} canvas - Resized canvas representation of image.
 * @param {function} callback - Function to execute once contents have been set
 *   on the instance.
 */
Image.prototype.setContents = function (file, canvas, callback) {
  this.getBlob(file, canvas, function (err, blob) {
    this.name = file.name;
    this.type = file.type;
    this.ext = file.name.substr(file.name.lastIndexOf('.') + 1);
    this.height = canvas.height;
    this.width = canvas.width;
    this.blob = blob;
    this.preview = loadImage.createObjectURL(this.blob);

    callback(err);
  }.bind(this));
};

/**
 * @private
 * @memberof Image
 *
 * @desc Small wrapper around toBlob in order to make it compatable with node
 *   style callbacks.
 *
 * @param {file} file - File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {object} canvas - Resized canvas representation of image.
 * @param {function} callback - Function to execute once blob has been generated.
 */
Image.prototype.getBlob = function (file, canvas, callback) {
  canvas.toBlob(function (blob) {
    callback(null, blob);
  }, file.type);
};


/* -----------------------------------------------------------------------------
 * expose
 * ---------------------------------------------------------------------------*/

return Image;


});