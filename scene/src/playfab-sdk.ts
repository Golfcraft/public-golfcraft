
      import * as Identity from "@decentraland/Identity";
      import * as EnvironmentAPI from "@decentraland/EnvironmentAPI";
      import * as web3Provider from "@decentraland/web3-provider";
      import * as EthereumController from "@decentraland/EthereumController";
      import * as RestrictedActions from "@decentraland/RestrictedActions";
      
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;
g = (function () {
    return this;
})();
try {
    g = g || new Function("return this")();
}
catch (e) {
    if (typeof window === "object")
        g = window;
}
module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var url = __webpack_require__(9);
var https = __webpack_require__(37);
exports.sdk_version = "2.68.210511";
exports.buildIdentifier = "jbuild_nodesdk_sdk-generic-2_1";
var settings = (exports.settings = {
    productionUrl: ".playfabapi.com",
    verticalName: null,
    titleId: null,
    globalErrorHandler: null,
    developerSecretKey: null,
    port: 443,
    advertisingIdType: null,
    advertisingIdValue: null,
    disableAdvertising: false,
    AD_TYPE_IDFA: "Idfa",
    AD_TYPE_ANDROID_ID: "Adid",
});
var _internalSettings = (exports._internalSettings = {
    entityToken: null,
    sessionTicket: null,
    requestGetParams: {
        sdk: "JavaScriptSDK-2.68.210511",
    },
});
exports.GetServerUrl = function () {
    var baseUrl = exports.settings.productionUrl;
    if (!(baseUrl.substring(0, 4) === "http")) {
        if (exports.settings.verticalName) {
            return "https://" + exports.settings.verticalName + baseUrl;
        }
        else {
            return "https://" + exports.settings.titleId + baseUrl;
        }
    }
    else {
        return baseUrl;
    }
};
exports.MakeRequest = function (urlStr, request, authType, authValue, callback) {
    if (request == null) {
        request = {};
    }
    var requestBody = Buffer.from(JSON.stringify(request), "utf8");
    var urlArr = [urlStr];
    var getParams = _internalSettings.requestGetParams;
    if (getParams != null) {
        var firstParam = true;
        for (var key in getParams) {
            if (firstParam) {
                urlArr.push("?");
                firstParam = false;
            }
            else {
                urlArr.push("&");
            }
            urlArr.push(key);
            urlArr.push("=");
            urlArr.push(getParams[key]);
        }
    }
    var completeUrl = urlArr.join("");
    var options = url.parse(completeUrl);
    if (options.protocol !== "https:") {
        throw new Error("Unsupported protocol: " + options.protocol);
    }
    options.method = "POST";
    options.port = options.port || exports.settings.port;
    options.headers = {
        "Content-Type": "application/json",
        "Content-Length": requestBody.length,
        "X-PlayFabSDK": "NodeSDK-" + exports.sdk_version + "-" + exports.api_version,
    };
    if (authType) {
        options.headers[authType] = authValue;
    }
    var postReq = https.request(options, function (res) {
        var rawReply = "";
        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            rawReply += chunk;
        });
        res.on("end", function () {
            if (callback == null) {
                return;
            }
            var replyEnvelope = null;
            try {
                replyEnvelope = JSON.parse(rawReply);
            }
            catch (e) {
                replyEnvelope = {
                    code: 503,
                    status: "Service Unavailable",
                    error: "Connection error",
                    errorCode: 2,
                    errorMessage: rawReply,
                };
            }
            if (replyEnvelope.hasOwnProperty("error") || !replyEnvelope.hasOwnProperty("data")) {
                callback(replyEnvelope, null);
            }
            else {
                callback(null, replyEnvelope);
            }
        });
    });
    postReq.on("error", function (e) {
        if (callback == null) {
            return;
        }
        callback({
            code: 503,
            status: "Service Unavailable",
            error: "Connection error",
            errorCode: 2,
            errorMessage: e.message,
        }, null);
    });
    postReq.write(requestBody);
    postReq.end();
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2).Buffer))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
var base64 = __webpack_require__(29);
var ieee754 = __webpack_require__(30);
var isArray = __webpack_require__(11);
exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
    ? global.TYPED_ARRAY_SUPPORT
    : typedArraySupport();
