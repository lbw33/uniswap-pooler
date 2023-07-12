require('@nomicfoundation/hardhat-toolbox');

const PRIVATE_KEY = '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  defaultNetwork: 'mumbai',
  networks: {
    mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/',
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
