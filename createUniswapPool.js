const { BigNumber, ethers } = require('ethers');
const axios = require('axios');
const bn = require('bignumber.js');
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const artifacts = {
  UniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'),
  NonfungiblePositionManager: require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
};

const UNISWAP_V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
const POLYSCAN_API_KEY = 'E3FWWYMWDMNG5NTQ3I7UUZWGS3MDIF8QJ';
const MUMBAI_PROVIDER = new ethers.providers.JsonRpcProvider('');
const WALLET_ADDRESS = '';
const PRIVATE_KEY = '';

const TOKEN_1_ADDRESS = '0x583f8424c6adC530D286B5292191203497fF8980';
const TOKEN_2_ADDRESS = '0x614bC50B9E467dEa445d7e04c3c58051B662401f';

const wallet = new ethers.Wallet(PRIVATE_KEY, MUMBAI_PROVIDER);

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

async function main() {
  //set up v3 factory
  const url = `https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=${UNISWAP_V3_FACTORY_ADDRESS}&apikey=${POLYSCAN_API_KEY}`;
  const res = await axios.get(url);
  const abi = JSON.parse(res.data.result);

  const nonfungiblePositionManager = new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    MUMBAI_PROVIDER
  );

  const factoryContract = new ethers.Contract(
    UNISWAP_V3_FACTORY_ADDRESS,
    abi,
    MUMBAI_PROVIDER
  );

  // create pool
  // const tx = await factoryContract
  //   .connect(wallet)
  //   .createPool(TOKEN_1_ADDRESS, TOKEN_2_ADDRESS, 500);
  // const receipt = await tx.wait();
  // console.log('receipt:', receipt);
  const tx = await nonfungiblePositionManager
    .connect(wallet)
    .createAndInitializePoolIfNecessary(
      TOKEN_1_ADDRESS,
      TOKEN_2_ADDRESS,
      500,
      encodePriceSqrt(1, 1),
      { gasLimit: 5000000 }
    );
  const receipt = await tx.wait();
  console.log('receipt:', receipt);

  const newPoolAddress = await factoryContract
    .connect(wallet)
    .getPool(TOKEN_1_ADDRESS, TOKEN_2_ADDRESS, 500);
  console.log('newPoolAddress:', newPoolAddress);
}

main();