exports.kMaxLength = kMaxLength();
function typedArraySupport() {
    try {
        var arr = new Uint8Array(1);
        arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42; } };
        return arr.foo() === 42 &&
            typeof arr.subarray === 'function' &&
            arr.subarray(1, 1).byteLength === 0;
    }
    catch (e) {
        return false;
    }
}
function kMaxLength() {
    return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff;
}
function createBuffer(that, length) {
    if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length');
    }
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
    }
    else {
        if (that === null) {
            that = new Buffer(length);
        }
        that.length = length;
    }
    return that;
}
function Buffer(arg, encodingOrOffset, length) {
    if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length);
    }
    if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
            throw new Error('If encoding is specified then the first argument must be a string');
        }
        return allocUnsafe(this, arg);
    }
    return from(this, arg, encodingOrOffset, length);
}
Buffer.poolSize = 8192;
Buffer._augment = function (arr) {
    arr.__proto__ = Buffer.prototype;
    return arr;
};
function from(that, value, encodingOrOffset, length) {
    if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length);
    }
    if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset);
    }
    return fromObject(that, value);
}
Buffer.from = function (value, encodingOrOffset, length) {
    return from(null, value, encodingOrOffset, length);
};
if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
    if (typeof Symbol !== 'undefined' && Symbol.species &&
        Buffer[Symbol.species] === Buffer) {
        Object.defineProperty(Buffer, Symbol.species, {
            value: null,
            configurable: true
        });
    }
}
function assertSize(size) {
    if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number');
    }
    else if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
    }
}
function alloc(that, size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
        return createBuffer(that, size);
    }
    if (fill !== undefined) {
        return typeof encoding === 'string'
            ? createBuffer(that, size).fill(fill, encoding)
            : createBuffer(that, size).fill(fill);
    }
    return createBuffer(that, size);
}
Buffer.alloc = function (size, fill, encoding) {
    return alloc(null, size, fill, encoding);
};
function allocUnsafe(that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
            that[i] = 0;
        }
    }
    return that;
}
Buffer.allocUnsafe = function (size) {
    return allocUnsafe(null, size);
};
Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(null, size);
};
function fromString(that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
    }
    if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);
    var actual = that.write(string, encoding);
    if (actual !== length) {
        that = that.slice(0, actual);
    }
    return that;
}
function fromArrayLike(that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
    }
    return that;
}
function fromArrayBuffer(that, array, byteOffset, length) {
    array.byteLength;
    if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds');
    }
    if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds');
    }
    if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
    }
    else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
    }
    else {
        array = new Uint8Array(array, byteOffset, length);
    }
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        that = array;
        that.__proto__ = Buffer.prototype;
    }
    else {
        that = fromArrayLike(that, array);
    }
    return that;
}
function fromObject(that, obj) {
    if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);
        if (that.length === 0) {
            return that;
        }
        obj.copy(that, 0, 0, len);
        return that;
    }
    if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
            if (typeof obj.length !== 'number' || isnan(obj.length)) {
                return createBuffer(that, 0);
            }
            return fromArrayLike(that, obj);
        }
        if (obj.type === 'Buffer' && isArray(obj.data)) {
            return fromArrayLike(that, obj.data);
        }
    }
    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
}
function checked(length) {
    if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
            'size: 0x' + kMaxLength().toString(16) + ' bytes');
    }
    return length | 0;
}
function SlowBuffer(length) {
    if (+length != length) {
        length = 0;
    }
    return Buffer.alloc(+length);
}
Buffer.isBuffer = function isBuffer(b) {
    return !!(b != null && b._isBuffer);
};
Buffer.compare = function compare(a, b) {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('Arguments must be Buffers');
    }
    if (a === b)
        return 0;
    var x = a.length;
    var y = b.length;
    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
        }
    }
    if (x < y)
        return -1;
    if (y < x)
        return 1;
    return 0;
};
Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return true;
        default:
            return false;
    }
};
Buffer.concat = function concat(list, length) {
    if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
        return Buffer.alloc(0);
    }
    var i;
    if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
            length += list[i].length;
        }
    }
    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function byteLength(string, encoding) {
    if (Buffer.isBuffer(string)) {
        return string.length;
    }
    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength;
    }
    if (typeof string !== 'string') {
        string = '' + string;
    }
    var len = string.length;
    if (len === 0)
        return 0;
    var loweredCase = false;
    for (;;) {
        switch (encoding) {
            case 'ascii':
            case 'latin1':
            case 'binary':
                return len;
            case 'utf8':
            case 'utf-8':
            case undefined:
                return utf8ToBytes(string).length;
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
                return len * 2;
            case 'hex':
                return len >>> 1;
            case 'base64':
                return base64ToBytes(string).length;
            default:
                if (loweredCase)
                    return utf8ToBytes(string).length;
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer.byteLength = byteLength;
function slowToString(encoding, start, end) {
    var loweredCase = false;
    if (start === undefined || start < 0) {
        start = 0;
    }
    if (start > this.length) {
        return '';
    }
    if (end === undefined || end > this.length) {
        end = this.length;
    }
    if (end <= 0) {
        return '';
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
        return '';
    }
    if (!encoding)
        encoding = 'utf8';
    while (true) {
        switch (encoding) {
            case 'hex':
                return hexSlice(this, start, end);
            case 'utf8':
            case 'utf-8':
                return utf8Slice(this, start, end);
            case 'ascii':
                return asciiSlice(this, start, end);
            case 'latin1':
            case 'binary':
                return latin1Slice(this, start, end);
            case 'base64':
                return base64Slice(this, start, end);
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
                return utf16leSlice(this, start, end);
            default:
                if (loweredCase)
                    throw new TypeError('Unknown encoding: ' + encoding);
                encoding = (encoding + '').toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer.prototype._isBuffer = true;
function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
}
Buffer.prototype.swap16 = function swap16() {
    var len = this.length;
    if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits');
    }
    for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
    }
    return this;
};
Buffer.prototype.swap32 = function swap32() {
    var len = this.length;
    if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits');
    }
    for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
    }
    return this;
};
Buffer.prototype.swap64 = function swap64() {
    var len = this.length;
    if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits');
    }
    for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
    }
    return this;
};
Buffer.prototype.toString = function toString() {
    var length = this.length | 0;
    if (length === 0)
        return '';
    if (arguments.length === 0)
        return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
};
Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b))
        throw new TypeError('Argument must be a Buffer');
    if (this === b)
        return true;
    return Buffer.compare(this, b) === 0;
};
Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max)
            str += ' ... ';
    }
    return '<Buffer ' + str + '>';
};
Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (!Buffer.isBuffer(target)) {
        throw new TypeError('Argument must be a Buffer');
    }
    if (start === undefined) {
        start = 0;
    }
    if (end === undefined) {
        end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
        thisStart = 0;
    }
    if (thisEnd === undefined) {
        thisEnd = this.length;
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index');
    }
    if (thisStart >= thisEnd && start >= end) {
        return 0;
    }
    if (thisStart >= thisEnd) {
        return -1;
    }
    if (start >= end) {
        return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target)
        return 0;
    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);
    for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
        }
    }
    if (x < y)
        return -1;
    if (y < x)
        return 1;
    return 0;
};
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0)
        return -1;
    if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
    }
    else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
    }
    else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
        byteOffset = dir ? 0 : (buffer.length - 1);
    }
    if (byteOffset < 0)
        byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir)
            return -1;
        else
            byteOffset = buffer.length - 1;
    }
    else if (byteOffset < 0) {
        if (dir)
            byteOffset = 0;
        else
            return -1;
    }
    if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
    }
    if (Buffer.isBuffer(val)) {
        if (val.length === 0) {
            return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    }
    else if (typeof val === 'number') {
        val = val & 0xFF;
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            }
            else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }
    throw new TypeError('val must be string, number or Buffer');
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
                return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read(buf, i) {
        if (indexSize === 1) {
            return buf[i];
        }
        else {
            return buf.readUInt16BE(i * indexSize);
        }
    }
    var i;
    if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                if (foundIndex === -1)
                    foundIndex = i;
                if (i - foundIndex + 1 === valLength)
                    return foundIndex * indexSize;
            }
            else {
                if (foundIndex !== -1)
                    i -= i - foundIndex;
                foundIndex = -1;
            }
        }
    }
    else {
        if (byteOffset + valLength > arrLength)
            byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                }
            }
            if (found)
                return i;
        }
    }
    return -1;
}
Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
        length = remaining;
    }
    else {
        length = Number(length);
        if (length > remaining) {
            length = remaining;
        }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0)
        throw new TypeError('Invalid hex string');
    if (length > strLen / 2) {
        length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed))
            return i;
        buf[offset + i] = parsed;
    }
    return i;
}
function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
}
function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
    }
    else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
    }
    else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
            length = length | 0;
            if (encoding === undefined)
                encoding = 'utf8';
        }
        else {
            encoding = length;
            length = undefined;
        }
    }
    else {
        throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
    }
    var remaining = this.length - offset;
    if (length === undefined || length > remaining)
        length = remaining;
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds');
    }
    if (!encoding)
        encoding = 'utf8';
    var loweredCase = false;
    for (;;) {
        switch (encoding) {
            case 'hex':
                return hexWrite(this, string, offset, length);
            case 'utf8':
            case 'utf-8':
                return utf8Write(this, string, offset, length);
            case 'ascii':
                return asciiWrite(this, string, offset, length);
            case 'latin1':
            case 'binary':
                return latin1Write(this, string, offset, length);
            case 'base64':
                return base64Write(this, string, offset, length);
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
                return ucs2Write(this, string, offset, length);
            default:
                if (loweredCase)
                    throw new TypeError('Unknown encoding: ' + encoding);
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
        }
    }
};
Buffer.prototype.toJSON = function toJSON() {
    return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
    }
    else {
        return base64.fromByteArray(buf.slice(start, end));
    }
}
function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
            : (firstByte > 0xDF) ? 3
                : (firstByte > 0xBF) ? 2
                    : 1;
        if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
                case 1:
                    if (firstByte < 0x80) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
        }
        else if (codePoint > 0xFFFF) {
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
        }
        res.push(codePoint);
        i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
}
var MAX_ARGUMENTS_LENGTH = 0x1000;
function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
    }
    var res = '';
    var i = 0;
    while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
}
function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret;
}
function latin1Slice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
    }
    return ret;
}
function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
        start = 0;
    if (!end || end < 0 || end > len)
        end = len;
    var out = '';
    for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
    }
    return out;
}
function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
}
Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
        start += len;
        if (start < 0)
            start = 0;
    }
    else if (start > len) {
        start = len;
    }
    if (end < 0) {
        end += len;
        if (end < 0)
            end = 0;
    }
    else if (end > len) {
        end = len;
    }
    if (end < start)
        end = start;
    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
    }
    else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
            newBuf[i] = this[i + start];
        }
    }
    return newBuf;
};
function checkOffset(offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0)
        throw new RangeError('offset is not uint');
    if (offset + ext > length)
        throw new RangeError('Trying to access beyond buffer length');
}
Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
        checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
    }
    return val;
};
Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
    }
    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
    }
    return val;
};
Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 1, this.length);
    return this[offset];
};
Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8);
};
Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1];
};
Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000);
};
Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3]);
};
Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
        checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
};
Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
        checkOffset(offset, byteLength, this.length);
    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
};
Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80))
        return (this[offset]);
    return ((0xff - this[offset] + 1) * -1);
};
Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
};
Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
};
Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24);
};
Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3]);
};
Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
};
Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
};
Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
};
Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    if (!noAssert)
        checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
        throw new RangeError('Index out of range');
}
Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
};
Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
};
Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
        value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1;
};
function objectWriteUInt16(buf, value, offset, littleEndian) {
    if (value < 0)
        value = 0xffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8;
    }
}
Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
    }
    else {
        objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
};
Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
    }
    else {
        objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
};
function objectWriteUInt32(buf, value, offset, littleEndian) {
    if (value < 0)
        value = 0xffffffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
}
Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
    }
    else {
        objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
};
Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
    }
    else {
        objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
};
Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
};
Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);
        checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
};
Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
        value = Math.floor(value);
    if (value < 0)
        value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1;
};
Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
    }
    else {
        objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
};
Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
    }
    else {
        objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
};
Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
    }
    else {
        objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
};
Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
        checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0)
        value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
    }
    else {
        objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
};
function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
        throw new RangeError('Index out of range');
    if (offset < 0)
        throw new RangeError('Index out of range');
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
}
Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
};
Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
}
Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
};
Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
};
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!start)
        start = 0;
    if (!end && end !== 0)
        end = this.length;
    if (targetStart >= target.length)
        targetStart = target.length;
    if (!targetStart)
        targetStart = 0;
    if (end > 0 && end < start)
        end = start;
    if (end === start)
        return 0;
    if (target.length === 0 || this.length === 0)
        return 0;
    if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds');
    }
    if (start < 0 || start >= this.length)
        throw new RangeError('sourceStart out of bounds');
    if (end < 0)
        throw new RangeError('sourceEnd out of bounds');
    if (end > this.length)
        end = this.length;
    if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
    }
    var len = end - start;
    var i;
    if (this === target && start < targetStart && targetStart < end) {
        for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
        }
    }
    else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start];
        }
    }
    else {
        Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    }
    return len;
};
Buffer.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === 'string') {
        if (typeof start === 'string') {
            encoding = start;
            start = 0;
            end = this.length;
        }
        else if (typeof end === 'string') {
            encoding = end;
            end = this.length;
        }
        if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
                val = code;
            }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string');
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding);
        }
    }
    else if (typeof val === 'number') {
        val = val & 255;
    }
    if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index');
    }
    if (end <= start) {
        return this;
    }
    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;
    if (!val)
        val = 0;
    var i;
    if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
            this[i] = val;
        }
    }
    else {
        var bytes = Buffer.isBuffer(val)
            ? val
            : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
        }
    }
    return this;
};
var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
function base64clean(str) {
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    if (str.length < 2)
        return '';
    while (str.length % 4 !== 0) {
        str = str + '=';
    }
    return str;
}
function stringtrim(str) {
    if (str.trim)
        return str.trim();
    return str.replace(/^\s+|\s+$/g, '');
}
function toHex(n) {
    if (n < 16)
        return '0' + n.toString(16);
    return n.toString(16);
}
function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            if (!leadSurrogate) {
                if (codePoint > 0xDBFF) {
                    if ((units -= 3) > -1)
                        bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                }
                else if (i + 1 === length) {
                    if ((units -= 3) > -1)
                        bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 0xDC00) {
                if ((units -= 3) > -1)
                    bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        }
        else if (leadSurrogate) {
            if ((units -= 3) > -1)
                bytes.push(0xEF, 0xBF, 0xBD);
        }
        leadSurrogate = null;
        if (codePoint < 0x80) {
            if ((units -= 1) < 0)
                break;
            bytes.push(codePoint);
        }
        else if (codePoint < 0x800) {
            if ((units -= 2) < 0)
                break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
        }
        else if (codePoint < 0x10000) {
            if ((units -= 3) < 0)
                break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        }
        else if (codePoint < 0x110000) {
            if ((units -= 4) < 0)
                break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        }
        else {
            throw new Error('Invalid code point');
        }
    }
    return bytes;
}
function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray;
}
function utf16leToBytes(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0)
            break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length))
            break;
        dst[i + offset] = src[i];
    }
    return i;
}
function isnan(val) {
    return val !== val;
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
    module.exports = function inherits(ctor, superCtor) {
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
}
else {
    module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function () { };
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
        }
    };
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var process = module.exports = {};
var cachedSetTimeout;
var cachedClearTimeout;
function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        }
        else {
            cachedSetTimeout = defaultSetTimout;
        }
    }
    catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        }
        else {
            cachedClearTimeout = defaultClearTimeout;
        }
    }
    catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
}());
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout(fun, 0);
    }
    catch (e) {
        try {
            return cachedSetTimeout.call(null, fun, 0);
        }
        catch (e) {
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        return cachedClearTimeout(marker);
    }
    catch (e) {
        try {
            return cachedClearTimeout.call(null, marker);
        }
        catch (e) {
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    }
    else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}
function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = '';
process.versions = {};
function noop() { }
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;
process.listeners = function (name) { return []; };
process.binding = function (name) {
    throw new Error('process.binding is not supported');
};
process.cwd = function () { return '/'; };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var pna = __webpack_require__(7);
var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
        keys.push(key);
    }
    return keys;
};
module.exports = Duplex;
var util = Object.create(__webpack_require__(6));
util.inherits = __webpack_require__(3);
var Readable = __webpack_require__(15);
var Writable = __webpack_require__(19);
util.inherits(Duplex, Readable);
{
    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
        var method = keys[v];
        if (!Duplex.prototype[method])
            Duplex.prototype[method] = Writable.prototype[method];
    }
}
function Duplex(options) {
    if (!(this instanceof Duplex))
        return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options && options.readable === false)
        this.readable = false;
    if (options && options.writable === false)
        this.writable = false;
    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false)
        this.allowHalfOpen = false;
    this.once('end', onend);
}
Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
    enumerable: false,
    get: function () {
        return this._writableState.highWaterMark;
    }
});
function onend() {
    if (this.allowHalfOpen || this._writableState.ended)
        return;
    pna.nextTick(onEndNT, this);
}
function onEndNT(self) {
    self.end();
}
Object.defineProperty(Duplex.prototype, 'destroyed', {
    get: function () {
        if (this._readableState === undefined || this._writableState === undefined) {
            return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function (value) {
        if (this._readableState === undefined || this._writableState === undefined) {
            return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
    }
});
Duplex.prototype._destroy = function (err, cb) {
    this.push(null);
    this.end();
    pna.nextTick(cb, err);
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {function isArray(arg) {
    if (Array.isArray) {
        return Array.isArray(arg);
    }
    return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;
function isBoolean(arg) {
    return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;
function isNull(arg) {
    return arg === null;
}
exports.isNull = isNull;
function isNullOrUndefined(arg) {
    return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;
function isNumber(arg) {
    return typeof arg === 'number';
}
exports.isNumber = isNumber;
function isString(arg) {
    return typeof arg === 'string';
}
exports.isString = isString;
function isSymbol(arg) {
    return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;
function isUndefined(arg) {
    return arg === void 0;
}
exports.isUndefined = isUndefined;
function isRegExp(re) {
    return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;
function isDate(d) {
    return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
function isError(e) {
    return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
function isFunction(arg) {
    return typeof arg === 'function';
}
exports.isFunction = isFunction;
function isPrimitive(arg) {
    return arg === null ||
        typeof arg === 'boolean' ||
        typeof arg === 'number' ||
        typeof arg === 'string' ||
        typeof arg === 'symbol' ||
        typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;
exports.isBuffer = Buffer.isBuffer;
function objectToString(o) {
    return Object.prototype.toString.call(o);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2).Buffer))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {
if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
    module.exports = { nextTick: nextTick };
}
else {
    module.exports = process;
}
function nextTick(fn, arg1, arg2, arg3) {
    if (typeof fn !== 'function') {
        throw new TypeError('"callback" argument must be a function');
    }
    var len = arguments.length;
    var args, i;
    switch (len) {
        case 0:
        case 1:
            return process.nextTick(fn);
        case 2:
            return process.nextTick(function afterTickOne() {
                fn.call(null, arg1);
            });
        case 3:
            return process.nextTick(function afterTickTwo() {
                fn.call(null, arg1, arg2);
            });
        case 4:
            return process.nextTick(function afterTickThree() {
                fn.call(null, arg1, arg2, arg3);
            });
        default:
            args = new Array(len - 1);
            i = 0;
            while (i < args.length) {
                args[i++] = arguments[i];
            }
            return process.nextTick(function afterTick() {
                fn.apply(null, args);
            });
    }
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(4)))

/***/ }),
/* 8 */,
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var punycode = __webpack_require__(31);
var util = __webpack_require__(33);
exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;
exports.Url = Url;
function Url() {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.host = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.query = null;
    this.pathname = null;
    this.path = null;
    this.href = null;
}
var protocolPattern = /^([a-z0-9.+-]+:)/i, portPattern = /:[0-9]*$/, simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'], unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims), autoEscape = ['\''].concat(unwise), nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape), hostEndingChars = ['/', '?', '#'], hostnameMaxLen = 255, hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/, hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, unsafeProtocol = {
    'javascript': true,
    'javascript:': true
}, hostlessProtocol = {
    'javascript': true,
    'javascript:': true
}, slashedProtocol = {
    'http': true,
    'https': true,
    'ftp': true,
    'gopher': true,
    'file': true,
    'http:': true,
    'https:': true,
    'ftp:': true,
    'gopher:': true,
    'file:': true
}, querystring = __webpack_require__(34);
function urlParse(url, parseQueryString, slashesDenoteHost) {
    if (url && util.isObject(url) && url instanceof Url)
        return url;
    var u = new Url;
    u.parse(url, parseQueryString, slashesDenoteHost);
    return u;
}
Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
    if (!util.isString(url)) {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }
    var queryIndex = url.indexOf('?'), splitter = (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#', uSplit = url.split(splitter), slashRegex = /\\/g;
    uSplit[0] = uSplit[0].replace(slashRegex, '/');
    url = uSplit.join(splitter);
    var rest = url;
    rest = rest.trim();
    if (!slashesDenoteHost && url.split('#').length === 1) {
        var simplePath = simplePathPattern.exec(rest);
        if (simplePath) {
            this.path = rest;
            this.href = rest;
            this.pathname = simplePath[1];
            if (simplePath[2]) {
                this.search = simplePath[2];
                if (parseQueryString) {
                    this.query = querystring.parse(this.search.substr(1));
                }
                else {
                    this.query = this.search.substr(1);
                }
            }
            else if (parseQueryString) {
                this.search = '';
                this.query = {};
            }
            return this;
        }
    }
    var proto = protocolPattern.exec(rest);
    if (proto) {
        proto = proto[0];
        var lowerProto = proto.toLowerCase();
        this.protocol = lowerProto;
        rest = rest.substr(proto.length);
    }
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
        var slashes = rest.substr(0, 2) === '//';
        if (slashes && !(proto && hostlessProtocol[proto])) {
            rest = rest.substr(2);
            this.slashes = true;
        }
    }
    if (!hostlessProtocol[proto] &&
        (slashes || (proto && !slashedProtocol[proto]))) {
        var hostEnd = -1;
        for (var i = 0; i < hostEndingChars.length; i++) {
            var hec = rest.indexOf(hostEndingChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                hostEnd = hec;
        }
        var auth, atSign;
        if (hostEnd === -1) {
            atSign = rest.lastIndexOf('@');
        }
        else {
            atSign = rest.lastIndexOf('@', hostEnd);
        }
        if (atSign !== -1) {
            auth = rest.slice(0, atSign);
            rest = rest.slice(atSign + 1);
            this.auth = decodeURIComponent(auth);
        }
        hostEnd = -1;
        for (var i = 0; i < nonHostChars.length; i++) {
            var hec = rest.indexOf(nonHostChars[i]);
            if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                hostEnd = hec;
        }
        if (hostEnd === -1)
            hostEnd = rest.length;
        this.host = rest.slice(0, hostEnd);
        rest = rest.slice(hostEnd);
        this.parseHost();
        this.hostname = this.hostname || '';
        var ipv6Hostname = this.hostname[0] === '[' &&
            this.hostname[this.hostname.length - 1] === ']';
        if (!ipv6Hostname) {
            var hostparts = this.hostname.split(/\./);
            for (var i = 0, l = hostparts.length; i < l; i++) {
                var part = hostparts[i];
                if (!part)
                    continue;
                if (!part.match(hostnamePartPattern)) {
                    var newpart = '';
                    for (var j = 0, k = part.length; j < k; j++) {
                        if (part.charCodeAt(j) > 127) {
                            newpart += 'x';
                        }
                        else {
                            newpart += part[j];
                        }
                    }
                    if (!newpart.match(hostnamePartPattern)) {
                        var validParts = hostparts.slice(0, i);
                        var notHost = hostparts.slice(i + 1);
                        var bit = part.match(hostnamePartStart);
                        if (bit) {
                            validParts.push(bit[1]);
                            notHost.unshift(bit[2]);
                        }
                        if (notHost.length) {
                            rest = '/' + notHost.join('.') + rest;
                        }
                        this.hostname = validParts.join('.');
                        break;
                    }
                }
            }
        }
        if (this.hostname.length > hostnameMaxLen) {
            this.hostname = '';
        }
        else {
            this.hostname = this.hostname.toLowerCase();
        }
        if (!ipv6Hostname) {
            this.hostname = punycode.toASCII(this.hostname);
        }
        var p = this.port ? ':' + this.port : '';
        var h = this.hostname || '';
        this.host = h + p;
        this.href += this.host;
        if (ipv6Hostname) {
            this.hostname = this.hostname.substr(1, this.hostname.length - 2);
            if (rest[0] !== '/') {
                rest = '/' + rest;
            }
        }
    }
    if (!unsafeProtocol[lowerProto]) {
        for (var i = 0, l = autoEscape.length; i < l; i++) {
            var ae = autoEscape[i];
            if (rest.indexOf(ae) === -1)
                continue;
            var esc = encodeURIComponent(ae);
            if (esc === ae) {
                esc = escape(ae);
            }
            rest = rest.split(ae).join(esc);
        }
    }
    var hash = rest.indexOf('#');
    if (hash !== -1) {
        this.hash = rest.substr(hash);
        rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
        this.search = rest.substr(qm);
        this.query = rest.substr(qm + 1);
        if (parseQueryString) {
            this.query = querystring.parse(this.query);
        }
        rest = rest.slice(0, qm);
    }
    else if (parseQueryString) {
        this.search = '';
        this.query = {};
    }
    if (rest)
        this.pathname = rest;
    if (slashedProtocol[lowerProto] &&
        this.hostname && !this.pathname) {
        this.pathname = '/';
    }
    if (this.pathname || this.search) {
        var p = this.pathname || '';
        var s = this.search || '';
        this.path = p + s;
    }
    this.href = this.format();
    return this;
};
function urlFormat(obj) {
    if (util.isString(obj))
        obj = urlParse(obj);
    if (!(obj instanceof Url))
        return Url.prototype.format.call(obj);
    return obj.format();
}
Url.prototype.format = function () {
    var auth = this.auth || '';
    if (auth) {
        auth = encodeURIComponent(auth);
        auth = auth.replace(/%3A/i, ':');
        auth += '@';
    }
    var protocol = this.protocol || '', pathname = this.pathname || '', hash = this.hash || '', host = false, query = '';
    if (this.host) {
        host = auth + this.host;
    }
    else if (this.hostname) {
        host = auth + (this.hostname.indexOf(':') === -1 ?
            this.hostname :
            '[' + this.hostname + ']');
        if (this.port) {
            host += ':' + this.port;
        }
    }
    if (this.query &&
        util.isObject(this.query) &&
        Object.keys(this.query).length) {
        query = querystring.stringify(this.query);
    }
    var search = this.search || (query && ('?' + query)) || '';
    if (protocol && protocol.substr(-1) !== ':')
        protocol += ':';
    if (this.slashes ||
        (!protocol || slashedProtocol[protocol]) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname.charAt(0) !== '/')
            pathname = '/' + pathname;
    }
    else if (!host) {
        host = '';
    }
    if (hash && hash.charAt(0) !== '#')
        hash = '#' + hash;
    if (search && search.charAt(0) !== '?')
        search = '?' + search;
    pathname = pathname.replace(/[?#]/g, function (match) {
        return encodeURIComponent(match);
    });
    search = search.replace('#', '%23');
    return protocol + host + pathname + search + hash;
};
function urlResolve(source, relative) {
    return urlParse(source, false, true).resolve(relative);
}
Url.prototype.resolve = function (relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
};
function urlResolveObject(source, relative) {
    if (!source)
        return relative;
    return urlParse(source, false, true).resolveObject(relative);
}
Url.prototype.resolveObject = function (relative) {
    if (util.isString(relative)) {
        var rel = new Url();
        rel.parse(relative, false, true);
        relative = rel;
    }
    var result = new Url();
    var tkeys = Object.keys(this);
    for (var tk = 0; tk < tkeys.length; tk++) {
        var tkey = tkeys[tk];
        result[tkey] = this[tkey];
    }
    result.hash = relative.hash;
    if (relative.href === '') {
        result.href = result.format();
        return result;
    }
    if (relative.slashes && !relative.protocol) {
        var rkeys = Object.keys(relative);
        for (var rk = 0; rk < rkeys.length; rk++) {
            var rkey = rkeys[rk];
            if (rkey !== 'protocol')
                result[rkey] = relative[rkey];
        }
        if (slashedProtocol[result.protocol] &&
            result.hostname && !result.pathname) {
            result.path = result.pathname = '/';
        }
        result.href = result.format();
        return result;
    }
    if (relative.protocol && relative.protocol !== result.protocol) {
        if (!slashedProtocol[relative.protocol]) {
            var keys = Object.keys(relative);
            for (var v = 0; v < keys.length; v++) {
                var k = keys[v];
                result[k] = relative[k];
            }
            result.href = result.format();
            return result;
        }
        result.protocol = relative.protocol;
        if (!relative.host && !hostlessProtocol[relative.protocol]) {
            var relPath = (relative.pathname || '').split('/');
            while (relPath.length && !(relative.host = relPath.shift()))
                ;
            if (!relative.host)
                relative.host = '';
            if (!relative.hostname)
                relative.hostname = '';
            if (relPath[0] !== '')
                relPath.unshift('');
            if (relPath.length < 2)
                relPath.unshift('');
            result.pathname = relPath.join('/');
        }
        else {
            result.pathname = relative.pathname;
        }
        result.search = relative.search;
        result.query = relative.query;
        result.host = relative.host || '';
        result.auth = relative.auth;
        result.hostname = relative.hostname || relative.host;
        result.port = relative.port;
        if (result.pathname || result.search) {
            var p = result.pathname || '';
            var s = result.search || '';
            result.path = p + s;
        }
        result.slashes = result.slashes || relative.slashes;
        result.href = result.format();
        return result;
    }
    var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'), isRelAbs = (relative.host ||
        relative.pathname && relative.pathname.charAt(0) === '/'), mustEndAbs = (isRelAbs || isSourceAbs ||
        (result.host && relative.pathname)), removeAllDots = mustEndAbs, srcPath = result.pathname && result.pathname.split('/') || [], relPath = relative.pathname && relative.pathname.split('/') || [], psychotic = result.protocol && !slashedProtocol[result.protocol];
    if (psychotic) {
        result.hostname = '';
        result.port = null;
        if (result.host) {
            if (srcPath[0] === '')
                srcPath[0] = result.host;
            else
                srcPath.unshift(result.host);
        }
        result.host = '';
        if (relative.protocol) {
            relative.hostname = null;
            relative.port = null;
            if (relative.host) {
                if (relPath[0] === '')
                    relPath[0] = relative.host;
                else
                    relPath.unshift(relative.host);
            }
            relative.host = null;
        }
        mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
    }
    if (isRelAbs) {
        result.host = (relative.host || relative.host === '') ?
            relative.host : result.host;
        result.hostname = (relative.hostname || relative.hostname === '') ?
            relative.hostname : result.hostname;
        result.search = relative.search;
        result.query = relative.query;
        srcPath = relPath;
    }
    else if (relPath.length) {
        if (!srcPath)
            srcPath = [];
        srcPath.pop();
        srcPath = srcPath.concat(relPath);
        result.search = relative.search;
        result.query = relative.query;
    }
    else if (!util.isNullOrUndefined(relative.search)) {
        if (psychotic) {
            result.hostname = result.host = srcPath.shift();
            var authInHost = result.host && result.host.indexOf('@') > 0 ?
                result.host.split('@') : false;
            if (authInHost) {
                result.auth = authInHost.shift();
                result.host = result.hostname = authInHost.shift();
            }
        }
        result.search = relative.search;
        result.query = relative.query;
        if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
            result.path = (result.pathname ? result.pathname : '') +
                (result.search ? result.search : '');
        }
        result.href = result.format();
        return result;
    }
    if (!srcPath.length) {
        result.pathname = null;
        if (result.search) {
            result.path = '/' + result.search;
        }
        else {
            result.path = null;
        }
        result.href = result.format();
        return result;
    }
    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = ((result.host || relative.host || srcPath.length > 1) &&
        (last === '.' || last === '..') || last === '');
    var up = 0;
    for (var i = srcPath.length; i >= 0; i--) {
        last = srcPath[i];
        if (last === '.') {
            srcPath.splice(i, 1);
        }
        else if (last === '..') {
            srcPath.splice(i, 1);
            up++;
        }
        else if (up) {
            srcPath.splice(i, 1);
            up--;
        }
    }
    if (!mustEndAbs && !removeAllDots) {
        for (; up--; up) {
            srcPath.unshift('..');
        }
    }
    if (mustEndAbs && srcPath[0] !== '' &&
        (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
        srcPath.unshift('');
    }
    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
        srcPath.push('');
    }
    var isAbsolute = srcPath[0] === '' ||
        (srcPath[0] && srcPath[0].charAt(0) === '/');
    if (psychotic) {
        result.hostname = result.host = isAbsolute ? '' :
            srcPath.length ? srcPath.shift() : '';
        var authInHost = result.host && result.host.indexOf('@') > 0 ?
            result.host.split('@') : false;
        if (authInHost) {
            result.auth = authInHost.shift();
            result.host = result.hostname = authInHost.shift();
        }
    }
    mustEndAbs = mustEndAbs || (result.host && srcPath.length);
    if (mustEndAbs && !isAbsolute) {
        srcPath.unshift('');
    }
    if (!srcPath.length) {
        result.pathname = null;
        result.path = null;
    }
    else {
        result.pathname = srcPath.join('/');
    }
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
        result.path = (result.pathname ? result.pathname : '') +
            (result.search ? result.search : '');
    }
    result.auth = relative.auth || result.auth;
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
};
Url.prototype.parseHost = function () {
    var host = this.host;
    var port = portPattern.exec(host);
    if (port) {
        port = port[0];
        if (port !== ':') {
            this.port = port.substr(1);
        }
        host = host.substr(0, host.length - port.length);
    }
    if (host)
        this.hostname = host;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var buffer = __webpack_require__(2);
var Buffer = buffer.Buffer;
function copyProps(src, dst) {
    for (var key in src) {
        dst[key] = src[key];
    }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
    module.exports = buffer;
}
else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
}
function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
}
copyProps(Buffer, SafeBuffer);
SafeBuffer.from = function (arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
        throw new TypeError('Argument must not be a number');
    }
    return Buffer(arg, encodingOrOffset, length);
};
SafeBuffer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    var buf = Buffer(size);
    if (fill !== undefined) {
        if (typeof encoding === 'string') {
            buf.fill(fill, encoding);
        }
        else {
            buf.fill(fill);
        }
    }
    else {
        buf.fill(0);
    }
    return buf;
};
SafeBuffer.allocUnsafe = function (size) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    return Buffer(size);
};
SafeBuffer.allocUnsafeSlow = function (size) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    return buffer.SlowBuffer(size);
};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

