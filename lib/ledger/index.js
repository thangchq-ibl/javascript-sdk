"use strict";

/********************************************************************************
 *   Binance Chain Ledger App Interface
 *   (c) 2018-2019 Binance
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/

var isBrowser = typeof window !== "undefined";
var Ledger = module.exports;

Ledger.app = Ledger.LedgerApp = require("./ledger-app");

Ledger.transports = {
  u2f: require("@ledgerhq/hw-transport-u2f").default,
  wble: require("@ledgerhq/hw-transport-web-ble").default,

  // requiring the node transport in the browser causes a bit of an issue with webpack!
  node: !isBrowser ? require("@ledgerhq/hw-transport-node-hid").default : null
};

module.exports = Ledger;