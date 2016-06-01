(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jQuery'], function (jQuery) {
      return (root.returnExportsGlobal = factory(jQuery));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require('jQuery'));
  } else {
    root['phoxy'] = factory(root.jQuery);
  }
}(this, function (jQuery) {

/*!
 * extend.js
 *
 * Copyright (c) 2014
 */
var utlExtend, aflowWaterfall, loadImageLoadImage, loadImageLoadImageMeta, loadImageLoadImageExif, loadImageLoadImageOrientation, canvasToBlobCanvasToBlob, service, phoxy, _image_, _loadImage_;
utlExtend = function (dest) {
  for (var i = 1; i < arguments.length; i++) {
    for (var k in arguments[i]) {
      dest[k] = arguments[i][k];
    }
  }
  return dest;
};
/*!
 * waterfall.js
 */
aflowWaterfall  /*
                 * JavaScript Load Image
                 * https://github.com/blueimp/JavaScript-Load-Image
                 *
                 * Copyright 2011, Sebastian Tschan
                 * https://blueimp.net
                 *
                 * Licensed under the MIT license:
                 * http://www.opensource.org/licenses/MIT
                 */
                /*global define, module, window, document, URL, webkitURL, FileReader */ = function () {
  /* -----------------------------------------------------------------------------
   * waterfall
   * ---------------------------------------------------------------------------*/
  /**
   * @public
   * @memberof aflow
   *
   * @desc Runs the tasks array of functions in series, each passing their
   *   results to the next in the array. However, if any of the tasks pass an
   *   error to their own callback, the next function is not executed, and the
   *   main callback is immediately called with the error.
   *
   * @example
   * async.waterfall([fn1, fn2], function (err, results1, results2) {
   *   if (err) {
   *     console.log('Bummer dude');
   *   }
   *
   *   doSomething(results1, results2);
   * });
   *
   * @param {array} functions - An array or object containing functions to run.
   * @param {function} callback - An optional callback to call once all functions
   *   have completed running, or an error has been thrown.
   */
  var waterfall = function (functions, done) {
    var length = functions.length, i = 0;
    var loop = function (args) {
      functions[i].apply(this, args.concat([callback]));
    };
    var callback = function (err) {
      var args = Array.prototype.slice.call(arguments, 1);
      return err || i++ === length - 1 ? done.apply(this, [err].concat(args)) : loop(args);
    };
    return length ? loop([]) : done(null);
  };
  /* -----------------------------------------------------------------------------
   * expose
   * ---------------------------------------------------------------------------*/
  return waterfall;
}();
(function ($) {
  'use strict';
  // Loads an image for a given File object.
  // Invokes the callback with an img or optional canvas
  // element (if supported by the browser) as parameter:
  var loadImage = function (file, callback, options) {
    var img = document.createElement('img');
    var url;
    var oUrl;
    img.onerror = callback;
    img.onload = function () {
      if (oUrl && !(options && options.noRevoke)) {
        loadImage.revokeObjectURL(oUrl);
      }
      if (callback) {
        callback(loadImage.scale(img, options));
      }
    };
    if (loadImage.isInstanceOf('Blob', file) || // Files are also Blob instances, but some browsers
      // (Firefox 3.6) support the File API but not Blobs:
      loadImage.isInstanceOf('File', file)) {
      url = oUrl = loadImage.createObjectURL(file);
      // Store the file type for resize processing:
      img._type = file.type;
    } else if (typeof file === 'string') {
      url = file;
      if (options && options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }
    } else {
      return false;
    }
    if (url) {
      img.src = url;
      return img;
    }
    return loadImage.readFile(file, function (e) {
      var target = e.target;
      if (target && target.result) {
        img.src = target.result;
      } else {
        if (callback) {
          callback(e);
        }
      }
    });
  };
  // The check for URL.revokeObjectURL fixes an issue with Opera 12,
  // which provides URL.createObjectURL but doesn't properly implement it:
  var urlAPI = window.createObjectURL && window || window.URL && URL.revokeObjectURL && URL || window.webkitURL && webkitURL;
  loadImage.isInstanceOf = function (type, obj) {
    // Cross-frame instanceof check
    return Object.prototype.toString.call(obj) === '[object ' + type + ']';
  };
  // Transform image coordinates, allows to override e.g.
  // the canvas orientation based on the orientation option,
  // gets canvas, options passed as arguments:
  loadImage.transformCoordinates = function () {
    return;
  };
  // Returns transformed options, allows to override e.g.
  // maxWidth, maxHeight and crop options based on the aspectRatio.
  // gets img, options passed as arguments:
  loadImage.getTransformedOptions = function (img, options) {
    var aspectRatio = options.aspectRatio;
    var newOptions;
    var i;
    var width;
    var height;
    if (!aspectRatio) {
      return options;
    }
    newOptions = {};
    for (i in options) {
      if (options.hasOwnProperty(i)) {
        newOptions[i] = options[i];
      }
    }
    newOptions.crop = true;
    width = img.naturalWidth || img.width;
    height = img.naturalHeight || img.height;
    if (width / height > aspectRatio) {
      newOptions.maxWidth = height * aspectRatio;
      newOptions.maxHeight = height;
    } else {
      newOptions.maxWidth = width;
      newOptions.maxHeight = width / aspectRatio;
    }
    return newOptions;
  };
  // Canvas render method, allows to implement a different rendering algorithm:
  loadImage.renderImageToCanvas = function (canvas, img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight) {
    canvas.getContext('2d').drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    return canvas;
  };
  // This method is used to determine if the target image
  // should be a canvas element:
  loadImage.hasCanvasOption = function (options) {
    return options.canvas || options.crop || !!options.aspectRatio;
  };
  // Scales and/or crops the given image (img or canvas HTML element)
  // using the given options.
  // Returns a canvas object if the browser supports canvas
  // and the hasCanvasOption method returns true or a canvas
  // object is passed as image, else the scaled image:
  loadImage.scale = function (img, options) {
    options = options || {};
    var canvas = document.createElement('canvas');
    var useCanvas = img.getContext || loadImage.hasCanvasOption(options) && canvas.getContext;
    var width = img.naturalWidth || img.width;
    var height = img.naturalHeight || img.height;
    var destWidth = width;
    var destHeight = height;
    var maxWidth;
    var maxHeight;
    var minWidth;
    var minHeight;
    var sourceWidth;
    var sourceHeight;
    var sourceX;
    var sourceY;
    var pixelRatio;
    var downsamplingRatio;
    var tmp;
    function scaleUp() {
      var scale = Math.max((minWidth || destWidth) / destWidth, (minHeight || destHeight) / destHeight);
      if (scale > 1) {
        destWidth *= scale;
        destHeight *= scale;
      }
    }
    function scaleDown() {
      var scale = Math.min((maxWidth || destWidth) / destWidth, (maxHeight || destHeight) / destHeight);
      if (scale < 1) {
        destWidth *= scale;
        destHeight *= scale;
      }
    }
    if (useCanvas) {
      options = loadImage.getTransformedOptions(img, options);
      sourceX = options.left || 0;
      sourceY = options.top || 0;
      if (options.sourceWidth) {
        sourceWidth = options.sourceWidth;
        if (options.right !== undefined && options.left === undefined) {
          sourceX = width - sourceWidth - options.right;
        }
      } else {
        sourceWidth = width - sourceX - (options.right || 0);
      }
      if (options.sourceHeight) {
        sourceHeight = options.sourceHeight;
        if (options.bottom !== undefined && options.top === undefined) {
          sourceY = height - sourceHeight - options.bottom;
        }
      } else {
        sourceHeight = height - sourceY - (options.bottom || 0);
      }
      destWidth = sourceWidth;
      destHeight = sourceHeight;
    }
    maxWidth = options.maxWidth;
    maxHeight = options.maxHeight;
    minWidth = options.minWidth;
    minHeight = options.minHeight;
    if (useCanvas && maxWidth && maxHeight && options.crop) {
      destWidth = maxWidth;
      destHeight = maxHeight;
      tmp = sourceWidth / sourceHeight - maxWidth / maxHeight;
      if (tmp < 0) {
        sourceHeight = maxHeight * sourceWidth / maxWidth;
        if (options.top === undefined && options.bottom === undefined) {
          sourceY = (height - sourceHeight) / 2;
        }
      } else if (tmp > 0) {
        sourceWidth = maxWidth * sourceHeight / maxHeight;
        if (options.left === undefined && options.right === undefined) {
          sourceX = (width - sourceWidth) / 2;
        }
      }
    } else {
      if (options.contain || options.cover) {
        minWidth = maxWidth = maxWidth || minWidth;
        minHeight = maxHeight = maxHeight || minHeight;
      }
      if (options.cover) {
        scaleDown();
        scaleUp();
      } else {
        scaleUp();
        scaleDown();
      }
    }
    if (useCanvas) {
      pixelRatio = options.pixelRatio;
      if (pixelRatio > 1) {
        canvas.style.width = destWidth + 'px';
        canvas.style.height = destHeight + 'px';
        destWidth *= pixelRatio;
        destHeight *= pixelRatio;
        canvas.getContext('2d').scale(pixelRatio, pixelRatio);
      }
      downsamplingRatio = options.downsamplingRatio;
      if (downsamplingRatio > 0 && downsamplingRatio < 1 && destWidth < sourceWidth && destHeight < sourceHeight) {
        while (sourceWidth * downsamplingRatio > destWidth) {
          canvas.width = sourceWidth * downsamplingRatio;
          canvas.height = sourceHeight * downsamplingRatio;
          loadImage.renderImageToCanvas(canvas, img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
          sourceWidth = canvas.width;
          sourceHeight = canvas.height;
          img = document.createElement('canvas');
          img.width = sourceWidth;
          img.height = sourceHeight;
          loadImage.renderImageToCanvas(img, canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
        }
      }
      canvas.width = destWidth;
      canvas.height = destHeight;
      loadImage.transformCoordinates(canvas, options);
      return loadImage.renderImageToCanvas(canvas, img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
    }
    img.width = destWidth;
    img.height = destHeight;
    return img;
  };
  loadImage.createObjectURL = function (file) {
    return urlAPI ? urlAPI.createObjectURL(file) : false;
  };
  loadImage.revokeObjectURL = function (url) {
    return urlAPI ? urlAPI.revokeObjectURL(url) : false;
  };
  // Loads a given File object via FileReader interface,
  // invokes the callback with the event object (load or error).
  // The result can be read via event.target.result:
  loadImage.readFile = function (file, callback, method) {
    if (window.FileReader) {
      var fileReader = new FileReader();
      fileReader.onload = fileReader.onerror = callback;
      method = method || 'readAsDataURL';
      if (fileReader[method]) {
        fileReader[method](file);
        return fileReader;
      }
    }
    return false;
  };
  if (true) {
    loadImageLoadImage = function () {
      return loadImage;
    }();
  } else if (typeof module === 'object' && module.exports) {
    module.exports = loadImage;
  } else {
    $.loadImage = loadImage;
  }
}(window));  /*
              * JavaScript Load Image Meta
              * https://github.com/blueimp/JavaScript-Load-Image
              *
              * Copyright 2013, Sebastian Tschan
              * https://blueimp.net
              *
              * Image meta data handling implementation
              * based on the help and contribution of
              * Achim Stöhr.
              *
              * Licensed under the MIT license:
              * http://www.opensource.org/licenses/MIT
              */
             /*global define, module, require, window, DataView, Blob, Uint8Array, console */
(function (factory) {
  'use strict';
  if (true) {
    // Register as an anonymous AMD module:
    loadImageLoadImageMeta = function (loadImageLoadImage) {
      return typeof factory === 'function' ? factory(loadImageLoadImage) : factory;
    }(loadImageLoadImage);
  } else if (typeof module === 'object' && module.exports) {
    factory(_loadImage_);
  } else {
    // Browser globals:
    factory(window.loadImage);
  }
}(function (loadImage) {
  'use strict';
  var hasblobSlice = window.Blob && (Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice);
  loadImage.blobSlice = hasblobSlice && function () {
    var slice = this.slice || this.webkitSlice || this.mozSlice;
    return slice.apply(this, arguments);
  };
  loadImage.metaDataParsers = {
    jpeg: {
      65505: []  // APP1 marker
    }
  };
  // Parses image meta data and calls the callback with an object argument
  // with the following properties:
  // * imageHead: The complete image head as ArrayBuffer (Uint8Array for IE10)
  // The options arguments accepts an object and supports the following properties:
  // * maxMetaDataSize: Defines the maximum number of bytes to parse.
  // * disableImageHead: Disables creating the imageHead property.
  loadImage.parseMetaData = function (file, callback, options) {
    options = options || {};
    var that = this;
    // 256 KiB should contain all EXIF/ICC/IPTC segments:
    var maxMetaDataSize = options.maxMetaDataSize || 262144;
    var data = {};
    var noMetaData = !(window.DataView && file && file.size >= 12 && file.type === 'image/jpeg' && loadImage.blobSlice);
    if (noMetaData || !loadImage.readFile(loadImage.blobSlice.call(file, 0, maxMetaDataSize), function (e) {
        if (e.target.error) {
          // FileReader error
          console.log(e.target.error);
          callback(data);
          return;
        }
        // Note on endianness:
        // Since the marker and length bytes in JPEG files are always
        // stored in big endian order, we can leave the endian parameter
        // of the DataView methods undefined, defaulting to big endian.
        var buffer = e.target.result;
        var dataView = new DataView(buffer);
        var offset = 2;
        var maxOffset = dataView.byteLength - 4;
        var headLength = offset;
        var markerBytes;
        var markerLength;
        var parsers;
        var i;
        // Check for the JPEG marker (0xffd8):
        if (dataView.getUint16(0) === 65496) {
          while (offset < maxOffset) {
            markerBytes = dataView.getUint16(offset);
            // Search for APPn (0xffeN) and COM (0xfffe) markers,
            // which contain application-specific meta-data like
            // Exif, ICC and IPTC data and text comments:
            if (markerBytes >= 65504 && markerBytes <= 65519 || markerBytes === 65534) {
              // The marker bytes (2) are always followed by
              // the length bytes (2), indicating the length of the
              // marker segment, which includes the length bytes,
              // but not the marker bytes, so we add 2:
              markerLength = dataView.getUint16(offset + 2) + 2;
              if (offset + markerLength > dataView.byteLength) {
                console.log('Invalid meta data: Invalid segment size.');
                break;
              }
              parsers = loadImage.metaDataParsers.jpeg[markerBytes];
              if (parsers) {
                for (i = 0; i < parsers.length; i += 1) {
                  parsers[i].call(that, dataView, offset, markerLength, data, options);
                }
              }
              offset += markerLength;
              headLength = offset;
            } else {
              // Not an APPn or COM marker, probably safe to
              // assume that this is the end of the meta data
              break;
            }
          }
          // Meta length must be longer than JPEG marker (2)
          // plus APPn marker (2), followed by length bytes (2):
          if (!options.disableImageHead && headLength > 6) {
            if (buffer.slice) {
              data.imageHead = buffer.slice(0, headLength);
            } else {
              // Workaround for IE10, which does not yet
              // support ArrayBuffer.slice:
              data.imageHead = new Uint8Array(buffer).subarray(0, headLength);
            }
          }
        } else {
          console.log('Invalid JPEG file: Missing JPEG marker.');
        }
        callback(data);
      }, 'readAsArrayBuffer')) {
      callback(data);
    }
  };
}));  /*
       * JavaScript Load Image Exif Parser
       * https://github.com/blueimp/JavaScript-Load-Image
       *
       * Copyright 2013, Sebastian Tschan
       * https://blueimp.net
       *
       * Licensed under the MIT license:
       * http://www.opensource.org/licenses/MIT
       */
      /*global define, module, require, window, console */
(function (factory) {
  'use strict';
  if (true) {
    // Register as an anonymous AMD module:
    loadImageLoadImageExif = function (loadImageLoadImage, loadImageLoadImageMeta) {
      return typeof factory === 'function' ? factory(loadImageLoadImage, loadImageLoadImageMeta) : factory;
    }(loadImageLoadImage, loadImageLoadImageMeta);
  } else if (typeof module === 'object' && module.exports) {
    factory(_loadImage_, loadImageMeta);
  } else {
    // Browser globals:
    factory(window.loadImage);
  }
}(function (loadImage) {
  'use strict';
  loadImage.ExifMap = function () {
    return this;
  };
  loadImage.ExifMap.prototype.map = { 'Orientation': 274 };
  loadImage.ExifMap.prototype.get = function (id) {
    return this[id] || this[this.map[id]];
  };
  loadImage.getExifThumbnail = function (dataView, offset, length) {
    var hexData, i, b;
    if (!length || offset + length > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid thumbnail data.');
      return;
    }
    hexData = [];
    for (i = 0; i < length; i += 1) {
      b = dataView.getUint8(offset + i);
      hexData.push((b < 16 ? '0' : '') + b.toString(16));
    }
    return 'data:image/jpeg,%' + hexData.join('%');
  };
  loadImage.exifTagTypes = {
    // byte, 8-bit unsigned int:
    1: {
      getValue: function (dataView, dataOffset) {
        return dataView.getUint8(dataOffset);
      },
      size: 1
    },
    // ascii, 8-bit byte:
    2: {
      getValue: function (dataView, dataOffset) {
        return String.fromCharCode(dataView.getUint8(dataOffset));
      },
      size: 1,
      ascii: true
    },
    // short, 16 bit int:
    3: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getUint16(dataOffset, littleEndian);
      },
      size: 2
    },
    // long, 32 bit int:
    4: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getUint32(dataOffset, littleEndian);
      },
      size: 4
    },
    // rational = two long values, first is numerator, second is denominator:
    5: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getUint32(dataOffset, littleEndian) / dataView.getUint32(dataOffset + 4, littleEndian);
      },
      size: 8
    },
    // slong, 32 bit signed int:
    9: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getInt32(dataOffset, littleEndian);
      },
      size: 4
    },
    // srational, two slongs, first is numerator, second is denominator:
    10: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getInt32(dataOffset, littleEndian) / dataView.getInt32(dataOffset + 4, littleEndian);
      },
      size: 8
    }
  };
  // undefined, 8-bit byte, value depending on field:
  loadImage.exifTagTypes[7] = loadImage.exifTagTypes[1];
  loadImage.getExifValue = function (dataView, tiffOffset, offset, type, length, littleEndian) {
    var tagType = loadImage.exifTagTypes[type];
    var tagSize;
    var dataOffset;
    var values;
    var i;
    var str;
    var c;
    if (!tagType) {
      console.log('Invalid Exif data: Invalid tag type.');
      return;
    }
    tagSize = tagType.size * length;
    // Determine if the value is contained in the dataOffset bytes,
    // or if the value at the dataOffset is a pointer to the actual data:
    dataOffset = tagSize > 4 ? tiffOffset + dataView.getUint32(offset + 8, littleEndian) : offset + 8;
    if (dataOffset + tagSize > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid data offset.');
      return;
    }
    if (length === 1) {
      return tagType.getValue(dataView, dataOffset, littleEndian);
    }
    values = [];
    for (i = 0; i < length; i += 1) {
      values[i] = tagType.getValue(dataView, dataOffset + i * tagType.size, littleEndian);
    }
    if (tagType.ascii) {
      str = '';
      // Concatenate the chars:
      for (i = 0; i < values.length; i += 1) {
        c = values[i];
        // Ignore the terminating NULL byte(s):
        if (c === '\0') {
          break;
        }
        str += c;
      }
      return str;
    }
    return values;
  };
  loadImage.parseExifTag = function (dataView, tiffOffset, offset, littleEndian, data) {
    var tag = dataView.getUint16(offset, littleEndian);
    data.exif[tag] = loadImage.getExifValue(dataView, tiffOffset, offset, dataView.getUint16(offset + 2, littleEndian), // tag type
    dataView.getUint32(offset + 4, littleEndian), // tag length
    littleEndian);
  };
  loadImage.parseExifTags = function (dataView, tiffOffset, dirOffset, littleEndian, data) {
    var tagsNumber, dirEndOffset, i;
    if (dirOffset + 6 > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid directory offset.');
      return;
    }
    tagsNumber = dataView.getUint16(dirOffset, littleEndian);
    dirEndOffset = dirOffset + 2 + 12 * tagsNumber;
    if (dirEndOffset + 4 > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid directory size.');
      return;
    }
    for (i = 0; i < tagsNumber; i += 1) {
      this.parseExifTag(dataView, tiffOffset, dirOffset + 2 + 12 * i, // tag offset
      littleEndian, data);
    }
    // Return the offset to the next directory:
    return dataView.getUint32(dirEndOffset, littleEndian);
  };
  loadImage.parseExifData = function (dataView, offset, length, data, options) {
    if (options.disableExif) {
      return;
    }
    var tiffOffset = offset + 10;
    var littleEndian;
    var dirOffset;
    var thumbnailData;
    // Check for the ASCII code for "Exif" (0x45786966):
    if (dataView.getUint32(offset + 4) !== 1165519206) {
      // No Exif data, might be XMP data instead
      return;
    }
    if (tiffOffset + 8 > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid segment size.');
      return;
    }
    // Check for the two null bytes:
    if (dataView.getUint16(offset + 8) !== 0) {
      console.log('Invalid Exif data: Missing byte alignment offset.');
      return;
    }
    // Check the byte alignment:
    switch (dataView.getUint16(tiffOffset)) {
    case 18761:
      littleEndian = true;
      break;
    case 19789:
      littleEndian = false;
      break;
    default:
      console.log('Invalid Exif data: Invalid byte alignment marker.');
      return;
    }
    // Check for the TIFF tag marker (0x002A):
    if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 42) {
      console.log('Invalid Exif data: Missing TIFF marker.');
      return;
    }
    // Retrieve the directory offset bytes, usually 0x00000008 or 8 decimal:
    dirOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
    // Create the exif object to store the tags:
    data.exif = new loadImage.ExifMap();
    // Parse the tags of the main image directory and retrieve the
    // offset to the next directory, usually the thumbnail directory:
    dirOffset = loadImage.parseExifTags(dataView, tiffOffset, tiffOffset + dirOffset, littleEndian, data);
    if (dirOffset && !options.disableExifThumbnail) {
      thumbnailData = { exif: {} };
      dirOffset = loadImage.parseExifTags(dataView, tiffOffset, tiffOffset + dirOffset, littleEndian, thumbnailData);
      // Check for JPEG Thumbnail offset:
      if (thumbnailData.exif[513]) {
        data.exif.Thumbnail = loadImage.getExifThumbnail(dataView, tiffOffset + thumbnailData.exif[513], thumbnailData.exif[514]  // Thumbnail data length
);
      }
    }
    // Check for Exif Sub IFD Pointer:
    if (data.exif[34665] && !options.disableExifSub) {
      loadImage.parseExifTags(dataView, tiffOffset, tiffOffset + data.exif[34665], // directory offset
      littleEndian, data);
    }
    // Check for GPS Info IFD Pointer:
    if (data.exif[34853] && !options.disableExifGps) {
      loadImage.parseExifTags(dataView, tiffOffset, tiffOffset + data.exif[34853], // directory offset
      littleEndian, data);
    }
  };
  // Registers the Exif parser for the APP1 JPEG meta data segment:
  loadImage.metaDataParsers.jpeg[65505].push(loadImage.parseExifData)  // Adds the following properties to the parseMetaData callback data:
                                                                       // * exif: The exif tags, parsed by the parseExifData method
                                                                       // Adds the following options to the parseMetaData method:
                                                                       // * disableExif: Disables Exif parsing.
                                                                       // * disableExifThumbnail: Disables parsing of the Exif Thumbnail.
                                                                       // * disableExifSub: Disables parsing of the Exif Sub IFD.
                                                                       // * disableExifGps: Disables parsing of the Exif GPS Info IFD.