var toString = {}.toString;
module.exports = Array.isArray || function (arr) {
    return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream);
exports.writableStream = isFunction(global.WritableStream);
exports.abortController = isFunction(global.AbortController);
exports.blobConstructor = false;
try {
    new Blob([new ArrayBuffer(1)]);
    exports.blobConstructor = true;
}
catch (e) { }
var xhr;
function getXHR() {
    if (xhr !== undefined)
        return xhr;
    if (global.XMLHttpRequest) {
        xhr = new global.XMLHttpRequest();
        try {
            xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com');
        }
        catch (e) {
            xhr = null;
        }
    }
    else {
        xhr = null;
    }
    return xhr;
}
function checkTypeSupport(type) {
    var xhr = getXHR();
    if (!xhr)
        return false;
    try {
        xhr.responseType = type;
        return xhr.responseType === type;
    }
    catch (e) { }
    return false;
}
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined';
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice);
exports.arraybuffer = exports.fetch || (haveArrayBuffer && checkTypeSupport('arraybuffer'));
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream');
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
    checkTypeSupport('moz-chunked-arraybuffer');
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false);
exports.vbArray = isFunction(global.VBArray);
function isFunction(value) {
    return typeof value === 'function';
}
xhr = null;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, Buffer, global) {var capability = __webpack_require__(12);
var inherits = __webpack_require__(3);
var stream = __webpack_require__(14);
var rStates = exports.readyStates = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
};
var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode, fetchTimer) {
    var self = this;
    stream.Readable.call(self);
    self._mode = mode;
    self.headers = {};
    self.rawHeaders = [];
    self.trailers = {};
    self.rawTrailers = [];
    self.on('end', function () {
        process.nextTick(function () {
            self.emit('close');
        });
    });
    if (mode === 'fetch') {
        self._fetchResponse = response;
        self.url = response.url;
        self.statusCode = response.status;
        self.statusMessage = response.statusText;
        response.headers.forEach(function (header, key) {
            self.headers[key.toLowerCase()] = header;
            self.rawHeaders.push(key, header);
        });
        if (capability.writableStream) {
            var writable = new WritableStream({
                write: function (chunk) {
                    return new Promise(function (resolve, reject) {
                        if (self._destroyed) {
                            reject();
                        }
                        else if (self.push(new Buffer(chunk))) {
                            resolve();
                        }
                        else {
                            self._resumeFetch = resolve;
                        }
                    });
                },
                close: function () {
                    global.clearTimeout(fetchTimer);
                    if (!self._destroyed)
                        self.push(null);
                },
                abort: function (err) {
                    if (!self._destroyed)
                        self.emit('error', err);
                }
            });
            try {
                response.body.pipeTo(writable).catch(function (err) {
                    global.clearTimeout(fetchTimer);
                    if (!self._destroyed)
                        self.emit('error', err);
                });
                return;
            }
            catch (e) { }
        }
        var reader = response.body.getReader();
        function read() {
            reader.read().then(function (result) {
                if (self._destroyed)
                    return;
                if (result.done) {
                    global.clearTimeout(fetchTimer);
                    self.push(null);
                    return;
                }
                self.push(new Buffer(result.value));
                read();
            }).catch(function (err) {
                global.clearTimeout(fetchTimer);
                if (!self._destroyed)
                    self.emit('error', err);
            });
        }
        read();
    }
    else {
        self._xhr = xhr;
        self._pos = 0;
        self.url = xhr.responseURL;
        self.statusCode = xhr.status;
        self.statusMessage = xhr.statusText;
        var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
        headers.forEach(function (header) {
            var matches = header.match(/^([^:]+):\s*(.*)/);
            if (matches) {
                var key = matches[1].toLowerCase();
                if (key === 'set-cookie') {
                    if (self.headers[key] === undefined) {
                        self.headers[key] = [];
                    }
                    self.headers[key].push(matches[2]);
                }
                else if (self.headers[key] !== undefined) {
                    self.headers[key] += ', ' + matches[2];
                }
                else {
                    self.headers[key] = matches[2];
                }
                self.rawHeaders.push(matches[1], matches[2]);
            }
        });
        self._charset = 'x-user-defined';
        if (!capability.overrideMimeType) {
            var mimeType = self.rawHeaders['mime-type'];
            if (mimeType) {
                var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);
                if (charsetMatch) {
                    self._charset = charsetMatch[1].toLowerCase();
                }
            }
            if (!self._charset)
                self._charset = 'utf-8';
        }
    }
};
inherits(IncomingMessage, stream.Readable);
IncomingMessage.prototype._read = function () {
    var self = this;
    var resolve = self._resumeFetch;
    if (resolve) {
        self._resumeFetch = null;
        resolve();
    }
};
IncomingMessage.prototype._onXHRProgress = function () {
    var self = this;
    var xhr = self._xhr;
    var response = null;
    switch (self._mode) {
        case 'text:vbarray':
            if (xhr.readyState !== rStates.DONE)
                break;
            try {
                response = new global.VBArray(xhr.responseBody).toArray();
            }
            catch (e) { }
            if (response !== null) {
                self.push(new Buffer(response));
                break;
            }
        case 'text':
            try {
                response = xhr.responseText;
            }
            catch (e) {
                self._mode = 'text:vbarray';
                break;
            }
            if (response.length > self._pos) {
                var newData = response.substr(self._pos);
                if (self._charset === 'x-user-defined') {
                    var buffer = new Buffer(newData.length);
                    for (var i = 0; i < newData.length; i++)
                        buffer[i] = newData.charCodeAt(i) & 0xff;
                    self.push(buffer);
                }
                else {
                    self.push(newData, self._charset);
                }
                self._pos = response.length;
            }
            break;
        case 'arraybuffer':
            if (xhr.readyState !== rStates.DONE || !xhr.response)
                break;
            response = xhr.response;
            self.push(new Buffer(new Uint8Array(response)));
            break;
        case 'moz-chunked-arraybuffer':
            response = xhr.response;
            if (xhr.readyState !== rStates.LOADING || !response)
                break;
            self.push(new Buffer(new Uint8Array(response)));
            break;
        case 'ms-stream':
            response = xhr.response;
            if (xhr.readyState !== rStates.LOADING)
                break;
            var reader = new global.MSStreamReader();
            reader.onprogress = function () {
                if (reader.result.byteLength > self._pos) {
                    self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
                    self._pos = reader.result.byteLength;
                }
            };
            reader.onload = function () {
                self.push(null);
            };
            reader.readAsArrayBuffer(response);
            break;
    }
    if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
        self.push(null);
    }
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(4), __webpack_require__(2).Buffer, __webpack_require__(0)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(15);
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(19);
exports.Duplex = __webpack_require__(5);
exports.Transform = __webpack_require__(21);
exports.PassThrough = __webpack_require__(47);


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {
var pna = __webpack_require__(7);
module.exports = Readable;
var isArray = __webpack_require__(11);
var Duplex;
Readable.ReadableState = ReadableState;
var EE = __webpack_require__(16).EventEmitter;
var EElistenerCount = function (emitter, type) {
    return emitter.listeners(type).length;
};
var Stream = __webpack_require__(17);
var Buffer = __webpack_require__(10).Buffer;
var OurUint8Array = global.Uint8Array || function () { };
function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk);
}
function _isUint8Array(obj) {
    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var util = Object.create(__webpack_require__(6));
util.inherits = __webpack_require__(3);
var debugUtil = __webpack_require__(40);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog('stream');
}
else {
    debug = function () { };
}
var BufferList = __webpack_require__(41);
var destroyImpl = __webpack_require__(18);
var StringDecoder;
util.inherits(Readable, Stream);
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === 'function')
        return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
        emitter.on(event, fn);
    else if (isArray(emitter._events[event]))
        emitter._events[event].unshift(fn);
    else
        emitter._events[event] = [fn, emitter._events[event]];
}
function ReadableState(options, stream) {
    Duplex = Duplex || __webpack_require__(5);
    options = options || {};
    var isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
        this.objectMode = this.objectMode || !!options.readableObjectMode;
    var hwm = options.highWaterMark;
    var readableHwm = options.readableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0)
        this.highWaterMark = hwm;
    else if (isDuplex && (readableHwm || readableHwm === 0))
        this.highWaterMark = readableHwm;
    else
        this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.buffer = new BufferList();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || 'utf8';
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
        if (!StringDecoder)
            StringDecoder = __webpack_require__(20).StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
    }
}
function Readable(options) {
    Duplex = Duplex || __webpack_require__(5);
    if (!(this instanceof Readable))
        return new Readable(options);
    this._readableState = new ReadableState(options, this);
    this.readable = true;
    if (options) {
        if (typeof options.read === 'function')
            this._read = options.read;
        if (typeof options.destroy === 'function')
            this._destroy = options.destroy;
    }
    Stream.call(this);
}
Object.defineProperty(Readable.prototype, 'destroyed', {
    get: function () {
        if (this._readableState === undefined) {
            return false;
        }
        return this._readableState.destroyed;
    },
    set: function (value) {
        if (!this._readableState) {
            return;
        }
        this._readableState.destroyed = value;
    }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
    this.push(null);
    cb(err);
};
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
    }
    else {
        skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};
