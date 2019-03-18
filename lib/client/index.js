"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BncClient = exports.LedgerSigningDelegate = exports.DefaultSigningDelegate = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crypto = require("../crypto");

var crypto = _interopRequireWildcard(_crypto);

var _tx = require("../tx");

var _tx2 = _interopRequireDefault(_tx);

var _request = require("../utils/request");

var _request2 = _interopRequireDefault(_request);

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @module client
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


var MAX_INT64 = Math.pow(2, 63);

var api = {
  broadcast: "/api/v1/broadcast",
  nodeInfo: "/api/v1/node-info",
  getAccount: "/api/v1/account"

  /**
   * The default signing delegate which uses the local private key.
   * @param  {Transaction} tx      the transaction
   * @param  {Object}      signMsg the canonical sign bytes for the msg
   * @return {Transaction}
   */
};var DefaultSigningDelegate = exports.DefaultSigningDelegate = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(tx, signMsg) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", tx.sign(this.privateKey, signMsg));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function DefaultSigningDelegate(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * The Ledger signing delegate.
 * @param  {LedgerApp}  ledgerApp
 * @param  {preSignCb}  function
 * @param  {postSignCb} function
 * @param  {errCb} function
 * @return {function}
 */
var LedgerSigningDelegate = exports.LedgerSigningDelegate = function LedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb) {
  return function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(tx, signMsg) {
      var signBytes, pubKeyResp, sigResp, pubKey;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              signBytes = tx.getSignBytes(signMsg);

              preSignCb && preSignCb(signBytes);
              pubKeyResp = void 0, sigResp = void 0;
              _context2.prev = 3;
              _context2.next = 6;
              return ledgerApp.getPublicKey();

            case 6:
              pubKeyResp = _context2.sent;
              _context2.next = 9;
              return ledgerApp.sign(signBytes);

            case 9:
              sigResp = _context2.sent;

              postSignCb && postSignCb(pubKeyResp, sigResp);
              _context2.next = 17;
              break;

            case 13:
              _context2.prev = 13;
              _context2.t0 = _context2["catch"](3);

              console.warn("LedgerSigningDelegate error", _context2.t0);
              errCb && errCb(_context2.t0);

            case 17:
              if (!(sigResp && sigResp.signature)) {
                _context2.next = 20;
                break;
              }

              pubKey = crypto.getPublicKey(pubKeyResp.pk.toString("hex"));
              return _context2.abrupt("return", tx.addSignature(pubKey, sigResp.signature));

            case 20:
              return _context2.abrupt("return", tx);

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[3, 13]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();
};

/**
 * validate the input number.
 * @param {Number} value
 */
var checkNumber = function checkNumber(value) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "input number";

  if (MAX_INT64 < value) {
    throw new Error(name + " should be less than 2^63");
  }
};

/**
 * The Binance Chain client.
 */

