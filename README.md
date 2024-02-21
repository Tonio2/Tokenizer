# ECO42Token Project

## Overview

The ECO42Token project is an innovative Ethereum token initiative that utilizes the ERC1155 standard, along with extensions for supply tracking and non-reentrancy security measures. It is designed to facilitate the creation and funding of projects through a decentralized platform. Each project is represented as a unique token within the ECO42Token system, allowing users to fund their favorite projects securely and transparently.

## Features

- **Project Creation:** Users can create projects by specifying a name and the amount needed for funding.
- **Funding Projects:** Users can fund projects by sending Ether, which is converted into project-specific tokens.
- **Non-Reentrancy for Secure Transactions:** Ensures safe and atomic transactions to prevent re-entrancy attacks.
- **ERC1155 Token Standard:** Utilizes the flexible and efficient ERC1155 standard for managing multiple token types in a single contract.

## Installation

To get started with the ECO42Token project, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Tonio2/Tokenizer
   cd Tokenizer/code
   ```
2. **Install Dependencies**

   Ensure you have Node.js and npm installed, then run:

   ```bash
   npm install
   ```

## Testing

The project includes tests for the ECO42Token contract. Run the tests to ensure everything is working correctly:

```bash
npx hardhat test
```

## Starting the Project

To get started with the ECO42Token project, follow these steps:

1. **Environment Setup**

   Create a .env file at the root of your project and add necessary environment variables, such as private keys and Ethereum network RPC URLs.

2. **Compile Contracts**

   ```bash
   npx hardhat compile
   ```

3. **Deploy Contracts**

   Deployment scripts are located in the scripts directory. To deploy the ECO42Token contract to your preferred network, run:

   ```bash
   npx hardhat run scripts/deploy.ts --network <your-network>
   ```

   Note that it is preconfigured for sepolia deployment

3. **Play with premade scritps**

   You can test the contract once deployed by using the scripts pre-written for testing:

   ```bash
   npx hardhat run scripts/accounts.ts --network <your-network>
   npx hardhat run scripts/createProject.ts --network <your-network>
   npx hardhat run scripts/fundProject.ts --network <your-network>
   ```

## Documentation

For more in-depth information about the ECO42Token project, including its architecture and use cases, refer to the documentation/whitepaper.md.

## License

This project is licensed under the MIT License