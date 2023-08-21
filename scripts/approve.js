const {getNamedAccounts, ethers} = require("hardhat")

async function main() {
    const [signer1, signer2, signer3, signer4] = await ethers.getSigners()
    const { deployer } = await getNamedAccounts();
    const multiSigWallet = await ethers.getContract("MultiSigWallet", deployer);

    console.log("Approving Contract")
    
    const txResponse = await multiSigWallet.approve(0);
    await multiSigWallet.connect(signer2).approve(0);
    await multiSigWallet.connect(signer3).approve(0);
    await txResponse.wait();

    console.log("Transaction has being approved");

    const approval = await multiSigWallet.getApprovalCount(0);

    console.log(`This Transaction has ${approval} Approvals`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });