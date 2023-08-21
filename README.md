# Multi-Signature Wallet

A multi-signature wallet smart contract built using Solidity. This contract allows multiple owners to collectively manage and approve transactions. The contract requires a certain number of owners' signatures to execute a transaction.

## Features

- Multi-signature wallet with customizable number of required signatures.
- Owners can submit and approve transactions.
- Transactions can only be executed if the required number of signatures is reached.
- Detailed event logging for all actions.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Hardhat](https://hardhat.org/) (for deployment and testing)
- [Ethers.js](https://docs.ethers.io/v5/) (for interacting with Ethereum)

## Setup

1. ## Clone this repository:

```sh
git clone https://github.com/Hopizi/multi-sig-wallet.git

npm install
# or
yarn install
```

2. ## Deployment

Update the configuration in hardhat.config.js to specify your desired network (e.g., localhost, Rinkeby, etc.).

Run the deployment script

```sh
npx hardhat run scripts/deploy.js --network <network-name>
```

3. ## Usage

Interact with the deployed contract using the provided scripts in the scripts directory.

To submit and approve transactions, you will need the private keys or mnemonic of the wallet's owners.

Use the contract's functions to perform actions, and refer to the emitted events for transaction status and contract updates.

4. ## Testing

Run tests to ensure the contract behaves as expected:

```sh
npx hardhat test
```

