"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrivateKeyFromMnemonic = exports.validateMnemonic = exports.generateMnemonic = exports.getPrivateKeyFromKeyStore = exports.generateKeyStore = exports.verifySignature = exports.generateSignature = exports.getAddressFromPrivateKey = exports.getAddressFromPublicKey = exports.generatePubKey = exports.getPublicKeyFromPrivateKey = exports.getPublicKey = exports.generateRandomArray = exports.generatePrivateKey = exports.encodeAddress = exports.checkAddress = exports.decodeAddress = undefined;

var _secureRandom = require("secure-random");

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _bech = require("bech32");

var _bech2 = _interopRequireDefault(_bech);

var _cryptoBrowserify = require("crypto-browserify");

var _cryptoBrowserify2 = _interopRequireDefault(_cryptoBrowserify);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _bip = require("bip39");

var _bip2 = _interopRequireDefault(_bip);

var _bip3 = require("bip32");

var _bip4 = _interopRequireDefault(_bip3);

var _elliptic = require("elliptic");

var _tinySecp256k = require("tiny-secp256k1");

var _tinySecp256k2 = _interopRequireDefault(_tinySecp256k);

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// secp256k1 privkey is 32 bytes
/**
 * @module crypto
 */

var PRIVKEY_LEN = 32;
var MNEMONIC_LEN = 256;
var CURVE = "secp256k1";

//hdpath
var HDPATH = "44'/714'/0'/0/0";

var ec = new _elliptic.ec(CURVE);

/**
 * Decodes an address in bech32 format.
 * @param {string} value the bech32 address to decode
 */
var decodeAddress = exports.decodeAddress = function decodeAddress(value) {
  var decodeAddress = _bech2.default.decode(value);
  return Buffer.from(_bech2.default.fromWords(decodeAddress.words));
};

/**
 * checek address whether is valid
 * @param {string} address the bech32 address to decode
 */
var checkAddress = exports.checkAddress = function checkAddress(address) {
  try {
    var _decodeAddress = _bech2.default.decode(address);
    if (_decodeAddress.prefix === "tbnb") {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

/**
 * Encodes an address from input data bytes.
 * @param {string} value the public key to encode
 * @param {*} prefix the address prefix
 * @param {*} type the output type (default: hex)
 */
var encodeAddress = exports.encodeAddress = function encodeAddress(value) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "tbnb";
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "hex";

  var words = _bech2.default.toWords(Buffer.from(value, type));
  return _bech2.default.encode(prefix, words);
};

/**
 * Generates 32 bytes of random entropy
 * @param {number} len output length (default: 32 bytes)
 * @returns {string} entropy bytes hexstring
 */
var generatePrivateKey = exports.generatePrivateKey = function generatePrivateKey() {
  var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : PRIVKEY_LEN;
  return (0, _utils.ab2hexstring)((0, _secureRandom2.default)(len));
};

/**
 * Generates an arrayBuffer filled with random bits.
 * @param {number} length - Length of buffer.
 * @returns {ArrayBuffer}
 */
var generateRandomArray = exports.generateRandomArray = function generateRandomArray(length) {
  return (0, _secureRandom2.default)(length);
};

/**
 * @param {string} publicKey - Encoded public key
 * @return {Elliptic.PublicKey} public key hexstring
 */
var getPublicKey = exports.getPublicKey = function getPublicKey(publicKey) {
  var keyPair = ec.keyFromPublic(publicKey, "hex");
  return keyPair.getPublic();
};

/**
 * Calculates the public key from a given private key.
 * @param {string} privateKeyHex the private key hexstring
 * @return {string} public key hexstring
 */
var getPublicKeyFromPrivateKey = exports.getPublicKeyFromPrivateKey = function getPublicKeyFromPrivateKey(privateKeyHex) {
  var curve = new _elliptic.ec(CURVE);
  var keypair = curve.keyFromPrivate(privateKeyHex, "hex");
  var unencodedPubKey = keypair.getPublic().encode("hex");
  return unencodedPubKey;
};

/**
 * PubKey performs the point-scalar multiplication from the privKey on the
 * generator point to get the pubkey.
 * @param {Buffer} privateKey
 * @return {Elliptic.PublicKey} PubKey
 * */
var generatePubKey = exports.generatePubKey = function generatePubKey(privateKey) {
  var curve = new _elliptic.ec(CURVE);
  var keypair = curve.keyFromPrivate(privateKey);
  return keypair.getPublic();
};

/**
 * Gets an address from a public key hex.
 * @param {string} publicKeyHex the public key hexstring
 */
var getAddressFromPublicKey = exports.getAddressFromPublicKey = function getAddressFromPublicKey(publicKeyHex) {
  var pubKey = ec.keyFromPublic(publicKeyHex, "hex");
  var pubPoint = pubKey.getPublic();
  var compressed = pubPoint.encodeCompressed();
  var hexed = (0, _utils.ab2hexstring)(compressed);
  var hash = (0, _utils.sha256ripemd160)(hexed); // https://git.io/fAn8N
  var address = encodeAddress(hash);
  return address;
};

/**
 * Gets an address from a private key.
 * @param {string} privateKeyHex the private key hexstring
 */
var getAddressFromPrivateKey = exports.getAddressFromPrivateKey = function getAddressFromPrivateKey(privateKeyHex) {
  return getAddressFromPublicKey(getPublicKeyFromPrivateKey(privateKeyHex));
};

/**
 * Generates a signature (64 byte <r,s>) for a transaction based on given private key.
 * @param {string} signBytesHex - Unsigned transaction sign bytes hexstring.
 * @param {string | Buffer} privateKey - The private key.
 * @return {Buffer} Signature. Does not include tx.
 */
var generateSignature = exports.generateSignature = function generateSignature(signBytesHex, privateKey) {
  var msgHash = (0, _utils.sha256)(signBytesHex);
  var msgHashHex = Buffer.from(msgHash, "hex");
  var signature = _tinySecp256k2.default.sign(msgHashHex, Buffer.from(privateKey, "hex")); // enc ignored if buffer
  return signature;
};

/**
 * Verifies a signature (64 byte <r,s>) given the sign bytes and public key.
 * @param {string} sigHex - The signature hexstring.
 * @param {string} signBytesHex - Unsigned transaction sign bytes hexstring.
 * @param {string} publicKeyHex - The public key.
 * @return {Buffer} Signature. Does not include tx.
 */
var verifySignature = exports.verifySignature = function verifySignature(sigHex, signBytesHex, publicKeyHex) {
  var publicKey = Buffer.from(publicKeyHex, "hex");
  if (!_tinySecp256k2.default.isPoint(publicKey)) throw new Error("Invalid public key provided");
  var msgHash = (0, _utils.sha256)(signBytesHex);
  var msgHashHex = Buffer.from(msgHash, "hex");
  return _tinySecp256k2.default.verify(msgHashHex, publicKey, Buffer.from(sigHex, "hex"));
};

/**
 * Generates a keystore based on given private key and password.
 * @param {string} privateKeyHex the private key hexstring.
 * @param {string} password the password.
 * @return {object} the keystore object.
 */
var generateKeyStore = exports.generateKeyStore = function generateKeyStore(privateKeyHex, password) {
  var salt = _cryptoBrowserify2.default.randomBytes(32);
  var iv = _cryptoBrowserify2.default.randomBytes(16);
  var cipherAlg = "aes-256-ctr";

  var kdf = "pbkdf2";
  var kdfparams = {
    dklen: 32,
    salt: salt.toString("hex"),
    c: 262144,
    prf: "hmac-sha256"
  };

  var derivedKey = _cryptoBrowserify2.default.pbkdf2Sync(Buffer.from(password), salt, kdfparams.c, kdfparams.dklen, "sha256");
  var cipher = _cryptoBrowserify2.default.createCipheriv(cipherAlg, derivedKey.slice(0, 32), iv);
  if (!cipher) {
    throw new Error("Unsupported cipher");
  }

  var ciphertext = Buffer.concat([cipher.update(Buffer.from(privateKeyHex, "hex")), cipher.final()]);
  var bufferValue = Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, "hex")]);

  return {
    version: 1,
    id: _uuid2.default.v4({
      random: _cryptoBrowserify2.default.randomBytes(16)
    }),
    crypto: {
      ciphertext: ciphertext.toString("hex"),
      cipherparams: {
        iv: iv.toString("hex")
      },
      cipher: cipherAlg,
      kdf: kdf,
      kdfparams: kdfparams,
      mac: (0, _utils.sha256)(bufferValue.toString("hex"))
    }
  };
};

