import { ethers } from "hardhat";

async function main() {

  const eco42 = await ethers.deployContract("ECO42Token");

  await eco42.waitForDeployment();

  console.log(
    `Smart Contract ECO42Token deployed to ${eco42.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
