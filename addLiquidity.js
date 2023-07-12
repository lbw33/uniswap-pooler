const { ethers } = require('ethers');
const { Token } = require('@uniswap/sdk-core');
const {
  Pool,
  Position,
  nearestUsableTick,
  ADDRESS_ZERO,
} = require('@uniswap/v3-sdk');
const {
  abi: IUniswapV3PoolABI,
} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const {
  abi: INonfungiblePositionManagerABI,
} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json');
const ERC20ABI = require('./abi.json');

const MUMBAI_PROVIDER = new ethers.providers.JsonRpcProvider(
  'https://polygon-mumbai.g.alchemy.com/v2/1I1IVV9ET4AHoICFv4-2iDr0PetQWd63'
);
const WALLET_ADDRESS = '';
const PRIVATE_KEY = '';

const poolAddress = '0x17aa8919F11ce6b35D6eC5723D24be59082D4cAd';
const positionManagerAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

const TOKEN_1_NAME = 'Token1';
const TOKEN_2_NAME = 'Token2';
const TOKEN_1_SYMBOL = 'TK1';
const TOKEN_2_SYMBOL = 'TK2';
const DECIMALS = 18;
const TOKEN_1_ADDRESS = '0x583f8424c6adC530D286B5292191203497fF8980';
const TOKEN_2_ADDRESS = '0x614bC50B9E467dEa445d7e04c3c58051B662401f';
const CHAIN_ID = 80001;

const token1 = new Token(
  CHAIN_ID,
  TOKEN_1_ADDRESS,
  DECIMALS,
  TOKEN_1_SYMBOL,
  TOKEN_1_NAME
);
const token2 = new Token(
  CHAIN_ID,
  TOKEN_2_ADDRESS,
  DECIMALS,
  TOKEN_2_SYMBOL,
  TOKEN_2_NAME
);

const nonfungiblePositionManagerContract = new ethers.Contract(
  positionManagerAddress,
  INonfungiblePositionManagerABI,
  MUMBAI_PROVIDER
);

const poolContract = new ethers.Contract(
  poolAddress,
  IUniswapV3PoolABI,
  MUMBAI_PROVIDER
);

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);
  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY, MUMBAI_PROVIDER);
  const poolData = await getPoolData(poolContract);

  const pool = new Pool(
    token1,
    token2,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('1000000000000'),
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
  });

  const approvalAmount = ethers.utils.parseEther('1000000000000').toString();

  const tokenContract1 = new ethers.Contract(
    TOKEN_1_ADDRESS,
    ERC20ABI,
    MUMBAI_PROVIDER
  );
  await tokenContract1
    .connect(wallet)
    .approve(positionManagerAddress, approvalAmount);

  const tokenContract2 = new ethers.Contract(
    TOKEN_2_ADDRESS,
    ERC20ABI,
    MUMBAI_PROVIDER
  );
  await tokenContract2
    .connect(wallet)
    .approve(positionManagerAddress, approvalAmount);

  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  params = {
    token0: TOKEN_1_ADDRESS,
    token1: TOKEN_2_ADDRESS,
    fee: poolData.fee,
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: WALLET_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  nonfungiblePositionManagerContract
    .connect(wallet)
    .mint(params, { gasLimit: ethers.utils.hexlify(1000000) })
    .then((res) => {
      console.log(res);
    });
}

main();
