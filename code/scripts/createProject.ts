import { ethers } from "hardhat";
import { contractABI, CONTRACT_ADDRESS } from "./constant";

async function main() {
  const [deployer, otherAccount] = await ethers.getSigners();
  const eco42Token = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    otherAccount
  );

  eco42Token.createProject("Project", 1000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