Readable.prototype.unshift = function (chunk) {
    return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    var state = stream._readableState;
    if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
    }
    else {
        var er;
        if (!skipChunkCheck)
            er = chunkInvalid(state, chunk);
        if (er) {
            stream.emit('error', er);
        }
        else if (state.objectMode || chunk && chunk.length > 0) {
            if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
                chunk = _uint8ArrayToBuffer(chunk);
            }
            if (addToFront) {
                if (state.endEmitted)
                    stream.emit('error', new Error('stream.unshift() after end event'));
                else
                    addChunk(stream, state, chunk, true);
            }
            else if (state.ended) {
                stream.emit('error', new Error('stream.push() after EOF'));
            }
            else {
                state.reading = false;
                if (state.decoder && !encoding) {
                    chunk = state.decoder.write(chunk);
                    if (state.objectMode || chunk.length !== 0)
                        addChunk(stream, state, chunk, false);
                    else
                        maybeReadMore(stream, state);
                }
                else {
                    addChunk(stream, state, chunk, false);
                }
            }
        }
        else if (!addToFront) {
            state.reading = false;
        }
    }
    return needMoreData(state);
}
function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk);
        stream.read(0);
    }
    else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
            state.buffer.unshift(chunk);
        else
            state.buffer.push(chunk);
        if (state.needReadable)
            emitReadable(stream);
    }
    maybeReadMore(stream, state);
}
function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
        er = new TypeError('Invalid non-string/buffer chunk');
    }
    return er;
}
function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}
Readable.prototype.isPaused = function () {
    return this._readableState.flowing === false;
};
Readable.prototype.setEncoding = function (enc) {
    if (!StringDecoder)
        StringDecoder = __webpack_require__(20).StringDecoder;
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
};
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
        n = MAX_HWM;
    }
    else {
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
function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
        return 0;
    if (state.objectMode)
        return 1;
    if (n !== n) {
        if (state.flowing && state.length)
            return state.buffer.head.data.length;
        else
            return state.length;
    }
    if (n > state.highWaterMark)
        state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length)
        return n;
    if (!state.ended) {
        state.needReadable = true;
        return 0;
    }
    return state.length;
}
Readable.prototype.read = function (n) {
    debug('read', n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0)
        state.emittedReadable = false;
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug('read: emitReadable', state.length, state.ended);
        if (state.length === 0 && state.ended)
            endReadable(this);
        else
            emitReadable(this);
        return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
        if (state.length === 0)
            endReadable(this);
        return null;
    }
    var doRead = state.needReadable;
    debug('need readable', doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug('length less than watermark', doRead);
    }
    if (state.ended || state.reading) {
        doRead = false;
        debug('reading or ended', doRead);
    }
    else if (doRead) {
        debug('do read');
        state.reading = true;
        state.sync = true;
        if (state.length === 0)
            state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading)
            n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0)
        ret = fromList(n, state);
    else
        ret = null;
    if (ret === null) {
        state.needReadable = true;
        n = 0;
    }
    else {
        state.length -= n;
    }
    if (state.length === 0) {
        if (!state.ended)
            state.needReadable = true;
        if (nOrig !== n && state.ended)
            endReadable(this);
    }
    if (ret !== null)
        this.emit('data', ret);
    return ret;
};
function onEofChunk(stream, state) {
    if (state.ended)
        return;
    if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
            state.buffer.push(chunk);
            state.length += state.objectMode ? 1 : chunk.length;
        }
    }
    state.ended = true;
    emitReadable(stream);
}
function emitReadable(stream) {
    var state = stream._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
        debug('emitReadable', state.flowing);
        state.emittedReadable = true;
        if (state.sync)
            pna.nextTick(emitReadable_, stream);
        else
            emitReadable_(stream);
    }
}
function emitReadable_(stream) {
    debug('emit readable');
    stream.emit('readable');
    flow(stream);
}
function maybeReadMore(stream, state) {
    if (!state.readingMore) {
        state.readingMore = true;
        pna.nextTick(maybeReadMore_, stream, state);
    }
}
function maybeReadMore_(stream, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug('maybeReadMore read 0');
        stream.read(0);
        if (len === state.length)
            break;
        else
            len = state.length;
    }
    state.readingMore = false;
}
Readable.prototype._read = function (n) {
    this.emit('error', new Error('_read() is not implemented'));
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
    if (state.endEmitted)
        pna.nextTick(endFn);
    else
        src.once('end', endFn);
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
    var ondrain = pipeOnDrain(src);
    dest.on('drain', ondrain);
    var cleanedUp = false;
    function cleanup() {
        debug('cleanup');
        dest.removeListener('close', onclose);
        dest.removeListener('finish', onfinish);
        dest.removeListener('drain', ondrain);
        dest.removeListener('error', onerror);
        dest.removeListener('unpipe', onunpipe);
        src.removeListener('end', onend);
        src.removeListener('end', unpipe);
        src.removeListener('data', ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
            ondrain();
    }
    var increasedAwaitDrain = false;
    src.on('data', ondata);
    function ondata(chunk) {
        debug('ondata');
        increasedAwaitDrain = false;
        var ret = dest.write(chunk);
        if (false === ret && !increasedAwaitDrain) {
            if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                debug('false write response, pause', src._readableState.awaitDrain);
                src._readableState.awaitDrain++;
                increasedAwaitDrain = true;
            }
            src.pause();
        }
    }
    function onerror(er) {
        debug('onerror', er);
        unpipe();
        dest.removeListener('error', onerror);
        if (EElistenerCount(dest, 'error') === 0)
            dest.emit('error', er);
    }
    prependListener(dest, 'error', onerror);
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
    dest.emit('pipe', src);
    if (!state.flowing) {
        debug('pipe resume');
        src.resume();
    }
    return dest;
};
function pipeOnDrain(src) {
    return function () {
        var state = src._readableState;
        debug('pipeOnDrain', state.awaitDrain);
        if (state.awaitDrain)
            state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
            state.flowing = true;
            flow(src);
        }
    };
}
Readable.prototype.unpipe = function (dest) {
    var state = this._readableState;
    var unpipeInfo = { hasUnpiped: false };
    if (state.pipesCount === 0)
        return this;
    if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes)
            return this;
        if (!dest)
            dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest)
            dest.emit('unpipe', this, unpipeInfo);
        return this;
    }
    if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) {
            dests[i].emit('unpipe', this, unpipeInfo);
        }
        return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1)
        return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
        state.pipes = state.pipes[0];
    dest.emit('unpipe', this, unpipeInfo);
    return this;
};
Readable.prototype.on = function (ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    if (ev === 'data') {
        if (this._readableState.flowing !== false)
            this.resume();
    }
    else if (ev === 'readable') {
        var state = this._readableState;
        if (!state.endEmitted && !state.readableListening) {
            state.readableListening = state.needReadable = true;
            state.emittedReadable = false;
            if (!state.reading) {
                pna.nextTick(nReadingNextTick, this);
            }
            else if (state.length) {
                emitReadable(this);
            }
        }
    }
    return res;
};
Readable.prototype.addListener = Readable.prototype.on;
function nReadingNextTick(self) {
    debug('readable nexttick read 0');
    self.read(0);
}
Readable.prototype.resume = function () {
    var state = this._readableState;
    if (!state.flowing) {
        debug('resume');
        state.flowing = true;
        resume(this, state);
    }
    return this;
};
function resume(stream, state) {
    if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        pna.nextTick(resume_, stream, state);
    }
}
function resume_(stream, state) {
    if (!state.reading) {
        debug('resume read 0');
        stream.read(0);
    }
    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream.emit('resume');
    flow(stream);
    if (state.flowing && !state.reading)
        stream.read(0);
}
Readable.prototype.pause = function () {
    debug('call pause flowing=%j', this._readableState.flowing);
    if (false !== this._readableState.flowing) {
        debug('pause');
        this._readableState.flowing = false;
        this.emit('pause');
    }
    return this;
};
function flow(stream) {
    var state = stream._readableState;
    debug('flow', state.flowing);
    while (state.flowing && stream.read() !== null) { }
}
Readable.prototype.wrap = function (stream) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream.on('end', function () {
        debug('wrapped end');
        if (state.decoder && !state.ended) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length)
                _this.push(chunk);
        }
        _this.push(null);
    });
    stream.on('data', function (chunk) {
        debug('wrapped data');
        if (state.decoder)
            chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === undefined))
            return;
        else if (!state.objectMode && (!chunk || !chunk.length))
            return;
        var ret = _this.push(chunk);
        if (!ret) {
            paused = true;
            stream.pause();
        }
    });
    for (var i in stream) {
        if (this[i] === undefined && typeof stream[i] === 'function') {
            this[i] = function (method) {
                return function () {
                    return stream[method].apply(stream, arguments);
                };
            }(i);
        }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function (n) {
        debug('wrapped _read', n);
        if (paused) {
            paused = false;
            stream.resume();
        }
    };
    return this;
};
Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
    enumerable: false,
    get: function () {
        return this._readableState.highWaterMark;
    }
});
Readable._fromList = fromList;
function fromList(n, state) {
    if (state.length === 0)
        return null;
    var ret;
    if (state.objectMode)
        ret = state.buffer.shift();
    else if (!n || n >= state.length) {
        if (state.decoder)
            ret = state.buffer.join('');
        else if (state.buffer.length === 1)
            ret = state.buffer.head.data;
        else
            ret = state.buffer.concat(state.length);
        state.buffer.clear();
    }
    else {
        ret = fromListPartial(n, state.buffer, state.decoder);
    }
    return ret;
}
function fromListPartial(n, list, hasStrings) {
    var ret;
    if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n);
        list.head.data = list.head.data.slice(n);
    }
    else if (n === list.head.data.length) {
        ret = list.shift();
    }
    else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
    }
    return ret;
}
function copyFromBufferString(n, list) {
    var p = list.head;
    var c = 1;
    var ret = p.data;
    n -= ret.length;
    while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length)
            ret += str;
        else
            ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
            if (nb === str.length) {
                ++c;
                if (p.next)
                    list.head = p.next;
                else
                    list.head = list.tail = null;
            }
            else {
                list.head = p;
                p.data = str.slice(nb);
            }
            break;
        }
        ++c;
    }
    list.length -= c;
    return ret;
}
function copyFromBuffer(n, list) {
    var ret = Buffer.allocUnsafe(n);
    var p = list.head;
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
                if (p.next)
                    list.head = p.next;
                else
                    list.head = list.tail = null;
            }
            else {
                list.head = p;
                p.data = buf.slice(nb);
            }
            break;
        }
        ++c;
    }
    list.length -= c;
    return ret;
}
function endReadable(stream) {
    var state = stream._readableState;
    if (state.length > 0)
        throw new Error('"endReadable()" called on non-empty stream');
    if (!state.endEmitted) {
        state.ended = true;
        pna.nextTick(endReadableNT, state, stream);
    }
}
function endReadableNT(state, stream) {
    if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
    }
}
function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x)
            return i;
    }
    return -1;
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0), __webpack_require__(4)))

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
    ? R.apply
    : function ReflectApply(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
    };
var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
    ReflectOwnKeys = R.ownKeys;
}
else if (Object.getOwnPropertySymbols) {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
        return Object.getOwnPropertyNames(target)
            .concat(Object.getOwnPropertySymbols(target));
    };
}
else {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
        return Object.getOwnPropertyNames(target);
    };
}
function ProcessEmitWarning(warning) {
    if (console && console.warn)
        console.warn(warning);
}
var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
    return value !== value;
};
function EventEmitter() {
    EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;
var defaultMaxListeners = 10;
function checkListener(listener) {
    if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
    }
}
Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function () {
        return defaultMaxListeners;
    },
    set: function (arg) {
        if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
        }
        defaultMaxListeners = arg;
    }
});
EventEmitter.init = function () {
    if (this._events === undefined ||
        this._events === Object.getPrototypeOf(this)._events) {
        this._events = Object.create(null);
        this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || undefined;
};
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
};
function _getMaxListeners(that) {
    if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
}
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
};
EventEmitter.prototype.emit = function emit(type) {
    var args = [];
    for (var i = 1; i < arguments.length; i++)
        args.push(arguments[i]);
    var doError = (type === 'error');
    var events = this._events;
    if (events !== undefined)
        doError = (doError && events.error === undefined);
    else if (!doError)
        return false;
    if (doError) {
        var er;
        if (args.length > 0)
            er = args[0];
        if (er instanceof Error) {
            throw er;
        }
        var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
        err.context = er;
        throw err;
    }
    var handler = events[type];
    if (handler === undefined)
        return false;
    if (typeof handler === 'function') {
        ReflectApply(handler, this, args);
    }
    else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
            ReflectApply(listeners[i], this, args);
    }
    return true;
};
function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;
    checkListener(listener);
    events = target._events;
    if (events === undefined) {
        events = target._events = Object.create(null);
        target._eventsCount = 0;
    }
    else {
        if (events.newListener !== undefined) {
            target.emit('newListener', type, listener.listener ? listener.listener : listener);
            events = target._events;
        }
        existing = events[type];
    }
    if (existing === undefined) {
        existing = events[type] = listener;
        ++target._eventsCount;
    }
    else {
        if (typeof existing === 'function') {
            existing = events[type] =
                prepend ? [listener, existing] : [existing, listener];
        }
        else if (prepend) {
            existing.unshift(listener);
        }
        else {
            existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' +
                existing.length + ' ' + String(type) + ' listeners ' +
                'added. Use emitter.setMaxListeners() to ' +
                'increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
        }
    }
    return target;
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
    };
function onceWrapper() {
    if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
            return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
    }
}
function _onceWrap(target, type, listener) {
    var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
    var wrapped = onceWrapper.bind(state);
    wrapped.listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
}
EventEmitter.prototype.once = function once(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
};
EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
    };
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
        var list, events, position, i, originalListener;
        checkListener(listener);
        events = this._events;
        if (events === undefined)
            return this;
        list = events[type];
        if (list === undefined)
            return this;
        if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0)
                this._events = Object.create(null);
            else {
                delete events[type];
                if (events.removeListener)
                    this.emit('removeListener', type, list.listener || listener);
            }
        }
        else if (typeof list !== 'function') {
            position = -1;
            for (i = list.length - 1; i >= 0; i--) {
                if (list[i] === listener || list[i].listener === listener) {
                    originalListener = list[i].listener;
                    position = i;
                    break;
                }
            }
            if (position < 0)
                return this;
            if (position === 0)
                list.shift();
            else {
                spliceOne(list, position);
            }
            if (list.length === 1)
                events[type] = list[0];
            if (events.removeListener !== undefined)
                this.emit('removeListener', type, originalListener || listener);
        }
        return this;
    };
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
        var listeners, events, i;
        events = this._events;
        if (events === undefined)
            return this;
        if (events.removeListener === undefined) {
            if (arguments.length === 0) {
                this._events = Object.create(null);
                this._eventsCount = 0;
            }
            else if (events[type] !== undefined) {
                if (--this._eventsCount === 0)
                    this._events = Object.create(null);
                else
                    delete events[type];
            }
            return this;
        }
        if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i = 0; i < keys.length; ++i) {
                key = keys[i];
                if (key === 'removeListener')
                    continue;
                this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
        }
        listeners = events[type];
        if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
        }
        else if (listeners !== undefined) {
            for (i = listeners.length - 1; i >= 0; i--) {
                this.removeListener(type, listeners[i]);
            }
        }
        return this;
    };
function _listeners(target, type, unwrap) {
    var events = target._events;
    if (events === undefined)
        return [];
    var evlistener = events[type];
    if (evlistener === undefined)
        return [];
    if (typeof evlistener === 'function')
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
    return unwrap ?
        unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}
EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
};
EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
};
EventEmitter.listenerCount = function (emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
    }
    else {
        return listenerCount.call(emitter, type);
    }
};
EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
    var events = this._events;
    if (events !== undefined) {
        var evlistener = events[type];
        if (typeof evlistener === 'function') {
            return 1;
        }
        else if (evlistener !== undefined) {
            return evlistener.length;
        }
    }
    return 0;
}
EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};
function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
    return copy;
}
function spliceOne(list, index) {
    for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
    list.pop();
}
function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
    }
    return ret;
}
function once(emitter, name) {
    return new Promise(function (resolve, reject) {
        function errorListener(err) {
            emitter.removeListener(name, resolver);
            reject(err);
        }
        function resolver() {
            if (typeof emitter.removeListener === 'function') {
                emitter.removeListener('error', errorListener);
            }
            resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== 'error') {
            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
    });
}
function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
    if (typeof emitter.on === 'function') {
        eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
    }
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
    if (typeof emitter.on === 'function') {
        if (flags.once) {
            emitter.once(name, listener);
        }
        else {
            emitter.on(name, listener);
        }
    }
    else if (typeof emitter.addEventListener === 'function') {
        emitter.addEventListener(name, function wrapListener(arg) {
            if (flags.once) {
                emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
        });
    }
    else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
    }
}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(16).EventEmitter;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var pna = __webpack_require__(7);
function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
        if (cb) {
            cb(err);
        }
        else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
            pna.nextTick(emitErrorNT, this, err);
        }
        return this;
    }
    if (this._readableState) {
        this._readableState.destroyed = true;
    }
    if (this._writableState) {
        this._writableState.destroyed = true;
    }
    this._destroy(err || null, function (err) {
        if (!cb && err) {
            pna.nextTick(emitErrorNT, _this, err);
            if (_this._writableState) {
                _this._writableState.errorEmitted = true;
            }
        }
        else if (cb) {
            cb(err);
        }
    });
    return this;
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
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
    }
}
function emitErrorNT(self, err) {
    self.emit('error', err);
}
module.exports = {
    destroy: destroy,
    undestroy: undestroy
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate, global) {
var pna = __webpack_require__(7);
module.exports = Writable;
function WriteReq(chunk, encoding, cb) {
    this.chunk = chunk;
    this.encoding = encoding;
    this.callback = cb;
    this.next = null;
}
function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function () {
        onCorkedFinish(_this, state);
    };
}
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
var Duplex;
Writable.WritableState = WritableState;
var util = Object.create(__webpack_require__(6));
util.inherits = __webpack_require__(3);
var internalUtil = {
    deprecate: __webpack_require__(45)
};
var Stream = __webpack_require__(17);
var Buffer = __webpack_require__(10).Buffer;
var OurUint8Array = global.Uint8Array || function () { };
function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk);
}
function _isUint8Array(obj) {
    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var destroyImpl = __webpack_require__(18);
util.inherits(Writable, Stream);
function nop() { }
function WritableState(options, stream) {
    Duplex = Duplex || __webpack_require__(5);
    options = options || {};
    var isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
        this.objectMode = this.objectMode || !!options.writableObjectMode;
    var hwm = options.highWaterMark;
    var writableHwm = options.writableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0)
        this.highWaterMark = hwm;
    else if (isDuplex && (writableHwm || writableHwm === 0))
        this.highWaterMark = writableHwm;
    else
        this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || 'utf8';
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function (er) {
        onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.bufferedRequestCount = 0;
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
            get: internalUtil.deprecate(function () {
                return this.getBuffer();
            }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
        });
    }
    catch (_) { }
})();
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function (object) {
            if (realHasInstance.call(this, object))
                return true;
            if (this !== Writable)
                return false;
            return object && object._writableState instanceof WritableState;
        }
    });
}
else {
    realHasInstance = function (object) {
        return object instanceof this;
    };
}
function Writable(options) {
    Duplex = Duplex || __webpack_require__(5);
    if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options);
    }
    this._writableState = new WritableState(options, this);
    this.writable = true;
    if (options) {
        if (typeof options.write === 'function')
            this._write = options.write;
        if (typeof options.writev === 'function')
            this._writev = options.writev;
        if (typeof options.destroy === 'function')
            this._destroy = options.destroy;
        if (typeof options.final === 'function')
            this._final = options.final;
    }
    Stream.call(this);
}
Writable.prototype.pipe = function () {
    this.emit('error', new Error('Cannot pipe, not readable'));
};
function writeAfterEnd(stream, cb) {
    var er = new Error('write after end');
    stream.emit('error', er);
    pna.nextTick(cb, er);
}
function validChunk(stream, state, chunk, cb) {
    var valid = true;
    var er = false;
    if (chunk === null) {
        er = new TypeError('May not write null values to stream');
    }
    else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
        er = new TypeError('Invalid non-string/buffer chunk');
    }
    if (er) {
        stream.emit('error', er);
        pna.nextTick(cb, er);
        valid = false;
    }
    return valid;
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
    if (isBuf)
        encoding = 'buffer';
    else if (!encoding)
        encoding = state.defaultEncoding;
    if (typeof cb !== 'function')
        cb = nop;
    if (state.ended)
        writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
};
Writable.prototype.cork = function () {
    var state = this._writableState;
    state.corked++;
};
Writable.prototype.uncork = function () {
    var state = this._writableState;
    if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest)
            clearBuffer(this, state);
    }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === 'string')
        encoding = encoding.toLowerCase();
    if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1))
        throw new TypeError('Unknown encoding: ' + encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
};
function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
        chunk = Buffer.from(chunk, encoding);
    }
    return chunk;
}
Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
    enumerable: false,
    get: function () {
        return this._writableState.highWaterMark;
    }
});
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
    if (!ret)
        state.needDrain = true;
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
        }
        else {
            state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
    }
    else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev)
        stream._writev(chunk, state.onwrite);
    else
        stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
}
function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
        pna.nextTick(cb, er);
        pna.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        stream.emit('error', er);
    }
    else {
        cb(er);
        stream._writableState.errorEmitted = true;
        stream.emit('error', er);
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
    onwriteStateUpdate(state);
    if (er)
        onwriteError(stream, state, sync, er, cb);
    else {
        var finished = needFinish(state);
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
            clearBuffer(stream, state);
        }
        if (sync) {
            asyncWrite(afterWrite, stream, state, finished, cb);
        }
        else {
            afterWrite(stream, state, finished, cb);
        }
    }
}
function afterWrite(stream, state, finished, cb) {
    if (!finished)
        onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
}
function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit('drain');
    }
}
function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
            buffer[count] = entry;
            if (!entry.isBuf)
                allBuffers = false;
            entry = entry.next;
            count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, '', holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
            state.corkedRequestsFree = holder.next;
            holder.next = null;
        }
        else {
            state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
    }
    else {
        while (entry) {
            var chunk = entry.chunk;
            var encoding = entry.encoding;
            var cb = entry.callback;
            var len = state.objectMode ? 1 : chunk.length;
            doWrite(stream, state, false, len, chunk, encoding, cb);
            entry = entry.next;
            state.bufferedRequestCount--;
            if (state.writing) {
                break;
            }
        }
        if (entry === null)
            state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
    cb(new Error('_write() is not implemented'));
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === 'function') {
        cb = chunk;
        chunk = null;
        encoding = null;
    }
    else if (typeof encoding === 'function') {
        cb = encoding;
        encoding = null;
    }
    if (chunk !== null && chunk !== undefined)
        this.write(chunk, encoding);
    if (state.corked) {
        state.corked = 1;
        this.uncork();
    }
    if (!state.ending && !state.finished)
        endWritable(this, state, cb);
};
function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
    stream._final(function (err) {
        state.pendingcb--;
        if (err) {
            stream.emit('error', err);
        }
        state.prefinished = true;
        stream.emit('prefinish');
        finishMaybe(stream, state);
    });
}
function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === 'function') {
            state.pendingcb++;
            state.finalCalled = true;
            pna.nextTick(callFinal, stream, state);
        }
        else {
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
        }
    }
    return need;
}
function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
        if (state.finished)
            pna.nextTick(cb);
        else
            stream.once('finish', cb);
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
    if (state.corkedRequestsFree) {
        state.corkedRequestsFree.next = corkReq;
    }
    else {
        state.corkedRequestsFree = corkReq;
    }
}
Object.defineProperty(Writable.prototype, 'destroyed', {
    get: function () {
        if (this._writableState === undefined) {
            return false;
        }
        return this._writableState.destroyed;
    },
    set: function (value) {
        if (!this._writableState) {
            return;
        }
        this._writableState.destroyed = value;
    }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
    this.end();
    cb(err);
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(4), __webpack_require__(43).setImmediate, __webpack_require__(0)))

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Buffer = __webpack_require__(46).Buffer;
var isEncoding = Buffer.isEncoding || function (encoding) {
    encoding = '' + encoding;
    switch (encoding && encoding.toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
        case 'raw':
            return true;
        default:
            return false;
    }
};
function _normalizeEncoding(enc) {
    if (!enc)
        return 'utf8';
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
                if (retried)
                    return;
                enc = ('' + enc).toLowerCase();
                retried = true;
        }
    }
}
;
function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc)))
        throw new Error('Unknown encoding: ' + enc);
    return nenc || enc;
}
exports.StringDecoder = StringDecoder;
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
    if (buf.length === 0)
        return '';
    var r;
    var i;
    if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === undefined)
            return '';
        i = this.lastNeed;
        this.lastNeed = 0;
    }
    else {
        i = 0;
    }
    if (i < buf.length)
        return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || '';
};
StringDecoder.prototype.end = utf8End;
StringDecoder.prototype.text = utf8Text;
StringDecoder.prototype.fillLast = function (buf) {
    if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
};
function utf8CheckByte(byte) {
    if (byte <= 0x7F)
        return 0;
    else if (byte >> 5 === 0x06)
        return 2;
    else if (byte >> 4 === 0x0E)
        return 3;
    else if (byte >> 3 === 0x1E)
        return 4;
    return byte >> 6 === 0x02 ? -1 : -2;
}
function utf8CheckIncomplete(self, buf, i) {
    var j = buf.length - 1;
    if (j < i)
        return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
        if (nb > 0)
            self.lastNeed = nb - 1;
        return nb;
    }
    if (--j < i || nb === -2)
        return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
        if (nb > 0)
            self.lastNeed = nb - 2;
        return nb;
    }
    if (--j < i || nb === -2)
        return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
        if (nb > 0) {
            if (nb === 2)
                nb = 0;
            else
                self.lastNeed = nb - 3;
        }
        return nb;
    }
    return 0;
}
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
function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf, p);
    if (r !== undefined)
        return r;
    if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
}
function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed)
        return buf.toString('utf8', i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString('utf8', i, end);
}
function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : '';
    if (this.lastNeed)
        return r + '\ufffd';
    return r;
}
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
    if (n === 0)
        return buf.toString('base64', i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
    }
    else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString('base64', i, buf.length - n);
}
function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : '';
    if (this.lastNeed)
        return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
    return r;
}
function simpleWrite(buf) {
    return buf.toString(this.encoding);
}
function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : '';
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = Transform;
var Duplex = __webpack_require__(5);
var util = Object.create(__webpack_require__(6));
util.inherits = __webpack_require__(3);
util.inherits(Transform, Duplex);
function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (!cb) {
        return this.emit('error', new Error('write callback called multiple times'));
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
        this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
    }
}
function Transform(options) {
    if (!(this instanceof Transform))
        return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
        if (typeof options.transform === 'function')
            this._transform = options.transform;
        if (typeof options.flush === 'function')
            this._flush = options.flush;
    }
    this.on('prefinish', prefinish);
}
function prefinish() {
    var _this = this;
    if (typeof this._flush === 'function') {
        this._flush(function (er, data) {
            done(_this, er, data);
        });
    }
    else {
        done(this, null, null);
    }
}
Transform.prototype.push = function (chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
};
Transform.prototype._transform = function (chunk, encoding, cb) {
    throw new Error('_transform() is not implemented');
};
Transform.prototype._write = function (chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
            this._read(rs.highWaterMark);
    }
};
Transform.prototype._read = function (n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    }
    else {
        ts.needTransform = true;
    }
};
Transform.prototype._destroy = function (err, cb) {
    var _this2 = this;
    Duplex.prototype._destroy.call(this, err, function (err2) {
        cb(err2);
        _this2.emit('close');
    });
};
function done(stream, er, data) {
    if (er)
        return stream.emit('error', er);
    if (data != null)
        stream.push(data);
    if (stream._writableState.length)
        throw new Error('Calling transform done when ws.length != 0');
    if (stream._transformState.transforming)
        throw new Error('Calling transform done when still transforming');
    return stream.push(null);
}


/***/ }),
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
var PlayFabAdmin = __webpack_require__(51);
var PlayFabClient = __webpack_require__(52);
var PlayFabMatchmaker = __webpack_require__(53);
var PlayFabServer = __webpack_require__(54);
var PlayFabAuthentication = __webpack_require__(55);
var PlayFabCloudScript = __webpack_require__(56);
var PlayFabData = __webpack_require__(57);
var PlayFabEvents = __webpack_require__(58);
var PlayFabExperimentation = __webpack_require__(59);
var PlayFabInsights = __webpack_require__(60);
var PlayFabGroups = __webpack_require__(61);
var PlayFabLocalization = __webpack_require__(62);
var PlayFabMultiplayer = __webpack_require__(63);
var PlayFabProfiles = __webpack_require__(64);
module.exports = {
    PlayFab: PlayFab,
    PlayFabAdmin: PlayFabAdmin,
    PlayFabClient: PlayFabClient,
    PlayFabMatchmaker: PlayFabMatchmaker,
    PlayFabServer: PlayFabServer,
    PlayFabAuthentication: PlayFabAuthentication,
    PlayFabCloudScript: PlayFabCloudScript,
    PlayFabData: PlayFabData,
    PlayFabEvents: PlayFabEvents,
    PlayFabExperimentation: PlayFabExperimentation,
    PlayFabInsights: PlayFabInsights,
    PlayFabGroups: PlayFabGroups,
    PlayFabLocalization: PlayFabLocalization,
    PlayFabMultiplayer: PlayFabMultiplayer,
    PlayFabProfiles: PlayFabProfiles,
    get settings() {
        return PlayFab.settings;
    },
    set settings(value) {
        Object.assign(PlayFab.settings, value);
    }
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
}
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;
function getLens(b64) {
    var len = b64.length;
    if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
    }
    var validLen = b64.indexOf('=');
    if (validLen === -1)
        validLen = len;
    var placeHoldersLen = validLen === len
        ? 0
        : 4 - (validLen % 4);
    return [validLen, placeHoldersLen];
}
function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}
function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len = placeHoldersLen > 0
        ? validLen - 4
        : validLen;
    var i;
    for (i = 0; i < len; i += 4) {
        tmp =
            (revLookup[b64.charCodeAt(i)] << 18) |
                (revLookup[b64.charCodeAt(i + 1)] << 12) |
                (revLookup[b64.charCodeAt(i + 2)] << 6) |
                revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = (tmp >> 16) & 0xFF;
        arr[curByte++] = (tmp >> 8) & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 2) {
        tmp =
            (revLookup[b64.charCodeAt(i)] << 2) |
                (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 1) {
        tmp =
            (revLookup[b64.charCodeAt(i)] << 10) |
                (revLookup[b64.charCodeAt(i + 1)] << 4) |
                (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[curByte++] = (tmp >> 8) & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    return arr;
}
function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] +
        lookup[num >> 12 & 0x3F] +
        lookup[num >> 6 & 0x3F] +
        lookup[num & 0x3F];
}
function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
        tmp =
            ((uint8[i] << 16) & 0xFF0000) +
                ((uint8[i + 1] << 8) & 0xFF00) +
                (uint8[i + 2] & 0xFF);
        output.push(tripletToBase64(tmp));
    }
    return output.join('');
}
function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] +
            lookup[(tmp << 4) & 0x3F] +
            '==');
    }
    else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] +
            lookup[(tmp >> 4) & 0x3F] +
            lookup[(tmp << 2) & 0x3F] +
            '=');
    }
    return parts.join('');
}