;
}));  /*
       * JavaScript Load Image Orientation
       * https://github.com/blueimp/JavaScript-Load-Image
       *
       * Copyright 2013, Sebastian Tschan
       * https://blueimp.net
       *
       * Licensed under the MIT license:
       * http://www.opensource.org/licenses/MIT
       */
      /*global define, module, require, window */
(function (factory) {
  'use strict';
  if (true) {
    // Register as an anonymous AMD module:
    loadImageLoadImageOrientation = function (loadImageLoadImage) {
      return typeof factory === 'function' ? factory(loadImageLoadImage) : factory;
    }(loadImageLoadImage);
  } else if (typeof module === 'object' && module.exports) {
    factory(_loadImage_);
  } else {
    // Browser globals:
    factory(window.loadImage);
  }
}(function (loadImage) {
  'use strict';
  var originalHasCanvasOption = loadImage.hasCanvasOption;
  var originalTransformCoordinates = loadImage.transformCoordinates;
  var originalGetTransformedOptions = loadImage.getTransformedOptions;
  // This method is used to determine if the target image
  // should be a canvas element:
  loadImage.hasCanvasOption = function (options) {
    return !!options.orientation || originalHasCanvasOption.call(loadImage, options);
  };
  // Transform image orientation based on
  // the given EXIF orientation option:
  loadImage.transformCoordinates = function (canvas, options) {
    originalTransformCoordinates.call(loadImage, canvas, options);
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var styleWidth = canvas.style.width;
    var styleHeight = canvas.style.height;
    var orientation = options.orientation;
    if (!orientation || orientation > 8) {
      return;
    }
    if (orientation > 4) {
      canvas.width = height;
      canvas.height = width;
      canvas.style.width = styleHeight;
      canvas.style.height = styleWidth;
    }
    switch (orientation) {
    case 2:
      // horizontal flip
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      // 180° rotate left
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      // vertical flip
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      // vertical flip + 90 rotate right
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      // 90° rotate right
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7:
      // horizontal flip + 90 rotate right
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8:
      // 90° rotate left
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    }
  };
  // Transforms coordinate and dimension options
  // based on the given orientation option:
  loadImage.getTransformedOptions = function (img, opts) {
    var options = originalGetTransformedOptions.call(loadImage, img, opts);
    var orientation = options.orientation;
    var newOptions;
    var i;
    if (!orientation || orientation > 8 || orientation === 1) {
      return options;
    }
    newOptions = {};
    for (i in options) {
      if (options.hasOwnProperty(i)) {
        newOptions[i] = options[i];
      }
    }
    switch (options.orientation) {
    case 2:
      // horizontal flip
      newOptions.left = options.right;
      newOptions.right = options.left;
      break;
    case 3:
      // 180° rotate left
      newOptions.left = options.right;
      newOptions.top = options.bottom;
      newOptions.right = options.left;
      newOptions.bottom = options.top;
      break;
    case 4:
      // vertical flip
      newOptions.top = options.bottom;
      newOptions.bottom = options.top;
      break;
    case 5:
      // vertical flip + 90 rotate right
      newOptions.left = options.top;
      newOptions.top = options.left;
      newOptions.right = options.bottom;
      newOptions.bottom = options.right;
      break;
    case 6:
      // 90° rotate right
      newOptions.left = options.top;
      newOptions.top = options.right;
      newOptions.right = options.bottom;
      newOptions.bottom = options.left;
      break;
    case 7:
      // horizontal flip + 90 rotate right
      newOptions.left = options.bottom;
      newOptions.top = options.right;
      newOptions.right = options.top;
      newOptions.bottom = options.left;
      break;
    case 8:
      // 90° rotate left
      newOptions.left = options.bottom;
      newOptions.top = options.left;
      newOptions.right = options.top;
      newOptions.bottom = options.right;
      break;
    }
    if (options.orientation > 4) {
      newOptions.maxWidth = options.maxHeight;
      newOptions.maxHeight = options.maxWidth;
      newOptions.minWidth = options.minHeight;
      newOptions.minHeight = options.minWidth;
      newOptions.sourceWidth = options.sourceHeight;
      newOptions.sourceHeight = options.sourceWidth;
    }
    return newOptions;
  };
}));  /*
       * JavaScript Canvas to Blob
       * https://github.com/blueimp/JavaScript-Canvas-to-Blob
       *
       * Copyright 2012, Sebastian Tschan
       * https://blueimp.net
       *
       * Licensed under the MIT license:
       * http://www.opensource.org/licenses/MIT
       *
       * Based on stackoverflow user Stoive's code snippet:
       * http://stackoverflow.com/q/4998908
       */
      /*global window, atob, Blob, ArrayBuffer, Uint8Array, define, module */
