import { ethers } from "hardhat";
import { contractABI, CONTRACT_ADDRESS } from "./constant";

async function main() {
  const [deployer, otherAccount] = await ethers.getSigners();
  const eco42Token = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    deployer
  );

  eco42Token.fundProject(0, 10, { value: ethers.parseEther("0.01") });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
