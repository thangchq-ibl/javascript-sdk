"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeArrayBinary = exports.encodeObjectBinary = exports.encodeBinaryByteArray = exports.encodeBinary = exports.marshalBinaryBare = exports.marshalBinary = exports.convertObjectToSignBytes = exports.encodeTime = exports.encodeString = exports.encodeBool = exports.encodeNumber = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * @module amino
                                                                                                                                                                                                                                                                               */

var _varstruct = require("varstruct");

var _varstruct2 = _interopRequireDefault(_varstruct);

var _safeBuffer = require("safe-buffer");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _varint = require("./varint");

var _varint2 = _interopRequireDefault(_varint);

var _encoderHelper = require("../utils/encoderHelper");

var _encoderHelper2 = _interopRequireDefault(_encoderHelper);

var _tx = require("../tx/");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VarString = _varstruct2.default.VarString(_varint.UVarInt);

var sortObject = function sortObject(obj) {
  if (obj === null) return null;
  if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object") return obj;
  // arrays have typeof "object" in js!
  if (Array.isArray(obj)) return obj.map(sortObject);
  var sortedKeys = Object.keys(obj).sort();
  var result = {};
  sortedKeys.forEach(function (key) {
    result[key] = sortObject(obj[key]);
  });
  return result;
};

/**
 * encode number
 * @param num
 */
var encodeNumber = exports.encodeNumber = function encodeNumber(num) {
  return _varint.UVarInt.encode(num);
};

/**
 * encode bool
 * @param b
 */
var encodeBool = exports.encodeBool = function encodeBool(b) {
  return b ? _varint2.default.encode(1) : _varint2.default.encode(0);
};

/**
 * encode string
 * @param str
 */
var encodeString = exports.encodeString = function encodeString(str) {
  return VarString.encode(str);
};

/**
 * encode time
 * @param value
 */
var encodeTime = exports.encodeTime = function encodeTime(value) {
  var millis = new Date(value).getTime();
  var seconds = Math.floor(millis / 1000);
  var nanos = Number(seconds.toString().padEnd(9, "0"));

  var buffer = _safeBuffer.Buffer.alloc(14);

  buffer[0] = 1 << 3 | 1; // field 1, typ3 1
  buffer.writeUInt32LE(seconds, 1);

  buffer[9] = 2 << 3 | 5; // field 2, typ3 5
  buffer.writeUInt32LE(nanos, 10);

  return buffer;
};

/**
 * @param obj -- {object}
 * @return bytes {Buffer}
 */
var convertObjectToSignBytes = exports.convertObjectToSignBytes = function convertObjectToSignBytes(obj) {
  return _safeBuffer.Buffer.from(JSON.stringify(sortObject(obj)));
};

/**
 * js amino MarshalBinary
 * @param {Object} obj
 *  */
var marshalBinary = exports.marshalBinary = function marshalBinary(obj) {
  if (!_lodash2.default.isObject(obj)) throw new TypeError("data must be an object");

  return encodeBinary(obj, null, true).toString("hex");
};

/**
 * js amino MarshalBinaryBare
 * @param {Object} obj
 *  */
var marshalBinaryBare = exports.marshalBinaryBare = function marshalBinaryBare(obj) {
  if (!_lodash2.default.isObject(obj)) throw new TypeError("data must be an object");

  return encodeBinary(obj).toString("hex");
};

/**
 * This is the main entrypoint for encoding all types in binary form.
 * @param {*} js data type (not null, not undefined)
 * @param {Number} field index of object
 * @param {Boolean} isByteLenPrefix
 * @return {Buffer} binary of object.
 */
var encodeBinary = exports.encodeBinary = function encodeBinary(val, fieldNum, isByteLenPrefix) {
  if (val === null || val === undefined) throw new TypeError("unsupported type");

  if (_safeBuffer.Buffer.isBuffer(val)) {
    if (isByteLenPrefix) {
      return _safeBuffer.Buffer.concat([_varint.UVarInt.encode(val.length), val]);
    }
    return val;
  }

  if (_lodash2.default.isPlainObject(val)) {
    return encodeObjectBinary(val, isByteLenPrefix);
  }

  if (_lodash2.default.isArray(val)) {
    return encodeArrayBinary(fieldNum, val, isByteLenPrefix);
  }

  if (_lodash2.default.isNumber(val)) {
    return encodeNumber(val);
  }

  if (_lodash2.default.isBoolean(val)) {
    return encodeBool(val);
  }

  if (_lodash2.default.isString(val)) {
    return encodeString(val);
  }

  return;
};

/**
 * prefixed with bytes length
 * @param {Buffer} bytes
 * @return {Buffer} with bytes length prefixed
 */
var encodeBinaryByteArray = exports.encodeBinaryByteArray = function encodeBinaryByteArray(bytes) {
  var lenPrefix = bytes.length;
  return _safeBuffer.Buffer.concat([_varint.UVarInt.encode(lenPrefix), bytes]);
};

/**
 *
 * @param {Object} obj
 * @return {Buffer} with bytes length prefixed
 */
var encodeObjectBinary = exports.encodeObjectBinary = function encodeObjectBinary(obj, isByteLenPrefix) {
  var bufferArr = [];

  Object.keys(obj).forEach(function (key, index) {
    if (key === "msgType" || key === "version") return;

    if (isDefaultValue(obj[key])) return;

    if (_lodash2.default.isArray(obj[key]) && obj[key].length > 0) {
      bufferArr.push(encodeArrayBinary(index, obj[key]));
    } else {
      bufferArr.push(encodeTypeAndField(index, obj[key]));
      bufferArr.push(encodeBinary(obj[key], index, true));
    }
  });

  var bytes = _safeBuffer.Buffer.concat(bufferArr);

  // add prefix
  if (_tx.typePrefix[obj.msgType]) {
    var prefix = _safeBuffer.Buffer.from(_tx.typePrefix[obj.msgType], "hex");
    bytes = _safeBuffer.Buffer.concat([prefix, bytes]);
  }

  // Write byte-length prefixed.
  if (isByteLenPrefix) {
    var lenBytes = _varint.UVarInt.encode(bytes.length);
    bytes = _safeBuffer.Buffer.concat([lenBytes, bytes]);
  }

  return bytes;
};

/**
 * @param {Number} fieldNum object field index
 * @param {Array} arr
 * @param {Boolean} isByteLenPrefix
 * @return {Buffer} bytes of array
 */
var encodeArrayBinary = exports.encodeArrayBinary = function encodeArrayBinary(fieldNum, arr, isByteLenPrefix) {
  var result = [];

  arr.forEach(function (item) {
    result.push(encodeTypeAndField(fieldNum, item));

    if (isDefaultValue(item)) {
      result.push(_safeBuffer.Buffer.from("00", "hex"));
      return;
    }

    result.push(encodeBinary(item, fieldNum, true));
  });

  //encode length
  if (isByteLenPrefix) {
    var length = result.reduce(function (prev, item) {
      return prev + item.length;
    }, 0);
    result.unshift(_varint.UVarInt.encode(length));
  }

  return _safeBuffer.Buffer.concat(result);
};

// Write field key.
var encodeTypeAndField = function encodeTypeAndField(index, field) {
  var value = index + 1 << 3 | (0, _encoderHelper2.default)(field);
  return _varint.UVarInt.encode(value);
};

var isDefaultValue = function isDefaultValue(obj) {
  if (obj === null) return false;

  return _lodash2.default.isNumber(obj) && obj === 0 || _lodash2.default.isString(obj) && obj === "" || _lodash2.default.isArray(obj) && obj.length === 0;
};