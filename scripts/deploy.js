const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy ArtToken
  const ArtToken = await hre.ethers.getContractFactory("ArtToken");
  const artToken = await ArtToken.deploy();
  await artToken.deployed();
  console.log("ArtToken deployed to:", artToken.address);

  // Deploy ArtMarketplace with token address if needed
  const ArtMarketplace = await hre.ethers.getContractFactory("ArtMarketplace");
  const artMarketplace = await ArtMarketplace.deploy(artToken.address); // remove argument if not required
  await artMarketplace.deployed();
  console.log("ArtMarketplace deployed to:", artMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