/**
 * Gets a private key from a keystore given its password.
 * @param {string} keystore the keystore in json format
 * @param {string} password the password.
 */
var getPrivateKeyFromKeyStore = exports.getPrivateKeyFromKeyStore = function getPrivateKeyFromKeyStore(keystore, password) {

  if (!_lodash2.default.isString(password)) {
    throw new Error("No password given.");
  }

  var json = _lodash2.default.isObject(keystore) ? keystore : JSON.parse(keystore);
  var kdfparams = json.crypto.kdfparams;

  if (kdfparams.prf !== "hmac-sha256") {
    throw new Error("Unsupported parameters to PBKDF2");
  }

  var derivedKey = _cryptoBrowserify2.default.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, "hex"), kdfparams.c, kdfparams.dklen, "sha256");
  var ciphertext = Buffer.from(json.crypto.ciphertext, "hex");
  var bufferValue = Buffer.concat([derivedKey.slice(16, 32), ciphertext]);
  var mac = (0, _utils.sha256)(bufferValue.toString("hex"));

  if (mac !== json.crypto.mac) {
    throw new Error("Key derivation failed - possibly wrong password");
  }

  var decipher = _cryptoBrowserify2.default.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 32), Buffer.from(json.crypto.cipherparams.iv, "hex"));
  var privateKey = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("hex");

  return privateKey;
};

/**
 * Generates mnemonic phrase words using random entropy.
 */
var generateMnemonic = exports.generateMnemonic = function generateMnemonic() {
  return _bip2.default.generateMnemonic(MNEMONIC_LEN);
};

/**
 * Validates mnemonic phrase words.
 * @param {string} mnemonic the mnemonic phrase words
 * @return {bool} validation result
 */
var validateMnemonic = exports.validateMnemonic = _bip2.default.validateMnemonic;

/**
 * Get a private key from mnemonic words.
 * @param {string} mnemonic the mnemonic phrase words
 * @param {Boolean} derive derive a private key using the default HD path (default: true)
 * @return {string} hexstring
 */
var getPrivateKeyFromMnemonic = exports.getPrivateKeyFromMnemonic = function getPrivateKeyFromMnemonic(mnemonic) {
  var derive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (!_bip2.default.validateMnemonic(mnemonic)) {
    throw new Error("wrong mnemonic format");
  }
  var seed = _bip2.default.mnemonicToSeed(mnemonic);
  if (derive) {
    var master = _bip4.default.fromSeed(seed);
    var child = master.derivePath(HDPATH);
    return child.privateKey.toString("hex");
  }
  return seed.toString("hex");
};