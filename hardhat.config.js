require('dotenv').config({ path: '.env' });
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    }
  },

  defaultNetwork: "localhost",

  networks: {
    localhost: {
      url: 'http://localhost:8545',
      chainId: 1074,
      accounts: 
      [
        process.env.PRIVATE_KEY1,
        process.env.PRIVATE_KEY2,
        process.env.PRIVATE_KEY3,
        process.env.PRIVATE_KEY4
      ],
      timeout: 60000
    }
  }
};


