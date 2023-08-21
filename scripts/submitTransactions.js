const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const [signer1, signer2, signer3, signer4] = await ethers.getSigners();
    const {deployer} = await getNamedAccounts()
    const multiSigWallet = await ethers.getContract("MultiSigWallet", deployer)

    const value = ethers.parseEther("1");
    const data = "0x";
    const recevier = signer4.address;

    console.log('Submmiting Contract For Approval...')
    const txResponse = await multiSigWallet.submitTransaction(recevier, value, data);
    await txResponse.wait();

    console.log("Transaction Submitted Waiting for Approval......")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });