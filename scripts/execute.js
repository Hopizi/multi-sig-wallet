const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const [signer1, signer2, signer3, signer4] = await ethers.getSigners();
    const { deployer } = await getNamedAccounts();
    const multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);

    console.log("Executing Transactions.....")

    const txResponse = await multiSigWallet.executeTx(0);
    await txResponse.wait();

    console.log("Transaction executed Successfully")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });