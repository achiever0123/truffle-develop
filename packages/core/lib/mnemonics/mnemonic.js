/**
 * @module mnemonic;
 * @requires module:@truffle/config
 * @requires module:seedrandom
 * @requires module:ethereum-cryptography
 * @requires module:ethereumjs-wallet/hdkey
 * @requires module:crypto
 */

const Config = require("@truffle/config");
const defaultUserConfig = Config.getUserConfig();
const {
  entropyToMnemonic,
  mnemonicToSeedSync
} = require("ethereum-cryptography/bip39");
const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
const { hdkey } = require("ethereumjs-wallet");
const crypto = require("crypto");

const mnemonic = {
  /**
   * gets user-level mnemonic from user config, and if missing generates a new mnemonic
   * @returns {String} mnemonic
   */
  getOrGenerateMnemonic: function () {
    let mnemonic;
    const userMnemonicExists = defaultUserConfig.get("mnemonic");
    if (!userMnemonicExists) {
      mnemonic = entropyToMnemonic(crypto.randomBytes(16), wordlist);
      defaultUserConfig.set({ mnemonic: mnemonic });
    } else {
      mnemonic = userMnemonicExists;
    }

    return mnemonic;
  },

  /**
   * gets accounts object using mnemonic
   * @param {String}
   * @returns {Object} mnemonicObject
   */
  getAccountsInfo: function (numAddresses) {
    let mnemonic = this.getOrGenerateMnemonic();
    let accounts = [];
    let privateKeys = [];

    let hdwallet = hdkey.fromMasterSeed(
      Buffer.from(mnemonicToSeedSync(mnemonic))
    );
    let addressIndex = 0;
    let walletHdpath = "m/44'/60'/0'/0/";

    for (let i = addressIndex; i < addressIndex + numAddresses; i++) {
      let wallet = hdwallet.derivePath(walletHdpath + i).getWallet();
      let addr = "0x" + wallet.getAddress().toString("hex");
      let privKey = wallet.getPrivateKey().toString("hex");
      accounts.push(addr);
      privateKeys.push(privKey);
    }

    return {
      mnemonic,
      accounts,
      privateKeys
    };
  }
};

module.exports = mnemonic;
