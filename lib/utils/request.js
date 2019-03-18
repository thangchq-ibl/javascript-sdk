"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @alias utils.HttpRequest
 */
var HttpRequest = function () {
  function HttpRequest(baseURL) {
    _classCallCheck(this, HttpRequest);

    this.httpClient = _axios2.default.create({ baseURL: baseURL });
  }

  _createClass(HttpRequest, [{
    key: "get",
    value: function get(path, params, opts) {
      return this.request("get", path, params, opts);
    }
  }, {
    key: "post",
    value: function post(path, body, opts) {
      return this.request("post", path, body, opts);
    }
  }, {
    key: "request",
    value: function request(method, path, params, opts) {
      var options = _extends({
        method: method,
        url: path
      }, opts);

      if (params) {
        if (method === "get") {
          options.params = params;
        } else {
          options.data = params;
        }
      }

      return this.httpClient.request(options).then(function (response) {
        return { result: response.data, status: response.status };
      }).catch(function (err) {
        // TODO: what if it's not json?
        console.error("error in HttpRequest#request", err);
        var msgObj = err.response && err.response.data && JSON.parse(err.response.data.message);
        var error = new Error(msgObj.message);
        error.code = msgObj.code;
        error.abci_code = msgObj.abci_code;
        throw error;
      });
    }
  }]);

  return HttpRequest;
}();

exports.default = HttpRequest;