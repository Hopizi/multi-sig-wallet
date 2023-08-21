const { time,loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {randomAccounts} = require('../helpers/account-sig')

describe("Wallet Function", function() {
    async function deployMultiSigWallet() {

        let approvedSigners;
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        approvedSigners = [
          owner.address,
          addr1.address,
          addr2.address
        ];
        const requiredSignatures = 3;

        const Wallet = await ethers.getContractFactory("MultiSigWallet")
        const wallet = await Wallet.deploy(approvedSigners, requiredSignatures);
        await wallet.waitForDeployment();

        const ownerBalance = await ethers.provider.getBalance(owner.address);
        console.log(
          "Owner's Balance:",
          ethers.formatEther(ownerBalance),
          "ETH"
        );

        return {wallet, owner, addr1, addr2, addr3, addr4, approvedSigners, requiredSignatures}
    }

    describe("Deployment", function() {
        it("Should set the right approved signers", async function() {
            const {wallet, approvedSigners} = await loadFixture(deployMultiSigWallet);
            const owners = await wallet.getOwners();

            expect(owners).to.have.lengthOf(approvedSigners.length);
            for(let i = 0; i < owners.length; i++) {
                let approvedOwners = await wallet.getApporoved(owners[i]);
                expect(approvedOwners).to.be.true;
                expect(owners[i]).to.equal(approvedSigners[i])
            }
        })

        it("Should set the required Signatures correctly", async function() {
            const {wallet, requiredSignatures} = await loadFixture(deployMultiSigWallet)

            expect(await wallet.requireSignatures()).to.equal(requiredSignatures);
        })

        it("Should Revert if Signers are less than 1", async function() {
            const {wallet ,requireSignatures} = await loadFixture(deployMultiSigWallet);
            const approvalCount = await wallet.getOwnersCount();

            expect(approvalCount).to.be.above(0);
        })

        it("Should Revert if required signatures is zero or less than number of approved signatures", async function() {
            const {wallet, approvedSigners, requiredSignatures} = await loadFixture(deployMultiSigWallet)
            const required = await wallet.requireSignatures();
            const approvalCount = await wallet.getOwnersCount();

            expect(required).to.not.equal(0);
            expect(required).to.not.be.lessThan(approvalCount);
        })
    });

    describe("Send Transaction Functions", function() {
        it("Should allow Owner to send transaction", async function() {
            const {wallet, owner, addr1, addr2} = await loadFixture(deployMultiSigWallet)
            const value = ethers.parseEther('1');
            const data = '0x';

            await wallet.submitTransaction(addr1.address, value, data)
            expect( await wallet.connect(owner).submitTransaction(addr1.address, value, data))
            const transaction = await wallet.getTransaction(0);

            expect(transaction.to).to.equal(addr1.address);
            expect(transaction.value).to.equal(value)
            expect(transaction.data).to.equal(data)
            expect(transaction.executed).to.be.false;
        })

        it("Should Not Allow You to Submit transactions if not users", async () => {
            const { wallet, owner, addr1, addr2, addr3, addr4 } = await loadFixture(
              deployMultiSigWallet
            );

            const value = ethers.parseEther("1");
            const data = "0x";

            expect(
              await wallet
                .connect(owner)
                .submitTransaction(addr1.address, value, data)
            ).to.be.revertedWith("Not One Of The Owner");
        })
    })

    describe("Approval Function", function() {
        it("Should meet the requirments to call the function", async () => {
            const { wallet, owner, addr1, addr2 } = await loadFixture(
              deployMultiSigWallet
            );
            const value = ethers.parseEther("1");
            const data = "0x";

            expect(
              await wallet
                .connect(owner)
                .submitTransaction(addr1.address, value, data)
            );
            expect(
              await wallet
                .connect(owner)
                .submitTransaction(addr1.address, value, data)
            ).to.be.revertedWith("Not One Of The Owner");

            await wallet.submitTransaction(addr1.address, value, data);
            const transaction = await wallet.getTransaction(0);
            const mintxId = 0;
            const maxtxId = 2;

            expect(mintxId).to.lessThan(transaction.length);
            expect(maxtxId)
              .to.lessThan(transaction.length)
              .to.be.revertedWith("Trasactions Does not Exist");

            const approvedTransactions = await wallet.approvedTransactions(0);
            const executedTransactions = await wallet.executedTransactions(0);

            expect(approvedTransactions).to.be.false;
            expect(executedTransactions).to.be.false;
        })
        
        it("Should Approve The Transactions", async () => {
            const { wallet, owner, addr1, addr2 } = await loadFixture(
              deployMultiSigWallet
            );

            const value = ethers.parseEther("1");
            const data = "0x";
            await wallet.submitTransaction(addr1.address, value, data);
            const txId = 0
            const tx = await wallet.approve(txId);
            const isApproved = await wallet.approvedTransactions(txId);

            expect(isApproved).to.equal(true);
            expect(tx).to.emit(wallet, "Approve").withArgs(owner, txId);
        })

        it("Should Execute Transactions", async () => {
            const { wallet, owner, addr1, addr2, addr3, requiredSignatures } = await loadFixture(
              deployMultiSigWallet
            );
            const value = ethers.parseEther("1");
            const data = "0x";
            const recevier = addr3.address;

            await wallet.submitTransaction(recevier, value, data);
            const txId = 0;
            await wallet.connect(owner).approve(txId);
            await wallet.connect(addr1).approve(txId);

            await expect(wallet.executeTx(txId)).to.be.revertedWith(
              "Not Enough Signatures"
            );
            
            await wallet.connect(addr2).approve(txId);
            // const txResponse = await wallet.executeTx(txId);
            // await txResponse.wait()
            // const executedTx = await wallet.executedTransactions(txId);
            // expect(executedTx).to.equal(true);

            // const reciverBalance = await addr1.provider.getBalance()
            // console.log(reciverBalance);
        })

        it("Should Revoke the transactions on call", async () => {
             const { wallet, owner, addr1, addr2, addr3, requiredSignatures } =
               await loadFixture(deployMultiSigWallet);

            const value = ethers.parseEther("1");
            const data = "0x";
            const recevier = addr3.address;

            await wallet.submitTransaction(recevier, value, data);
            const txId = 0;
            await wallet.approve(txId);
            
            // await expect(wallet.revokeTx(txId)).to.be.revertedWith(
            //   "Tx Not Approved"
            // );

            const tx = await wallet.revokeTx(txId);
            const isApproved = await wallet.approvedTransactions(txId);
            expect(isApproved).to.equal(false);
            expect(tx).to.emit(wallet, "Revoke").withArgs(owner, txId);
        })
    })
})
