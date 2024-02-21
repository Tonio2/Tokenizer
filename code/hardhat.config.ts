import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';

dotenv.config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const SEPOLIA_PRIVATE_KEY1 = process.env.SEPOLIA_PRIVATE_KEY1;

const SEPOLIA_PRIVATE_KEY2 = process.env.SEPOLIA_PRIVATE_KEY2;

if (!ALCHEMY_API_KEY || !SEPOLIA_PRIVATE_KEY1 || !SEPOLIA_PRIVATE_KEY2) {
  throw new Error("Please set your ALCHEMY_API_KEY and SEPOLIA_PRIVATE_KEY1 and SEPOLIA_PRIVATE_KEY2 in a .env file");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY1, SEPOLIA_PRIVATE_KEY2],
    },
  },
};

export default config;
