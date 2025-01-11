import require$$0$5 from 'events';
import require$$1 from 'https';
import require$$2$1 from 'http';
import require$$3 from 'net';
import require$$4 from 'tls';
import require$$0$4 from 'crypto';
import require$$0$3 from 'stream';
import require$$7 from 'url';
import require$$0$1 from 'zlib';
import require$$0$2 from 'buffer';
import require$$0$7 from 'util';
import require$$0$6 from 'os';
import require$$0$8 from 'fs';
import require$$1$3 from 'path';
import require$$1$1 from 'tty';
import require$$1$2 from 'string_decoder';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var plugin$1 = {};

var bufferUtil = {exports: {}};

var constants;
var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;

	constants = {
	  BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
	  EMPTY_BUFFER: Buffer.alloc(0),
	  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
	  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
	  kListener: Symbol('kListener'),
	  kStatusCode: Symbol('status-code'),
	  kWebSocket: Symbol('websocket'),
	  NOOP: () => {}
	};
	return constants;
}

var hasRequiredBufferUtil;

function requireBufferUtil () {
	if (hasRequiredBufferUtil) return bufferUtil.exports;
	hasRequiredBufferUtil = 1;

	const { EMPTY_BUFFER } = requireConstants();

	const FastBuffer = Buffer[Symbol.species];

	/**
	 * Merges an array of buffers into a new buffer.
	 *
	 * @param {Buffer[]} list The array of buffers to concat
	 * @param {Number} totalLength The total length of buffers in the list
	 * @return {Buffer} The resulting buffer
	 * @public
	 */
	function concat(list, totalLength) {
	  if (list.length === 0) return EMPTY_BUFFER;
	  if (list.length === 1) return list[0];

	  const target = Buffer.allocUnsafe(totalLength);
	  let offset = 0;

	  for (let i = 0; i < list.length; i++) {
	    const buf = list[i];
	    target.set(buf, offset);
	    offset += buf.length;
	  }

	  if (offset < totalLength) {
	    return new FastBuffer(target.buffer, target.byteOffset, offset);
	  }

	  return target;
	}

	/**
	 * Masks a buffer using the given mask.
	 *
	 * @param {Buffer} source The buffer to mask
	 * @param {Buffer} mask The mask to use
	 * @param {Buffer} output The buffer where to store the result
	 * @param {Number} offset The offset at which to start writing
	 * @param {Number} length The number of bytes to mask.
	 * @public
	 */
	function _mask(source, mask, output, offset, length) {
	  for (let i = 0; i < length; i++) {
	    output[offset + i] = source[i] ^ mask[i & 3];
	  }
	}

	/**
	 * Unmasks a buffer using the given mask.
	 *
	 * @param {Buffer} buffer The buffer to unmask
	 * @param {Buffer} mask The mask to use
	 * @public
	 */
	function _unmask(buffer, mask) {
	  for (let i = 0; i < buffer.length; i++) {
	    buffer[i] ^= mask[i & 3];
	  }
	}

	/**
	 * Converts a buffer to an `ArrayBuffer`.
	 *
	 * @param {Buffer} buf The buffer to convert
	 * @return {ArrayBuffer} Converted buffer
	 * @public
	 */
	function toArrayBuffer(buf) {
	  if (buf.length === buf.buffer.byteLength) {
	    return buf.buffer;
	  }

	  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
	}

	/**
	 * Converts `data` to a `Buffer`.
	 *
	 * @param {*} data The data to convert
	 * @return {Buffer} The buffer
	 * @throws {TypeError}
	 * @public
	 */
	function toBuffer(data) {
	  toBuffer.readOnly = true;

	  if (Buffer.isBuffer(data)) return data;

	  let buf;

	  if (data instanceof ArrayBuffer) {
	    buf = new FastBuffer(data);
	  } else if (ArrayBuffer.isView(data)) {
	    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
	  } else {
	    buf = Buffer.from(data);
	    toBuffer.readOnly = false;
	  }

	  return buf;
	}

	bufferUtil.exports = {
	  concat,
	  mask: _mask,
	  toArrayBuffer,
	  toBuffer,
	  unmask: _unmask
	};

	/* istanbul ignore else  */
	if (!process.env.WS_NO_BUFFER_UTIL) {
	  try {
	    const bufferUtil$1 = require('bufferutil');

	    bufferUtil.exports.mask = function (source, mask, output, offset, length) {
	      if (length < 48) _mask(source, mask, output, offset, length);
	      else bufferUtil$1.mask(source, mask, output, offset, length);
	    };

	    bufferUtil.exports.unmask = function (buffer, mask) {
	      if (buffer.length < 32) _unmask(buffer, mask);
	      else bufferUtil$1.unmask(buffer, mask);
	    };
	  } catch (e) {
	    // Continue regardless of the error.
	  }
	}
	return bufferUtil.exports;
}

var limiter;
var hasRequiredLimiter;

function requireLimiter () {
	if (hasRequiredLimiter) return limiter;
	hasRequiredLimiter = 1;

	const kDone = Symbol('kDone');
	const kRun = Symbol('kRun');

	/**
	 * A very simple job queue with adjustable concurrency. Adapted from
	 * https://github.com/STRML/async-limiter
	 */
	class Limiter {
	  /**
	   * Creates a new `Limiter`.
	   *
	   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
	   *     to run concurrently
	   */
	  constructor(concurrency) {
	    this[kDone] = () => {
	      this.pending--;
	      this[kRun]();
	    };
	    this.concurrency = concurrency || Infinity;
	    this.jobs = [];
	    this.pending = 0;
	  }

	  /**
	   * Adds a job to the queue.
	   *
	   * @param {Function} job The job to run
	   * @public
	   */
	  add(job) {
	    this.jobs.push(job);
	    this[kRun]();
	  }

	  /**
	   * Removes a job from the queue and runs it if possible.
	   *
	   * @private
	   */
	  [kRun]() {
	    if (this.pending === this.concurrency) return;

	    if (this.jobs.length) {
	      const job = this.jobs.shift();

	      this.pending++;
	      job(this[kDone]);
	    }
	  }
	}

	limiter = Limiter;
	return limiter;
}

var permessageDeflate;
var hasRequiredPermessageDeflate;

function requirePermessageDeflate () {
	if (hasRequiredPermessageDeflate) return permessageDeflate;
	hasRequiredPermessageDeflate = 1;

	const zlib = require$$0$1;

	const bufferUtil = requireBufferUtil();
	const Limiter = requireLimiter();
	const { kStatusCode } = requireConstants();

	const FastBuffer = Buffer[Symbol.species];
	const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
	const kPerMessageDeflate = Symbol('permessage-deflate');
	const kTotalLength = Symbol('total-length');
	const kCallback = Symbol('callback');
	const kBuffers = Symbol('buffers');
	const kError = Symbol('error');

	//
	// We limit zlib concurrency, which prevents severe memory fragmentation
	// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
	// and https://github.com/websockets/ws/issues/1202
	//
	// Intentionally global; it's the global thread pool that's an issue.
	//
	let zlibLimiter;

	/**
	 * permessage-deflate implementation.
	 */
	class PerMessageDeflate {
	  /**
	   * Creates a PerMessageDeflate instance.
	   *
	   * @param {Object} [options] Configuration options
	   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
	   *     for, or request, a custom client window size
	   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
	   *     acknowledge disabling of client context takeover
	   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
	   *     calls to zlib
	   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
	   *     use of a custom server window size
	   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
	   *     disabling of server context takeover
	   * @param {Number} [options.threshold=1024] Size (in bytes) below which
	   *     messages should not be compressed if context takeover is disabled
	   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
	   *     deflate
	   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
	   *     inflate
	   * @param {Boolean} [isServer=false] Create the instance in either server or
	   *     client mode
	   * @param {Number} [maxPayload=0] The maximum allowed message length
	   */
	  constructor(options, isServer, maxPayload) {
	    this._maxPayload = maxPayload | 0;
	    this._options = options || {};
	    this._threshold =
	      this._options.threshold !== undefined ? this._options.threshold : 1024;
	    this._isServer = !!isServer;
	    this._deflate = null;
	    this._inflate = null;

	    this.params = null;

	    if (!zlibLimiter) {
	      const concurrency =
	        this._options.concurrencyLimit !== undefined
	          ? this._options.concurrencyLimit
	          : 10;
	      zlibLimiter = new Limiter(concurrency);
	    }
	  }

	  /**
	   * @type {String}
	   */
	  static get extensionName() {
	    return 'permessage-deflate';
	  }

	  /**
	   * Create an extension negotiation offer.
	   *
	   * @return {Object} Extension parameters
	   * @public
	   */
	  offer() {
	    const params = {};

	    if (this._options.serverNoContextTakeover) {
	      params.server_no_context_takeover = true;
	    }
	    if (this._options.clientNoContextTakeover) {
	      params.client_no_context_takeover = true;
	    }
	    if (this._options.serverMaxWindowBits) {
	      params.server_max_window_bits = this._options.serverMaxWindowBits;
	    }
	    if (this._options.clientMaxWindowBits) {
	      params.client_max_window_bits = this._options.clientMaxWindowBits;
	    } else if (this._options.clientMaxWindowBits == null) {
	      params.client_max_window_bits = true;
	    }

	    return params;
	  }

	  /**
	   * Accept an extension negotiation offer/response.
	   *
	   * @param {Array} configurations The extension negotiation offers/reponse
	   * @return {Object} Accepted configuration
	   * @public
	   */
	  accept(configurations) {
	    configurations = this.normalizeParams(configurations);

	    this.params = this._isServer
	      ? this.acceptAsServer(configurations)
	      : this.acceptAsClient(configurations);

	    return this.params;
	  }

	  /**
	   * Releases all resources used by the extension.
	   *
	   * @public
	   */
	  cleanup() {
	    if (this._inflate) {
	      this._inflate.close();
	      this._inflate = null;
	    }

	    if (this._deflate) {
	      const callback = this._deflate[kCallback];

	      this._deflate.close();
	      this._deflate = null;

	      if (callback) {
	        callback(
	          new Error(
	            'The deflate stream was closed while data was being processed'
	          )
	        );
	      }
	    }
	  }

	  /**
	   *  Accept an extension negotiation offer.
	   *
	   * @param {Array} offers The extension negotiation offers
	   * @return {Object} Accepted configuration
	   * @private
	   */
	  acceptAsServer(offers) {
	    const opts = this._options;
	    const accepted = offers.find((params) => {
	      if (
	        (opts.serverNoContextTakeover === false &&
	          params.server_no_context_takeover) ||
	        (params.server_max_window_bits &&
	          (opts.serverMaxWindowBits === false ||
	            (typeof opts.serverMaxWindowBits === 'number' &&
	              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
	        (typeof opts.clientMaxWindowBits === 'number' &&
	          !params.client_max_window_bits)
	      ) {
	        return false;
	      }

	      return true;
	    });

	    if (!accepted) {
	      throw new Error('None of the extension offers can be accepted');
	    }

	    if (opts.serverNoContextTakeover) {
	      accepted.server_no_context_takeover = true;
	    }
	    if (opts.clientNoContextTakeover) {
	      accepted.client_no_context_takeover = true;
	    }
	    if (typeof opts.serverMaxWindowBits === 'number') {
	      accepted.server_max_window_bits = opts.serverMaxWindowBits;
	    }
	    if (typeof opts.clientMaxWindowBits === 'number') {
	      accepted.client_max_window_bits = opts.clientMaxWindowBits;
	    } else if (
	      accepted.client_max_window_bits === true ||
	      opts.clientMaxWindowBits === false
	    ) {
	      delete accepted.client_max_window_bits;
	    }

	    return accepted;
	  }

	  /**
	   * Accept the extension negotiation response.
	   *
	   * @param {Array} response The extension negotiation response
	   * @return {Object} Accepted configuration
	   * @private
	   */
	  acceptAsClient(response) {
	    const params = response[0];

	    if (
	      this._options.clientNoContextTakeover === false &&
	      params.client_no_context_takeover
	    ) {
	      throw new Error('Unexpected parameter "client_no_context_takeover"');
	    }

	    if (!params.client_max_window_bits) {
	      if (typeof this._options.clientMaxWindowBits === 'number') {
	        params.client_max_window_bits = this._options.clientMaxWindowBits;
	      }
	    } else if (
	      this._options.clientMaxWindowBits === false ||
	      (typeof this._options.clientMaxWindowBits === 'number' &&
	        params.client_max_window_bits > this._options.clientMaxWindowBits)
	    ) {
	      throw new Error(
	        'Unexpected or invalid parameter "client_max_window_bits"'
	      );
	    }

	    return params;
	  }

	  /**
	   * Normalize parameters.
	   *
	   * @param {Array} configurations The extension negotiation offers/reponse
	   * @return {Array} The offers/response with normalized parameters
	   * @private
	   */
	  normalizeParams(configurations) {
	    configurations.forEach((params) => {
	      Object.keys(params).forEach((key) => {
	        let value = params[key];

	        if (value.length > 1) {
	          throw new Error(`Parameter "${key}" must have only a single value`);
	        }

	        value = value[0];

	        if (key === 'client_max_window_bits') {
	          if (value !== true) {
	            const num = +value;
	            if (!Number.isInteger(num) || num < 8 || num > 15) {
	              throw new TypeError(
	                `Invalid value for parameter "${key}": ${value}`
	              );
	            }
	            value = num;
	          } else if (!this._isServer) {
	            throw new TypeError(
	              `Invalid value for parameter "${key}": ${value}`
	            );
	          }
	        } else if (key === 'server_max_window_bits') {
	          const num = +value;
	          if (!Number.isInteger(num) || num < 8 || num > 15) {
	            throw new TypeError(
	              `Invalid value for parameter "${key}": ${value}`
	            );
	          }
	          value = num;
	        } else if (
	          key === 'client_no_context_takeover' ||
	          key === 'server_no_context_takeover'
	        ) {
	          if (value !== true) {
	            throw new TypeError(
	              `Invalid value for parameter "${key}": ${value}`
	            );
	          }
	        } else {
	          throw new Error(`Unknown parameter "${key}"`);
	        }

	        params[key] = value;
	      });
	    });

	    return configurations;
	  }

	  /**
	   * Decompress data. Concurrency limited.
	   *
	   * @param {Buffer} data Compressed data
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @public
	   */
	  decompress(data, fin, callback) {
	    zlibLimiter.add((done) => {
	      this._decompress(data, fin, (err, result) => {
	        done();
	        callback(err, result);
	      });
	    });
	  }

	  /**
	   * Compress data. Concurrency limited.
	   *
	   * @param {(Buffer|String)} data Data to compress
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @public
	   */
	  compress(data, fin, callback) {
	    zlibLimiter.add((done) => {
	      this._compress(data, fin, (err, result) => {
	        done();
	        callback(err, result);
	      });
	    });
	  }

	  /**
	   * Decompress data.
	   *
	   * @param {Buffer} data Compressed data
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @private
	   */
	  _decompress(data, fin, callback) {
	    const endpoint = this._isServer ? 'client' : 'server';

	    if (!this._inflate) {
	      const key = `${endpoint}_max_window_bits`;
	      const windowBits =
	        typeof this.params[key] !== 'number'
	          ? zlib.Z_DEFAULT_WINDOWBITS
	          : this.params[key];

	      this._inflate = zlib.createInflateRaw({
	        ...this._options.zlibInflateOptions,
	        windowBits
	      });
	      this._inflate[kPerMessageDeflate] = this;
	      this._inflate[kTotalLength] = 0;
	      this._inflate[kBuffers] = [];
	      this._inflate.on('error', inflateOnError);
	      this._inflate.on('data', inflateOnData);
	    }

	    this._inflate[kCallback] = callback;

	    this._inflate.write(data);
	    if (fin) this._inflate.write(TRAILER);

	    this._inflate.flush(() => {
	      const err = this._inflate[kError];

	      if (err) {
	        this._inflate.close();
	        this._inflate = null;
	        callback(err);
	        return;
	      }

	      const data = bufferUtil.concat(
	        this._inflate[kBuffers],
	        this._inflate[kTotalLength]
	      );

	      if (this._inflate._readableState.endEmitted) {
	        this._inflate.close();
	        this._inflate = null;
	      } else {
	        this._inflate[kTotalLength] = 0;
	        this._inflate[kBuffers] = [];

	        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
	          this._inflate.reset();
	        }
	      }

	      callback(null, data);
	    });
	  }

	  /**
	   * Compress data.
	   *
	   * @param {(Buffer|String)} data Data to compress
	   * @param {Boolean} fin Specifies whether or not this is the last fragment
	   * @param {Function} callback Callback
	   * @private
	   */
	  _compress(data, fin, callback) {
	    const endpoint = this._isServer ? 'server' : 'client';

	    if (!this._deflate) {
	      const key = `${endpoint}_max_window_bits`;
	      const windowBits =
	        typeof this.params[key] !== 'number'
	          ? zlib.Z_DEFAULT_WINDOWBITS
	          : this.params[key];

	      this._deflate = zlib.createDeflateRaw({
	        ...this._options.zlibDeflateOptions,
	        windowBits
	      });

	      this._deflate[kTotalLength] = 0;
	      this._deflate[kBuffers] = [];

	      this._deflate.on('data', deflateOnData);
	    }

	    this._deflate[kCallback] = callback;

	    this._deflate.write(data);
	    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
	      if (!this._deflate) {
	        //
	        // The deflate stream was closed while data was being processed.
	        //
	        return;
	      }

	      let data = bufferUtil.concat(
	        this._deflate[kBuffers],
	        this._deflate[kTotalLength]
	      );

	      if (fin) {
	        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
	      }

	      //
	      // Ensure that the callback will not be called again in
	      // `PerMessageDeflate#cleanup()`.
	      //
	      this._deflate[kCallback] = null;

	      this._deflate[kTotalLength] = 0;
	      this._deflate[kBuffers] = [];

	      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
	        this._deflate.reset();
	      }

	      callback(null, data);
	    });
	  }
	}

	permessageDeflate = PerMessageDeflate;

	/**
	 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
	 *
	 * @param {Buffer} chunk A chunk of data
	 * @private
	 */
	function deflateOnData(chunk) {
	  this[kBuffers].push(chunk);
	  this[kTotalLength] += chunk.length;
	}

	/**
	 * The listener of the `zlib.InflateRaw` stream `'data'` event.
	 *
	 * @param {Buffer} chunk A chunk of data
	 * @private
	 */
	function inflateOnData(chunk) {
	  this[kTotalLength] += chunk.length;

	  if (
	    this[kPerMessageDeflate]._maxPayload < 1 ||
	    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
	  ) {
	    this[kBuffers].push(chunk);
	    return;
	  }

	  this[kError] = new RangeError('Max payload size exceeded');
	  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
	  this[kError][kStatusCode] = 1009;
	  this.removeListener('data', inflateOnData);
	  this.reset();
	}

	/**
	 * The listener of the `zlib.InflateRaw` stream `'error'` event.
	 *
	 * @param {Error} err The emitted error
	 * @private
	 */
	function inflateOnError(err) {
	  //
	  // There is no need to call `Zlib#close()` as the handle is automatically
	  // closed when an error is emitted.
	  //
	  this[kPerMessageDeflate]._inflate = null;
	  err[kStatusCode] = 1007;
	  this[kCallback](err);
	}
	return permessageDeflate;
}

var validation = {exports: {}};

var hasRequiredValidation;

function requireValidation () {
	if (hasRequiredValidation) return validation.exports;
	hasRequiredValidation = 1;

	const { isUtf8 } = require$$0$2;

	//
	// Allowed token characters:
	//
	// '!', '#', '$', '%', '&', ''', '*', '+', '-',
	// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
	//
	// tokenChars[32] === 0 // ' '
	// tokenChars[33] === 1 // '!'
	// tokenChars[34] === 0 // '"'
	// ...
	//
	// prettier-ignore
	const tokenChars = [
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
	  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
	  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
	  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
	];

	/**
	 * Checks if a status code is allowed in a close frame.
	 *
	 * @param {Number} code The status code
	 * @return {Boolean} `true` if the status code is valid, else `false`
	 * @public
	 */
	function isValidStatusCode(code) {
	  return (
	    (code >= 1000 &&
	      code <= 1014 &&
	      code !== 1004 &&
	      code !== 1005 &&
	      code !== 1006) ||
	    (code >= 3000 && code <= 4999)
	  );
	}

	/**
	 * Checks if a given buffer contains only correct UTF-8.
	 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
	 * Markus Kuhn.
	 *
	 * @param {Buffer} buf The buffer to check
	 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
	 * @public
	 */
	function _isValidUTF8(buf) {
	  const len = buf.length;
	  let i = 0;

	  while (i < len) {
	    if ((buf[i] & 0x80) === 0) {
	      // 0xxxxxxx
	      i++;
	    } else if ((buf[i] & 0xe0) === 0xc0) {
	      // 110xxxxx 10xxxxxx
	      if (
	        i + 1 === len ||
	        (buf[i + 1] & 0xc0) !== 0x80 ||
	        (buf[i] & 0xfe) === 0xc0 // Overlong
	      ) {
	        return false;
	      }

	      i += 2;
	    } else if ((buf[i] & 0xf0) === 0xe0) {
	      // 1110xxxx 10xxxxxx 10xxxxxx
	      if (
	        i + 2 >= len ||
	        (buf[i + 1] & 0xc0) !== 0x80 ||
	        (buf[i + 2] & 0xc0) !== 0x80 ||
	        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
	        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
	      ) {
	        return false;
	      }

	      i += 3;
	    } else if ((buf[i] & 0xf8) === 0xf0) {
	      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
	      if (
	        i + 3 >= len ||
	        (buf[i + 1] & 0xc0) !== 0x80 ||
	        (buf[i + 2] & 0xc0) !== 0x80 ||
	        (buf[i + 3] & 0xc0) !== 0x80 ||
	        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
	        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
	        buf[i] > 0xf4 // > U+10FFFF
	      ) {
	        return false;
	      }

	      i += 4;
	    } else {
	      return false;
	    }
	  }

	  return true;
	}

	validation.exports = {
	  isValidStatusCode,
	  isValidUTF8: _isValidUTF8,
	  tokenChars
	};

	if (isUtf8) {
	  validation.exports.isValidUTF8 = function (buf) {
	    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
	  };
	} /* istanbul ignore else  */ else if (!process.env.WS_NO_UTF_8_VALIDATE) {
	  try {
	    const isValidUTF8 = require('utf-8-validate');

	    validation.exports.isValidUTF8 = function (buf) {
	      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
	    };
	  } catch (e) {
	    // Continue regardless of the error.
	  }
	}
	return validation.exports;
}

var receiver;
var hasRequiredReceiver;

function requireReceiver () {
	if (hasRequiredReceiver) return receiver;
	hasRequiredReceiver = 1;

	const { Writable } = require$$0$3;

	const PerMessageDeflate = requirePermessageDeflate();
	const {
	  BINARY_TYPES,
	  EMPTY_BUFFER,
	  kStatusCode,
	  kWebSocket
	} = requireConstants();
	const { concat, toArrayBuffer, unmask } = requireBufferUtil();
	const { isValidStatusCode, isValidUTF8 } = requireValidation();

	const FastBuffer = Buffer[Symbol.species];

	const GET_INFO = 0;
	const GET_PAYLOAD_LENGTH_16 = 1;
	const GET_PAYLOAD_LENGTH_64 = 2;
	const GET_MASK = 3;
	const GET_DATA = 4;
	const INFLATING = 5;
	const DEFER_EVENT = 6;

	/**
	 * HyBi Receiver implementation.
	 *
	 * @extends Writable
	 */
	class Receiver extends Writable {
	  /**
	   * Creates a Receiver instance.
	   *
	   * @param {Object} [options] Options object
	   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
	   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
	   *     multiple times in the same tick
	   * @param {String} [options.binaryType=nodebuffer] The type for binary data
	   * @param {Object} [options.extensions] An object containing the negotiated
	   *     extensions
	   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
	   *     client or server mode
	   * @param {Number} [options.maxPayload=0] The maximum allowed message length
	   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	   *     not to skip UTF-8 validation for text and close messages
	   */
	  constructor(options = {}) {
	    super();

	    this._allowSynchronousEvents =
	      options.allowSynchronousEvents !== undefined
	        ? options.allowSynchronousEvents
	        : true;
	    this._binaryType = options.binaryType || BINARY_TYPES[0];
	    this._extensions = options.extensions || {};
	    this._isServer = !!options.isServer;
	    this._maxPayload = options.maxPayload | 0;
	    this._skipUTF8Validation = !!options.skipUTF8Validation;
	    this[kWebSocket] = undefined;

	    this._bufferedBytes = 0;
	    this._buffers = [];

	    this._compressed = false;
	    this._payloadLength = 0;
	    this._mask = undefined;
	    this._fragmented = 0;
	    this._masked = false;
	    this._fin = false;
	    this._opcode = 0;

	    this._totalPayloadLength = 0;
	    this._messageLength = 0;
	    this._fragments = [];

	    this._errored = false;
	    this._loop = false;
	    this._state = GET_INFO;
	  }

	  /**
	   * Implements `Writable.prototype._write()`.
	   *
	   * @param {Buffer} chunk The chunk of data to write
	   * @param {String} encoding The character encoding of `chunk`
	   * @param {Function} cb Callback
	   * @private
	   */
	  _write(chunk, encoding, cb) {
	    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

	    this._bufferedBytes += chunk.length;
	    this._buffers.push(chunk);
	    this.startLoop(cb);
	  }

	  /**
	   * Consumes `n` bytes from the buffered data.
	   *
	   * @param {Number} n The number of bytes to consume
	   * @return {Buffer} The consumed bytes
	   * @private
	   */
	  consume(n) {
	    this._bufferedBytes -= n;

	    if (n === this._buffers[0].length) return this._buffers.shift();

	    if (n < this._buffers[0].length) {
	      const buf = this._buffers[0];
	      this._buffers[0] = new FastBuffer(
	        buf.buffer,
	        buf.byteOffset + n,
	        buf.length - n
	      );

	      return new FastBuffer(buf.buffer, buf.byteOffset, n);
	    }

	    const dst = Buffer.allocUnsafe(n);

	    do {
	      const buf = this._buffers[0];
	      const offset = dst.length - n;

	      if (n >= buf.length) {
	        dst.set(this._buffers.shift(), offset);
	      } else {
	        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
	        this._buffers[0] = new FastBuffer(
	          buf.buffer,
	          buf.byteOffset + n,
	          buf.length - n
	        );
	      }

	      n -= buf.length;
	    } while (n > 0);

	    return dst;
	  }

	  /**
	   * Starts the parsing loop.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  startLoop(cb) {
	    this._loop = true;

	    do {
	      switch (this._state) {
	        case GET_INFO:
	          this.getInfo(cb);
	          break;
	        case GET_PAYLOAD_LENGTH_16:
	          this.getPayloadLength16(cb);
	          break;
	        case GET_PAYLOAD_LENGTH_64:
	          this.getPayloadLength64(cb);
	          break;
	        case GET_MASK:
	          this.getMask();
	          break;
	        case GET_DATA:
	          this.getData(cb);
	          break;
	        case INFLATING:
	        case DEFER_EVENT:
	          this._loop = false;
	          return;
	      }
	    } while (this._loop);

	    if (!this._errored) cb();
	  }

	  /**
	   * Reads the first two bytes of a frame.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getInfo(cb) {
	    if (this._bufferedBytes < 2) {
	      this._loop = false;
	      return;
	    }

	    const buf = this.consume(2);

	    if ((buf[0] & 0x30) !== 0x00) {
	      const error = this.createError(
	        RangeError,
	        'RSV2 and RSV3 must be clear',
	        true,
	        1002,
	        'WS_ERR_UNEXPECTED_RSV_2_3'
	      );

	      cb(error);
	      return;
	    }

	    const compressed = (buf[0] & 0x40) === 0x40;

	    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
	      const error = this.createError(
	        RangeError,
	        'RSV1 must be clear',
	        true,
	        1002,
	        'WS_ERR_UNEXPECTED_RSV_1'
	      );

	      cb(error);
	      return;
	    }

	    this._fin = (buf[0] & 0x80) === 0x80;
	    this._opcode = buf[0] & 0x0f;
	    this._payloadLength = buf[1] & 0x7f;

	    if (this._opcode === 0x00) {
	      if (compressed) {
	        const error = this.createError(
	          RangeError,
	          'RSV1 must be clear',
	          true,
	          1002,
	          'WS_ERR_UNEXPECTED_RSV_1'
	        );

	        cb(error);
	        return;
	      }

	      if (!this._fragmented) {
	        const error = this.createError(
	          RangeError,
	          'invalid opcode 0',
	          true,
	          1002,
	          'WS_ERR_INVALID_OPCODE'
	        );

	        cb(error);
	        return;
	      }

	      this._opcode = this._fragmented;
	    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
	      if (this._fragmented) {
	        const error = this.createError(
	          RangeError,
	          `invalid opcode ${this._opcode}`,
	          true,
	          1002,
	          'WS_ERR_INVALID_OPCODE'
	        );

	        cb(error);
	        return;
	      }

	      this._compressed = compressed;
	    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
	      if (!this._fin) {
	        const error = this.createError(
	          RangeError,
	          'FIN must be set',
	          true,
	          1002,
	          'WS_ERR_EXPECTED_FIN'
	        );

	        cb(error);
	        return;
	      }

	      if (compressed) {
	        const error = this.createError(
	          RangeError,
	          'RSV1 must be clear',
	          true,
	          1002,
	          'WS_ERR_UNEXPECTED_RSV_1'
	        );

	        cb(error);
	        return;
	      }

	      if (
	        this._payloadLength > 0x7d ||
	        (this._opcode === 0x08 && this._payloadLength === 1)
	      ) {
	        const error = this.createError(
	          RangeError,
	          `invalid payload length ${this._payloadLength}`,
	          true,
	          1002,
	          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
	        );

	        cb(error);
	        return;
	      }
	    } else {
	      const error = this.createError(
	        RangeError,
	        `invalid opcode ${this._opcode}`,
	        true,
	        1002,
	        'WS_ERR_INVALID_OPCODE'
	      );

	      cb(error);
	      return;
	    }

	    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
	    this._masked = (buf[1] & 0x80) === 0x80;

	    if (this._isServer) {
	      if (!this._masked) {
	        const error = this.createError(
	          RangeError,
	          'MASK must be set',
	          true,
	          1002,
	          'WS_ERR_EXPECTED_MASK'
	        );

	        cb(error);
	        return;
	      }
	    } else if (this._masked) {
	      const error = this.createError(
	        RangeError,
	        'MASK must be clear',
	        true,
	        1002,
	        'WS_ERR_UNEXPECTED_MASK'
	      );

	      cb(error);
	      return;
	    }

	    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
	    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
	    else this.haveLength(cb);
	  }

	  /**
	   * Gets extended payload length (7+16).
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getPayloadLength16(cb) {
	    if (this._bufferedBytes < 2) {
	      this._loop = false;
	      return;
	    }

	    this._payloadLength = this.consume(2).readUInt16BE(0);
	    this.haveLength(cb);
	  }

	  /**
	   * Gets extended payload length (7+64).
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getPayloadLength64(cb) {
	    if (this._bufferedBytes < 8) {
	      this._loop = false;
	      return;
	    }

	    const buf = this.consume(8);
	    const num = buf.readUInt32BE(0);

	    //
	    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
	    // if payload length is greater than this number.
	    //
	    if (num > Math.pow(2, 53 - 32) - 1) {
	      const error = this.createError(
	        RangeError,
	        'Unsupported WebSocket frame: payload length > 2^53 - 1',
	        false,
	        1009,
	        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
	      );

	      cb(error);
	      return;
	    }

	    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
	    this.haveLength(cb);
	  }

	  /**
	   * Payload length has been read.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  haveLength(cb) {
	    if (this._payloadLength && this._opcode < 0x08) {
	      this._totalPayloadLength += this._payloadLength;
	      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
	        const error = this.createError(
	          RangeError,
	          'Max payload size exceeded',
	          false,
	          1009,
	          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
	        );

	        cb(error);
	        return;
	      }
	    }

	    if (this._masked) this._state = GET_MASK;
	    else this._state = GET_DATA;
	  }

	  /**
	   * Reads mask bytes.
	   *
	   * @private
	   */
	  getMask() {
	    if (this._bufferedBytes < 4) {
	      this._loop = false;
	      return;
	    }

	    this._mask = this.consume(4);
	    this._state = GET_DATA;
	  }

	  /**
	   * Reads data bytes.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  getData(cb) {
	    let data = EMPTY_BUFFER;

	    if (this._payloadLength) {
	      if (this._bufferedBytes < this._payloadLength) {
	        this._loop = false;
	        return;
	      }

	      data = this.consume(this._payloadLength);

	      if (
	        this._masked &&
	        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
	      ) {
	        unmask(data, this._mask);
	      }
	    }

	    if (this._opcode > 0x07) {
	      this.controlMessage(data, cb);
	      return;
	    }

	    if (this._compressed) {
	      this._state = INFLATING;
	      this.decompress(data, cb);
	      return;
	    }

	    if (data.length) {
	      //
	      // This message is not compressed so its length is the sum of the payload
	      // length of all fragments.
	      //
	      this._messageLength = this._totalPayloadLength;
	      this._fragments.push(data);
	    }

	    this.dataMessage(cb);
	  }

	  /**
	   * Decompresses data.
	   *
	   * @param {Buffer} data Compressed data
	   * @param {Function} cb Callback
	   * @private
	   */
	  decompress(data, cb) {
	    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

	    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
	      if (err) return cb(err);

	      if (buf.length) {
	        this._messageLength += buf.length;
	        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
	          const error = this.createError(
	            RangeError,
	            'Max payload size exceeded',
	            false,
	            1009,
	            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
	          );

	          cb(error);
	          return;
	        }

	        this._fragments.push(buf);
	      }

	      this.dataMessage(cb);
	      if (this._state === GET_INFO) this.startLoop(cb);
	    });
	  }

	  /**
	   * Handles a data message.
	   *
	   * @param {Function} cb Callback
	   * @private
	   */
	  dataMessage(cb) {
	    if (!this._fin) {
	      this._state = GET_INFO;
	      return;
	    }

	    const messageLength = this._messageLength;
	    const fragments = this._fragments;

	    this._totalPayloadLength = 0;
	    this._messageLength = 0;
	    this._fragmented = 0;
	    this._fragments = [];

	    if (this._opcode === 2) {
	      let data;

	      if (this._binaryType === 'nodebuffer') {
	        data = concat(fragments, messageLength);
	      } else if (this._binaryType === 'arraybuffer') {
	        data = toArrayBuffer(concat(fragments, messageLength));
	      } else {
	        data = fragments;
	      }

	      if (this._allowSynchronousEvents) {
	        this.emit('message', data, true);
	        this._state = GET_INFO;
	      } else {
	        this._state = DEFER_EVENT;
	        setImmediate(() => {
	          this.emit('message', data, true);
	          this._state = GET_INFO;
	          this.startLoop(cb);
	        });
	      }
	    } else {
	      const buf = concat(fragments, messageLength);

	      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
	        const error = this.createError(
	          Error,
	          'invalid UTF-8 sequence',
	          true,
	          1007,
	          'WS_ERR_INVALID_UTF8'
	        );

	        cb(error);
	        return;
	      }

	      if (this._state === INFLATING || this._allowSynchronousEvents) {
	        this.emit('message', buf, false);
	        this._state = GET_INFO;
	      } else {
	        this._state = DEFER_EVENT;
	        setImmediate(() => {
	          this.emit('message', buf, false);
	          this._state = GET_INFO;
	          this.startLoop(cb);
	        });
	      }
	    }
	  }

	  /**
	   * Handles a control message.
	   *
	   * @param {Buffer} data Data to handle
	   * @return {(Error|RangeError|undefined)} A possible error
	   * @private
	   */
	  controlMessage(data, cb) {
	    if (this._opcode === 0x08) {
	      if (data.length === 0) {
	        this._loop = false;
	        this.emit('conclude', 1005, EMPTY_BUFFER);
	        this.end();
	      } else {
	        const code = data.readUInt16BE(0);

	        if (!isValidStatusCode(code)) {
	          const error = this.createError(
	            RangeError,
	            `invalid status code ${code}`,
	            true,
	            1002,
	            'WS_ERR_INVALID_CLOSE_CODE'
	          );

	          cb(error);
	          return;
	        }

	        const buf = new FastBuffer(
	          data.buffer,
	          data.byteOffset + 2,
	          data.length - 2
	        );

	        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
	          const error = this.createError(
	            Error,
	            'invalid UTF-8 sequence',
	            true,
	            1007,
	            'WS_ERR_INVALID_UTF8'
	          );

	          cb(error);
	          return;
	        }

	        this._loop = false;
	        this.emit('conclude', code, buf);
	        this.end();
	      }

	      this._state = GET_INFO;
	      return;
	    }

	    if (this._allowSynchronousEvents) {
	      this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
	      this._state = GET_INFO;
	    } else {
	      this._state = DEFER_EVENT;
	      setImmediate(() => {
	        this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
	        this._state = GET_INFO;
	        this.startLoop(cb);
	      });
	    }
	  }

	  /**
	   * Builds an error object.
	   *
	   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
	   * @param {String} message The error message
	   * @param {Boolean} prefix Specifies whether or not to add a default prefix to
	   *     `message`
	   * @param {Number} statusCode The status code
	   * @param {String} errorCode The exposed error code
	   * @return {(Error|RangeError)} The error
	   * @private
	   */
	  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
	    this._loop = false;
	    this._errored = true;

	    const err = new ErrorCtor(
	      prefix ? `Invalid WebSocket frame: ${message}` : message
	    );

	    Error.captureStackTrace(err, this.createError);
	    err.code = errorCode;
	    err[kStatusCode] = statusCode;
	    return err;
	  }
	}

	receiver = Receiver;
	return receiver;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex" }] */

var sender;
var hasRequiredSender;

function requireSender () {
	if (hasRequiredSender) return sender;
	hasRequiredSender = 1;
	const { randomFillSync } = require$$0$4;

	const PerMessageDeflate = requirePermessageDeflate();
	const { EMPTY_BUFFER } = requireConstants();
	const { isValidStatusCode } = requireValidation();
	const { mask: applyMask, toBuffer } = requireBufferUtil();

	const kByteLength = Symbol('kByteLength');
	const maskBuffer = Buffer.alloc(4);

	/**
	 * HyBi Sender implementation.
	 */
	class Sender {
	  /**
	   * Creates a Sender instance.
	   *
	   * @param {Duplex} socket The connection socket
	   * @param {Object} [extensions] An object containing the negotiated extensions
	   * @param {Function} [generateMask] The function used to generate the masking
	   *     key
	   */
	  constructor(socket, extensions, generateMask) {
	    this._extensions = extensions || {};

	    if (generateMask) {
	      this._generateMask = generateMask;
	      this._maskBuffer = Buffer.alloc(4);
	    }

	    this._socket = socket;

	    this._firstFragment = true;
	    this._compress = false;

	    this._bufferedBytes = 0;
	    this._deflating = false;
	    this._queue = [];
	  }

	  /**
	   * Frames a piece of data according to the HyBi WebSocket protocol.
	   *
	   * @param {(Buffer|String)} data The data to frame
	   * @param {Object} options Options object
	   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
	   *     FIN bit
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
	   *     key
	   * @param {Number} options.opcode The opcode
	   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
	   *     modified
	   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
	   *     RSV1 bit
	   * @return {(Buffer|String)[]} The framed data
	   * @public
	   */
	  static frame(data, options) {
	    let mask;
	    let merge = false;
	    let offset = 2;
	    let skipMasking = false;

	    if (options.mask) {
	      mask = options.maskBuffer || maskBuffer;

	      if (options.generateMask) {
	        options.generateMask(mask);
	      } else {
	        randomFillSync(mask, 0, 4);
	      }

	      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
	      offset = 6;
	    }

	    let dataLength;

	    if (typeof data === 'string') {
	      if (
	        (!options.mask || skipMasking) &&
	        options[kByteLength] !== undefined
	      ) {
	        dataLength = options[kByteLength];
	      } else {
	        data = Buffer.from(data);
	        dataLength = data.length;
	      }
	    } else {
	      dataLength = data.length;
	      merge = options.mask && options.readOnly && !skipMasking;
	    }

	    let payloadLength = dataLength;

	    if (dataLength >= 65536) {
	      offset += 8;
	      payloadLength = 127;
	    } else if (dataLength > 125) {
	      offset += 2;
	      payloadLength = 126;
	    }

	    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);

	    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
	    if (options.rsv1) target[0] |= 0x40;

	    target[1] = payloadLength;

	    if (payloadLength === 126) {
	      target.writeUInt16BE(dataLength, 2);
	    } else if (payloadLength === 127) {
	      target[2] = target[3] = 0;
	      target.writeUIntBE(dataLength, 4, 6);
	    }

	    if (!options.mask) return [target, data];

	    target[1] |= 0x80;
	    target[offset - 4] = mask[0];
	    target[offset - 3] = mask[1];
	    target[offset - 2] = mask[2];
	    target[offset - 1] = mask[3];

	    if (skipMasking) return [target, data];

	    if (merge) {
	      applyMask(data, mask, target, offset, dataLength);
	      return [target];
	    }

	    applyMask(data, mask, data, 0, dataLength);
	    return [target, data];
	  }

	  /**
	   * Sends a close message to the other peer.
	   *
	   * @param {Number} [code] The status code component of the body
	   * @param {(String|Buffer)} [data] The message component of the body
	   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  close(code, data, mask, cb) {
	    let buf;

	    if (code === undefined) {
	      buf = EMPTY_BUFFER;
	    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
	      throw new TypeError('First argument must be a valid error code number');
	    } else if (data === undefined || !data.length) {
	      buf = Buffer.allocUnsafe(2);
	      buf.writeUInt16BE(code, 0);
	    } else {
	      const length = Buffer.byteLength(data);

	      if (length > 123) {
	        throw new RangeError('The message must not be greater than 123 bytes');
	      }

	      buf = Buffer.allocUnsafe(2 + length);
	      buf.writeUInt16BE(code, 0);

	      if (typeof data === 'string') {
	        buf.write(data, 2);
	      } else {
	        buf.set(data, 2);
	      }
	    }

	    const options = {
	      [kByteLength]: buf.length,
	      fin: true,
	      generateMask: this._generateMask,
	      mask,
	      maskBuffer: this._maskBuffer,
	      opcode: 0x08,
	      readOnly: false,
	      rsv1: false
	    };

	    if (this._deflating) {
	      this.enqueue([this.dispatch, buf, false, options, cb]);
	    } else {
	      this.sendFrame(Sender.frame(buf, options), cb);
	    }
	  }

	  /**
	   * Sends a ping message to the other peer.
	   *
	   * @param {*} data The message to send
	   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  ping(data, mask, cb) {
	    let byteLength;
	    let readOnly;

	    if (typeof data === 'string') {
	      byteLength = Buffer.byteLength(data);
	      readOnly = false;
	    } else {
	      data = toBuffer(data);
	      byteLength = data.length;
	      readOnly = toBuffer.readOnly;
	    }

	    if (byteLength > 125) {
	      throw new RangeError('The data size must not be greater than 125 bytes');
	    }

	    const options = {
	      [kByteLength]: byteLength,
	      fin: true,
	      generateMask: this._generateMask,
	      mask,
	      maskBuffer: this._maskBuffer,
	      opcode: 0x09,
	      readOnly,
	      rsv1: false
	    };

	    if (this._deflating) {
	      this.enqueue([this.dispatch, data, false, options, cb]);
	    } else {
	      this.sendFrame(Sender.frame(data, options), cb);
	    }
	  }

	  /**
	   * Sends a pong message to the other peer.
	   *
	   * @param {*} data The message to send
	   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  pong(data, mask, cb) {
	    let byteLength;
	    let readOnly;

	    if (typeof data === 'string') {
	      byteLength = Buffer.byteLength(data);
	      readOnly = false;
	    } else {
	      data = toBuffer(data);
	      byteLength = data.length;
	      readOnly = toBuffer.readOnly;
	    }

	    if (byteLength > 125) {
	      throw new RangeError('The data size must not be greater than 125 bytes');
	    }

	    const options = {
	      [kByteLength]: byteLength,
	      fin: true,
	      generateMask: this._generateMask,
	      mask,
	      maskBuffer: this._maskBuffer,
	      opcode: 0x0a,
	      readOnly,
	      rsv1: false
	    };

	    if (this._deflating) {
	      this.enqueue([this.dispatch, data, false, options, cb]);
	    } else {
	      this.sendFrame(Sender.frame(data, options), cb);
	    }
	  }

	  /**
	   * Sends a data message to the other peer.
	   *
	   * @param {*} data The message to send
	   * @param {Object} options Options object
	   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
	   *     or text
	   * @param {Boolean} [options.compress=false] Specifies whether or not to
	   *     compress `data`
	   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
	   *     last one
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Function} [cb] Callback
	   * @public
	   */
	  send(data, options, cb) {
	    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
	    let opcode = options.binary ? 2 : 1;
	    let rsv1 = options.compress;

	    let byteLength;
	    let readOnly;

	    if (typeof data === 'string') {
	      byteLength = Buffer.byteLength(data);
	      readOnly = false;
	    } else {
	      data = toBuffer(data);
	      byteLength = data.length;
	      readOnly = toBuffer.readOnly;
	    }

	    if (this._firstFragment) {
	      this._firstFragment = false;
	      if (
	        rsv1 &&
	        perMessageDeflate &&
	        perMessageDeflate.params[
	          perMessageDeflate._isServer
	            ? 'server_no_context_takeover'
	            : 'client_no_context_takeover'
	        ]
	      ) {
	        rsv1 = byteLength >= perMessageDeflate._threshold;
	      }
	      this._compress = rsv1;
	    } else {
	      rsv1 = false;
	      opcode = 0;
	    }

	    if (options.fin) this._firstFragment = true;

	    if (perMessageDeflate) {
	      const opts = {
	        [kByteLength]: byteLength,
	        fin: options.fin,
	        generateMask: this._generateMask,
	        mask: options.mask,
	        maskBuffer: this._maskBuffer,
	        opcode,
	        readOnly,
	        rsv1
	      };

	      if (this._deflating) {
	        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
	      } else {
	        this.dispatch(data, this._compress, opts, cb);
	      }
	    } else {
	      this.sendFrame(
	        Sender.frame(data, {
	          [kByteLength]: byteLength,
	          fin: options.fin,
	          generateMask: this._generateMask,
	          mask: options.mask,
	          maskBuffer: this._maskBuffer,
	          opcode,
	          readOnly,
	          rsv1: false
	        }),
	        cb
	      );
	    }
	  }

	  /**
	   * Dispatches a message.
	   *
	   * @param {(Buffer|String)} data The message to send
	   * @param {Boolean} [compress=false] Specifies whether or not to compress
	   *     `data`
	   * @param {Object} options Options object
	   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
	   *     FIN bit
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
	   *     `data`
	   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
	   *     key
	   * @param {Number} options.opcode The opcode
	   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
	   *     modified
	   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
	   *     RSV1 bit
	   * @param {Function} [cb] Callback
	   * @private
	   */
	  dispatch(data, compress, options, cb) {
	    if (!compress) {
	      this.sendFrame(Sender.frame(data, options), cb);
	      return;
	    }

	    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

	    this._bufferedBytes += options[kByteLength];
	    this._deflating = true;
	    perMessageDeflate.compress(data, options.fin, (_, buf) => {
	      if (this._socket.destroyed) {
	        const err = new Error(
	          'The socket was closed while data was being compressed'
	        );

	        if (typeof cb === 'function') cb(err);

	        for (let i = 0; i < this._queue.length; i++) {
	          const params = this._queue[i];
	          const callback = params[params.length - 1];

	          if (typeof callback === 'function') callback(err);
	        }

	        return;
	      }

	      this._bufferedBytes -= options[kByteLength];
	      this._deflating = false;
	      options.readOnly = false;
	      this.sendFrame(Sender.frame(buf, options), cb);
	      this.dequeue();
	    });
	  }

	  /**
	   * Executes queued send operations.
	   *
	   * @private
	   */
	  dequeue() {
	    while (!this._deflating && this._queue.length) {
	      const params = this._queue.shift();

	      this._bufferedBytes -= params[3][kByteLength];
	      Reflect.apply(params[0], this, params.slice(1));
	    }
	  }

	  /**
	   * Enqueues a send operation.
	   *
	   * @param {Array} params Send operation parameters.
	   * @private
	   */
	  enqueue(params) {
	    this._bufferedBytes += params[3][kByteLength];
	    this._queue.push(params);
	  }

	  /**
	   * Sends a frame.
	   *
	   * @param {Buffer[]} list The frame to send
	   * @param {Function} [cb] Callback
	   * @private
	   */
	  sendFrame(list, cb) {
	    if (list.length === 2) {
	      this._socket.cork();
	      this._socket.write(list[0]);
	      this._socket.write(list[1], cb);
	      this._socket.uncork();
	    } else {
	      this._socket.write(list[0], cb);
	    }
	  }
	}

	sender = Sender;
	return sender;
}

var eventTarget;
var hasRequiredEventTarget;

function requireEventTarget () {
	if (hasRequiredEventTarget) return eventTarget;
	hasRequiredEventTarget = 1;

	const { kForOnEventAttribute, kListener } = requireConstants();

	const kCode = Symbol('kCode');
	const kData = Symbol('kData');
	const kError = Symbol('kError');
	const kMessage = Symbol('kMessage');
	const kReason = Symbol('kReason');
	const kTarget = Symbol('kTarget');
	const kType = Symbol('kType');
	const kWasClean = Symbol('kWasClean');

	/**
	 * Class representing an event.
	 */
	class Event {
	  /**
	   * Create a new `Event`.
	   *
	   * @param {String} type The name of the event
	   * @throws {TypeError} If the `type` argument is not specified
	   */
	  constructor(type) {
	    this[kTarget] = null;
	    this[kType] = type;
	  }

	  /**
	   * @type {*}
	   */
	  get target() {
	    return this[kTarget];
	  }

	  /**
	   * @type {String}
	   */
	  get type() {
	    return this[kType];
	  }
	}

	Object.defineProperty(Event.prototype, 'target', { enumerable: true });
	Object.defineProperty(Event.prototype, 'type', { enumerable: true });

	/**
	 * Class representing a close event.
	 *
	 * @extends Event
	 */
	class CloseEvent extends Event {
	  /**
	   * Create a new `CloseEvent`.
	   *
	   * @param {String} type The name of the event
	   * @param {Object} [options] A dictionary object that allows for setting
	   *     attributes via object members of the same name
	   * @param {Number} [options.code=0] The status code explaining why the
	   *     connection was closed
	   * @param {String} [options.reason=''] A human-readable string explaining why
	   *     the connection was closed
	   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
	   *     connection was cleanly closed
	   */
	  constructor(type, options = {}) {
	    super(type);

	    this[kCode] = options.code === undefined ? 0 : options.code;
	    this[kReason] = options.reason === undefined ? '' : options.reason;
	    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
	  }

	  /**
	   * @type {Number}
	   */
	  get code() {
	    return this[kCode];
	  }

	  /**
	   * @type {String}
	   */
	  get reason() {
	    return this[kReason];
	  }

	  /**
	   * @type {Boolean}
	   */
	  get wasClean() {
	    return this[kWasClean];
	  }
	}

	Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

	/**
	 * Class representing an error event.
	 *
	 * @extends Event
	 */
	class ErrorEvent extends Event {
	  /**
	   * Create a new `ErrorEvent`.
	   *
	   * @param {String} type The name of the event
	   * @param {Object} [options] A dictionary object that allows for setting
	   *     attributes via object members of the same name
	   * @param {*} [options.error=null] The error that generated this event
	   * @param {String} [options.message=''] The error message
	   */
	  constructor(type, options = {}) {
	    super(type);

	    this[kError] = options.error === undefined ? null : options.error;
	    this[kMessage] = options.message === undefined ? '' : options.message;
	  }

	  /**
	   * @type {*}
	   */
	  get error() {
	    return this[kError];
	  }

	  /**
	   * @type {String}
	   */
	  get message() {
	    return this[kMessage];
	  }
	}

	Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
	Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

	/**
	 * Class representing a message event.
	 *
	 * @extends Event
	 */
	class MessageEvent extends Event {
	  /**
	   * Create a new `MessageEvent`.
	   *
	   * @param {String} type The name of the event
	   * @param {Object} [options] A dictionary object that allows for setting
	   *     attributes via object members of the same name
	   * @param {*} [options.data=null] The message content
	   */
	  constructor(type, options = {}) {
	    super(type);

	    this[kData] = options.data === undefined ? null : options.data;
	  }

	  /**
	   * @type {*}
	   */
	  get data() {
	    return this[kData];
	  }
	}

	Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

	/**
	 * This provides methods for emulating the `EventTarget` interface. It's not
	 * meant to be used directly.
	 *
	 * @mixin
	 */
	const EventTarget = {
	  /**
	   * Register an event listener.
	   *
	   * @param {String} type A string representing the event type to listen for
	   * @param {(Function|Object)} handler The listener to add
	   * @param {Object} [options] An options object specifies characteristics about
	   *     the event listener
	   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
	   *     listener should be invoked at most once after being added. If `true`,
	   *     the listener would be automatically removed when invoked.
	   * @public
	   */
	  addEventListener(type, handler, options = {}) {
	    for (const listener of this.listeners(type)) {
	      if (
	        !options[kForOnEventAttribute] &&
	        listener[kListener] === handler &&
	        !listener[kForOnEventAttribute]
	      ) {
	        return;
	      }
	    }

	    let wrapper;

	    if (type === 'message') {
	      wrapper = function onMessage(data, isBinary) {
	        const event = new MessageEvent('message', {
	          data: isBinary ? data : data.toString()
	        });

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else if (type === 'close') {
	      wrapper = function onClose(code, message) {
	        const event = new CloseEvent('close', {
	          code,
	          reason: message.toString(),
	          wasClean: this._closeFrameReceived && this._closeFrameSent
	        });

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else if (type === 'error') {
	      wrapper = function onError(error) {
	        const event = new ErrorEvent('error', {
	          error,
	          message: error.message
	        });

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else if (type === 'open') {
	      wrapper = function onOpen() {
	        const event = new Event('open');

	        event[kTarget] = this;
	        callListener(handler, this, event);
	      };
	    } else {
	      return;
	    }

	    wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
	    wrapper[kListener] = handler;

	    if (options.once) {
	      this.once(type, wrapper);
	    } else {
	      this.on(type, wrapper);
	    }
	  },

	  /**
	   * Remove an event listener.
	   *
	   * @param {String} type A string representing the event type to remove
	   * @param {(Function|Object)} handler The listener to remove
	   * @public
	   */
	  removeEventListener(type, handler) {
	    for (const listener of this.listeners(type)) {
	      if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
	        this.removeListener(type, listener);
	        break;
	      }
	    }
	  }
	};

	eventTarget = {
	  CloseEvent,
	  ErrorEvent,
	  Event,
	  EventTarget,
	  MessageEvent
	};

	/**
	 * Call an event listener
	 *
	 * @param {(Function|Object)} listener The listener to call
	 * @param {*} thisArg The value to use as `this`` when calling the listener
	 * @param {Event} event The event to pass to the listener
	 * @private
	 */
	function callListener(listener, thisArg, event) {
	  if (typeof listener === 'object' && listener.handleEvent) {
	    listener.handleEvent.call(listener, event);
	  } else {
	    listener.call(thisArg, event);
	  }
	}
	return eventTarget;
}

var extension;
var hasRequiredExtension;

function requireExtension () {
	if (hasRequiredExtension) return extension;
	hasRequiredExtension = 1;

	const { tokenChars } = requireValidation();

	/**
	 * Adds an offer to the map of extension offers or a parameter to the map of
	 * parameters.
	 *
	 * @param {Object} dest The map of extension offers or parameters
	 * @param {String} name The extension or parameter name
	 * @param {(Object|Boolean|String)} elem The extension parameters or the
	 *     parameter value
	 * @private
	 */
	function push(dest, name, elem) {
	  if (dest[name] === undefined) dest[name] = [elem];
	  else dest[name].push(elem);
	}

	/**
	 * Parses the `Sec-WebSocket-Extensions` header into an object.
	 *
	 * @param {String} header The field value of the header
	 * @return {Object} The parsed object
	 * @public
	 */
	function parse(header) {
	  const offers = Object.create(null);
	  let params = Object.create(null);
	  let mustUnescape = false;
	  let isEscaping = false;
	  let inQuotes = false;
	  let extensionName;
	  let paramName;
	  let start = -1;
	  let code = -1;
	  let end = -1;
	  let i = 0;

	  for (; i < header.length; i++) {
	    code = header.charCodeAt(i);

	    if (extensionName === undefined) {
	      if (end === -1 && tokenChars[code] === 1) {
	        if (start === -1) start = i;
	      } else if (
	        i !== 0 &&
	        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
	      ) {
	        if (end === -1 && start !== -1) end = i;
	      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
	        if (start === -1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }

	        if (end === -1) end = i;
	        const name = header.slice(start, end);
	        if (code === 0x2c) {
	          push(offers, name, params);
	          params = Object.create(null);
	        } else {
	          extensionName = name;
	        }

	        start = end = -1;
	      } else {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }
	    } else if (paramName === undefined) {
	      if (end === -1 && tokenChars[code] === 1) {
	        if (start === -1) start = i;
	      } else if (code === 0x20 || code === 0x09) {
	        if (end === -1 && start !== -1) end = i;
	      } else if (code === 0x3b || code === 0x2c) {
	        if (start === -1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }

	        if (end === -1) end = i;
	        push(params, header.slice(start, end), true);
	        if (code === 0x2c) {
	          push(offers, extensionName, params);
	          params = Object.create(null);
	          extensionName = undefined;
	        }

	        start = end = -1;
	      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
	        paramName = header.slice(start, i);
	        start = end = -1;
	      } else {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }
	    } else {
	      //
	      // The value of a quoted-string after unescaping must conform to the
	      // token ABNF, so only token characters are valid.
	      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
	      //
	      if (isEscaping) {
	        if (tokenChars[code] !== 1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }
	        if (start === -1) start = i;
	        else if (!mustUnescape) mustUnescape = true;
	        isEscaping = false;
	      } else if (inQuotes) {
	        if (tokenChars[code] === 1) {
	          if (start === -1) start = i;
	        } else if (code === 0x22 /* '"' */ && start !== -1) {
	          inQuotes = false;
	          end = i;
	        } else if (code === 0x5c /* '\' */) {
	          isEscaping = true;
	        } else {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }
	      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
	        inQuotes = true;
	      } else if (end === -1 && tokenChars[code] === 1) {
	        if (start === -1) start = i;
	      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
	        if (end === -1) end = i;
	      } else if (code === 0x3b || code === 0x2c) {
	        if (start === -1) {
	          throw new SyntaxError(`Unexpected character at index ${i}`);
	        }

	        if (end === -1) end = i;
	        let value = header.slice(start, end);
	        if (mustUnescape) {
	          value = value.replace(/\\/g, '');
	          mustUnescape = false;
	        }
	        push(params, paramName, value);
	        if (code === 0x2c) {
	          push(offers, extensionName, params);
	          params = Object.create(null);
	          extensionName = undefined;
	        }

	        paramName = undefined;
	        start = end = -1;
	      } else {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }
	    }
	  }

	  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
	    throw new SyntaxError('Unexpected end of input');
	  }

	  if (end === -1) end = i;
	  const token = header.slice(start, end);
	  if (extensionName === undefined) {
	    push(offers, token, params);
	  } else {
	    if (paramName === undefined) {
	      push(params, token, true);
	    } else if (mustUnescape) {
	      push(params, paramName, token.replace(/\\/g, ''));
	    } else {
	      push(params, paramName, token);
	    }
	    push(offers, extensionName, params);
	  }

	  return offers;
	}

	/**
	 * Builds the `Sec-WebSocket-Extensions` header field value.
	 *
	 * @param {Object} extensions The map of extensions and parameters to format
	 * @return {String} A string representing the given object
	 * @public
	 */
	function format(extensions) {
	  return Object.keys(extensions)
	    .map((extension) => {
	      let configurations = extensions[extension];
	      if (!Array.isArray(configurations)) configurations = [configurations];
	      return configurations
	        .map((params) => {
	          return [extension]
	            .concat(
	              Object.keys(params).map((k) => {
	                let values = params[k];
	                if (!Array.isArray(values)) values = [values];
	                return values
	                  .map((v) => (v === true ? k : `${k}=${v}`))
	                  .join('; ');
	              })
	            )
	            .join('; ');
	        })
	        .join(', ');
	    })
	    .join(', ');
	}

	extension = { format, parse };
	return extension;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex|Readable$", "caughtErrors": "none" }] */

var websocket;
var hasRequiredWebsocket;

function requireWebsocket () {
	if (hasRequiredWebsocket) return websocket;
	hasRequiredWebsocket = 1;

	const EventEmitter = require$$0$5;
	const https = require$$1;
	const http = require$$2$1;
	const net = require$$3;
	const tls = require$$4;
	const { randomBytes, createHash } = require$$0$4;
	const { URL } = require$$7;

	const PerMessageDeflate = requirePermessageDeflate();
	const Receiver = requireReceiver();
	const Sender = requireSender();
	const {
	  BINARY_TYPES,
	  EMPTY_BUFFER,
	  GUID,
	  kForOnEventAttribute,
	  kListener,
	  kStatusCode,
	  kWebSocket,
	  NOOP
	} = requireConstants();
	const {
	  EventTarget: { addEventListener, removeEventListener }
	} = requireEventTarget();
	const { format, parse } = requireExtension();
	const { toBuffer } = requireBufferUtil();

	const closeTimeout = 30 * 1000;
	const kAborted = Symbol('kAborted');
	const protocolVersions = [8, 13];
	const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
	const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

	/**
	 * Class representing a WebSocket.
	 *
	 * @extends EventEmitter
	 */
	class WebSocket extends EventEmitter {
	  /**
	   * Create a new `WebSocket`.
	   *
	   * @param {(String|URL)} address The URL to which to connect
	   * @param {(String|String[])} [protocols] The subprotocols
	   * @param {Object} [options] Connection options
	   */
	  constructor(address, protocols, options) {
	    super();

	    this._binaryType = BINARY_TYPES[0];
	    this._closeCode = 1006;
	    this._closeFrameReceived = false;
	    this._closeFrameSent = false;
	    this._closeMessage = EMPTY_BUFFER;
	    this._closeTimer = null;
	    this._extensions = {};
	    this._paused = false;
	    this._protocol = '';
	    this._readyState = WebSocket.CONNECTING;
	    this._receiver = null;
	    this._sender = null;
	    this._socket = null;

	    if (address !== null) {
	      this._bufferedAmount = 0;
	      this._isServer = false;
	      this._redirects = 0;

	      if (protocols === undefined) {
	        protocols = [];
	      } else if (!Array.isArray(protocols)) {
	        if (typeof protocols === 'object' && protocols !== null) {
	          options = protocols;
	          protocols = [];
	        } else {
	          protocols = [protocols];
	        }
	      }

	      initAsClient(this, address, protocols, options);
	    } else {
	      this._autoPong = options.autoPong;
	      this._isServer = true;
	    }
	  }

	  /**
	   * This deviates from the WHATWG interface since ws doesn't support the
	   * required default "blob" type (instead we define a custom "nodebuffer"
	   * type).
	   *
	   * @type {String}
	   */
	  get binaryType() {
	    return this._binaryType;
	  }

	  set binaryType(type) {
	    if (!BINARY_TYPES.includes(type)) return;

	    this._binaryType = type;

	    //
	    // Allow to change `binaryType` on the fly.
	    //
	    if (this._receiver) this._receiver._binaryType = type;
	  }

	  /**
	   * @type {Number}
	   */
	  get bufferedAmount() {
	    if (!this._socket) return this._bufferedAmount;

	    return this._socket._writableState.length + this._sender._bufferedBytes;
	  }

	  /**
	   * @type {String}
	   */
	  get extensions() {
	    return Object.keys(this._extensions).join();
	  }

	  /**
	   * @type {Boolean}
	   */
	  get isPaused() {
	    return this._paused;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onclose() {
	    return null;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onerror() {
	    return null;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onopen() {
	    return null;
	  }

	  /**
	   * @type {Function}
	   */
	  /* istanbul ignore next */
	  get onmessage() {
	    return null;
	  }

	  /**
	   * @type {String}
	   */
	  get protocol() {
	    return this._protocol;
	  }

	  /**
	   * @type {Number}
	   */
	  get readyState() {
	    return this._readyState;
	  }

	  /**
	   * @type {String}
	   */
	  get url() {
	    return this._url;
	  }

	  /**
	   * Set up the socket and the internal resources.
	   *
	   * @param {Duplex} socket The network socket between the server and client
	   * @param {Buffer} head The first packet of the upgraded stream
	   * @param {Object} options Options object
	   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
	   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
	   *     multiple times in the same tick
	   * @param {Function} [options.generateMask] The function used to generate the
	   *     masking key
	   * @param {Number} [options.maxPayload=0] The maximum allowed message size
	   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	   *     not to skip UTF-8 validation for text and close messages
	   * @private
	   */
	  setSocket(socket, head, options) {
	    const receiver = new Receiver({
	      allowSynchronousEvents: options.allowSynchronousEvents,
	      binaryType: this.binaryType,
	      extensions: this._extensions,
	      isServer: this._isServer,
	      maxPayload: options.maxPayload,
	      skipUTF8Validation: options.skipUTF8Validation
	    });

	    this._sender = new Sender(socket, this._extensions, options.generateMask);
	    this._receiver = receiver;
	    this._socket = socket;

	    receiver[kWebSocket] = this;
	    socket[kWebSocket] = this;

	    receiver.on('conclude', receiverOnConclude);
	    receiver.on('drain', receiverOnDrain);
	    receiver.on('error', receiverOnError);
	    receiver.on('message', receiverOnMessage);
	    receiver.on('ping', receiverOnPing);
	    receiver.on('pong', receiverOnPong);

	    //
	    // These methods may not be available if `socket` is just a `Duplex`.
	    //
	    if (socket.setTimeout) socket.setTimeout(0);
	    if (socket.setNoDelay) socket.setNoDelay();

	    if (head.length > 0) socket.unshift(head);

	    socket.on('close', socketOnClose);
	    socket.on('data', socketOnData);
	    socket.on('end', socketOnEnd);
	    socket.on('error', socketOnError);

	    this._readyState = WebSocket.OPEN;
	    this.emit('open');
	  }

	  /**
	   * Emit the `'close'` event.
	   *
	   * @private
	   */
	  emitClose() {
	    if (!this._socket) {
	      this._readyState = WebSocket.CLOSED;
	      this.emit('close', this._closeCode, this._closeMessage);
	      return;
	    }

	    if (this._extensions[PerMessageDeflate.extensionName]) {
	      this._extensions[PerMessageDeflate.extensionName].cleanup();
	    }

	    this._receiver.removeAllListeners();
	    this._readyState = WebSocket.CLOSED;
	    this.emit('close', this._closeCode, this._closeMessage);
	  }

	  /**
	   * Start a closing handshake.
	   *
	   *          +----------+   +-----------+   +----------+
	   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
	   *    |     +----------+   +-----------+   +----------+     |
	   *          +----------+   +-----------+         |
	   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
	   *          +----------+   +-----------+   |
	   *    |           |                        |   +---+        |
	   *                +------------------------+-->|fin| - - - -
	   *    |         +---+                      |   +---+
	   *     - - - - -|fin|<---------------------+
	   *              +---+
	   *
	   * @param {Number} [code] Status code explaining why the connection is closing
	   * @param {(String|Buffer)} [data] The reason why the connection is
	   *     closing
	   * @public
	   */
	  close(code, data) {
	    if (this.readyState === WebSocket.CLOSED) return;
	    if (this.readyState === WebSocket.CONNECTING) {
	      const msg = 'WebSocket was closed before the connection was established';
	      abortHandshake(this, this._req, msg);
	      return;
	    }

	    if (this.readyState === WebSocket.CLOSING) {
	      if (
	        this._closeFrameSent &&
	        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
	      ) {
	        this._socket.end();
	      }

	      return;
	    }

	    this._readyState = WebSocket.CLOSING;
	    this._sender.close(code, data, !this._isServer, (err) => {
	      //
	      // This error is handled by the `'error'` listener on the socket. We only
	      // want to know if the close frame has been sent here.
	      //
	      if (err) return;

	      this._closeFrameSent = true;

	      if (
	        this._closeFrameReceived ||
	        this._receiver._writableState.errorEmitted
	      ) {
	        this._socket.end();
	      }
	    });

	    //
	    // Specify a timeout for the closing handshake to complete.
	    //
	    this._closeTimer = setTimeout(
	      this._socket.destroy.bind(this._socket),
	      closeTimeout
	    );
	  }

	  /**
	   * Pause the socket.
	   *
	   * @public
	   */
	  pause() {
	    if (
	      this.readyState === WebSocket.CONNECTING ||
	      this.readyState === WebSocket.CLOSED
	    ) {
	      return;
	    }

	    this._paused = true;
	    this._socket.pause();
	  }

	  /**
	   * Send a ping.
	   *
	   * @param {*} [data] The data to send
	   * @param {Boolean} [mask] Indicates whether or not to mask `data`
	   * @param {Function} [cb] Callback which is executed when the ping is sent
	   * @public
	   */
	  ping(data, mask, cb) {
	    if (this.readyState === WebSocket.CONNECTING) {
	      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
	    }

	    if (typeof data === 'function') {
	      cb = data;
	      data = mask = undefined;
	    } else if (typeof mask === 'function') {
	      cb = mask;
	      mask = undefined;
	    }

	    if (typeof data === 'number') data = data.toString();

	    if (this.readyState !== WebSocket.OPEN) {
	      sendAfterClose(this, data, cb);
	      return;
	    }

	    if (mask === undefined) mask = !this._isServer;
	    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
	  }

	  /**
	   * Send a pong.
	   *
	   * @param {*} [data] The data to send
	   * @param {Boolean} [mask] Indicates whether or not to mask `data`
	   * @param {Function} [cb] Callback which is executed when the pong is sent
	   * @public
	   */
	  pong(data, mask, cb) {
	    if (this.readyState === WebSocket.CONNECTING) {
	      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
	    }

	    if (typeof data === 'function') {
	      cb = data;
	      data = mask = undefined;
	    } else if (typeof mask === 'function') {
	      cb = mask;
	      mask = undefined;
	    }

	    if (typeof data === 'number') data = data.toString();

	    if (this.readyState !== WebSocket.OPEN) {
	      sendAfterClose(this, data, cb);
	      return;
	    }

	    if (mask === undefined) mask = !this._isServer;
	    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
	  }

	  /**
	   * Resume the socket.
	   *
	   * @public
	   */
	  resume() {
	    if (
	      this.readyState === WebSocket.CONNECTING ||
	      this.readyState === WebSocket.CLOSED
	    ) {
	      return;
	    }

	    this._paused = false;
	    if (!this._receiver._writableState.needDrain) this._socket.resume();
	  }

	  /**
	   * Send a data message.
	   *
	   * @param {*} data The message to send
	   * @param {Object} [options] Options object
	   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
	   *     text
	   * @param {Boolean} [options.compress] Specifies whether or not to compress
	   *     `data`
	   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
	   *     last one
	   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
	   * @param {Function} [cb] Callback which is executed when data is written out
	   * @public
	   */
	  send(data, options, cb) {
	    if (this.readyState === WebSocket.CONNECTING) {
	      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
	    }

	    if (typeof options === 'function') {
	      cb = options;
	      options = {};
	    }

	    if (typeof data === 'number') data = data.toString();

	    if (this.readyState !== WebSocket.OPEN) {
	      sendAfterClose(this, data, cb);
	      return;
	    }

	    const opts = {
	      binary: typeof data !== 'string',
	      mask: !this._isServer,
	      compress: true,
	      fin: true,
	      ...options
	    };

	    if (!this._extensions[PerMessageDeflate.extensionName]) {
	      opts.compress = false;
	    }

	    this._sender.send(data || EMPTY_BUFFER, opts, cb);
	  }

	  /**
	   * Forcibly close the connection.
	   *
	   * @public
	   */
	  terminate() {
	    if (this.readyState === WebSocket.CLOSED) return;
	    if (this.readyState === WebSocket.CONNECTING) {
	      const msg = 'WebSocket was closed before the connection was established';
	      abortHandshake(this, this._req, msg);
	      return;
	    }

	    if (this._socket) {
	      this._readyState = WebSocket.CLOSING;
	      this._socket.destroy();
	    }
	  }
	}

	/**
	 * @constant {Number} CONNECTING
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'CONNECTING', {
	  enumerable: true,
	  value: readyStates.indexOf('CONNECTING')
	});

	/**
	 * @constant {Number} CONNECTING
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
	  enumerable: true,
	  value: readyStates.indexOf('CONNECTING')
	});

	/**
	 * @constant {Number} OPEN
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'OPEN', {
	  enumerable: true,
	  value: readyStates.indexOf('OPEN')
	});

	/**
	 * @constant {Number} OPEN
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'OPEN', {
	  enumerable: true,
	  value: readyStates.indexOf('OPEN')
	});

	/**
	 * @constant {Number} CLOSING
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'CLOSING', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSING')
	});

	/**
	 * @constant {Number} CLOSING
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'CLOSING', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSING')
	});

	/**
	 * @constant {Number} CLOSED
	 * @memberof WebSocket
	 */
	Object.defineProperty(WebSocket, 'CLOSED', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSED')
	});

	/**
	 * @constant {Number} CLOSED
	 * @memberof WebSocket.prototype
	 */
	Object.defineProperty(WebSocket.prototype, 'CLOSED', {
	  enumerable: true,
	  value: readyStates.indexOf('CLOSED')
	});

	[
	  'binaryType',
	  'bufferedAmount',
	  'extensions',
	  'isPaused',
	  'protocol',
	  'readyState',
	  'url'
	].forEach((property) => {
	  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});

	//
	// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
	// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
	//
	['open', 'error', 'close', 'message'].forEach((method) => {
	  Object.defineProperty(WebSocket.prototype, `on${method}`, {
	    enumerable: true,
	    get() {
	      for (const listener of this.listeners(method)) {
	        if (listener[kForOnEventAttribute]) return listener[kListener];
	      }

	      return null;
	    },
	    set(handler) {
	      for (const listener of this.listeners(method)) {
	        if (listener[kForOnEventAttribute]) {
	          this.removeListener(method, listener);
	          break;
	        }
	      }

	      if (typeof handler !== 'function') return;

	      this.addEventListener(method, handler, {
	        [kForOnEventAttribute]: true
	      });
	    }
	  });
	});

	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;

	websocket = WebSocket;

	/**
	 * Initialize a WebSocket client.
	 *
	 * @param {WebSocket} websocket The client to initialize
	 * @param {(String|URL)} address The URL to which to connect
	 * @param {Array} protocols The subprotocols
	 * @param {Object} [options] Connection options
	 * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
	 *     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
	 *     times in the same tick
	 * @param {Boolean} [options.autoPong=true] Specifies whether or not to
	 *     automatically send a pong in response to a ping
	 * @param {Function} [options.finishRequest] A function which can be used to
	 *     customize the headers of each http request before it is sent
	 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
	 *     redirects
	 * @param {Function} [options.generateMask] The function used to generate the
	 *     masking key
	 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
	 *     handshake request
	 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
	 *     size
	 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
	 *     allowed
	 * @param {String} [options.origin] Value of the `Origin` or
	 *     `Sec-WebSocket-Origin` header
	 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
	 *     permessage-deflate
	 * @param {Number} [options.protocolVersion=13] Value of the
	 *     `Sec-WebSocket-Version` header
	 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	 *     not to skip UTF-8 validation for text and close messages
	 * @private
	 */
	function initAsClient(websocket, address, protocols, options) {
	  const opts = {
	    allowSynchronousEvents: true,
	    autoPong: true,
	    protocolVersion: protocolVersions[1],
	    maxPayload: 100 * 1024 * 1024,
	    skipUTF8Validation: false,
	    perMessageDeflate: true,
	    followRedirects: false,
	    maxRedirects: 10,
	    ...options,
	    socketPath: undefined,
	    hostname: undefined,
	    protocol: undefined,
	    timeout: undefined,
	    method: 'GET',
	    host: undefined,
	    path: undefined,
	    port: undefined
	  };

	  websocket._autoPong = opts.autoPong;

	  if (!protocolVersions.includes(opts.protocolVersion)) {
	    throw new RangeError(
	      `Unsupported protocol version: ${opts.protocolVersion} ` +
	        `(supported versions: ${protocolVersions.join(', ')})`
	    );
	  }

	  let parsedUrl;

	  if (address instanceof URL) {
	    parsedUrl = address;
	  } else {
	    try {
	      parsedUrl = new URL(address);
	    } catch (e) {
	      throw new SyntaxError(`Invalid URL: ${address}`);
	    }
	  }

	  if (parsedUrl.protocol === 'http:') {
	    parsedUrl.protocol = 'ws:';
	  } else if (parsedUrl.protocol === 'https:') {
	    parsedUrl.protocol = 'wss:';
	  }

	  websocket._url = parsedUrl.href;

	  const isSecure = parsedUrl.protocol === 'wss:';
	  const isIpcUrl = parsedUrl.protocol === 'ws+unix:';
	  let invalidUrlMessage;

	  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {
	    invalidUrlMessage =
	      'The URL\'s protocol must be one of "ws:", "wss:", ' +
	      '"http:", "https", or "ws+unix:"';
	  } else if (isIpcUrl && !parsedUrl.pathname) {
	    invalidUrlMessage = "The URL's pathname is empty";
	  } else if (parsedUrl.hash) {
	    invalidUrlMessage = 'The URL contains a fragment identifier';
	  }

	  if (invalidUrlMessage) {
	    const err = new SyntaxError(invalidUrlMessage);

	    if (websocket._redirects === 0) {
	      throw err;
	    } else {
	      emitErrorAndClose(websocket, err);
	      return;
	    }
	  }

	  const defaultPort = isSecure ? 443 : 80;
	  const key = randomBytes(16).toString('base64');
	  const request = isSecure ? https.request : http.request;
	  const protocolSet = new Set();
	  let perMessageDeflate;

	  opts.createConnection =
	    opts.createConnection || (isSecure ? tlsConnect : netConnect);
	  opts.defaultPort = opts.defaultPort || defaultPort;
	  opts.port = parsedUrl.port || defaultPort;
	  opts.host = parsedUrl.hostname.startsWith('[')
	    ? parsedUrl.hostname.slice(1, -1)
	    : parsedUrl.hostname;
	  opts.headers = {
	    ...opts.headers,
	    'Sec-WebSocket-Version': opts.protocolVersion,
	    'Sec-WebSocket-Key': key,
	    Connection: 'Upgrade',
	    Upgrade: 'websocket'
	  };
	  opts.path = parsedUrl.pathname + parsedUrl.search;
	  opts.timeout = opts.handshakeTimeout;

	  if (opts.perMessageDeflate) {
	    perMessageDeflate = new PerMessageDeflate(
	      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
	      false,
	      opts.maxPayload
	    );
	    opts.headers['Sec-WebSocket-Extensions'] = format({
	      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
	    });
	  }
	  if (protocols.length) {
	    for (const protocol of protocols) {
	      if (
	        typeof protocol !== 'string' ||
	        !subprotocolRegex.test(protocol) ||
	        protocolSet.has(protocol)
	      ) {
	        throw new SyntaxError(
	          'An invalid or duplicated subprotocol was specified'
	        );
	      }

	      protocolSet.add(protocol);
	    }

	    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
	  }
	  if (opts.origin) {
	    if (opts.protocolVersion < 13) {
	      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
	    } else {
	      opts.headers.Origin = opts.origin;
	    }
	  }
	  if (parsedUrl.username || parsedUrl.password) {
	    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
	  }

	  if (isIpcUrl) {
	    const parts = opts.path.split(':');

	    opts.socketPath = parts[0];
	    opts.path = parts[1];
	  }

	  let req;

	  if (opts.followRedirects) {
	    if (websocket._redirects === 0) {
	      websocket._originalIpc = isIpcUrl;
	      websocket._originalSecure = isSecure;
	      websocket._originalHostOrSocketPath = isIpcUrl
	        ? opts.socketPath
	        : parsedUrl.host;

	      const headers = options && options.headers;

	      //
	      // Shallow copy the user provided options so that headers can be changed
	      // without mutating the original object.
	      //
	      options = { ...options, headers: {} };

	      if (headers) {
	        for (const [key, value] of Object.entries(headers)) {
	          options.headers[key.toLowerCase()] = value;
	        }
	      }
	    } else if (websocket.listenerCount('redirect') === 0) {
	      const isSameHost = isIpcUrl
	        ? websocket._originalIpc
	          ? opts.socketPath === websocket._originalHostOrSocketPath
	          : false
	        : websocket._originalIpc
	          ? false
	          : parsedUrl.host === websocket._originalHostOrSocketPath;

	      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
	        //
	        // Match curl 7.77.0 behavior and drop the following headers. These
	        // headers are also dropped when following a redirect to a subdomain.
	        //
	        delete opts.headers.authorization;
	        delete opts.headers.cookie;

	        if (!isSameHost) delete opts.headers.host;

	        opts.auth = undefined;
	      }
	    }

	    //
	    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
	    // If the `Authorization` header is set, then there is nothing to do as it
	    // will take precedence.
	    //
	    if (opts.auth && !options.headers.authorization) {
	      options.headers.authorization =
	        'Basic ' + Buffer.from(opts.auth).toString('base64');
	    }

	    req = websocket._req = request(opts);

	    if (websocket._redirects) {
	      //
	      // Unlike what is done for the `'upgrade'` event, no early exit is
	      // triggered here if the user calls `websocket.close()` or
	      // `websocket.terminate()` from a listener of the `'redirect'` event. This
	      // is because the user can also call `request.destroy()` with an error
	      // before calling `websocket.close()` or `websocket.terminate()` and this
	      // would result in an error being emitted on the `request` object with no
	      // `'error'` event listeners attached.
	      //
	      websocket.emit('redirect', websocket.url, req);
	    }
	  } else {
	    req = websocket._req = request(opts);
	  }

	  if (opts.timeout) {
	    req.on('timeout', () => {
	      abortHandshake(websocket, req, 'Opening handshake has timed out');
	    });
	  }

	  req.on('error', (err) => {
	    if (req === null || req[kAborted]) return;

	    req = websocket._req = null;
	    emitErrorAndClose(websocket, err);
	  });

	  req.on('response', (res) => {
	    const location = res.headers.location;
	    const statusCode = res.statusCode;

	    if (
	      location &&
	      opts.followRedirects &&
	      statusCode >= 300 &&
	      statusCode < 400
	    ) {
	      if (++websocket._redirects > opts.maxRedirects) {
	        abortHandshake(websocket, req, 'Maximum redirects exceeded');
	        return;
	      }

	      req.abort();

	      let addr;

	      try {
	        addr = new URL(location, address);
	      } catch (e) {
	        const err = new SyntaxError(`Invalid URL: ${location}`);
	        emitErrorAndClose(websocket, err);
	        return;
	      }

	      initAsClient(websocket, addr, protocols, options);
	    } else if (!websocket.emit('unexpected-response', req, res)) {
	      abortHandshake(
	        websocket,
	        req,
	        `Unexpected server response: ${res.statusCode}`
	      );
	    }
	  });

	  req.on('upgrade', (res, socket, head) => {
	    websocket.emit('upgrade', res);

	    //
	    // The user may have closed the connection from a listener of the
	    // `'upgrade'` event.
	    //
	    if (websocket.readyState !== WebSocket.CONNECTING) return;

	    req = websocket._req = null;

	    if (res.headers.upgrade.toLowerCase() !== 'websocket') {
	      abortHandshake(websocket, socket, 'Invalid Upgrade header');
	      return;
	    }

	    const digest = createHash('sha1')
	      .update(key + GUID)
	      .digest('base64');

	    if (res.headers['sec-websocket-accept'] !== digest) {
	      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
	      return;
	    }

	    const serverProt = res.headers['sec-websocket-protocol'];
	    let protError;

	    if (serverProt !== undefined) {
	      if (!protocolSet.size) {
	        protError = 'Server sent a subprotocol but none was requested';
	      } else if (!protocolSet.has(serverProt)) {
	        protError = 'Server sent an invalid subprotocol';
	      }
	    } else if (protocolSet.size) {
	      protError = 'Server sent no subprotocol';
	    }

	    if (protError) {
	      abortHandshake(websocket, socket, protError);
	      return;
	    }

	    if (serverProt) websocket._protocol = serverProt;

	    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

	    if (secWebSocketExtensions !== undefined) {
	      if (!perMessageDeflate) {
	        const message =
	          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
	          'was requested';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      let extensions;

	      try {
	        extensions = parse(secWebSocketExtensions);
	      } catch (err) {
	        const message = 'Invalid Sec-WebSocket-Extensions header';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      const extensionNames = Object.keys(extensions);

	      if (
	        extensionNames.length !== 1 ||
	        extensionNames[0] !== PerMessageDeflate.extensionName
	      ) {
	        const message = 'Server indicated an extension that was not requested';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      try {
	        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
	      } catch (err) {
	        const message = 'Invalid Sec-WebSocket-Extensions header';
	        abortHandshake(websocket, socket, message);
	        return;
	      }

	      websocket._extensions[PerMessageDeflate.extensionName] =
	        perMessageDeflate;
	    }

	    websocket.setSocket(socket, head, {
	      allowSynchronousEvents: opts.allowSynchronousEvents,
	      generateMask: opts.generateMask,
	      maxPayload: opts.maxPayload,
	      skipUTF8Validation: opts.skipUTF8Validation
	    });
	  });

	  if (opts.finishRequest) {
	    opts.finishRequest(req, websocket);
	  } else {
	    req.end();
	  }
	}

	/**
	 * Emit the `'error'` and `'close'` events.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @param {Error} The error to emit
	 * @private
	 */
	function emitErrorAndClose(websocket, err) {
	  websocket._readyState = WebSocket.CLOSING;
	  websocket.emit('error', err);
	  websocket.emitClose();
	}

	/**
	 * Create a `net.Socket` and initiate a connection.
	 *
	 * @param {Object} options Connection options
	 * @return {net.Socket} The newly created socket used to start the connection
	 * @private
	 */
	function netConnect(options) {
	  options.path = options.socketPath;
	  return net.connect(options);
	}

	/**
	 * Create a `tls.TLSSocket` and initiate a connection.
	 *
	 * @param {Object} options Connection options
	 * @return {tls.TLSSocket} The newly created socket used to start the connection
	 * @private
	 */
	function tlsConnect(options) {
	  options.path = undefined;

	  if (!options.servername && options.servername !== '') {
	    options.servername = net.isIP(options.host) ? '' : options.host;
	  }

	  return tls.connect(options);
	}

	/**
	 * Abort the handshake and emit an error.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
	 *     abort or the socket to destroy
	 * @param {String} message The error message
	 * @private
	 */
	function abortHandshake(websocket, stream, message) {
	  websocket._readyState = WebSocket.CLOSING;

	  const err = new Error(message);
	  Error.captureStackTrace(err, abortHandshake);

	  if (stream.setHeader) {
	    stream[kAborted] = true;
	    stream.abort();

	    if (stream.socket && !stream.socket.destroyed) {
	      //
	      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
	      // called after the request completed. See
	      // https://github.com/websockets/ws/issues/1869.
	      //
	      stream.socket.destroy();
	    }

	    process.nextTick(emitErrorAndClose, websocket, err);
	  } else {
	    stream.destroy(err);
	    stream.once('error', websocket.emit.bind(websocket, 'error'));
	    stream.once('close', websocket.emitClose.bind(websocket));
	  }
	}

	/**
	 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
	 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
	 *
	 * @param {WebSocket} websocket The WebSocket instance
	 * @param {*} [data] The data to send
	 * @param {Function} [cb] Callback
	 * @private
	 */
	function sendAfterClose(websocket, data, cb) {
	  if (data) {
	    const length = toBuffer(data).length;

	    //
	    // The `_bufferedAmount` property is used only when the peer is a client and
	    // the opening handshake fails. Under these circumstances, in fact, the
	    // `setSocket()` method is not called, so the `_socket` and `_sender`
	    // properties are set to `null`.
	    //
	    if (websocket._socket) websocket._sender._bufferedBytes += length;
	    else websocket._bufferedAmount += length;
	  }

	  if (cb) {
	    const err = new Error(
	      `WebSocket is not open: readyState ${websocket.readyState} ` +
	        `(${readyStates[websocket.readyState]})`
	    );
	    process.nextTick(cb, err);
	  }
	}

	/**
	 * The listener of the `Receiver` `'conclude'` event.
	 *
	 * @param {Number} code The status code
	 * @param {Buffer} reason The reason for closing
	 * @private
	 */
	function receiverOnConclude(code, reason) {
	  const websocket = this[kWebSocket];

	  websocket._closeFrameReceived = true;
	  websocket._closeMessage = reason;
	  websocket._closeCode = code;

	  if (websocket._socket[kWebSocket] === undefined) return;

	  websocket._socket.removeListener('data', socketOnData);
	  process.nextTick(resume, websocket._socket);

	  if (code === 1005) websocket.close();
	  else websocket.close(code, reason);
	}

	/**
	 * The listener of the `Receiver` `'drain'` event.
	 *
	 * @private
	 */
	function receiverOnDrain() {
	  const websocket = this[kWebSocket];

	  if (!websocket.isPaused) websocket._socket.resume();
	}

	/**
	 * The listener of the `Receiver` `'error'` event.
	 *
	 * @param {(RangeError|Error)} err The emitted error
	 * @private
	 */
	function receiverOnError(err) {
	  const websocket = this[kWebSocket];

	  if (websocket._socket[kWebSocket] !== undefined) {
	    websocket._socket.removeListener('data', socketOnData);

	    //
	    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
	    // https://github.com/websockets/ws/issues/1940.
	    //
	    process.nextTick(resume, websocket._socket);

	    websocket.close(err[kStatusCode]);
	  }

	  websocket.emit('error', err);
	}

	/**
	 * The listener of the `Receiver` `'finish'` event.
	 *
	 * @private
	 */
	function receiverOnFinish() {
	  this[kWebSocket].emitClose();
	}

	/**
	 * The listener of the `Receiver` `'message'` event.
	 *
	 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
	 * @param {Boolean} isBinary Specifies whether the message is binary or not
	 * @private
	 */
	function receiverOnMessage(data, isBinary) {
	  this[kWebSocket].emit('message', data, isBinary);
	}

	/**
	 * The listener of the `Receiver` `'ping'` event.
	 *
	 * @param {Buffer} data The data included in the ping frame
	 * @private
	 */
	function receiverOnPing(data) {
	  const websocket = this[kWebSocket];

	  if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
	  websocket.emit('ping', data);
	}

	/**
	 * The listener of the `Receiver` `'pong'` event.
	 *
	 * @param {Buffer} data The data included in the pong frame
	 * @private
	 */
	function receiverOnPong(data) {
	  this[kWebSocket].emit('pong', data);
	}

	/**
	 * Resume a readable stream
	 *
	 * @param {Readable} stream The readable stream
	 * @private
	 */
	function resume(stream) {
	  stream.resume();
	}

	/**
	 * The listener of the socket `'close'` event.
	 *
	 * @private
	 */
	function socketOnClose() {
	  const websocket = this[kWebSocket];

	  this.removeListener('close', socketOnClose);
	  this.removeListener('data', socketOnData);
	  this.removeListener('end', socketOnEnd);

	  websocket._readyState = WebSocket.CLOSING;

	  let chunk;

	  //
	  // The close frame might not have been received or the `'end'` event emitted,
	  // for example, if the socket was destroyed due to an error. Ensure that the
	  // `receiver` stream is closed after writing any remaining buffered data to
	  // it. If the readable side of the socket is in flowing mode then there is no
	  // buffered data as everything has been already written and `readable.read()`
	  // will return `null`. If instead, the socket is paused, any possible buffered
	  // data will be read as a single chunk.
	  //
	  if (
	    !this._readableState.endEmitted &&
	    !websocket._closeFrameReceived &&
	    !websocket._receiver._writableState.errorEmitted &&
	    (chunk = websocket._socket.read()) !== null
	  ) {
	    websocket._receiver.write(chunk);
	  }

	  websocket._receiver.end();

	  this[kWebSocket] = undefined;

	  clearTimeout(websocket._closeTimer);

	  if (
	    websocket._receiver._writableState.finished ||
	    websocket._receiver._writableState.errorEmitted
	  ) {
	    websocket.emitClose();
	  } else {
	    websocket._receiver.on('error', receiverOnFinish);
	    websocket._receiver.on('finish', receiverOnFinish);
	  }
	}

	/**
	 * The listener of the socket `'data'` event.
	 *
	 * @param {Buffer} chunk A chunk of data
	 * @private
	 */
	function socketOnData(chunk) {
	  if (!this[kWebSocket]._receiver.write(chunk)) {
	    this.pause();
	  }
	}

	/**
	 * The listener of the socket `'end'` event.
	 *
	 * @private
	 */
	function socketOnEnd() {
	  const websocket = this[kWebSocket];

	  websocket._readyState = WebSocket.CLOSING;
	  websocket._receiver.end();
	  this.end();
	}

	/**
	 * The listener of the socket `'error'` event.
	 *
	 * @private
	 */
	function socketOnError() {
	  const websocket = this[kWebSocket];

	  this.removeListener('error', socketOnError);
	  this.on('error', NOOP);

	  if (websocket) {
	    websocket._readyState = WebSocket.CLOSING;
	    this.destroy();
	  }
	}
	return websocket;
}

var stream$2;
var hasRequiredStream$2;

function requireStream$2 () {
	if (hasRequiredStream$2) return stream$2;
	hasRequiredStream$2 = 1;

	const { Duplex } = require$$0$3;

	/**
	 * Emits the `'close'` event on a stream.
	 *
	 * @param {Duplex} stream The stream.
	 * @private
	 */
	function emitClose(stream) {
	  stream.emit('close');
	}

	/**
	 * The listener of the `'end'` event.
	 *
	 * @private
	 */
	function duplexOnEnd() {
	  if (!this.destroyed && this._writableState.finished) {
	    this.destroy();
	  }
	}

	/**
	 * The listener of the `'error'` event.
	 *
	 * @param {Error} err The error
	 * @private
	 */
	function duplexOnError(err) {
	  this.removeListener('error', duplexOnError);
	  this.destroy();
	  if (this.listenerCount('error') === 0) {
	    // Do not suppress the throwing behavior.
	    this.emit('error', err);
	  }
	}

	/**
	 * Wraps a `WebSocket` in a duplex stream.
	 *
	 * @param {WebSocket} ws The `WebSocket` to wrap
	 * @param {Object} [options] The options for the `Duplex` constructor
	 * @return {Duplex} The duplex stream
	 * @public
	 */
	function createWebSocketStream(ws, options) {
	  let terminateOnDestroy = true;

	  const duplex = new Duplex({
	    ...options,
	    autoDestroy: false,
	    emitClose: false,
	    objectMode: false,
	    writableObjectMode: false
	  });

	  ws.on('message', function message(msg, isBinary) {
	    const data =
	      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

	    if (!duplex.push(data)) ws.pause();
	  });

	  ws.once('error', function error(err) {
	    if (duplex.destroyed) return;

	    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
	    //
	    // - If the `'error'` event is emitted before the `'open'` event, then
	    //   `ws.terminate()` is a noop as no socket is assigned.
	    // - Otherwise, the error is re-emitted by the listener of the `'error'`
	    //   event of the `Receiver` object. The listener already closes the
	    //   connection by calling `ws.close()`. This allows a close frame to be
	    //   sent to the other peer. If `ws.terminate()` is called right after this,
	    //   then the close frame might not be sent.
	    terminateOnDestroy = false;
	    duplex.destroy(err);
	  });

	  ws.once('close', function close() {
	    if (duplex.destroyed) return;

	    duplex.push(null);
	  });

	  duplex._destroy = function (err, callback) {
	    if (ws.readyState === ws.CLOSED) {
	      callback(err);
	      process.nextTick(emitClose, duplex);
	      return;
	    }

	    let called = false;

	    ws.once('error', function error(err) {
	      called = true;
	      callback(err);
	    });

	    ws.once('close', function close() {
	      if (!called) callback(err);
	      process.nextTick(emitClose, duplex);
	    });

	    if (terminateOnDestroy) ws.terminate();
	  };

	  duplex._final = function (callback) {
	    if (ws.readyState === ws.CONNECTING) {
	      ws.once('open', function open() {
	        duplex._final(callback);
	      });
	      return;
	    }

	    // If the value of the `_socket` property is `null` it means that `ws` is a
	    // client websocket and the handshake failed. In fact, when this happens, a
	    // socket is never assigned to the websocket. Wait for the `'error'` event
	    // that will be emitted by the websocket.
	    if (ws._socket === null) return;

	    if (ws._socket._writableState.finished) {
	      callback();
	      if (duplex._readableState.endEmitted) duplex.destroy();
	    } else {
	      ws._socket.once('finish', function finish() {
	        // `duplex` is not destroyed here because the `'end'` event will be
	        // emitted on `duplex` after this `'finish'` event. The EOF signaling
	        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
	        callback();
	      });
	      ws.close();
	    }
	  };

	  duplex._read = function () {
	    if (ws.isPaused) ws.resume();
	  };

	  duplex._write = function (chunk, encoding, callback) {
	    if (ws.readyState === ws.CONNECTING) {
	      ws.once('open', function open() {
	        duplex._write(chunk, encoding, callback);
	      });
	      return;
	    }

	    ws.send(chunk, callback);
	  };

	  duplex.on('end', duplexOnEnd);
	  duplex.on('error', duplexOnError);
	  return duplex;
	}

	stream$2 = createWebSocketStream;
	return stream$2;
}

var subprotocol;
var hasRequiredSubprotocol;

function requireSubprotocol () {
	if (hasRequiredSubprotocol) return subprotocol;
	hasRequiredSubprotocol = 1;

	const { tokenChars } = requireValidation();

	/**
	 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
	 *
	 * @param {String} header The field value of the header
	 * @return {Set} The subprotocol names
	 * @public
	 */
	function parse(header) {
	  const protocols = new Set();
	  let start = -1;
	  let end = -1;
	  let i = 0;

	  for (i; i < header.length; i++) {
	    const code = header.charCodeAt(i);

	    if (end === -1 && tokenChars[code] === 1) {
	      if (start === -1) start = i;
	    } else if (
	      i !== 0 &&
	      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
	    ) {
	      if (end === -1 && start !== -1) end = i;
	    } else if (code === 0x2c /* ',' */) {
	      if (start === -1) {
	        throw new SyntaxError(`Unexpected character at index ${i}`);
	      }

	      if (end === -1) end = i;

	      const protocol = header.slice(start, end);

	      if (protocols.has(protocol)) {
	        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
	      }

	      protocols.add(protocol);
	      start = end = -1;
	    } else {
	      throw new SyntaxError(`Unexpected character at index ${i}`);
	    }
	  }

	  if (start === -1 || end !== -1) {
	    throw new SyntaxError('Unexpected end of input');
	  }

	  const protocol = header.slice(start, i);

	  if (protocols.has(protocol)) {
	    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
	  }

	  protocols.add(protocol);
	  return protocols;
	}

	subprotocol = { parse };
	return subprotocol;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex$", "caughtErrors": "none" }] */

var websocketServer;
var hasRequiredWebsocketServer;

function requireWebsocketServer () {
	if (hasRequiredWebsocketServer) return websocketServer;
	hasRequiredWebsocketServer = 1;

	const EventEmitter = require$$0$5;
	const http = require$$2$1;
	const { createHash } = require$$0$4;

	const extension = requireExtension();
	const PerMessageDeflate = requirePermessageDeflate();
	const subprotocol = requireSubprotocol();
	const WebSocket = requireWebsocket();
	const { GUID, kWebSocket } = requireConstants();

	const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

	const RUNNING = 0;
	const CLOSING = 1;
	const CLOSED = 2;

	/**
	 * Class representing a WebSocket server.
	 *
	 * @extends EventEmitter
	 */
	class WebSocketServer extends EventEmitter {
	  /**
	   * Create a `WebSocketServer` instance.
	   *
	   * @param {Object} options Configuration options
	   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
	   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
	   *     multiple times in the same tick
	   * @param {Boolean} [options.autoPong=true] Specifies whether or not to
	   *     automatically send a pong in response to a ping
	   * @param {Number} [options.backlog=511] The maximum length of the queue of
	   *     pending connections
	   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
	   *     track clients
	   * @param {Function} [options.handleProtocols] A hook to handle protocols
	   * @param {String} [options.host] The hostname where to bind the server
	   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
	   *     size
	   * @param {Boolean} [options.noServer=false] Enable no server mode
	   * @param {String} [options.path] Accept only connections matching this path
	   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
	   *     permessage-deflate
	   * @param {Number} [options.port] The port where to bind the server
	   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
	   *     server to use
	   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	   *     not to skip UTF-8 validation for text and close messages
	   * @param {Function} [options.verifyClient] A hook to reject connections
	   * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
	   *     class to use. It must be the `WebSocket` class or class that extends it
	   * @param {Function} [callback] A listener for the `listening` event
	   */
	  constructor(options, callback) {
	    super();

	    options = {
	      allowSynchronousEvents: true,
	      autoPong: true,
	      maxPayload: 100 * 1024 * 1024,
	      skipUTF8Validation: false,
	      perMessageDeflate: false,
	      handleProtocols: null,
	      clientTracking: true,
	      verifyClient: null,
	      noServer: false,
	      backlog: null, // use default (511 as implemented in net.js)
	      server: null,
	      host: null,
	      path: null,
	      port: null,
	      WebSocket,
	      ...options
	    };

	    if (
	      (options.port == null && !options.server && !options.noServer) ||
	      (options.port != null && (options.server || options.noServer)) ||
	      (options.server && options.noServer)
	    ) {
	      throw new TypeError(
	        'One and only one of the "port", "server", or "noServer" options ' +
	          'must be specified'
	      );
	    }

	    if (options.port != null) {
	      this._server = http.createServer((req, res) => {
	        const body = http.STATUS_CODES[426];

	        res.writeHead(426, {
	          'Content-Length': body.length,
	          'Content-Type': 'text/plain'
	        });
	        res.end(body);
	      });
	      this._server.listen(
	        options.port,
	        options.host,
	        options.backlog,
	        callback
	      );
	    } else if (options.server) {
	      this._server = options.server;
	    }

	    if (this._server) {
	      const emitConnection = this.emit.bind(this, 'connection');

	      this._removeListeners = addListeners(this._server, {
	        listening: this.emit.bind(this, 'listening'),
	        error: this.emit.bind(this, 'error'),
	        upgrade: (req, socket, head) => {
	          this.handleUpgrade(req, socket, head, emitConnection);
	        }
	      });
	    }

	    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
	    if (options.clientTracking) {
	      this.clients = new Set();
	      this._shouldEmitClose = false;
	    }

	    this.options = options;
	    this._state = RUNNING;
	  }

	  /**
	   * Returns the bound address, the address family name, and port of the server
	   * as reported by the operating system if listening on an IP socket.
	   * If the server is listening on a pipe or UNIX domain socket, the name is
	   * returned as a string.
	   *
	   * @return {(Object|String|null)} The address of the server
	   * @public
	   */
	  address() {
	    if (this.options.noServer) {
	      throw new Error('The server is operating in "noServer" mode');
	    }

	    if (!this._server) return null;
	    return this._server.address();
	  }

	  /**
	   * Stop the server from accepting new connections and emit the `'close'` event
	   * when all existing connections are closed.
	   *
	   * @param {Function} [cb] A one-time listener for the `'close'` event
	   * @public
	   */
	  close(cb) {
	    if (this._state === CLOSED) {
	      if (cb) {
	        this.once('close', () => {
	          cb(new Error('The server is not running'));
	        });
	      }

	      process.nextTick(emitClose, this);
	      return;
	    }

	    if (cb) this.once('close', cb);

	    if (this._state === CLOSING) return;
	    this._state = CLOSING;

	    if (this.options.noServer || this.options.server) {
	      if (this._server) {
	        this._removeListeners();
	        this._removeListeners = this._server = null;
	      }

	      if (this.clients) {
	        if (!this.clients.size) {
	          process.nextTick(emitClose, this);
	        } else {
	          this._shouldEmitClose = true;
	        }
	      } else {
	        process.nextTick(emitClose, this);
	      }
	    } else {
	      const server = this._server;

	      this._removeListeners();
	      this._removeListeners = this._server = null;

	      //
	      // The HTTP/S server was created internally. Close it, and rely on its
	      // `'close'` event.
	      //
	      server.close(() => {
	        emitClose(this);
	      });
	    }
	  }

	  /**
	   * See if a given request should be handled by this server instance.
	   *
	   * @param {http.IncomingMessage} req Request object to inspect
	   * @return {Boolean} `true` if the request is valid, else `false`
	   * @public
	   */
	  shouldHandle(req) {
	    if (this.options.path) {
	      const index = req.url.indexOf('?');
	      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

	      if (pathname !== this.options.path) return false;
	    }

	    return true;
	  }

	  /**
	   * Handle a HTTP Upgrade request.
	   *
	   * @param {http.IncomingMessage} req The request object
	   * @param {Duplex} socket The network socket between the server and client
	   * @param {Buffer} head The first packet of the upgraded stream
	   * @param {Function} cb Callback
	   * @public
	   */
	  handleUpgrade(req, socket, head, cb) {
	    socket.on('error', socketOnError);

	    const key = req.headers['sec-websocket-key'];
	    const version = +req.headers['sec-websocket-version'];

	    if (req.method !== 'GET') {
	      const message = 'Invalid HTTP method';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
	      return;
	    }

	    if (req.headers.upgrade.toLowerCase() !== 'websocket') {
	      const message = 'Invalid Upgrade header';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	      return;
	    }

	    if (!key || !keyRegex.test(key)) {
	      const message = 'Missing or invalid Sec-WebSocket-Key header';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	      return;
	    }

	    if (version !== 8 && version !== 13) {
	      const message = 'Missing or invalid Sec-WebSocket-Version header';
	      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	      return;
	    }

	    if (!this.shouldHandle(req)) {
	      abortHandshake(socket, 400);
	      return;
	    }

	    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
	    let protocols = new Set();

	    if (secWebSocketProtocol !== undefined) {
	      try {
	        protocols = subprotocol.parse(secWebSocketProtocol);
	      } catch (err) {
	        const message = 'Invalid Sec-WebSocket-Protocol header';
	        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	        return;
	      }
	    }

	    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
	    const extensions = {};

	    if (
	      this.options.perMessageDeflate &&
	      secWebSocketExtensions !== undefined
	    ) {
	      const perMessageDeflate = new PerMessageDeflate(
	        this.options.perMessageDeflate,
	        true,
	        this.options.maxPayload
	      );

	      try {
	        const offers = extension.parse(secWebSocketExtensions);

	        if (offers[PerMessageDeflate.extensionName]) {
	          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
	          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
	        }
	      } catch (err) {
	        const message =
	          'Invalid or unacceptable Sec-WebSocket-Extensions header';
	        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
	        return;
	      }
	    }

	    //
	    // Optionally call external client verification handler.
	    //
	    if (this.options.verifyClient) {
	      const info = {
	        origin:
	          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
	        secure: !!(req.socket.authorized || req.socket.encrypted),
	        req
	      };

	      if (this.options.verifyClient.length === 2) {
	        this.options.verifyClient(info, (verified, code, message, headers) => {
	          if (!verified) {
	            return abortHandshake(socket, code || 401, message, headers);
	          }

	          this.completeUpgrade(
	            extensions,
	            key,
	            protocols,
	            req,
	            socket,
	            head,
	            cb
	          );
	        });
	        return;
	      }

	      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
	    }

	    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
	  }

	  /**
	   * Upgrade the connection to WebSocket.
	   *
	   * @param {Object} extensions The accepted extensions
	   * @param {String} key The value of the `Sec-WebSocket-Key` header
	   * @param {Set} protocols The subprotocols
	   * @param {http.IncomingMessage} req The request object
	   * @param {Duplex} socket The network socket between the server and client
	   * @param {Buffer} head The first packet of the upgraded stream
	   * @param {Function} cb Callback
	   * @throws {Error} If called more than once with the same socket
	   * @private
	   */
	  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
	    //
	    // Destroy the socket if the client has already sent a FIN packet.
	    //
	    if (!socket.readable || !socket.writable) return socket.destroy();

	    if (socket[kWebSocket]) {
	      throw new Error(
	        'server.handleUpgrade() was called more than once with the same ' +
	          'socket, possibly due to a misconfiguration'
	      );
	    }

	    if (this._state > RUNNING) return abortHandshake(socket, 503);

	    const digest = createHash('sha1')
	      .update(key + GUID)
	      .digest('base64');

	    const headers = [
	      'HTTP/1.1 101 Switching Protocols',
	      'Upgrade: websocket',
	      'Connection: Upgrade',
	      `Sec-WebSocket-Accept: ${digest}`
	    ];

	    const ws = new this.options.WebSocket(null, undefined, this.options);

	    if (protocols.size) {
	      //
	      // Optionally call external protocol selection handler.
	      //
	      const protocol = this.options.handleProtocols
	        ? this.options.handleProtocols(protocols, req)
	        : protocols.values().next().value;

	      if (protocol) {
	        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
	        ws._protocol = protocol;
	      }
	    }

	    if (extensions[PerMessageDeflate.extensionName]) {
	      const params = extensions[PerMessageDeflate.extensionName].params;
	      const value = extension.format({
	        [PerMessageDeflate.extensionName]: [params]
	      });
	      headers.push(`Sec-WebSocket-Extensions: ${value}`);
	      ws._extensions = extensions;
	    }

	    //
	    // Allow external modification/inspection of handshake headers.
	    //
	    this.emit('headers', headers, req);

	    socket.write(headers.concat('\r\n').join('\r\n'));
	    socket.removeListener('error', socketOnError);

	    ws.setSocket(socket, head, {
	      allowSynchronousEvents: this.options.allowSynchronousEvents,
	      maxPayload: this.options.maxPayload,
	      skipUTF8Validation: this.options.skipUTF8Validation
	    });

	    if (this.clients) {
	      this.clients.add(ws);
	      ws.on('close', () => {
	        this.clients.delete(ws);

	        if (this._shouldEmitClose && !this.clients.size) {
	          process.nextTick(emitClose, this);
	        }
	      });
	    }

	    cb(ws, req);
	  }
	}

	websocketServer = WebSocketServer;

	/**
	 * Add event listeners on an `EventEmitter` using a map of <event, listener>
	 * pairs.
	 *
	 * @param {EventEmitter} server The event emitter
	 * @param {Object.<String, Function>} map The listeners to add
	 * @return {Function} A function that will remove the added listeners when
	 *     called
	 * @private
	 */
	function addListeners(server, map) {
	  for (const event of Object.keys(map)) server.on(event, map[event]);

	  return function removeListeners() {
	    for (const event of Object.keys(map)) {
	      server.removeListener(event, map[event]);
	    }
	  };
	}

	/**
	 * Emit a `'close'` event on an `EventEmitter`.
	 *
	 * @param {EventEmitter} server The event emitter
	 * @private
	 */
	function emitClose(server) {
	  server._state = CLOSED;
	  server.emit('close');
	}

	/**
	 * Handle socket errors.
	 *
	 * @private
	 */
	function socketOnError() {
	  this.destroy();
	}

	/**
	 * Close the connection when preconditions are not fulfilled.
	 *
	 * @param {Duplex} socket The socket of the upgrade request
	 * @param {Number} code The HTTP response status code
	 * @param {String} [message] The HTTP response body
	 * @param {Object} [headers] Additional HTTP response headers
	 * @private
	 */
	function abortHandshake(socket, code, message, headers) {
	  //
	  // The socket is writable unless the user destroyed or ended it before calling
	  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user
	  // error. Handling this does not make much sense as the worst that can happen
	  // is that some of the data written by the user might be discarded due to the
	  // call to `socket.end()` below, which triggers an `'error'` event that in
	  // turn causes the socket to be destroyed.
	  //
	  message = message || http.STATUS_CODES[code];
	  headers = {
	    Connection: 'close',
	    'Content-Type': 'text/html',
	    'Content-Length': Buffer.byteLength(message),
	    ...headers
	  };

	  socket.once('finish', socket.destroy);

	  socket.end(
	    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
	      Object.keys(headers)
	        .map((h) => `${h}: ${headers[h]}`)
	        .join('\r\n') +
	      '\r\n\r\n' +
	      message
	  );
	}

	/**
	 * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
	 * one listener for it, otherwise call `abortHandshake()`.
	 *
	 * @param {WebSocketServer} server The WebSocket server
	 * @param {http.IncomingMessage} req The request object
	 * @param {Duplex} socket The socket of the upgrade request
	 * @param {Number} code The HTTP response status code
	 * @param {String} message The HTTP response body
	 * @private
	 */
	function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
	  if (server.listenerCount('wsClientError')) {
	    const err = new Error(message);
	    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);

	    server.emit('wsClientError', err, socket, req);
	  } else {
	    abortHandshake(socket, code, message);
	  }
	}
	return websocketServer;
}

var ws;
var hasRequiredWs;

function requireWs () {
	if (hasRequiredWs) return ws;
	hasRequiredWs = 1;

	const WebSocket = requireWebsocket();

	WebSocket.createWebSocketStream = requireStream$2();
	WebSocket.Server = requireWebsocketServer();
	WebSocket.Receiver = requireReceiver();
	WebSocket.Sender = requireSender();

	WebSocket.WebSocket = WebSocket;
	WebSocket.WebSocketServer = WebSocket.Server;

	ws = WebSocket;
	return ws;
}

var cjs = {};

var max = {};

var hasRequiredMax;

function requireMax () {
	if (hasRequiredMax) return max;
	hasRequiredMax = 1;
	Object.defineProperty(max, "__esModule", { value: true });
	max.default = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
	return max;
}

var nil = {};

var hasRequiredNil;

function requireNil () {
	if (hasRequiredNil) return nil;
	hasRequiredNil = 1;
	Object.defineProperty(nil, "__esModule", { value: true });
	nil.default = '00000000-0000-0000-0000-000000000000';
	return nil;
}

var parse$1 = {};

var validate = {};

var regex = {};

var hasRequiredRegex;

function requireRegex () {
	if (hasRequiredRegex) return regex;
	hasRequiredRegex = 1;
	Object.defineProperty(regex, "__esModule", { value: true });
	regex.default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
	return regex;
}

var hasRequiredValidate;

function requireValidate () {
	if (hasRequiredValidate) return validate;
	hasRequiredValidate = 1;
	Object.defineProperty(validate, "__esModule", { value: true });
	const regex_js_1 = requireRegex();
	function validate$1(uuid) {
	    return typeof uuid === 'string' && regex_js_1.default.test(uuid);
	}
	validate.default = validate$1;
	return validate;
}

var hasRequiredParse;

function requireParse () {
	if (hasRequiredParse) return parse$1;
	hasRequiredParse = 1;
	Object.defineProperty(parse$1, "__esModule", { value: true });
	const validate_js_1 = requireValidate();
	function parse(uuid) {
	    if (!(0, validate_js_1.default)(uuid)) {
	        throw TypeError('Invalid UUID');
	    }
	    let v;
	    return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 0xff, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 0xff, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 0xff, ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff, (v / 0x100000000) & 0xff, (v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
	}
	parse$1.default = parse;
	return parse$1;
}

var stringify = {};

var hasRequiredStringify;

function requireStringify () {
	if (hasRequiredStringify) return stringify;
	hasRequiredStringify = 1;
	Object.defineProperty(stringify, "__esModule", { value: true });
	stringify.unsafeStringify = unsafeStringify;
	const validate_js_1 = requireValidate();
	const byteToHex = [];
	for (let i = 0; i < 256; ++i) {
	    byteToHex.push((i + 0x100).toString(16).slice(1));
	}
	function unsafeStringify(arr, offset = 0) {
	    return (byteToHex[arr[offset + 0]] +
	        byteToHex[arr[offset + 1]] +
	        byteToHex[arr[offset + 2]] +
	        byteToHex[arr[offset + 3]] +
	        '-' +
	        byteToHex[arr[offset + 4]] +
	        byteToHex[arr[offset + 5]] +
	        '-' +
	        byteToHex[arr[offset + 6]] +
	        byteToHex[arr[offset + 7]] +
	        '-' +
	        byteToHex[arr[offset + 8]] +
	        byteToHex[arr[offset + 9]] +
	        '-' +
	        byteToHex[arr[offset + 10]] +
	        byteToHex[arr[offset + 11]] +
	        byteToHex[arr[offset + 12]] +
	        byteToHex[arr[offset + 13]] +
	        byteToHex[arr[offset + 14]] +
	        byteToHex[arr[offset + 15]]).toLowerCase();
	}
	function stringify$1(arr, offset = 0) {
	    const uuid = unsafeStringify(arr, offset);
	    if (!(0, validate_js_1.default)(uuid)) {
	        throw TypeError('Stringified UUID is invalid');
	    }
	    return uuid;
	}
	stringify.default = stringify$1;
	return stringify;
}

var v1 = {};

var rng = {};

var hasRequiredRng;

function requireRng () {
	if (hasRequiredRng) return rng;
	hasRequiredRng = 1;
	Object.defineProperty(rng, "__esModule", { value: true });
	rng.default = rng$1;
	const crypto_1 = require$$0$4;
	const rnds8Pool = new Uint8Array(256);
	let poolPtr = rnds8Pool.length;
	function rng$1() {
	    if (poolPtr > rnds8Pool.length - 16) {
	        (0, crypto_1.randomFillSync)(rnds8Pool);
	        poolPtr = 0;
	    }
	    return rnds8Pool.slice(poolPtr, (poolPtr += 16));
	}
	return rng;
}

var hasRequiredV1;

function requireV1 () {
	if (hasRequiredV1) return v1;
	hasRequiredV1 = 1;
	Object.defineProperty(v1, "__esModule", { value: true });
	v1.updateV1State = updateV1State;
	const rng_js_1 = requireRng();
	const stringify_js_1 = requireStringify();
	const _state = {};
	function v1$1(options, buf, offset) {
	    let bytes;
	    const isV6 = options?._v6 ?? false;
	    if (options) {
	        const optionsKeys = Object.keys(options);
	        if (optionsKeys.length === 1 && optionsKeys[0] === '_v6') {
	            options = undefined;
	        }
	    }
	    if (options) {
	        bytes = v1Bytes(options.random ?? options.rng?.() ?? (0, rng_js_1.default)(), options.msecs, options.nsecs, options.clockseq, options.node, buf, offset);
	    }
	    else {
	        const now = Date.now();
	        const rnds = (0, rng_js_1.default)();
	        updateV1State(_state, now, rnds);
	        bytes = v1Bytes(rnds, _state.msecs, _state.nsecs, isV6 ? undefined : _state.clockseq, isV6 ? undefined : _state.node, buf, offset);
	    }
	    return buf ? bytes : (0, stringify_js_1.unsafeStringify)(bytes);
	}
	function updateV1State(state, now, rnds) {
	    state.msecs ??= -Infinity;
	    state.nsecs ??= 0;
	    if (now === state.msecs) {
	        state.nsecs++;
	        if (state.nsecs >= 10000) {
	            state.node = undefined;
	            state.nsecs = 0;
	        }
	    }
	    else if (now > state.msecs) {
	        state.nsecs = 0;
	    }
	    else if (now < state.msecs) {
	        state.node = undefined;
	    }
	    if (!state.node) {
	        state.node = rnds.slice(10, 16);
	        state.node[0] |= 0x01;
	        state.clockseq = ((rnds[8] << 8) | rnds[9]) & 0x3fff;
	    }
	    state.msecs = now;
	    return state;
	}
	function v1Bytes(rnds, msecs, nsecs, clockseq, node, buf, offset = 0) {
	    if (rnds.length < 16) {
	        throw new Error('Random bytes length must be >= 16');
	    }
	    if (!buf) {
	        buf = new Uint8Array(16);
	        offset = 0;
	    }
	    else {
	        if (offset < 0 || offset + 16 > buf.length) {
	            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
	        }
	    }
	    msecs ??= Date.now();
	    nsecs ??= 0;
	    clockseq ??= ((rnds[8] << 8) | rnds[9]) & 0x3fff;
	    node ??= rnds.slice(10, 16);
	    msecs += 12219292800000;
	    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	    buf[offset++] = (tl >>> 24) & 0xff;
	    buf[offset++] = (tl >>> 16) & 0xff;
	    buf[offset++] = (tl >>> 8) & 0xff;
	    buf[offset++] = tl & 0xff;
	    const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
	    buf[offset++] = (tmh >>> 8) & 0xff;
	    buf[offset++] = tmh & 0xff;
	    buf[offset++] = ((tmh >>> 24) & 0xf) | 0x10;
	    buf[offset++] = (tmh >>> 16) & 0xff;
	    buf[offset++] = (clockseq >>> 8) | 0x80;
	    buf[offset++] = clockseq & 0xff;
	    for (let n = 0; n < 6; ++n) {
	        buf[offset++] = node[n];
	    }
	    return buf;
	}
	v1.default = v1$1;
	return v1;
}

var v1ToV6 = {};

var hasRequiredV1ToV6;

function requireV1ToV6 () {
	if (hasRequiredV1ToV6) return v1ToV6;
	hasRequiredV1ToV6 = 1;
	Object.defineProperty(v1ToV6, "__esModule", { value: true });
	v1ToV6.default = v1ToV6$1;
	const parse_js_1 = requireParse();
	const stringify_js_1 = requireStringify();
	function v1ToV6$1(uuid) {
	    const v1Bytes = typeof uuid === 'string' ? (0, parse_js_1.default)(uuid) : uuid;
	    const v6Bytes = _v1ToV6(v1Bytes);
	    return typeof uuid === 'string' ? (0, stringify_js_1.unsafeStringify)(v6Bytes) : v6Bytes;
	}
	function _v1ToV6(v1Bytes) {
	    return Uint8Array.of(((v1Bytes[6] & 0x0f) << 4) | ((v1Bytes[7] >> 4) & 0x0f), ((v1Bytes[7] & 0x0f) << 4) | ((v1Bytes[4] & 0xf0) >> 4), ((v1Bytes[4] & 0x0f) << 4) | ((v1Bytes[5] & 0xf0) >> 4), ((v1Bytes[5] & 0x0f) << 4) | ((v1Bytes[0] & 0xf0) >> 4), ((v1Bytes[0] & 0x0f) << 4) | ((v1Bytes[1] & 0xf0) >> 4), ((v1Bytes[1] & 0x0f) << 4) | ((v1Bytes[2] & 0xf0) >> 4), 0x60 | (v1Bytes[2] & 0x0f), v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
	}
	return v1ToV6;
}

var v3 = {};

var md5 = {};

var hasRequiredMd5;

function requireMd5 () {
	if (hasRequiredMd5) return md5;
	hasRequiredMd5 = 1;
	Object.defineProperty(md5, "__esModule", { value: true });
	const crypto_1 = require$$0$4;
	function md5$1(bytes) {
	    if (Array.isArray(bytes)) {
	        bytes = Buffer.from(bytes);
	    }
	    else if (typeof bytes === 'string') {
	        bytes = Buffer.from(bytes, 'utf8');
	    }
	    return (0, crypto_1.createHash)('md5').update(bytes).digest();
	}
	md5.default = md5$1;
	return md5;
}

var v35 = {};

var hasRequiredV35;

function requireV35 () {
	if (hasRequiredV35) return v35;
	hasRequiredV35 = 1;
	Object.defineProperty(v35, "__esModule", { value: true });
	v35.URL = v35.DNS = undefined;
	v35.stringToBytes = stringToBytes;
	v35.default = v35$1;
	const parse_js_1 = requireParse();
	const stringify_js_1 = requireStringify();
	function stringToBytes(str) {
	    str = unescape(encodeURIComponent(str));
	    const bytes = new Uint8Array(str.length);
	    for (let i = 0; i < str.length; ++i) {
	        bytes[i] = str.charCodeAt(i);
	    }
	    return bytes;
	}
	v35.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
	v35.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
	function v35$1(version, hash, value, namespace, buf, offset) {
	    const valueBytes = typeof value === 'string' ? stringToBytes(value) : value;
	    const namespaceBytes = typeof namespace === 'string' ? (0, parse_js_1.default)(namespace) : namespace;
	    if (typeof namespace === 'string') {
	        namespace = (0, parse_js_1.default)(namespace);
	    }
	    if (namespace?.length !== 16) {
	        throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
	    }
	    let bytes = new Uint8Array(16 + valueBytes.length);
	    bytes.set(namespaceBytes);
	    bytes.set(valueBytes, namespaceBytes.length);
	    bytes = hash(bytes);
	    bytes[6] = (bytes[6] & 0x0f) | version;
	    bytes[8] = (bytes[8] & 0x3f) | 0x80;
	    if (buf) {
	        offset = offset || 0;
	        for (let i = 0; i < 16; ++i) {
	            buf[offset + i] = bytes[i];
	        }
	        return buf;
	    }
	    return (0, stringify_js_1.unsafeStringify)(bytes);
	}
	return v35;
}

var hasRequiredV3;

function requireV3 () {
	if (hasRequiredV3) return v3;
	hasRequiredV3 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.URL = exports.DNS = undefined;
		const md5_js_1 = requireMd5();
		const v35_js_1 = requireV35();
		var v35_js_2 = requireV35();
		Object.defineProperty(exports, "DNS", { enumerable: true, get: function () { return v35_js_2.DNS; } });
		Object.defineProperty(exports, "URL", { enumerable: true, get: function () { return v35_js_2.URL; } });
		function v3(value, namespace, buf, offset) {
		    return (0, v35_js_1.default)(0x30, md5_js_1.default, value, namespace, buf, offset);
		}
		v3.DNS = v35_js_1.DNS;
		v3.URL = v35_js_1.URL;
		exports.default = v3; 
	} (v3));
	return v3;
}

var v4 = {};

var native = {};

var hasRequiredNative;

function requireNative () {
	if (hasRequiredNative) return native;
	hasRequiredNative = 1;
	Object.defineProperty(native, "__esModule", { value: true });
	const crypto_1 = require$$0$4;
	native.default = { randomUUID: crypto_1.randomUUID };
	return native;
}

var hasRequiredV4;

function requireV4 () {
	if (hasRequiredV4) return v4;
	hasRequiredV4 = 1;
	Object.defineProperty(v4, "__esModule", { value: true });
	const native_js_1 = requireNative();
	const rng_js_1 = requireRng();
	const stringify_js_1 = requireStringify();
	function v4$1(options, buf, offset) {
	    if (native_js_1.default.randomUUID && !buf && !options) {
	        return native_js_1.default.randomUUID();
	    }
	    options = options || {};
	    const rnds = options.random ?? options.rng?.() ?? (0, rng_js_1.default)();
	    if (rnds.length < 16) {
	        throw new Error('Random bytes length must be >= 16');
	    }
	    rnds[6] = (rnds[6] & 0x0f) | 0x40;
	    rnds[8] = (rnds[8] & 0x3f) | 0x80;
	    if (buf) {
	        offset = offset || 0;
	        if (offset < 0 || offset + 16 > buf.length) {
	            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
	        }
	        for (let i = 0; i < 16; ++i) {
	            buf[offset + i] = rnds[i];
	        }
	        return buf;
	    }
	    return (0, stringify_js_1.unsafeStringify)(rnds);
	}
	v4.default = v4$1;
	return v4;
}

var v5 = {};

var sha1 = {};

var hasRequiredSha1;

function requireSha1 () {
	if (hasRequiredSha1) return sha1;
	hasRequiredSha1 = 1;
	Object.defineProperty(sha1, "__esModule", { value: true });
	const crypto_1 = require$$0$4;
	function sha1$1(bytes) {
	    if (Array.isArray(bytes)) {
	        bytes = Buffer.from(bytes);
	    }
	    else if (typeof bytes === 'string') {
	        bytes = Buffer.from(bytes, 'utf8');
	    }
	    return (0, crypto_1.createHash)('sha1').update(bytes).digest();
	}
	sha1.default = sha1$1;
	return sha1;
}

var hasRequiredV5;

function requireV5 () {
	if (hasRequiredV5) return v5;
	hasRequiredV5 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.URL = exports.DNS = undefined;
		const sha1_js_1 = requireSha1();
		const v35_js_1 = requireV35();
		var v35_js_2 = requireV35();
		Object.defineProperty(exports, "DNS", { enumerable: true, get: function () { return v35_js_2.DNS; } });
		Object.defineProperty(exports, "URL", { enumerable: true, get: function () { return v35_js_2.URL; } });
		function v5(value, namespace, buf, offset) {
		    return (0, v35_js_1.default)(0x50, sha1_js_1.default, value, namespace, buf, offset);
		}
		v5.DNS = v35_js_1.DNS;
		v5.URL = v35_js_1.URL;
		exports.default = v5; 
	} (v5));
	return v5;
}

var v6 = {};

var hasRequiredV6;

function requireV6 () {
	if (hasRequiredV6) return v6;
	hasRequiredV6 = 1;
	Object.defineProperty(v6, "__esModule", { value: true });
	const stringify_js_1 = requireStringify();
	const v1_js_1 = requireV1();
	const v1ToV6_js_1 = requireV1ToV6();
	function v6$1(options, buf, offset) {
	    options ??= {};
	    offset ??= 0;
	    let bytes = (0, v1_js_1.default)({ ...options, _v6: true }, new Uint8Array(16));
	    bytes = (0, v1ToV6_js_1.default)(bytes);
	    if (buf) {
	        for (let i = 0; i < 16; i++) {
	            buf[offset + i] = bytes[i];
	        }
	        return buf;
	    }
	    return (0, stringify_js_1.unsafeStringify)(bytes);
	}
	v6.default = v6$1;
	return v6;
}

var v6ToV1 = {};

var hasRequiredV6ToV1;

function requireV6ToV1 () {
	if (hasRequiredV6ToV1) return v6ToV1;
	hasRequiredV6ToV1 = 1;
	Object.defineProperty(v6ToV1, "__esModule", { value: true });
	v6ToV1.default = v6ToV1$1;
	const parse_js_1 = requireParse();
	const stringify_js_1 = requireStringify();
	function v6ToV1$1(uuid) {
	    const v6Bytes = typeof uuid === 'string' ? (0, parse_js_1.default)(uuid) : uuid;
	    const v1Bytes = _v6ToV1(v6Bytes);
	    return typeof uuid === 'string' ? (0, stringify_js_1.unsafeStringify)(v1Bytes) : v1Bytes;
	}
	function _v6ToV1(v6Bytes) {
	    return Uint8Array.of(((v6Bytes[3] & 0x0f) << 4) | ((v6Bytes[4] >> 4) & 0x0f), ((v6Bytes[4] & 0x0f) << 4) | ((v6Bytes[5] & 0xf0) >> 4), ((v6Bytes[5] & 0x0f) << 4) | (v6Bytes[6] & 0x0f), v6Bytes[7], ((v6Bytes[1] & 0x0f) << 4) | ((v6Bytes[2] & 0xf0) >> 4), ((v6Bytes[2] & 0x0f) << 4) | ((v6Bytes[3] & 0xf0) >> 4), 0x10 | ((v6Bytes[0] & 0xf0) >> 4), ((v6Bytes[0] & 0x0f) << 4) | ((v6Bytes[1] & 0xf0) >> 4), v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
	}
	return v6ToV1;
}

var v7 = {};

var hasRequiredV7;

function requireV7 () {
	if (hasRequiredV7) return v7;
	hasRequiredV7 = 1;
	Object.defineProperty(v7, "__esModule", { value: true });
	v7.updateV7State = updateV7State;
	const rng_js_1 = requireRng();
	const stringify_js_1 = requireStringify();
	const _state = {};
	function v7$1(options, buf, offset) {
	    let bytes;
	    if (options) {
	        bytes = v7Bytes(options.random ?? options.rng?.() ?? (0, rng_js_1.default)(), options.msecs, options.seq, buf, offset);
	    }
	    else {
	        const now = Date.now();
	        const rnds = (0, rng_js_1.default)();
	        updateV7State(_state, now, rnds);
	        bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
	    }
	    return buf ? bytes : (0, stringify_js_1.unsafeStringify)(bytes);
	}
	function updateV7State(state, now, rnds) {
	    state.msecs ??= -Infinity;
	    state.seq ??= 0;
	    if (now > state.msecs) {
	        state.seq = (rnds[6] << 23) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
	        state.msecs = now;
	    }
	    else {
	        state.seq = (state.seq + 1) | 0;
	        if (state.seq === 0) {
	            state.msecs++;
	        }
	    }
	    return state;
	}
	function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
	    if (rnds.length < 16) {
	        throw new Error('Random bytes length must be >= 16');
	    }
	    if (!buf) {
	        buf = new Uint8Array(16);
	        offset = 0;
	    }
	    else {
	        if (offset < 0 || offset + 16 > buf.length) {
	            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
	        }
	    }
	    msecs ??= Date.now();
	    seq ??= ((rnds[6] * 0x7f) << 24) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
	    buf[offset++] = (msecs / 0x10000000000) & 0xff;
	    buf[offset++] = (msecs / 0x100000000) & 0xff;
	    buf[offset++] = (msecs / 0x1000000) & 0xff;
	    buf[offset++] = (msecs / 0x10000) & 0xff;
	    buf[offset++] = (msecs / 0x100) & 0xff;
	    buf[offset++] = msecs & 0xff;
	    buf[offset++] = 0x70 | ((seq >>> 28) & 0x0f);
	    buf[offset++] = (seq >>> 20) & 0xff;
	    buf[offset++] = 0x80 | ((seq >>> 14) & 0x3f);
	    buf[offset++] = (seq >>> 6) & 0xff;
	    buf[offset++] = ((seq << 2) & 0xff) | (rnds[10] & 0x03);
	    buf[offset++] = rnds[11];
	    buf[offset++] = rnds[12];
	    buf[offset++] = rnds[13];
	    buf[offset++] = rnds[14];
	    buf[offset++] = rnds[15];
	    return buf;
	}
	v7.default = v7$1;
	return v7;
}

var version$1 = {};

var hasRequiredVersion;

function requireVersion () {
	if (hasRequiredVersion) return version$1;
	hasRequiredVersion = 1;
	Object.defineProperty(version$1, "__esModule", { value: true });
	const validate_js_1 = requireValidate();
	function version(uuid) {
	    if (!(0, validate_js_1.default)(uuid)) {
	        throw TypeError('Invalid UUID');
	    }
	    return parseInt(uuid.slice(14, 15), 16);
	}
	version$1.default = version;
	return version$1;
}

var hasRequiredCjs;

function requireCjs () {
	if (hasRequiredCjs) return cjs;
	hasRequiredCjs = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.version = exports.validate = exports.v7 = exports.v6ToV1 = exports.v6 = exports.v5 = exports.v4 = exports.v3 = exports.v1ToV6 = exports.v1 = exports.stringify = exports.parse = exports.NIL = exports.MAX = undefined;
		var max_js_1 = requireMax();
		Object.defineProperty(exports, "MAX", { enumerable: true, get: function () { return max_js_1.default; } });
		var nil_js_1 = requireNil();
		Object.defineProperty(exports, "NIL", { enumerable: true, get: function () { return nil_js_1.default; } });
		var parse_js_1 = requireParse();
		Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parse_js_1.default; } });
		var stringify_js_1 = requireStringify();
		Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return stringify_js_1.default; } });
		var v1_js_1 = requireV1();
		Object.defineProperty(exports, "v1", { enumerable: true, get: function () { return v1_js_1.default; } });
		var v1ToV6_js_1 = requireV1ToV6();
		Object.defineProperty(exports, "v1ToV6", { enumerable: true, get: function () { return v1ToV6_js_1.default; } });
		var v3_js_1 = requireV3();
		Object.defineProperty(exports, "v3", { enumerable: true, get: function () { return v3_js_1.default; } });
		var v4_js_1 = requireV4();
		Object.defineProperty(exports, "v4", { enumerable: true, get: function () { return v4_js_1.default; } });
		var v5_js_1 = requireV5();
		Object.defineProperty(exports, "v5", { enumerable: true, get: function () { return v5_js_1.default; } });
		var v6_js_1 = requireV6();
		Object.defineProperty(exports, "v6", { enumerable: true, get: function () { return v6_js_1.default; } });
		var v6ToV1_js_1 = requireV6ToV1();
		Object.defineProperty(exports, "v6ToV1", { enumerable: true, get: function () { return v6ToV1_js_1.default; } });
		var v7_js_1 = requireV7();
		Object.defineProperty(exports, "v7", { enumerable: true, get: function () { return v7_js_1.default; } });
		var validate_js_1 = requireValidate();
		Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validate_js_1.default; } });
		var version_js_1 = requireVersion();
		Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_js_1.default; } }); 
	} (cjs));
	return cjs;
}

var plugin_command;
var hasRequiredPlugin_command;

function requirePlugin_command () {
	if (hasRequiredPlugin_command) return plugin_command;
	hasRequiredPlugin_command = 1;
	const uuidv4 = /*@__PURE__*/ requireCjs().v4;
	// plugin_command.js
	// This class represents a plugin command structure.

	class PluginCommand {
	  constructor(type, payload, uuid, status) {
	    this.type = type;
	    this.payload = payload;
	    this.timestamp = Date.now();
	    this.uuid = uuid || uuidv4();
	    this.status = status || 'pending';
	  }

	  toString() {
	    // Returns a concise description for logging
	    return `PluginCommand(type=${this.type}, uuid=${this.uuid})`;
	  }

	  toJSON() {
	    // Encodes the command object to JSON format
	    return {
	      type: this.type,
	      payload: this.payload,
	      timestamp: this.timestamp,
	      uuid: this.uuid,
	      status: this.status
	    };
	  }

	  static fromJSON(json) {
	    // Builds a command object from JSON
	    const obj = typeof json === 'string' ? JSON.parse(json) : json;
	    return new PluginCommand(obj.type, obj.payload, obj.uuid, obj.status);
	  }
	}

	plugin_command = PluginCommand;
	return plugin_command;
}

var winston = {};

var logform = {};

var format$1;
var hasRequiredFormat;

function requireFormat () {
	if (hasRequiredFormat) return format$1;
	hasRequiredFormat = 1;

	/*
	 * Displays a helpful message and the source of
	 * the format when it is invalid.
	 */
	class InvalidFormatError extends Error {
	  constructor(formatFn) {
	    super(`Format functions must be synchronous taking a two arguments: (info, opts)
Found: ${formatFn.toString().split('\n')[0]}\n`);

	    Error.captureStackTrace(this, InvalidFormatError);
	  }
	}

	/*
	 * function format (formatFn)
	 * Returns a create function for the `formatFn`.
	 */
	format$1 = formatFn => {
	  if (formatFn.length > 2) {
	    throw new InvalidFormatError(formatFn);
	  }

	  /*
	   * function Format (options)
	   * Base prototype which calls a `_format`
	   * function and pushes the result.
	   */
	  function Format(options = {}) {
	    this.options = options;
	  }

	  Format.prototype.transform = formatFn;

	  //
	  // Create a function which returns new instances of
	  // FormatWrap for simple syntax like:
	  //
	  // require('winston').formats.json();
	  //
	  function createFormatWrap(opts) {
	    return new Format(opts);
	  }

	  //
	  // Expose the FormatWrap through the create function
	  // for testability.
	  //
	  createFormatWrap.Format = Format;
	  return createFormatWrap;
	};
	return format$1;
}

var colorize = {exports: {}};

var safe = {exports: {}};

var colors = {exports: {}};

var styles = {exports: {}};

/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var hasRequiredStyles;

function requireStyles () {
	if (hasRequiredStyles) return styles.exports;
	hasRequiredStyles = 1;
	(function (module) {
		var styles = {};
		module['exports'] = styles;

		var codes = {
		  reset: [0, 0],

		  bold: [1, 22],
		  dim: [2, 22],
		  italic: [3, 23],
		  underline: [4, 24],
		  inverse: [7, 27],
		  hidden: [8, 28],
		  strikethrough: [9, 29],

		  black: [30, 39],
		  red: [31, 39],
		  green: [32, 39],
		  yellow: [33, 39],
		  blue: [34, 39],
		  magenta: [35, 39],
		  cyan: [36, 39],
		  white: [37, 39],
		  gray: [90, 39],
		  grey: [90, 39],

		  brightRed: [91, 39],
		  brightGreen: [92, 39],
		  brightYellow: [93, 39],
		  brightBlue: [94, 39],
		  brightMagenta: [95, 39],
		  brightCyan: [96, 39],
		  brightWhite: [97, 39],

		  bgBlack: [40, 49],
		  bgRed: [41, 49],
		  bgGreen: [42, 49],
		  bgYellow: [43, 49],
		  bgBlue: [44, 49],
		  bgMagenta: [45, 49],
		  bgCyan: [46, 49],
		  bgWhite: [47, 49],
		  bgGray: [100, 49],
		  bgGrey: [100, 49],

		  bgBrightRed: [101, 49],
		  bgBrightGreen: [102, 49],
		  bgBrightYellow: [103, 49],
		  bgBrightBlue: [104, 49],
		  bgBrightMagenta: [105, 49],
		  bgBrightCyan: [106, 49],
		  bgBrightWhite: [107, 49],

		  // legacy styles for colors pre v1.0.0
		  blackBG: [40, 49],
		  redBG: [41, 49],
		  greenBG: [42, 49],
		  yellowBG: [43, 49],
		  blueBG: [44, 49],
		  magentaBG: [45, 49],
		  cyanBG: [46, 49],
		  whiteBG: [47, 49],

		};

		Object.keys(codes).forEach(function(key) {
		  var val = codes[key];
		  var style = styles[key] = [];
		  style.open = '\u001b[' + val[0] + 'm';
		  style.close = '\u001b[' + val[1] + 'm';
		}); 
	} (styles));
	return styles.exports;
}

/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var hasFlag;
var hasRequiredHasFlag;

function requireHasFlag () {
	if (hasRequiredHasFlag) return hasFlag;
	hasRequiredHasFlag = 1;

	hasFlag = function(flag, argv) {
	  argv = argv || process.argv || [];

	  var terminatorPos = argv.indexOf('--');
	  var prefix = /^-{1,2}/.test(flag) ? '' : '--';
	  var pos = argv.indexOf(prefix + flag);

	  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
	};
	return hasFlag;
}

/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var supportsColors;
var hasRequiredSupportsColors;

function requireSupportsColors () {
	if (hasRequiredSupportsColors) return supportsColors;
	hasRequiredSupportsColors = 1;

	var os = require$$0$6;
	var hasFlag = requireHasFlag();

	var env = process.env;

	var forceColor = undefined;
	if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
	  forceColor = false;
	} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true')
	           || hasFlag('color=always')) {
	  forceColor = true;
	}
	if ('FORCE_COLOR' in env) {
	  forceColor = env.FORCE_COLOR.length === 0
	    || parseInt(env.FORCE_COLOR, 10) !== 0;
	}

	function translateLevel(level) {
	  if (level === 0) {
	    return false;
	  }

	  return {
	    level: level,
	    hasBasic: true,
	    has256: level >= 2,
	    has16m: level >= 3,
	  };
	}

	function supportsColor(stream) {
	  if (forceColor === false) {
	    return 0;
	  }

	  if (hasFlag('color=16m') || hasFlag('color=full')
	      || hasFlag('color=truecolor')) {
	    return 3;
	  }

	  if (hasFlag('color=256')) {
	    return 2;
	  }

	  if (stream && !stream.isTTY && forceColor !== true) {
	    return 0;
	  }

	  var min = forceColor ? 1 : 0;

	  if (process.platform === 'win32') {
	    // Node.js 7.5.0 is the first version of Node.js to include a patch to
	    // libuv that enables 256 color output on Windows. Anything earlier and it
	    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
	    // release, and Node.js 7 is not. Windows 10 build 10586 is the first
	    // Windows release that supports 256 colors. Windows 10 build 14931 is the
	    // first release that supports 16m/TrueColor.
	    var osRelease = os.release().split('.');
	    if (Number(process.versions.node.split('.')[0]) >= 8
	        && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
	      return Number(osRelease[2]) >= 14931 ? 3 : 2;
	    }

	    return 1;
	  }

	  if ('CI' in env) {
	    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function(sign) {
	      return sign in env;
	    }) || env.CI_NAME === 'codeship') {
	      return 1;
	    }

	    return min;
	  }

	  if ('TEAMCITY_VERSION' in env) {
	    return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0
	    );
	  }

	  if ('TERM_PROGRAM' in env) {
	    var version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

	    switch (env.TERM_PROGRAM) {
	      case 'iTerm.app':
	        return version >= 3 ? 3 : 2;
	      case 'Hyper':
	        return 3;
	      case 'Apple_Terminal':
	        return 2;
	      // No default
	    }
	  }

	  if (/-256(color)?$/i.test(env.TERM)) {
	    return 2;
	  }

	  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
	    return 1;
	  }

	  if ('COLORTERM' in env) {
	    return 1;
	  }

	  if (env.TERM === 'dumb') {
	    return min;
	  }

	  return min;
	}

	function getSupportLevel(stream) {
	  var level = supportsColor(stream);
	  return translateLevel(level);
	}

	supportsColors = {
	  supportsColor: getSupportLevel,
	  stdout: getSupportLevel(process.stdout),
	  stderr: getSupportLevel(process.stderr),
	};
	return supportsColors;
}

var trap = {exports: {}};

var hasRequiredTrap;

function requireTrap () {
	if (hasRequiredTrap) return trap.exports;
	hasRequiredTrap = 1;
	(function (module) {
		module['exports'] = function runTheTrap(text, options) {
		  var result = '';
		  text = text || 'Run the trap, drop the bass';
		  text = text.split('');
		  var trap = {
		    a: ['\u0040', '\u0104', '\u023a', '\u0245', '\u0394', '\u039b', '\u0414'],
		    b: ['\u00df', '\u0181', '\u0243', '\u026e', '\u03b2', '\u0e3f'],
		    c: ['\u00a9', '\u023b', '\u03fe'],
		    d: ['\u00d0', '\u018a', '\u0500', '\u0501', '\u0502', '\u0503'],
		    e: ['\u00cb', '\u0115', '\u018e', '\u0258', '\u03a3', '\u03be', '\u04bc',
		      '\u0a6c'],
		    f: ['\u04fa'],
		    g: ['\u0262'],
		    h: ['\u0126', '\u0195', '\u04a2', '\u04ba', '\u04c7', '\u050a'],
		    i: ['\u0f0f'],
		    j: ['\u0134'],
		    k: ['\u0138', '\u04a0', '\u04c3', '\u051e'],
		    l: ['\u0139'],
		    m: ['\u028d', '\u04cd', '\u04ce', '\u0520', '\u0521', '\u0d69'],
		    n: ['\u00d1', '\u014b', '\u019d', '\u0376', '\u03a0', '\u048a'],
		    o: ['\u00d8', '\u00f5', '\u00f8', '\u01fe', '\u0298', '\u047a', '\u05dd',
		      '\u06dd', '\u0e4f'],
		    p: ['\u01f7', '\u048e'],
		    q: ['\u09cd'],
		    r: ['\u00ae', '\u01a6', '\u0210', '\u024c', '\u0280', '\u042f'],
		    s: ['\u00a7', '\u03de', '\u03df', '\u03e8'],
		    t: ['\u0141', '\u0166', '\u0373'],
		    u: ['\u01b1', '\u054d'],
		    v: ['\u05d8'],
		    w: ['\u0428', '\u0460', '\u047c', '\u0d70'],
		    x: ['\u04b2', '\u04fe', '\u04fc', '\u04fd'],
		    y: ['\u00a5', '\u04b0', '\u04cb'],
		    z: ['\u01b5', '\u0240'],
		  };
		  text.forEach(function(c) {
		    c = c.toLowerCase();
		    var chars = trap[c] || [' '];
		    var rand = Math.floor(Math.random() * chars.length);
		    if (typeof trap[c] !== 'undefined') {
		      result += trap[c][rand];
		    } else {
		      result += c;
		    }
		  });
		  return result;
		}; 
	} (trap));
	return trap.exports;
}

var zalgo = {exports: {}};

var hasRequiredZalgo;

function requireZalgo () {
	if (hasRequiredZalgo) return zalgo.exports;
	hasRequiredZalgo = 1;
	(function (module) {
		// please no
		module['exports'] = function zalgo(text, options) {
		  text = text || '   he is here   ';
		  var soul = {
		    'up': [
		      '̍', '̎', '̄', '̅',
		      '̿', '̑', '̆', '̐',
		      '͒', '͗', '͑', '̇',
		      '̈', '̊', '͂', '̓',
		      '̈', '͊', '͋', '͌',
		      '̃', '̂', '̌', '͐',
		      '̀', '́', '̋', '̏',
		      '̒', '̓', '̔', '̽',
		      '̉', 'ͣ', 'ͤ', 'ͥ',
		      'ͦ', 'ͧ', 'ͨ', 'ͩ',
		      'ͪ', 'ͫ', 'ͬ', 'ͭ',
		      'ͮ', 'ͯ', '̾', '͛',
		      '͆', '̚',
		    ],
		    'down': [
		      '̖', '̗', '̘', '̙',
		      '̜', '̝', '̞', '̟',
		      '̠', '̤', '̥', '̦',
		      '̩', '̪', '̫', '̬',
		      '̭', '̮', '̯', '̰',
		      '̱', '̲', '̳', '̹',
		      '̺', '̻', '̼', 'ͅ',
		      '͇', '͈', '͉', '͍',
		      '͎', '͓', '͔', '͕',
		      '͖', '͙', '͚', '̣',
		    ],
		    'mid': [
		      '̕', '̛', '̀', '́',
		      '͘', '̡', '̢', '̧',
		      '̨', '̴', '̵', '̶',
		      '͜', '͝', '͞',
		      '͟', '͠', '͢', '̸',
		      '̷', '͡', ' ҉',
		    ],
		  };
		  var all = [].concat(soul.up, soul.down, soul.mid);

		  function randomNumber(range) {
		    var r = Math.floor(Math.random() * range);
		    return r;
		  }

		  function isChar(character) {
		    var bool = false;
		    all.filter(function(i) {
		      bool = (i === character);
		    });
		    return bool;
		  }


		  function heComes(text, options) {
		    var result = '';
		    var counts;
		    var l;
		    options = options || {};
		    options['up'] =
		      typeof options['up'] !== 'undefined' ? options['up'] : true;
		    options['mid'] =
		      typeof options['mid'] !== 'undefined' ? options['mid'] : true;
		    options['down'] =
		      typeof options['down'] !== 'undefined' ? options['down'] : true;
		    options['size'] =
		      typeof options['size'] !== 'undefined' ? options['size'] : 'maxi';
		    text = text.split('');
		    for (l in text) {
		      if (isChar(l)) {
		        continue;
		      }
		      result = result + text[l];
		      counts = {'up': 0, 'down': 0, 'mid': 0};
		      switch (options.size) {
		        case 'mini':
		          counts.up = randomNumber(8);
		          counts.mid = randomNumber(2);
		          counts.down = randomNumber(8);
		          break;
		        case 'maxi':
		          counts.up = randomNumber(16) + 3;
		          counts.mid = randomNumber(4) + 1;
		          counts.down = randomNumber(64) + 3;
		          break;
		        default:
		          counts.up = randomNumber(8) + 1;
		          counts.mid = randomNumber(6) / 2;
		          counts.down = randomNumber(8) + 1;
		          break;
		      }

		      var arr = ['up', 'mid', 'down'];
		      for (var d in arr) {
		        var index = arr[d];
		        for (var i = 0; i <= counts[index]; i++) {
		          if (options[index]) {
		            result = result + soul[index][randomNumber(soul[index].length)];
		          }
		        }
		      }
		    }
		    return result;
		  }
		  // don't summon him
		  return heComes(text, options);
		}; 
	} (zalgo));
	return zalgo.exports;
}

var america = {exports: {}};

var hasRequiredAmerica;

function requireAmerica () {
	if (hasRequiredAmerica) return america.exports;
	hasRequiredAmerica = 1;
	(function (module) {
		module['exports'] = function(colors) {
		  return function(letter, i, exploded) {
		    if (letter === ' ') return letter;
		    switch (i%3) {
		      case 0: return colors.red(letter);
		      case 1: return colors.white(letter);
		      case 2: return colors.blue(letter);
		    }
		  };
		}; 
	} (america));
	return america.exports;
}

var zebra = {exports: {}};

var hasRequiredZebra;

function requireZebra () {
	if (hasRequiredZebra) return zebra.exports;
	hasRequiredZebra = 1;
	(function (module) {
		module['exports'] = function(colors) {
		  return function(letter, i, exploded) {
		    return i % 2 === 0 ? letter : colors.inverse(letter);
		  };
		}; 
	} (zebra));
	return zebra.exports;
}

var rainbow = {exports: {}};

var hasRequiredRainbow;

function requireRainbow () {
	if (hasRequiredRainbow) return rainbow.exports;
	hasRequiredRainbow = 1;
	(function (module) {
		module['exports'] = function(colors) {
		  // RoY G BiV
		  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];
		  return function(letter, i, exploded) {
		    if (letter === ' ') {
		      return letter;
		    } else {
		      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
		    }
		  };
		}; 
	} (rainbow));
	return rainbow.exports;
}

var random = {exports: {}};

var hasRequiredRandom;

function requireRandom () {
	if (hasRequiredRandom) return random.exports;
	hasRequiredRandom = 1;
	(function (module) {
		module['exports'] = function(colors) {
		  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green',
		    'blue', 'white', 'cyan', 'magenta', 'brightYellow', 'brightRed',
		    'brightGreen', 'brightBlue', 'brightWhite', 'brightCyan', 'brightMagenta'];
		  return function(letter, i, exploded) {
		    return letter === ' ' ? letter :
		      colors[
		          available[Math.round(Math.random() * (available.length - 2))]
		      ](letter);
		  };
		}; 
	} (random));
	return random.exports;
}

/*

The MIT License (MIT)

Original Library
  - Copyright (c) Marak Squires

Additional functionality
 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var hasRequiredColors;

function requireColors () {
	if (hasRequiredColors) return colors.exports;
	hasRequiredColors = 1;
	(function (module) {
		var colors = {};
		module['exports'] = colors;

		colors.themes = {};

		var util = require$$0$7;
		var ansiStyles = colors.styles = requireStyles();
		var defineProps = Object.defineProperties;
		var newLineRegex = new RegExp(/[\r\n]+/g);

		colors.supportsColor = requireSupportsColors().supportsColor;

		if (typeof colors.enabled === 'undefined') {
		  colors.enabled = colors.supportsColor() !== false;
		}

		colors.enable = function() {
		  colors.enabled = true;
		};

		colors.disable = function() {
		  colors.enabled = false;
		};

		colors.stripColors = colors.strip = function(str) {
		  return ('' + str).replace(/\x1B\[\d+m/g, '');
		};

		// eslint-disable-next-line no-unused-vars
		colors.stylize = function stylize(str, style) {
		  if (!colors.enabled) {
		    return str+'';
		  }

		  var styleMap = ansiStyles[style];

		  // Stylize should work for non-ANSI styles, too
		  if (!styleMap && style in colors) {
		    // Style maps like trap operate as functions on strings;
		    // they don't have properties like open or close.
		    return colors[style](str);
		  }

		  return styleMap.open + str + styleMap.close;
		};

		var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
		var escapeStringRegexp = function(str) {
		  if (typeof str !== 'string') {
		    throw new TypeError('Expected a string');
		  }
		  return str.replace(matchOperatorsRe, '\\$&');
		};

		function build(_styles) {
		  var builder = function builder() {
		    return applyStyle.apply(builder, arguments);
		  };
		  builder._styles = _styles;
		  // __proto__ is used because we must return a function, but there is
		  // no way to create a function with a different prototype.
		  builder.__proto__ = proto;
		  return builder;
		}

		var styles = (function() {
		  var ret = {};
		  ansiStyles.grey = ansiStyles.gray;
		  Object.keys(ansiStyles).forEach(function(key) {
		    ansiStyles[key].closeRe =
		      new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
		    ret[key] = {
		      get: function() {
		        return build(this._styles.concat(key));
		      },
		    };
		  });
		  return ret;
		})();

		var proto = defineProps(function colors() {}, styles);

		function applyStyle() {
		  var args = Array.prototype.slice.call(arguments);

		  var str = args.map(function(arg) {
		    // Use weak equality check so we can colorize null/undefined in safe mode
		    if (arg != null && arg.constructor === String) {
		      return arg;
		    } else {
		      return util.inspect(arg);
		    }
		  }).join(' ');

		  if (!colors.enabled || !str) {
		    return str;
		  }

		  var newLinesPresent = str.indexOf('\n') != -1;

		  var nestedStyles = this._styles;

		  var i = nestedStyles.length;
		  while (i--) {
		    var code = ansiStyles[nestedStyles[i]];
		    str = code.open + str.replace(code.closeRe, code.open) + code.close;
		    if (newLinesPresent) {
		      str = str.replace(newLineRegex, function(match) {
		        return code.close + match + code.open;
		      });
		    }
		  }

		  return str;
		}

		colors.setTheme = function(theme) {
		  if (typeof theme === 'string') {
		    console.log('colors.setTheme now only accepts an object, not a string.  ' +
		      'If you are trying to set a theme from a file, it is now your (the ' +
		      'caller\'s) responsibility to require the file.  The old syntax ' +
		      'looked like colors.setTheme(__dirname + ' +
		      '\'/../themes/generic-logging.js\'); The new syntax looks like '+
		      'colors.setTheme(require(__dirname + ' +
		      '\'/../themes/generic-logging.js\'));');
		    return;
		  }
		  for (var style in theme) {
		    (function(style) {
		      colors[style] = function(str) {
		        if (typeof theme[style] === 'object') {
		          var out = str;
		          for (var i in theme[style]) {
		            out = colors[theme[style][i]](out);
		          }
		          return out;
		        }
		        return colors[theme[style]](str);
		      };
		    })(style);
		  }
		};

		function init() {
		  var ret = {};
		  Object.keys(styles).forEach(function(name) {
		    ret[name] = {
		      get: function() {
		        return build([name]);
		      },
		    };
		  });
		  return ret;
		}

		var sequencer = function sequencer(map, str) {
		  var exploded = str.split('');
		  exploded = exploded.map(map);
		  return exploded.join('');
		};

		// custom formatter methods
		colors.trap = requireTrap();
		colors.zalgo = requireZalgo();

		// maps
		colors.maps = {};
		colors.maps.america = requireAmerica()(colors);
		colors.maps.zebra = requireZebra()(colors);
		colors.maps.rainbow = requireRainbow()(colors);
		colors.maps.random = requireRandom()(colors);

		for (var map in colors.maps) {
		  (function(map) {
		    colors[map] = function(str) {
		      return sequencer(colors.maps[map], str);
		    };
		  })(map);
		}

		defineProps(colors, init()); 
	} (colors));
	return colors.exports;
}

var hasRequiredSafe;

function requireSafe () {
	if (hasRequiredSafe) return safe.exports;
	hasRequiredSafe = 1;
	(function (module) {
		//
		// Remark: Requiring this file will use the "safe" colors API,
		// which will not touch String.prototype.
		//
		//   var colors = require('colors/safe');
		//   colors.red("foo")
		//
		//
		var colors = requireColors();
		module['exports'] = colors; 
	} (safe));
	return safe.exports;
}

var tripleBeam = {};

var config$1 = {};

var cli$1 = {};

/**
 * cli.js: Config that conform to commonly used CLI logging levels.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredCli$1;

function requireCli$1 () {
	if (hasRequiredCli$1) return cli$1;
	hasRequiredCli$1 = 1;

	/**
	 * Default levels for the CLI configuration.
	 * @type {Object}
	 */
	cli$1.levels = {
	  error: 0,
	  warn: 1,
	  help: 2,
	  data: 3,
	  info: 4,
	  debug: 5,
	  prompt: 6,
	  verbose: 7,
	  input: 8,
	  silly: 9
	};

	/**
	 * Default colors for the CLI configuration.
	 * @type {Object}
	 */
	cli$1.colors = {
	  error: 'red',
	  warn: 'yellow',
	  help: 'cyan',
	  data: 'grey',
	  info: 'green',
	  debug: 'blue',
	  prompt: 'grey',
	  verbose: 'cyan',
	  input: 'grey',
	  silly: 'magenta'
	};
	return cli$1;
}

var npm = {};

/**
 * npm.js: Config that conform to npm logging levels.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredNpm;

function requireNpm () {
	if (hasRequiredNpm) return npm;
	hasRequiredNpm = 1;

	/**
	 * Default levels for the npm configuration.
	 * @type {Object}
	 */
	npm.levels = {
	  error: 0,
	  warn: 1,
	  info: 2,
	  http: 3,
	  verbose: 4,
	  debug: 5,
	  silly: 6
	};

	/**
	 * Default levels for the npm configuration.
	 * @type {Object}
	 */
	npm.colors = {
	  error: 'red',
	  warn: 'yellow',
	  info: 'green',
	  http: 'green',
	  verbose: 'cyan',
	  debug: 'blue',
	  silly: 'magenta'
	};
	return npm;
}

var syslog = {};

/**
 * syslog.js: Config that conform to syslog logging levels.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredSyslog;

function requireSyslog () {
	if (hasRequiredSyslog) return syslog;
	hasRequiredSyslog = 1;

	/**
	 * Default levels for the syslog configuration.
	 * @type {Object}
	 */
	syslog.levels = {
	  emerg: 0,
	  alert: 1,
	  crit: 2,
	  error: 3,
	  warning: 4,
	  notice: 5,
	  info: 6,
	  debug: 7
	};

	/**
	 * Default levels for the syslog configuration.
	 * @type {Object}
	 */
	syslog.colors = {
	  emerg: 'red',
	  alert: 'yellow',
	  crit: 'red',
	  error: 'red',
	  warning: 'red',
	  notice: 'yellow',
	  info: 'green',
	  debug: 'blue'
	};
	return syslog;
}

/**
 * index.js: Default settings for all levels that winston knows about.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredConfig$1;

function requireConfig$1 () {
	if (hasRequiredConfig$1) return config$1;
	hasRequiredConfig$1 = 1;
	(function (exports) {

		/**
		 * Export config set for the CLI.
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'cli', {
		  value: requireCli$1()
		});

		/**
		 * Export config set for npm.
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'npm', {
		  value: requireNpm()
		});

		/**
		 * Export config set for the syslog.
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'syslog', {
		  value: requireSyslog()
		}); 
	} (config$1));
	return config$1;
}

var hasRequiredTripleBeam;

function requireTripleBeam () {
	if (hasRequiredTripleBeam) return tripleBeam;
	hasRequiredTripleBeam = 1;
	(function (exports) {

		/**
		 * A shareable symbol constant that can be used
		 * as a non-enumerable / semi-hidden level identifier
		 * to allow the readable level property to be mutable for
		 * operations like colorization
		 *
		 * @type {Symbol}
		 */
		Object.defineProperty(exports, 'LEVEL', {
		  value: Symbol.for('level')
		});

		/**
		 * A shareable symbol constant that can be used
		 * as a non-enumerable / semi-hidden message identifier
		 * to allow the final message property to not have
		 * side effects on another.
		 *
		 * @type {Symbol}
		 */
		Object.defineProperty(exports, 'MESSAGE', {
		  value: Symbol.for('message')
		});

		/**
		 * A shareable symbol constant that can be used
		 * as a non-enumerable / semi-hidden message identifier
		 * to allow the extracted splat property be hidden
		 *
		 * @type {Symbol}
		 */
		Object.defineProperty(exports, 'SPLAT', {
		  value: Symbol.for('splat')
		});

		/**
		 * A shareable object constant  that can be used
		 * as a standard configuration for winston@3.
		 *
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'configs', {
		  value: requireConfig$1()
		}); 
	} (tripleBeam));
	return tripleBeam;
}

var hasRequiredColorize;

function requireColorize () {
	if (hasRequiredColorize) return colorize.exports;
	hasRequiredColorize = 1;

	const colors = requireSafe();
	const { LEVEL, MESSAGE } = requireTripleBeam();

	//
	// Fix colors not appearing in non-tty environments
	//
	colors.enabled = true;

	/**
	 * @property {RegExp} hasSpace
	 * Simple regex to check for presence of spaces.
	 */
	const hasSpace = /\s+/;

	/*
	 * Colorizer format. Wraps the `level` and/or `message` properties
	 * of the `info` objects with ANSI color codes based on a few options.
	 */
	class Colorizer {
	  constructor(opts = {}) {
	    if (opts.colors) {
	      this.addColors(opts.colors);
	    }

	    this.options = opts;
	  }

	  /*
	   * Adds the colors Object to the set of allColors
	   * known by the Colorizer
	   *
	   * @param {Object} colors Set of color mappings to add.
	   */
	  static addColors(clrs) {
	    const nextColors = Object.keys(clrs).reduce((acc, level) => {
	      acc[level] = hasSpace.test(clrs[level])
	        ? clrs[level].split(hasSpace)
	        : clrs[level];

	      return acc;
	    }, {});

	    Colorizer.allColors = Object.assign({}, Colorizer.allColors || {}, nextColors);
	    return Colorizer.allColors;
	  }

	  /*
	   * Adds the colors Object to the set of allColors
	   * known by the Colorizer
	   *
	   * @param {Object} colors Set of color mappings to add.
	   */
	  addColors(clrs) {
	    return Colorizer.addColors(clrs);
	  }

	  /*
	   * function colorize (lookup, level, message)
	   * Performs multi-step colorization using @colors/colors/safe
	   */
	  colorize(lookup, level, message) {
	    if (typeof message === 'undefined') {
	      message = level;
	    }

	    //
	    // If the color for the level is just a string
	    // then attempt to colorize the message with it.
	    //
	    if (!Array.isArray(Colorizer.allColors[lookup])) {
	      return colors[Colorizer.allColors[lookup]](message);
	    }

	    //
	    // If it is an Array then iterate over that Array, applying
	    // the colors function for each item.
	    //
	    for (let i = 0, len = Colorizer.allColors[lookup].length; i < len; i++) {
	      message = colors[Colorizer.allColors[lookup][i]](message);
	    }

	    return message;
	  }

	  /*
	   * function transform (info, opts)
	   * Attempts to colorize the { level, message } of the given
	   * `logform` info object.
	   */
	  transform(info, opts) {
	    if (opts.all && typeof info[MESSAGE] === 'string') {
	      info[MESSAGE] = this.colorize(info[LEVEL], info.level, info[MESSAGE]);
	    }

	    if (opts.level || opts.all || !opts.message) {
	      info.level = this.colorize(info[LEVEL], info.level);
	    }

	    if (opts.all || opts.message) {
	      info.message = this.colorize(info[LEVEL], info.level, info.message);
	    }

	    return info;
	  }
	}

	/*
	 * function colorize (info)
	 * Returns a new instance of the colorize Format that applies
	 * level colors to `info` objects. This was previously exposed
	 * as { colorize: true } to transports in `winston < 3.0.0`.
	 */
	colorize.exports = opts => new Colorizer(opts);

	//
	// Attach the Colorizer for registration purposes
	//
	colorize.exports.Colorizer
	  = colorize.exports.Format
	  = Colorizer;
	return colorize.exports;
}

var levels;
var hasRequiredLevels;

function requireLevels () {
	if (hasRequiredLevels) return levels;
	hasRequiredLevels = 1;

	const { Colorizer } = requireColorize();

	/*
	 * Simple method to register colors with a simpler require
	 * path within the module.
	 */
	levels = config => {
	  Colorizer.addColors(config.colors || config);
	  return config;
	};
	return levels;
}

var align;
var hasRequiredAlign;

function requireAlign () {
	if (hasRequiredAlign) return align;
	hasRequiredAlign = 1;

	const format = requireFormat();

	/*
	 * function align (info)
	 * Returns a new instance of the align Format which adds a `\t`
	 * delimiter before the message to properly align it in the same place.
	 * It was previously { align: true } in winston < 3.0.0
	 */
	align = format(info => {
	  info.message = `\t${info.message}`;
	  return info;
	});
	return align;
}

/* eslint no-undefined: 0 */

var errors$1;
var hasRequiredErrors$1;

function requireErrors$1 () {
	if (hasRequiredErrors$1) return errors$1;
	hasRequiredErrors$1 = 1;

	const format = requireFormat();
	const { LEVEL, MESSAGE } = requireTripleBeam();

	/*
	 * function errors (info)
	 * If the `message` property of the `info` object is an instance of `Error`,
	 * replace the `Error` object its own `message` property.
	 *
	 * Optionally, the Error's `stack` and/or `cause` properties can also be appended to the `info` object.
	 */
	errors$1 = format((einfo, { stack, cause }) => {
	  if (einfo instanceof Error) {
	    const info = Object.assign({}, einfo, {
	      level: einfo.level,
	      [LEVEL]: einfo[LEVEL] || einfo.level,
	      message: einfo.message,
	      [MESSAGE]: einfo[MESSAGE] || einfo.message
	    });

	    if (stack) info.stack = einfo.stack;
	    if (cause) info.cause = einfo.cause;
	    return info;
	  }

	  if (!(einfo.message instanceof Error)) return einfo;

	  // Assign all enumerable properties and the
	  // message property from the error provided.
	  const err = einfo.message;
	  Object.assign(einfo, err);
	  einfo.message = err.message;
	  einfo[MESSAGE] = err.message;

	  // Assign the stack and/or cause if requested.
	  if (stack) einfo.stack = err.stack;
	  if (cause) einfo.cause = err.cause;
	  return einfo;
	});
	return errors$1;
}

var cli = {exports: {}};

var padLevels = {exports: {}};

/* eslint no-unused-vars: 0 */

var hasRequiredPadLevels;

function requirePadLevels () {
	if (hasRequiredPadLevels) return padLevels.exports;
	hasRequiredPadLevels = 1;

	const { configs, LEVEL, MESSAGE } = requireTripleBeam();

	class Padder {
	  constructor(opts = { levels: configs.npm.levels }) {
	    this.paddings = Padder.paddingForLevels(opts.levels, opts.filler);
	    this.options = opts;
	  }

	  /**
	   * Returns the maximum length of keys in the specified `levels` Object.
	   * @param  {Object} levels Set of all levels to calculate longest level against.
	   * @returns {Number} Maximum length of the longest level string.
	   */
	  static getLongestLevel(levels) {
	    const lvls = Object.keys(levels).map(level => level.length);
	    return Math.max(...lvls);
	  }

	  /**
	   * Returns the padding for the specified `level` assuming that the
	   * maximum length of all levels it's associated with is `maxLength`.
	   * @param  {String} level Level to calculate padding for.
	   * @param  {String} filler Repeatable text to use for padding.
	   * @param  {Number} maxLength Length of the longest level
	   * @returns {String} Padding string for the `level`
	   */
	  static paddingForLevel(level, filler, maxLength) {
	    const targetLen = maxLength + 1 - level.length;
	    const rep = Math.floor(targetLen / filler.length);
	    const padding = `${filler}${filler.repeat(rep)}`;
	    return padding.slice(0, targetLen);
	  }

	  /**
	   * Returns an object with the string paddings for the given `levels`
	   * using the specified `filler`.
	   * @param  {Object} levels Set of all levels to calculate padding for.
	   * @param  {String} filler Repeatable text to use for padding.
	   * @returns {Object} Mapping of level to desired padding.
	   */
	  static paddingForLevels(levels, filler = ' ') {
	    const maxLength = Padder.getLongestLevel(levels);
	    return Object.keys(levels).reduce((acc, level) => {
	      acc[level] = Padder.paddingForLevel(level, filler, maxLength);
	      return acc;
	    }, {});
	  }

	  /**
	   * Prepends the padding onto the `message` based on the `LEVEL` of
	   * the `info`. This is based on the behavior of `winston@2` which also
	   * prepended the level onto the message.
	   *
	   * See: https://github.com/winstonjs/winston/blob/2.x/lib/winston/logger.js#L198-L201
	   *
	   * @param  {Info} info Logform info object
	   * @param  {Object} opts Options passed along to this instance.
	   * @returns {Info} Modified logform info object.
	   */
	  transform(info, opts) {
	    info.message = `${this.paddings[info[LEVEL]]}${info.message}`;
	    if (info[MESSAGE]) {
	      info[MESSAGE] = `${this.paddings[info[LEVEL]]}${info[MESSAGE]}`;
	    }

	    return info;
	  }
	}

	/*
	 * function padLevels (info)
	 * Returns a new instance of the padLevels Format which pads
	 * levels to be the same length. This was previously exposed as
	 * { padLevels: true } to transports in `winston < 3.0.0`.
	 */
	padLevels.exports = opts => new Padder(opts);

	padLevels.exports.Padder
	  = padLevels.exports.Format
	  = Padder;
	return padLevels.exports;
}

var hasRequiredCli;

function requireCli () {
	if (hasRequiredCli) return cli.exports;
	hasRequiredCli = 1;

	const { Colorizer } = requireColorize();
	const { Padder } = requirePadLevels();
	const { configs, MESSAGE } = requireTripleBeam();


	/**
	 * Cli format class that handles initial state for a a separate
	 * Colorizer and Padder instance.
	 */
	class CliFormat {
	  constructor(opts = {}) {
	    if (!opts.levels) {
	      opts.levels = configs.cli.levels;
	    }

	    this.colorizer = new Colorizer(opts);
	    this.padder = new Padder(opts);
	    this.options = opts;
	  }

	  /*
	   * function transform (info, opts)
	   * Attempts to both:
	   * 1. Pad the { level }
	   * 2. Colorize the { level, message }
	   * of the given `logform` info object depending on the `opts`.
	   */
	  transform(info, opts) {
	    this.colorizer.transform(
	      this.padder.transform(info, opts),
	      opts
	    );

	    info[MESSAGE] = `${info.level}:${info.message}`;
	    return info;
	  }
	}

	/*
	 * function cli (opts)
	 * Returns a new instance of the CLI format that turns a log
	 * `info` object into the same format previously available
	 * in `winston.cli()` in `winston < 3.0.0`.
	 */
	cli.exports = opts => new CliFormat(opts);

	//
	// Attach the CliFormat for registration purposes
	//
	cli.exports.Format = CliFormat;
	return cli.exports;
}

var combine = {exports: {}};

var hasRequiredCombine;

function requireCombine () {
	if (hasRequiredCombine) return combine.exports;
	hasRequiredCombine = 1;

	const format = requireFormat();

	/*
	 * function cascade(formats)
	 * Returns a function that invokes the `._format` function in-order
	 * for the specified set of `formats`. In this manner we say that Formats
	 * are "pipe-like", but not a pure pumpify implementation. Since there is no back
	 * pressure we can remove all of the "readable" plumbing in Node streams.
	 */
	function cascade(formats) {
	  if (!formats.every(isValidFormat)) {
	    return;
	  }

	  return info => {
	    let obj = info;
	    for (let i = 0; i < formats.length; i++) {
	      obj = formats[i].transform(obj, formats[i].options);
	      if (!obj) {
	        return false;
	      }
	    }

	    return obj;
	  };
	}

	/*
	 * function isValidFormat(format)
	 * If the format does not define a `transform` function throw an error
	 * with more detailed usage.
	 */
	function isValidFormat(fmt) {
	  if (typeof fmt.transform !== 'function') {
	    throw new Error([
	      'No transform function found on format. Did you create a format instance?',
	      'const myFormat = format(formatFn);',
	      'const instance = myFormat();'
	    ].join('\n'));
	  }

	  return true;
	}

	/*
	 * function combine (info)
	 * Returns a new instance of the combine Format which combines the specified
	 * formats into a new format. This is similar to a pipe-chain in transform streams.
	 * We choose to combine the prototypes this way because there is no back pressure in
	 * an in-memory transform chain.
	 */
	combine.exports = (...formats) => {
	  const combinedFormat = format(cascade(formats));
	  const instance = combinedFormat();
	  instance.Format = combinedFormat.Format;
	  return instance;
	};

	//
	// Export the cascade method for use in cli and other
	// combined formats that should not be assumed to be
	// singletons.
	//
	combine.exports.cascade = cascade;
	return combine.exports;
}

var safeStableStringify = {exports: {}};

var hasRequiredSafeStableStringify;

function requireSafeStableStringify () {
	if (hasRequiredSafeStableStringify) return safeStableStringify.exports;
	hasRequiredSafeStableStringify = 1;
	(function (module, exports) {

		const { hasOwnProperty } = Object.prototype;

		const stringify = configure();

		// @ts-expect-error
		stringify.configure = configure;
		// @ts-expect-error
		stringify.stringify = stringify;

		// @ts-expect-error
		stringify.default = stringify;

		// @ts-expect-error used for named export
		exports.stringify = stringify;
		// @ts-expect-error used for named export
		exports.configure = configure;

		module.exports = stringify;

		// eslint-disable-next-line no-control-regex
		const strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;

		// Escape C0 control characters, double quotes, the backslash and every code
		// unit with a numeric value in the inclusive range 0xD800 to 0xDFFF.
		function strEscape (str) {
		  // Some magic numbers that worked out fine while benchmarking with v8 8.0
		  if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
		    return `"${str}"`
		  }
		  return JSON.stringify(str)
		}

		function sort (array, comparator) {
		  // Insertion sort is very efficient for small input sizes, but it has a bad
		  // worst case complexity. Thus, use native array sort for bigger values.
		  if (array.length > 2e2 || comparator) {
		    return array.sort(comparator)
		  }
		  for (let i = 1; i < array.length; i++) {
		    const currentValue = array[i];
		    let position = i;
		    while (position !== 0 && array[position - 1] > currentValue) {
		      array[position] = array[position - 1];
		      position--;
		    }
		    array[position] = currentValue;
		  }
		  return array
		}

		const typedArrayPrototypeGetSymbolToStringTag =
		  Object.getOwnPropertyDescriptor(
		    Object.getPrototypeOf(
		      Object.getPrototypeOf(
		        new Int8Array()
		      )
		    ),
		    Symbol.toStringTag
		  ).get;

		function isTypedArrayWithEntries (value) {
		  return typedArrayPrototypeGetSymbolToStringTag.call(value) !== undefined && value.length !== 0
		}

		function stringifyTypedArray (array, separator, maximumBreadth) {
		  if (array.length < maximumBreadth) {
		    maximumBreadth = array.length;
		  }
		  const whitespace = separator === ',' ? '' : ' ';
		  let res = `"0":${whitespace}${array[0]}`;
		  for (let i = 1; i < maximumBreadth; i++) {
		    res += `${separator}"${i}":${whitespace}${array[i]}`;
		  }
		  return res
		}

		function getCircularValueOption (options) {
		  if (hasOwnProperty.call(options, 'circularValue')) {
		    const circularValue = options.circularValue;
		    if (typeof circularValue === 'string') {
		      return `"${circularValue}"`
		    }
		    if (circularValue == null) {
		      return circularValue
		    }
		    if (circularValue === Error || circularValue === TypeError) {
		      return {
		        toString () {
		          throw new TypeError('Converting circular structure to JSON')
		        }
		      }
		    }
		    throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined')
		  }
		  return '"[Circular]"'
		}

		function getDeterministicOption (options) {
		  let value;
		  if (hasOwnProperty.call(options, 'deterministic')) {
		    value = options.deterministic;
		    if (typeof value !== 'boolean' && typeof value !== 'function') {
		      throw new TypeError('The "deterministic" argument must be of type boolean or comparator function')
		    }
		  }
		  return value === undefined ? true : value
		}

		function getBooleanOption (options, key) {
		  let value;
		  if (hasOwnProperty.call(options, key)) {
		    value = options[key];
		    if (typeof value !== 'boolean') {
		      throw new TypeError(`The "${key}" argument must be of type boolean`)
		    }
		  }
		  return value === undefined ? true : value
		}

		function getPositiveIntegerOption (options, key) {
		  let value;
		  if (hasOwnProperty.call(options, key)) {
		    value = options[key];
		    if (typeof value !== 'number') {
		      throw new TypeError(`The "${key}" argument must be of type number`)
		    }
		    if (!Number.isInteger(value)) {
		      throw new TypeError(`The "${key}" argument must be an integer`)
		    }
		    if (value < 1) {
		      throw new RangeError(`The "${key}" argument must be >= 1`)
		    }
		  }
		  return value === undefined ? Infinity : value
		}

		function getItemCount (number) {
		  if (number === 1) {
		    return '1 item'
		  }
		  return `${number} items`
		}

		function getUniqueReplacerSet (replacerArray) {
		  const replacerSet = new Set();
		  for (const value of replacerArray) {
		    if (typeof value === 'string' || typeof value === 'number') {
		      replacerSet.add(String(value));
		    }
		  }
		  return replacerSet
		}

		function getStrictOption (options) {
		  if (hasOwnProperty.call(options, 'strict')) {
		    const value = options.strict;
		    if (typeof value !== 'boolean') {
		      throw new TypeError('The "strict" argument must be of type boolean')
		    }
		    if (value) {
		      return (value) => {
		        let message = `Object can not safely be stringified. Received type ${typeof value}`;
		        if (typeof value !== 'function') message += ` (${value.toString()})`;
		        throw new Error(message)
		      }
		    }
		  }
		}

		function configure (options) {
		  options = { ...options };
		  const fail = getStrictOption(options);
		  if (fail) {
		    if (options.bigint === undefined) {
		      options.bigint = false;
		    }
		    if (!('circularValue' in options)) {
		      options.circularValue = Error;
		    }
		  }
		  const circularValue = getCircularValueOption(options);
		  const bigint = getBooleanOption(options, 'bigint');
		  const deterministic = getDeterministicOption(options);
		  const comparator = typeof deterministic === 'function' ? deterministic : undefined;
		  const maximumDepth = getPositiveIntegerOption(options, 'maximumDepth');
		  const maximumBreadth = getPositiveIntegerOption(options, 'maximumBreadth');

		  function stringifyFnReplacer (key, parent, stack, replacer, spacer, indentation) {
		    let value = parent[key];

		    if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
		      value = value.toJSON(key);
		    }
		    value = replacer.call(parent, key, value);

		    switch (typeof value) {
		      case 'string':
		        return strEscape(value)
		      case 'object': {
		        if (value === null) {
		          return 'null'
		        }
		        if (stack.indexOf(value) !== -1) {
		          return circularValue
		        }

		        let res = '';
		        let join = ',';
		        const originalIndentation = indentation;

		        if (Array.isArray(value)) {
		          if (value.length === 0) {
		            return '[]'
		          }
		          if (maximumDepth < stack.length + 1) {
		            return '"[Array]"'
		          }
		          stack.push(value);
		          if (spacer !== '') {
		            indentation += spacer;
		            res += `\n${indentation}`;
		            join = `,\n${indentation}`;
		          }
		          const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
		          let i = 0;
		          for (; i < maximumValuesToStringify - 1; i++) {
		            const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
		            res += tmp !== undefined ? tmp : 'null';
		            res += join;
		          }
		          const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
		          res += tmp !== undefined ? tmp : 'null';
		          if (value.length - 1 > maximumBreadth) {
		            const removedKeys = value.length - maximumBreadth - 1;
		            res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
		          }
		          if (spacer !== '') {
		            res += `\n${originalIndentation}`;
		          }
		          stack.pop();
		          return `[${res}]`
		        }

		        let keys = Object.keys(value);
		        const keyLength = keys.length;
		        if (keyLength === 0) {
		          return '{}'
		        }
		        if (maximumDepth < stack.length + 1) {
		          return '"[Object]"'
		        }
		        let whitespace = '';
		        let separator = '';
		        if (spacer !== '') {
		          indentation += spacer;
		          join = `,\n${indentation}`;
		          whitespace = ' ';
		        }
		        const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
		        if (deterministic && !isTypedArrayWithEntries(value)) {
		          keys = sort(keys, comparator);
		        }
		        stack.push(value);
		        for (let i = 0; i < maximumPropertiesToStringify; i++) {
		          const key = keys[i];
		          const tmp = stringifyFnReplacer(key, value, stack, replacer, spacer, indentation);
		          if (tmp !== undefined) {
		            res += `${separator}${strEscape(key)}:${whitespace}${tmp}`;
		            separator = join;
		          }
		        }
		        if (keyLength > maximumBreadth) {
		          const removedKeys = keyLength - maximumBreadth;
		          res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
		          separator = join;
		        }
		        if (spacer !== '' && separator.length > 1) {
		          res = `\n${indentation}${res}\n${originalIndentation}`;
		        }
		        stack.pop();
		        return `{${res}}`
		      }
		      case 'number':
		        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
		      case 'boolean':
		        return value === true ? 'true' : 'false'
		      case 'undefined':
		        return undefined
		      case 'bigint':
		        if (bigint) {
		          return String(value)
		        }
		        // fallthrough
		      default:
		        return fail ? fail(value) : undefined
		    }
		  }

		  function stringifyArrayReplacer (key, value, stack, replacer, spacer, indentation) {
		    if (typeof value === 'object' && value !== null && typeof value.toJSON === 'function') {
		      value = value.toJSON(key);
		    }

		    switch (typeof value) {
		      case 'string':
		        return strEscape(value)
		      case 'object': {
		        if (value === null) {
		          return 'null'
		        }
		        if (stack.indexOf(value) !== -1) {
		          return circularValue
		        }

		        const originalIndentation = indentation;
		        let res = '';
		        let join = ',';

		        if (Array.isArray(value)) {
		          if (value.length === 0) {
		            return '[]'
		          }
		          if (maximumDepth < stack.length + 1) {
		            return '"[Array]"'
		          }
		          stack.push(value);
		          if (spacer !== '') {
		            indentation += spacer;
		            res += `\n${indentation}`;
		            join = `,\n${indentation}`;
		          }
		          const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
		          let i = 0;
		          for (; i < maximumValuesToStringify - 1; i++) {
		            const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
		            res += tmp !== undefined ? tmp : 'null';
		            res += join;
		          }
		          const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
		          res += tmp !== undefined ? tmp : 'null';
		          if (value.length - 1 > maximumBreadth) {
		            const removedKeys = value.length - maximumBreadth - 1;
		            res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
		          }
		          if (spacer !== '') {
		            res += `\n${originalIndentation}`;
		          }
		          stack.pop();
		          return `[${res}]`
		        }
		        stack.push(value);
		        let whitespace = '';
		        if (spacer !== '') {
		          indentation += spacer;
		          join = `,\n${indentation}`;
		          whitespace = ' ';
		        }
		        let separator = '';
		        for (const key of replacer) {
		          const tmp = stringifyArrayReplacer(key, value[key], stack, replacer, spacer, indentation);
		          if (tmp !== undefined) {
		            res += `${separator}${strEscape(key)}:${whitespace}${tmp}`;
		            separator = join;
		          }
		        }
		        if (spacer !== '' && separator.length > 1) {
		          res = `\n${indentation}${res}\n${originalIndentation}`;
		        }
		        stack.pop();
		        return `{${res}}`
		      }
		      case 'number':
		        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
		      case 'boolean':
		        return value === true ? 'true' : 'false'
		      case 'undefined':
		        return undefined
		      case 'bigint':
		        if (bigint) {
		          return String(value)
		        }
		        // fallthrough
		      default:
		        return fail ? fail(value) : undefined
		    }
		  }

		  function stringifyIndent (key, value, stack, spacer, indentation) {
		    switch (typeof value) {
		      case 'string':
		        return strEscape(value)
		      case 'object': {
		        if (value === null) {
		          return 'null'
		        }
		        if (typeof value.toJSON === 'function') {
		          value = value.toJSON(key);
		          // Prevent calling `toJSON` again.
		          if (typeof value !== 'object') {
		            return stringifyIndent(key, value, stack, spacer, indentation)
		          }
		          if (value === null) {
		            return 'null'
		          }
		        }
		        if (stack.indexOf(value) !== -1) {
		          return circularValue
		        }
		        const originalIndentation = indentation;

		        if (Array.isArray(value)) {
		          if (value.length === 0) {
		            return '[]'
		          }
		          if (maximumDepth < stack.length + 1) {
		            return '"[Array]"'
		          }
		          stack.push(value);
		          indentation += spacer;
		          let res = `\n${indentation}`;
		          const join = `,\n${indentation}`;
		          const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
		          let i = 0;
		          for (; i < maximumValuesToStringify - 1; i++) {
		            const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
		            res += tmp !== undefined ? tmp : 'null';
		            res += join;
		          }
		          const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
		          res += tmp !== undefined ? tmp : 'null';
		          if (value.length - 1 > maximumBreadth) {
		            const removedKeys = value.length - maximumBreadth - 1;
		            res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
		          }
		          res += `\n${originalIndentation}`;
		          stack.pop();
		          return `[${res}]`
		        }

		        let keys = Object.keys(value);
		        const keyLength = keys.length;
		        if (keyLength === 0) {
		          return '{}'
		        }
		        if (maximumDepth < stack.length + 1) {
		          return '"[Object]"'
		        }
		        indentation += spacer;
		        const join = `,\n${indentation}`;
		        let res = '';
		        let separator = '';
		        let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
		        if (isTypedArrayWithEntries(value)) {
		          res += stringifyTypedArray(value, join, maximumBreadth);
		          keys = keys.slice(value.length);
		          maximumPropertiesToStringify -= value.length;
		          separator = join;
		        }
		        if (deterministic) {
		          keys = sort(keys, comparator);
		        }
		        stack.push(value);
		        for (let i = 0; i < maximumPropertiesToStringify; i++) {
		          const key = keys[i];
		          const tmp = stringifyIndent(key, value[key], stack, spacer, indentation);
		          if (tmp !== undefined) {
		            res += `${separator}${strEscape(key)}: ${tmp}`;
		            separator = join;
		          }
		        }
		        if (keyLength > maximumBreadth) {
		          const removedKeys = keyLength - maximumBreadth;
		          res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
		          separator = join;
		        }
		        if (separator !== '') {
		          res = `\n${indentation}${res}\n${originalIndentation}`;
		        }
		        stack.pop();
		        return `{${res}}`
		      }
		      case 'number':
		        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
		      case 'boolean':
		        return value === true ? 'true' : 'false'
		      case 'undefined':
		        return undefined
		      case 'bigint':
		        if (bigint) {
		          return String(value)
		        }
		        // fallthrough
		      default:
		        return fail ? fail(value) : undefined
		    }
		  }

		  function stringifySimple (key, value, stack) {
		    switch (typeof value) {
		      case 'string':
		        return strEscape(value)
		      case 'object': {
		        if (value === null) {
		          return 'null'
		        }
		        if (typeof value.toJSON === 'function') {
		          value = value.toJSON(key);
		          // Prevent calling `toJSON` again
		          if (typeof value !== 'object') {
		            return stringifySimple(key, value, stack)
		          }
		          if (value === null) {
		            return 'null'
		          }
		        }
		        if (stack.indexOf(value) !== -1) {
		          return circularValue
		        }

		        let res = '';

		        const hasLength = value.length !== undefined;
		        if (hasLength && Array.isArray(value)) {
		          if (value.length === 0) {
		            return '[]'
		          }
		          if (maximumDepth < stack.length + 1) {
		            return '"[Array]"'
		          }
		          stack.push(value);
		          const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
		          let i = 0;
		          for (; i < maximumValuesToStringify - 1; i++) {
		            const tmp = stringifySimple(String(i), value[i], stack);
		            res += tmp !== undefined ? tmp : 'null';
		            res += ',';
		          }
		          const tmp = stringifySimple(String(i), value[i], stack);
		          res += tmp !== undefined ? tmp : 'null';
		          if (value.length - 1 > maximumBreadth) {
		            const removedKeys = value.length - maximumBreadth - 1;
		            res += `,"... ${getItemCount(removedKeys)} not stringified"`;
		          }
		          stack.pop();
		          return `[${res}]`
		        }

		        let keys = Object.keys(value);
		        const keyLength = keys.length;
		        if (keyLength === 0) {
		          return '{}'
		        }
		        if (maximumDepth < stack.length + 1) {
		          return '"[Object]"'
		        }
		        let separator = '';
		        let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
		        if (hasLength && isTypedArrayWithEntries(value)) {
		          res += stringifyTypedArray(value, ',', maximumBreadth);
		          keys = keys.slice(value.length);
		          maximumPropertiesToStringify -= value.length;
		          separator = ',';
		        }
		        if (deterministic) {
		          keys = sort(keys, comparator);
		        }
		        stack.push(value);
		        for (let i = 0; i < maximumPropertiesToStringify; i++) {
		          const key = keys[i];
		          const tmp = stringifySimple(key, value[key], stack);
		          if (tmp !== undefined) {
		            res += `${separator}${strEscape(key)}:${tmp}`;
		            separator = ',';
		          }
		        }
		        if (keyLength > maximumBreadth) {
		          const removedKeys = keyLength - maximumBreadth;
		          res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
		        }
		        stack.pop();
		        return `{${res}}`
		      }
		      case 'number':
		        return isFinite(value) ? String(value) : fail ? fail(value) : 'null'
		      case 'boolean':
		        return value === true ? 'true' : 'false'
		      case 'undefined':
		        return undefined
		      case 'bigint':
		        if (bigint) {
		          return String(value)
		        }
		        // fallthrough
		      default:
		        return fail ? fail(value) : undefined
		    }
		  }

		  function stringify (value, replacer, space) {
		    if (arguments.length > 1) {
		      let spacer = '';
		      if (typeof space === 'number') {
		        spacer = ' '.repeat(Math.min(space, 10));
		      } else if (typeof space === 'string') {
		        spacer = space.slice(0, 10);
		      }
		      if (replacer != null) {
		        if (typeof replacer === 'function') {
		          return stringifyFnReplacer('', { '': value }, [], replacer, spacer, '')
		        }
		        if (Array.isArray(replacer)) {
		          return stringifyArrayReplacer('', value, [], getUniqueReplacerSet(replacer), spacer, '')
		        }
		      }
		      if (spacer.length !== 0) {
		        return stringifyIndent('', value, [], spacer, '')
		      }
		    }
		    return stringifySimple('', value, [])
		  }

		  return stringify
		} 
	} (safeStableStringify, safeStableStringify.exports));
	return safeStableStringify.exports;
}

var json;
var hasRequiredJson;

function requireJson () {
	if (hasRequiredJson) return json;
	hasRequiredJson = 1;

	const format = requireFormat();
	const { MESSAGE } = requireTripleBeam();
	const stringify = requireSafeStableStringify();

	/*
	 * function replacer (key, value)
	 * Handles proper stringification of Buffer and bigint output.
	 */
	function replacer(key, value) {
	  // safe-stable-stringify does support BigInt, however, it doesn't wrap the value in quotes.
	  // Leading to a loss in fidelity if the resulting string is parsed.
	  // It would also be a breaking change for logform.
	  if (typeof value === 'bigint')
	    return value.toString();
	  return value;
	}

	/*
	 * function json (info)
	 * Returns a new instance of the JSON format that turns a log `info`
	 * object into pure JSON. This was previously exposed as { json: true }
	 * to transports in `winston < 3.0.0`.
	 */
	json = format((info, opts) => {
	  const jsonStringify = stringify.configure(opts);
	  info[MESSAGE] = jsonStringify(info, opts.replacer || replacer, opts.space);
	  return info;
	});
	return json;
}

var label;
var hasRequiredLabel;

function requireLabel () {
	if (hasRequiredLabel) return label;
	hasRequiredLabel = 1;

	const format = requireFormat();

	/*
	 * function label (info)
	 * Returns a new instance of the label Format which adds the specified
	 * `opts.label` before the message. This was previously exposed as
	 * { label: 'my label' } to transports in `winston < 3.0.0`.
	 */
	label = format((info, opts) => {
	  if (opts.message) {
	    info.message = `[${opts.label}] ${info.message}`;
	    return info;
	  }

	  info.label = opts.label;
	  return info;
	});
	return label;
}

var logstash;
var hasRequiredLogstash;

function requireLogstash () {
	if (hasRequiredLogstash) return logstash;
	hasRequiredLogstash = 1;

	const format = requireFormat();
	const { MESSAGE } = requireTripleBeam();
	const jsonStringify = requireSafeStableStringify();

	/*
	 * function logstash (info)
	 * Returns a new instance of the LogStash Format that turns a
	 * log `info` object into pure JSON with the appropriate logstash
	 * options. This was previously exposed as { logstash: true }
	 * to transports in `winston < 3.0.0`.
	 */
	logstash = format(info => {
	  const logstash = {};
	  if (info.message) {
	    logstash['@message'] = info.message;
	    delete info.message;
	  }

	  if (info.timestamp) {
	    logstash['@timestamp'] = info.timestamp;
	    delete info.timestamp;
	  }

	  logstash['@fields'] = info;
	  info[MESSAGE] = jsonStringify(logstash);
	  return info;
	});
	return logstash;
}

var metadata;
var hasRequiredMetadata;

function requireMetadata () {
	if (hasRequiredMetadata) return metadata;
	hasRequiredMetadata = 1;

	const format = requireFormat();

	function fillExcept(info, fillExceptKeys, metadataKey) {
	  const savedKeys = fillExceptKeys.reduce((acc, key) => {
	    acc[key] = info[key];
	    delete info[key];
	    return acc;
	  }, {});
	  const metadata = Object.keys(info).reduce((acc, key) => {
	    acc[key] = info[key];
	    delete info[key];
	    return acc;
	  }, {});

	  Object.assign(info, savedKeys, {
	    [metadataKey]: metadata
	  });
	  return info;
	}

	function fillWith(info, fillWithKeys, metadataKey) {
	  info[metadataKey] = fillWithKeys.reduce((acc, key) => {
	    acc[key] = info[key];
	    delete info[key];
	    return acc;
	  }, {});
	  return info;
	}

	/**
	 * Adds in a "metadata" object to collect extraneous data, similar to the metadata
	 * object in winston 2.x.
	 */
	metadata = format((info, opts = {}) => {
	  let metadataKey = 'metadata';
	  if (opts.key) {
	    metadataKey = opts.key;
	  }

	  let fillExceptKeys = [];
	  if (!opts.fillExcept && !opts.fillWith) {
	    fillExceptKeys.push('level');
	    fillExceptKeys.push('message');
	  }

	  if (opts.fillExcept) {
	    fillExceptKeys = opts.fillExcept;
	  }

	  if (fillExceptKeys.length > 0) {
	    return fillExcept(info, fillExceptKeys, metadataKey);
	  }

	  if (opts.fillWith) {
	    return fillWith(info, opts.fillWith, metadataKey);
	  }

	  return info;
	});
	return metadata;
}

/**
 * Helpers.
 */

var ms;
var hasRequiredMs$1;

function requireMs$1 () {
	if (hasRequiredMs$1) return ms;
	hasRequiredMs$1 = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var ms_1;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms_1;
	hasRequiredMs = 1;

	const format = requireFormat();
	const ms = requireMs$1();

	/*
	 * function ms (info)
	 * Returns an `info` with a `ms` property. The `ms` property holds the Value
	 * of the time difference between two calls in milliseconds.
	 */
	ms_1 = format(info => {
	  const curr = +new Date();
	  this.diff = curr - (this.prevTime || curr);
	  this.prevTime = curr;
	  info.ms = `+${ms(this.diff)}`;

	  return info;
	});
	return ms_1;
}

var prettyPrint;
var hasRequiredPrettyPrint;

function requirePrettyPrint () {
	if (hasRequiredPrettyPrint) return prettyPrint;
	hasRequiredPrettyPrint = 1;

	const inspect = require$$0$7.inspect;
	const format = requireFormat();
	const { LEVEL, MESSAGE, SPLAT } = requireTripleBeam();

	/*
	 * function prettyPrint (info)
	 * Returns a new instance of the prettyPrint Format that "prettyPrint"
	 * serializes `info` objects. This was previously exposed as
	 * { prettyPrint: true } to transports in `winston < 3.0.0`.
	 */
	prettyPrint = format((info, opts = {}) => {
	  //
	  // info[{LEVEL, MESSAGE, SPLAT}] are enumerable here. Since they
	  // are internal, we remove them before util.inspect so they
	  // are not printed.
	  //
	  const stripped = Object.assign({}, info);

	  // Remark (indexzero): update this technique in April 2019
	  // when node@6 is EOL
	  delete stripped[LEVEL];
	  delete stripped[MESSAGE];
	  delete stripped[SPLAT];

	  info[MESSAGE] = inspect(stripped, false, opts.depth || null, opts.colorize);
	  return info;
	});
	return prettyPrint;
}

var printf = {exports: {}};

var hasRequiredPrintf;

function requirePrintf () {
	if (hasRequiredPrintf) return printf.exports;
	hasRequiredPrintf = 1;

	const { MESSAGE } = requireTripleBeam();

	class Printf {
	  constructor(templateFn) {
	    this.template = templateFn;
	  }

	  transform(info) {
	    info[MESSAGE] = this.template(info);
	    return info;
	  }
	}

	/*
	 * function printf (templateFn)
	 * Returns a new instance of the printf Format that creates an
	 * intermediate prototype to store the template string-based formatter
	 * function.
	 */
	printf.exports = opts => new Printf(opts);

	printf.exports.Printf
	  = printf.exports.Format
	  = Printf;
	return printf.exports;
}

/* eslint no-undefined: 0 */

var simple;
var hasRequiredSimple;

function requireSimple () {
	if (hasRequiredSimple) return simple;
	hasRequiredSimple = 1;

	const format = requireFormat();
	const { MESSAGE } = requireTripleBeam();
	const jsonStringify = requireSafeStableStringify();

	/*
	 * function simple (info)
	 * Returns a new instance of the simple format TransformStream
	 * which writes a simple representation of logs.
	 *
	 *    const { level, message, splat, ...rest } = info;
	 *
	 *    ${level}: ${message}                            if rest is empty
	 *    ${level}: ${message} ${JSON.stringify(rest)}    otherwise
	 */
	simple = format(info => {
	  const stringifiedRest = jsonStringify(Object.assign({}, info, {
	    level: undefined,
	    message: undefined,
	    splat: undefined
	  }));

	  const padding = info.padding && info.padding[info.level] || '';
	  if (stringifiedRest !== '{}') {
	    info[MESSAGE] = `${info.level}:${padding} ${info.message} ${stringifiedRest}`;
	  } else {
	    info[MESSAGE] = `${info.level}:${padding} ${info.message}`;
	  }

	  return info;
	});
	return simple;
}

var splat;
var hasRequiredSplat;

function requireSplat () {
	if (hasRequiredSplat) return splat;
	hasRequiredSplat = 1;

	const util = require$$0$7;
	const { SPLAT } = requireTripleBeam();

	/**
	 * Captures the number of format (i.e. %s strings) in a given string.
	 * Based on `util.format`, see Node.js source:
	 * https://github.com/nodejs/node/blob/b1c8f15c5f169e021f7c46eb7b219de95fe97603/lib/util.js#L201-L230
	 * @type {RegExp}
	 */
	const formatRegExp = /%[scdjifoO%]/g;

	/**
	 * Captures the number of escaped % signs in a format string (i.e. %s strings).
	 * @type {RegExp}
	 */
	const escapedPercent = /%%/g;

	class Splatter {
	  constructor(opts) {
	    this.options = opts;
	  }

	  /**
	     * Check to see if tokens <= splat.length, assign { splat, meta } into the
	     * `info` accordingly, and write to this instance.
	     *
	     * @param  {Info} info Logform info message.
	     * @param  {String[]} tokens Set of string interpolation tokens.
	     * @returns {Info} Modified info message
	     * @private
	     */
	  _splat(info, tokens) {
	    const msg = info.message;
	    const splat = info[SPLAT] || info.splat || [];
	    const percents = msg.match(escapedPercent);
	    const escapes = percents && percents.length || 0;

	    // The expected splat is the number of tokens minus the number of escapes
	    // e.g.
	    // - { expectedSplat: 3 } '%d %s %j'
	    // - { expectedSplat: 5 } '[%s] %d%% %d%% %s %j'
	    //
	    // Any "meta" will be arugments in addition to the expected splat size
	    // regardless of type. e.g.
	    //
	    // logger.log('info', '%d%% %s %j', 100, 'wow', { such: 'js' }, { thisIsMeta: true });
	    // would result in splat of four (4), but only three (3) are expected. Therefore:
	    //
	    // extraSplat = 3 - 4 = -1
	    // metas = [100, 'wow', { such: 'js' }, { thisIsMeta: true }].splice(-1, -1 * -1);
	    // splat = [100, 'wow', { such: 'js' }]
	    const expectedSplat = tokens.length - escapes;
	    const extraSplat = expectedSplat - splat.length;
	    const metas = extraSplat < 0
	      ? splat.splice(extraSplat, -1 * extraSplat)
	      : [];

	    // Now that { splat } has been separated from any potential { meta }. we
	    // can assign this to the `info` object and write it to our format stream.
	    // If the additional metas are **NOT** objects or **LACK** enumerable properties
	    // you are going to have a bad time.
	    const metalen = metas.length;
	    if (metalen) {
	      for (let i = 0; i < metalen; i++) {
	        Object.assign(info, metas[i]);
	      }
	    }

	    info.message = util.format(msg, ...splat);
	    return info;
	  }

	  /**
	    * Transforms the `info` message by using `util.format` to complete
	    * any `info.message` provided it has string interpolation tokens.
	    * If no tokens exist then `info` is immutable.
	    *
	    * @param  {Info} info Logform info message.
	    * @param  {Object} opts Options for this instance.
	    * @returns {Info} Modified info message
	    */
	  transform(info) {
	    const msg = info.message;
	    const splat = info[SPLAT] || info.splat;

	    // No need to process anything if splat is undefined
	    if (!splat || !splat.length) {
	      return info;
	    }

	    // Extract tokens, if none available default to empty array to
	    // ensure consistancy in expected results
	    const tokens = msg && msg.match && msg.match(formatRegExp);

	    // This condition will take care of inputs with info[SPLAT]
	    // but no tokens present
	    if (!tokens && (splat || splat.length)) {
	      const metas = splat.length > 1
	        ? splat.splice(0)
	        : splat;

	      // Now that { splat } has been separated from any potential { meta }. we
	      // can assign this to the `info` object and write it to our format stream.
	      // If the additional metas are **NOT** objects or **LACK** enumerable properties
	      // you are going to have a bad time.
	      const metalen = metas.length;
	      if (metalen) {
	        for (let i = 0; i < metalen; i++) {
	          Object.assign(info, metas[i]);
	        }
	      }

	      return info;
	    }

	    if (tokens) {
	      return this._splat(info, tokens);
	    }

	    return info;
	  }
	}

	/*
	 * function splat (info)
	 * Returns a new instance of the splat format TransformStream
	 * which performs string interpolation from `info` objects. This was
	 * previously exposed implicitly in `winston < 3.0.0`.
	 */
	splat = opts => new Splatter(opts);
	return splat;
}

var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
var twoDigitsOptional = "\\d\\d?";
var twoDigits = "\\d\\d";
var threeDigits = "\\d{3}";
var fourDigits = "\\d{4}";
var word = "[^\\s]+";
var literal = /\[([^]*?)\]/gm;
function shorten(arr, sLen) {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        newArr.push(arr[i].substr(0, sLen));
    }
    return newArr;
}
var monthUpdate = function (arrName) { return function (v, i18n) {
    var lowerCaseArr = i18n[arrName].map(function (v) { return v.toLowerCase(); });
    var index = lowerCaseArr.indexOf(v.toLowerCase());
    if (index > -1) {
        return index;
    }
    return null;
}; };
function assign(origObj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var obj = args_1[_a];
        for (var key in obj) {
            // @ts-ignore ex
            origObj[key] = obj[key];
        }
    }
    return origObj;
}
var dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
var monthNamesShort = shorten(monthNames, 3);
var dayNamesShort = shorten(dayNames, 3);
var defaultI18n = {
    dayNamesShort: dayNamesShort,
    dayNames: dayNames,
    monthNamesShort: monthNamesShort,
    monthNames: monthNames,
    amPm: ["am", "pm"],
    DoFn: function (dayOfMonth) {
        return (dayOfMonth +
            ["th", "st", "nd", "rd"][dayOfMonth % 10 > 3
                ? 0
                : ((dayOfMonth - (dayOfMonth % 10) !== 10 ? 1 : 0) * dayOfMonth) % 10]);
    }
};
var globalI18n = assign({}, defaultI18n);
var setGlobalDateI18n = function (i18n) {
    return (globalI18n = assign(globalI18n, i18n));
};
var regexEscape = function (str) {
    return str.replace(/[|\\{()[^$+*?.-]/g, "\\$&");
};
var pad = function (val, len) {
    if (len === undefined) { len = 2; }
    val = String(val);
    while (val.length < len) {
        val = "0" + val;
    }
    return val;
};
var formatFlags = {
    D: function (dateObj) { return String(dateObj.getDate()); },
    DD: function (dateObj) { return pad(dateObj.getDate()); },
    Do: function (dateObj, i18n) {
        return i18n.DoFn(dateObj.getDate());
    },
    d: function (dateObj) { return String(dateObj.getDay()); },
    dd: function (dateObj) { return pad(dateObj.getDay()); },
    ddd: function (dateObj, i18n) {
        return i18n.dayNamesShort[dateObj.getDay()];
    },
    dddd: function (dateObj, i18n) {
        return i18n.dayNames[dateObj.getDay()];
    },
    M: function (dateObj) { return String(dateObj.getMonth() + 1); },
    MM: function (dateObj) { return pad(dateObj.getMonth() + 1); },
    MMM: function (dateObj, i18n) {
        return i18n.monthNamesShort[dateObj.getMonth()];
    },
    MMMM: function (dateObj, i18n) {
        return i18n.monthNames[dateObj.getMonth()];
    },
    YY: function (dateObj) {
        return pad(String(dateObj.getFullYear()), 4).substr(2);
    },
    YYYY: function (dateObj) { return pad(dateObj.getFullYear(), 4); },
    h: function (dateObj) { return String(dateObj.getHours() % 12 || 12); },
    hh: function (dateObj) { return pad(dateObj.getHours() % 12 || 12); },
    H: function (dateObj) { return String(dateObj.getHours()); },
    HH: function (dateObj) { return pad(dateObj.getHours()); },
    m: function (dateObj) { return String(dateObj.getMinutes()); },
    mm: function (dateObj) { return pad(dateObj.getMinutes()); },
    s: function (dateObj) { return String(dateObj.getSeconds()); },
    ss: function (dateObj) { return pad(dateObj.getSeconds()); },
    S: function (dateObj) {
        return String(Math.round(dateObj.getMilliseconds() / 100));
    },
    SS: function (dateObj) {
        return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
    },
    SSS: function (dateObj) { return pad(dateObj.getMilliseconds(), 3); },
    a: function (dateObj, i18n) {
        return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
    },
    A: function (dateObj, i18n) {
        return dateObj.getHours() < 12
            ? i18n.amPm[0].toUpperCase()
            : i18n.amPm[1].toUpperCase();
    },
    ZZ: function (dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return ((offset > 0 ? "-" : "+") +
            pad(Math.floor(Math.abs(offset) / 60) * 100 + (Math.abs(offset) % 60), 4));
    },
    Z: function (dateObj) {
        var offset = dateObj.getTimezoneOffset();
        return ((offset > 0 ? "-" : "+") +
            pad(Math.floor(Math.abs(offset) / 60), 2) +
            ":" +
            pad(Math.abs(offset) % 60, 2));
    }
};
var monthParse = function (v) { return +v - 1; };
var emptyDigits = [null, twoDigitsOptional];
var emptyWord = [null, word];
var amPm = [
    "isPm",
    word,
    function (v, i18n) {
        var val = v.toLowerCase();
        if (val === i18n.amPm[0]) {
            return 0;
        }
        else if (val === i18n.amPm[1]) {
            return 1;
        }
        return null;
    }
];
var timezoneOffset = [
    "timezoneOffset",
    "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",
    function (v) {
        var parts = (v + "").match(/([+-]|\d\d)/gi);
        if (parts) {
            var minutes = +parts[1] * 60 + parseInt(parts[2], 10);
            return parts[0] === "+" ? minutes : -minutes;
        }
        return 0;
    }
];
var parseFlags = {
    D: ["day", twoDigitsOptional],
    DD: ["day", twoDigits],
    Do: ["day", twoDigitsOptional + word, function (v) { return parseInt(v, 10); }],
    M: ["month", twoDigitsOptional, monthParse],
    MM: ["month", twoDigits, monthParse],
    YY: [
        "year",
        twoDigits,
        function (v) {
            var now = new Date();
            var cent = +("" + now.getFullYear()).substr(0, 2);
            return +("" + (+v > 68 ? cent - 1 : cent) + v);
        }
    ],
    h: ["hour", twoDigitsOptional, undefined, "isPm"],
    hh: ["hour", twoDigits, undefined, "isPm"],
    H: ["hour", twoDigitsOptional],
    HH: ["hour", twoDigits],
    m: ["minute", twoDigitsOptional],
    mm: ["minute", twoDigits],
    s: ["second", twoDigitsOptional],
    ss: ["second", twoDigits],
    YYYY: ["year", fourDigits],
    S: ["millisecond", "\\d", function (v) { return +v * 100; }],
    SS: ["millisecond", twoDigits, function (v) { return +v * 10; }],
    SSS: ["millisecond", threeDigits],
    d: emptyDigits,
    dd: emptyDigits,
    ddd: emptyWord,
    dddd: emptyWord,
    MMM: ["month", word, monthUpdate("monthNamesShort")],
    MMMM: ["month", word, monthUpdate("monthNames")],
    a: amPm,
    A: amPm,
    ZZ: timezoneOffset,
    Z: timezoneOffset
};
// Some common format strings
var globalMasks = {
    default: "ddd MMM DD YYYY HH:mm:ss",
    shortDate: "M/D/YY",
    mediumDate: "MMM D, YYYY",
    longDate: "MMMM D, YYYY",
    fullDate: "dddd, MMMM D, YYYY",
    isoDate: "YYYY-MM-DD",
    isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
    shortTime: "HH:mm",
    mediumTime: "HH:mm:ss",
    longTime: "HH:mm:ss.SSS"
};
var setGlobalDateMasks = function (masks) { return assign(globalMasks, masks); };
/***
 * Format a date
 * @method format
 * @param {Date|number} dateObj
 * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
 * @returns {string} Formatted date string
 */
var format = function (dateObj, mask, i18n) {
    if (mask === undefined) { mask = globalMasks["default"]; }
    if (i18n === undefined) { i18n = {}; }
    if (typeof dateObj === "number") {
        dateObj = new Date(dateObj);
    }
    if (Object.prototype.toString.call(dateObj) !== "[object Date]" ||
        isNaN(dateObj.getTime())) {
        throw new Error("Invalid Date pass to format");
    }
    mask = globalMasks[mask] || mask;
    var literals = [];
    // Make literals inactive by replacing them with @@@
    mask = mask.replace(literal, function ($0, $1) {
        literals.push($1);
        return "@@@";
    });
    var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
    // Apply formatting rules
    mask = mask.replace(token, function ($0) {
        return formatFlags[$0](dateObj, combinedI18nSettings);
    });
    // Inline literal values back into the formatted value
    return mask.replace(/@@@/g, function () { return literals.shift(); });
};
/**
 * Parse a date string into a Javascript Date object /
 * @method parse
 * @param {string} dateStr Date string
 * @param {string} format Date parse format
 * @param {i18n} I18nSettingsOptional Full or subset of I18N settings
 * @returns {Date|null} Returns Date object. Returns null what date string is invalid or doesn't match format
 */
function parse(dateStr, format, i18n) {
    if (i18n === undefined) { i18n = {}; }
    if (typeof format !== "string") {
        throw new Error("Invalid format in fecha parse");
    }
    // Check to see if the format is actually a mask
    format = globalMasks[format] || format;
    // Avoid regular expression denial of service, fail early for really long strings
    // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
    if (dateStr.length > 1000) {
        return null;
    }
    // Default to the beginning of the year.
    var today = new Date();
    var dateInfo = {
        year: today.getFullYear(),
        month: 0,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        isPm: null,
        timezoneOffset: null
    };
    var parseInfo = [];
    var literals = [];
    // Replace all the literals with @@@. Hopefully a string that won't exist in the format
    var newFormat = format.replace(literal, function ($0, $1) {
        literals.push(regexEscape($1));
        return "@@@";
    });
    var specifiedFields = {};
    var requiredFields = {};
    // Change every token that we find into the correct regex
    newFormat = regexEscape(newFormat).replace(token, function ($0) {
        var info = parseFlags[$0];
        var field = info[0], regex = info[1], requiredField = info[3];
        // Check if the person has specified the same field twice. This will lead to confusing results.
        if (specifiedFields[field]) {
            throw new Error("Invalid format. " + field + " specified twice in format");
        }
        specifiedFields[field] = true;
        // Check if there are any required fields. For instance, 12 hour time requires AM/PM specified
        if (requiredField) {
            requiredFields[requiredField] = true;
        }
        parseInfo.push(info);
        return "(" + regex + ")";
    });
    // Check all the required fields are present
    Object.keys(requiredFields).forEach(function (field) {
        if (!specifiedFields[field]) {
            throw new Error("Invalid format. " + field + " is required in specified format");
        }
    });
    // Add back all the literals after
    newFormat = newFormat.replace(/@@@/g, function () { return literals.shift(); });
    // Check if the date string matches the format. If it doesn't return null
    var matches = dateStr.match(new RegExp(newFormat, "i"));
    if (!matches) {
        return null;
    }
    var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
    // For each match, call the parser function for that date part
    for (var i = 1; i < matches.length; i++) {
        var _a = parseInfo[i - 1], field = _a[0], parser = _a[2];
        var value = parser
            ? parser(matches[i], combinedI18nSettings)
            : +matches[i];
        // If the parser can't make sense of the value, return null
        if (value == null) {
            return null;
        }
        dateInfo[field] = value;
    }
    if (dateInfo.isPm === 1 && dateInfo.hour != null && +dateInfo.hour !== 12) {
        dateInfo.hour = +dateInfo.hour + 12;
    }
    else if (dateInfo.isPm === 0 && +dateInfo.hour === 12) {
        dateInfo.hour = 0;
    }
    var dateTZ;
    if (dateInfo.timezoneOffset == null) {
        dateTZ = new Date(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute, dateInfo.second, dateInfo.millisecond);
        var validateFields = [
            ["month", "getMonth"],
            ["day", "getDate"],
            ["hour", "getHours"],
            ["minute", "getMinutes"],
            ["second", "getSeconds"]
        ];
        for (var i = 0, len = validateFields.length; i < len; i++) {
            // Check to make sure the date field is within the allowed range. Javascript dates allows values
            // outside the allowed range. If the values don't match the value was invalid
            if (specifiedFields[validateFields[i][0]] &&
                dateInfo[validateFields[i][0]] !== dateTZ[validateFields[i][1]]()) {
                return null;
            }
        }
    }
    else {
        dateTZ = new Date(Date.UTC(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute - dateInfo.timezoneOffset, dateInfo.second, dateInfo.millisecond));
        // We can't validate dates in another timezone unfortunately. Do a basic check instead
        if (dateInfo.month > 11 ||
            dateInfo.month < 0 ||
            dateInfo.day > 31 ||
            dateInfo.day < 1 ||
            dateInfo.hour > 23 ||
            dateInfo.hour < 0 ||
            dateInfo.minute > 59 ||
            dateInfo.minute < 0 ||
            dateInfo.second > 59 ||
            dateInfo.second < 0) {
            return null;
        }
    }
    // Don't allow invalid dates
    return dateTZ;
}
var fecha = {
    format: format,
    parse: parse,
    defaultI18n: defaultI18n,
    setGlobalDateI18n: setGlobalDateI18n,
    setGlobalDateMasks: setGlobalDateMasks
};

var fecha$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	assign: assign,
	default: fecha,
	defaultI18n: defaultI18n,
	format: format,
	parse: parse,
	setGlobalDateI18n: setGlobalDateI18n,
	setGlobalDateMasks: setGlobalDateMasks
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(fecha$1);

var timestamp;
var hasRequiredTimestamp;

function requireTimestamp () {
	if (hasRequiredTimestamp) return timestamp;
	hasRequiredTimestamp = 1;

	const fecha = require$$0;
	const format = requireFormat();

	/*
	 * function timestamp (info)
	 * Returns a new instance of the timestamp Format which adds a timestamp
	 * to the info. It was previously available in winston < 3.0.0 as:
	 *
	 * - { timestamp: true }             // `new Date.toISOString()`
	 * - { timestamp: function:String }  // Value returned by `timestamp()`
	 */
	timestamp = format((info, opts = {}) => {
	  if (opts.format) {
	    info.timestamp = typeof opts.format === 'function'
	      ? opts.format()
	      : fecha.format(new Date(), opts.format);
	  }

	  if (!info.timestamp) {
	    info.timestamp = new Date().toISOString();
	  }

	  if (opts.alias) {
	    info[opts.alias] = info.timestamp;
	  }

	  return info;
	});
	return timestamp;
}

var uncolorize;
var hasRequiredUncolorize;

function requireUncolorize () {
	if (hasRequiredUncolorize) return uncolorize;
	hasRequiredUncolorize = 1;

	const colors = requireSafe();
	const format = requireFormat();
	const { MESSAGE } = requireTripleBeam();

	/*
	 * function uncolorize (info)
	 * Returns a new instance of the uncolorize Format that strips colors
	 * from `info` objects. This was previously exposed as { stripColors: true }
	 * to transports in `winston < 3.0.0`.
	 */
	uncolorize = format((info, opts) => {
	  if (opts.level !== false) {
	    info.level = colors.strip(info.level);
	  }

	  if (opts.message !== false) {
	    info.message = colors.strip(String(info.message));
	  }

	  if (opts.raw !== false && info[MESSAGE]) {
	    info[MESSAGE] = colors.strip(String(info[MESSAGE]));
	  }

	  return info;
	});
	return uncolorize;
}

var hasRequiredLogform;

function requireLogform () {
	if (hasRequiredLogform) return logform;
	hasRequiredLogform = 1;

	/*
	 * @api public
	 * @property {function} format
	 * Both the construction method and set of exposed
	 * formats.
	 */
	const format = logform.format = requireFormat();

	/*
	 * @api public
	 * @method {function} levels
	 * Registers the specified levels with logform.
	 */
	logform.levels = requireLevels();

	/*
	 * @api private
	 * method {function} exposeFormat
	 * Exposes a sub-format on the main format object
	 * as a lazy-loaded getter.
	 */
	function exposeFormat(name, requireFormat) {
	  Object.defineProperty(format, name, {
	    get() {
	      return requireFormat();
	    },
	    configurable: true
	  });
	}

	//
	// Setup all transports as lazy-loaded getters.
	//
	exposeFormat('align', function () { return requireAlign(); });
	exposeFormat('errors', function () { return requireErrors$1(); });
	exposeFormat('cli', function () { return requireCli(); });
	exposeFormat('combine', function () { return requireCombine(); });
	exposeFormat('colorize', function () { return requireColorize(); });
	exposeFormat('json', function () { return requireJson(); });
	exposeFormat('label', function () { return requireLabel(); });
	exposeFormat('logstash', function () { return requireLogstash(); });
	exposeFormat('metadata', function () { return requireMetadata(); });
	exposeFormat('ms', function () { return requireMs(); });
	exposeFormat('padLevels', function () { return requirePadLevels(); });
	exposeFormat('prettyPrint', function () { return requirePrettyPrint(); });
	exposeFormat('printf', function () { return requirePrintf(); });
	exposeFormat('simple', function () { return requireSimple(); });
	exposeFormat('splat', function () { return requireSplat(); });
	exposeFormat('timestamp', function () { return requireTimestamp(); });
	exposeFormat('uncolorize', function () { return requireUncolorize(); });
	return logform;
}

var common = {};

/**
 * common.js: Internal helper and utility functions for winston.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	(function (exports) {

		const { format } = require$$0$7;

		/**
		 * Set of simple deprecation notices and a way to expose them for a set of
		 * properties.
		 * @type {Object}
		 * @private
		 */
		exports.warn = {
		  deprecated(prop) {
		    return () => {
		      throw new Error(format('{ %s } was removed in winston@3.0.0.', prop));
		    };
		  },
		  useFormat(prop) {
		    return () => {
		      throw new Error([
		        format('{ %s } was removed in winston@3.0.0.', prop),
		        'Use a custom winston.format = winston.format(function) instead.'
		      ].join('\n'));
		    };
		  },
		  forFunctions(obj, type, props) {
		    props.forEach(prop => {
		      obj[prop] = exports.warn[type](prop);
		    });
		  },
		  forProperties(obj, type, props) {
		    props.forEach(prop => {
		      const notice = exports.warn[type](prop);
		      Object.defineProperty(obj, prop, {
		        get: notice,
		        set: notice
		      });
		    });
		  }
		}; 
	} (common));
	return common;
}

var name = "winston";
var description = "A logger for just about everything.";
var version = "3.17.0";
var author = "Charlie Robbins <charlie.robbins@gmail.com>";
var maintainers = [
	"David Hyde <dabh@alumni.stanford.edu>"
];
var repository = {
	type: "git",
	url: "https://github.com/winstonjs/winston.git"
};
var keywords = [
	"winston",
	"logger",
	"logging",
	"logs",
	"sysadmin",
	"bunyan",
	"pino",
	"loglevel",
	"tools",
	"json",
	"stream"
];
var dependencies = {
	"@dabh/diagnostics": "^2.0.2",
	"@colors/colors": "^1.6.0",
	async: "^3.2.3",
	"is-stream": "^2.0.0",
	logform: "^2.7.0",
	"one-time": "^1.0.0",
	"readable-stream": "^3.4.0",
	"safe-stable-stringify": "^2.3.1",
	"stack-trace": "0.0.x",
	"triple-beam": "^1.3.0",
	"winston-transport": "^4.9.0"
};
var devDependencies = {
	"@babel/cli": "^7.23.9",
	"@babel/core": "^7.24.0",
	"@babel/preset-env": "^7.24.0",
	"@dabh/eslint-config-populist": "^4.4.0",
	"@types/node": "^20.11.24",
	"abstract-winston-transport": "^0.5.1",
	assume: "^2.2.0",
	"cross-spawn-async": "^2.2.5",
	eslint: "^8.57.0",
	hock: "^1.4.1",
	mocha: "^10.3.0",
	nyc: "^17.1.0",
	rimraf: "5.0.1",
	split2: "^4.1.0",
	"std-mocks": "^2.0.0",
	through2: "^4.0.2",
	"winston-compat": "^0.1.5"
};
var main = "./lib/winston.js";
var browser = "./dist/winston";
var types = "./index.d.ts";
var scripts = {
	lint: "eslint lib/*.js lib/winston/*.js lib/winston/**/*.js --resolve-plugins-relative-to ./node_modules/@dabh/eslint-config-populist",
	test: "rimraf test/fixtures/logs/* && mocha",
	"test:coverage": "nyc npm run test:unit",
	"test:unit": "mocha test/unit",
	"test:integration": "mocha test/integration",
	build: "rimraf dist && babel lib -d dist",
	prepublishOnly: "npm run build"
};
var engines = {
	node: ">= 12.0.0"
};
var license = "MIT";
var require$$2 = {
	name: name,
	description: description,
	version: version,
	author: author,
	maintainers: maintainers,
	repository: repository,
	keywords: keywords,
	dependencies: dependencies,
	devDependencies: devDependencies,
	main: main,
	browser: browser,
	types: types,
	scripts: scripts,
	engines: engines,
	license: license
};

var transports = {};

var winstonTransport = {exports: {}};

var modern = {exports: {}};

var node$1;
var hasRequiredNode$1;

function requireNode$1 () {
	if (hasRequiredNode$1) return node$1;
	hasRequiredNode$1 = 1;
	/**
	 * For Node.js, simply re-export the core `util.deprecate` function.
	 */

	node$1 = require$$0$7.deprecate;
	return node$1;
}

var stream$1;
var hasRequiredStream$1;

function requireStream$1 () {
	if (hasRequiredStream$1) return stream$1;
	hasRequiredStream$1 = 1;
	stream$1 = require$$0$3;
	return stream$1;
}

var destroy_1;
var hasRequiredDestroy;

function requireDestroy () {
	if (hasRequiredDestroy) return destroy_1;
	hasRequiredDestroy = 1;

	// undocumented cb() API, needed for core, not for public API
	function destroy(err, cb) {
	  var _this = this;
	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;
	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err) {
	      if (!this._writableState) {
	        process.nextTick(emitErrorNT, this, err);
	      } else if (!this._writableState.errorEmitted) {
	        this._writableState.errorEmitted = true;
	        process.nextTick(emitErrorNT, this, err);
	      }
	    }
	    return this;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }
	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      if (!_this._writableState) {
	        process.nextTick(emitErrorAndCloseNT, _this, err);
	      } else if (!_this._writableState.errorEmitted) {
	        _this._writableState.errorEmitted = true;
	        process.nextTick(emitErrorAndCloseNT, _this, err);
	      } else {
	        process.nextTick(emitCloseNT, _this);
	      }
	    } else if (cb) {
	      process.nextTick(emitCloseNT, _this);
	      cb(err);
	    } else {
	      process.nextTick(emitCloseNT, _this);
	    }
	  });
	  return this;
	}
	function emitErrorAndCloseNT(self, err) {
	  emitErrorNT(self, err);
	  emitCloseNT(self);
	}
	function emitCloseNT(self) {
	  if (self._writableState && !self._writableState.emitClose) return;
	  if (self._readableState && !self._readableState.emitClose) return;
	  self.emit('close');
	}
	function undestroy() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }
	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finalCalled = false;
	    this._writableState.prefinished = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}
	function emitErrorNT(self, err) {
	  self.emit('error', err);
	}
	function errorOrDestroy(stream, err) {
	  // We have tests that rely on errors being emitted
	  // in the same tick, so changing this is semver major.
	  // For now when you opt-in to autoDestroy we allow
	  // the error to be emitted nextTick. In a future
	  // semver major update we should change the default to this.

	  var rState = stream._readableState;
	  var wState = stream._writableState;
	  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
	}
	destroy_1 = {
	  destroy: destroy,
	  undestroy: undestroy,
	  errorOrDestroy: errorOrDestroy
	};
	return destroy_1;
}

var errors = {};

var hasRequiredErrors;

function requireErrors () {
	if (hasRequiredErrors) return errors;
	hasRequiredErrors = 1;

	const codes = {};

	function createErrorType(code, message, Base) {
	  if (!Base) {
	    Base = Error;
	  }

	  function getMessage (arg1, arg2, arg3) {
	    if (typeof message === 'string') {
	      return message
	    } else {
	      return message(arg1, arg2, arg3)
	    }
	  }

	  class NodeError extends Base {
	    constructor (arg1, arg2, arg3) {
	      super(getMessage(arg1, arg2, arg3));
	    }
	  }

	  NodeError.prototype.name = Base.name;
	  NodeError.prototype.code = code;

	  codes[code] = NodeError;
	}

	// https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js
	function oneOf(expected, thing) {
	  if (Array.isArray(expected)) {
	    const len = expected.length;
	    expected = expected.map((i) => String(i));
	    if (len > 2) {
	      return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` +
	             expected[len - 1];
	    } else if (len === 2) {
	      return `one of ${thing} ${expected[0]} or ${expected[1]}`;
	    } else {
	      return `of ${thing} ${expected[0]}`;
	    }
	  } else {
	    return `of ${thing} ${String(expected)}`;
	  }
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
	function startsWith(str, search, pos) {
		return str.substr(0 , search.length) === search;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
	function endsWith(str, search, this_len) {
		if (this_len === undefined || this_len > str.length) {
			this_len = str.length;
		}
		return str.substring(this_len - search.length, this_len) === search;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
	function includes(str, search, start) {
	  if (typeof start !== 'number') {
	    start = 0;
	  }

	  if (start + search.length > str.length) {
	    return false;
	  } else {
	    return str.indexOf(search, start) !== -1;
	  }
	}

	createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
	  return 'The value "' + value + '" is invalid for option "' + name + '"'
	}, TypeError);
	createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
	  // determiner: 'must be' or 'must not be'
	  let determiner;
	  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
	    determiner = 'must not be';
	    expected = expected.replace(/^not /, '');
	  } else {
	    determiner = 'must be';
	  }

	  let msg;
	  if (endsWith(name, ' argument')) {
	    // For cases like 'first argument'
	    msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
	  } else {
	    const type = includes(name, '.') ? 'property' : 'argument';
	    msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
	  }

	  msg += `. Received type ${typeof actual}`;
	  return msg;
	}, TypeError);
	createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
	createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
	  return 'The ' + name + ' method is not implemented'
	});
	createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
	createErrorType('ERR_STREAM_DESTROYED', function (name) {
	  return 'Cannot call ' + name + ' after a stream was destroyed';
	});
	createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
	createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
	createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
	createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
	createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
	  return 'Unknown encoding: ' + arg
	}, TypeError);
	createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');

	errors.codes = codes;
	return errors;
}

var state;
var hasRequiredState;

function requireState () {
	if (hasRequiredState) return state;
	hasRequiredState = 1;

	var ERR_INVALID_OPT_VALUE = requireErrors().codes.ERR_INVALID_OPT_VALUE;
	function highWaterMarkFrom(options, isDuplex, duplexKey) {
	  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
	}
	function getHighWaterMark(state, options, duplexKey, isDuplex) {
	  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
	  if (hwm != null) {
	    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
	      var name = isDuplex ? duplexKey : 'highWaterMark';
	      throw new ERR_INVALID_OPT_VALUE(name, hwm);
	    }
	    return Math.floor(hwm);
	  }

	  // Default value
	  return state.objectMode ? 16 : 16 * 1024;
	}
	state = {
	  getHighWaterMark: getHighWaterMark
	};
	return state;
}

var inherits = {exports: {}};

var inherits_browser = {exports: {}};

var hasRequiredInherits_browser;

function requireInherits_browser () {
	if (hasRequiredInherits_browser) return inherits_browser.exports;
	hasRequiredInherits_browser = 1;
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      var TempCtor = function () {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	return inherits_browser.exports;
}

var hasRequiredInherits;

function requireInherits () {
	if (hasRequiredInherits) return inherits.exports;
	hasRequiredInherits = 1;
	try {
	  var util = require('util');
	  /* istanbul ignore next */
	  if (typeof util.inherits !== 'function') throw '';
	  inherits.exports = util.inherits;
	} catch (e) {
	  /* istanbul ignore next */
	  inherits.exports = requireInherits_browser();
	}
	return inherits.exports;
}

var buffer_list;
var hasRequiredBuffer_list;

function requireBuffer_list () {
	if (hasRequiredBuffer_list) return buffer_list;
	hasRequiredBuffer_list = 1;

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
	function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
	function _createClass(Constructor, protoProps, staticProps) { _defineProperties(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
	function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(input); }
	var _require = require$$0$2,
	  Buffer = _require.Buffer;
	var _require2 = require$$0$7,
	  inspect = _require2.inspect;
	var custom = inspect && inspect.custom || 'inspect';
	function copyBuffer(src, target, offset) {
	  Buffer.prototype.copy.call(src, target, offset);
	}
	buffer_list = /*#__PURE__*/function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);
	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }
	  _createClass(BufferList, [{
	    key: "push",
	    value: function push(v) {
	      var entry = {
	        data: v,
	        next: null
	      };
	      if (this.length > 0) this.tail.next = entry;else this.head = entry;
	      this.tail = entry;
	      ++this.length;
	    }
	  }, {
	    key: "unshift",
	    value: function unshift(v) {
	      var entry = {
	        data: v,
	        next: this.head
	      };
	      if (this.length === 0) this.tail = entry;
	      this.head = entry;
	      ++this.length;
	    }
	  }, {
	    key: "shift",
	    value: function shift() {
	      if (this.length === 0) return;
	      var ret = this.head.data;
	      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	      --this.length;
	      return ret;
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      this.head = this.tail = null;
	      this.length = 0;
	    }
	  }, {
	    key: "join",
	    value: function join(s) {
	      if (this.length === 0) return '';
	      var p = this.head;
	      var ret = '' + p.data;
	      while (p = p.next) ret += s + p.data;
	      return ret;
	    }
	  }, {
	    key: "concat",
	    value: function concat(n) {
	      if (this.length === 0) return Buffer.alloc(0);
	      var ret = Buffer.allocUnsafe(n >>> 0);
	      var p = this.head;
	      var i = 0;
	      while (p) {
	        copyBuffer(p.data, ret, i);
	        i += p.data.length;
	        p = p.next;
	      }
	      return ret;
	    }

	    // Consumes a specified amount of bytes or characters from the buffered data.
	  }, {
	    key: "consume",
	    value: function consume(n, hasStrings) {
	      var ret;
	      if (n < this.head.data.length) {
	        // `slice` is the same for buffers and strings.
	        ret = this.head.data.slice(0, n);
	        this.head.data = this.head.data.slice(n);
	      } else if (n === this.head.data.length) {
	        // First chunk is a perfect match.
	        ret = this.shift();
	      } else {
	        // Result spans more than one buffer.
	        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
	      }
	      return ret;
	    }
	  }, {
	    key: "first",
	    value: function first() {
	      return this.head.data;
	    }

	    // Consumes a specified amount of characters from the buffered data.
	  }, {
	    key: "_getString",
	    value: function _getString(n) {
	      var p = this.head;
	      var c = 1;
	      var ret = p.data;
	      n -= ret.length;
	      while (p = p.next) {
	        var str = p.data;
	        var nb = n > str.length ? str.length : n;
	        if (nb === str.length) ret += str;else ret += str.slice(0, n);
	        n -= nb;
	        if (n === 0) {
	          if (nb === str.length) {
	            ++c;
	            if (p.next) this.head = p.next;else this.head = this.tail = null;
	          } else {
	            this.head = p;
	            p.data = str.slice(nb);
	          }
	          break;
	        }
	        ++c;
	      }
	      this.length -= c;
	      return ret;
	    }

	    // Consumes a specified amount of bytes from the buffered data.
	  }, {
	    key: "_getBuffer",
	    value: function _getBuffer(n) {
	      var ret = Buffer.allocUnsafe(n);
	      var p = this.head;
	      var c = 1;
	      p.data.copy(ret);
	      n -= p.data.length;
	      while (p = p.next) {
	        var buf = p.data;
	        var nb = n > buf.length ? buf.length : n;
	        buf.copy(ret, ret.length - n, 0, nb);
	        n -= nb;
	        if (n === 0) {
	          if (nb === buf.length) {
	            ++c;
	            if (p.next) this.head = p.next;else this.head = this.tail = null;
	          } else {
	            this.head = p;
	            p.data = buf.slice(nb);
	          }
	          break;
	        }
	        ++c;
	      }
	      this.length -= c;
	      return ret;
	    }

	    // Make sure the linked list only shows the minimal necessary information.
	  }, {
	    key: custom,
	    value: function value(_, options) {
	      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
	        // Only inspect one level.
	        depth: 0,
	        // It should not recurse.
	        customInspect: false
	      }));
	    }
	  }]);
	  return BufferList;
	}();
	return buffer_list;
}

var string_decoder = {};

var safeBuffer = {exports: {}};

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

var hasRequiredSafeBuffer;

function requireSafeBuffer () {
	if (hasRequiredSafeBuffer) return safeBuffer.exports;
	hasRequiredSafeBuffer = 1;
	(function (module, exports) {
		/* eslint-disable node/no-deprecated-api */
		var buffer = require$$0$2;
		var Buffer = buffer.Buffer;

		// alternative to using Object.keys for old browsers
		function copyProps (src, dst) {
		  for (var key in src) {
		    dst[key] = src[key];
		  }
		}
		if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
		  module.exports = buffer;
		} else {
		  // Copy properties from require('buffer')
		  copyProps(buffer, exports);
		  exports.Buffer = SafeBuffer;
		}

		function SafeBuffer (arg, encodingOrOffset, length) {
		  return Buffer(arg, encodingOrOffset, length)
		}

		SafeBuffer.prototype = Object.create(Buffer.prototype);

		// Copy static methods from Buffer
		copyProps(Buffer, SafeBuffer);

		SafeBuffer.from = function (arg, encodingOrOffset, length) {
		  if (typeof arg === 'number') {
		    throw new TypeError('Argument must not be a number')
		  }
		  return Buffer(arg, encodingOrOffset, length)
		};

		SafeBuffer.alloc = function (size, fill, encoding) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  var buf = Buffer(size);
		  if (fill !== undefined) {
		    if (typeof encoding === 'string') {
		      buf.fill(fill, encoding);
		    } else {
		      buf.fill(fill);
		    }
		  } else {
		    buf.fill(0);
		  }
		  return buf
		};

		SafeBuffer.allocUnsafe = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return Buffer(size)
		};

		SafeBuffer.allocUnsafeSlow = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return buffer.SlowBuffer(size)
		}; 
	} (safeBuffer, safeBuffer.exports));
	return safeBuffer.exports;
}

var hasRequiredString_decoder;

function requireString_decoder () {
	if (hasRequiredString_decoder) return string_decoder;
	hasRequiredString_decoder = 1;

	/*<replacement>*/

	var Buffer = requireSafeBuffer().Buffer;
	/*</replacement>*/

	var isEncoding = Buffer.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	}
	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding(enc) {
	  var nenc = _normalizeEncoding(enc);
	  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	string_decoder.StringDecoder = StringDecoder;
	function StringDecoder(encoding) {
	  this.encoding = normalizeEncoding(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text;
	      this.end = utf16End;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text;
	      this.end = base64End;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite;
	      this.end = simpleEnd;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer.allocUnsafe(nb);
	}

	StringDecoder.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder.prototype.end = utf8End;

	// Returns only complete characters in a Buffer
	StringDecoder.prototype.text = utf8Text;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte. If an invalid byte is detected, -2 is returned.
	function utf8CheckByte(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return byte >> 6 === 0x02 ? -1 : -2;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd';
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd';
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd';
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes(this, buf);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text(buf, i) {
	  var total = utf8CheckIncomplete(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character is added when ending on a partial
	// character.
	function utf8End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd';
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}
	return string_decoder;
}

var endOfStream;
var hasRequiredEndOfStream;

function requireEndOfStream () {
	if (hasRequiredEndOfStream) return endOfStream;
	hasRequiredEndOfStream = 1;

	var ERR_STREAM_PREMATURE_CLOSE = requireErrors().codes.ERR_STREAM_PREMATURE_CLOSE;
	function once(callback) {
	  var called = false;
	  return function () {
	    if (called) return;
	    called = true;
	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	    callback.apply(this, args);
	  };
	}
	function noop() {}
	function isRequest(stream) {
	  return stream.setHeader && typeof stream.abort === 'function';
	}
	function eos(stream, opts, callback) {
	  if (typeof opts === 'function') return eos(stream, null, opts);
	  if (!opts) opts = {};
	  callback = once(callback || noop);
	  var readable = opts.readable || opts.readable !== false && stream.readable;
	  var writable = opts.writable || opts.writable !== false && stream.writable;
	  var onlegacyfinish = function onlegacyfinish() {
	    if (!stream.writable) onfinish();
	  };
	  var writableEnded = stream._writableState && stream._writableState.finished;
	  var onfinish = function onfinish() {
	    writable = false;
	    writableEnded = true;
	    if (!readable) callback.call(stream);
	  };
	  var readableEnded = stream._readableState && stream._readableState.endEmitted;
	  var onend = function onend() {
	    readable = false;
	    readableEnded = true;
	    if (!writable) callback.call(stream);
	  };
	  var onerror = function onerror(err) {
	    callback.call(stream, err);
	  };
	  var onclose = function onclose() {
	    var err;
	    if (readable && !readableEnded) {
	      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
	      return callback.call(stream, err);
	    }
	    if (writable && !writableEnded) {
	      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
	      return callback.call(stream, err);
	    }
	  };
	  var onrequest = function onrequest() {
	    stream.req.on('finish', onfinish);
	  };
	  if (isRequest(stream)) {
	    stream.on('complete', onfinish);
	    stream.on('abort', onclose);
	    if (stream.req) onrequest();else stream.on('request', onrequest);
	  } else if (writable && !stream._writableState) {
	    // legacy streams
	    stream.on('end', onlegacyfinish);
	    stream.on('close', onlegacyfinish);
	  }
	  stream.on('end', onend);
	  stream.on('finish', onfinish);
	  if (opts.error !== false) stream.on('error', onerror);
	  stream.on('close', onclose);
	  return function () {
	    stream.removeListener('complete', onfinish);
	    stream.removeListener('abort', onclose);
	    stream.removeListener('request', onrequest);
	    if (stream.req) stream.req.removeListener('finish', onfinish);
	    stream.removeListener('end', onlegacyfinish);
	    stream.removeListener('close', onlegacyfinish);
	    stream.removeListener('finish', onfinish);
	    stream.removeListener('end', onend);
	    stream.removeListener('error', onerror);
	    stream.removeListener('close', onclose);
	  };
	}
	endOfStream = eos;
	return endOfStream;
}

var async_iterator;
var hasRequiredAsync_iterator;

function requireAsync_iterator () {
	if (hasRequiredAsync_iterator) return async_iterator;
	hasRequiredAsync_iterator = 1;

	var _Object$setPrototypeO;
	function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
	function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
	var finished = requireEndOfStream();
	var kLastResolve = Symbol('lastResolve');
	var kLastReject = Symbol('lastReject');
	var kError = Symbol('error');
	var kEnded = Symbol('ended');
	var kLastPromise = Symbol('lastPromise');
	var kHandlePromise = Symbol('handlePromise');
	var kStream = Symbol('stream');
	function createIterResult(value, done) {
	  return {
	    value: value,
	    done: done
	  };
	}
	function readAndResolve(iter) {
	  var resolve = iter[kLastResolve];
	  if (resolve !== null) {
	    var data = iter[kStream].read();
	    // we defer if data is null
	    // we can be expecting either 'end' or
	    // 'error'
	    if (data !== null) {
	      iter[kLastPromise] = null;
	      iter[kLastResolve] = null;
	      iter[kLastReject] = null;
	      resolve(createIterResult(data, false));
	    }
	  }
	}
	function onReadable(iter) {
	  // we wait for the next tick, because it might
	  // emit an error with process.nextTick
	  process.nextTick(readAndResolve, iter);
	}
	function wrapForNext(lastPromise, iter) {
	  return function (resolve, reject) {
	    lastPromise.then(function () {
	      if (iter[kEnded]) {
	        resolve(createIterResult(undefined, true));
	        return;
	      }
	      iter[kHandlePromise](resolve, reject);
	    }, reject);
	  };
	}
	var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
	var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
	  get stream() {
	    return this[kStream];
	  },
	  next: function next() {
	    var _this = this;
	    // if we have detected an error in the meanwhile
	    // reject straight away
	    var error = this[kError];
	    if (error !== null) {
	      return Promise.reject(error);
	    }
	    if (this[kEnded]) {
	      return Promise.resolve(createIterResult(undefined, true));
	    }
	    if (this[kStream].destroyed) {
	      // We need to defer via nextTick because if .destroy(err) is
	      // called, the error will be emitted via nextTick, and
	      // we cannot guarantee that there is no error lingering around
	      // waiting to be emitted.
	      return new Promise(function (resolve, reject) {
	        process.nextTick(function () {
	          if (_this[kError]) {
	            reject(_this[kError]);
	          } else {
	            resolve(createIterResult(undefined, true));
	          }
	        });
	      });
	    }

	    // if we have multiple next() calls
	    // we will wait for the previous Promise to finish
	    // this logic is optimized to support for await loops,
	    // where next() is only called once at a time
	    var lastPromise = this[kLastPromise];
	    var promise;
	    if (lastPromise) {
	      promise = new Promise(wrapForNext(lastPromise, this));
	    } else {
	      // fast path needed to support multiple this.push()
	      // without triggering the next() queue
	      var data = this[kStream].read();
	      if (data !== null) {
	        return Promise.resolve(createIterResult(data, false));
	      }
	      promise = new Promise(this[kHandlePromise]);
	    }
	    this[kLastPromise] = promise;
	    return promise;
	  }
	}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
	  return this;
	}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
	  var _this2 = this;
	  // destroy(err, cb) is a private API
	  // we can guarantee we have that here, because we control the
	  // Readable class this is attached to
	  return new Promise(function (resolve, reject) {
	    _this2[kStream].destroy(null, function (err) {
	      if (err) {
	        reject(err);
	        return;
	      }
	      resolve(createIterResult(undefined, true));
	    });
	  });
	}), _Object$setPrototypeO), AsyncIteratorPrototype);
	var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
	  var _Object$create;
	  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
	    value: stream,
	    writable: true
	  }), _defineProperty(_Object$create, kLastResolve, {
	    value: null,
	    writable: true
	  }), _defineProperty(_Object$create, kLastReject, {
	    value: null,
	    writable: true
	  }), _defineProperty(_Object$create, kError, {
	    value: null,
	    writable: true
	  }), _defineProperty(_Object$create, kEnded, {
	    value: stream._readableState.endEmitted,
	    writable: true
	  }), _defineProperty(_Object$create, kHandlePromise, {
	    value: function value(resolve, reject) {
	      var data = iterator[kStream].read();
	      if (data) {
	        iterator[kLastPromise] = null;
	        iterator[kLastResolve] = null;
	        iterator[kLastReject] = null;
	        resolve(createIterResult(data, false));
	      } else {
	        iterator[kLastResolve] = resolve;
	        iterator[kLastReject] = reject;
	      }
	    },
	    writable: true
	  }), _Object$create));
	  iterator[kLastPromise] = null;
	  finished(stream, function (err) {
	    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
	      var reject = iterator[kLastReject];
	      // reject if we are waiting for data in the Promise
	      // returned by next() and store the error
	      if (reject !== null) {
	        iterator[kLastPromise] = null;
	        iterator[kLastResolve] = null;
	        iterator[kLastReject] = null;
	        reject(err);
	      }
	      iterator[kError] = err;
	      return;
	    }
	    var resolve = iterator[kLastResolve];
	    if (resolve !== null) {
	      iterator[kLastPromise] = null;
	      iterator[kLastResolve] = null;
	      iterator[kLastReject] = null;
	      resolve(createIterResult(undefined, true));
	    }
	    iterator[kEnded] = true;
	  });
	  stream.on('readable', onReadable.bind(null, iterator));
	  return iterator;
	};
	async_iterator = createReadableStreamAsyncIterator;
	return async_iterator;
}

var from_1;
var hasRequiredFrom;

function requireFrom () {
	if (hasRequiredFrom) return from_1;
	hasRequiredFrom = 1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
	function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
	function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
	var ERR_INVALID_ARG_TYPE = requireErrors().codes.ERR_INVALID_ARG_TYPE;
	function from(Readable, iterable, opts) {
	  var iterator;
	  if (iterable && typeof iterable.next === 'function') {
	    iterator = iterable;
	  } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();else throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
	  var readable = new Readable(_objectSpread({
	    objectMode: true
	  }, opts));
	  // Reading boolean to protect against _read
	  // being called before last iteration completion.
	  var reading = false;
	  readable._read = function () {
	    if (!reading) {
	      reading = true;
	      next();
	    }
	  };
	  function next() {
	    return _next2.apply(this, arguments);
	  }
	  function _next2() {
	    _next2 = _asyncToGenerator(function* () {
	      try {
	        var _yield$iterator$next = yield iterator.next(),
	          value = _yield$iterator$next.value,
	          done = _yield$iterator$next.done;
	        if (done) {
	          readable.push(null);
	        } else if (readable.push(yield value)) {
	          next();
	        } else {
	          reading = false;
	        }
	      } catch (err) {
	        readable.destroy(err);
	      }
	    });
	    return _next2.apply(this, arguments);
	  }
	  return readable;
	}
	from_1 = from;
	return from_1;
}

var _stream_readable;
var hasRequired_stream_readable;

function require_stream_readable () {
	if (hasRequired_stream_readable) return _stream_readable;
	hasRequired_stream_readable = 1;

	_stream_readable = Readable;

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	/*<replacement>*/
	require$$0$5.EventEmitter;
	var EElistenerCount = function EElistenerCount(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = requireStream$1();
	/*</replacement>*/

	var Buffer = require$$0$2.Buffer;
	var OurUint8Array = (typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}

	/*<replacement>*/
	var debugUtil = require$$0$7;
	var debug;
	if (debugUtil && debugUtil.debuglog) {
	  debug = debugUtil.debuglog('stream');
	} else {
	  debug = function debug() {};
	}
	/*</replacement>*/

	var BufferList = requireBuffer_list();
	var destroyImpl = requireDestroy();
	var _require = requireState(),
	  getHighWaterMark = _require.getHighWaterMark;
	var _require$codes = requireErrors().codes,
	  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
	  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
	  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

	// Lazy loaded to improve the startup performance.
	var StringDecoder;
	var createReadableStreamAsyncIterator;
	var from;
	requireInherits()(Readable, Stream);
	var errorOrDestroy = destroyImpl.errorOrDestroy;
	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}
	function ReadableState(options, stream, isDuplex) {
	  Duplex = Duplex || require_stream_duplex();
	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;
	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;
	  this.paused = true;

	  // Should close be emitted on destroy. Defaults to true.
	  this.emitClose = options.emitClose !== false;

	  // Should .destroy() be called after 'end' (and potentially 'finish')
	  this.autoDestroy = !!options.autoDestroy;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;
	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}
	function Readable(options) {
	  Duplex = Duplex || require_stream_duplex();
	  if (!(this instanceof Readable)) return new Readable(options);

	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the ReadableState constructor, at least with V8 6.5
	  var isDuplex = this instanceof Duplex;
	  this._readableState = new ReadableState(options, this, isDuplex);

	  // legacy
	  this.readable = true;
	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }
	  Stream.call(this);
	}
	Object.defineProperty(Readable.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});
	Readable.prototype.destroy = destroyImpl.destroy;
	Readable.prototype._undestroy = destroyImpl.undestroy;
	Readable.prototype._destroy = function (err, cb) {
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;
	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }
	  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  return readableAddChunk(this, chunk, null, true, false);
	};
	function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  debug('readableAddChunk', chunk);
	  var state = stream._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
	    if (er) {
	      errorOrDestroy(stream, er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
	        chunk = _uint8ArrayToBuffer(chunk);
	      }
	      if (addToFront) {
	        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
	      } else if (state.ended) {
	        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
	      } else if (state.destroyed) {
	        return false;
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
	        } else {
	          addChunk(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	      maybeReadMore(stream, state);
	    }
	  }

	  // We can push more data if we are below the highWaterMark.
	  // Also, if we have no data yet, we can stand some more bytes.
	  // This is to work around cases where hwm=0, such as the repl.
	  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
	}
	function addChunk(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    state.awaitDrain = 0;
	    stream.emit('data', chunk);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
	    if (state.needReadable) emitReadable(stream);
	  }
	  maybeReadMore(stream, state);
	}
	function chunkInvalid(state, chunk) {
	  var er;
	  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
	  }
	  return er;
	}
	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
	  var decoder = new StringDecoder(enc);
	  this._readableState.decoder = decoder;
	  // If setEncoding(null), decoder.encoding equals utf8
	  this._readableState.encoding = this._readableState.decoder.encoding;

	  // Iterate over current buffer to convert already stored Buffers:
	  var p = this._readableState.buffer.head;
	  var content = '';
	  while (p !== null) {
	    content += decoder.write(p.data);
	    p = p.next;
	  }
	  this._readableState.buffer.clear();
	  if (content !== '') this._readableState.buffer.push(content);
	  this._readableState.length = content.length;
	  return this;
	};

	// Don't raise the hwm > 1GB
	var MAX_HWM = 0x40000000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;
	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }
	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }
	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;
	  if (ret === null) {
	    state.needReadable = state.length <= state.highWaterMark;
	    n = 0;
	  } else {
	    state.length -= n;
	    state.awaitDrain = 0;
	  }
	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }
	  if (ret !== null) this.emit('data', ret);
	  return ret;
	};
	function onEofChunk(stream, state) {
	  debug('onEofChunk');
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;
	  if (state.sync) {
	    // if we are sync, wait until next tick to emit the data.
	    // Otherwise we risk emitting data in the flow()
	    // the readable code triggers during a read() call
	    emitReadable(stream);
	  } else {
	    // emit 'readable' now to make sure it gets picked up.
	    state.needReadable = false;
	    if (!state.emittedReadable) {
	      state.emittedReadable = true;
	      emitReadable_(stream);
	    }
	  }
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  debug('emitReadable', state.needReadable, state.emittedReadable);
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    process.nextTick(emitReadable_, stream);
	  }
	}
	function emitReadable_(stream) {
	  var state = stream._readableState;
	  debug('emitReadable_', state.destroyed, state.length, state.ended);
	  if (!state.destroyed && (state.length || state.ended)) {
	    stream.emit('readable');
	    state.emittedReadable = false;
	  }

	  // The stream needs another readable event if
	  // 1. It is not flowing, as the flow mechanism will take
	  //    care of it.
	  // 2. It is not ended.
	  // 3. It is below the highWaterMark, so we can schedule
	  //    another readable later.
	  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(maybeReadMore_, stream, state);
	  }
	}
	function maybeReadMore_(stream, state) {
	  // Attempt to read more data if we should.
	  //
	  // The conditions for reading more data are (one of):
	  // - Not enough data buffered (state.length < state.highWaterMark). The loop
	  //   is responsible for filling the buffer with enough data if such data
	  //   is available. If highWaterMark is 0 and we are not in the flowing mode
	  //   we should _not_ attempt to buffer any extra data. We'll get more data
	  //   when the stream consumer calls read() instead.
	  // - No data in the buffer, and the stream is in flowing mode. In this mode
	  //   the loop below is responsible for ensuring read() is called. Failing to
	  //   call read here would abort the flow and there's no other mechanism for
	  //   continuing the flow if the stream consumer has just subscribed to the
	  //   'data' event.
	  //
	  // In addition to the above conditions to keep reading data, the following
	  // conditions prevent the data from being read:
	  // - The stream has ended (state.ended).
	  // - There is already a pending 'read' operation (state.reading). This is a
	  //   case where the the stream has called the implementation defined _read()
	  //   method, but they are processing the call asynchronously and have _not_
	  //   called push() with new data. In this case we skip performing more
	  //   read()s. The execution ends in this method again after the _read() ends
	  //   up calling push() with more data.
	  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
	    var len = state.length;
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
	};
	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;
	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }
	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);
	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);
	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    debug('dest.write', ret);
	    if (ret === false) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', state.awaitDrain);
	        state.awaitDrain++;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);
	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }
	  return dest;
	};
	function pipeOnDrain(src) {
	  return function pipeOnDrainFunctionResult() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}
	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = {
	    hasUnpiped: false
	  };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;
	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
	      hasUnpiped: false
	    });
	    return this;
	  }

	  // try to find the right one.
	  var index = indexOf(state.pipes, dest);
	  if (index === -1) return this;
	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];
	  dest.emit('unpipe', this, unpipeInfo);
	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);
	  var state = this._readableState;
	  if (ev === 'data') {
	    // update readableListening so that resume() may be a no-op
	    // a few lines down. This is needed to support once('readable').
	    state.readableListening = this.listenerCount('readable') > 0;

	    // Try start flowing on next tick if stream isn't explicitly paused
	    if (state.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.flowing = false;
	      state.emittedReadable = false;
	      debug('on readable', state.length, state.reading);
	      if (state.length) {
	        emitReadable(this);
	      } else if (!state.reading) {
	        process.nextTick(nReadingNextTick, this);
	      }
	    }
	  }
	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;
	Readable.prototype.removeListener = function (ev, fn) {
	  var res = Stream.prototype.removeListener.call(this, ev, fn);
	  if (ev === 'readable') {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }
	  return res;
	};
	Readable.prototype.removeAllListeners = function (ev) {
	  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
	  if (ev === 'readable' || ev === undefined) {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }
	  return res;
	};
	function updateReadableListening(self) {
	  var state = self._readableState;
	  state.readableListening = self.listenerCount('readable') > 0;
	  if (state.resumeScheduled && !state.paused) {
	    // flowing needs to be set to true now, otherwise
	    // the upcoming resume will not flow.
	    state.flowing = true;

	    // crude way to check if we should resume
	  } else if (self.listenerCount('data') > 0) {
	    self.resume();
	  }
	}
	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    // we flow only if there is no one listening
	    // for readable, but we still have to call
	    // resume()
	    state.flowing = !state.readableListening;
	    resume(this, state);
	  }
	  state.paused = false;
	  return this;
	};
	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(resume_, stream, state);
	  }
	}
	function resume_(stream, state) {
	  debug('resume', state.reading);
	  if (!state.reading) {
	    stream.read(0);
	  }
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}
	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (this._readableState.flowing !== false) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  this._readableState.paused = true;
	  return this;
	};
	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null);
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var _this = this;
	  var state = this._readableState;
	  var paused = false;
	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }
	    _this.push(null);
	  });
	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
	    var ret = _this.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function methodWrap(method) {
	        return function methodWrapReturnFunction() {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents.length; n++) {
	    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  this._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };
	  return this;
	};
	if (typeof Symbol === 'function') {
	  Readable.prototype[Symbol.asyncIterator] = function () {
	    if (createReadableStreamAsyncIterator === undefined) {
	      createReadableStreamAsyncIterator = requireAsync_iterator();
	    }
	    return createReadableStreamAsyncIterator(this);
	  };
	}
	Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.highWaterMark;
	  }
	});
	Object.defineProperty(Readable.prototype, 'readableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState && this._readableState.buffer;
	  }
	});
	Object.defineProperty(Readable.prototype, 'readableFlowing', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.flowing;
	  },
	  set: function set(state) {
	    if (this._readableState) {
	      this._readableState.flowing = state;
	    }
	  }
	});

	// exposed for testing purposes only.
	Readable._fromList = fromList;
	Object.defineProperty(Readable.prototype, 'readableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.length;
	  }
	});

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;
	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = state.buffer.consume(n, state.decoder);
	  }
	  return ret;
	}
	function endReadable(stream) {
	  var state = stream._readableState;
	  debug('endReadable', state.endEmitted);
	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(endReadableNT, state, stream);
	  }
	}
	function endReadableNT(state, stream) {
	  debug('endReadableNT', state.endEmitted, state.length);

	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	    if (state.autoDestroy) {
	      // In case of duplex streams we need a way to detect
	      // if the writable side is ready for autoDestroy as well
	      var wState = stream._writableState;
	      if (!wState || wState.autoDestroy && wState.finished) {
	        stream.destroy();
	      }
	    }
	  }
	}
	if (typeof Symbol === 'function') {
	  Readable.from = function (iterable, opts) {
	    if (from === undefined) {
	      from = requireFrom();
	    }
	    return from(Readable, iterable, opts);
	  };
	}
	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}
	return _stream_readable;
}

var _stream_duplex;
var hasRequired_stream_duplex;

function require_stream_duplex () {
	if (hasRequired_stream_duplex) return _stream_duplex;
	hasRequired_stream_duplex = 1;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	};
	/*</replacement>*/

	_stream_duplex = Duplex;
	var Readable = require_stream_readable();
	var Writable = require_stream_writable();
	requireInherits()(Duplex, Readable);
	{
	  // Allow the keys array to be GC'ed.
	  var keys = objectKeys(Writable.prototype);
	  for (var v = 0; v < keys.length; v++) {
	    var method = keys[v];
	    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	  }
	}
	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);
	  Readable.call(this, options);
	  Writable.call(this, options);
	  this.allowHalfOpen = true;
	  if (options) {
	    if (options.readable === false) this.readable = false;
	    if (options.writable === false) this.writable = false;
	    if (options.allowHalfOpen === false) {
	      this.allowHalfOpen = false;
	      this.once('end', onend);
	    }
	  }
	}
	Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.highWaterMark;
	  }
	});
	Object.defineProperty(Duplex.prototype, 'writableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState && this._writableState.getBuffer();
	  }
	});
	Object.defineProperty(Duplex.prototype, 'writableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.length;
	  }
	});

	// the no-half-open enforcer
	function onend() {
	  // If the writable side ended, then we're ok.
	  if (this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(onEndNT, this);
	}
	function onEndNT(self) {
	  self.end();
	}
	Object.defineProperty(Duplex.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});
	return _stream_duplex;
}

var _stream_writable;
var hasRequired_stream_writable;

function require_stream_writable () {
	if (hasRequired_stream_writable) return _stream_writable;
	hasRequired_stream_writable = 1;

	_stream_writable = Writable;

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;
	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Writable.WritableState = WritableState;

	/*<replacement>*/
	var internalUtil = {
	  deprecate: requireNode$1()
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = requireStream$1();
	/*</replacement>*/

	var Buffer = require$$0$2.Buffer;
	var OurUint8Array = (typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}
	var destroyImpl = requireDestroy();
	var _require = requireState(),
	  getHighWaterMark = _require.getHighWaterMark;
	var _require$codes = requireErrors().codes,
	  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
	  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
	  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
	  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
	  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
	  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
	  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
	var errorOrDestroy = destroyImpl.errorOrDestroy;
	requireInherits()(Writable, Stream);
	function nop() {}
	function WritableState(options, stream, isDuplex) {
	  Duplex = Duplex || require_stream_duplex();
	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream,
	  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;
	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;
	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // Should close be emitted on destroy. Defaults to true.
	  this.emitClose = options.emitClose !== false;

	  // Should .destroy() be called after 'finish' (and potentially 'end')
	  this.autoDestroy = !!options.autoDestroy;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}
	WritableState.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};
	(function () {
	  try {
	    Object.defineProperty(WritableState.prototype, 'buffer', {
	      get: internalUtil.deprecate(function writableStateBufferGetter() {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable, Symbol.hasInstance, {
	    value: function value(object) {
	      if (realHasInstance.call(this, object)) return true;
	      if (this !== Writable) return false;
	      return object && object._writableState instanceof WritableState;
	    }
	  });
	} else {
	  realHasInstance = function realHasInstance(object) {
	    return object instanceof this;
	  };
	}
	function Writable(options) {
	  Duplex = Duplex || require_stream_duplex();

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.

	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the WritableState constructor, at least with V8 6.5
	  var isDuplex = this instanceof Duplex;
	  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
	  this._writableState = new WritableState(options, this, isDuplex);

	  // legacy.
	  this.writable = true;
	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;
	    if (typeof options.writev === 'function') this._writev = options.writev;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	    if (typeof options.final === 'function') this._final = options.final;
	  }
	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
	};
	function writeAfterEnd(stream, cb) {
	  var er = new ERR_STREAM_WRITE_AFTER_END();
	  // TODO: defer error events consistently everywhere, not just the cb
	  errorOrDestroy(stream, er);
	  process.nextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk(stream, state, chunk, cb) {
	  var er;
	  if (chunk === null) {
	    er = new ERR_STREAM_NULL_VALUES();
	  } else if (typeof chunk !== 'string' && !state.objectMode) {
	    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
	  }
	  if (er) {
	    errorOrDestroy(stream, er);
	    process.nextTick(cb, er);
	    return false;
	  }
	  return true;
	}
	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = !state.objectMode && _isUint8Array(chunk);
	  if (isBuf && !Buffer.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer(chunk);
	  }
	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }
	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
	  if (typeof cb !== 'function') cb = nop;
	  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
	  }
	  return ret;
	};
	Writable.prototype.cork = function () {
	  this._writableState.corked++;
	};
	Writable.prototype.uncork = function () {
	  var state = this._writableState;
	  if (state.corked) {
	    state.corked--;
	    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};
	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};
	Object.defineProperty(Writable.prototype, 'writableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState && this._writableState.getBuffer();
	  }
	});
	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer.from(chunk, encoding);
	  }
	  return chunk;
	}
	Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.highWaterMark;
	  }
	});

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;
	  state.length += len;
	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;
	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }
	  return ret;
	}
	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}
	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;
	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    process.nextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    process.nextTick(finishMaybe, stream, state);
	    stream._writableState.errorEmitted = true;
	    errorOrDestroy(stream, er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    errorOrDestroy(stream, er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe(stream, state);
	  }
	}
	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}
	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;
	  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
	  onwriteStateUpdate(state);
	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state) || stream.destroyed;
	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }
	    if (sync) {
	      process.nextTick(afterWrite, stream, state, finished, cb);
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}
	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;
	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;
	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer.allBuffers = allBuffers;
	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;
	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }
	    if (entry === null) state.lastBufferedRequest = null;
	  }
	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}
	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
	};
	Writable.prototype._writev = null;
	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }
	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending) endWritable(this, state, cb);
	  return this;
	};
	Object.defineProperty(Writable.prototype, 'writableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.length;
	  }
	});
	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      errorOrDestroy(stream, err);
	    }
	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe(stream, state);
	  });
	}
	function prefinish(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function' && !state.destroyed) {
	      state.pendingcb++;
	      state.finalCalled = true;
	      process.nextTick(callFinal, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}
	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    prefinish(stream, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');
	      if (state.autoDestroy) {
	        // In case of duplex streams we need a way to detect
	        // if the readable side is ready for autoDestroy as well
	        var rState = stream._readableState;
	        if (!rState || rState.autoDestroy && rState.endEmitted) {
	          stream.destroy();
	        }
	      }
	    }
	  }
	  return need;
	}
	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}
	function onCorkedFinish(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }

	  // reuse the free corkReq.
	  state.corkedRequestsFree.next = corkReq;
	}
	Object.defineProperty(Writable.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});
	Writable.prototype.destroy = destroyImpl.destroy;
	Writable.prototype._undestroy = destroyImpl.undestroy;
	Writable.prototype._destroy = function (err, cb) {
	  cb(err);
	};
	return _stream_writable;
}

var hasRequiredModern;

function requireModern () {
	if (hasRequiredModern) return modern.exports;
	hasRequiredModern = 1;

	const util = require$$0$7;
	const Writable = require_stream_writable();
	const { LEVEL } = requireTripleBeam();

	/**
	 * Constructor function for the TransportStream. This is the base prototype
	 * that all `winston >= 3` transports should inherit from.
	 * @param {Object} options - Options for this TransportStream instance
	 * @param {String} options.level - Highest level according to RFC5424.
	 * @param {Boolean} options.handleExceptions - If true, info with
	 * { exception: true } will be written.
	 * @param {Function} options.log - Custom log function for simple Transport
	 * creation
	 * @param {Function} options.close - Called on "unpipe" from parent.
	 */
	const TransportStream = modern.exports = function TransportStream(options = {}) {
	  Writable.call(this, { objectMode: true, highWaterMark: options.highWaterMark });

	  this.format = options.format;
	  this.level = options.level;
	  this.handleExceptions = options.handleExceptions;
	  this.handleRejections = options.handleRejections;
	  this.silent = options.silent;

	  if (options.log) this.log = options.log;
	  if (options.logv) this.logv = options.logv;
	  if (options.close) this.close = options.close;

	  // Get the levels from the source we are piped from.
	  this.once('pipe', logger => {
	    // Remark (indexzero): this bookkeeping can only support multiple
	    // Logger parents with the same `levels`. This comes into play in
	    // the `winston.Container` code in which `container.add` takes
	    // a fully realized set of options with pre-constructed TransportStreams.
	    this.levels = logger.levels;
	    this.parent = logger;
	  });

	  // If and/or when the transport is removed from this instance
	  this.once('unpipe', src => {
	    // Remark (indexzero): this bookkeeping can only support multiple
	    // Logger parents with the same `levels`. This comes into play in
	    // the `winston.Container` code in which `container.add` takes
	    // a fully realized set of options with pre-constructed TransportStreams.
	    if (src === this.parent) {
	      this.parent = null;
	      if (this.close) {
	        this.close();
	      }
	    }
	  });
	};

	/*
	 * Inherit from Writeable using Node.js built-ins
	 */
	util.inherits(TransportStream, Writable);

	/**
	 * Writes the info object to our transport instance.
	 * @param {mixed} info - TODO: add param description.
	 * @param {mixed} enc - TODO: add param description.
	 * @param {function} callback - TODO: add param description.
	 * @returns {undefined}
	 * @private
	 */
	TransportStream.prototype._write = function _write(info, enc, callback) {
	  if (this.silent || (info.exception === true && !this.handleExceptions)) {
	    return callback(null);
	  }

	  // Remark: This has to be handled in the base transport now because we
	  // cannot conditionally write to our pipe targets as stream. We always
	  // prefer any explicit level set on the Transport itself falling back to
	  // any level set on the parent.
	  const level = this.level || (this.parent && this.parent.level);

	  if (!level || this.levels[level] >= this.levels[info[LEVEL]]) {
	    if (info && !this.format) {
	      return this.log(info, callback);
	    }

	    let errState;
	    let transformed;

	    // We trap(and re-throw) any errors generated by the user-provided format, but also
	    // guarantee that the streams callback is invoked so that we can continue flowing.
	    try {
	      transformed = this.format.transform(Object.assign({}, info), this.format.options);
	    } catch (err) {
	      errState = err;
	    }

	    if (errState || !transformed) {
	      // eslint-disable-next-line callback-return
	      callback();
	      if (errState) throw errState;
	      return;
	    }

	    return this.log(transformed, callback);
	  }
	  this._writableState.sync = false;
	  return callback(null);
	};

	/**
	 * Writes the batch of info objects (i.e. "object chunks") to our transport
	 * instance after performing any necessary filtering.
	 * @param {mixed} chunks - TODO: add params description.
	 * @param {function} callback - TODO: add params description.
	 * @returns {mixed} - TODO: add returns description.
	 * @private
	 */
	TransportStream.prototype._writev = function _writev(chunks, callback) {
	  if (this.logv) {
	    const infos = chunks.filter(this._accept, this);
	    if (!infos.length) {
	      return callback(null);
	    }

	    // Remark (indexzero): from a performance perspective if Transport
	    // implementers do choose to implement logv should we make it their
	    // responsibility to invoke their format?
	    return this.logv(infos, callback);
	  }

	  for (let i = 0; i < chunks.length; i++) {
	    if (!this._accept(chunks[i])) continue;

	    if (chunks[i].chunk && !this.format) {
	      this.log(chunks[i].chunk, chunks[i].callback);
	      continue;
	    }

	    let errState;
	    let transformed;

	    // We trap(and re-throw) any errors generated by the user-provided format, but also
	    // guarantee that the streams callback is invoked so that we can continue flowing.
	    try {
	      transformed = this.format.transform(
	        Object.assign({}, chunks[i].chunk),
	        this.format.options
	      );
	    } catch (err) {
	      errState = err;
	    }

	    if (errState || !transformed) {
	      // eslint-disable-next-line callback-return
	      chunks[i].callback();
	      if (errState) {
	        // eslint-disable-next-line callback-return
	        callback(null);
	        throw errState;
	      }
	    } else {
	      this.log(transformed, chunks[i].callback);
	    }
	  }

	  return callback(null);
	};

	/**
	 * Predicate function that returns true if the specfied `info` on the
	 * WriteReq, `write`, should be passed down into the derived
	 * TransportStream's I/O via `.log(info, callback)`.
	 * @param {WriteReq} write - winston@3 Node.js WriteReq for the `info` object
	 * representing the log message.
	 * @returns {Boolean} - Value indicating if the `write` should be accepted &
	 * logged.
	 */
	TransportStream.prototype._accept = function _accept(write) {
	  const info = write.chunk;
	  if (this.silent) {
	    return false;
	  }

	  // We always prefer any explicit level set on the Transport itself
	  // falling back to any level set on the parent.
	  const level = this.level || (this.parent && this.parent.level);

	  // Immediately check the average case: log level filtering.
	  if (
	    info.exception === true ||
	    !level ||
	    this.levels[level] >= this.levels[info[LEVEL]]
	  ) {
	    // Ensure the info object is valid based on `{ exception }`:
	    // 1. { handleExceptions: true }: all `info` objects are valid
	    // 2. { exception: false }: accepted by all transports.
	    if (this.handleExceptions || info.exception !== true) {
	      return true;
	    }
	  }

	  return false;
	};

	/**
	 * _nop is short for "No operation"
	 * @returns {Boolean} Intentionally false.
	 */
	TransportStream.prototype._nop = function _nop() {
	  // eslint-disable-next-line no-undefined
	  return undefined;
	};
	return modern.exports;
}

var legacy = {exports: {}};

var hasRequiredLegacy;

function requireLegacy () {
	if (hasRequiredLegacy) return legacy.exports;
	hasRequiredLegacy = 1;

	const util = require$$0$7;
	const { LEVEL } = requireTripleBeam();
	const TransportStream = requireModern();

	/**
	 * Constructor function for the LegacyTransportStream. This is an internal
	 * wrapper `winston >= 3` uses to wrap older transports implementing
	 * log(level, message, meta).
	 * @param {Object} options - Options for this TransportStream instance.
	 * @param {Transpot} options.transport - winston@2 or older Transport to wrap.
	 */

	const LegacyTransportStream = legacy.exports = function LegacyTransportStream(options = {}) {
	  TransportStream.call(this, options);
	  if (!options.transport || typeof options.transport.log !== 'function') {
	    throw new Error('Invalid transport, must be an object with a log method.');
	  }

	  this.transport = options.transport;
	  this.level = this.level || options.transport.level;
	  this.handleExceptions = this.handleExceptions || options.transport.handleExceptions;

	  // Display our deprecation notice.
	  this._deprecated();

	  // Properly bubble up errors from the transport to the
	  // LegacyTransportStream instance, but only once no matter how many times
	  // this transport is shared.
	  function transportError(err) {
	    this.emit('error', err, this.transport);
	  }

	  if (!this.transport.__winstonError) {
	    this.transport.__winstonError = transportError.bind(this);
	    this.transport.on('error', this.transport.__winstonError);
	  }
	};

	/*
	 * Inherit from TransportStream using Node.js built-ins
	 */
	util.inherits(LegacyTransportStream, TransportStream);

	/**
	 * Writes the info object to our transport instance.
	 * @param {mixed} info - TODO: add param description.
	 * @param {mixed} enc - TODO: add param description.
	 * @param {function} callback - TODO: add param description.
	 * @returns {undefined}
	 * @private
	 */
	LegacyTransportStream.prototype._write = function _write(info, enc, callback) {
	  if (this.silent || (info.exception === true && !this.handleExceptions)) {
	    return callback(null);
	  }

	  // Remark: This has to be handled in the base transport now because we
	  // cannot conditionally write to our pipe targets as stream.
	  if (!this.level || this.levels[this.level] >= this.levels[info[LEVEL]]) {
	    this.transport.log(info[LEVEL], info.message, info, this._nop);
	  }

	  callback(null);
	};

	/**
	 * Writes the batch of info objects (i.e. "object chunks") to our transport
	 * instance after performing any necessary filtering.
	 * @param {mixed} chunks - TODO: add params description.
	 * @param {function} callback - TODO: add params description.
	 * @returns {mixed} - TODO: add returns description.
	 * @private
	 */
	LegacyTransportStream.prototype._writev = function _writev(chunks, callback) {
	  for (let i = 0; i < chunks.length; i++) {
	    if (this._accept(chunks[i])) {
	      this.transport.log(
	        chunks[i].chunk[LEVEL],
	        chunks[i].chunk.message,
	        chunks[i].chunk,
	        this._nop
	      );
	      chunks[i].callback();
	    }
	  }

	  return callback(null);
	};

	/**
	 * Displays a deprecation notice. Defined as a function so it can be
	 * overriden in tests.
	 * @returns {undefined}
	 */
	LegacyTransportStream.prototype._deprecated = function _deprecated() {
	  // eslint-disable-next-line no-console
	  console.error([
	    `${this.transport.name} is a legacy winston transport. Consider upgrading: `,
	    '- Upgrade docs: https://github.com/winstonjs/winston/blob/master/UPGRADE-3.0.md'
	  ].join('\n'));
	};

	/**
	 * Clean up error handling state on the legacy transport associated
	 * with this instance.
	 * @returns {undefined}
	 */
	LegacyTransportStream.prototype.close = function close() {
	  if (this.transport.close) {
	    this.transport.close();
	  }

	  if (this.transport.__winstonError) {
	    this.transport.removeListener('error', this.transport.__winstonError);
	    this.transport.__winstonError = null;
	  }
	};
	return legacy.exports;
}

var hasRequiredWinstonTransport;

function requireWinstonTransport () {
	if (hasRequiredWinstonTransport) return winstonTransport.exports;
	hasRequiredWinstonTransport = 1;

	// Expose modern transport directly as the export
	winstonTransport.exports = requireModern();

	// Expose legacy stream
	winstonTransport.exports.LegacyTransportStream = requireLegacy();
	return winstonTransport.exports;
}

/* eslint-disable no-console */

var console_1$1;
var hasRequiredConsole$1;

function requireConsole$1 () {
	if (hasRequiredConsole$1) return console_1$1;
	hasRequiredConsole$1 = 1;

	const os = require$$0$6;
	const { LEVEL, MESSAGE } = requireTripleBeam();
	const TransportStream = requireWinstonTransport();

	/**
	 * Transport for outputting to the console.
	 * @type {Console}
	 * @extends {TransportStream}
	 */
	console_1$1 = class Console extends TransportStream {
	  /**
	   * Constructor function for the Console transport object responsible for
	   * persisting log messages and metadata to a terminal or TTY.
	   * @param {!Object} [options={}] - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    // Expose the name of this Transport on the prototype
	    this.name = options.name || 'console';
	    this.stderrLevels = this._stringArrayToSet(options.stderrLevels);
	    this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels);
	    this.eol = typeof options.eol === 'string' ? options.eol : os.EOL;
	    this.forceConsole = options.forceConsole || false;

	    // Keep a reference to the log, warn, and error console methods
	    // in case they get redirected to this transport after the logger is
	    // instantiated. This prevents a circular reference issue.
	    this._consoleLog = console.log.bind(console);
	    this._consoleWarn = console.warn.bind(console);
	    this._consoleError = console.error.bind(console);

	    this.setMaxListeners(30);
	  }

	  /**
	   * Core logging method exposed to Winston.
	   * @param {Object} info - TODO: add param description.
	   * @param {Function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback) {
	    setImmediate(() => this.emit('logged', info));

	    // Remark: what if there is no raw...?
	    if (this.stderrLevels[info[LEVEL]]) {
	      if (console._stderr && !this.forceConsole) {
	        // Node.js maps `process.stderr` to `console._stderr`.
	        console._stderr.write(`${info[MESSAGE]}${this.eol}`);
	      } else {
	        // console.error adds a newline
	        this._consoleError(info[MESSAGE]);
	      }

	      if (callback) {
	        callback(); // eslint-disable-line callback-return
	      }
	      return;
	    } else if (this.consoleWarnLevels[info[LEVEL]]) {
	      if (console._stderr && !this.forceConsole) {
	        // Node.js maps `process.stderr` to `console._stderr`.
	        // in Node.js console.warn is an alias for console.error
	        console._stderr.write(`${info[MESSAGE]}${this.eol}`);
	      } else {
	        // console.warn adds a newline
	        this._consoleWarn(info[MESSAGE]);
	      }

	      if (callback) {
	        callback(); // eslint-disable-line callback-return
	      }
	      return;
	    }

	    if (console._stdout && !this.forceConsole) {
	      // Node.js maps `process.stdout` to `console._stdout`.
	      console._stdout.write(`${info[MESSAGE]}${this.eol}`);
	    } else {
	      // console.log adds a newline.
	      this._consoleLog(info[MESSAGE]);
	    }

	    if (callback) {
	      callback(); // eslint-disable-line callback-return
	    }
	  }

	  /**
	   * Returns a Set-like object with strArray's elements as keys (each with the
	   * value true).
	   * @param {Array} strArray - Array of Set-elements as strings.
	   * @param {?string} [errMsg] - Custom error message thrown on invalid input.
	   * @returns {Object} - TODO: add return description.
	   * @private
	   */
	  _stringArrayToSet(strArray, errMsg) {
	    if (!strArray) return {};

	    errMsg =
	      errMsg || 'Cannot make set from type other than Array of string elements';

	    if (!Array.isArray(strArray)) {
	      throw new Error(errMsg);
	    }

	    return strArray.reduce((set, el) => {
	      if (typeof el !== 'string') {
	        throw new Error(errMsg);
	      }
	      set[el] = true;

	      return set;
	    }, {});
	  }
	};
	return console_1$1;
}

var series = {exports: {}};

var parallel = {exports: {}};

var isArrayLike = {exports: {}};

var hasRequiredIsArrayLike;

function requireIsArrayLike () {
	if (hasRequiredIsArrayLike) return isArrayLike.exports;
	hasRequiredIsArrayLike = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = isArrayLike;
		function isArrayLike(value) {
		    return value && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0;
		}
		module.exports = exports.default; 
	} (isArrayLike, isArrayLike.exports));
	return isArrayLike.exports;
}

var wrapAsync = {};

var asyncify = {exports: {}};

var initialParams = {exports: {}};

var hasRequiredInitialParams;

function requireInitialParams () {
	if (hasRequiredInitialParams) return initialParams.exports;
	hasRequiredInitialParams = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		exports.default = function (fn) {
		    return function (...args /*, callback*/) {
		        var callback = args.pop();
		        return fn.call(this, args, callback);
		    };
		};

		module.exports = exports.default; 
	} (initialParams, initialParams.exports));
	return initialParams.exports;
}

var setImmediate$1 = {};

var hasRequiredSetImmediate;

function requireSetImmediate () {
	if (hasRequiredSetImmediate) return setImmediate$1;
	hasRequiredSetImmediate = 1;

	Object.defineProperty(setImmediate$1, "__esModule", {
	    value: true
	});
	setImmediate$1.fallback = fallback;
	setImmediate$1.wrap = wrap;
	/* istanbul ignore file */

	var hasQueueMicrotask = setImmediate$1.hasQueueMicrotask = typeof queueMicrotask === 'function' && queueMicrotask;
	var hasSetImmediate = setImmediate$1.hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
	var hasNextTick = setImmediate$1.hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

	function fallback(fn) {
	    setTimeout(fn, 0);
	}

	function wrap(defer) {
	    return (fn, ...args) => defer(() => fn(...args));
	}

	var _defer;

	if (hasQueueMicrotask) {
	    _defer = queueMicrotask;
	} else if (hasSetImmediate) {
	    _defer = setImmediate;
	} else if (hasNextTick) {
	    _defer = process.nextTick;
	} else {
	    _defer = fallback;
	}

	setImmediate$1.default = wrap(_defer);
	return setImmediate$1;
}

var hasRequiredAsyncify;

function requireAsyncify () {
	if (hasRequiredAsyncify) return asyncify.exports;
	hasRequiredAsyncify = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = asyncify;

		var _initialParams = requireInitialParams();

		var _initialParams2 = _interopRequireDefault(_initialParams);

		var _setImmediate = requireSetImmediate();

		var _setImmediate2 = _interopRequireDefault(_setImmediate);

		var _wrapAsync = requireWrapAsync();

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		/**
		 * Take a sync function and make it async, passing its return value to a
		 * callback. This is useful for plugging sync functions into a waterfall,
		 * series, or other async functions. Any arguments passed to the generated
		 * function will be passed to the wrapped function (except for the final
		 * callback argument). Errors thrown will be passed to the callback.
		 *
		 * If the function passed to `asyncify` returns a Promise, that promises's
		 * resolved/rejected state will be used to call the callback, rather than simply
		 * the synchronous return value.
		 *
		 * This also means you can asyncify ES2017 `async` functions.
		 *
		 * @name asyncify
		 * @static
		 * @memberOf module:Utils
		 * @method
		 * @alias wrapSync
		 * @category Util
		 * @param {Function} func - The synchronous function, or Promise-returning
		 * function to convert to an {@link AsyncFunction}.
		 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
		 * invoked with `(args..., callback)`.
		 * @example
		 *
		 * // passing a regular synchronous function
		 * async.waterfall([
		 *     async.apply(fs.readFile, filename, "utf8"),
		 *     async.asyncify(JSON.parse),
		 *     function (data, next) {
		 *         // data is the result of parsing the text.
		 *         // If there was a parsing error, it would have been caught.
		 *     }
		 * ], callback);
		 *
		 * // passing a function returning a promise
		 * async.waterfall([
		 *     async.apply(fs.readFile, filename, "utf8"),
		 *     async.asyncify(function (contents) {
		 *         return db.model.create(contents);
		 *     }),
		 *     function (model, next) {
		 *         // `model` is the instantiated model object.
		 *         // If there was an error, this function would be skipped.
		 *     }
		 * ], callback);
		 *
		 * // es2017 example, though `asyncify` is not needed if your JS environment
		 * // supports async functions out of the box
		 * var q = async.queue(async.asyncify(async function(file) {
		 *     var intermediateStep = await processFile(file);
		 *     return await somePromise(intermediateStep)
		 * }));
		 *
		 * q.push(files);
		 */
		function asyncify(func) {
		    if ((0, _wrapAsync.isAsync)(func)) {
		        return function (...args /*, callback*/) {
		            const callback = args.pop();
		            const promise = func.apply(this, args);
		            return handlePromise(promise, callback);
		        };
		    }

		    return (0, _initialParams2.default)(function (args, callback) {
		        var result;
		        try {
		            result = func.apply(this, args);
		        } catch (e) {
		            return callback(e);
		        }
		        // if result is Promise object
		        if (result && typeof result.then === 'function') {
		            return handlePromise(result, callback);
		        } else {
		            callback(null, result);
		        }
		    });
		}

		function handlePromise(promise, callback) {
		    return promise.then(value => {
		        invokeCallback(callback, null, value);
		    }, err => {
		        invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err));
		    });
		}

		function invokeCallback(callback, error, value) {
		    try {
		        callback(error, value);
		    } catch (err) {
		        (0, _setImmediate2.default)(e => {
		            throw e;
		        }, err);
		    }
		}
		module.exports = exports.default; 
	} (asyncify, asyncify.exports));
	return asyncify.exports;
}

var hasRequiredWrapAsync;

function requireWrapAsync () {
	if (hasRequiredWrapAsync) return wrapAsync;
	hasRequiredWrapAsync = 1;

	Object.defineProperty(wrapAsync, "__esModule", {
	    value: true
	});
	wrapAsync.isAsyncIterable = wrapAsync.isAsyncGenerator = wrapAsync.isAsync = undefined;

	var _asyncify = requireAsyncify();

	var _asyncify2 = _interopRequireDefault(_asyncify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function isAsync(fn) {
	    return fn[Symbol.toStringTag] === 'AsyncFunction';
	}

	function isAsyncGenerator(fn) {
	    return fn[Symbol.toStringTag] === 'AsyncGenerator';
	}

	function isAsyncIterable(obj) {
	    return typeof obj[Symbol.asyncIterator] === 'function';
	}

	function wrapAsync$1(asyncFn) {
	    if (typeof asyncFn !== 'function') throw new Error('expected a function');
	    return isAsync(asyncFn) ? (0, _asyncify2.default)(asyncFn) : asyncFn;
	}

	wrapAsync.default = wrapAsync$1;
	wrapAsync.isAsync = isAsync;
	wrapAsync.isAsyncGenerator = isAsyncGenerator;
	wrapAsync.isAsyncIterable = isAsyncIterable;
	return wrapAsync;
}

var awaitify = {exports: {}};

var hasRequiredAwaitify;

function requireAwaitify () {
	if (hasRequiredAwaitify) return awaitify.exports;
	hasRequiredAwaitify = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = awaitify;
		// conditionally promisify a function.
		// only return a promise if a callback is omitted
		function awaitify(asyncFn, arity) {
		    if (!arity) arity = asyncFn.length;
		    if (!arity) throw new Error('arity is undefined');
		    function awaitable(...args) {
		        if (typeof args[arity - 1] === 'function') {
		            return asyncFn.apply(this, args);
		        }

		        return new Promise((resolve, reject) => {
		            args[arity - 1] = (err, ...cbArgs) => {
		                if (err) return reject(err);
		                resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
		            };
		            asyncFn.apply(this, args);
		        });
		    }

		    return awaitable;
		}
		module.exports = exports.default; 
	} (awaitify, awaitify.exports));
	return awaitify.exports;
}

var hasRequiredParallel;

function requireParallel () {
	if (hasRequiredParallel) return parallel.exports;
	hasRequiredParallel = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		var _isArrayLike = requireIsArrayLike();

		var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

		var _wrapAsync = requireWrapAsync();

		var _wrapAsync2 = _interopRequireDefault(_wrapAsync);

		var _awaitify = requireAwaitify();

		var _awaitify2 = _interopRequireDefault(_awaitify);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		exports.default = (0, _awaitify2.default)((eachfn, tasks, callback) => {
		    var results = (0, _isArrayLike2.default)(tasks) ? [] : {};

		    eachfn(tasks, (task, key, taskCb) => {
		        (0, _wrapAsync2.default)(task)((err, ...result) => {
		            if (result.length < 2) {
		                [result] = result;
		            }
		            results[key] = result;
		            taskCb(err);
		        });
		    }, err => callback(err, results));
		}, 3);
		module.exports = exports.default; 
	} (parallel, parallel.exports));
	return parallel.exports;
}

var eachOfSeries = {exports: {}};

var eachOfLimit$1 = {exports: {}};

var eachOfLimit = {exports: {}};

var once = {exports: {}};

var hasRequiredOnce;

function requireOnce () {
	if (hasRequiredOnce) return once.exports;
	hasRequiredOnce = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = once;
		function once(fn) {
		    function wrapper(...args) {
		        if (fn === null) return;
		        var callFn = fn;
		        fn = null;
		        callFn.apply(this, args);
		    }
		    Object.assign(wrapper, fn);
		    return wrapper;
		}
		module.exports = exports.default; 
	} (once, once.exports));
	return once.exports;
}

var iterator = {exports: {}};

var getIterator = {exports: {}};

var hasRequiredGetIterator;

function requireGetIterator () {
	if (hasRequiredGetIterator) return getIterator.exports;
	hasRequiredGetIterator = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		exports.default = function (coll) {
		    return coll[Symbol.iterator] && coll[Symbol.iterator]();
		};

		module.exports = exports.default; 
	} (getIterator, getIterator.exports));
	return getIterator.exports;
}

var hasRequiredIterator;

function requireIterator () {
	if (hasRequiredIterator) return iterator.exports;
	hasRequiredIterator = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = createIterator;

		var _isArrayLike = requireIsArrayLike();

		var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

		var _getIterator = requireGetIterator();

		var _getIterator2 = _interopRequireDefault(_getIterator);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		function createArrayIterator(coll) {
		    var i = -1;
		    var len = coll.length;
		    return function next() {
		        return ++i < len ? { value: coll[i], key: i } : null;
		    };
		}

		function createES2015Iterator(iterator) {
		    var i = -1;
		    return function next() {
		        var item = iterator.next();
		        if (item.done) return null;
		        i++;
		        return { value: item.value, key: i };
		    };
		}

		function createObjectIterator(obj) {
		    var okeys = obj ? Object.keys(obj) : [];
		    var i = -1;
		    var len = okeys.length;
		    return function next() {
		        var key = okeys[++i];
		        if (key === '__proto__') {
		            return next();
		        }
		        return i < len ? { value: obj[key], key } : null;
		    };
		}

		function createIterator(coll) {
		    if ((0, _isArrayLike2.default)(coll)) {
		        return createArrayIterator(coll);
		    }

		    var iterator = (0, _getIterator2.default)(coll);
		    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
		}
		module.exports = exports.default; 
	} (iterator, iterator.exports));
	return iterator.exports;
}

var onlyOnce = {exports: {}};

var hasRequiredOnlyOnce;

function requireOnlyOnce () {
	if (hasRequiredOnlyOnce) return onlyOnce.exports;
	hasRequiredOnlyOnce = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = onlyOnce;
		function onlyOnce(fn) {
		    return function (...args) {
		        if (fn === null) throw new Error("Callback was already called.");
		        var callFn = fn;
		        fn = null;
		        callFn.apply(this, args);
		    };
		}
		module.exports = exports.default; 
	} (onlyOnce, onlyOnce.exports));
	return onlyOnce.exports;
}

var asyncEachOfLimit = {exports: {}};

var breakLoop = {exports: {}};

var hasRequiredBreakLoop;

function requireBreakLoop () {
	if (hasRequiredBreakLoop) return breakLoop.exports;
	hasRequiredBreakLoop = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		// A temporary value used to identify if the loop should be broken.
		// See #1064, #1293
		const breakLoop = {};
		exports.default = breakLoop;
		module.exports = exports.default; 
	} (breakLoop, breakLoop.exports));
	return breakLoop.exports;
}

var hasRequiredAsyncEachOfLimit;

function requireAsyncEachOfLimit () {
	if (hasRequiredAsyncEachOfLimit) return asyncEachOfLimit.exports;
	hasRequiredAsyncEachOfLimit = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = asyncEachOfLimit;

		var _breakLoop = requireBreakLoop();

		var _breakLoop2 = _interopRequireDefault(_breakLoop);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		// for async generators
		function asyncEachOfLimit(generator, limit, iteratee, callback) {
		    let done = false;
		    let canceled = false;
		    let awaiting = false;
		    let running = 0;
		    let idx = 0;

		    function replenish() {
		        //console.log('replenish')
		        if (running >= limit || awaiting || done) return;
		        //console.log('replenish awaiting')
		        awaiting = true;
		        generator.next().then(({ value, done: iterDone }) => {
		            //console.log('got value', value)
		            if (canceled || done) return;
		            awaiting = false;
		            if (iterDone) {
		                done = true;
		                if (running <= 0) {
		                    //console.log('done nextCb')
		                    callback(null);
		                }
		                return;
		            }
		            running++;
		            iteratee(value, idx, iterateeCallback);
		            idx++;
		            replenish();
		        }).catch(handleError);
		    }

		    function iterateeCallback(err, result) {
		        //console.log('iterateeCallback')
		        running -= 1;
		        if (canceled) return;
		        if (err) return handleError(err);

		        if (err === false) {
		            done = true;
		            canceled = true;
		            return;
		        }

		        if (result === _breakLoop2.default || done && running <= 0) {
		            done = true;
		            //console.log('done iterCb')
		            return callback(null);
		        }
		        replenish();
		    }

		    function handleError(err) {
		        if (canceled) return;
		        awaiting = false;
		        done = true;
		        callback(err);
		    }

		    replenish();
		}
		module.exports = exports.default; 
	} (asyncEachOfLimit, asyncEachOfLimit.exports));
	return asyncEachOfLimit.exports;
}

var hasRequiredEachOfLimit$1;

function requireEachOfLimit$1 () {
	if (hasRequiredEachOfLimit$1) return eachOfLimit.exports;
	hasRequiredEachOfLimit$1 = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		var _once = requireOnce();

		var _once2 = _interopRequireDefault(_once);

		var _iterator = requireIterator();

		var _iterator2 = _interopRequireDefault(_iterator);

		var _onlyOnce = requireOnlyOnce();

		var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

		var _wrapAsync = requireWrapAsync();

		var _asyncEachOfLimit = requireAsyncEachOfLimit();

		var _asyncEachOfLimit2 = _interopRequireDefault(_asyncEachOfLimit);

		var _breakLoop = requireBreakLoop();

		var _breakLoop2 = _interopRequireDefault(_breakLoop);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		exports.default = limit => {
		    return (obj, iteratee, callback) => {
		        callback = (0, _once2.default)(callback);
		        if (limit <= 0) {
		            throw new RangeError('concurrency limit cannot be less than 1');
		        }
		        if (!obj) {
		            return callback(null);
		        }
		        if ((0, _wrapAsync.isAsyncGenerator)(obj)) {
		            return (0, _asyncEachOfLimit2.default)(obj, limit, iteratee, callback);
		        }
		        if ((0, _wrapAsync.isAsyncIterable)(obj)) {
		            return (0, _asyncEachOfLimit2.default)(obj[Symbol.asyncIterator](), limit, iteratee, callback);
		        }
		        var nextElem = (0, _iterator2.default)(obj);
		        var done = false;
		        var canceled = false;
		        var running = 0;
		        var looping = false;

		        function iterateeCallback(err, value) {
		            if (canceled) return;
		            running -= 1;
		            if (err) {
		                done = true;
		                callback(err);
		            } else if (err === false) {
		                done = true;
		                canceled = true;
		            } else if (value === _breakLoop2.default || done && running <= 0) {
		                done = true;
		                return callback(null);
		            } else if (!looping) {
		                replenish();
		            }
		        }

		        function replenish() {
		            looping = true;
		            while (running < limit && !done) {
		                var elem = nextElem();
		                if (elem === null) {
		                    done = true;
		                    if (running <= 0) {
		                        callback(null);
		                    }
		                    return;
		                }
		                running += 1;
		                iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
		            }
		            looping = false;
		        }

		        replenish();
		    };
		};

		module.exports = exports.default; 
	} (eachOfLimit, eachOfLimit.exports));
	return eachOfLimit.exports;
}

var hasRequiredEachOfLimit;

function requireEachOfLimit () {
	if (hasRequiredEachOfLimit) return eachOfLimit$1.exports;
	hasRequiredEachOfLimit = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		var _eachOfLimit2 = requireEachOfLimit$1();

		var _eachOfLimit3 = _interopRequireDefault(_eachOfLimit2);

		var _wrapAsync = requireWrapAsync();

		var _wrapAsync2 = _interopRequireDefault(_wrapAsync);

		var _awaitify = requireAwaitify();

		var _awaitify2 = _interopRequireDefault(_awaitify);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		/**
		 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
		 * time.
		 *
		 * @name eachOfLimit
		 * @static
		 * @memberOf module:Collections
		 * @method
		 * @see [async.eachOf]{@link module:Collections.eachOf}
		 * @alias forEachOfLimit
		 * @category Collection
		 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
		 * @param {number} limit - The maximum number of async operations at a time.
		 * @param {AsyncFunction} iteratee - An async function to apply to each
		 * item in `coll`. The `key` is the item's key, or index in the case of an
		 * array.
		 * Invoked with (item, key, callback).
		 * @param {Function} [callback] - A callback which is called when all
		 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
		 * @returns {Promise} a promise, if a callback is omitted
		 */
		function eachOfLimit(coll, limit, iteratee, callback) {
		    return (0, _eachOfLimit3.default)(limit)(coll, (0, _wrapAsync2.default)(iteratee), callback);
		}

		exports.default = (0, _awaitify2.default)(eachOfLimit, 4);
		module.exports = exports.default; 
	} (eachOfLimit$1, eachOfLimit$1.exports));
	return eachOfLimit$1.exports;
}

var hasRequiredEachOfSeries;

function requireEachOfSeries () {
	if (hasRequiredEachOfSeries) return eachOfSeries.exports;
	hasRequiredEachOfSeries = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		var _eachOfLimit = requireEachOfLimit();

		var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);

		var _awaitify = requireAwaitify();

		var _awaitify2 = _interopRequireDefault(_awaitify);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		/**
		 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
		 *
		 * @name eachOfSeries
		 * @static
		 * @memberOf module:Collections
		 * @method
		 * @see [async.eachOf]{@link module:Collections.eachOf}
		 * @alias forEachOfSeries
		 * @category Collection
		 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
		 * @param {AsyncFunction} iteratee - An async function to apply to each item in
		 * `coll`.
		 * Invoked with (item, key, callback).
		 * @param {Function} [callback] - A callback which is called when all `iteratee`
		 * functions have finished, or an error occurs. Invoked with (err).
		 * @returns {Promise} a promise, if a callback is omitted
		 */
		function eachOfSeries(coll, iteratee, callback) {
		    return (0, _eachOfLimit2.default)(coll, 1, iteratee, callback);
		}
		exports.default = (0, _awaitify2.default)(eachOfSeries, 3);
		module.exports = exports.default; 
	} (eachOfSeries, eachOfSeries.exports));
	return eachOfSeries.exports;
}

var hasRequiredSeries;

function requireSeries () {
	if (hasRequiredSeries) return series.exports;
	hasRequiredSeries = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = series;

		var _parallel2 = requireParallel();

		var _parallel3 = _interopRequireDefault(_parallel2);

		var _eachOfSeries = requireEachOfSeries();

		var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		/**
		 * Run the functions in the `tasks` collection in series, each one running once
		 * the previous function has completed. If any functions in the series pass an
		 * error to its callback, no more functions are run, and `callback` is
		 * immediately called with the value of the error. Otherwise, `callback`
		 * receives an array of results when `tasks` have completed.
		 *
		 * It is also possible to use an object instead of an array. Each property will
		 * be run as a function, and the results will be passed to the final `callback`
		 * as an object instead of an array. This can be a more readable way of handling
		 *  results from {@link async.series}.
		 *
		 * **Note** that while many implementations preserve the order of object
		 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
		 * explicitly states that
		 *
		 * > The mechanics and order of enumerating the properties is not specified.
		 *
		 * So if you rely on the order in which your series of functions are executed,
		 * and want this to work on all platforms, consider using an array.
		 *
		 * @name series
		 * @static
		 * @memberOf module:ControlFlow
		 * @method
		 * @category Control Flow
		 * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection containing
		 * [async functions]{@link AsyncFunction} to run in series.
		 * Each function can complete with any number of optional `result` values.
		 * @param {Function} [callback] - An optional callback to run once all the
		 * functions have completed. This function gets a results array (or object)
		 * containing all the result arguments passed to the `task` callbacks. Invoked
		 * with (err, result).
		 * @return {Promise} a promise, if no callback is passed
		 * @example
		 *
		 * //Using Callbacks
		 * async.series([
		 *     function(callback) {
		 *         setTimeout(function() {
		 *             // do some async task
		 *             callback(null, 'one');
		 *         }, 200);
		 *     },
		 *     function(callback) {
		 *         setTimeout(function() {
		 *             // then do another async task
		 *             callback(null, 'two');
		 *         }, 100);
		 *     }
		 * ], function(err, results) {
		 *     console.log(results);
		 *     // results is equal to ['one','two']
		 * });
		 *
		 * // an example using objects instead of arrays
		 * async.series({
		 *     one: function(callback) {
		 *         setTimeout(function() {
		 *             // do some async task
		 *             callback(null, 1);
		 *         }, 200);
		 *     },
		 *     two: function(callback) {
		 *         setTimeout(function() {
		 *             // then do another async task
		 *             callback(null, 2);
		 *         }, 100);
		 *     }
		 * }, function(err, results) {
		 *     console.log(results);
		 *     // results is equal to: { one: 1, two: 2 }
		 * });
		 *
		 * //Using Promises
		 * async.series([
		 *     function(callback) {
		 *         setTimeout(function() {
		 *             callback(null, 'one');
		 *         }, 200);
		 *     },
		 *     function(callback) {
		 *         setTimeout(function() {
		 *             callback(null, 'two');
		 *         }, 100);
		 *     }
		 * ]).then(results => {
		 *     console.log(results);
		 *     // results is equal to ['one','two']
		 * }).catch(err => {
		 *     console.log(err);
		 * });
		 *
		 * // an example using an object instead of an array
		 * async.series({
		 *     one: function(callback) {
		 *         setTimeout(function() {
		 *             // do some async task
		 *             callback(null, 1);
		 *         }, 200);
		 *     },
		 *     two: function(callback) {
		 *         setTimeout(function() {
		 *             // then do another async task
		 *             callback(null, 2);
		 *         }, 100);
		 *     }
		 * }).then(results => {
		 *     console.log(results);
		 *     // results is equal to: { one: 1, two: 2 }
		 * }).catch(err => {
		 *     console.log(err);
		 * });
		 *
		 * //Using async/await
		 * async () => {
		 *     try {
		 *         let results = await async.series([
		 *             function(callback) {
		 *                 setTimeout(function() {
		 *                     // do some async task
		 *                     callback(null, 'one');
		 *                 }, 200);
		 *             },
		 *             function(callback) {
		 *                 setTimeout(function() {
		 *                     // then do another async task
		 *                     callback(null, 'two');
		 *                 }, 100);
		 *             }
		 *         ]);
		 *         console.log(results);
		 *         // results is equal to ['one','two']
		 *     }
		 *     catch (err) {
		 *         console.log(err);
		 *     }
		 * }
		 *
		 * // an example using an object instead of an array
		 * async () => {
		 *     try {
		 *         let results = await async.parallel({
		 *             one: function(callback) {
		 *                 setTimeout(function() {
		 *                     // do some async task
		 *                     callback(null, 1);
		 *                 }, 200);
		 *             },
		 *            two: function(callback) {
		 *                 setTimeout(function() {
		 *                     // then do another async task
		 *                     callback(null, 2);
		 *                 }, 100);
		 *            }
		 *         });
		 *         console.log(results);
		 *         // results is equal to: { one: 1, two: 2 }
		 *     }
		 *     catch (err) {
		 *         console.log(err);
		 *     }
		 * }
		 *
		 */
		function series(tasks, callback) {
		    return (0, _parallel3.default)(_eachOfSeries2.default, tasks, callback);
		}
		module.exports = exports.default; 
	} (series, series.exports));
	return series.exports;
}

var readable = {exports: {}};

var _stream_transform;
var hasRequired_stream_transform;

function require_stream_transform () {
	if (hasRequired_stream_transform) return _stream_transform;
	hasRequired_stream_transform = 1;

	_stream_transform = Transform;
	var _require$codes = requireErrors().codes,
	  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
	  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
	  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
	var Duplex = require_stream_duplex();
	requireInherits()(Transform, Duplex);
	function afterTransform(er, data) {
	  var ts = this._transformState;
	  ts.transforming = false;
	  var cb = ts.writecb;
	  if (cb === null) {
	    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
	  }
	  ts.writechunk = null;
	  ts.writecb = null;
	  if (data != null)
	    // single equals check for both `null` and `undefined`
	    this.push(data);
	  cb(er);
	  var rs = this._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    this._read(rs.highWaterMark);
	  }
	}
	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);
	  Duplex.call(this, options);
	  this._transformState = {
	    afterTransform: afterTransform.bind(this),
	    needTransform: false,
	    transforming: false,
	    writecb: null,
	    writechunk: null,
	    writeencoding: null
	  };

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;
	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;
	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  this.on('prefinish', prefinish);
	}
	function prefinish() {
	  var _this = this;
	  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
	    this._flush(function (er, data) {
	      done(_this, er, data);
	    });
	  } else {
	    done(this, null, null);
	  }
	}
	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
	};
	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;
	  if (ts.writechunk !== null && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};
	Transform.prototype._destroy = function (err, cb) {
	  Duplex.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	  });
	};
	function done(stream, er, data) {
	  if (er) return stream.emit('error', er);
	  if (data != null)
	    // single equals check for both `null` and `undefined`
	    stream.push(data);

	  // TODO(BridgeAR): Write a test for these two error cases
	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
	  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
	  return stream.push(null);
	}
	return _stream_transform;
}

var _stream_passthrough;
var hasRequired_stream_passthrough;

function require_stream_passthrough () {
	if (hasRequired_stream_passthrough) return _stream_passthrough;
	hasRequired_stream_passthrough = 1;

	_stream_passthrough = PassThrough;
	var Transform = require_stream_transform();
	requireInherits()(PassThrough, Transform);
	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);
	  Transform.call(this, options);
	}
	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};
	return _stream_passthrough;
}

var pipeline_1;
var hasRequiredPipeline;

function requirePipeline () {
	if (hasRequiredPipeline) return pipeline_1;
	hasRequiredPipeline = 1;

	var eos;
	function once(callback) {
	  var called = false;
	  return function () {
	    if (called) return;
	    called = true;
	    callback.apply(undefined, arguments);
	  };
	}
	var _require$codes = requireErrors().codes,
	  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
	  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
	function noop(err) {
	  // Rethrow the error if it exists to avoid swallowing it
	  if (err) throw err;
	}
	function isRequest(stream) {
	  return stream.setHeader && typeof stream.abort === 'function';
	}
	function destroyer(stream, reading, writing, callback) {
	  callback = once(callback);
	  var closed = false;
	  stream.on('close', function () {
	    closed = true;
	  });
	  if (eos === undefined) eos = requireEndOfStream();
	  eos(stream, {
	    readable: reading,
	    writable: writing
	  }, function (err) {
	    if (err) return callback(err);
	    closed = true;
	    callback();
	  });
	  var destroyed = false;
	  return function (err) {
	    if (closed) return;
	    if (destroyed) return;
	    destroyed = true;

	    // request.destroy just do .end - .abort is what we want
	    if (isRequest(stream)) return stream.abort();
	    if (typeof stream.destroy === 'function') return stream.destroy();
	    callback(err || new ERR_STREAM_DESTROYED('pipe'));
	  };
	}
	function call(fn) {
	  fn();
	}
	function pipe(from, to) {
	  return from.pipe(to);
	}
	function popCallback(streams) {
	  if (!streams.length) return noop;
	  if (typeof streams[streams.length - 1] !== 'function') return noop;
	  return streams.pop();
	}
	function pipeline() {
	  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
	    streams[_key] = arguments[_key];
	  }
	  var callback = popCallback(streams);
	  if (Array.isArray(streams[0])) streams = streams[0];
	  if (streams.length < 2) {
	    throw new ERR_MISSING_ARGS('streams');
	  }
	  var error;
	  var destroys = streams.map(function (stream, i) {
	    var reading = i < streams.length - 1;
	    var writing = i > 0;
	    return destroyer(stream, reading, writing, function (err) {
	      if (!error) error = err;
	      if (err) destroys.forEach(call);
	      if (reading) return;
	      destroys.forEach(call);
	      callback(error);
	    });
	  });
	  return streams.reduce(pipe);
	}
	pipeline_1 = pipeline;
	return pipeline_1;
}

var hasRequiredReadable;

function requireReadable () {
	if (hasRequiredReadable) return readable.exports;
	hasRequiredReadable = 1;
	(function (module, exports) {
		var Stream = require$$0$3;
		if (process.env.READABLE_STREAM === 'disable' && Stream) {
		  module.exports = Stream.Readable;
		  Object.assign(module.exports, Stream);
		  module.exports.Stream = Stream;
		} else {
		  exports = module.exports = require_stream_readable();
		  exports.Stream = Stream || exports;
		  exports.Readable = exports;
		  exports.Writable = require_stream_writable();
		  exports.Duplex = require_stream_duplex();
		  exports.Transform = require_stream_transform();
		  exports.PassThrough = require_stream_passthrough();
		  exports.finished = requireEndOfStream();
		  exports.pipeline = requirePipeline();
		} 
	} (readable, readable.exports));
	return readable.exports;
}

var node = {exports: {}};

/**
 * Contains all configured adapters for the given environment.
 *
 * @type {Array}
 * @public
 */

var diagnostics;
var hasRequiredDiagnostics;

function requireDiagnostics () {
	if (hasRequiredDiagnostics) return diagnostics;
	hasRequiredDiagnostics = 1;
	var adapters = [];

	/**
	 * Contains all modifier functions.
	 *
	 * @typs {Array}
	 * @public
	 */
	var modifiers = [];

	/**
	 * Our default logger.
	 *
	 * @public
	 */
	var logger = function devnull() {};

	/**
	 * Register a new adapter that will used to find environments.
	 *
	 * @param {Function} adapter A function that will return the possible env.
	 * @returns {Boolean} Indication of a successful add.
	 * @public
	 */
	function use(adapter) {
	  if (~adapters.indexOf(adapter)) return false;

	  adapters.push(adapter);
	  return true;
	}

	/**
	 * Assign a new log method.
	 *
	 * @param {Function} custom The log method.
	 * @public
	 */
	function set(custom) {
	  logger = custom;
	}

	/**
	 * Check if the namespace is allowed by any of our adapters.
	 *
	 * @param {String} namespace The namespace that needs to be enabled
	 * @returns {Boolean|Promise} Indication if the namespace is enabled by our adapters.
	 * @public
	 */
	function enabled(namespace) {
	  var async = [];

	  for (var i = 0; i < adapters.length; i++) {
	    if (adapters[i].async) {
	      async.push(adapters[i]);
	      continue;
	    }

	    if (adapters[i](namespace)) return true;
	  }

	  if (!async.length) return false;

	  //
	  // Now that we know that we Async functions, we know we run in an ES6
	  // environment and can use all the API's that they offer, in this case
	  // we want to return a Promise so that we can `await` in React-Native
	  // for an async adapter.
	  //
	  return new Promise(function pinky(resolve) {
	    Promise.all(
	      async.map(function prebind(fn) {
	        return fn(namespace);
	      })
	    ).then(function resolved(values) {
	      resolve(values.some(Boolean));
	    });
	  });
	}

	/**
	 * Add a new message modifier to the debugger.
	 *
	 * @param {Function} fn Modification function.
	 * @returns {Boolean} Indication of a successful add.
	 * @public
	 */
	function modify(fn) {
	  if (~modifiers.indexOf(fn)) return false;

	  modifiers.push(fn);
	  return true;
	}

	/**
	 * Write data to the supplied logger.
	 *
	 * @param {Object} meta Meta information about the log.
	 * @param {Array} args Arguments for console.log.
	 * @public
	 */
	function write() {
	  logger.apply(logger, arguments);
	}

	/**
	 * Process the message with the modifiers.
	 *
	 * @param {Mixed} message The message to be transformed by modifers.
	 * @returns {String} Transformed message.
	 * @public
	 */
	function process(message) {
	  for (var i = 0; i < modifiers.length; i++) {
	    message = modifiers[i].apply(modifiers[i], arguments);
	  }

	  return message;
	}

	/**
	 * Introduce options to the logger function.
	 *
	 * @param {Function} fn Calback function.
	 * @param {Object} options Properties to introduce on fn.
	 * @returns {Function} The passed function
	 * @public
	 */
	function introduce(fn, options) {
	  var has = Object.prototype.hasOwnProperty;

	  for (var key in options) {
	    if (has.call(options, key)) {
	      fn[key] = options[key];
	    }
	  }

	  return fn;
	}

	/**
	 * Nope, we're not allowed to write messages.
	 *
	 * @returns {Boolean} false
	 * @public
	 */
	function nope(options) {
	  options.enabled = false;
	  options.modify = modify;
	  options.set = set;
	  options.use = use;

	  return introduce(function diagnopes() {
	    return false;
	  }, options);
	}

	/**
	 * Yep, we're allowed to write debug messages.
	 *
	 * @param {Object} options The options for the process.
	 * @returns {Function} The function that does the logging.
	 * @public
	 */
	function yep(options) {
	  /**
	   * The function that receives the actual debug information.
	   *
	   * @returns {Boolean} indication that we're logging.
	   * @public
	   */
	  function diagnostics() {
	    var args = Array.prototype.slice.call(arguments, 0);

	    write.call(write, options, process(args, options));
	    return true;
	  }

	  options.enabled = true;
	  options.modify = modify;
	  options.set = set;
	  options.use = use;

	  return introduce(diagnostics, options);
	}

	/**
	 * Simple helper function to introduce various of helper methods to our given
	 * diagnostics function.
	 *
	 * @param {Function} diagnostics The diagnostics function.
	 * @returns {Function} diagnostics
	 * @public
	 */
	diagnostics = function create(diagnostics) {
	  diagnostics.introduce = introduce;
	  diagnostics.enabled = enabled;
	  diagnostics.process = process;
	  diagnostics.modify = modify;
	  diagnostics.write = write;
	  diagnostics.nope = nope;
	  diagnostics.yep = yep;
	  diagnostics.set = set;
	  diagnostics.use = use;

	  return diagnostics;
	};
	return diagnostics;
}

var production;
var hasRequiredProduction;

function requireProduction () {
	if (hasRequiredProduction) return production;
	hasRequiredProduction = 1;
	var create = requireDiagnostics();

	/**
	 * Create a new diagnostics logger.
	 *
	 * @param {String} namespace The namespace it should enable.
	 * @param {Object} options Additional options.
	 * @returns {Function} The logger.
	 * @public
	 */
	var diagnostics = create(function prod(namespace, options) {
	  options = options || {};
	  options.namespace = namespace;
	  options.prod = true;
	  options.dev = false;

	  if (!(options.force || prod.force)) return prod.nope(options);
	  return prod.yep(options);
	});

	//
	// Expose the diagnostics logger.
	//
	production = diagnostics;
	return production;
}

var colorString = {exports: {}};

var colorName;
var hasRequiredColorName;

function requireColorName () {
	if (hasRequiredColorName) return colorName;
	hasRequiredColorName = 1;

	colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};
	return colorName;
}

var simpleSwizzle = {exports: {}};

var isArrayish;
var hasRequiredIsArrayish;

function requireIsArrayish () {
	if (hasRequiredIsArrayish) return isArrayish;
	hasRequiredIsArrayish = 1;
	isArrayish = function isArrayish(obj) {
		if (!obj || typeof obj === 'string') {
			return false;
		}

		return obj instanceof Array || Array.isArray(obj) ||
			(obj.length >= 0 && (obj.splice instanceof Function ||
				(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
	};
	return isArrayish;
}

var hasRequiredSimpleSwizzle;

function requireSimpleSwizzle () {
	if (hasRequiredSimpleSwizzle) return simpleSwizzle.exports;
	hasRequiredSimpleSwizzle = 1;

	var isArrayish = requireIsArrayish();

	var concat = Array.prototype.concat;
	var slice = Array.prototype.slice;

	var swizzle = simpleSwizzle.exports = function swizzle(args) {
		var results = [];

		for (var i = 0, len = args.length; i < len; i++) {
			var arg = args[i];

			if (isArrayish(arg)) {
				// http://jsperf.com/javascript-array-concat-vs-push/98
				results = concat.call(results, slice.call(arg));
			} else {
				results.push(arg);
			}
		}

		return results;
	};

	swizzle.wrap = function (fn) {
		return function () {
			return fn(swizzle(arguments));
		};
	};
	return simpleSwizzle.exports;
}

/* MIT license */

var hasRequiredColorString;

function requireColorString () {
	if (hasRequiredColorString) return colorString.exports;
	hasRequiredColorString = 1;
	var colorNames = requireColorName();
	var swizzle = requireSimpleSwizzle();
	var hasOwnProperty = Object.hasOwnProperty;

	var reverseNames = Object.create(null);

	// create a list of reverse color names
	for (var name in colorNames) {
		if (hasOwnProperty.call(colorNames, name)) {
			reverseNames[colorNames[name]] = name;
		}
	}

	var cs = colorString.exports = {
		to: {},
		get: {}
	};

	cs.get = function (string) {
		var prefix = string.substring(0, 3).toLowerCase();
		var val;
		var model;
		switch (prefix) {
			case 'hsl':
				val = cs.get.hsl(string);
				model = 'hsl';
				break;
			case 'hwb':
				val = cs.get.hwb(string);
				model = 'hwb';
				break;
			default:
				val = cs.get.rgb(string);
				model = 'rgb';
				break;
		}

		if (!val) {
			return null;
		}

		return {model: model, value: val};
	};

	cs.get.rgb = function (string) {
		if (!string) {
			return null;
		}

		var abbr = /^#([a-f0-9]{3,4})$/i;
		var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
		var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
		var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
		var keyword = /^(\w+)$/;

		var rgb = [0, 0, 0, 1];
		var match;
		var i;
		var hexAlpha;

		if (match = string.match(hex)) {
			hexAlpha = match[2];
			match = match[1];

			for (i = 0; i < 3; i++) {
				// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
				var i2 = i * 2;
				rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
			}

			if (hexAlpha) {
				rgb[3] = parseInt(hexAlpha, 16) / 255;
			}
		} else if (match = string.match(abbr)) {
			match = match[1];
			hexAlpha = match[3];

			for (i = 0; i < 3; i++) {
				rgb[i] = parseInt(match[i] + match[i], 16);
			}

			if (hexAlpha) {
				rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
			}
		} else if (match = string.match(rgba)) {
			for (i = 0; i < 3; i++) {
				rgb[i] = parseInt(match[i + 1], 0);
			}

			if (match[4]) {
				if (match[5]) {
					rgb[3] = parseFloat(match[4]) * 0.01;
				} else {
					rgb[3] = parseFloat(match[4]);
				}
			}
		} else if (match = string.match(per)) {
			for (i = 0; i < 3; i++) {
				rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
			}

			if (match[4]) {
				if (match[5]) {
					rgb[3] = parseFloat(match[4]) * 0.01;
				} else {
					rgb[3] = parseFloat(match[4]);
				}
			}
		} else if (match = string.match(keyword)) {
			if (match[1] === 'transparent') {
				return [0, 0, 0, 0];
			}

			if (!hasOwnProperty.call(colorNames, match[1])) {
				return null;
			}

			rgb = colorNames[match[1]];
			rgb[3] = 1;

			return rgb;
		} else {
			return null;
		}

		for (i = 0; i < 3; i++) {
			rgb[i] = clamp(rgb[i], 0, 255);
		}
		rgb[3] = clamp(rgb[3], 0, 1);

		return rgb;
	};

	cs.get.hsl = function (string) {
		if (!string) {
			return null;
		}

		var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
		var match = string.match(hsl);

		if (match) {
			var alpha = parseFloat(match[4]);
			var h = ((parseFloat(match[1]) % 360) + 360) % 360;
			var s = clamp(parseFloat(match[2]), 0, 100);
			var l = clamp(parseFloat(match[3]), 0, 100);
			var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

			return [h, s, l, a];
		}

		return null;
	};

	cs.get.hwb = function (string) {
		if (!string) {
			return null;
		}

		var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
		var match = string.match(hwb);

		if (match) {
			var alpha = parseFloat(match[4]);
			var h = ((parseFloat(match[1]) % 360) + 360) % 360;
			var w = clamp(parseFloat(match[2]), 0, 100);
			var b = clamp(parseFloat(match[3]), 0, 100);
			var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
			return [h, w, b, a];
		}

		return null;
	};

	cs.to.hex = function () {
		var rgba = swizzle(arguments);

		return (
			'#' +
			hexDouble(rgba[0]) +
			hexDouble(rgba[1]) +
			hexDouble(rgba[2]) +
			(rgba[3] < 1
				? (hexDouble(Math.round(rgba[3] * 255)))
				: '')
		);
	};

	cs.to.rgb = function () {
		var rgba = swizzle(arguments);

		return rgba.length < 4 || rgba[3] === 1
			? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
			: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
	};

	cs.to.rgb.percent = function () {
		var rgba = swizzle(arguments);

		var r = Math.round(rgba[0] / 255 * 100);
		var g = Math.round(rgba[1] / 255 * 100);
		var b = Math.round(rgba[2] / 255 * 100);

		return rgba.length < 4 || rgba[3] === 1
			? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
			: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
	};

	cs.to.hsl = function () {
		var hsla = swizzle(arguments);
		return hsla.length < 4 || hsla[3] === 1
			? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
			: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
	};

	// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
	// (hwb have alpha optional & 1 is default value)
	cs.to.hwb = function () {
		var hwba = swizzle(arguments);

		var a = '';
		if (hwba.length >= 4 && hwba[3] !== 1) {
			a = ', ' + hwba[3];
		}

		return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
	};

	cs.to.keyword = function (rgb) {
		return reverseNames[rgb.slice(0, 3)];
	};

	// helpers
	function clamp(num, min, max) {
		return Math.min(Math.max(min, num), max);
	}

	function hexDouble(num) {
		var str = Math.round(num).toString(16).toUpperCase();
		return (str.length < 2) ? '0' + str : str;
	}
	return colorString.exports;
}

var conversions = {exports: {}};

/* MIT license */

var hasRequiredConversions;

function requireConversions () {
	if (hasRequiredConversions) return conversions.exports;
	hasRequiredConversions = 1;
	var cssKeywords = requireColorName();

	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	var reverseKeywords = {};
	for (var key in cssKeywords) {
		if (cssKeywords.hasOwnProperty(key)) {
			reverseKeywords[cssKeywords[key]] = key;
		}
	}

	var convert = conversions.exports = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	// hide .channels and .labels properties
	for (var model in convert) {
		if (convert.hasOwnProperty(model)) {
			if (!('channels' in convert[model])) {
				throw new Error('missing channels property: ' + model);
			}

			if (!('labels' in convert[model])) {
				throw new Error('missing channel labels property: ' + model);
			}

			if (convert[model].labels.length !== convert[model].channels) {
				throw new Error('channel and label counts mismatch: ' + model);
			}

			var channels = convert[model].channels;
			var labels = convert[model].labels;
			delete convert[model].channels;
			delete convert[model].labels;
			Object.defineProperty(convert[model], 'channels', {value: channels});
			Object.defineProperty(convert[model], 'labels', {value: labels});
		}
	}

	convert.rgb.hsl = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var min = Math.min(r, g, b);
		var max = Math.max(r, g, b);
		var delta = max - min;
		var h;
		var s;
		var l;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert.rgb.hsv = function (rgb) {
		var rdif;
		var gdif;
		var bdif;
		var h;
		var s;

		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var v = Math.max(r, g, b);
		var diff = v - Math.min(r, g, b);
		var diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}
			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert.rgb.hwb = function (rgb) {
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		var h = convert.rgb.hsl(rgb)[0];
		var w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert.rgb.cmyk = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var c;
		var m;
		var y;
		var k;

		k = Math.min(1 - r, 1 - g, 1 - b);
		c = (1 - r - k) / (1 - k) || 0;
		m = (1 - g - k) / (1 - k) || 0;
		y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	/**
	 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	 * */
	function comparativeDistance(x, y) {
		return (
			Math.pow(x[0] - y[0], 2) +
			Math.pow(x[1] - y[1], 2) +
			Math.pow(x[2] - y[2], 2)
		);
	}

	convert.rgb.keyword = function (rgb) {
		var reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		var currentClosestDistance = Infinity;
		var currentClosestKeyword;

		for (var keyword in cssKeywords) {
			if (cssKeywords.hasOwnProperty(keyword)) {
				var value = cssKeywords[keyword];

				// Compute comparative distance
				var distance = comparativeDistance(rgb, value);

				// Check if its less, if so set as closest
				if (distance < currentClosestDistance) {
					currentClosestDistance = distance;
					currentClosestKeyword = keyword;
				}
			}
		}

		return currentClosestKeyword;
	};

	convert.keyword.rgb = function (keyword) {
		return cssKeywords[keyword];
	};

	convert.rgb.xyz = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;

		// assume sRGB
		r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
		g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
		b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

		var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert.rgb.lab = function (rgb) {
		var xyz = convert.rgb.xyz(rgb);
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var l;
		var a;
		var b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b];
	};

	convert.hsl.rgb = function (hsl) {
		var h = hsl[0] / 360;
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var t1;
		var t2;
		var t3;
		var rgb;
		var val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		t1 = 2 * l - t2;

		rgb = [0, 0, 0];
		for (var i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}
			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert.hsl.hsv = function (hsl) {
		var h = hsl[0];
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var smin = s;
		var lmin = Math.max(l, 0.01);
		var sv;
		var v;

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		v = (l + s) / 2;
		sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert.hsv.rgb = function (hsv) {
		var h = hsv[0] / 60;
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var hi = Math.floor(h) % 6;

		var f = h - Math.floor(h);
		var p = 255 * v * (1 - s);
		var q = 255 * v * (1 - (s * f));
		var t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert.hsv.hsl = function (hsv) {
		var h = hsv[0];
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var vmin = Math.max(v, 0.01);
		var lmin;
		var sl;
		var l;

		l = (2 - s) * v;
		lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert.hwb.rgb = function (hwb) {
		var h = hwb[0] / 360;
		var wh = hwb[1] / 100;
		var bl = hwb[2] / 100;
		var ratio = wh + bl;
		var i;
		var v;
		var f;
		var n;

		// wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		i = Math.floor(6 * h);
		v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		n = wh + f * (v - wh); // linear interpolation

		var r;
		var g;
		var b;
		switch (i) {
			default:
			case 6:
			case 0: r = v; g = n; b = wh; break;
			case 1: r = n; g = v; b = wh; break;
			case 2: r = wh; g = v; b = n; break;
			case 3: r = wh; g = n; b = v; break;
			case 4: r = n; g = wh; b = v; break;
			case 5: r = v; g = wh; b = n; break;
		}

		return [r * 255, g * 255, b * 255];
	};

	convert.cmyk.rgb = function (cmyk) {
		var c = cmyk[0] / 100;
		var m = cmyk[1] / 100;
		var y = cmyk[2] / 100;
		var k = cmyk[3] / 100;
		var r;
		var g;
		var b;

		r = 1 - Math.min(1, c * (1 - k) + k);
		g = 1 - Math.min(1, m * (1 - k) + k);
		b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.rgb = function (xyz) {
		var x = xyz[0] / 100;
		var y = xyz[1] / 100;
		var z = xyz[2] / 100;
		var r;
		var g;
		var b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.204) + (z * 1.0570);

		// assume sRGB
		r = r > 0.0031308
			? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.lab = function (xyz) {
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var l;
		var a;
		var b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b];
	};

	convert.lab.xyz = function (lab) {
		var l = lab[0];
		var a = lab[1];
		var b = lab[2];
		var x;
		var y;
		var z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		var y2 = Math.pow(y, 3);
		var x2 = Math.pow(x, 3);
		var z2 = Math.pow(z, 3);
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert.lab.lch = function (lab) {
		var l = lab[0];
		var a = lab[1];
		var b = lab[2];
		var hr;
		var h;
		var c;

		hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert.lch.lab = function (lch) {
		var l = lch[0];
		var c = lch[1];
		var h = lch[2];
		var a;
		var b;
		var hr;

		hr = h / 360 * 2 * Math.PI;
		a = c * Math.cos(hr);
		b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert.rgb.ansi16 = function (args) {
		var r = args[0];
		var g = args[1];
		var b = args[2];
		var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		var ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert.hsv.ansi16 = function (args) {
		// optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};

	convert.rgb.ansi256 = function (args) {
		var r = args[0];
		var g = args[1];
		var b = args[2];

		// we use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		var ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert.ansi16.rgb = function (args) {
		var color = args % 10;

		// handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		var mult = (~~(args > 50) + 1) * 0.5;
		var r = ((color & 1) * mult) * 255;
		var g = (((color >> 1) & 1) * mult) * 255;
		var b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert.ansi256.rgb = function (args) {
		// handle greyscale
		if (args >= 232) {
			var c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		var rem;
		var r = Math.floor(args / 36) / 5 * 255;
		var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		var b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert.rgb.hex = function (args) {
		var integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		var string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.hex.rgb = function (args) {
		var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		var colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(function (char) {
				return char + char;
			}).join('');
		}

		var integer = parseInt(colorString, 16);
		var r = (integer >> 16) & 0xFF;
		var g = (integer >> 8) & 0xFF;
		var b = integer & 0xFF;

		return [r, g, b];
	};

	convert.rgb.hcg = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var max = Math.max(Math.max(r, g), b);
		var min = Math.min(Math.min(r, g), b);
		var chroma = (max - min);
		var grayscale;
		var hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma + 4;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert.hsl.hcg = function (hsl) {
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var c = 1;
		var f = 0;

		if (l < 0.5) {
			c = 2.0 * s * l;
		} else {
			c = 2.0 * s * (1.0 - l);
		}

		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert.hsv.hcg = function (hsv) {
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;

		var c = s * v;
		var f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert.hcg.rgb = function (hcg) {
		var h = hcg[0] / 360;
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		var pure = [0, 0, 0];
		var hi = (h % 1) * 6;
		var v = hi % 1;
		var w = 1 - v;
		var mg = 0;

		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert.hcg.hsv = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		var v = c + g * (1.0 - c);
		var f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert.hcg.hsl = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		var l = g * (1.0 - c) + 0.5 * c;
		var s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert.hcg.hwb = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;
		var v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert.hwb.hcg = function (hwb) {
		var w = hwb[1] / 100;
		var b = hwb[2] / 100;
		var v = 1 - b;
		var c = v - w;
		var g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert.gray.hsl = convert.gray.hsv = function (args) {
		return [0, 0, args[0]];
	};

	convert.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert.gray.hex = function (gray) {
		var val = Math.round(gray[0] / 100 * 255) & 0xFF;
		var integer = (val << 16) + (val << 8) + val;

		var string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.rgb.gray = function (rgb) {
		var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};
	return conversions.exports;
}

var route;
var hasRequiredRoute;

function requireRoute () {
	if (hasRequiredRoute) return route;
	hasRequiredRoute = 1;
	var conversions = requireConversions();

	/*
		this function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		var graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		var models = Object.keys(conversions);

		for (var len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		var graph = buildGraph();
		var queue = [fromModel]; // unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			var current = queue.pop();
			var adjacents = Object.keys(conversions[current]);

			for (var len = adjacents.length, i = 0; i < len; i++) {
				var adjacent = adjacents[i];
				var node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		var path = [graph[toModel].parent, toModel];
		var fn = conversions[graph[toModel].parent][toModel];

		var cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	route = function (fromModel) {
		var graph = deriveBFS(fromModel);
		var conversion = {};

		var models = Object.keys(graph);
		for (var len = models.length, i = 0; i < len; i++) {
			var toModel = models[i];
			var node = graph[toModel];

			if (node.parent === null) {
				// no possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};
	return route;
}

var colorConvert;
var hasRequiredColorConvert;

function requireColorConvert () {
	if (hasRequiredColorConvert) return colorConvert;
	hasRequiredColorConvert = 1;
	var conversions = requireConversions();
	var route = requireRoute();

	var convert = {};

	var models = Object.keys(conversions);

	function wrapRaw(fn) {
		var wrappedFn = function (args) {
			if (args === undefined || args === null) {
				return args;
			}

			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			}

			return fn(args);
		};

		// preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		var wrappedFn = function (args) {
			if (args === undefined || args === null) {
				return args;
			}

			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			}

			var result = fn(args);

			// we're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (var len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(function (fromModel) {
		convert[fromModel] = {};

		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

		var routes = route(fromModel);
		var routeModels = Object.keys(routes);

		routeModels.forEach(function (toModel) {
			var fn = routes[toModel];

			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	colorConvert = convert;
	return colorConvert;
}

var color;
var hasRequiredColor;

function requireColor () {
	if (hasRequiredColor) return color;
	hasRequiredColor = 1;

	var colorString = requireColorString();
	var convert = requireColorConvert();

	var _slice = [].slice;

	var skippedModels = [
		// to be honest, I don't really feel like keyword belongs in color convert, but eh.
		'keyword',

		// gray conflicts with some method names, and has its own method defined.
		'gray',

		// shouldn't really be in color-convert either...
		'hex'
	];

	var hashedModelKeys = {};
	Object.keys(convert).forEach(function (model) {
		hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
	});

	var limiters = {};

	function Color(obj, model) {
		if (!(this instanceof Color)) {
			return new Color(obj, model);
		}

		if (model && model in skippedModels) {
			model = null;
		}

		if (model && !(model in convert)) {
			throw new Error('Unknown model: ' + model);
		}

		var i;
		var channels;

		if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
			this.model = 'rgb';
			this.color = [0, 0, 0];
			this.valpha = 1;
		} else if (obj instanceof Color) {
			this.model = obj.model;
			this.color = obj.color.slice();
			this.valpha = obj.valpha;
		} else if (typeof obj === 'string') {
			var result = colorString.get(obj);
			if (result === null) {
				throw new Error('Unable to parse color from string: ' + obj);
			}

			this.model = result.model;
			channels = convert[this.model].channels;
			this.color = result.value.slice(0, channels);
			this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
		} else if (obj.length) {
			this.model = model || 'rgb';
			channels = convert[this.model].channels;
			var newArr = _slice.call(obj, 0, channels);
			this.color = zeroArray(newArr, channels);
			this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
		} else if (typeof obj === 'number') {
			// this is always RGB - can be converted later on.
			obj &= 0xFFFFFF;
			this.model = 'rgb';
			this.color = [
				(obj >> 16) & 0xFF,
				(obj >> 8) & 0xFF,
				obj & 0xFF
			];
			this.valpha = 1;
		} else {
			this.valpha = 1;

			var keys = Object.keys(obj);
			if ('alpha' in obj) {
				keys.splice(keys.indexOf('alpha'), 1);
				this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
			}

			var hashedKeys = keys.sort().join('');
			if (!(hashedKeys in hashedModelKeys)) {
				throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
			}

			this.model = hashedModelKeys[hashedKeys];

			var labels = convert[this.model].labels;
			var color = [];
			for (i = 0; i < labels.length; i++) {
				color.push(obj[labels[i]]);
			}

			this.color = zeroArray(color);
		}

		// perform limitations (clamping, etc.)
		if (limiters[this.model]) {
			channels = convert[this.model].channels;
			for (i = 0; i < channels; i++) {
				var limit = limiters[this.model][i];
				if (limit) {
					this.color[i] = limit(this.color[i]);
				}
			}
		}

		this.valpha = Math.max(0, Math.min(1, this.valpha));

		if (Object.freeze) {
			Object.freeze(this);
		}
	}

	Color.prototype = {
		toString: function () {
			return this.string();
		},

		toJSON: function () {
			return this[this.model]();
		},

		string: function (places) {
			var self = this.model in colorString.to ? this : this.rgb();
			self = self.round(typeof places === 'number' ? places : 1);
			var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
			return colorString.to[self.model](args);
		},

		percentString: function (places) {
			var self = this.rgb().round(typeof places === 'number' ? places : 1);
			var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
			return colorString.to.rgb.percent(args);
		},

		array: function () {
			return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
		},

		object: function () {
			var result = {};
			var channels = convert[this.model].channels;
			var labels = convert[this.model].labels;

			for (var i = 0; i < channels; i++) {
				result[labels[i]] = this.color[i];
			}

			if (this.valpha !== 1) {
				result.alpha = this.valpha;
			}

			return result;
		},

		unitArray: function () {
			var rgb = this.rgb().color;
			rgb[0] /= 255;
			rgb[1] /= 255;
			rgb[2] /= 255;

			if (this.valpha !== 1) {
				rgb.push(this.valpha);
			}

			return rgb;
		},

		unitObject: function () {
			var rgb = this.rgb().object();
			rgb.r /= 255;
			rgb.g /= 255;
			rgb.b /= 255;

			if (this.valpha !== 1) {
				rgb.alpha = this.valpha;
			}

			return rgb;
		},

		round: function (places) {
			places = Math.max(places || 0, 0);
			return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
		},

		alpha: function (val) {
			if (arguments.length) {
				return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
			}

			return this.valpha;
		},

		// rgb
		red: getset('rgb', 0, maxfn(255)),
		green: getset('rgb', 1, maxfn(255)),
		blue: getset('rgb', 2, maxfn(255)),

		hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

		saturationl: getset('hsl', 1, maxfn(100)),
		lightness: getset('hsl', 2, maxfn(100)),

		saturationv: getset('hsv', 1, maxfn(100)),
		value: getset('hsv', 2, maxfn(100)),

		chroma: getset('hcg', 1, maxfn(100)),
		gray: getset('hcg', 2, maxfn(100)),

		white: getset('hwb', 1, maxfn(100)),
		wblack: getset('hwb', 2, maxfn(100)),

		cyan: getset('cmyk', 0, maxfn(100)),
		magenta: getset('cmyk', 1, maxfn(100)),
		yellow: getset('cmyk', 2, maxfn(100)),
		black: getset('cmyk', 3, maxfn(100)),

		x: getset('xyz', 0, maxfn(100)),
		y: getset('xyz', 1, maxfn(100)),
		z: getset('xyz', 2, maxfn(100)),

		l: getset('lab', 0, maxfn(100)),
		a: getset('lab', 1),
		b: getset('lab', 2),

		keyword: function (val) {
			if (arguments.length) {
				return new Color(val);
			}

			return convert[this.model].keyword(this.color);
		},

		hex: function (val) {
			if (arguments.length) {
				return new Color(val);
			}

			return colorString.to.hex(this.rgb().round().color);
		},

		rgbNumber: function () {
			var rgb = this.rgb().color;
			return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
		},

		luminosity: function () {
			// http://www.w3.org/TR/WCAG20/#relativeluminancedef
			var rgb = this.rgb().color;

			var lum = [];
			for (var i = 0; i < rgb.length; i++) {
				var chan = rgb[i] / 255;
				lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
			}

			return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
		},

		contrast: function (color2) {
			// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
			var lum1 = this.luminosity();
			var lum2 = color2.luminosity();

			if (lum1 > lum2) {
				return (lum1 + 0.05) / (lum2 + 0.05);
			}

			return (lum2 + 0.05) / (lum1 + 0.05);
		},

		level: function (color2) {
			var contrastRatio = this.contrast(color2);
			if (contrastRatio >= 7.1) {
				return 'AAA';
			}

			return (contrastRatio >= 4.5) ? 'AA' : '';
		},

		isDark: function () {
			// YIQ equation from http://24ways.org/2010/calculating-color-contrast
			var rgb = this.rgb().color;
			var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
			return yiq < 128;
		},

		isLight: function () {
			return !this.isDark();
		},

		negate: function () {
			var rgb = this.rgb();
			for (var i = 0; i < 3; i++) {
				rgb.color[i] = 255 - rgb.color[i];
			}
			return rgb;
		},

		lighten: function (ratio) {
			var hsl = this.hsl();
			hsl.color[2] += hsl.color[2] * ratio;
			return hsl;
		},

		darken: function (ratio) {
			var hsl = this.hsl();
			hsl.color[2] -= hsl.color[2] * ratio;
			return hsl;
		},

		saturate: function (ratio) {
			var hsl = this.hsl();
			hsl.color[1] += hsl.color[1] * ratio;
			return hsl;
		},

		desaturate: function (ratio) {
			var hsl = this.hsl();
			hsl.color[1] -= hsl.color[1] * ratio;
			return hsl;
		},

		whiten: function (ratio) {
			var hwb = this.hwb();
			hwb.color[1] += hwb.color[1] * ratio;
			return hwb;
		},

		blacken: function (ratio) {
			var hwb = this.hwb();
			hwb.color[2] += hwb.color[2] * ratio;
			return hwb;
		},

		grayscale: function () {
			// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
			var rgb = this.rgb().color;
			var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
			return Color.rgb(val, val, val);
		},

		fade: function (ratio) {
			return this.alpha(this.valpha - (this.valpha * ratio));
		},

		opaquer: function (ratio) {
			return this.alpha(this.valpha + (this.valpha * ratio));
		},

		rotate: function (degrees) {
			var hsl = this.hsl();
			var hue = hsl.color[0];
			hue = (hue + degrees) % 360;
			hue = hue < 0 ? 360 + hue : hue;
			hsl.color[0] = hue;
			return hsl;
		},

		mix: function (mixinColor, weight) {
			// ported from sass implementation in C
			// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
			if (!mixinColor || !mixinColor.rgb) {
				throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
			}
			var color1 = mixinColor.rgb();
			var color2 = this.rgb();
			var p = weight === undefined ? 0.5 : weight;

			var w = 2 * p - 1;
			var a = color1.alpha() - color2.alpha();

			var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
			var w2 = 1 - w1;

			return Color.rgb(
					w1 * color1.red() + w2 * color2.red(),
					w1 * color1.green() + w2 * color2.green(),
					w1 * color1.blue() + w2 * color2.blue(),
					color1.alpha() * p + color2.alpha() * (1 - p));
		}
	};

	// model conversion methods and static constructors
	Object.keys(convert).forEach(function (model) {
		if (skippedModels.indexOf(model) !== -1) {
			return;
		}

		var channels = convert[model].channels;

		// conversion methods
		Color.prototype[model] = function () {
			if (this.model === model) {
				return new Color(this);
			}

			if (arguments.length) {
				return new Color(arguments, model);
			}

			var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
			return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
		};

		// 'static' construction methods
		Color[model] = function (color) {
			if (typeof color === 'number') {
				color = zeroArray(_slice.call(arguments), channels);
			}
			return new Color(color, model);
		};
	});

	function roundTo(num, places) {
		return Number(num.toFixed(places));
	}

	function roundToPlace(places) {
		return function (num) {
			return roundTo(num, places);
		};
	}

	function getset(model, channel, modifier) {
		model = Array.isArray(model) ? model : [model];

		model.forEach(function (m) {
			(limiters[m] || (limiters[m] = []))[channel] = modifier;
		});

		model = model[0];

		return function (val) {
			var result;

			if (arguments.length) {
				if (modifier) {
					val = modifier(val);
				}

				result = this[model]();
				result.color[channel] = val;
				return result;
			}

			result = this[model]().color[channel];
			if (modifier) {
				result = modifier(result);
			}

			return result;
		};
	}

	function maxfn(max) {
		return function (v) {
			return Math.max(0, Math.min(max, v));
		};
	}

	function assertArray(val) {
		return Array.isArray(val) ? val : [val];
	}

	function zeroArray(arr, length) {
		for (var i = 0; i < length; i++) {
			if (typeof arr[i] !== 'number') {
				arr[i] = 0;
			}
		}

		return arr;
	}

	color = Color;
	return color;
}

var textHex;
var hasRequiredTextHex;

function requireTextHex () {
	if (hasRequiredTextHex) return textHex;
	hasRequiredTextHex = 1;

	/***
	 * Convert string to hex color.
	 *
	 * @param {String} str Text to hash and convert to hex.
	 * @returns {String}
	 * @api public
	 */
	textHex = function hex(str) {
	  for (
	    var i = 0, hash = 0;
	    i < str.length;
	    hash = str.charCodeAt(i++) + ((hash << 5) - hash)
	  );

	  var color = Math.floor(
	    Math.abs(
	      (Math.sin(hash) * 10000) % 1 * 16777216
	    )
	  ).toString(16);

	  return '#' + Array(6 - color.length + 1).join('0') + color;
	};
	return textHex;
}

var colorspace;
var hasRequiredColorspace;

function requireColorspace () {
	if (hasRequiredColorspace) return colorspace;
	hasRequiredColorspace = 1;

	var color = requireColor()
	  , hex = requireTextHex();

	/**
	 * Generate a color for a given name. But be reasonably smart about it by
	 * understanding name spaces and coloring each namespace a bit lighter so they
	 * still have the same base color as the root.
	 *
	 * @param {string} namespace The namespace
	 * @param {string} [delimiter] The delimiter
	 * @returns {string} color
	 */
	colorspace = function colorspace(namespace, delimiter) {
	  var split = namespace.split(delimiter || ':');
	  var base = hex(split[0]);

	  if (!split.length) return base;

	  for (var i = 0, l = split.length - 1; i < l; i++) {
	    base = color(base)
	    .mix(color(hex(split[i + 1])))
	    .saturate(1)
	    .hex();
	  }

	  return base;
	};
	return colorspace;
}

var kuler;
var hasRequiredKuler;

function requireKuler () {
	if (hasRequiredKuler) return kuler;
	hasRequiredKuler = 1;

	/**
	 * Kuler: Color text using CSS colors
	 *
	 * @constructor
	 * @param {String} text The text that needs to be styled
	 * @param {String} color Optional color for alternate API.
	 * @api public
	 */
	function Kuler(text, color) {
	  if (color) return (new Kuler(text)).style(color);
	  if (!(this instanceof Kuler)) return new Kuler(text);

	  this.text = text;
	}

	/**
	 * ANSI color codes.
	 *
	 * @type {String}
	 * @private
	 */
	Kuler.prototype.prefix = '\x1b[';
	Kuler.prototype.suffix = 'm';

	/**
	 * Parse a hex color string and parse it to it's RGB equiv.
	 *
	 * @param {String} color
	 * @returns {Array}
	 * @api private
	 */
	Kuler.prototype.hex = function hex(color) {
	  color = color[0] === '#' ? color.substring(1) : color;

	  //
	  // Pre-parse for shorthand hex colors.
	  //
	  if (color.length === 3) {
	    color = color.split('');

	    color[5] = color[2]; // F60##0
	    color[4] = color[2]; // F60#00
	    color[3] = color[1]; // F60600
	    color[2] = color[1]; // F66600
	    color[1] = color[0]; // FF6600

	    color = color.join('');
	  }

	  var r = color.substring(0, 2)
	    , g = color.substring(2, 4)
	    , b = color.substring(4, 6);

	  return [ parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) ];
	};

	/**
	 * Transform a 255 RGB value to an RGV code.
	 *
	 * @param {Number} r Red color channel.
	 * @param {Number} g Green color channel.
	 * @param {Number} b Blue color channel.
	 * @returns {String}
	 * @api public
	 */
	Kuler.prototype.rgb = function rgb(r, g, b) {
	  var red = r / 255 * 5
	    , green = g / 255 * 5
	    , blue = b / 255 * 5;

	  return this.ansi(red, green, blue);
	};

	/**
	 * Turns RGB 0-5 values into a single ANSI code.
	 *
	 * @param {Number} r Red color channel.
	 * @param {Number} g Green color channel.
	 * @param {Number} b Blue color channel.
	 * @returns {String}
	 * @api public
	 */
	Kuler.prototype.ansi = function ansi(r, g, b) {
	  var red = Math.round(r)
	    , green = Math.round(g)
	    , blue = Math.round(b);

	  return 16 + (red * 36) + (green * 6) + blue;
	};

	/**
	 * Marks an end of color sequence.
	 *
	 * @returns {String} Reset sequence.
	 * @api public
	 */
	Kuler.prototype.reset = function reset() {
	  return this.prefix +'39;49'+ this.suffix;
	};

	/**
	 * Colour the terminal using CSS.
	 *
	 * @param {String} color The HEX color code.
	 * @returns {String} the escape code.
	 * @api public
	 */
	Kuler.prototype.style = function style(color) {
	  return this.prefix +'38;5;'+ this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
	};


	//
	// Expose the actual interface.
	//
	kuler = Kuler;
	return kuler;
}

var namespaceAnsi;
var hasRequiredNamespaceAnsi;

function requireNamespaceAnsi () {
	if (hasRequiredNamespaceAnsi) return namespaceAnsi;
	hasRequiredNamespaceAnsi = 1;
	var colorspace = requireColorspace();
	var kuler = requireKuler();

	/**
	 * Prefix the messages with a colored namespace.
	 *
	 * @param {Array} args The messages array that is getting written.
	 * @param {Object} options Options for diagnostics.
	 * @returns {Array} Altered messages array.
	 * @public
	 */
	namespaceAnsi = function ansiModifier(args, options) {
	  var namespace = options.namespace;
	  var ansi = options.colors !== false
	  ? kuler(namespace +':', colorspace(namespace))
	  : namespace +':';

	  args[0] = ansi +' '+ args[0];
	  return args;
	};
	return namespaceAnsi;
}

var enabled;
var hasRequiredEnabled;

function requireEnabled () {
	if (hasRequiredEnabled) return enabled;
	hasRequiredEnabled = 1;

	/**
	 * Checks if a given namespace is allowed by the given variable.
	 *
	 * @param {String} name namespace that should be included.
	 * @param {String} variable Value that needs to be tested.
	 * @returns {Boolean} Indication if namespace is enabled.
	 * @public
	 */
	enabled = function enabled(name, variable) {
	  if (!variable) return false;

	  var variables = variable.split(/[\s,]+/)
	    , i = 0;

	  for (; i < variables.length; i++) {
	    variable = variables[i].replace('*', '.*?');

	    if ('-' === variable.charAt(0)) {
	      if ((new RegExp('^'+ variable.substr(1) +'$')).test(name)) {
	        return false;
	      }

	      continue;
	    }

	    if ((new RegExp('^'+ variable +'$')).test(name)) {
	      return true;
	    }
	  }

	  return false;
	};
	return enabled;
}

var adapters;
var hasRequiredAdapters;

function requireAdapters () {
	if (hasRequiredAdapters) return adapters;
	hasRequiredAdapters = 1;
	var enabled = requireEnabled();

	/**
	 * Creates a new Adapter.
	 *
	 * @param {Function} fn Function that returns the value.
	 * @returns {Function} The adapter logic.
	 * @public
	 */
	adapters = function create(fn) {
	  return function adapter(namespace) {
	    try {
	      return enabled(namespace, fn());
	    } catch (e) { /* Any failure means that we found nothing */ }

	    return false;
	  };
	};
	return adapters;
}

var process_env;
var hasRequiredProcess_env;

function requireProcess_env () {
	if (hasRequiredProcess_env) return process_env;
	hasRequiredProcess_env = 1;
	var adapter = requireAdapters();

	/**
	 * Extracts the values from process.env.
	 *
	 * @type {Function}
	 * @public
	 */
	process_env = adapter(function processenv() {
	  return process.env.DEBUG || process.env.DIAGNOSTICS;
	});
	return process_env;
}

/**
 * An idiot proof logger to be used as default. We've wrapped it in a try/catch
 * statement to ensure the environments without the `console` API do not crash
 * as well as an additional fix for ancient browsers like IE8 where the
 * `console.log` API doesn't have an `apply`, so we need to use the Function's
 * apply functionality to apply the arguments.
 *
 * @param {Object} meta Options of the logger.
 * @param {Array} messages The actuall message that needs to be logged.
 * @public
 */

var console_1;
var hasRequiredConsole;

function requireConsole () {
	if (hasRequiredConsole) return console_1;
	hasRequiredConsole = 1;
	console_1 = function (meta, messages) {
	  //
	  // So yea. IE8 doesn't have an apply so we need a work around to puke the
	  // arguments in place.
	  //
	  try { Function.prototype.apply.call(console.log, console, messages); }
	  catch (e) {}
	};
	return console_1;
}

var development;
var hasRequiredDevelopment;

function requireDevelopment () {
	if (hasRequiredDevelopment) return development;
	hasRequiredDevelopment = 1;
	var create = requireDiagnostics();
	var tty = require$$1$1.isatty(1);

	/**
	 * Create a new diagnostics logger.
	 *
	 * @param {String} namespace The namespace it should enable.
	 * @param {Object} options Additional options.
	 * @returns {Function} The logger.
	 * @public
	 */
	var diagnostics = create(function dev(namespace, options) {
	  options = options || {};
	  options.colors = 'colors' in options ? options.colors : tty;
	  options.namespace = namespace;
	  options.prod = false;
	  options.dev = true;

	  if (!dev.enabled(namespace) && !(options.force || dev.force)) {
	    return dev.nope(options);
	  }
	  
	  return dev.yep(options);
	});

	//
	// Configure the logger for the given environment.
	//
	diagnostics.modify(requireNamespaceAnsi());
	diagnostics.use(requireProcess_env());
	diagnostics.set(requireConsole());

	//
	// Expose the diagnostics logger.
	//
	development = diagnostics;
	return development;
}

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	//
	// Select the correct build version depending on the environment.
	//
	if (process.env.NODE_ENV === 'production') {
	  node.exports = requireProduction();
	} else {
	  node.exports = requireDevelopment();
	}
	return node.exports;
}

/**
 * tail-file.js: TODO: add file header description.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var tailFile;
var hasRequiredTailFile;

function requireTailFile () {
	if (hasRequiredTailFile) return tailFile;
	hasRequiredTailFile = 1;

	const fs = require$$0$8;
	const { StringDecoder } = require$$1$2;
	const { Stream } = requireReadable();

	/**
	 * Simple no-op function.
	 * @returns {undefined}
	 */
	function noop() {}

	/**
	 * TODO: add function description.
	 * @param {Object} options - Options for tail.
	 * @param {function} iter - Iterator function to execute on every line.
	* `tail -f` a file. Options must include file.
	 * @returns {mixed} - TODO: add return description.
	 */
	tailFile = (options, iter) => {
	  const buffer = Buffer.alloc(64 * 1024);
	  const decode = new StringDecoder('utf8');
	  const stream = new Stream();
	  let buff = '';
	  let pos = 0;
	  let row = 0;

	  if (options.start === -1) {
	    delete options.start;
	  }

	  stream.readable = true;
	  stream.destroy = () => {
	    stream.destroyed = true;
	    stream.emit('end');
	    stream.emit('close');
	  };

	  fs.open(options.file, 'a+', '0644', (err, fd) => {
	    if (err) {
	      if (!iter) {
	        stream.emit('error', err);
	      } else {
	        iter(err);
	      }
	      stream.destroy();
	      return;
	    }

	    (function read() {
	      if (stream.destroyed) {
	        fs.close(fd, noop);
	        return;
	      }

	      return fs.read(fd, buffer, 0, buffer.length, pos, (error, bytes) => {
	        if (error) {
	          if (!iter) {
	            stream.emit('error', error);
	          } else {
	            iter(error);
	          }
	          stream.destroy();
	          return;
	        }

	        if (!bytes) {
	          if (buff) {
	            // eslint-disable-next-line eqeqeq
	            if (options.start == null || row > options.start) {
	              if (!iter) {
	                stream.emit('line', buff);
	              } else {
	                iter(null, buff);
	              }
	            }
	            row++;
	            buff = '';
	          }
	          return setTimeout(read, 1000);
	        }

	        let data = decode.write(buffer.slice(0, bytes));
	        if (!iter) {
	          stream.emit('data', data);
	        }

	        data = (buff + data).split(/\n+/);

	        const l = data.length - 1;
	        let i = 0;

	        for (; i < l; i++) {
	          // eslint-disable-next-line eqeqeq
	          if (options.start == null || row > options.start) {
	            if (!iter) {
	              stream.emit('line', data[i]);
	            } else {
	              iter(null, data[i]);
	            }
	          }
	          row++;
	        }

	        buff = data[l];
	        pos += bytes;
	        return read();
	      });
	    }());
	  });

	  if (!iter) {
	    return stream;
	  }

	  return stream.destroy;
	};
	return tailFile;
}

/* eslint-disable complexity,max-statements */

var file;
var hasRequiredFile;

function requireFile () {
	if (hasRequiredFile) return file;
	hasRequiredFile = 1;

	const fs = require$$0$8;
	const path = require$$1$3;
	const asyncSeries = requireSeries();
	const zlib = require$$0$1;
	const { MESSAGE } = requireTripleBeam();
	const { Stream, PassThrough } = requireReadable();
	const TransportStream = requireWinstonTransport();
	const debug = requireNode()('winston:file');
	const os = require$$0$6;
	const tailFile = requireTailFile();

	/**
	 * Transport for outputting to a local log file.
	 * @type {File}
	 * @extends {TransportStream}
	 */
	file = class File extends TransportStream {
	  /**
	   * Constructor function for the File transport object responsible for
	   * persisting log messages and metadata to one or more files.
	   * @param {Object} options - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    // Expose the name of this Transport on the prototype.
	    this.name = options.name || 'file';

	    // Helper function which throws an `Error` in the event that any of the
	    // rest of the arguments is present in `options`.
	    function throwIf(target, ...args) {
	      args.slice(1).forEach(name => {
	        if (options[name]) {
	          throw new Error(`Cannot set ${name} and ${target} together`);
	        }
	      });
	    }

	    // Setup the base stream that always gets piped to to handle buffering.
	    this._stream = new PassThrough();
	    this._stream.setMaxListeners(30);

	    // Bind this context for listener methods.
	    this._onError = this._onError.bind(this);

	    if (options.filename || options.dirname) {
	      throwIf('filename or dirname', 'stream');
	      this._basename = this.filename = options.filename
	        ? path.basename(options.filename)
	        : 'winston.log';

	      this.dirname = options.dirname || path.dirname(options.filename);
	      this.options = options.options || { flags: 'a' };
	    } else if (options.stream) {
	      // eslint-disable-next-line no-console
	      console.warn('options.stream will be removed in winston@4. Use winston.transports.Stream');
	      throwIf('stream', 'filename', 'maxsize');
	      this._dest = this._stream.pipe(this._setupStream(options.stream));
	      this.dirname = path.dirname(this._dest.path);
	      // We need to listen for drain events when write() returns false. This
	      // can make node mad at times.
	    } else {
	      throw new Error('Cannot log to file without filename or stream.');
	    }

	    this.maxsize = options.maxsize || null;
	    this.rotationFormat = options.rotationFormat || false;
	    this.zippedArchive = options.zippedArchive || false;
	    this.maxFiles = options.maxFiles || null;
	    this.eol = (typeof options.eol === 'string') ? options.eol : os.EOL;
	    this.tailable = options.tailable || false;
	    this.lazy = options.lazy || false;

	    // Internal state variables representing the number of files this instance
	    // has created and the current size (in bytes) of the current logfile.
	    this._size = 0;
	    this._pendingSize = 0;
	    this._created = 0;
	    this._drain = false;
	    this._opening = false;
	    this._ending = false;
	    this._fileExist = false;

	    if (this.dirname) this._createLogDirIfNotExist(this.dirname);
	    if (!this.lazy) this.open();
	  }

	  finishIfEnding() {
	    if (this._ending) {
	      if (this._opening) {
	        this.once('open', () => {
	          this._stream.once('finish', () => this.emit('finish'));
	          setImmediate(() => this._stream.end());
	        });
	      } else {
	        this._stream.once('finish', () => this.emit('finish'));
	        setImmediate(() => this._stream.end());
	      }
	    }
	  }

	  /**
	   * Core logging method exposed to Winston. Metadata is optional.
	   * @param {Object} info - TODO: add param description.
	   * @param {Function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback = () => { }) {
	    // Remark: (jcrugzz) What is necessary about this callback(null, true) now
	    // when thinking about 3.x? Should silent be handled in the base
	    // TransportStream _write method?
	    if (this.silent) {
	      callback();
	      return true;
	    }


	    // Output stream buffer is full and has asked us to wait for the drain event
	    if (this._drain) {
	      this._stream.once('drain', () => {
	        this._drain = false;
	        this.log(info, callback);
	      });
	      return;
	    }
	    if (this._rotate) {
	      this._stream.once('rotate', () => {
	        this._rotate = false;
	        this.log(info, callback);
	      });
	      return;
	    }
	    if (this.lazy) {
	      if (!this._fileExist) {
	        if (!this._opening) {
	          this.open();
	        }
	        this.once('open', () => {
	          this._fileExist = true;
	          this.log(info, callback);
	          return;
	        });
	        return;
	      }
	      if (this._needsNewFile(this._pendingSize)) {
	        this._dest.once('close', () => {
	          if (!this._opening) {
	            this.open();
	          }
	          this.once('open', () => {
	            this.log(info, callback);
	            return;
	          });
	          return;
	        });
	        return;
	      }
	    }

	    // Grab the raw string and append the expected EOL.
	    const output = `${info[MESSAGE]}${this.eol}`;
	    const bytes = Buffer.byteLength(output);

	    // After we have written to the PassThrough check to see if we need
	    // to rotate to the next file.
	    //
	    // Remark: This gets called too early and does not depict when data
	    // has been actually flushed to disk.
	    function logged() {
	      this._size += bytes;
	      this._pendingSize -= bytes;

	      debug('logged %s %s', this._size, output);
	      this.emit('logged', info);

	      // Do not attempt to rotate files while rotating
	      if (this._rotate) {
	        return;
	      }

	      // Do not attempt to rotate files while opening
	      if (this._opening) {
	        return;
	      }

	      // Check to see if we need to end the stream and create a new one.
	      if (!this._needsNewFile()) {
	        return;
	      }
	      if (this.lazy) {
	        this._endStream(() => {this.emit('fileclosed');});
	        return;
	      }

	      // End the current stream, ensure it flushes and create a new one.
	      // This could potentially be optimized to not run a stat call but its
	      // the safest way since we are supporting `maxFiles`.
	      this._rotate = true;
	      this._endStream(() => this._rotateFile());
	    }

	    // Keep track of the pending bytes being written while files are opening
	    // in order to properly rotate the PassThrough this._stream when the file
	    // eventually does open.
	    this._pendingSize += bytes;
	    if (this._opening
	      && !this.rotatedWhileOpening
	      && this._needsNewFile(this._size + this._pendingSize)) {
	      this.rotatedWhileOpening = true;
	    }

	    const written = this._stream.write(output, logged.bind(this));
	    if (!written) {
	      this._drain = true;
	      this._stream.once('drain', () => {
	        this._drain = false;
	        callback();
	      });
	    } else {
	      callback(); // eslint-disable-line callback-return
	    }

	    debug('written', written, this._drain);

	    this.finishIfEnding();

	    return written;
	  }

	  /**
	   * Query the transport. Options object is optional.
	   * @param {Object} options - Loggly-like query options for this instance.
	   * @param {function} callback - Continuation to respond to when complete.
	   * TODO: Refactor me.
	   */
	  query(options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    options = normalizeQuery(options);
	    const file = path.join(this.dirname, this.filename);
	    let buff = '';
	    let results = [];
	    let row = 0;

	    const stream = fs.createReadStream(file, {
	      encoding: 'utf8'
	    });

	    stream.on('error', err => {
	      if (stream.readable) {
	        stream.destroy();
	      }
	      if (!callback) {
	        return;
	      }

	      return err.code !== 'ENOENT' ? callback(err) : callback(null, results);
	    });

	    stream.on('data', data => {
	      data = (buff + data).split(/\n+/);
	      const l = data.length - 1;
	      let i = 0;

	      for (; i < l; i++) {
	        if (!options.start || row >= options.start) {
	          add(data[i]);
	        }
	        row++;
	      }

	      buff = data[l];
	    });

	    stream.on('close', () => {
	      if (buff) {
	        add(buff, true);
	      }
	      if (options.order === 'desc') {
	        results = results.reverse();
	      }

	      // eslint-disable-next-line callback-return
	      if (callback) callback(null, results);
	    });

	    function add(buff, attempt) {
	      try {
	        const log = JSON.parse(buff);
	        if (check(log)) {
	          push(log);
	        }
	      } catch (e) {
	        if (!attempt) {
	          stream.emit('error', e);
	        }
	      }
	    }

	    function push(log) {
	      if (
	        options.rows &&
	        results.length >= options.rows &&
	        options.order !== 'desc'
	      ) {
	        if (stream.readable) {
	          stream.destroy();
	        }
	        return;
	      }

	      if (options.fields) {
	        log = options.fields.reduce((obj, key) => {
	          obj[key] = log[key];
	          return obj;
	        }, {});
	      }

	      if (options.order === 'desc') {
	        if (results.length >= options.rows) {
	          results.shift();
	        }
	      }
	      results.push(log);
	    }

	    function check(log) {
	      if (!log) {
	        return;
	      }

	      if (typeof log !== 'object') {
	        return;
	      }

	      const time = new Date(log.timestamp);
	      if (
	        (options.from && time < options.from) ||
	        (options.until && time > options.until) ||
	        (options.level && options.level !== log.level)
	      ) {
	        return;
	      }

	      return true;
	    }

	    function normalizeQuery(options) {
	      options = options || {};

	      // limit
	      options.rows = options.rows || options.limit || 10;

	      // starting row offset
	      options.start = options.start || 0;

	      // now
	      options.until = options.until || new Date();
	      if (typeof options.until !== 'object') {
	        options.until = new Date(options.until);
	      }

	      // now - 24
	      options.from = options.from || (options.until - (24 * 60 * 60 * 1000));
	      if (typeof options.from !== 'object') {
	        options.from = new Date(options.from);
	      }

	      // 'asc' or 'desc'
	      options.order = options.order || 'desc';

	      return options;
	    }
	  }

	  /**
	   * Returns a log stream for this transport. Options object is optional.
	   * @param {Object} options - Stream options for this instance.
	   * @returns {Stream} - TODO: add return description.
	   * TODO: Refactor me.
	   */
	  stream(options = {}) {
	    const file = path.join(this.dirname, this.filename);
	    const stream = new Stream();
	    const tail = {
	      file,
	      start: options.start
	    };

	    stream.destroy = tailFile(tail, (err, line) => {
	      if (err) {
	        return stream.emit('error', err);
	      }

	      try {
	        stream.emit('data', line);
	        line = JSON.parse(line);
	        stream.emit('log', line);
	      } catch (e) {
	        stream.emit('error', e);
	      }
	    });

	    return stream;
	  }

	  /**
	   * Checks to see the filesize of.
	   * @returns {undefined}
	   */
	  open() {
	    // If we do not have a filename then we were passed a stream and
	    // don't need to keep track of size.
	    if (!this.filename) return;
	    if (this._opening) return;

	    this._opening = true;

	    // Stat the target file to get the size and create the stream.
	    this.stat((err, size) => {
	      if (err) {
	        return this.emit('error', err);
	      }
	      debug('stat done: %s { size: %s }', this.filename, size);
	      this._size = size;
	      this._dest = this._createStream(this._stream);
	      this._opening = false;
	      this.once('open', () => {
	        if (!this._stream.emit('rotate')) {
	          this._rotate = false;
	        }
	      });
	    });
	  }

	  /**
	   * Stat the file and assess information in order to create the proper stream.
	   * @param {function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  stat(callback) {
	    const target = this._getFile();
	    const fullpath = path.join(this.dirname, target);

	    fs.stat(fullpath, (err, stat) => {
	      if (err && err.code === 'ENOENT') {
	        debug('ENOENT ok', fullpath);
	        // Update internally tracked filename with the new target name.
	        this.filename = target;
	        return callback(null, 0);
	      }

	      if (err) {
	        debug(`err ${err.code} ${fullpath}`);
	        return callback(err);
	      }

	      if (!stat || this._needsNewFile(stat.size)) {
	        // If `stats.size` is greater than the `maxsize` for this
	        // instance then try again.
	        return this._incFile(() => this.stat(callback));
	      }

	      // Once we have figured out what the filename is, set it
	      // and return the size.
	      this.filename = target;
	      callback(null, stat.size);
	    });
	  }

	  /**
	   * Closes the stream associated with this instance.
	   * @param {function} cb - TODO: add param description.
	   * @returns {undefined}
	   */
	  close(cb) {
	    if (!this._stream) {
	      return;
	    }

	    this._stream.end(() => {
	      if (cb) {
	        cb(); // eslint-disable-line callback-return
	      }
	      this.emit('flush');
	      this.emit('closed');
	    });
	  }

	  /**
	   * TODO: add method description.
	   * @param {number} size - TODO: add param description.
	   * @returns {undefined}
	   */
	  _needsNewFile(size) {
	    size = size || this._size;
	    return this.maxsize && size >= this.maxsize;
	  }

	  /**
	   * TODO: add method description.
	   * @param {Error} err - TODO: add param description.
	   * @returns {undefined}
	   */
	  _onError(err) {
	    this.emit('error', err);
	  }

	  /**
	   * TODO: add method description.
	   * @param {Stream} stream - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  _setupStream(stream) {
	    stream.on('error', this._onError);

	    return stream;
	  }

	  /**
	   * TODO: add method description.
	   * @param {Stream} stream - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  _cleanupStream(stream) {
	    stream.removeListener('error', this._onError);
	    stream.destroy();
	    return stream;
	  }

	  /**
	   * TODO: add method description.
	   */
	  _rotateFile() {
	    this._incFile(() => this.open());
	  }

	  /**
	   * Unpipe from the stream that has been marked as full and end it so it
	   * flushes to disk.
	   *
	   * @param {function} callback - Callback for when the current file has closed.
	   * @private
	   */
	  _endStream(callback = () => { }) {
	    if (this._dest) {
	      this._stream.unpipe(this._dest);
	      this._dest.end(() => {
	        this._cleanupStream(this._dest);
	        callback();
	      });
	    } else {
	      callback(); // eslint-disable-line callback-return
	    }
	  }

	  /**
	   * Returns the WritableStream for the active file on this instance. If we
	   * should gzip the file then a zlib stream is returned.
	   *
	   * @param {ReadableStream} source –PassThrough to pipe to the file when open.
	   * @returns {WritableStream} Stream that writes to disk for the active file.
	   */
	  _createStream(source) {
	    const fullpath = path.join(this.dirname, this.filename);

	    debug('create stream start', fullpath, this.options);
	    const dest = fs.createWriteStream(fullpath, this.options)
	      // TODO: What should we do with errors here?
	      .on('error', err => debug(err))
	      .on('close', () => debug('close', dest.path, dest.bytesWritten))
	      .on('open', () => {
	        debug('file open ok', fullpath);
	        this.emit('open', fullpath);
	        source.pipe(dest);

	        // If rotation occured during the open operation then we immediately
	        // start writing to a new PassThrough, begin opening the next file
	        // and cleanup the previous source and dest once the source has drained.
	        if (this.rotatedWhileOpening) {
	          this._stream = new PassThrough();
	          this._stream.setMaxListeners(30);
	          this._rotateFile();
	          this.rotatedWhileOpening = false;
	          this._cleanupStream(dest);
	          source.end();
	        }
	      });

	    debug('create stream ok', fullpath);
	    return dest;
	  }

	  /**
	   * TODO: add method description.
	   * @param {function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  _incFile(callback) {
	    debug('_incFile', this.filename);
	    const ext = path.extname(this._basename);
	    const basename = path.basename(this._basename, ext);
	    const tasks = [];

	    if (this.zippedArchive) {
	      tasks.push(
	        function (cb) {
	          const num = this._created > 0 && !this.tailable ? this._created : '';
	          this._compressFile(
	            path.join(this.dirname, `${basename}${num}${ext}`),
	            path.join(this.dirname, `${basename}${num}${ext}.gz`),
	            cb
	          );
	        }.bind(this)
	      );
	    }

	    tasks.push(
	      function (cb) {
	        if (!this.tailable) {
	          this._created += 1;
	          this._checkMaxFilesIncrementing(ext, basename, cb);
	        } else {
	          this._checkMaxFilesTailable(ext, basename, cb);
	        }
	      }.bind(this)
	    );

	    asyncSeries(tasks, callback);
	  }

	  /**
	   * Gets the next filename to use for this instance in the case that log
	   * filesizes are being capped.
	   * @returns {string} - TODO: add return description.
	   * @private
	   */
	  _getFile() {
	    const ext = path.extname(this._basename);
	    const basename = path.basename(this._basename, ext);
	    const isRotation = this.rotationFormat
	      ? this.rotationFormat()
	      : this._created;

	    // Caveat emptor (indexzero): rotationFormat() was broken by design When
	    // combined with max files because the set of files to unlink is never
	    // stored.
	    return !this.tailable && this._created
	      ? `${basename}${isRotation}${ext}`
	      : `${basename}${ext}`;
	  }

	  /**
	   * Increment the number of files created or checked by this instance.
	   * @param {mixed} ext - TODO: add param description.
	   * @param {mixed} basename - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {undefined}
	   * @private
	   */
	  _checkMaxFilesIncrementing(ext, basename, callback) {
	    // Check for maxFiles option and delete file.
	    if (!this.maxFiles || this._created < this.maxFiles) {
	      return setImmediate(callback);
	    }

	    const oldest = this._created - this.maxFiles;
	    const isOldest = oldest !== 0 ? oldest : '';
	    const isZipped = this.zippedArchive ? '.gz' : '';
	    const filePath = `${basename}${isOldest}${ext}${isZipped}`;
	    const target = path.join(this.dirname, filePath);

	    fs.unlink(target, callback);
	  }

	  /**
	   * Roll files forward based on integer, up to maxFiles. e.g. if base if
	   * file.log and it becomes oversized, roll to file1.log, and allow file.log
	   * to be re-used. If file is oversized again, roll file1.log to file2.log,
	   * roll file.log to file1.log, and so on.
	   * @param {mixed} ext - TODO: add param description.
	   * @param {mixed} basename - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {undefined}
	   * @private
	   */
	  _checkMaxFilesTailable(ext, basename, callback) {
	    const tasks = [];
	    if (!this.maxFiles) {
	      return;
	    }

	    // const isZipped = this.zippedArchive ? '.gz' : '';
	    const isZipped = this.zippedArchive ? '.gz' : '';
	    for (let x = this.maxFiles - 1; x > 1; x--) {
	      tasks.push(function (i, cb) {
	        let fileName = `${basename}${(i - 1)}${ext}${isZipped}`;
	        const tmppath = path.join(this.dirname, fileName);

	        fs.exists(tmppath, exists => {
	          if (!exists) {
	            return cb(null);
	          }

	          fileName = `${basename}${i}${ext}${isZipped}`;
	          fs.rename(tmppath, path.join(this.dirname, fileName), cb);
	        });
	      }.bind(this, x));
	    }

	    asyncSeries(tasks, () => {
	      fs.rename(
	        path.join(this.dirname, `${basename}${ext}${isZipped}`),
	        path.join(this.dirname, `${basename}1${ext}${isZipped}`),
	        callback
	      );
	    });
	  }

	  /**
	   * Compresses src to dest with gzip and unlinks src
	   * @param {string} src - path to source file.
	   * @param {string} dest - path to zipped destination file.
	   * @param {Function} callback - callback called after file has been compressed.
	   * @returns {undefined}
	   * @private
	   */
	  _compressFile(src, dest, callback) {
	    fs.access(src, fs.F_OK, (err) => {
	      if (err) {
	        return callback();
	      }
	      var gzip = zlib.createGzip();
	      var inp = fs.createReadStream(src);
	      var out = fs.createWriteStream(dest);
	      out.on('finish', () => {
	        fs.unlink(src, callback);
	      });
	      inp.pipe(gzip).pipe(out);
	    });
	  }

	  _createLogDirIfNotExist(dirPath) {
	    /* eslint-disable no-sync */
	    if (!fs.existsSync(dirPath)) {
	      fs.mkdirSync(dirPath, { recursive: true });
	    }
	    /* eslint-enable no-sync */
	  }
	};
	return file;
}

/**
 * http.js: Transport for outputting to a json-rpcserver.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var http_1;
var hasRequiredHttp;

function requireHttp () {
	if (hasRequiredHttp) return http_1;
	hasRequiredHttp = 1;

	const http = require$$2$1;
	const https = require$$1;
	const { Stream } = requireReadable();
	const TransportStream = requireWinstonTransport();
	const { configure } = requireSafeStableStringify();

	/**
	 * Transport for outputting to a json-rpc server.
	 * @type {Stream}
	 * @extends {TransportStream}
	 */
	http_1 = class Http extends TransportStream {
	  /**
	   * Constructor function for the Http transport object responsible for
	   * persisting log messages and metadata to a terminal or TTY.
	   * @param {!Object} [options={}] - Options for this instance.
	   */
	  // eslint-disable-next-line max-statements
	  constructor(options = {}) {
	    super(options);

	    this.options = options;
	    this.name = options.name || 'http';
	    this.ssl = !!options.ssl;
	    this.host = options.host || 'localhost';
	    this.port = options.port;
	    this.auth = options.auth;
	    this.path = options.path || '';
	    this.maximumDepth = options.maximumDepth;
	    this.agent = options.agent;
	    this.headers = options.headers || {};
	    this.headers['content-type'] = 'application/json';
	    this.batch = options.batch || false;
	    this.batchInterval = options.batchInterval || 5000;
	    this.batchCount = options.batchCount || 10;
	    this.batchOptions = [];
	    this.batchTimeoutID = -1;
	    this.batchCallback = {};

	    if (!this.port) {
	      this.port = this.ssl ? 443 : 80;
	    }
	  }

	  /**
	   * Core logging method exposed to Winston.
	   * @param {Object} info - TODO: add param description.
	   * @param {function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback) {
	    this._request(info, null, null, (err, res) => {
	      if (res && res.statusCode !== 200) {
	        err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
	      }

	      if (err) {
	        this.emit('warn', err);
	      } else {
	        this.emit('logged', info);
	      }
	    });

	    // Remark: (jcrugzz) Fire and forget here so requests dont cause buffering
	    // and block more requests from happening?
	    if (callback) {
	      setImmediate(callback);
	    }
	  }

	  /**
	   * Query the transport. Options object is optional.
	   * @param {Object} options -  Loggly-like query options for this instance.
	   * @param {function} callback - Continuation to respond to when complete.
	   * @returns {undefined}
	   */
	  query(options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    options = {
	      method: 'query',
	      params: this.normalizeQuery(options)
	    };

	    const auth = options.params.auth || null;
	    delete options.params.auth;

	    const path = options.params.path || null;
	    delete options.params.path;

	    this._request(options, auth, path, (err, res, body) => {
	      if (res && res.statusCode !== 200) {
	        err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
	      }

	      if (err) {
	        return callback(err);
	      }

	      if (typeof body === 'string') {
	        try {
	          body = JSON.parse(body);
	        } catch (e) {
	          return callback(e);
	        }
	      }

	      callback(null, body);
	    });
	  }

	  /**
	   * Returns a log stream for this transport. Options object is optional.
	   * @param {Object} options - Stream options for this instance.
	   * @returns {Stream} - TODO: add return description
	   */
	  stream(options = {}) {
	    const stream = new Stream();
	    options = {
	      method: 'stream',
	      params: options
	    };

	    const path = options.params.path || null;
	    delete options.params.path;

	    const auth = options.params.auth || null;
	    delete options.params.auth;

	    let buff = '';
	    const req = this._request(options, auth, path);

	    stream.destroy = () => req.destroy();
	    req.on('data', data => {
	      data = (buff + data).split(/\n+/);
	      const l = data.length - 1;

	      let i = 0;
	      for (; i < l; i++) {
	        try {
	          stream.emit('log', JSON.parse(data[i]));
	        } catch (e) {
	          stream.emit('error', e);
	        }
	      }

	      buff = data[l];
	    });
	    req.on('error', err => stream.emit('error', err));

	    return stream;
	  }

	  /**
	   * Make a request to a winstond server or any http server which can
	   * handle json-rpc.
	   * @param {function} options - Options to sent the request.
	   * @param {Object?} auth - authentication options
	   * @param {string} path - request path
	   * @param {function} callback - Continuation to respond to when complete.
	   */
	  _request(options, auth, path, callback) {
	    options = options || {};

	    auth = auth || this.auth;
	    path = path || this.path || '';

	    if (this.batch) {
	      this._doBatch(options, callback, auth, path);
	    } else {
	      this._doRequest(options, callback, auth, path);
	    }
	  }

	  /**
	   * Send or memorize the options according to batch configuration
	   * @param {function} options - Options to sent the request.
	   * @param {function} callback - Continuation to respond to when complete.
	   * @param {Object?} auth - authentication options
	   * @param {string} path - request path
	   */
	  _doBatch(options, callback, auth, path) {
	    this.batchOptions.push(options);
	    if (this.batchOptions.length === 1) {
	      // First message stored, it's time to start the timeout!
	      const me = this;
	      this.batchCallback = callback;
	      this.batchTimeoutID = setTimeout(function () {
	        // timeout is reached, send all messages to endpoint
	        me.batchTimeoutID = -1;
	        me._doBatchRequest(me.batchCallback, auth, path);
	      }, this.batchInterval);
	    }
	    if (this.batchOptions.length === this.batchCount) {
	      // max batch count is reached, send all messages to endpoint
	      this._doBatchRequest(this.batchCallback, auth, path);
	    }
	  }

	  /**
	   * Initiate a request with the memorized batch options, stop the batch timeout
	   * @param {function} callback - Continuation to respond to when complete.
	   * @param {Object?} auth - authentication options
	   * @param {string} path - request path
	   */
	  _doBatchRequest(callback, auth, path) {
	    if (this.batchTimeoutID > 0) {
	      clearTimeout(this.batchTimeoutID);
	      this.batchTimeoutID = -1;
	    }
	    const batchOptionsCopy = this.batchOptions.slice();
	    this.batchOptions = [];
	    this._doRequest(batchOptionsCopy, callback, auth, path);
	  }

	  /**
	   * Make a request to a winstond server or any http server which can
	   * handle json-rpc.
	   * @param {function} options - Options to sent the request.
	   * @param {function} callback - Continuation to respond to when complete.
	   * @param {Object?} auth - authentication options
	   * @param {string} path - request path
	   */
	  _doRequest(options, callback, auth, path) {
	    // Prepare options for outgoing HTTP request
	    const headers = Object.assign({}, this.headers);
	    if (auth && auth.bearer) {
	      headers.Authorization = `Bearer ${auth.bearer}`;
	    }
	    const req = (this.ssl ? https : http).request({
	      ...this.options,
	      method: 'POST',
	      host: this.host,
	      port: this.port,
	      path: `/${path.replace(/^\//, '')}`,
	      headers: headers,
	      auth: (auth && auth.username && auth.password) ? (`${auth.username}:${auth.password}`) : '',
	      agent: this.agent
	    });

	    req.on('error', callback);
	    req.on('response', res => (
	      res.on('end', () => callback(null, res)).resume()
	    ));
	    const jsonStringify = configure({
	      ...(this.maximumDepth && { maximumDepth: this.maximumDepth })
	    });
	    req.end(Buffer.from(jsonStringify(options, this.options.replacer), 'utf8'));
	  }
	};
	return http_1;
}

var isStream_1;
var hasRequiredIsStream;

function requireIsStream () {
	if (hasRequiredIsStream) return isStream_1;
	hasRequiredIsStream = 1;

	const isStream = stream =>
		stream !== null &&
		typeof stream === 'object' &&
		typeof stream.pipe === 'function';

	isStream.writable = stream =>
		isStream(stream) &&
		stream.writable !== false &&
		typeof stream._write === 'function' &&
		typeof stream._writableState === 'object';

	isStream.readable = stream =>
		isStream(stream) &&
		stream.readable !== false &&
		typeof stream._read === 'function' &&
		typeof stream._readableState === 'object';

	isStream.duplex = stream =>
		isStream.writable(stream) &&
		isStream.readable(stream);

	isStream.transform = stream =>
		isStream.duplex(stream) &&
		typeof stream._transform === 'function';

	isStream_1 = isStream;
	return isStream_1;
}

/**
 * stream.js: Transport for outputting to any arbitrary stream.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var stream;
var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream;
	hasRequiredStream = 1;

	const isStream = requireIsStream();
	const { MESSAGE } = requireTripleBeam();
	const os = require$$0$6;
	const TransportStream = requireWinstonTransport();

	/**
	 * Transport for outputting to any arbitrary stream.
	 * @type {Stream}
	 * @extends {TransportStream}
	 */
	stream = class Stream extends TransportStream {
	  /**
	   * Constructor function for the Console transport object responsible for
	   * persisting log messages and metadata to a terminal or TTY.
	   * @param {!Object} [options={}] - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    if (!options.stream || !isStream(options.stream)) {
	      throw new Error('options.stream is required.');
	    }

	    // We need to listen for drain events when write() returns false. This can
	    // make node mad at times.
	    this._stream = options.stream;
	    this._stream.setMaxListeners(Infinity);
	    this.isObjectMode = options.stream._writableState.objectMode;
	    this.eol = (typeof options.eol === 'string') ? options.eol : os.EOL;
	  }

	  /**
	   * Core logging method exposed to Winston.
	   * @param {Object} info - TODO: add param description.
	   * @param {Function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback) {
	    setImmediate(() => this.emit('logged', info));
	    if (this.isObjectMode) {
	      this._stream.write(info);
	      if (callback) {
	        callback(); // eslint-disable-line callback-return
	      }
	      return;
	    }

	    this._stream.write(`${info[MESSAGE]}${this.eol}`);
	    if (callback) {
	      callback(); // eslint-disable-line callback-return
	    }
	    return;
	  }
	};
	return stream;
}

/**
 * transports.js: Set of all transports Winston knows about.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredTransports;

function requireTransports () {
	if (hasRequiredTransports) return transports;
	hasRequiredTransports = 1;
	(function (exports) {

		/**
		 * TODO: add property description.
		 * @type {Console}
		 */
		Object.defineProperty(exports, 'Console', {
		  configurable: true,
		  enumerable: true,
		  get() {
		    return requireConsole$1();
		  }
		});

		/**
		 * TODO: add property description.
		 * @type {File}
		 */
		Object.defineProperty(exports, 'File', {
		  configurable: true,
		  enumerable: true,
		  get() {
		    return requireFile();
		  }
		});

		/**
		 * TODO: add property description.
		 * @type {Http}
		 */
		Object.defineProperty(exports, 'Http', {
		  configurable: true,
		  enumerable: true,
		  get() {
		    return requireHttp();
		  }
		});

		/**
		 * TODO: add property description.
		 * @type {Stream}
		 */
		Object.defineProperty(exports, 'Stream', {
		  configurable: true,
		  enumerable: true,
		  get() {
		    return requireStream();
		  }
		}); 
	} (transports));
	return transports;
}

var config = {};

/**
 * index.js: Default settings for all levels that winston knows about.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredConfig;

function requireConfig () {
	if (hasRequiredConfig) return config;
	hasRequiredConfig = 1;

	const logform = requireLogform();
	const { configs } = requireTripleBeam();

	/**
	 * Export config set for the CLI.
	 * @type {Object}
	 */
	config.cli = logform.levels(configs.cli);

	/**
	 * Export config set for npm.
	 * @type {Object}
	 */
	config.npm = logform.levels(configs.npm);

	/**
	 * Export config set for the syslog.
	 * @type {Object}
	 */
	config.syslog = logform.levels(configs.syslog);

	/**
	 * Hoist addColors from logform where it was refactored into in winston@3.
	 * @type {Object}
	 */
	config.addColors = logform.levels;
	return config;
}

var forEach = {exports: {}};

var eachOf = {exports: {}};

var hasRequiredEachOf;

function requireEachOf () {
	if (hasRequiredEachOf) return eachOf.exports;
	hasRequiredEachOf = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		var _isArrayLike = requireIsArrayLike();

		var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

		var _breakLoop = requireBreakLoop();

		var _breakLoop2 = _interopRequireDefault(_breakLoop);

		var _eachOfLimit = requireEachOfLimit();

		var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);

		var _once = requireOnce();

		var _once2 = _interopRequireDefault(_once);

		var _onlyOnce = requireOnlyOnce();

		var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

		var _wrapAsync = requireWrapAsync();

		var _wrapAsync2 = _interopRequireDefault(_wrapAsync);

		var _awaitify = requireAwaitify();

		var _awaitify2 = _interopRequireDefault(_awaitify);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		// eachOf implementation optimized for array-likes
		function eachOfArrayLike(coll, iteratee, callback) {
		    callback = (0, _once2.default)(callback);
		    var index = 0,
		        completed = 0,
		        { length } = coll,
		        canceled = false;
		    if (length === 0) {
		        callback(null);
		    }

		    function iteratorCallback(err, value) {
		        if (err === false) {
		            canceled = true;
		        }
		        if (canceled === true) return;
		        if (err) {
		            callback(err);
		        } else if (++completed === length || value === _breakLoop2.default) {
		            callback(null);
		        }
		    }

		    for (; index < length; index++) {
		        iteratee(coll[index], index, (0, _onlyOnce2.default)(iteratorCallback));
		    }
		}

		// a generic version of eachOf which can handle array, object, and iterator cases.
		function eachOfGeneric(coll, iteratee, callback) {
		    return (0, _eachOfLimit2.default)(coll, Infinity, iteratee, callback);
		}

		/**
		 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
		 * to the iteratee.
		 *
		 * @name eachOf
		 * @static
		 * @memberOf module:Collections
		 * @method
		 * @alias forEachOf
		 * @category Collection
		 * @see [async.each]{@link module:Collections.each}
		 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
		 * @param {AsyncFunction} iteratee - A function to apply to each
		 * item in `coll`.
		 * The `key` is the item's key, or index in the case of an array.
		 * Invoked with (item, key, callback).
		 * @param {Function} [callback] - A callback which is called when all
		 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
		 * @returns {Promise} a promise, if a callback is omitted
		 * @example
		 *
		 * // dev.json is a file containing a valid json object config for dev environment
		 * // dev.json is a file containing a valid json object config for test environment
		 * // prod.json is a file containing a valid json object config for prod environment
		 * // invalid.json is a file with a malformed json object
		 *
		 * let configs = {}; //global variable
		 * let validConfigFileMap = {dev: 'dev.json', test: 'test.json', prod: 'prod.json'};
		 * let invalidConfigFileMap = {dev: 'dev.json', test: 'test.json', invalid: 'invalid.json'};
		 *
		 * // asynchronous function that reads a json file and parses the contents as json object
		 * function parseFile(file, key, callback) {
		 *     fs.readFile(file, "utf8", function(err, data) {
		 *         if (err) return calback(err);
		 *         try {
		 *             configs[key] = JSON.parse(data);
		 *         } catch (e) {
		 *             return callback(e);
		 *         }
		 *         callback();
		 *     });
		 * }
		 *
		 * // Using callbacks
		 * async.forEachOf(validConfigFileMap, parseFile, function (err) {
		 *     if (err) {
		 *         console.error(err);
		 *     } else {
		 *         console.log(configs);
		 *         // configs is now a map of JSON data, e.g.
		 *         // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
		 *     }
		 * });
		 *
		 * //Error handing
		 * async.forEachOf(invalidConfigFileMap, parseFile, function (err) {
		 *     if (err) {
		 *         console.error(err);
		 *         // JSON parse error exception
		 *     } else {
		 *         console.log(configs);
		 *     }
		 * });
		 *
		 * // Using Promises
		 * async.forEachOf(validConfigFileMap, parseFile)
		 * .then( () => {
		 *     console.log(configs);
		 *     // configs is now a map of JSON data, e.g.
		 *     // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
		 * }).catch( err => {
		 *     console.error(err);
		 * });
		 *
		 * //Error handing
		 * async.forEachOf(invalidConfigFileMap, parseFile)
		 * .then( () => {
		 *     console.log(configs);
		 * }).catch( err => {
		 *     console.error(err);
		 *     // JSON parse error exception
		 * });
		 *
		 * // Using async/await
		 * async () => {
		 *     try {
		 *         let result = await async.forEachOf(validConfigFileMap, parseFile);
		 *         console.log(configs);
		 *         // configs is now a map of JSON data, e.g.
		 *         // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
		 *     }
		 *     catch (err) {
		 *         console.log(err);
		 *     }
		 * }
		 *
		 * //Error handing
		 * async () => {
		 *     try {
		 *         let result = await async.forEachOf(invalidConfigFileMap, parseFile);
		 *         console.log(configs);
		 *     }
		 *     catch (err) {
		 *         console.log(err);
		 *         // JSON parse error exception
		 *     }
		 * }
		 *
		 */
		function eachOf(coll, iteratee, callback) {
		    var eachOfImplementation = (0, _isArrayLike2.default)(coll) ? eachOfArrayLike : eachOfGeneric;
		    return eachOfImplementation(coll, (0, _wrapAsync2.default)(iteratee), callback);
		}

		exports.default = (0, _awaitify2.default)(eachOf, 3);
		module.exports = exports.default; 
	} (eachOf, eachOf.exports));
	return eachOf.exports;
}

var withoutIndex = {exports: {}};

var hasRequiredWithoutIndex;

function requireWithoutIndex () {
	if (hasRequiredWithoutIndex) return withoutIndex.exports;
	hasRequiredWithoutIndex = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		exports.default = _withoutIndex;
		function _withoutIndex(iteratee) {
		    return (value, index, callback) => iteratee(value, callback);
		}
		module.exports = exports.default; 
	} (withoutIndex, withoutIndex.exports));
	return withoutIndex.exports;
}

var hasRequiredForEach;

function requireForEach () {
	if (hasRequiredForEach) return forEach.exports;
	hasRequiredForEach = 1;
	(function (module, exports) {

		Object.defineProperty(exports, "__esModule", {
		    value: true
		});

		var _eachOf = requireEachOf();

		var _eachOf2 = _interopRequireDefault(_eachOf);

		var _withoutIndex = requireWithoutIndex();

		var _withoutIndex2 = _interopRequireDefault(_withoutIndex);

		var _wrapAsync = requireWrapAsync();

		var _wrapAsync2 = _interopRequireDefault(_wrapAsync);

		var _awaitify = requireAwaitify();

		var _awaitify2 = _interopRequireDefault(_awaitify);

		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

		/**
		 * Applies the function `iteratee` to each item in `coll`, in parallel.
		 * The `iteratee` is called with an item from the list, and a callback for when
		 * it has finished. If the `iteratee` passes an error to its `callback`, the
		 * main `callback` (for the `each` function) is immediately called with the
		 * error.
		 *
		 * Note, that since this function applies `iteratee` to each item in parallel,
		 * there is no guarantee that the iteratee functions will complete in order.
		 *
		 * @name each
		 * @static
		 * @memberOf module:Collections
		 * @method
		 * @alias forEach
		 * @category Collection
		 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
		 * @param {AsyncFunction} iteratee - An async function to apply to
		 * each item in `coll`. Invoked with (item, callback).
		 * The array index is not passed to the iteratee.
		 * If you need the index, use `eachOf`.
		 * @param {Function} [callback] - A callback which is called when all
		 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
		 * @returns {Promise} a promise, if a callback is omitted
		 * @example
		 *
		 * // dir1 is a directory that contains file1.txt, file2.txt
		 * // dir2 is a directory that contains file3.txt, file4.txt
		 * // dir3 is a directory that contains file5.txt
		 * // dir4 does not exist
		 *
		 * const fileList = [ 'dir1/file2.txt', 'dir2/file3.txt', 'dir/file5.txt'];
		 * const withMissingFileList = ['dir1/file1.txt', 'dir4/file2.txt'];
		 *
		 * // asynchronous function that deletes a file
		 * const deleteFile = function(file, callback) {
		 *     fs.unlink(file, callback);
		 * };
		 *
		 * // Using callbacks
		 * async.each(fileList, deleteFile, function(err) {
		 *     if( err ) {
		 *         console.log(err);
		 *     } else {
		 *         console.log('All files have been deleted successfully');
		 *     }
		 * });
		 *
		 * // Error Handling
		 * async.each(withMissingFileList, deleteFile, function(err){
		 *     console.log(err);
		 *     // [ Error: ENOENT: no such file or directory ]
		 *     // since dir4/file2.txt does not exist
		 *     // dir1/file1.txt could have been deleted
		 * });
		 *
		 * // Using Promises
		 * async.each(fileList, deleteFile)
		 * .then( () => {
		 *     console.log('All files have been deleted successfully');
		 * }).catch( err => {
		 *     console.log(err);
		 * });
		 *
		 * // Error Handling
		 * async.each(fileList, deleteFile)
		 * .then( () => {
		 *     console.log('All files have been deleted successfully');
		 * }).catch( err => {
		 *     console.log(err);
		 *     // [ Error: ENOENT: no such file or directory ]
		 *     // since dir4/file2.txt does not exist
		 *     // dir1/file1.txt could have been deleted
		 * });
		 *
		 * // Using async/await
		 * async () => {
		 *     try {
		 *         await async.each(files, deleteFile);
		 *     }
		 *     catch (err) {
		 *         console.log(err);
		 *     }
		 * }
		 *
		 * // Error Handling
		 * async () => {
		 *     try {
		 *         await async.each(withMissingFileList, deleteFile);
		 *     }
		 *     catch (err) {
		 *         console.log(err);
		 *         // [ Error: ENOENT: no such file or directory ]
		 *         // since dir4/file2.txt does not exist
		 *         // dir1/file1.txt could have been deleted
		 *     }
		 * }
		 *
		 */
		function eachLimit(coll, iteratee, callback) {
		    return (0, _eachOf2.default)(coll, (0, _withoutIndex2.default)((0, _wrapAsync2.default)(iteratee)), callback);
		}

		exports.default = (0, _awaitify2.default)(eachLimit, 3);
		module.exports = exports.default; 
	} (forEach, forEach.exports));
	return forEach.exports;
}

var fn_name;
var hasRequiredFn_name;

function requireFn_name () {
	if (hasRequiredFn_name) return fn_name;
	hasRequiredFn_name = 1;

	var toString = Object.prototype.toString;

	/**
	 * Extract names from functions.
	 *
	 * @param {Function} fn The function who's name we need to extract.
	 * @returns {String} The name of the function.
	 * @public
	 */
	fn_name = function name(fn) {
	  if ('string' === typeof fn.displayName && fn.constructor.name) {
	    return fn.displayName;
	  } else if ('string' === typeof fn.name && fn.name) {
	    return fn.name;
	  }

	  //
	  // Check to see if the constructor has a name.
	  //
	  if (
	       'object' === typeof fn
	    && fn.constructor
	    && 'string' === typeof fn.constructor.name
	  ) return fn.constructor.name;

	  //
	  // toString the given function and attempt to parse it out of it, or determine
	  // the class.
	  //
	  var named = fn.toString()
	    , type = toString.call(fn).slice(8, -1);

	  if ('Function' === type) {
	    named = named.substring(named.indexOf('(') + 1, named.indexOf(')'));
	  } else {
	    named = type;
	  }

	  return named || 'anonymous';
	};
	return fn_name;
}

var oneTime;
var hasRequiredOneTime;

function requireOneTime () {
	if (hasRequiredOneTime) return oneTime;
	hasRequiredOneTime = 1;

	var name = requireFn_name();

	/**
	 * Wrap callbacks to prevent double execution.
	 *
	 * @param {Function} fn Function that should only be called once.
	 * @returns {Function} A wrapped callback which prevents multiple executions.
	 * @public
	 */
	oneTime = function one(fn) {
	  var called = 0
	    , value;

	  /**
	   * The function that prevents double execution.
	   *
	   * @private
	   */
	  function onetime() {
	    if (called) return value;

	    called = 1;
	    value = fn.apply(this, arguments);
	    fn = null;

	    return value;
	  }

	  //
	  // To make debugging more easy we want to use the name of the supplied
	  // function. So when you look at the functions that are assigned to event
	  // listeners you don't see a load of `onetime` functions but actually the
	  // names of the functions that this module will call.
	  //
	  // NOTE: We cannot override the `name` property, as that is `readOnly`
	  // property, so displayName will have to do.
	  //
	  onetime.displayName = name(fn);
	  return onetime;
	};
	return oneTime;
}

var stackTrace = {};

var hasRequiredStackTrace;

function requireStackTrace () {
	if (hasRequiredStackTrace) return stackTrace;
	hasRequiredStackTrace = 1;
	(function (exports) {
		exports.get = function(belowFn) {
		  var oldLimit = Error.stackTraceLimit;
		  Error.stackTraceLimit = Infinity;

		  var dummyObject = {};

		  var v8Handler = Error.prepareStackTrace;
		  Error.prepareStackTrace = function(dummyObject, v8StackTrace) {
		    return v8StackTrace;
		  };
		  Error.captureStackTrace(dummyObject, belowFn || exports.get);

		  var v8StackTrace = dummyObject.stack;
		  Error.prepareStackTrace = v8Handler;
		  Error.stackTraceLimit = oldLimit;

		  return v8StackTrace;
		};

		exports.parse = function(err) {
		  if (!err.stack) {
		    return [];
		  }

		  var self = this;
		  var lines = err.stack.split('\n').slice(1);

		  return lines
		    .map(function(line) {
		      if (line.match(/^\s*[-]{4,}$/)) {
		        return self._createParsedCallSite({
		          fileName: line,
		          lineNumber: null,
		          functionName: null,
		          typeName: null,
		          methodName: null,
		          columnNumber: null,
		          'native': null,
		        });
		      }

		      var lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);
		      if (!lineMatch) {
		        return;
		      }

		      var object = null;
		      var method = null;
		      var functionName = null;
		      var typeName = null;
		      var methodName = null;
		      var isNative = (lineMatch[5] === 'native');

		      if (lineMatch[1]) {
		        functionName = lineMatch[1];
		        var methodStart = functionName.lastIndexOf('.');
		        if (functionName[methodStart-1] == '.')
		          methodStart--;
		        if (methodStart > 0) {
		          object = functionName.substr(0, methodStart);
		          method = functionName.substr(methodStart + 1);
		          var objectEnd = object.indexOf('.Module');
		          if (objectEnd > 0) {
		            functionName = functionName.substr(objectEnd + 1);
		            object = object.substr(0, objectEnd);
		          }
		        }
		        typeName = null;
		      }

		      if (method) {
		        typeName = object;
		        methodName = method;
		      }

		      if (method === '<anonymous>') {
		        methodName = null;
		        functionName = null;
		      }

		      var properties = {
		        fileName: lineMatch[2] || null,
		        lineNumber: parseInt(lineMatch[3], 10) || null,
		        functionName: functionName,
		        typeName: typeName,
		        methodName: methodName,
		        columnNumber: parseInt(lineMatch[4], 10) || null,
		        'native': isNative,
		      };

		      return self._createParsedCallSite(properties);
		    })
		    .filter(function(callSite) {
		      return !!callSite;
		    });
		};

		function CallSite(properties) {
		  for (var property in properties) {
		    this[property] = properties[property];
		  }
		}

		var strProperties = [
		  'this',
		  'typeName',
		  'functionName',
		  'methodName',
		  'fileName',
		  'lineNumber',
		  'columnNumber',
		  'function',
		  'evalOrigin'
		];
		var boolProperties = [
		  'topLevel',
		  'eval',
		  'native',
		  'constructor'
		];
		strProperties.forEach(function (property) {
		  CallSite.prototype[property] = null;
		  CallSite.prototype['get' + property[0].toUpperCase() + property.substr(1)] = function () {
		    return this[property];
		  };
		});
		boolProperties.forEach(function (property) {
		  CallSite.prototype[property] = false;
		  CallSite.prototype['is' + property[0].toUpperCase() + property.substr(1)] = function () {
		    return this[property];
		  };
		});

		exports._createParsedCallSite = function(properties) {
		  return new CallSite(properties);
		}; 
	} (stackTrace));
	return stackTrace;
}

/**
 * exception-stream.js: TODO: add file header handler.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var exceptionStream;
var hasRequiredExceptionStream;

function requireExceptionStream () {
	if (hasRequiredExceptionStream) return exceptionStream;
	hasRequiredExceptionStream = 1;

	const { Writable } = requireReadable();

	/**
	 * TODO: add class description.
	 * @type {ExceptionStream}
	 * @extends {Writable}
	 */
	exceptionStream = class ExceptionStream extends Writable {
	  /**
	   * Constructor function for the ExceptionStream responsible for wrapping a
	   * TransportStream; only allowing writes of `info` objects with
	   * `info.exception` set to true.
	   * @param {!TransportStream} transport - Stream to filter to exceptions
	   */
	  constructor(transport) {
	    super({ objectMode: true });

	    if (!transport) {
	      throw new Error('ExceptionStream requires a TransportStream instance.');
	    }

	    // Remark (indexzero): we set `handleExceptions` here because it's the
	    // predicate checked in ExceptionHandler.prototype.__getExceptionHandlers
	    this.handleExceptions = true;
	    this.transport = transport;
	  }

	  /**
	   * Writes the info object to our transport instance if (and only if) the
	   * `exception` property is set on the info.
	   * @param {mixed} info - TODO: add param description.
	   * @param {mixed} enc - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _write(info, enc, callback) {
	    if (info.exception) {
	      return this.transport.log(info, callback);
	    }

	    callback();
	    return true;
	  }
	};
	return exceptionStream;
}

/**
 * exception-handler.js: Object for handling uncaughtException events.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var exceptionHandler;
var hasRequiredExceptionHandler;

function requireExceptionHandler () {
	if (hasRequiredExceptionHandler) return exceptionHandler;
	hasRequiredExceptionHandler = 1;

	const os = require$$0$6;
	const asyncForEach = requireForEach();
	const debug = requireNode()('winston:exception');
	const once = requireOneTime();
	const stackTrace = requireStackTrace();
	const ExceptionStream = requireExceptionStream();

	/**
	 * Object for handling uncaughtException events.
	 * @type {ExceptionHandler}
	 */
	exceptionHandler = class ExceptionHandler {
	  /**
	   * TODO: add contructor description
	   * @param {!Logger} logger - TODO: add param description
	   */
	  constructor(logger) {
	    if (!logger) {
	      throw new Error('Logger is required to handle exceptions');
	    }

	    this.logger = logger;
	    this.handlers = new Map();
	  }

	  /**
	   * Handles `uncaughtException` events for the current process by adding any
	   * handlers passed in.
	   * @returns {undefined}
	   */
	  handle(...args) {
	    args.forEach(arg => {
	      if (Array.isArray(arg)) {
	        return arg.forEach(handler => this._addHandler(handler));
	      }

	      this._addHandler(arg);
	    });

	    if (!this.catcher) {
	      this.catcher = this._uncaughtException.bind(this);
	      process.on('uncaughtException', this.catcher);
	    }
	  }

	  /**
	   * Removes any handlers to `uncaughtException` events for the current
	   * process. This does not modify the state of the `this.handlers` set.
	   * @returns {undefined}
	   */
	  unhandle() {
	    if (this.catcher) {
	      process.removeListener('uncaughtException', this.catcher);
	      this.catcher = false;

	      Array.from(this.handlers.values())
	        .forEach(wrapper => this.logger.unpipe(wrapper));
	    }
	  }

	  /**
	   * TODO: add method description
	   * @param {Error} err - Error to get information about.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getAllInfo(err) {
	    let message = null;
	    if (err) {
	      message = typeof err === 'string' ? err : err.message;
	    }

	    return {
	      error: err,
	      // TODO (indexzero): how do we configure this?
	      level: 'error',
	      message: [
	        `uncaughtException: ${(message || '(no error message)')}`,
	        err && err.stack || '  No stack trace'
	      ].join('\n'),
	      stack: err && err.stack,
	      exception: true,
	      date: new Date().toString(),
	      process: this.getProcessInfo(),
	      os: this.getOsInfo(),
	      trace: this.getTrace(err)
	    };
	  }

	  /**
	   * Gets all relevant process information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getProcessInfo() {
	    return {
	      pid: process.pid,
	      uid: process.getuid ? process.getuid() : null,
	      gid: process.getgid ? process.getgid() : null,
	      cwd: process.cwd(),
	      execPath: process.execPath,
	      version: process.version,
	      argv: process.argv,
	      memoryUsage: process.memoryUsage()
	    };
	  }

	  /**
	   * Gets all relevant OS information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getOsInfo() {
	    return {
	      loadavg: os.loadavg(),
	      uptime: os.uptime()
	    };
	  }

	  /**
	   * Gets a stack trace for the specified error.
	   * @param {mixed} err - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getTrace(err) {
	    const trace = err ? stackTrace.parse(err) : stackTrace.get();
	    return trace.map(site => {
	      return {
	        column: site.getColumnNumber(),
	        file: site.getFileName(),
	        function: site.getFunctionName(),
	        line: site.getLineNumber(),
	        method: site.getMethodName(),
	        native: site.isNative()
	      };
	    });
	  }

	  /**
	   * Helper method to add a transport as an exception handler.
	   * @param {Transport} handler - The transport to add as an exception handler.
	   * @returns {void}
	   */
	  _addHandler(handler) {
	    if (!this.handlers.has(handler)) {
	      handler.handleExceptions = true;
	      const wrapper = new ExceptionStream(handler);
	      this.handlers.set(handler, wrapper);
	      this.logger.pipe(wrapper);
	    }
	  }

	  /**
	   * Logs all relevant information around the `err` and exits the current
	   * process.
	   * @param {Error} err - Error to handle
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _uncaughtException(err) {
	    const info = this.getAllInfo(err);
	    const handlers = this._getExceptionHandlers();
	    // Calculate if we should exit on this error
	    let doExit = typeof this.logger.exitOnError === 'function'
	      ? this.logger.exitOnError(err)
	      : this.logger.exitOnError;
	    let timeout;

	    if (!handlers.length && doExit) {
	      // eslint-disable-next-line no-console
	      console.warn('winston: exitOnError cannot be true with no exception handlers.');
	      // eslint-disable-next-line no-console
	      console.warn('winston: not exiting process.');
	      doExit = false;
	    }

	    function gracefulExit() {
	      debug('doExit', doExit);
	      debug('process._exiting', process._exiting);

	      if (doExit && !process._exiting) {
	        // Remark: Currently ignoring any exceptions from transports when
	        // catching uncaught exceptions.
	        if (timeout) {
	          clearTimeout(timeout);
	        }
	        // eslint-disable-next-line no-process-exit
	        process.exit(1);
	      }
	    }

	    if (!handlers || handlers.length === 0) {
	      return process.nextTick(gracefulExit);
	    }

	    // Log to all transports attempting to listen for when they are completed.
	    asyncForEach(handlers, (handler, next) => {
	      const done = once(next);
	      const transport = handler.transport || handler;

	      // Debug wrapping so that we can inspect what's going on under the covers.
	      function onDone(event) {
	        return () => {
	          debug(event);
	          done();
	        };
	      }

	      transport._ending = true;
	      transport.once('finish', onDone('finished'));
	      transport.once('error', onDone('error'));
	    }, () => doExit && gracefulExit());

	    this.logger.log(info);

	    // If exitOnError is true, then only allow the logging of exceptions to
	    // take up to `3000ms`.
	    if (doExit) {
	      timeout = setTimeout(gracefulExit, 3000);
	    }
	  }

	  /**
	   * Returns the list of transports and exceptionHandlers for this instance.
	   * @returns {Array} - List of transports and exceptionHandlers for this
	   * instance.
	   * @private
	   */
	  _getExceptionHandlers() {
	    // Remark (indexzero): since `logger.transports` returns all of the pipes
	    // from the _readableState of the stream we actually get the join of the
	    // explicit handlers and the implicit transports with
	    // `handleExceptions: true`
	    return this.logger.transports.filter(wrap => {
	      const transport = wrap.transport || wrap;
	      return transport.handleExceptions;
	    });
	  }
	};
	return exceptionHandler;
}

/**
 * rejection-stream.js: TODO: add file header handler.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var rejectionStream;
var hasRequiredRejectionStream;

function requireRejectionStream () {
	if (hasRequiredRejectionStream) return rejectionStream;
	hasRequiredRejectionStream = 1;

	const { Writable } = requireReadable();

	/**
	 * TODO: add class description.
	 * @type {RejectionStream}
	 * @extends {Writable}
	 */
	rejectionStream = class RejectionStream extends Writable {
	  /**
	   * Constructor function for the RejectionStream responsible for wrapping a
	   * TransportStream; only allowing writes of `info` objects with
	   * `info.rejection` set to true.
	   * @param {!TransportStream} transport - Stream to filter to rejections
	   */
	  constructor(transport) {
	    super({ objectMode: true });

	    if (!transport) {
	      throw new Error('RejectionStream requires a TransportStream instance.');
	    }

	    this.handleRejections = true;
	    this.transport = transport;
	  }

	  /**
	   * Writes the info object to our transport instance if (and only if) the
	   * `rejection` property is set on the info.
	   * @param {mixed} info - TODO: add param description.
	   * @param {mixed} enc - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _write(info, enc, callback) {
	    if (info.rejection) {
	      return this.transport.log(info, callback);
	    }

	    callback();
	    return true;
	  }
	};
	return rejectionStream;
}

/**
 * exception-handler.js: Object for handling uncaughtException events.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var rejectionHandler;
var hasRequiredRejectionHandler;

function requireRejectionHandler () {
	if (hasRequiredRejectionHandler) return rejectionHandler;
	hasRequiredRejectionHandler = 1;

	const os = require$$0$6;
	const asyncForEach = requireForEach();
	const debug = requireNode()('winston:rejection');
	const once = requireOneTime();
	const stackTrace = requireStackTrace();
	const RejectionStream = requireRejectionStream();

	/**
	 * Object for handling unhandledRejection events.
	 * @type {RejectionHandler}
	 */
	rejectionHandler = class RejectionHandler {
	  /**
	   * TODO: add contructor description
	   * @param {!Logger} logger - TODO: add param description
	   */
	  constructor(logger) {
	    if (!logger) {
	      throw new Error('Logger is required to handle rejections');
	    }

	    this.logger = logger;
	    this.handlers = new Map();
	  }

	  /**
	   * Handles `unhandledRejection` events for the current process by adding any
	   * handlers passed in.
	   * @returns {undefined}
	   */
	  handle(...args) {
	    args.forEach(arg => {
	      if (Array.isArray(arg)) {
	        return arg.forEach(handler => this._addHandler(handler));
	      }

	      this._addHandler(arg);
	    });

	    if (!this.catcher) {
	      this.catcher = this._unhandledRejection.bind(this);
	      process.on('unhandledRejection', this.catcher);
	    }
	  }

	  /**
	   * Removes any handlers to `unhandledRejection` events for the current
	   * process. This does not modify the state of the `this.handlers` set.
	   * @returns {undefined}
	   */
	  unhandle() {
	    if (this.catcher) {
	      process.removeListener('unhandledRejection', this.catcher);
	      this.catcher = false;

	      Array.from(this.handlers.values()).forEach(wrapper =>
	        this.logger.unpipe(wrapper)
	      );
	    }
	  }

	  /**
	   * TODO: add method description
	   * @param {Error} err - Error to get information about.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getAllInfo(err) {
	    let message = null;
	    if (err) {
	      message = typeof err === 'string' ? err : err.message;
	    }

	    return {
	      error: err,
	      // TODO (indexzero): how do we configure this?
	      level: 'error',
	      message: [
	        `unhandledRejection: ${message || '(no error message)'}`,
	        err && err.stack || '  No stack trace'
	      ].join('\n'),
	      stack: err && err.stack,
	      rejection: true,
	      date: new Date().toString(),
	      process: this.getProcessInfo(),
	      os: this.getOsInfo(),
	      trace: this.getTrace(err)
	    };
	  }

	  /**
	   * Gets all relevant process information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getProcessInfo() {
	    return {
	      pid: process.pid,
	      uid: process.getuid ? process.getuid() : null,
	      gid: process.getgid ? process.getgid() : null,
	      cwd: process.cwd(),
	      execPath: process.execPath,
	      version: process.version,
	      argv: process.argv,
	      memoryUsage: process.memoryUsage()
	    };
	  }

	  /**
	   * Gets all relevant OS information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getOsInfo() {
	    return {
	      loadavg: os.loadavg(),
	      uptime: os.uptime()
	    };
	  }

	  /**
	   * Gets a stack trace for the specified error.
	   * @param {mixed} err - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getTrace(err) {
	    const trace = err ? stackTrace.parse(err) : stackTrace.get();
	    return trace.map(site => {
	      return {
	        column: site.getColumnNumber(),
	        file: site.getFileName(),
	        function: site.getFunctionName(),
	        line: site.getLineNumber(),
	        method: site.getMethodName(),
	        native: site.isNative()
	      };
	    });
	  }

	  /**
	   * Helper method to add a transport as an exception handler.
	   * @param {Transport} handler - The transport to add as an exception handler.
	   * @returns {void}
	   */
	  _addHandler(handler) {
	    if (!this.handlers.has(handler)) {
	      handler.handleRejections = true;
	      const wrapper = new RejectionStream(handler);
	      this.handlers.set(handler, wrapper);
	      this.logger.pipe(wrapper);
	    }
	  }

	  /**
	   * Logs all relevant information around the `err` and exits the current
	   * process.
	   * @param {Error} err - Error to handle
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _unhandledRejection(err) {
	    const info = this.getAllInfo(err);
	    const handlers = this._getRejectionHandlers();
	    // Calculate if we should exit on this error
	    let doExit =
	      typeof this.logger.exitOnError === 'function'
	        ? this.logger.exitOnError(err)
	        : this.logger.exitOnError;
	    let timeout;

	    if (!handlers.length && doExit) {
	      // eslint-disable-next-line no-console
	      console.warn('winston: exitOnError cannot be true with no rejection handlers.');
	      // eslint-disable-next-line no-console
	      console.warn('winston: not exiting process.');
	      doExit = false;
	    }

	    function gracefulExit() {
	      debug('doExit', doExit);
	      debug('process._exiting', process._exiting);

	      if (doExit && !process._exiting) {
	        // Remark: Currently ignoring any rejections from transports when
	        // catching unhandled rejections.
	        if (timeout) {
	          clearTimeout(timeout);
	        }
	        // eslint-disable-next-line no-process-exit
	        process.exit(1);
	      }
	    }

	    if (!handlers || handlers.length === 0) {
	      return process.nextTick(gracefulExit);
	    }

	    // Log to all transports attempting to listen for when they are completed.
	    asyncForEach(
	      handlers,
	      (handler, next) => {
	        const done = once(next);
	        const transport = handler.transport || handler;

	        // Debug wrapping so that we can inspect what's going on under the covers.
	        function onDone(event) {
	          return () => {
	            debug(event);
	            done();
	          };
	        }

	        transport._ending = true;
	        transport.once('finish', onDone('finished'));
	        transport.once('error', onDone('error'));
	      },
	      () => doExit && gracefulExit()
	    );

	    this.logger.log(info);

	    // If exitOnError is true, then only allow the logging of exceptions to
	    // take up to `3000ms`.
	    if (doExit) {
	      timeout = setTimeout(gracefulExit, 3000);
	    }
	  }

	  /**
	   * Returns the list of transports and exceptionHandlers for this instance.
	   * @returns {Array} - List of transports and exceptionHandlers for this
	   * instance.
	   * @private
	   */
	  _getRejectionHandlers() {
	    // Remark (indexzero): since `logger.transports` returns all of the pipes
	    // from the _readableState of the stream we actually get the join of the
	    // explicit handlers and the implicit transports with
	    // `handleRejections: true`
	    return this.logger.transports.filter(wrap => {
	      const transport = wrap.transport || wrap;
	      return transport.handleRejections;
	    });
	  }
	};
	return rejectionHandler;
}

/**
 * profiler.js: TODO: add file header description.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var profiler;
var hasRequiredProfiler;

function requireProfiler () {
	if (hasRequiredProfiler) return profiler;
	hasRequiredProfiler = 1;
	/**
	 * TODO: add class description.
	 * @type {Profiler}
	 * @private
	 */
	class Profiler {
	  /**
	   * Constructor function for the Profiler instance used by
	   * `Logger.prototype.startTimer`. When done is called the timer will finish
	   * and log the duration.
	   * @param {!Logger} logger - TODO: add param description.
	   * @private
	   */
	  constructor(logger) {
	    const Logger = requireLogger$1();
	    if (typeof logger !== 'object' || Array.isArray(logger) || !(logger instanceof Logger)) {
	      throw new Error('Logger is required for profiling');
	    } else {
	      this.logger = logger;
	      this.start = Date.now();
	    }
	  }

	  /**
	   * Ends the current timer (i.e. Profiler) instance and logs the `msg` along
	   * with the duration since creation.
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  done(...args) {
	    if (typeof args[args.length - 1] === 'function') {
	      // eslint-disable-next-line no-console
	      console.warn('Callback function no longer supported as of winston@3.0.0');
	      args.pop();
	    }

	    const info = typeof args[args.length - 1] === 'object' ? args.pop() : {};
	    info.level = info.level || 'info';
	    info.durationMs = (Date.now()) - this.start;

	    return this.logger.write(info);
	  }
	}
	profiler = Profiler;
	return profiler;
}

/**
 * logger.js: TODO: add file header description.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var logger$1;
var hasRequiredLogger$1;

function requireLogger$1 () {
	if (hasRequiredLogger$1) return logger$1;
	hasRequiredLogger$1 = 1;

	const { Stream, Transform } = requireReadable();
	const asyncForEach = requireForEach();
	const { LEVEL, SPLAT } = requireTripleBeam();
	const isStream = requireIsStream();
	const ExceptionHandler = requireExceptionHandler();
	const RejectionHandler = requireRejectionHandler();
	const LegacyTransportStream = requireLegacy();
	const Profiler = requireProfiler();
	const { warn } = requireCommon();
	const config = requireConfig();

	/**
	 * Captures the number of format (i.e. %s strings) in a given string.
	 * Based on `util.format`, see Node.js source:
	 * https://github.com/nodejs/node/blob/b1c8f15c5f169e021f7c46eb7b219de95fe97603/lib/util.js#L201-L230
	 * @type {RegExp}
	 */
	const formatRegExp = /%[scdjifoO%]/g;

	/**
	 * TODO: add class description.
	 * @type {Logger}
	 * @extends {Transform}
	 */
	class Logger extends Transform {
	  /**
	   * Constructor function for the Logger object responsible for persisting log
	   * messages and metadata to one or more transports.
	   * @param {!Object} options - foo
	   */
	  constructor(options) {
	    super({ objectMode: true });
	    this.configure(options);
	  }

	  child(defaultRequestMetadata) {
	    const logger = this;
	    return Object.create(logger, {
	      write: {
	        value: function (info) {
	          const infoClone = Object.assign(
	            {},
	            defaultRequestMetadata,
	            info
	          );

	          // Object.assign doesn't copy inherited Error
	          // properties so we have to do that explicitly
	          //
	          // Remark (indexzero): we should remove this
	          // since the errors format will handle this case.
	          //
	          if (info instanceof Error) {
	            infoClone.stack = info.stack;
	            infoClone.message = info.message;
	          }

	          logger.write(infoClone);
	        }
	      }
	    });
	  }

	  /**
	   * This will wholesale reconfigure this instance by:
	   * 1. Resetting all transports. Older transports will be removed implicitly.
	   * 2. Set all other options including levels, colors, rewriters, filters,
	   *    exceptionHandlers, etc.
	   * @param {!Object} options - TODO: add param description.
	   * @returns {undefined}
	   */
	  configure({
	    silent,
	    format,
	    defaultMeta,
	    levels,
	    level = 'info',
	    exitOnError = true,
	    transports,
	    colors,
	    emitErrs,
	    formatters,
	    padLevels,
	    rewriters,
	    stripColors,
	    exceptionHandlers,
	    rejectionHandlers
	  } = {}) {
	    // Reset transports if we already have them
	    if (this.transports.length) {
	      this.clear();
	    }

	    this.silent = silent;
	    this.format = format || this.format || requireJson()();

	    this.defaultMeta = defaultMeta || null;
	    // Hoist other options onto this instance.
	    this.levels = levels || this.levels || config.npm.levels;
	    this.level = level;
	    if (this.exceptions) {
	      this.exceptions.unhandle();
	    }
	    if (this.rejections) {
	      this.rejections.unhandle();
	    }
	    this.exceptions = new ExceptionHandler(this);
	    this.rejections = new RejectionHandler(this);
	    this.profilers = {};
	    this.exitOnError = exitOnError;

	    // Add all transports we have been provided.
	    if (transports) {
	      transports = Array.isArray(transports) ? transports : [transports];
	      transports.forEach(transport => this.add(transport));
	    }

	    if (
	      colors ||
	      emitErrs ||
	      formatters ||
	      padLevels ||
	      rewriters ||
	      stripColors
	    ) {
	      throw new Error(
	        [
	          '{ colors, emitErrs, formatters, padLevels, rewriters, stripColors } were removed in winston@3.0.0.',
	          'Use a custom winston.format(function) instead.',
	          'See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md'
	        ].join('\n')
	      );
	    }

	    if (exceptionHandlers) {
	      this.exceptions.handle(exceptionHandlers);
	    }
	    if (rejectionHandlers) {
	      this.rejections.handle(rejectionHandlers);
	    }
	  }

	  isLevelEnabled(level) {
	    const givenLevelValue = getLevelValue(this.levels, level);
	    if (givenLevelValue === null) {
	      return false;
	    }

	    const configuredLevelValue = getLevelValue(this.levels, this.level);
	    if (configuredLevelValue === null) {
	      return false;
	    }

	    if (!this.transports || this.transports.length === 0) {
	      return configuredLevelValue >= givenLevelValue;
	    }

	    const index = this.transports.findIndex(transport => {
	      let transportLevelValue = getLevelValue(this.levels, transport.level);
	      if (transportLevelValue === null) {
	        transportLevelValue = configuredLevelValue;
	      }
	      return transportLevelValue >= givenLevelValue;
	    });
	    return index !== -1;
	  }

	  /* eslint-disable valid-jsdoc */
	  /**
	   * Ensure backwards compatibility with a `log` method
	   * @param {mixed} level - Level the log message is written at.
	   * @param {mixed} msg - TODO: add param description.
	   * @param {mixed} meta - TODO: add param description.
	   * @returns {Logger} - TODO: add return description.
	   *
	   * @example
	   *    // Supports the existing API:
	   *    logger.log('info', 'Hello world', { custom: true });
	   *    logger.log('info', new Error('Yo, it\'s on fire'));
	   *
	   *    // Requires winston.format.splat()
	   *    logger.log('info', '%s %d%%', 'A string', 50, { thisIsMeta: true });
	   *
	   *    // And the new API with a single JSON literal:
	   *    logger.log({ level: 'info', message: 'Hello world', custom: true });
	   *    logger.log({ level: 'info', message: new Error('Yo, it\'s on fire') });
	   *
	   *    // Also requires winston.format.splat()
	   *    logger.log({
	   *      level: 'info',
	   *      message: '%s %d%%',
	   *      [SPLAT]: ['A string', 50],
	   *      meta: { thisIsMeta: true }
	   *    });
	   *
	   */
	  /* eslint-enable valid-jsdoc */
	  log(level, msg, ...splat) {
	    // eslint-disable-line max-params
	    // Optimize for the hotpath of logging JSON literals
	    if (arguments.length === 1) {
	      // Yo dawg, I heard you like levels ... seriously ...
	      // In this context the LHS `level` here is actually the `info` so read
	      // this as: info[LEVEL] = info.level;
	      level[LEVEL] = level.level;
	      this._addDefaultMeta(level);
	      this.write(level);
	      return this;
	    }

	    // Slightly less hotpath, but worth optimizing for.
	    if (arguments.length === 2) {
	      if (msg && typeof msg === 'object') {
	        msg[LEVEL] = msg.level = level;
	        this._addDefaultMeta(msg);
	        this.write(msg);
	        return this;
	      }

	      msg = { [LEVEL]: level, level, message: msg };
	      this._addDefaultMeta(msg);
	      this.write(msg);
	      return this;
	    }

	    const [meta] = splat;
	    if (typeof meta === 'object' && meta !== null) {
	      // Extract tokens, if none available default to empty array to
	      // ensure consistancy in expected results
	      const tokens = msg && msg.match && msg.match(formatRegExp);

	      if (!tokens) {
	        const info = Object.assign({}, this.defaultMeta, meta, {
	          [LEVEL]: level,
	          [SPLAT]: splat,
	          level,
	          message: msg
	        });

	        if (meta.message) info.message = `${info.message} ${meta.message}`;
	        if (meta.stack) info.stack = meta.stack;
	        if (meta.cause) info.cause = meta.cause;

	        this.write(info);
	        return this;
	      }
	    }

	    this.write(Object.assign({}, this.defaultMeta, {
	      [LEVEL]: level,
	      [SPLAT]: splat,
	      level,
	      message: msg
	    }));

	    return this;
	  }

	  /**
	   * Pushes data so that it can be picked up by all of our pipe targets.
	   * @param {mixed} info - TODO: add param description.
	   * @param {mixed} enc - TODO: add param description.
	   * @param {mixed} callback - Continues stream processing.
	   * @returns {undefined}
	   * @private
	   */
	  _transform(info, enc, callback) {
	    if (this.silent) {
	      return callback();
	    }

	    // [LEVEL] is only soft guaranteed to be set here since we are a proper
	    // stream. It is likely that `info` came in through `.log(info)` or
	    // `.info(info)`. If it is not defined, however, define it.
	    // This LEVEL symbol is provided by `triple-beam` and also used in:
	    // - logform
	    // - winston-transport
	    // - abstract-winston-transport
	    if (!info[LEVEL]) {
	      info[LEVEL] = info.level;
	    }

	    // Remark: really not sure what to do here, but this has been reported as
	    // very confusing by pre winston@2.0.0 users as quite confusing when using
	    // custom levels.
	    if (!this.levels[info[LEVEL]] && this.levels[info[LEVEL]] !== 0) {
	      // eslint-disable-next-line no-console
	      console.error('[winston] Unknown logger level: %s', info[LEVEL]);
	    }

	    // Remark: not sure if we should simply error here.
	    if (!this._readableState.pipes) {
	      // eslint-disable-next-line no-console
	      console.error(
	        '[winston] Attempt to write logs with no transports, which can increase memory usage: %j',
	        info
	      );
	    }

	    // Here we write to the `format` pipe-chain, which on `readable` above will
	    // push the formatted `info` Object onto the buffer for this instance. We trap
	    // (and re-throw) any errors generated by the user-provided format, but also
	    // guarantee that the streams callback is invoked so that we can continue flowing.
	    try {
	      this.push(this.format.transform(info, this.format.options));
	    } finally {
	      this._writableState.sync = false;
	      // eslint-disable-next-line callback-return
	      callback();
	    }
	  }

	  /**
	   * Delays the 'finish' event until all transport pipe targets have
	   * also emitted 'finish' or are already finished.
	   * @param {mixed} callback - Continues stream processing.
	   */
	  _final(callback) {
	    const transports = this.transports.slice();
	    asyncForEach(
	      transports,
	      (transport, next) => {
	        if (!transport || transport.finished) return setImmediate(next);
	        transport.once('finish', next);
	        transport.end();
	      },
	      callback
	    );
	  }

	  /**
	   * Adds the transport to this logger instance by piping to it.
	   * @param {mixed} transport - TODO: add param description.
	   * @returns {Logger} - TODO: add return description.
	   */
	  add(transport) {
	    // Support backwards compatibility with all existing `winston < 3.x.x`
	    // transports which meet one of two criteria:
	    // 1. They inherit from winston.Transport in  < 3.x.x which is NOT a stream.
	    // 2. They expose a log method which has a length greater than 2 (i.e. more then
	    //    just `log(info, callback)`.
	    const target =
	      !isStream(transport) || transport.log.length > 2
	        ? new LegacyTransportStream({ transport })
	        : transport;

	    if (!target._writableState || !target._writableState.objectMode) {
	      throw new Error(
	        'Transports must WritableStreams in objectMode. Set { objectMode: true }.'
	      );
	    }

	    // Listen for the `error` event and the `warn` event on the new Transport.
	    this._onEvent('error', target);
	    this._onEvent('warn', target);
	    this.pipe(target);

	    if (transport.handleExceptions) {
	      this.exceptions.handle();
	    }

	    if (transport.handleRejections) {
	      this.rejections.handle();
	    }

	    return this;
	  }

	  /**
	   * Removes the transport from this logger instance by unpiping from it.
	   * @param {mixed} transport - TODO: add param description.
	   * @returns {Logger} - TODO: add return description.
	   */
	  remove(transport) {
	    if (!transport) return this;
	    let target = transport;
	    if (!isStream(transport) || transport.log.length > 2) {
	      target = this.transports.filter(
	        match => match.transport === transport
	      )[0];
	    }

	    if (target) {
	      this.unpipe(target);
	    }
	    return this;
	  }

	  /**
	   * Removes all transports from this logger instance.
	   * @returns {Logger} - TODO: add return description.
	   */
	  clear() {
	    this.unpipe();
	    return this;
	  }

	  /**
	   * Cleans up resources (streams, event listeners) for all transports
	   * associated with this instance (if necessary).
	   * @returns {Logger} - TODO: add return description.
	   */
	  close() {
	    this.exceptions.unhandle();
	    this.rejections.unhandle();
	    this.clear();
	    this.emit('close');
	    return this;
	  }

	  /**
	   * Sets the `target` levels specified on this instance.
	   * @param {Object} Target levels to use on this instance.
	   */
	  setLevels() {
	    warn.deprecated('setLevels');
	  }

	  /**
	   * Queries the all transports for this instance with the specified `options`.
	   * This will aggregate each transport's results into one object containing
	   * a property per transport.
	   * @param {Object} options - Query options for this instance.
	   * @param {function} callback - Continuation to respond to when complete.
	   */
	  query(options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    options = options || {};
	    const results = {};
	    const queryObject = Object.assign({}, options.query || {});

	    // Helper function to query a single transport
	    function queryTransport(transport, next) {
	      if (options.query && typeof transport.formatQuery === 'function') {
	        options.query = transport.formatQuery(queryObject);
	      }

	      transport.query(options, (err, res) => {
	        if (err) {
	          return next(err);
	        }

	        if (typeof transport.formatResults === 'function') {
	          res = transport.formatResults(res, options.format);
	        }

	        next(null, res);
	      });
	    }

	    // Helper function to accumulate the results from `queryTransport` into
	    // the `results`.
	    function addResults(transport, next) {
	      queryTransport(transport, (err, result) => {
	        // queryTransport could potentially invoke the callback multiple times
	        // since Transport code can be unpredictable.
	        if (next) {
	          result = err || result;
	          if (result) {
	            results[transport.name] = result;
	          }

	          // eslint-disable-next-line callback-return
	          next();
	        }

	        next = null;
	      });
	    }

	    // Iterate over the transports in parallel setting the appropriate key in
	    // the `results`.
	    asyncForEach(
	      this.transports.filter(transport => !!transport.query),
	      addResults,
	      () => callback(null, results)
	    );
	  }

	  /**
	   * Returns a log stream for all transports. Options object is optional.
	   * @param{Object} options={} - Stream options for this instance.
	   * @returns {Stream} - TODO: add return description.
	   */
	  stream(options = {}) {
	    const out = new Stream();
	    const streams = [];

	    out._streams = streams;
	    out.destroy = () => {
	      let i = streams.length;
	      while (i--) {
	        streams[i].destroy();
	      }
	    };

	    // Create a list of all transports for this instance.
	    this.transports
	      .filter(transport => !!transport.stream)
	      .forEach(transport => {
	        const str = transport.stream(options);
	        if (!str) {
	          return;
	        }

	        streams.push(str);

	        str.on('log', log => {
	          log.transport = log.transport || [];
	          log.transport.push(transport.name);
	          out.emit('log', log);
	        });

	        str.on('error', err => {
	          err.transport = err.transport || [];
	          err.transport.push(transport.name);
	          out.emit('error', err);
	        });
	      });

	    return out;
	  }

	  /**
	   * Returns an object corresponding to a specific timing. When done is called
	   * the timer will finish and log the duration. e.g.:
	   * @returns {Profile} - TODO: add return description.
	   * @example
	   *    const timer = winston.startTimer()
	   *    setTimeout(() => {
	   *      timer.done({
	   *        message: 'Logging message'
	   *      });
	   *    }, 1000);
	   */
	  startTimer() {
	    return new Profiler(this);
	  }

	  /**
	   * Tracks the time inbetween subsequent calls to this method with the same
	   * `id` parameter. The second call to this method will log the difference in
	   * milliseconds along with the message.
	   * @param {string} id Unique id of the profiler
	   * @returns {Logger} - TODO: add return description.
	   */
	  profile(id, ...args) {
	    const time = Date.now();
	    if (this.profilers[id]) {
	      const timeEnd = this.profilers[id];
	      delete this.profilers[id];

	      // Attempt to be kind to users if they are still using older APIs.
	      if (typeof args[args.length - 2] === 'function') {
	        // eslint-disable-next-line no-console
	        console.warn(
	          'Callback function no longer supported as of winston@3.0.0'
	        );
	        args.pop();
	      }

	      // Set the duration property of the metadata
	      const info = typeof args[args.length - 1] === 'object' ? args.pop() : {};
	      info.level = info.level || 'info';
	      info.durationMs = time - timeEnd;
	      info.message = info.message || id;
	      return this.write(info);
	    }

	    this.profilers[id] = time;
	    return this;
	  }

	  /**
	   * Backwards compatibility to `exceptions.handle` in winston < 3.0.0.
	   * @returns {undefined}
	   * @deprecated
	   */
	  handleExceptions(...args) {
	    // eslint-disable-next-line no-console
	    console.warn(
	      'Deprecated: .handleExceptions() will be removed in winston@4. Use .exceptions.handle()'
	    );
	    this.exceptions.handle(...args);
	  }

	  /**
	   * Backwards compatibility to `exceptions.handle` in winston < 3.0.0.
	   * @returns {undefined}
	   * @deprecated
	   */
	  unhandleExceptions(...args) {
	    // eslint-disable-next-line no-console
	    console.warn(
	      'Deprecated: .unhandleExceptions() will be removed in winston@4. Use .exceptions.unhandle()'
	    );
	    this.exceptions.unhandle(...args);
	  }

	  /**
	   * Throw a more meaningful deprecation notice
	   * @throws {Error} - TODO: add throws description.
	   */
	  cli() {
	    throw new Error(
	      [
	        'Logger.cli() was removed in winston@3.0.0',
	        'Use a custom winston.formats.cli() instead.',
	        'See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md'
	      ].join('\n')
	    );
	  }

	  /**
	   * Bubbles the `event` that occured on the specified `transport` up
	   * from this instance.
	   * @param {string} event - The event that occured
	   * @param {Object} transport - Transport on which the event occured
	   * @private
	   */
	  _onEvent(event, transport) {
	    function transportEvent(err) {
	      // https://github.com/winstonjs/winston/issues/1364
	      if (event === 'error' && !this.transports.includes(transport)) {
	        this.add(transport);
	      }
	      this.emit(event, err, transport);
	    }

	    if (!transport['__winston' + event]) {
	      transport['__winston' + event] = transportEvent.bind(this);
	      transport.on(event, transport['__winston' + event]);
	    }
	  }

	  _addDefaultMeta(msg) {
	    if (this.defaultMeta) {
	      Object.assign(msg, this.defaultMeta);
	    }
	  }
	}

	function getLevelValue(levels, level) {
	  const value = levels[level];
	  if (!value && value !== 0) {
	    return null;
	  }
	  return value;
	}

	/**
	 * Represents the current readableState pipe targets for this Logger instance.
	 * @type {Array|Object}
	 */
	Object.defineProperty(Logger.prototype, 'transports', {
	  configurable: false,
	  enumerable: true,
	  get() {
	    const { pipes } = this._readableState;
	    return !Array.isArray(pipes) ? [pipes].filter(Boolean) : pipes;
	  }
	});

	logger$1 = Logger;
	return logger$1;
}

/**
 * create-logger.js: Logger factory for winston logger instances.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var createLogger;
var hasRequiredCreateLogger;

function requireCreateLogger () {
	if (hasRequiredCreateLogger) return createLogger;
	hasRequiredCreateLogger = 1;

	const { LEVEL } = requireTripleBeam();
	const config = requireConfig();
	const Logger = requireLogger$1();
	const debug = requireNode()('winston:create-logger');

	function isLevelEnabledFunctionName(level) {
	  return 'is' + level.charAt(0).toUpperCase() + level.slice(1) + 'Enabled';
	}

	/**
	 * Create a new instance of a winston Logger. Creates a new
	 * prototype for each instance.
	 * @param {!Object} opts - Options for the created logger.
	 * @returns {Logger} - A newly created logger instance.
	 */
	createLogger = function (opts = {}) {
	  //
	  // Default levels: npm
	  //
	  opts.levels = opts.levels || config.npm.levels;

	  /**
	   * DerivedLogger to attach the logs level methods.
	   * @type {DerivedLogger}
	   * @extends {Logger}
	   */
	  class DerivedLogger extends Logger {
	    /**
	     * Create a new class derived logger for which the levels can be attached to
	     * the prototype of. This is a V8 optimization that is well know to increase
	     * performance of prototype functions.
	     * @param {!Object} options - Options for the created logger.
	     */
	    constructor(options) {
	      super(options);
	    }
	  }

	  const logger = new DerivedLogger(opts);

	  //
	  // Create the log level methods for the derived logger.
	  //
	  Object.keys(opts.levels).forEach(function (level) {
	    debug('Define prototype method for "%s"', level);
	    if (level === 'log') {
	      // eslint-disable-next-line no-console
	      console.warn('Level "log" not defined: conflicts with the method "log". Use a different level name.');
	      return;
	    }

	    //
	    // Define prototype methods for each log level e.g.:
	    // logger.log('info', msg) implies these methods are defined:
	    // - logger.info(msg)
	    // - logger.isInfoEnabled()
	    //
	    // Remark: to support logger.child this **MUST** be a function
	    // so it'll always be called on the instance instead of a fixed
	    // place in the prototype chain.
	    //
	    DerivedLogger.prototype[level] = function (...args) {
	      // Prefer any instance scope, but default to "root" logger
	      const self = this || logger;

	      // Optimize the hot-path which is the single object.
	      if (args.length === 1) {
	        const [msg] = args;
	        const info = msg && msg.message && msg || { message: msg };
	        info.level = info[LEVEL] = level;
	        self._addDefaultMeta(info);
	        self.write(info);
	        return (this || logger);
	      }

	      // When provided nothing assume the empty string
	      if (args.length === 0) {
	        self.log(level, '');
	        return self;
	      }

	      // Otherwise build argument list which could potentially conform to
	      // either:
	      // . v3 API: log(obj)
	      // 2. v1/v2 API: log(level, msg, ... [string interpolate], [{metadata}], [callback])
	      return self.log(level, ...args);
	    };

	    DerivedLogger.prototype[isLevelEnabledFunctionName(level)] = function () {
	      return (this || logger).isLevelEnabled(level);
	    };
	  });

	  return logger;
	};
	return createLogger;
}

/**
 * container.js: Inversion of control container for winston logger instances.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var container;
var hasRequiredContainer;

function requireContainer () {
	if (hasRequiredContainer) return container;
	hasRequiredContainer = 1;

	const createLogger = requireCreateLogger();

	/**
	 * Inversion of control container for winston logger instances.
	 * @type {Container}
	 */
	container = class Container {
	  /**
	   * Constructor function for the Container object responsible for managing a
	   * set of `winston.Logger` instances based on string ids.
	   * @param {!Object} [options={}] - Default pass-thru options for Loggers.
	   */
	  constructor(options = {}) {
	    this.loggers = new Map();
	    this.options = options;
	  }

	  /**
	   * Retrieves a `winston.Logger` instance for the specified `id`. If an
	   * instance does not exist, one is created.
	   * @param {!string} id - The id of the Logger to get.
	   * @param {?Object} [options] - Options for the Logger instance.
	   * @returns {Logger} - A configured Logger instance with a specified id.
	   */
	  add(id, options) {
	    if (!this.loggers.has(id)) {
	      // Remark: Simple shallow clone for configuration options in case we pass
	      // in instantiated protoypal objects
	      options = Object.assign({}, options || this.options);
	      const existing = options.transports || this.options.transports;

	      // Remark: Make sure if we have an array of transports we slice it to
	      // make copies of those references.
	      if (existing) {
	        options.transports = Array.isArray(existing) ? existing.slice() : [existing];
	      } else {
	        options.transports = [];
	      }

	      const logger = createLogger(options);
	      logger.on('close', () => this._delete(id));
	      this.loggers.set(id, logger);
	    }

	    return this.loggers.get(id);
	  }

	  /**
	   * Retreives a `winston.Logger` instance for the specified `id`. If
	   * an instance does not exist, one is created.
	   * @param {!string} id - The id of the Logger to get.
	   * @param {?Object} [options] - Options for the Logger instance.
	   * @returns {Logger} - A configured Logger instance with a specified id.
	   */
	  get(id, options) {
	    return this.add(id, options);
	  }

	  /**
	   * Check if the container has a logger with the id.
	   * @param {?string} id - The id of the Logger instance to find.
	   * @returns {boolean} - Boolean value indicating if this instance has a
	   * logger with the specified `id`.
	   */
	  has(id) {
	    return !!this.loggers.has(id);
	  }

	  /**
	   * Closes a `Logger` instance with the specified `id` if it exists.
	   * If no `id` is supplied then all Loggers are closed.
	   * @param {?string} id - The id of the Logger instance to close.
	   * @returns {undefined}
	   */
	  close(id) {
	    if (id) {
	      return this._removeLogger(id);
	    }

	    this.loggers.forEach((val, key) => this._removeLogger(key));
	  }

	  /**
	   * Remove a logger based on the id.
	   * @param {!string} id - The id of the logger to remove.
	   * @returns {undefined}
	   * @private
	   */
	  _removeLogger(id) {
	    if (!this.loggers.has(id)) {
	      return;
	    }

	    const logger = this.loggers.get(id);
	    logger.close();
	    this._delete(id);
	  }

	  /**
	   * Deletes a `Logger` instance with the specified `id`.
	   * @param {!string} id - The id of the Logger instance to delete from
	   * container.
	   * @returns {undefined}
	   * @private
	   */
	  _delete(id) {
	    this.loggers.delete(id);
	  }
	};
	return container;
}

/**
 * winston.js: Top-level include defining Winston.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

var hasRequiredWinston;

function requireWinston () {
	if (hasRequiredWinston) return winston;
	hasRequiredWinston = 1;
	(function (exports) {

		const logform = requireLogform();
		const { warn } = requireCommon();

		/**
		 * Expose version. Use `require` method for `webpack` support.
		 * @type {string}
		 */
		exports.version = require$$2.version;
		/**
		 * Include transports defined by default by winston
		 * @type {Array}
		 */
		exports.transports = requireTransports();
		/**
		 * Expose utility methods
		 * @type {Object}
		 */
		exports.config = requireConfig();
		/**
		 * Hoist format-related functionality from logform.
		 * @type {Object}
		 */
		exports.addColors = logform.levels;
		/**
		 * Hoist format-related functionality from logform.
		 * @type {Object}
		 */
		exports.format = logform.format;
		/**
		 * Expose core Logging-related prototypes.
		 * @type {function}
		 */
		exports.createLogger = requireCreateLogger();
		/**
		 * Expose core Logging-related prototypes.
		 * @type {function}
		 */
		exports.Logger = requireLogger$1();
		/**
		 * Expose core Logging-related prototypes.
		 * @type {Object}
		 */
		exports.ExceptionHandler = requireExceptionHandler();
		/**
		 * Expose core Logging-related prototypes.
		 * @type {Object}
		 */
		exports.RejectionHandler = requireRejectionHandler();
		/**
		 * Expose core Logging-related prototypes.
		 * @type {Container}
		 */
		exports.Container = requireContainer();
		/**
		 * Expose core Logging-related prototypes.
		 * @type {Object}
		 */
		exports.Transport = requireWinstonTransport();
		/**
		 * We create and expose a default `Container` to `winston.loggers` so that the
		 * programmer may manage multiple `winston.Logger` instances without any
		 * additional overhead.
		 * @example
		 *   // some-file1.js
		 *   const logger = require('winston').loggers.get('something');
		 *
		 *   // some-file2.js
		 *   const logger = require('winston').loggers.get('something');
		 */
		exports.loggers = new exports.Container();

		/**
		 * We create and expose a 'defaultLogger' so that the programmer may do the
		 * following without the need to create an instance of winston.Logger directly:
		 * @example
		 *   const winston = require('winston');
		 *   winston.log('info', 'some message');
		 *   winston.error('some error');
		 */
		const defaultLogger = exports.createLogger();

		// Pass through the target methods onto `winston.
		Object.keys(exports.config.npm.levels)
		  .concat([
		    'log',
		    'query',
		    'stream',
		    'add',
		    'remove',
		    'clear',
		    'profile',
		    'startTimer',
		    'handleExceptions',
		    'unhandleExceptions',
		    'handleRejections',
		    'unhandleRejections',
		    'configure',
		    'child'
		  ])
		  .forEach(
		    method => (exports[method] = (...args) => defaultLogger[method](...args))
		  );

		/**
		 * Define getter / setter for the default logger level which need to be exposed
		 * by winston.
		 * @type {string}
		 */
		Object.defineProperty(exports, 'level', {
		  get() {
		    return defaultLogger.level;
		  },
		  set(val) {
		    defaultLogger.level = val;
		  }
		});

		/**
		 * Define getter for `exceptions` which replaces `handleExceptions` and
		 * `unhandleExceptions`.
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'exceptions', {
		  get() {
		    return defaultLogger.exceptions;
		  }
		});

		/**
		 * Define getter for `rejections` which replaces `handleRejections` and
		 * `unhandleRejections`.
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'rejections', {
		  get() {
		    return defaultLogger.rejections;
		  }
		});

		/**
		 * Define getters / setters for appropriate properties of the default logger
		 * which need to be exposed by winston.
		 * @type {Logger}
		 */
		['exitOnError'].forEach(prop => {
		  Object.defineProperty(exports, prop, {
		    get() {
		      return defaultLogger[prop];
		    },
		    set(val) {
		      defaultLogger[prop] = val;
		    }
		  });
		});

		/**
		 * The default transports and exceptionHandlers for the default winston logger.
		 * @type {Object}
		 */
		Object.defineProperty(exports, 'default', {
		  get() {
		    return {
		      exceptionHandlers: defaultLogger.exceptionHandlers,
		      rejectionHandlers: defaultLogger.rejectionHandlers,
		      transports: defaultLogger.transports
		    };
		  }
		});

		// Have friendlier breakage notices for properties that were exposed by default
		// on winston < 3.0.
		warn.deprecated(exports, 'setLevels');
		warn.forFunctions(exports, 'useFormat', ['cli']);
		warn.forProperties(exports, 'useFormat', ['padLevels', 'stripColors']);
		warn.forFunctions(exports, 'deprecated', [
		  'addRewriter',
		  'addFilter',
		  'clone',
		  'extend'
		]);
		warn.forProperties(exports, 'deprecated', ['emitErrs', 'levelLength']); 
	} (winston));
	return winston;
}

var logger;
var hasRequiredLogger;

function requireLogger () {
	if (hasRequiredLogger) return logger;
	hasRequiredLogger = 1;
	const winston = requireWinston();
	// const DailyRotateFile = require('winston-daily-rotate-file');
	// import path from 'path';
	// import fs from 'fs';
	var cachedLogger = null;
	require$$0$6.platform();

	// const logDir = path.join(app.getPath('userData'), 'logs')
	// if (!fs.existsSync(logDir)) {
	//     fs.mkdirSync(logDir, { recursive: true });
	// }

	function initLogger() {
	    let alignColorsAndTime = winston.format.combine(
	        winston.format.colorize({
	            all:true
	        }),
	        winston.format.label({
	            label:'> LOG'
	        }),
	        winston.format.timestamp({
	            format:"YY-MM-DD HH:mm:ss"
	        }),
	        winston.format.printf(
	            info => `${info.label} ${info.timestamp} ${info.level}-> ${info.message}`
	        )
	    );
	    
	    winston.addColors({
	        info: 'bold cyan',
	        warn: 'yellowBG bold white',
	        error: 'redBG bold white',
	        debug: 'green',
	    });
	    
	    // 格式化日志消息
	    function formatMessage(args) {
	        return args.map(arg => {
	            if (arg instanceof Error) {
	                // 处理 Error 类型，输出错误信息和堆栈
	                return `${arg.message}\n${arg.stack}`;
	            }
	            if (arg instanceof Uint8Array) {
	                // 处理 Uint8Array 类型，输出为十六进制格式
	                return `Uint8Array [ ${Array.from(arg).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')} ]`;
	            }
	            if (typeof arg === 'object' && arg !== null) {
	                // 对象或数组转换为 JSON 字符串
	                return JSON.stringify(arg, null, 2);
	            }
	            // 其他类型直接返回字符串
	            return String(arg);
	        }).join(' ');
	    }
	    
	    const logger = winston.createLogger({
	        level: 'debug',
	        format: winston.format.combine(
	            winston.format.timestamp({
	                format: 'YYYY-MM-DD HH:mm:ss'
	            }),
	            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
	        ),
	        transports: [
	            // new DailyRotateFile({
	            //     filename: '%DATE%.log',
	            //     dirname: processPathSpaces(logDir),
	            //     datePattern: 'YYYY-MM-DD',
	            //     zippedArchive: true,
	            //     maxSize: '20m',
	            //     maxFiles: '14d'
	            // })
	        ]
	    });
	    
	    logger.add(new (winston.transports.Console)({
	        format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
	    }));
	    
	    ['info', 'warn', 'error', 'debug'].forEach(level => {
	        const original = logger[level];
	        logger[level] = (...args) => {
	            const formattedMessage = formatMessage(args);
	            original.call(logger, formattedMessage);
	        };
	    });
	  
	    return logger;
	}

	logger = {
	    logger: cachedLogger || (cachedLogger = initLogger())
	};

	// console.log = (message, ...args) => logger.info(message, ...args);
	// console.info = (message, ...args) => logger.info(message, ...args);
	// console.error = (message, ...args) => logger.error(message, ...args);
	// console.warn = (message, ...args) => logger.warn(message, ...args);
	return logger;
}

var minimist;
var hasRequiredMinimist;

function requireMinimist () {
	if (hasRequiredMinimist) return minimist;
	hasRequiredMinimist = 1;

	function hasKey(obj, keys) {
		var o = obj;
		keys.slice(0, -1).forEach(function (key) {
			o = o[key] || {};
		});

		var key = keys[keys.length - 1];
		return key in o;
	}

	function isNumber(x) {
		if (typeof x === 'number') { return true; }
		if ((/^0x[0-9a-f]+$/i).test(x)) { return true; }
		return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(x);
	}

	function isConstructorOrProto(obj, key) {
		return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
	}

	minimist = function (args, opts) {
		if (!opts) { opts = {}; }

		var flags = {
			bools: {},
			strings: {},
			unknownFn: null,
		};

		if (typeof opts.unknown === 'function') {
			flags.unknownFn = opts.unknown;
		}

		if (typeof opts.boolean === 'boolean' && opts.boolean) {
			flags.allBools = true;
		} else {
			[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
				flags.bools[key] = true;
			});
		}

		var aliases = {};

		function aliasIsBoolean(key) {
			return aliases[key].some(function (x) {
				return flags.bools[x];
			});
		}

		Object.keys(opts.alias || {}).forEach(function (key) {
			aliases[key] = [].concat(opts.alias[key]);
			aliases[key].forEach(function (x) {
				aliases[x] = [key].concat(aliases[key].filter(function (y) {
					return x !== y;
				}));
			});
		});

		[].concat(opts.string).filter(Boolean).forEach(function (key) {
			flags.strings[key] = true;
			if (aliases[key]) {
				[].concat(aliases[key]).forEach(function (k) {
					flags.strings[k] = true;
				});
			}
		});

		var defaults = opts.default || {};

		var argv = { _: [] };

		function argDefined(key, arg) {
			return (flags.allBools && (/^--[^=]+$/).test(arg))
				|| flags.strings[key]
				|| flags.bools[key]
				|| aliases[key];
		}

		function setKey(obj, keys, value) {
			var o = obj;
			for (var i = 0; i < keys.length - 1; i++) {
				var key = keys[i];
				if (isConstructorOrProto(o, key)) { return; }
				if (o[key] === undefined) { o[key] = {}; }
				if (
					o[key] === Object.prototype
					|| o[key] === Number.prototype
					|| o[key] === String.prototype
				) {
					o[key] = {};
				}
				if (o[key] === Array.prototype) { o[key] = []; }
				o = o[key];
			}

			var lastKey = keys[keys.length - 1];
			if (isConstructorOrProto(o, lastKey)) { return; }
			if (
				o === Object.prototype
				|| o === Number.prototype
				|| o === String.prototype
			) {
				o = {};
			}
			if (o === Array.prototype) { o = []; }
			if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
				o[lastKey] = value;
			} else if (Array.isArray(o[lastKey])) {
				o[lastKey].push(value);
			} else {
				o[lastKey] = [o[lastKey], value];
			}
		}

		function setArg(key, val, arg) {
			if (arg && flags.unknownFn && !argDefined(key, arg)) {
				if (flags.unknownFn(arg) === false) { return; }
			}

			var value = !flags.strings[key] && isNumber(val)
				? Number(val)
				: val;
			setKey(argv, key.split('.'), value);

			(aliases[key] || []).forEach(function (x) {
				setKey(argv, x.split('.'), value);
			});
		}

		Object.keys(flags.bools).forEach(function (key) {
			setArg(key, defaults[key] === undefined ? false : defaults[key]);
		});

		var notFlags = [];

		if (args.indexOf('--') !== -1) {
			notFlags = args.slice(args.indexOf('--') + 1);
			args = args.slice(0, args.indexOf('--'));
		}

		for (var i = 0; i < args.length; i++) {
			var arg = args[i];
			var key;
			var next;

			if ((/^--.+=/).test(arg)) {
				// Using [\s\S] instead of . because js doesn't support the
				// 'dotall' regex modifier. See:
				// http://stackoverflow.com/a/1068308/13216
				var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
				key = m[1];
				var value = m[2];
				if (flags.bools[key]) {
					value = value !== 'false';
				}
				setArg(key, value, arg);
			} else if ((/^--no-.+/).test(arg)) {
				key = arg.match(/^--no-(.+)/)[1];
				setArg(key, false, arg);
			} else if ((/^--.+/).test(arg)) {
				key = arg.match(/^--(.+)/)[1];
				next = args[i + 1];
				if (
					next !== undefined
					&& !(/^(-|--)[^-]/).test(next)
					&& !flags.bools[key]
					&& !flags.allBools
					&& (aliases[key] ? !aliasIsBoolean(key) : true)
				) {
					setArg(key, next, arg);
					i += 1;
				} else if ((/^(true|false)$/).test(next)) {
					setArg(key, next === 'true', arg);
					i += 1;
				} else {
					setArg(key, flags.strings[key] ? '' : true, arg);
				}
			} else if ((/^-[^-]+/).test(arg)) {
				var letters = arg.slice(1, -1).split('');

				var broken = false;
				for (var j = 0; j < letters.length; j++) {
					next = arg.slice(j + 2);

					if (next === '-') {
						setArg(letters[j], next, arg);
						continue;
					}

					if ((/[A-Za-z]/).test(letters[j]) && next[0] === '=') {
						setArg(letters[j], next.slice(1), arg);
						broken = true;
						break;
					}

					if (
						(/[A-Za-z]/).test(letters[j])
						&& (/-?\d+(\.\d*)?(e-?\d+)?$/).test(next)
					) {
						setArg(letters[j], next, arg);
						broken = true;
						break;
					}

					if (letters[j + 1] && letters[j + 1].match(/\W/)) {
						setArg(letters[j], arg.slice(j + 2), arg);
						broken = true;
						break;
					} else {
						setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
					}
				}

				key = arg.slice(-1)[0];
				if (!broken && key !== '-') {
					if (
						args[i + 1]
						&& !(/^(-|--)[^-]/).test(args[i + 1])
						&& !flags.bools[key]
						&& (aliases[key] ? !aliasIsBoolean(key) : true)
					) {
						setArg(key, args[i + 1], arg);
						i += 1;
					} else if (args[i + 1] && (/^(true|false)$/).test(args[i + 1])) {
						setArg(key, args[i + 1] === 'true', arg);
						i += 1;
					} else {
						setArg(key, flags.strings[key] ? '' : true, arg);
					}
				}
			} else {
				if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
					argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
				}
				if (opts.stopEarly) {
					argv._.push.apply(argv._, args.slice(i + 1));
					break;
				}
			}
		}

		Object.keys(defaults).forEach(function (k) {
			if (!hasKey(argv, k.split('.'))) {
				setKey(argv, k.split('.'), defaults[k]);

				(aliases[k] || []).forEach(function (x) {
					setKey(argv, x.split('.'), defaults[k]);
				});
			}
		});

		if (opts['--']) {
			argv['--'] = notFlags.slice();
		} else {
			notFlags.forEach(function (k) {
				argv._.push(k);
			});
		}

		return argv;
	};
	return minimist;
}

var plugin_client;
var hasRequiredPlugin_client;

function requirePlugin_client () {
	if (hasRequiredPlugin_client) return plugin_client;
	hasRequiredPlugin_client = 1;
	// plugin_client.js
	// This file handles plugin-side WebSocket logic.

	const WebSocket = requireWs();
	const PluginCommand = requirePlugin_command();
	const { logger } = requireLogger();
	const minimist = requireMinimist();

	class PluginClient {
	  constructor() {
	    this.serverUrl = ''; // Will be set in the start method
	    this.ws = null;
	    this.handlers = {};    // For on(type, handler)
	    this.pendingCalls = {}; 
	  }

	  /**
	   * Starts the WebSocket connection by extracting port and uid from command-line arguments
	   */
	  start() {
	    const { port, uid, dir } = this._parseCommandLineArgs();
	    logger.info(`Starting plugin client with port ${port} and uid ${uid}`);

	    if (!port || !uid) {
	      logger.error('Usage: node plugin_client.js --port=<port> --uid=<uid>');
	      process.exit(1);
	    }

	    this.serverUrl = `ws://localhost:${port}`;
	    this.ws = new WebSocket(this.serverUrl);

	    this.ws.on('open', () => {
	      logger.info(`Connected to server at ${this.serverUrl}`);
	      const initCmd = new PluginCommand('startup', {
	        pluginID: uid,
	      });
	      logger.debug(`Sending init command: ${initCmd.toString()}`);
	      this.ws.send(JSON.stringify(initCmd.toJSON()));
	    });

	    this.ws.on('message', (msg) => {
	      this._handleMessage(msg);
	    });

	    this.ws.on('close', () => {
	      logger.warn('Connection closed');
	      process.exit(0);
	    });

	    this.ws.on('error', (err) => {
	      logger.error(`WebSocket error: ${err.message}`);
	      process.exit(0);
	    });
	  }

	  /**
	   * Parses command-line arguments to extract port, uid, and dir.
	   * Supports:
	   *   --port=8080 --uid=12345 --dir=/some/path
	   *   -p 8080 -u 12345 -d /some/path
	   * @returns {Object} An object containing port, uid, dir
	   */
	  _parseCommandLineArgs() {
	    const argv = minimist(process.argv.slice(2), {
	      alias: {
	        p: 'port',
	        u: 'uid',
	        d: 'dir'
	      }
	    });

	    return {
	      port: argv.port,
	      uid: argv.uid,
	      dir: argv.dir
	    };
	  }

	  /**
	   * Sends a request to the server
	   * @param {Object} payload - The payload of the request
	   * @param {number} timeout - Timeout in milliseconds
	   * @returns {Promise} Resolves with the response payload or rejects with an error
	   */
	  call(payload, timeout = 5000) {
	    return new Promise((resolve, reject) => {
	      const cmd = new PluginCommand('plugin-message', payload);
	      this.pendingCalls[cmd.uuid] = {
	        resolve,
	        reject,
	        timer: setTimeout(() => {
	          delete this.pendingCalls[cmd.uuid];
	          reject(new Error('Request timed out'));
	        }, timeout)
	      };
	      this.ws.send(JSON.stringify(cmd.toJSON()));
	    });
	  }

	  /**
	   * Registers a handler for incoming messages of a specific type
	   * @param {string} type - The type of the message to handle
	   * @param {Function} handler - The handler function
	   */
	  on(type, handler) {
	    this.handlers[type] = handler;
	  }

	  /**
	   * Unregisters a handler for a specific message type
	   * @param {string} type - The type of the message
	   */
	  off(type) {
	    delete this.handlers[type];
	  }

	  /**
	   * Handles incoming WebSocket messages
	   * @param {string} msg - The received message
	   */
	  _handleMessage(msg) {
	    let cmd;
	    msg = msg.toString('utf8');
	    try {
	      cmd = PluginCommand.fromJSON(msg);
	      logger.debug(`Received message: ${cmd.toString()}`);
	    } catch (e) {
	      logger.error(`Invalid message format: ${msg}`);
	      return;
	    }

	    // If it's a response to a call()
	    if (this.pendingCalls[cmd.uuid]) {
	      const { resolve, reject, timer } = this.pendingCalls[cmd.uuid];
	      clearTimeout(timer);
	      delete this.pendingCalls[cmd.uuid];

	      if (cmd.status === 'success') resolve(cmd.payload);
	      else reject(new Error(cmd.payload || 'Unknown error'));
	      return;
	    }

	    // If it's a broadcast or direct send
	    const handler = this.handlers[cmd.type];
	    if (handler) {
	      const result = handler(cmd.payload);
	      const response = new PluginCommand('response', result, cmd.uuid, 'success');
	      this.ws.send(JSON.stringify(response.toJSON()));
	    }
	  }
	}

	/**
	 * pluginClient is the singleton instance of PluginClient.
	 */
	const pluginClient = new PluginClient();

	plugin_client = pluginClient;
	return plugin_client;
}

var hasRequiredPlugin;

function requirePlugin () {
	if (hasRequiredPlugin) return plugin$1;
	hasRequiredPlugin = 1;
	const pluginClient = requirePlugin_client();

	pluginClient.on('ui-message', (payload) => {
	    console.log('Received message from UI:', payload);
	    return 'Hello from plugin!'
	});
	  
	pluginClient.start();

	setInterval(async () => {
	    const result = await pluginClient.call({
	        data: 'Hello from plugin!'
	    });
	    console.log('Received response:', result);
	}, 1000);
	return plugin$1;
}

var pluginExports = requirePlugin();
var plugin = /*@__PURE__*/getDefaultExportFromCjs(pluginExports);

export { plugin as default };
//# sourceMappingURL=plugin.js.map