(function (window) {
  'use strict';
  var CanvasPrototype = window.HTMLCanvasElement && window.HTMLCanvasElement.prototype;
  var hasBlobConstructor = window.Blob && function () {
    try {
      return Boolean(new Blob());
    } catch (e) {
      return false;
    }
  }();
  var hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array && function () {
    try {
      return new Blob([new Uint8Array(100)]).size === 100;
    } catch (e) {
      return false;
    }
  }();
  var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
  var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;
  var dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob && window.ArrayBuffer && window.Uint8Array && function (dataURI) {
    var matches, mediaType, isBase64, dataString, byteString, arrayBuffer, intArray, i, bb;
    // Parse the dataURI components as per RFC 2397
    matches = dataURI.match(dataURIPattern);
    if (!matches) {
      throw new Error('invalid data URI');
    }
    // Default to text/plain;charset=US-ASCII
    mediaType = matches[2] ? matches[1] : 'text/plain' + (matches[3] || ';charset=US-ASCII');
    isBase64 = !!matches[4];
    dataString = dataURI.slice(matches[0].length);
    if (isBase64) {
      // Convert base64 to raw binary data held in a string:
      byteString = atob(dataString);
    } else {
      // Convert base64/URLEncoded data component to raw binary:
      byteString = decodeURIComponent(dataString);
    }
    // Write the bytes of the string to an ArrayBuffer:
    arrayBuffer = new ArrayBuffer(byteString.length);
    intArray = new Uint8Array(arrayBuffer);
    for (i = 0; i < byteString.length; i += 1) {
      intArray[i] = byteString.charCodeAt(i);
    }
    // Write the ArrayBuffer (or ArrayBufferView) to a blob:
    if (hasBlobConstructor) {
      return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], { type: mediaType });
    }
    bb = new BlobBuilder();
    bb.append(arrayBuffer);
    return bb.getBlob(mediaType);
  };
  if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
    if (CanvasPrototype.mozGetAsFile) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
          callback(dataURLtoBlob(this.toDataURL(type, quality)));
        } else {
          callback(this.mozGetAsFile('blob', type));
        }
      };
    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        callback(dataURLtoBlob(this.toDataURL(type, quality)));
      };
    }
  }
  if (true) {
    canvasToBlobCanvasToBlob = function () {
      return dataURLtoBlob;
    }();
  } else if (typeof module === 'object' && module.exports) {
    module.exports = dataURLtoBlob;
  } else {
    window.dataURLtoBlob = dataURLtoBlob;
  }
}(window));
/*!
 * image.js
 */
