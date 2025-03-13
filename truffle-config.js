const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = "pony foot autumn jump antenna occur plug ridge energy chief oyster produce"; // NEVER expose this in public repos
const sepoliaRPC = "https://eth-sepolia.g.alchemy.com/v2/oJTjnNCsJEOqYv3MMtrtT6LUFhwcW9pR"; // or use Alchemy

module.exports = {
  contracts_build_directory: './client/src/contracts',

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, sepoliaRPC),
      network_id: 11155111,       // Sepolia's network id
      gas: 5500000,               // Gas limit
      confirmations: 2,          // # of confs to wait between deployments
      timeoutBlocks: 200,        // # of blocks before a deployment times out
      skipDryRun: true,         // Skip dry run before migrations
      networkCheckTimeout: 100000  // <- 👈 increase this to avoid timeouts

    },
  },

  compilers: {
    solc: {
      version: "0.8.13",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  mocha: {
    // timeout: 100000
  }
};
