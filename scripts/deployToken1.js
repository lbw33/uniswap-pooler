async function main() {
  const [deployer] = await ethers.getSigners();

  const Token1 = await ethers.getContractFactory('Token1', deployer);
  const token1 = await Token1.deploy();

  console.log('Token1 deployed to', token1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