_image_ = function (require) {
  /* -----------------------------------------------------------------------------
   * dependencies
   * ---------------------------------------------------------------------------*/
  var extend = utlExtend;
  var waterfall = aflowWaterfall;
  var loadImage = loadImageLoadImage;
  var parseImageMeta = loadImageLoadImageMeta;
  var exifImageMeta = loadImageLoadImageExif;
  var exifImageOrientation = loadImageLoadImageOrientation;
  var canvasToBlob = canvasToBlobCanvasToBlob;
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
    this.onerror = options.onerror || function () {
    };
    this.oncreated = options.oncreated || function () {
    };
    waterfall([
      this.parseMetaData.bind(this, file),
      this.loadImage.bind(this, file, options),
      this.setContents.bind(this, file)
    ], function (err) {
      return err ? this.onerror(err) : this.oncreated(this);
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
}({});
/*!
 * service.js
 */
service = function (require) {
  /* -----------------------------------------------------------------------------
   * dependencies
   * ---------------------------------------------------------------------------*/
  var $ = jQuery;
  var extend = utlExtend;
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
      contentType: false
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
  return Service;
}({});
/*!
 * phoxy.js
 */
phoxy = function (require) {
  /* -----------------------------------------------------------------------------
   * dependencies
   * ---------------------------------------------------------------------------*/
  var Image = _image_;
  var Service = service;
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
  return {
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
}({});

return phoxy;


}));