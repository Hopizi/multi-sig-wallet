const {network, ethers} = require("hardhat");
require("dotenv").config();
const {randomAccounts} = require('../helpers/account-sig')



module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;
    let accounts;

    const [owner, owner2, owner3] = await ethers.getSigners()
    accounts = [deployer, owner2.address, owner3.address]

    log("----------------------------------------------")
    log('Deploying Contract Please Wait')

    const multiSigWallet = await deploy("MultiSigWallet", {
      from: deployer,
      args: [accounts, 3],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    log(`Multi Sig Wallet Deployed at ${multiSigWallet.address}`);
};

module.exports.tags = ["MultiSigContract"];