"use strict";

require("babel-polyfill");

var _client = require("./client");

var client = _interopRequireWildcard(_client);

var _crypto = require("./crypto");

var crypto = _interopRequireWildcard(_crypto);

var _encoder = require("./encoder");

var amino = _interopRequireWildcard(_encoder);

var _utils = require("./utils");

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var BncClient = client.BncClient;

module.exports = BncClient;
module.exports.crypto = crypto;
module.exports.amino = amino;
module.exports.utils = utils;