var BncClient = function () {
  /**
   * @param {string} server Binance Chain public url
   * @param {Boolean} useAsyncBroadcast use async broadcast mode, faster but less guarantees (default off)
   */
  function BncClient(server) {
    var useAsyncBroadcast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, BncClient);

    if (!server) {
      throw new Error("Binance chain server should not be null");
    }
    this._httpClient = new _request2.default(server);
    this._signingDelegate = DefaultSigningDelegate;
    this._useAsyncBroadcast = useAsyncBroadcast;
  }

  /**
   * Initialize the client with the chain's ID. Asynchronous.
   * @return {Promise}
   */


  _createClass(BncClient, [{
    key: "initChain",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var data;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.chainId) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 3;
                return this._httpClient.request("get", api.nodeInfo);

              case 3:
                data = _context3.sent;

                this.chainId = data.result.node_info && data.result.node_info.network;

              case 5:
                return _context3.abrupt("return", this);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function initChain() {
        return _ref3.apply(this, arguments);
      }

      return initChain;
    }()

    /**
     * Sets the client's private key for calls made by this client. Asynchronous.
     * @return {Promise}
     */

  }, {
    key: "setPrivateKey",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(privateKey) {
        var address, promise, data;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(privateKey !== this.privateKey)) {
                  _context4.next = 13;
                  break;
                }

                address = crypto.getAddressFromPrivateKey(privateKey);

                if (address) {
                  _context4.next = 4;
                  break;
                }

                throw new Error("address is falsy: ${address}. invalid private key?");

              case 4:
                if (!(address === this.address)) {
                  _context4.next = 6;
                  break;
                }

                return _context4.abrupt("return", this);

              case 6:
                // safety
                this.privateKey = privateKey;
                this.address = address;
                // _setPkPromise used in _sendTransaction for non-await calls
                promise = this._setPkPromise = this._httpClient.request("get", api.getAccount + "/" + address);
                _context4.next = 11;
                return promise;

              case 11:
                data = _context4.sent;

                this.account_number = data.result.account_number;

              case 13:
                return _context4.abrupt("return", this);

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setPrivateKey(_x7) {
        return _ref4.apply(this, arguments);
      }

      return setPrivateKey;
    }()

    /**
     * Use async broadcast mode. Broadcasts faster with less guarantees (default off)
     * @param {Boolean} useAsyncBroadcast
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useAsyncBroadcast",
    value: function useAsyncBroadcast() {
      var _useAsyncBroadcast = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._useAsyncBroadcast = _useAsyncBroadcast;
      return this;
    }

    /**
     * Sets the signing delegate (for wallet integrations).
     * @param {function} delegate
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "setSigningDelegate",
    value: function setSigningDelegate(delegate) {
      if (typeof delegate !== "function") throw new Error("delegate must be a function");
      this._signingDelegate = delegate;
      return this;
    }

    /**
     * Applies the default signing delegate.
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useDefaultSigningDelegate",
    value: function useDefaultSigningDelegate() {
      this._signingDelegate = DefaultSigningDelegate;
      return this;
    }

    /**
     * Applies the Ledger signing delegate.
     * @param {function} ledgerApp
     * @param {function} preSignCb
     * @param {function} postSignCb
     * @param {function} errCb
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useLedgerSigningDelegate",
    value: function useLedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb) {
      this._signingDelegate = LedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb);
      return this;
    }

    /**
     * Transfer tokens from one address to another.
     * @param {String} fromAddress
     * @param {String} toAddress
     * @param {Number} amount
     * @param {String} asset
     * @param {String} memo optional memo
     * @param {Number} sequence optional sequence
     * @return {Object} response (success or fail)
     */

  }, {
    key: "transfer",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(fromAddress, toAddress, amount, asset) {
        var memo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
        var sequence = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var accCode, toAccCode, coin, msg, signMsg;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                accCode = crypto.decodeAddress(fromAddress);
                toAccCode = crypto.decodeAddress(toAddress);

                amount = parseInt(amount * Math.pow(10, 8));

                checkNumber(amount, "amount");

                coin = {
                  denom: asset,
                  amount: amount
                };
                msg = {
                  inputs: [{
                    address: accCode,
                    coins: [coin]
                  }],
                  outputs: [{
                    address: toAccCode,
                    coins: [coin]
                  }],
                  msgType: "MsgSend"
                };
                signMsg = {
                  inputs: [{
                    address: fromAddress,
                    coins: [{
                      amount: amount,
                      denom: asset
                    }]
                  }],
                  outputs: [{
                    address: toAddress,
                    coins: [{
                      amount: amount,
                      denom: asset
                    }]
                  }]
                };
                _context5.next = 9;
                return this._sendTransaction(msg, signMsg, fromAddress, sequence, memo);

              case 9:
                return _context5.abrupt("return", _context5.sent);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function transfer(_x11, _x12, _x13, _x14) {
        return _ref5.apply(this, arguments);
      }

      return transfer;
    }()

    /**
     * Cancel an order.
     * @param {String} fromAddress
     * @param {String} symbol the market pair
     * @param {String} refid the order ID of the order to cancel
     * @param {Number} sequence optional sequence
     * @return {Object} response (success or fail)
     */

  }, {
    key: "cancelOrder",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(fromAddress, symbol, refid) {
        var sequence = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var accCode, msg, signMsg;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                accCode = crypto.decodeAddress(fromAddress);
                msg = {
                  sender: accCode,
                  symbol: symbol,
                  refid: refid,
                  msgType: "CancelOrderMsg"
                };
                signMsg = {
                  refid: refid,
                  sender: fromAddress,
                  symbol: symbol
                };
                return _context6.abrupt("return", this._sendTransaction(msg, signMsg, fromAddress, sequence, ""));

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function cancelOrder(_x16, _x17, _x18) {
        return _ref6.apply(this, arguments);
      }

      return cancelOrder;
    }()

    /**
     * Place an order.
     * @param {String} address
     * @param {String} symbol the market pair
     * @param {Number} side (1-Buy, 2-Sell)
     * @param {Number} price
     * @param {Number} quantity
     * @param {Number} sequence optional sequence
     * @param {Number} timeinforce (1-GTC(Good Till Expire), 3-IOC(Immediate or Cancel))
     * @return {Object} response (success or fail)
     */

  }, {
    key: "placeOrder",
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.address;
        var symbol = arguments[1];
        var side = arguments[2];
        var price = arguments[3];
        var quantity = arguments[4];
        var sequence = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        var timeinforce = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;
        var accCode, data, bigPrice, bigQuantity, placeOrderMsg, signMsg;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (address) {
                  _context7.next = 2;
                  break;
                }

                throw new Error("address should not be falsy");

              case 2:
                if (symbol) {
                  _context7.next = 4;
                  break;
                }

                throw new Error("symbol should not be falsy");

              case 4:
                if (!(side !== 1 && side !== 2)) {
                  _context7.next = 6;
                  break;
                }

                throw new Error("side can only be 1 or 2");

              case 6:
                if (!(timeinforce !== 1 && timeinforce !== 3)) {
                  _context7.next = 8;
                  break;
                }

                throw new Error("timeinforce can only be 1 or 3");

              case 8:
                accCode = crypto.decodeAddress(address);

                if (!(sequence !== 0 && !sequence)) {
                  _context7.next = 14;
                  break;
                }

                _context7.next = 12;
                return this._httpClient.request("get", api.getAccount + "/" + address);

              case 12:
                data = _context7.sent;

                sequence = data.result && data.result.sequence;

              case 14:
                bigPrice = new _big2.default(price);
                bigQuantity = new _big2.default(quantity);
                placeOrderMsg = {
                  sender: accCode,
                  id: (accCode.toString("hex") + "-" + (sequence + 1)).toUpperCase(),
                  symbol: symbol,
                  ordertype: 2,
                  side: side,
                  price: parseFloat(bigPrice.mul(Math.pow(10, 8)).toString(), 10),
                  quantity: parseFloat(bigQuantity.mul(Math.pow(10, 8)).toString(), 10),
                  timeinforce: timeinforce,
                  msgType: "NewOrderMsg"
                };
                signMsg = {
                  id: placeOrderMsg.id,
                  ordertype: placeOrderMsg.ordertype,
                  price: placeOrderMsg.price,
                  quantity: placeOrderMsg.quantity,
                  sender: address,
                  side: placeOrderMsg.side,
                  symbol: placeOrderMsg.symbol,
                  timeinforce: timeinforce
                };


                checkNumber(placeOrderMsg.price, "price");
                checkNumber(placeOrderMsg.quantity, "quantity");

                _context7.next = 22;
                return this._sendTransaction(placeOrderMsg, signMsg, address, sequence, "");

              case 22:
                return _context7.abrupt("return", _context7.sent);

              case 23:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function placeOrder() {
        return _ref7.apply(this, arguments);
      }

      return placeOrder;
    }()

    /**
     * Broadcast a raw transaction to the blockchain.
     * @param {Object} msg the msg object
     * @param {Object} stdSignMsg the sign doc object used to generate a signature
     * @param {String} address
     * @param {Number} sequence optional sequence
     * @param {String} memo optional memo
     * @param {Boolean} sync use synchronous mode, optional
     * @return {Object} response (success or fail)
     */

  }, {
    key: "_sendTransaction",
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(msg, stdSignMsg, address) {
        var sequence = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var memo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
        var sync = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : !this._useAsyncBroadcast;
        var data, options, tx, signedTx, signedBz, opts;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!((!this.account_number || !sequence) && address)) {
                  _context8.next = 8;
                  break;
                }

                _context8.next = 3;
                return this._httpClient.request("get", api.getAccount + "/" + address);

              case 3:
                data = _context8.sent;

                sequence = data.result.sequence;
                this.account_number = data.result.account_number;
                // if user has not used `await` in its call to setPrivateKey (old API), we should wait for the promise here
                _context8.next = 11;
                break;

              case 8:
                if (!this._setPkPromise) {
                  _context8.next = 11;
                  break;
                }

                _context8.next = 11;
                return this._setPkPromise;

              case 11:
                options = {
                  account_number: parseInt(this.account_number),
                  chain_id: this.chainId,
                  memo: memo,
                  msg: msg,
                  sequence: parseInt(sequence),
                  type: msg.msgType
                };
                tx = new _tx2.default(options);
                _context8.next = 15;
                return this._signingDelegate.call(this, tx, stdSignMsg);

              case 15:
                signedTx = _context8.sent;
                signedBz = signedTx.serialize();
                opts = {
                  data: signedBz,
                  headers: {
                    "content-type": "text/plain"
                  }
                };
                _context8.next = 20;
                return this._httpClient.request("post", api.broadcast + "?sync=" + sync, null, opts);

              case 20:
                return _context8.abrupt("return", _context8.sent);

              case 21:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function _sendTransaction(_x25, _x26, _x27) {
        return _ref8.apply(this, arguments);
      }

      return _sendTransaction;
    }()

    /**
     * get account
     * @param {String} address
     * @return {Object} http response
     */

  }, {
    key: "getAccount",
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.address;
        var data;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (address) {
                  _context9.next = 2;
                  break;
                }

                throw new Error("address should not be falsy");

              case 2:
                _context9.prev = 2;
                _context9.next = 5;
                return this._httpClient.request("get", api.getAccount + "/" + address);

              case 5:
                data = _context9.sent;
                return _context9.abrupt("return", data);

              case 9:
                _context9.prev = 9;
                _context9.t0 = _context9["catch"](2);
                return _context9.abrupt("return", null);

              case 12:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[2, 9]]);
      }));

      function getAccount() {
        return _ref9.apply(this, arguments);
      }

      return getAccount;
    }()

    /**
     * get balances
     * @param {String} address optional address
     * @return {Object} http response
     */

  }, {
    key: "getBalance",
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.address;
        var data;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.prev = 0;
                _context10.next = 3;
                return this.getAccount(address);

              case 3:
                data = _context10.sent;
                return _context10.abrupt("return", data.result.balances);

              case 7:
                _context10.prev = 7;
                _context10.t0 = _context10["catch"](0);
                return _context10.abrupt("return", []);

              case 10:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[0, 7]]);
      }));

      function getBalance() {
        return _ref10.apply(this, arguments);
      }

      return getBalance;
    }()

    /**
     * Creates a private key.
     * @return {Object}
     * {
     *  address,
     *  privateKey
     * }
     */

  }, {
    key: "createAccount",
    value: function createAccount() {
      var privateKey = crypto.generatePrivateKey();
      return {
        privateKey: privateKey,
        address: crypto.getAddressFromPrivateKey(privateKey)
      };
    }

    /**
     *
     * @param {String} password
     *  {
     *  privateKey,
     *  address,
     *  keystore
     * }
     */

  }, {
    key: "createAccountWithKeystore",
    value: function createAccountWithKeystore(password) {
      if (!password) {
        throw new Error("password should not be falsy");
      }
      var privateKey = crypto.generatePrivateKey();
      var address = crypto.getAddressFromPrivateKey(privateKey);
      var keystore = crypto.generateKeyStore(privateKey, password);
      return {
        privateKey: privateKey,
        address: address,
        keystore: keystore
      };
    }

    /**
     * @return {Object}
     * {
     *  privateKey,
     *  address,
     *  mnemonic
     * }
     */

  }, {
    key: "createAccountWithMneomnic",
    value: function createAccountWithMneomnic() {
      var mnemonic = crypto.generateMnemonic();
      var privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic);
      var address = crypto.getAddressFromPrivateKey(privateKey);
      return {
        privateKey: privateKey,
        address: address,
        mnemonic: mnemonic
      };
    }

    /**
     * @param {String} keystore
     * @param {String} password
     * {
     * privateKey,
     * address
     * }
     */

  }, {
    key: "recoverAccountFromKeystore",
    value: function recoverAccountFromKeystore(keystore, password) {
      var privateKey = crypto.getPrivateKeyFromKeyStore(keystore, password);
      var address = crypto.getAddressFromPrivateKey(privateKey);
      return {
        privateKey: privateKey,
        address: address
      };
    }

    /**
     * @param {String} mneomnic
     * {
     * privateKey,
     * address
     * }
     */

  }, {
    key: "recoverAccountFromMneomnic",
    value: function recoverAccountFromMneomnic(mneomnic) {
      var privateKey = crypto.getPrivateKeyFromMnemonic(mneomnic);
      var address = crypto.getAddressFromPrivateKey(privateKey);
      return {
        privateKey: privateKey,
        address: address
      };
    }

    /**
     * @param {String} privateKey
     * {
     * privateKey,
     * address
     * }
     */

  }, {
    key: "recoverAccountFromPrivateKey",
    value: function recoverAccountFromPrivateKey(privateKey) {
      var address = crypto.getAddressFromPrivateKey(privateKey);
      return {
        privateKey: privateKey,
        address: address
      };
    }

    /**
     * @param {String} address
     * @return {Boolean}
     */

  }, {
    key: "checkAddress",
    value: function checkAddress(address) {
      return crypto.checkAddress(address);
    }

    /**
     * Returns the address for the current account if setPrivateKey has been called on this client.
     * @return {String}
     */

  }, {
    key: "getClientKeyAddress",
    value: function getClientKeyAddress() {
      if (!this.privateKey) throw new Error("no private key is set on this client");
      var address = crypto.getAddressFromPrivateKey(this.privateKey);
      this.address = address;
      return address;
    }
  }]);

  return BncClient;
}();

exports.BncClient = BncClient;