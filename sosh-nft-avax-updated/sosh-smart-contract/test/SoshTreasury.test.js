const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { latest, increase, advanceTimeAndBlock } = require('../utilities/time');
const zero_address = "0x0000000000000000000000000000000000000000"
describe('Sosh Treasury smart contract UTC', function(){
  let treasury, Treasury;
  let owner, addr0, addr1, addr2, addr;
  beforeEach('Deploy Sosh Nft', async () => {
    [owner, addr0, addr1, addr2, defender, ...addr] = await ethers.getSigners();

//************************** treasury contract *********************** */
    Treasury = await ethers.getContractFactory('SoshTreasury');
    treasury = await upgrades.deployProxy(Treasury, [owner.address], {
      initializer: 'initialize',
    });
    await treasury.waitForDeployment();
   
  });

   it("should initialize correctly", async function () {
    expect(await treasury.isSuperAdmin(owner.address)).to.be.true;
    expect(await treasury.isAdmin(owner.address)).to.be.true;
  });


  describe('Test treasury withdraw and config update',function(){

    beforeEach('send fund in treasy contract', async()=>{
      const initialBalance = ethers.parseEther("10");   
      await owner.sendTransaction({
        to: treasury.target,
        value: initialBalance,
      });

    });

    it('should allow super admin withdraw the fund',async ()=>{
  
   
      const initialOwnerBalance = await ethers.provider.getBalance(treasury.target);
      const amount = ethers.parseEther("9");
      const remAmount = ethers.parseEther("1");
       await treasury.withdrawFunds(owner.address,amount);
       expect(await ethers.provider.getBalance(treasury.target)).to.be.equal(remAmount);

    })

    it("should emit FundsWithdrawn event on withdrawal", async function () {
      const Balance = await ethers.provider.getBalance(owner.address);
      const remAmount = ethers.parseEther("1");
       expect(await treasury.withdrawFunds(owner.address, remAmount))
        .to.emit(treasury, "FundsWithdrawn")
        
    });


    it('Should revert, caller is not super admin', async () => {
      const Balance = await ethers.provider.getBalance(treasury.target);

      await expect(
        treasury
          .connect(addr2)
          .withdrawFunds(addr2.address,Balance)
      ).to.be.reverted
    });

    it('Should revert, withdrawal amount is 0 ', async () => {
          const amount = ethers.parseEther("0");
       await treasury.withdrawFunds(owner.address,amount);
       expect(await ethers.provider.getBalance(treasury.target)).to.be.equal("0");
    })

   

    it('Check balance of admin after withdraw from treasury smart contract', async () => {
      const Balance = await ethers.provider.getBalance(addr1.address);
      const amount = ethers.parseEther("10");
      await treasury.connect(owner).withdrawFunds(addr1.address,amount);
      expect(await ethers.provider.getBalance(addr1.address)).to.be.equal(amount+Balance);
    });
  });

  describe('Sosh Role function', async () => {

    it("should initialize correctly", async function () {
      expect(await treasury.isSuperAdmin(owner.address)).to.be.true;
      expect(await treasury.isAdmin(owner.address)).to.be.true;
    });

    it('Should grant and revoke ADMIN ROLE by SUPER ADMIN', async () => {
      await treasury.grantAdminRole(addr1.address);
      expect(await treasury.isAdmin(addr1.address)).to.be.true;
      await treasury.revokeAdminRole(addr1.address);
      expect(await treasury.isAdmin(addr1.address)).to.be.false;
    });

  

    it('Should revert, grant ADMIN ROLE by non SUPER ADMIN', async () => {
      await expect(treasury.connect(addr0).grantAdminRole(addr1.address))
        .to.be.reverted;
    });

  
  });
});
