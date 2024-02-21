import { ethers } from "hardhat";
import { contractABI, CONTRACT_ADDRESS } from "./constant";

async function main() {
  const [deployer, otherAccount] = await ethers.getSigners();

  console.log("Contract deployed at address:", CONTRACT_ADDRESS);

  console.log(
    `Available_accounts: ${deployer.address} ${otherAccount.address}`
  );

  console.log(
    "Money available in the contract:",
    ethers.formatEther(await ethers.provider.getBalance(CONTRACT_ADDRESS))
  );
  console.log(
    "Money available in the contract owner:",
    ethers.formatEther(await ethers.provider.getBalance(deployer))
  );
  console.log(
    "Money available in the other account:",
    ethers.formatEther(await ethers.provider.getBalance(otherAccount))
  );

  const eco42Token = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    otherAccount
  );

  const projectCount = await eco42Token.projectCount();
  console.log("Project count:", projectCount.toString());

  //   eco42Token.createProject("Project 1", 1000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
