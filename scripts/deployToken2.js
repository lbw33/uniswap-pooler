async function main() {
  const [deployer] = await ethers.getSigners();

  const Token2 = await ethers.getContractFactory('Token2', deployer);
  const token2 = await Token2.deploy();

  console.log('Token2 deployed to', token2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