/***/ }),
/* 30 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = (nBytes * 8) - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) { }
    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) { }
    if (e === 0) {
        e = 1 - eBias;
    }
    else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity);
    }
    else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};
exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = (nBytes * 8) - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    }
    else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        }
        else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        }
        else if (e + eBias >= 1) {
            m = ((value * c) - 1) * Math.pow(2, mLen);
            e = e + eBias;
        }
        else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) { }
    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) { }
    buffer[offset + i - d] |= s * 128;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;;
(function (root) {
    var freeExports =  true && exports &&
        !exports.nodeType && exports;
    var freeModule =  true && module &&
        !module.nodeType && module;
    var freeGlobal = typeof global == 'object' && global;
    if (freeGlobal.global === freeGlobal ||
        freeGlobal.window === freeGlobal ||
        freeGlobal.self === freeGlobal) {
        root = freeGlobal;
    }
    var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-', regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
        'overflow': 'Overflow: input needs wider integers to process',
        'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
        'invalid-input': 'Invalid input'
    }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, key;
    function error(type) {
        throw new RangeError(errors[type]);
    }
    function map(array, fn) {
        var length = array.length;
        var result = [];
        while (length--) {
            result[length] = fn(array[length]);
        }
        return result;
    }
    function mapDomain(string, fn) {
        var parts = string.split('@');
        var result = '';
        if (parts.length > 1) {
            result = parts[0] + '@';
            string = parts[1];
        }
        string = string.replace(regexSeparators, '\x2E');
        var labels = string.split('.');
        var encoded = map(labels, fn).join('.');
        return result + encoded;
    }
    function ucs2decode(string) {
        var output = [], counter = 0, length = string.length, value, extra;
        while (counter < length) {
            value = string.charCodeAt(counter++);
            if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                }
                else {
                    output.push(value);
                    counter--;
                }
            }
            else {
                output.push(value);
            }
        }
        return output;
    }
    function ucs2encode(array) {
        return map(array, function (value) {
            var output = '';
            if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
            }
            output += stringFromCharCode(value);
            return output;
        }).join('');
    }
    function basicToDigit(codePoint) {
        if (codePoint - 48 < 10) {
            return codePoint - 22;
        }
        if (codePoint - 65 < 26) {
            return codePoint - 65;
        }
        if (codePoint - 97 < 26) {
            return codePoint - 97;
        }
        return base;
    }
    function digitToBasic(digit, flag) {
        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    }
    function adapt(delta, numPoints, firstTime) {
        var k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (; delta > baseMinusTMin * tMax >> 1; k += base) {
            delta = floor(delta / baseMinusTMin);
        }
        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    }
    function decode(input) {
        var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, baseMinusT;
        basic = input.lastIndexOf(delimiter);
        if (basic < 0) {
            basic = 0;
        }
        for (j = 0; j < basic; ++j) {
            if (input.charCodeAt(j) >= 0x80) {
                error('not-basic');
            }
            output.push(input.charCodeAt(j));
        }
        for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
            for (oldi = i, w = 1, k = base;; k += base) {
                if (index >= inputLength) {
                    error('invalid-input');
                }
                digit = basicToDigit(input.charCodeAt(index++));
                if (digit >= base || digit > floor((maxInt - i) / w)) {
                    error('overflow');
                }
                i += digit * w;
                t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                if (digit < t) {
                    break;
                }
                baseMinusT = base - t;
                if (w > floor(maxInt / baseMinusT)) {
                    error('overflow');
                }
                w *= baseMinusT;
            }
            out = output.length + 1;
            bias = adapt(i - oldi, out, oldi == 0);
            if (floor(i / out) > maxInt - n) {
                error('overflow');
            }
            n += floor(i / out);
            i %= out;
            output.splice(i++, 0, n);
        }
        return ucs2encode(output);
    }
    function encode(input) {
        var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
        input = ucs2decode(input);
        inputLength = input.length;
        n = initialN;
        delta = 0;
        bias = initialBias;
        for (j = 0; j < inputLength; ++j) {
            currentValue = input[j];
            if (currentValue < 0x80) {
                output.push(stringFromCharCode(currentValue));
            }
        }
        handledCPCount = basicLength = output.length;
        if (basicLength) {
            output.push(delimiter);
        }
        while (handledCPCount < inputLength) {
            for (m = maxInt, j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue >= n && currentValue < m) {
                    m = currentValue;
                }
            }
            handledCPCountPlusOne = handledCPCount + 1;
            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                error('overflow');
            }
            delta += (m - n) * handledCPCountPlusOne;
            n = m;
            for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue < n && ++delta > maxInt) {
                    error('overflow');
                }
                if (currentValue == n) {
                    for (q = delta, k = base;; k += base) {
                        t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                        if (q < t) {
                            break;
                        }
                        qMinusT = q - t;
                        baseMinusT = base - t;
                        output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                        q = floor(qMinusT / baseMinusT);
                    }
                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                    delta = 0;
                    ++handledCPCount;
                }
            }
            ++delta;
            ++n;
        }
        return output.join('');
    }
    function toUnicode(input) {
        return mapDomain(input, function (string) {
            return regexPunycode.test(string)
                ? decode(string.slice(4).toLowerCase())
                : string;
        });
    }
    function toASCII(input) {
        return mapDomain(input, function (string) {
            return regexNonASCII.test(string)
                ? 'xn--' + encode(string)
                : string;
        });
    }
    punycode = {
        'version': '1.4.1',
        'ucs2': {
            'decode': ucs2decode,
            'encode': ucs2encode
        },
        'decode': decode,
        'encode': encode,
        'toASCII': toASCII,
        'toUnicode': toUnicode
    };
    if (true) {
        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
            return punycode;
        }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
    else {}
}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(32)(module), __webpack_require__(0)))

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = function (module) {
    if (!module.webpackPolyfill) {
        module.deprecate = function () { };
        module.paths = [];
        if (!module.children)
            module.children = [];
        Object.defineProperty(module, "loaded", {
            enumerable: true,
            get: function () {
                return module.l;
            }
        });
        Object.defineProperty(module, "id", {
            enumerable: true,
            get: function () {
                return module.i;
            }
        });
        module.webpackPolyfill = 1;
    }
    return module;
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = {
    isString: function (arg) {
        return typeof (arg) === 'string';
    },
    isObject: function (arg) {
        return typeof (arg) === 'object' && arg !== null;
    },
    isNull: function (arg) {
        return arg === null;
    },
    isNullOrUndefined: function (arg) {
        return arg == null;
    }
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.decode = exports.parse = __webpack_require__(35);
exports.encode = exports.stringify = __webpack_require__(36);


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
module.exports = function (qs, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
    if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
    }
    var regexp = /\+/g;
    qs = qs.split(sep);
    var maxKeys = 1000;
    if (options && typeof options.maxKeys === 'number') {
        maxKeys = options.maxKeys;
    }
    var len = qs.length;
    if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
    }
    for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'), idx = x.indexOf(eq), kstr, vstr, k, v;
        if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
        }
        else {
            kstr = x;
            vstr = '';
        }
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
        if (!hasOwnProperty(obj, k)) {
            obj[k] = v;
        }
        else if (isArray(obj[k])) {
            obj[k].push(v);
        }
        else {
            obj[k] = [obj[k], v];
        }
    }
    return obj;
};
var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var stringifyPrimitive = function (v) {
    switch (typeof v) {
        case 'string':
            return v;
        case 'boolean':
            return v ? 'true' : 'false';
        case 'number':
            return isFinite(v) ? v : '';
        default:
            return '';
    }
};
module.exports = function (obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
        obj = undefined;
    }
    if (typeof obj === 'object') {
        return map(objectKeys(obj), function (k) {
            var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
            if (isArray(obj[k])) {
                return map(obj[k], function (v) {
                    return ks + encodeURIComponent(stringifyPrimitive(v));
                }).join(sep);
            }
            else {
                return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
            }
        }).join(sep);
    }
    if (!name)
        return '';
    return encodeURIComponent(stringifyPrimitive(name)) + eq +
        encodeURIComponent(stringifyPrimitive(obj));
};
var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};
function map(xs, f) {
    if (xs.map)
        return xs.map(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
    }
    return res;
}
var objectKeys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
            res.push(key);
    }
    return res;
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var http = __webpack_require__(38);
var url = __webpack_require__(9);
var https = module.exports;
for (var key in http) {
    if (http.hasOwnProperty(key))
        https[key] = http[key];
}
https.request = function (params, cb) {
    params = validateParams(params);
    return http.request.call(this, params, cb);
};
https.get = function (params, cb) {
    params = validateParams(params);
    return http.get.call(this, params, cb);
};
function validateParams(params) {
    if (typeof params === 'string') {
        params = url.parse(params);
    }
    if (!params.protocol) {
        params.protocol = 'https:';
    }
    if (params.protocol !== 'https:') {
        throw new Error('Protocol "' + params.protocol + '" not supported. Expected "https:"');
    }
    return params;
}


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var ClientRequest = __webpack_require__(39);
var response = __webpack_require__(13);
var extend = __webpack_require__(49);
var statusCodes = __webpack_require__(50);
var url = __webpack_require__(9);
var http = exports;
http.request = function (opts, cb) {
    if (typeof opts === 'string')
        opts = url.parse(opts);
    else
        opts = extend(opts);
    var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';
    var protocol = opts.protocol || defaultProtocol;
    var host = opts.hostname || opts.host;
    var port = opts.port;
    var path = opts.path || '/';
    if (host && host.indexOf(':') !== -1)
        host = '[' + host + ']';
    opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path;
    opts.method = (opts.method || 'GET').toUpperCase();
    opts.headers = opts.headers || {};
    var req = new ClientRequest(opts);
    if (cb)
        req.on('response', cb);
    return req;
};
http.get = function get(opts, cb) {
    var req = http.request(opts, cb);
    req.end();
    return req;
};
http.ClientRequest = ClientRequest;
http.IncomingMessage = response.IncomingMessage;
http.Agent = function () { };
http.Agent.defaultMaxSockets = 4;
http.globalAgent = new http.Agent();
http.STATUS_CODES = statusCodes;
http.METHODS = [
    'CHECKOUT',
    'CONNECT',
    'COPY',
    'DELETE',
    'GET',
    'HEAD',
    'LOCK',
    'M-SEARCH',
    'MERGE',
    'MKACTIVITY',
    'MKCOL',
    'MOVE',
    'NOTIFY',
    'OPTIONS',
    'PATCH',
    'POST',
    'PROPFIND',
    'PROPPATCH',
    'PURGE',
    'PUT',
    'REPORT',
    'SEARCH',
    'SUBSCRIBE',
    'TRACE',
    'UNLOCK',
    'UNSUBSCRIBE'
];

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer, global, process) {var capability = __webpack_require__(12);
var inherits = __webpack_require__(3);
var response = __webpack_require__(13);
var stream = __webpack_require__(14);
var toArrayBuffer = __webpack_require__(48);
var IncomingMessage = response.IncomingMessage;
var rStates = response.readyStates;
function decideMode(preferBinary, useFetch) {
    if (capability.fetch && useFetch) {
        return 'fetch';
    }
    else if (capability.mozchunkedarraybuffer) {
        return 'moz-chunked-arraybuffer';
    }
    else if (capability.msstream) {
        return 'ms-stream';
    }
    else if (capability.arraybuffer && preferBinary) {
        return 'arraybuffer';
    }
    else if (capability.vbArray && preferBinary) {
        return 'text:vbarray';
    }
    else {
        return 'text';
    }
}
var ClientRequest = module.exports = function (opts) {
    var self = this;
    stream.Writable.call(self);
    self._opts = opts;
    self._body = [];
    self._headers = {};
    if (opts.auth)
        self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
    Object.keys(opts.headers).forEach(function (name) {
        self.setHeader(name, opts.headers[name]);
    });
    var preferBinary;
    var useFetch = true;
    if (opts.mode === 'disable-fetch' || ('requestTimeout' in opts && !capability.abortController)) {
        useFetch = false;
        preferBinary = true;
    }
    else if (opts.mode === 'prefer-streaming') {
        preferBinary = false;
    }
    else if (opts.mode === 'allow-wrong-content-type') {
        preferBinary = !capability.overrideMimeType;
    }
    else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
        preferBinary = true;
    }
    else {
        throw new Error('Invalid value for opts.mode');
    }
    self._mode = decideMode(preferBinary, useFetch);
    self._fetchTimer = null;
    self.on('finish', function () {
        self._onFinish();
    });
};
inherits(ClientRequest, stream.Writable);
ClientRequest.prototype.setHeader = function (name, value) {
    var self = this;
    var lowerName = name.toLowerCase();
    if (unsafeHeaders.indexOf(lowerName) !== -1)
        return;
    self._headers[lowerName] = {
        name: name,
        value: value
    };
};
ClientRequest.prototype.getHeader = function (name) {
    var header = this._headers[name.toLowerCase()];
    if (header)
        return header.value;
    return null;
};
ClientRequest.prototype.removeHeader = function (name) {
    var self = this;
    delete self._headers[name.toLowerCase()];
};
ClientRequest.prototype._onFinish = function () {
    var self = this;
    if (self._destroyed)
        return;
    var opts = self._opts;
    var headersObj = self._headers;
    var body = null;
    if (opts.method !== 'GET' && opts.method !== 'HEAD') {
        if (capability.arraybuffer) {
            body = toArrayBuffer(Buffer.concat(self._body));
        }
        else if (capability.blobConstructor) {
            body = new global.Blob(self._body.map(function (buffer) {
                return toArrayBuffer(buffer);
            }), {
                type: (headersObj['content-type'] || {}).value || ''
            });
        }
        else {
            body = Buffer.concat(self._body).toString();
        }
    }
    var headersList = [];
    Object.keys(headersObj).forEach(function (keyName) {
        var name = headersObj[keyName].name;
        var value = headersObj[keyName].value;
        if (Array.isArray(value)) {
            value.forEach(function (v) {
                headersList.push([name, v]);
            });
        }
        else {
            headersList.push([name, value]);
        }
    });
    if (self._mode === 'fetch') {
        var signal = null;
        var fetchTimer = null;
        if (capability.abortController) {
            var controller = new AbortController();
            signal = controller.signal;
            self._fetchAbortController = controller;
            if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
                self._fetchTimer = global.setTimeout(function () {
                    self.emit('requestTimeout');
                    if (self._fetchAbortController)
                        self._fetchAbortController.abort();
                }, opts.requestTimeout);
            }
        }
        global.fetch(self._opts.url, {
            method: self._opts.method,
            headers: headersList,
            body: body || undefined,
            mode: 'cors',
            credentials: opts.withCredentials ? 'include' : 'same-origin',
            signal: signal
        }).then(function (response) {
            self._fetchResponse = response;
            self._connect();
        }, function (reason) {
            global.clearTimeout(self._fetchTimer);
            if (!self._destroyed)
                self.emit('error', reason);
        });
    }
    else {
        var xhr = self._xhr = new global.XMLHttpRequest();
        try {
            xhr.open(self._opts.method, self._opts.url, true);
        }
        catch (err) {
            process.nextTick(function () {
                self.emit('error', err);
            });
            return;
        }
        if ('responseType' in xhr)
            xhr.responseType = self._mode.split(':')[0];
        if ('withCredentials' in xhr)
            xhr.withCredentials = !!opts.withCredentials;
        if (self._mode === 'text' && 'overrideMimeType' in xhr)
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        if ('requestTimeout' in opts) {
            xhr.timeout = opts.requestTimeout;
            xhr.ontimeout = function () {
                self.emit('requestTimeout');
            };
        }
        headersList.forEach(function (header) {
            xhr.setRequestHeader(header[0], header[1]);
        });
        self._response = null;
        xhr.onreadystatechange = function () {
            switch (xhr.readyState) {
                case rStates.LOADING:
                case rStates.DONE:
                    self._onXHRProgress();
                    break;
            }
        };
        if (self._mode === 'moz-chunked-arraybuffer') {
            xhr.onprogress = function () {
                self._onXHRProgress();
            };
        }
        xhr.onerror = function () {
            if (self._destroyed)
                return;
            self.emit('error', new Error('XHR error'));
        };
        try {
            xhr.send(body);
        }
        catch (err) {
            process.nextTick(function () {
                self.emit('error', err);
            });
            return;
        }
    }
};
function statusValid(xhr) {
    try {
        var status = xhr.status;
        return (status !== null && status !== 0);
    }
    catch (e) {
        return false;
    }
}
ClientRequest.prototype._onXHRProgress = function () {
    var self = this;
    if (!statusValid(self._xhr) || self._destroyed)
        return;
    if (!self._response)
        self._connect();
    self._response._onXHRProgress();
};
ClientRequest.prototype._connect = function () {
    var self = this;
    if (self._destroyed)
        return;
    self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode, self._fetchTimer);
    self._response.on('error', function (err) {
        self.emit('error', err);
    });
    self.emit('response', self._response);
};
ClientRequest.prototype._write = function (chunk, encoding, cb) {
    var self = this;
    self._body.push(chunk);
    cb();
};
ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
    var self = this;
    self._destroyed = true;
    global.clearTimeout(self._fetchTimer);
    if (self._response)
        self._response._destroyed = true;
    if (self._xhr)
        self._xhr.abort();
    else if (self._fetchAbortController)
        self._fetchAbortController.abort();
};
ClientRequest.prototype.end = function (data, encoding, cb) {
    var self = this;
    if (typeof data === 'function') {
        cb = data;
        data = undefined;
    }
    stream.Writable.prototype.end.call(self, data, encoding, cb);
};
ClientRequest.prototype.flushHeaders = function () { };
ClientRequest.prototype.setTimeout = function () { };
ClientRequest.prototype.setNoDelay = function () { };
ClientRequest.prototype.setSocketKeepAlive = function () { };
var unsafeHeaders = [
    'accept-charset',
    'accept-encoding',
    'access-control-request-headers',
    'access-control-request-method',
    'connection',
    'content-length',
    'cookie',
    'cookie2',
    'date',
    'dnt',
    'expect',
    'host',
    'keep-alive',
    'origin',
    'referer',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'via'
];

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2).Buffer, __webpack_require__(0), __webpack_require__(4)))

/***/ }),
/* 40 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
} }
var Buffer = __webpack_require__(10).Buffer;
var util = __webpack_require__(42);
function copyBuffer(src, target, offset) {
    src.copy(target, offset);
}
module.exports = function () {
    function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
    BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0)
            this.tail.next = entry;
        else
            this.head = entry;
        this.tail = entry;
        ++this.length;
    };
    BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0)
            this.tail = entry;
        this.head = entry;
        ++this.length;
    };
    BufferList.prototype.shift = function shift() {
        if (this.length === 0)
            return;
        var ret = this.head.data;
        if (this.length === 1)
            this.head = this.tail = null;
        else
            this.head = this.head.next;
        --this.length;
        return ret;
    };
    BufferList.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
    };
    BufferList.prototype.join = function join(s) {
        if (this.length === 0)
            return '';
        var p = this.head;
        var ret = '' + p.data;
        while (p = p.next) {
            ret += s + p.data;
        }
        return ret;
    };
    BufferList.prototype.concat = function concat(n) {
        if (this.length === 0)
            return Buffer.alloc(0);
        if (this.length === 1)
            return this.head.data;
        var ret = Buffer.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
            copyBuffer(p.data, ret, i);
            i += p.data.length;
            p = p.next;
        }
        return ret;
    };
    return BufferList;
}();
if (util && util.inspect && util.inspect.custom) {
    module.exports.prototype[util.inspect.custom] = function () {
        var obj = util.inspect({ length: this.length });
        return this.constructor.name + ' ' + obj;
    };
}


/***/ }),
/* 42 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
    (typeof self !== "undefined" && self) ||
    window;
var apply = Function.prototype.apply;
exports.setTimeout = function () {
    return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};
exports.setInterval = function () {
    return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};
exports.clearTimeout =
    exports.clearInterval = function (timeout) {
        if (timeout) {
            timeout.close();
        }
    };
function Timeout(id, clearFn) {
    this._id = id;
    this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function () { };
Timeout.prototype.close = function () {
    this._clearFn.call(scope, this._id);
};
exports.enroll = function (item, msecs) {
    clearTimeout(item._idleTimeoutId);
    item._idleTimeout = msecs;
};
exports.unenroll = function (item) {
    clearTimeout(item._idleTimeoutId);
    item._idleTimeout = -1;
};
exports._unrefActive = exports.active = function (item) {
    clearTimeout(item._idleTimeoutId);
    var msecs = item._idleTimeout;
    if (msecs >= 0) {
        item._idleTimeoutId = setTimeout(function onTimeout() {
            if (item._onTimeout)
                item._onTimeout();
        }, msecs);
    }
};
__webpack_require__(44);
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
    (typeof global !== "undefined" && global.setImmediate) ||
    (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
    (typeof global !== "undefined" && global.clearImmediate) ||
    (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";
    if (global.setImmediate) {
        return;
    }
    var nextHandle = 1;
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;
    function setImmediate(callback) {
        if (typeof callback !== "function") {
            callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i + 1];
        }
        var task = { callback: callback, args: args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
    }
    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }
    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
            case 0:
                callback();
                break;
            case 1:
                callback(args[0]);
                break;
            case 2:
                callback(args[0], args[1]);
                break;
            case 3:
                callback(args[0], args[1], args[2]);
                break;
            default:
                callback.apply(undefined, args);
                break;
        }
    }
    function runIfPresent(handle) {
        if (currentlyRunningATask) {
            setTimeout(runIfPresent, 0, handle);
        }
        else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                }
                finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }
    function installNextTickImplementation() {
        registerImmediate = function (handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }
    function canUsePostMessage() {
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }
    function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function (event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };
        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        }
        else {
            global.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function (handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }
    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };
        registerImmediate = function (handle) {
            channel.port2.postMessage(handle);
        };
    }
    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function (handle) {
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }
    function installSetTimeoutImplementation() {
        registerImmediate = function (handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
    if ({}.toString.call(global.process) === "[object process]") {
        installNextTickImplementation();
    }
    else if (canUsePostMessage()) {
        installPostMessageImplementation();
    }
    else if (global.MessageChannel) {
        installMessageChannelImplementation();
    }
    else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
    }
    else {
        installSetTimeoutImplementation();
    }
    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0), __webpack_require__(4)))

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = deprecate;
function deprecate(fn, msg) {
    if (config('noDeprecation')) {
        return fn;
    }
    var warned = false;
    function deprecated() {
        if (!warned) {
            if (config('throwDeprecation')) {
                throw new Error(msg);
            }
            else if (config('traceDeprecation')) {
                console.trace(msg);
            }
            else {
                console.warn(msg);
            }
            warned = true;
        }
        return fn.apply(this, arguments);
    }
    return deprecated;
}
function config(name) {
    try {
        if (!global.localStorage)
            return false;
    }
    catch (_) {
        return false;
    }
    var val = global.localStorage[name];
    if (null == val)
        return false;
    return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var buffer = __webpack_require__(2);
var Buffer = buffer.Buffer;
function copyProps(src, dst) {
    for (var key in src) {
        dst[key] = src[key];
    }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
    module.exports = buffer;
}
else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
}
function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
}
SafeBuffer.prototype = Object.create(Buffer.prototype);
copyProps(Buffer, SafeBuffer);
SafeBuffer.from = function (arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
        throw new TypeError('Argument must not be a number');
    }
    return Buffer(arg, encodingOrOffset, length);
};
SafeBuffer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    var buf = Buffer(size);
    if (fill !== undefined) {
        if (typeof encoding === 'string') {
            buf.fill(fill, encoding);
        }
        else {
            buf.fill(fill);
        }
    }
    else {
        buf.fill(0);
    }
    return buf;
};
SafeBuffer.allocUnsafe = function (size) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    return Buffer(size);
};
SafeBuffer.allocUnsafeSlow = function (size) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    return buffer.SlowBuffer(size);
};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = PassThrough;
var Transform = __webpack_require__(21);
var util = Object.create(__webpack_require__(6));
util.inherits = __webpack_require__(3);
util.inherits(PassThrough, Transform);
function PassThrough(options) {
    if (!(this instanceof PassThrough))
        return new PassThrough(options);
    Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
    cb(null, chunk);
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer;
module.exports = function (buf) {
    if (buf instanceof Uint8Array) {
        if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
            return buf.buffer;
        }
        else if (typeof buf.buffer.slice === 'function') {
            return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        }
    }
    if (Buffer.isBuffer(buf)) {
        var arrayCopy = new Uint8Array(buf.length);
        var len = buf.length;
        for (var i = 0; i < len; i++) {
            arrayCopy[i] = buf[i];
        }
        return arrayCopy.buffer;
    }
    else {
        throw new Error('Argument must be a Buffer');
    }
};


/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = extend;
var hasOwnProperty = Object.prototype.hasOwnProperty;
function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}


/***/ }),
/* 50 */
/***/ (function(module, exports) {

module.exports = {
    "100": "Continue",
    "101": "Switching Protocols",
    "102": "Processing",
    "200": "OK",
    "201": "Created",
    "202": "Accepted",
    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "207": "Multi-Status",
    "208": "Already Reported",
    "226": "IM Used",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "307": "Temporary Redirect",
    "308": "Permanent Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Payload Too Large",
    "414": "URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Range Not Satisfiable",
    "417": "Expectation Failed",
    "418": "I'm a teapot",
    "421": "Misdirected Request",
    "422": "Unprocessable Entity",
    "423": "Locked",
    "424": "Failed Dependency",
    "425": "Unordered Collection",
    "426": "Upgrade Required",
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "431": "Request Header Fields Too Large",
    "451": "Unavailable For Legal Reasons",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
    "505": "HTTP Version Not Supported",
    "506": "Variant Also Negotiates",
    "507": "Insufficient Storage",
    "508": "Loop Detected",
    "509": "Bandwidth Limit Exceeded",
    "510": "Not Extended",
    "511": "Network Authentication Required"
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.AbortTaskInstance = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AbortTaskInstance", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddLocalizedNews = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AddLocalizedNews", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddNews = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AddNews", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddPlayerTag = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AddPlayerTag", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddServerBuild = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AddServerBuild", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddUserVirtualCurrency = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AddUserVirtualCurrency", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddVirtualCurrencyTypes = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/AddVirtualCurrencyTypes", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.BanUsers = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/BanUsers", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CheckLimitedEditionItemAvailability = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CheckLimitedEditionItemAvailability", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateActionsOnPlayersInSegmentTask = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreateActionsOnPlayersInSegmentTask", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateCloudScriptTask = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreateCloudScriptTask", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateInsightsScheduledScalingTask = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreateInsightsScheduledScalingTask", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateOpenIdConnection = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreateOpenIdConnection", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreatePlayerSharedSecret = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreatePlayerSharedSecret", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreatePlayerStatisticDefinition = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreatePlayerStatisticDefinition", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateSegment = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/CreateSegment", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteContent = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteContent", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteMasterPlayerAccount = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteMasterPlayerAccount", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteOpenIdConnection = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteOpenIdConnection", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeletePlayer = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeletePlayer", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeletePlayerSharedSecret = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeletePlayerSharedSecret", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteSegment = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteSegment", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteStore = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteStore", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteTask = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteTask", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteTitle = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteTitle", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteTitleDataOverride = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/DeleteTitleDataOverride", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ExportMasterPlayerData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ExportMasterPlayerData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetActionsOnPlayersInSegmentTaskInstance = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetActionsOnPlayersInSegmentTaskInstance", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAllSegments = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetAllSegments", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCatalogItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetCatalogItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCloudScriptRevision = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetCloudScriptRevision", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCloudScriptTaskInstance = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetCloudScriptTaskInstance", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCloudScriptVersions = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetCloudScriptVersions", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetContentList = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetContentList", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetContentUploadUrl = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetContentUploadUrl", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetDataReport = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetDataReport", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMatchmakerGameInfo = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetMatchmakerGameInfo", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMatchmakerGameModes = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetMatchmakerGameModes", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayedTitleList = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayedTitleList", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerIdFromAuthToken = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerIdFromAuthToken", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerProfile = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerProfile", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerSegments = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerSegments", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerSharedSecrets = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerSharedSecrets", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayersInSegment = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayersInSegment", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerStatisticDefinitions = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerStatisticDefinitions", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerStatisticVersions = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerStatisticVersions", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerTags = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPlayerTags", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPolicy = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPolicy", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetRandomResultTables = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetRandomResultTables", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetSegments = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetSegments", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetServerBuildInfo = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetServerBuildInfo", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetServerBuildUploadUrl = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetServerBuildUploadUrl", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetStoreItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetStoreItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTaskInstances = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetTaskInstances", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTasks = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetTasks", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetTitleData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetTitleInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserAccountInfo = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserAccountInfo", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserBans = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserBans", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserInventory = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserInventory", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserPublisherInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserPublisherReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GetUserReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GrantItemsToUsers = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/GrantItemsToUsers", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.IncrementLimitedEditionItemAvailability = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/IncrementLimitedEditionItemAvailability", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.IncrementPlayerStatisticVersion = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/IncrementPlayerStatisticVersion", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListOpenIdConnection = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ListOpenIdConnection", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListServerBuilds = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ListServerBuilds", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListVirtualCurrencyTypes = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ListVirtualCurrencyTypes", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ModifyMatchmakerGameModes = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ModifyMatchmakerGameModes", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ModifyServerBuild = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ModifyServerBuild", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RefundPurchase = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RefundPurchase", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemovePlayerTag = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RemovePlayerTag", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveServerBuild = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RemoveServerBuild", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveVirtualCurrencyTypes = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RemoveVirtualCurrencyTypes", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ResetCharacterStatistics = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ResetCharacterStatistics", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ResetPassword = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ResetPassword", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ResetUserStatistics = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ResetUserStatistics", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ResolvePurchaseDispute = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/ResolvePurchaseDispute", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeAllBansForUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RevokeAllBansForUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeBans = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RevokeBans", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeInventoryItem = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RevokeInventoryItem", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeInventoryItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RevokeInventoryItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RunTask = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/RunTask", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SendAccountRecoveryEmail = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SendAccountRecoveryEmail", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetCatalogItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetCatalogItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPlayerSecret = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetPlayerSecret", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPublishedRevision = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetPublishedRevision", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetStoreItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetStoreItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetTitleData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetTitleData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetTitleDataAndOverrides = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetTitleDataAndOverrides", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetTitleInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetTitleInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetupPushNotification = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SetupPushNotification", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SubtractUserVirtualCurrency = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/SubtractUserVirtualCurrency", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateBans = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateBans", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCatalogItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateCatalogItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCloudScript = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateCloudScript", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateOpenIdConnection = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateOpenIdConnection", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdatePlayerSharedSecret = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdatePlayerSharedSecret", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdatePlayerStatisticDefinition = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdatePlayerStatisticDefinition", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdatePolicy = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdatePolicy", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateRandomResultTables = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateRandomResultTables", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateSegment = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateSegment", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateStoreItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateStoreItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateTask = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateTask", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserPublisherInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserPublisherReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserTitleDisplayName = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Admin/UpdateUserTitleDisplayName", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.IsClientLoggedIn = function () {
    return PlayFab._internalSettings.sessionTicket != null && PlayFab._internalSettings.sessionTicket.length > 0;
};
exports.AcceptTrade = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AcceptTrade", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddFriend = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AddFriend", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddGenericID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AddGenericID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddOrUpdateContactEmail = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AddOrUpdateContactEmail", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddSharedGroupMembers = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AddSharedGroupMembers", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddUsernamePassword = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AddUsernamePassword", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddUserVirtualCurrency = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AddUserVirtualCurrency", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AndroidDevicePushNotificationRegistration = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AndroidDevicePushNotificationRegistration", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AttributeInstall = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/AttributeInstall", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        PlayFab.settings.advertisingIdType += "_Successful";
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CancelTrade = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/CancelTrade", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConfirmPurchase = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ConfirmPurchase", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConsumeItem = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ConsumeItem", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConsumeMicrosoftStoreEntitlements = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ConsumeMicrosoftStoreEntitlements", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConsumePS5Entitlements = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ConsumePS5Entitlements", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConsumePSNEntitlements = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ConsumePSNEntitlements", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConsumeXboxEntitlements = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ConsumeXboxEntitlements", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateSharedGroup = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/CreateSharedGroup", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ExecuteCloudScript = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ExecuteCloudScript", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAccountInfo = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetAccountInfo", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAdPlacements = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetAdPlacements", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAllUsersCharacters = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetAllUsersCharacters", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCatalogItems = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCatalogItems", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCharacterData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterInventory = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCharacterInventory", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterLeaderboard = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCharacterLeaderboard", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterReadOnlyData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCharacterReadOnlyData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterStatistics = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCharacterStatistics", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetContentDownloadUrl = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetContentDownloadUrl", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCurrentGames = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetCurrentGames", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetFriendLeaderboard = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetFriendLeaderboard", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetFriendLeaderboardAroundPlayer = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetFriendLeaderboardAroundPlayer", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetFriendsList = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetFriendsList", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetGameServerRegions = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetGameServerRegions", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboard = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetLeaderboard", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboardAroundCharacter = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetLeaderboardAroundCharacter", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboardAroundPlayer = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetLeaderboardAroundPlayer", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboardForUserCharacters = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetLeaderboardForUserCharacters", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPaymentToken = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPaymentToken", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPhotonAuthenticationToken = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPhotonAuthenticationToken", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerCombinedInfo = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerCombinedInfo", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerProfile = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerProfile", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerSegments = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerSegments", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerStatistics = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerStatistics", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerStatisticVersions = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerStatisticVersions", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerTags = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerTags", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerTrades = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayerTrades", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromFacebookIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromFacebookIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromFacebookInstantGamesIds = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromFacebookInstantGamesIds", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromGameCenterIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromGameCenterIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromGenericIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromGenericIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromGoogleIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromGoogleIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromKongregateIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromKongregateIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromNintendoSwitchDeviceIds = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromNintendoSwitchDeviceIds", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromPSNAccountIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromPSNAccountIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromSteamIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromSteamIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromTwitchIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromTwitchIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromXboxLiveIDs = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPlayFabIDsFromXboxLiveIDs", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPublisherData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPublisherData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPurchase = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetPurchase", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetSharedGroupData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetSharedGroupData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetStoreItems = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetStoreItems", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTime = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetTime", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetTitleData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleNews = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetTitleNews", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitlePublicKey = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetTitlePublicKey", request, null, null, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTradeStatus = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetTradeStatus", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetUserData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserInventory = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetUserInventory", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetUserPublisherData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherReadOnlyData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetUserPublisherReadOnlyData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserReadOnlyData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetUserReadOnlyData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetWindowsHelloChallenge = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GetWindowsHelloChallenge", request, null, null, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GrantCharacterToUser = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/GrantCharacterToUser", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkAndroidDeviceID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkAndroidDeviceID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkApple = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkApple", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkCustomID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkCustomID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkFacebookAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkFacebookAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkFacebookInstantGamesId = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkFacebookInstantGamesId", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkGameCenterAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkGameCenterAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkGoogleAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkGoogleAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkIOSDeviceID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkIOSDeviceID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkKongregate = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkKongregate", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkNintendoServiceAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkNintendoServiceAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkNintendoSwitchDeviceId = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkNintendoSwitchDeviceId", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkOpenIdConnect = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkOpenIdConnect", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkPSNAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkPSNAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkSteamAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkSteamAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkTwitch = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkTwitch", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkWindowsHello = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkWindowsHello", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkXboxAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LinkXboxAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithAndroidDeviceID = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithAndroidDeviceID", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithApple = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithApple", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithCustomID = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithCustomID", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithEmailAddress = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithEmailAddress", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithFacebook = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithFacebook", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithFacebookInstantGamesId = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithFacebookInstantGamesId", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithGameCenter = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithGameCenter", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithGoogleAccount = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithGoogleAccount", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithIOSDeviceID = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithIOSDeviceID", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithKongregate = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithKongregate", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithNintendoServiceAccount = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithNintendoServiceAccount", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithNintendoSwitchDeviceId = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithNintendoSwitchDeviceId", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithOpenIdConnect = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithOpenIdConnect", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithPlayFab = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithPlayFab", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithPSN = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithPSN", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithSteam = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithSteam", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithTwitch = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithTwitch", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithWindowsHello = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithWindowsHello", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithXbox = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/LoginWithXbox", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.Matchmake = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/Matchmake", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.OpenTrade = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/OpenTrade", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PayForPurchase = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/PayForPurchase", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PurchaseItem = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/PurchaseItem", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RedeemCoupon = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RedeemCoupon", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RefreshPSNAuthToken = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RefreshPSNAuthToken", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RegisterForIOSPushNotification = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RegisterForIOSPushNotification", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RegisterPlayFabUser = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RegisterPlayFabUser", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RegisterWithWindowsHello = function (request, callback) {
    request.TitleId = request.titleId != null ? request.TitleId : PlayFab.settings.titleId;
    if (request.TitleId == null) {
        throw "Must be have PlayFab.settings.titleId set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RegisterWithWindowsHello", request, null, null, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.sessionTicket = result.data.hasOwnProperty("SessionTicket") ? result.data.SessionTicket : PlayFab._internalSettings.sessionTicket;
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken.EntityToken : PlayFab._internalSettings.entityToken;
            exports._MultiStepClientLogin(result.data.SettingsForUser.NeedsAttribution);
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveContactEmail = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RemoveContactEmail", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveFriend = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RemoveFriend", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveGenericID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RemoveGenericID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveSharedGroupMembers = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RemoveSharedGroupMembers", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ReportAdActivity = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ReportAdActivity", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ReportDeviceInfo = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ReportDeviceInfo", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ReportPlayer = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ReportPlayer", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RestoreIOSPurchases = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RestoreIOSPurchases", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RewardAdActivity = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/RewardAdActivity", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SendAccountRecoveryEmail = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/SendAccountRecoveryEmail", request, null, null, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetFriendTags = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/SetFriendTags", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPlayerSecret = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/SetPlayerSecret", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.StartGame = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/StartGame", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.StartPurchase = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/StartPurchase", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SubtractUserVirtualCurrency = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/SubtractUserVirtualCurrency", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkAndroidDeviceID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkAndroidDeviceID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkApple = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkApple", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkCustomID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkCustomID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkFacebookAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkFacebookAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkFacebookInstantGamesId = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkFacebookInstantGamesId", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkGameCenterAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkGameCenterAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkGoogleAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkGoogleAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkIOSDeviceID = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkIOSDeviceID", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkKongregate = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkKongregate", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkNintendoServiceAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkNintendoServiceAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkNintendoSwitchDeviceId = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkNintendoSwitchDeviceId", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkOpenIdConnect = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkOpenIdConnect", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkPSNAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkPSNAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkSteamAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkSteamAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkTwitch = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkTwitch", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkWindowsHello = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkWindowsHello", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkXboxAccount = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlinkXboxAccount", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlockContainerInstance = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlockContainerInstance", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlockContainerItem = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UnlockContainerItem", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateAvatarUrl = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateAvatarUrl", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCharacterData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateCharacterData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCharacterStatistics = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateCharacterStatistics", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdatePlayerStatistics = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdatePlayerStatistics", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateSharedGroupData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateSharedGroupData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateUserData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherData = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateUserPublisherData", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserTitleDisplayName = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/UpdateUserTitleDisplayName", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ValidateAmazonIAPReceipt = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ValidateAmazonIAPReceipt", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ValidateGooglePlayPurchase = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ValidateGooglePlayPurchase", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ValidateIOSReceipt = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ValidateIOSReceipt", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ValidateWindowsStoreReceipt = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/ValidateWindowsStoreReceipt", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WriteCharacterEvent = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/WriteCharacterEvent", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WritePlayerEvent = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/WritePlayerEvent", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WriteTitleEvent = function (request, callback) {
    if (PlayFab._internalSettings.sessionTicket == null) {
        throw "Must be logged in to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Client/WriteTitleEvent", request, "X-Authorization", PlayFab._internalSettings.sessionTicket, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports._MultiStepClientLogin = function (needsAttribution) {
    if (needsAttribution &&
        !PlayFab.settings.disableAdvertising &&
        Boolean(PlayFab.settings.advertisingIdType) &&
        Boolean(PlayFab.settings.advertisingIdValue)) {
        var request = {};
        if (PlayFab.settings.advertisingIdType === PlayFab.settings.AD_TYPE_IDFA) {
            request.Idfa = PlayFab.settings.advertisingIdValue;
        }
        else if (PlayFab.settings.advertisingIdType === PlayFab.settings.AD_TYPE_ANDROID_ID) {
            request.Adid = PlayFab.settings.advertisingIdValue;
        }
        else {
            return;
        }
        exports.AttributeInstall(request);
    }
};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.AuthUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Matchmaker/AuthUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PlayerJoined = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Matchmaker/PlayerJoined", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PlayerLeft = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Matchmaker/PlayerLeft", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.StartGame = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Matchmaker/StartGame", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UserInfo = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Matchmaker/UserInfo", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.AddCharacterVirtualCurrency = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AddCharacterVirtualCurrency", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddFriend = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AddFriend", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddGenericID = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AddGenericID", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddPlayerTag = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AddPlayerTag", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddSharedGroupMembers = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AddSharedGroupMembers", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddUserVirtualCurrency = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AddUserVirtualCurrency", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AuthenticateSessionTicket = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AuthenticateSessionTicket", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AwardSteamAchievement = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/AwardSteamAchievement", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.BanUsers = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/BanUsers", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ConsumeItem = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/ConsumeItem", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateSharedGroup = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/CreateSharedGroup", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteCharacterFromUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/DeleteCharacterFromUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeletePlayer = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/DeletePlayer", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeletePushNotificationTemplate = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/DeletePushNotificationTemplate", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteSharedGroup = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/DeleteSharedGroup", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeregisterGame = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/DeregisterGame", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.EvaluateRandomResultTable = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/EvaluateRandomResultTable", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ExecuteCloudScript = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/ExecuteCloudScript", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAllSegments = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetAllSegments", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAllUsersCharacters = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetAllUsersCharacters", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCatalogItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCatalogItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCharacterData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCharacterInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterInventory = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCharacterInventory", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterLeaderboard = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCharacterLeaderboard", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCharacterReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetCharacterStatistics = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetCharacterStatistics", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetContentDownloadUrl = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetContentDownloadUrl", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetFriendLeaderboard = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetFriendLeaderboard", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetFriendsList = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetFriendsList", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboard = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetLeaderboard", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboardAroundCharacter = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetLeaderboardAroundCharacter", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboardAroundUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetLeaderboardAroundUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLeaderboardForUserCharacters = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetLeaderboardForUserCharacters", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerCombinedInfo = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayerCombinedInfo", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerProfile = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayerProfile", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerSegments = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayerSegments", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayersInSegment = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayersInSegment", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerStatistics = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayerStatistics", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerStatisticVersions = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayerStatisticVersions", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayerTags = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayerTags", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromFacebookIDs = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromFacebookIDs", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromFacebookInstantGamesIds = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromFacebookInstantGamesIds", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromGenericIDs = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromGenericIDs", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromNintendoSwitchDeviceIds = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromNintendoSwitchDeviceIds", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromPSNAccountIDs = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromPSNAccountIDs", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromSteamIDs = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromSteamIDs", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPlayFabIDsFromXboxLiveIDs = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPlayFabIDsFromXboxLiveIDs", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetRandomResultTables = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetRandomResultTables", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetServerCustomIDsFromPlayFabIDs = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetServerCustomIDsFromPlayFabIDs", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetSharedGroupData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetSharedGroupData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetStoreItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetStoreItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTime = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetTime", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetTitleData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetTitleInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleNews = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetTitleNews", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserAccountInfo = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserAccountInfo", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserBans = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserBans", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserInventory = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserInventory", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserPublisherInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserPublisherReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserPublisherReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetUserReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GetUserReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GrantCharacterToUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GrantCharacterToUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GrantItemsToCharacter = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GrantItemsToCharacter", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GrantItemsToUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GrantItemsToUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GrantItemsToUsers = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/GrantItemsToUsers", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkPSNAccount = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LinkPSNAccount", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkServerCustomId = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LinkServerCustomId", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LinkXboxAccount = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LinkXboxAccount", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithServerCustomId = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LoginWithServerCustomId", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithSteamId = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LoginWithSteamId", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithXbox = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LoginWithXbox", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.LoginWithXboxId = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/LoginWithXboxId", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ModifyItemUses = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/ModifyItemUses", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.MoveItemToCharacterFromCharacter = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/MoveItemToCharacterFromCharacter", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.MoveItemToCharacterFromUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/MoveItemToCharacterFromUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.MoveItemToUserFromCharacter = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/MoveItemToUserFromCharacter", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.NotifyMatchmakerPlayerLeft = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/NotifyMatchmakerPlayerLeft", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RedeemCoupon = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RedeemCoupon", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RedeemMatchmakerTicket = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RedeemMatchmakerTicket", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RefreshGameServerInstanceHeartbeat = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RefreshGameServerInstanceHeartbeat", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RegisterGame = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RegisterGame", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveFriend = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RemoveFriend", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveGenericID = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RemoveGenericID", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemovePlayerTag = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RemovePlayerTag", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveSharedGroupMembers = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RemoveSharedGroupMembers", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ReportPlayer = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/ReportPlayer", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeAllBansForUser = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RevokeAllBansForUser", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeBans = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RevokeBans", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeInventoryItem = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RevokeInventoryItem", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RevokeInventoryItems = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/RevokeInventoryItems", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SavePushNotificationTemplate = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SavePushNotificationTemplate", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SendCustomAccountRecoveryEmail = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SendCustomAccountRecoveryEmail", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SendEmailFromTemplate = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SendEmailFromTemplate", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SendPushNotification = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SendPushNotification", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SendPushNotificationFromTemplate = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SendPushNotificationFromTemplate", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetFriendTags = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetFriendTags", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetGameServerInstanceData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetGameServerInstanceData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetGameServerInstanceState = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetGameServerInstanceState", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetGameServerInstanceTags = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetGameServerInstanceTags", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPlayerSecret = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetPlayerSecret", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetTitleData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetTitleData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetTitleInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SetTitleInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SubtractCharacterVirtualCurrency = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SubtractCharacterVirtualCurrency", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SubtractUserVirtualCurrency = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/SubtractUserVirtualCurrency", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkPSNAccount = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UnlinkPSNAccount", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkServerCustomId = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UnlinkServerCustomId", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlinkXboxAccount = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UnlinkXboxAccount", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlockContainerInstance = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UnlockContainerInstance", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnlockContainerItem = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UnlockContainerItem", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateAvatarUrl = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateAvatarUrl", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateBans = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateBans", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCharacterData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateCharacterData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCharacterInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateCharacterInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCharacterReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateCharacterReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateCharacterStatistics = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateCharacterStatistics", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdatePlayerStatistics = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdatePlayerStatistics", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateSharedGroupData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateSharedGroupData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserInventoryItemCustomData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserInventoryItemCustomData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserPublisherData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherInternalData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserPublisherInternalData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserPublisherReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserPublisherReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateUserReadOnlyData = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/UpdateUserReadOnlyData", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WriteCharacterEvent = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/WriteCharacterEvent", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WritePlayerEvent = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/WritePlayerEvent", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WriteTitleEvent = function (request, callback) {
    if (PlayFab.settings.developerSecretKey == null) {
        throw "Must have PlayFab.settings.DeveloperSecretKey set to call this method";
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Server/WriteTitleEvent", request, "X-SecretKey", PlayFab.settings.developerSecretKey, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.GetEntityToken = function (request, callback) {
    var authKey = "";
    var authValue = "";
    if (PlayFab._internalSettings.sessionTicket) {
        authKey = "X-Authorization";
        authValue = PlayFab._internalSettings.sessionTicket;
    }
    else if (PlayFab.settings.developerSecretKey) {
        authKey = "X-SecretKey";
        authValue = PlayFab.settings.developerSecretKey;
    }
    else if (PlayFab._internalSettings.entityToken) {
        authKey = "X-EntityToken";
        authValue = PlayFab._internalSettings.entityToken;
    }
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Authentication/GetEntityToken", request, authKey, authValue, function (error, result) {
        if (result != null && result.data != null) {
            PlayFab._internalSettings.entityToken = result.data.hasOwnProperty("EntityToken") ? result.data.EntityToken : PlayFab._internalSettings.entityToken;
        }
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ValidateEntityToken = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Authentication/ValidateEntityToken", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.ExecuteEntityCloudScript = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/ExecuteEntityCloudScript", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ExecuteFunction = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/ExecuteFunction", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListFunctions = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/ListFunctions", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListHttpFunctions = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/ListHttpFunctions", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListQueuedFunctions = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/ListQueuedFunctions", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PostFunctionResultForEntityTriggeredAction = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/PostFunctionResultForEntityTriggeredAction", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PostFunctionResultForFunctionExecution = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/PostFunctionResultForFunctionExecution", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PostFunctionResultForPlayerTriggeredAction = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/PostFunctionResultForPlayerTriggeredAction", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.PostFunctionResultForScheduledTask = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/PostFunctionResultForScheduledTask", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RegisterHttpFunction = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/RegisterHttpFunction", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RegisterQueuedFunction = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/RegisterQueuedFunction", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnregisterFunction = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/CloudScript/UnregisterFunction", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.AbortFileUploads = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/File/AbortFileUploads", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteFiles = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/File/DeleteFiles", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.FinalizeFileUploads = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/File/FinalizeFileUploads", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetFiles = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/File/GetFiles", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetObjects = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Object/GetObjects", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.InitiateFileUploads = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/File/InitiateFileUploads", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetObjects = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Object/SetObjects", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.WriteEvents = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Event/WriteEvents", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.WriteTelemetryEvents = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Event/WriteTelemetryEvents", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.CreateExclusionGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/CreateExclusionGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateExperiment = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/CreateExperiment", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteExclusionGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/DeleteExclusionGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteExperiment = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/DeleteExperiment", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetExclusionGroups = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/GetExclusionGroups", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetExclusionGroupTraffic = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/GetExclusionGroupTraffic", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetExperiments = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/GetExperiments", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLatestScorecard = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/GetLatestScorecard", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTreatmentAssignment = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/GetTreatmentAssignment", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.StartExperiment = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/StartExperiment", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.StopExperiment = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/StopExperiment", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateExclusionGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/UpdateExclusionGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateExperiment = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Experimentation/UpdateExperiment", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.GetDetails = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Insights/GetDetails", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetLimits = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Insights/GetLimits", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetOperationStatus = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Insights/GetOperationStatus", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetPendingOperations = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Insights/GetPendingOperations", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetPerformance = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Insights/SetPerformance", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetStorageRetention = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Insights/SetStorageRetention", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.AcceptGroupApplication = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/AcceptGroupApplication", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AcceptGroupInvitation = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/AcceptGroupInvitation", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.AddMembers = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/AddMembers", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ApplyToGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ApplyToGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.BlockEntity = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/BlockEntity", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ChangeMemberRole = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ChangeMemberRole", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/CreateGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateRole = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/CreateRole", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/DeleteGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteRole = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/DeleteRole", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/GetGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.InviteToGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/InviteToGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.IsMember = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/IsMember", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListGroupApplications = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ListGroupApplications", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListGroupBlocks = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ListGroupBlocks", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListGroupInvitations = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ListGroupInvitations", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListGroupMembers = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ListGroupMembers", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListMembership = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ListMembership", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListMembershipOpportunities = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/ListMembershipOpportunities", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveGroupApplication = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/RemoveGroupApplication", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveGroupInvitation = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/RemoveGroupInvitation", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveMembers = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/RemoveMembers", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UnblockEntity = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/UnblockEntity", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateGroup = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/UpdateGroup", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateRole = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Group/UpdateRole", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.GetLanguageList = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Locale/GetLanguageList", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.CancelAllMatchmakingTicketsForPlayer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CancelAllMatchmakingTicketsForPlayer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CancelAllServerBackfillTicketsForPlayer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CancelAllServerBackfillTicketsForPlayer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CancelMatchmakingTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CancelMatchmakingTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CancelServerBackfillTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CancelServerBackfillTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateBuildAlias = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/CreateBuildAlias", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateBuildWithCustomContainer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/CreateBuildWithCustomContainer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateBuildWithManagedContainer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/CreateBuildWithManagedContainer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateBuildWithProcessBasedServer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/CreateBuildWithProcessBasedServer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateMatchmakingTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CreateMatchmakingTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateRemoteUser = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/CreateRemoteUser", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateServerBackfillTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CreateServerBackfillTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateServerMatchmakingTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/CreateServerMatchmakingTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.CreateTitleMultiplayerServersQuotaChange = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/CreateTitleMultiplayerServersQuotaChange", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteAsset = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteAsset", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteBuild = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteBuild", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteBuildAlias = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteBuildAlias", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteBuildRegion = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteBuildRegion", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteCertificate = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteCertificate", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteContainerImageRepository = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteContainerImageRepository", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.DeleteRemoteUser = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/DeleteRemoteUser", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.EnableMultiplayerServersForTitle = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/EnableMultiplayerServersForTitle", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetAssetUploadUrl = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetAssetUploadUrl", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetBuild = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetBuild", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetBuildAlias = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetBuildAlias", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetContainerRegistryCredentials = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetContainerRegistryCredentials", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMatch = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/GetMatch", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMatchmakingQueue = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/GetMatchmakingQueue", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMatchmakingTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/GetMatchmakingTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMultiplayerServerDetails = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetMultiplayerServerDetails", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMultiplayerServerLogs = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetMultiplayerServerLogs", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetMultiplayerSessionLogsBySessionId = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetMultiplayerSessionLogsBySessionId", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetQueueStatistics = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/GetQueueStatistics", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetRemoteLoginEndpoint = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetRemoteLoginEndpoint", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetServerBackfillTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/GetServerBackfillTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleEnabledForMultiplayerServersStatus = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetTitleEnabledForMultiplayerServersStatus", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleMultiplayerServersQuotaChange = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetTitleMultiplayerServersQuotaChange", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitleMultiplayerServersQuotas = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/GetTitleMultiplayerServersQuotas", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.JoinMatchmakingTicket = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/JoinMatchmakingTicket", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListArchivedMultiplayerServers = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListArchivedMultiplayerServers", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListAssetSummaries = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListAssetSummaries", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListBuildAliases = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListBuildAliases", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListBuildSummariesV2 = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListBuildSummariesV2", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListCertificateSummaries = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListCertificateSummaries", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListContainerImages = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListContainerImages", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListContainerImageTags = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListContainerImageTags", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListMatchmakingQueues = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/ListMatchmakingQueues", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListMatchmakingTicketsForPlayer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/ListMatchmakingTicketsForPlayer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListMultiplayerServers = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListMultiplayerServers", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListPartyQosServers = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListPartyQosServers", request, null, null, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListQosServersForTitle = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListQosServersForTitle", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListServerBackfillTicketsForPlayer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/ListServerBackfillTicketsForPlayer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListTitleMultiplayerServersQuotaChanges = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListTitleMultiplayerServersQuotaChanges", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ListVirtualMachineSummaries = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ListVirtualMachineSummaries", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RemoveMatchmakingQueue = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/RemoveMatchmakingQueue", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RequestMultiplayerServer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/RequestMultiplayerServer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.RolloverContainerRegistryCredentials = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/RolloverContainerRegistryCredentials", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetMatchmakingQueue = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Match/SetMatchmakingQueue", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.ShutdownMultiplayerServer = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/ShutdownMultiplayerServer", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UntagContainerImage = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/UntagContainerImage", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateBuildAlias = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/UpdateBuildAlias", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateBuildName = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/UpdateBuildName", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateBuildRegion = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/UpdateBuildRegion", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UpdateBuildRegions = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/UpdateBuildRegions", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.UploadCertificate = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/MultiplayerServer/UploadCertificate", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var PlayFab = __webpack_require__(1);
exports.settings = PlayFab.settings;
exports.GetGlobalPolicy = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/GetGlobalPolicy", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetProfile = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/GetProfile", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetProfiles = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/GetProfiles", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.GetTitlePlayersFromMasterPlayerAccountIds = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/GetTitlePlayersFromMasterPlayerAccountIds", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetGlobalPolicy = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/SetGlobalPolicy", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetProfileLanguage = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/SetProfileLanguage", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};
exports.SetProfilePolicy = function (request, callback) {
    PlayFab.MakeRequest(PlayFab.GetServerUrl() + "/Profile/SetProfilePolicy", request, "X-EntityToken", PlayFab._internalSettings.entityToken, function (error, result) {
        if (callback != null) {
            callback(error, result);
        }
    });
};


/***/ })
/******/ ]);