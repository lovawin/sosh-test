const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const zero_address = "0x0000000000000000000000000000000000000000"
describe('Sosh NFT smart contract UTC', function () {
  let sosh, Sosh, Treasury, treasury, treasury_one;
  let address0 = zero_address;
  let _mintFee
  let _maxRoyalityFee
  let _royaltyFee
  let owner, addr0, addr1, addr2, addr;
  let market;

  beforeEach(' Deploy Sosh NFT ', async () => {
    [owner, addr0, addr1, addr2, defender, ...addr] = await ethers.getSigners();

    //************************** treasury contract *********************** */
    Treasury = await ethers.getContractFactory('SoshTreasury');
    treasury = await upgrades.deployProxy(Treasury, [owner.address], {
      initializer: 'initialize',
    });
    await treasury.waitForDeployment();

    //********************************* soshNft contract  ************************** */
    const baseURI = 'ipfs://';


    _royaltyFee = 500;
    _maxRoyalityFee = 1000
    _mintFee = ethers.parseEther("1")

    const primarySaleFee = 500;
    const secondarySaleFee = 400;
    const uppercapPrimarySaleFee = 1000;
    const uppercapSecondarySaleFee = 1000;

    Market = await ethers.getContractFactory('SoshMarketplace');
    market = await upgrades.deployProxy(
      Market,
      [
        owner.address,
        treasury.target,
        primarySaleFee,
        secondarySaleFee,
        uppercapPrimarySaleFee,
        uppercapSecondarySaleFee,
      ],
      {
        initializer: 'initialize',
      }
    );

    await market.waitForDeployment();


    Sosh = await ethers.getContractFactory('SoshNFT');
    sosh = await upgrades.deployProxy(
      Sosh,
      ['SoshNFT', 'SN', treasury.target, market.target, baseURI, _royaltyFee, _maxRoyalityFee, _mintFee],
      {
        initializer: 'initialize',
      }
    );
    await sosh.waitForDeployment();
  });

  it('Should initialize values correctly', async () => {
    expect(await treasury.isSuperAdmin(owner.address)).to.be.true;
    expect(await treasury.isAdmin(owner.address)).to.be.true;

    expect(await sosh.marketContractAddress()).to.equals(market.target)
    expect(await sosh.name()).to.equals('SoshNFT');
    expect(await sosh.symbol()).to.equals('SN');

  });

  describe('Pausable functionality', async () => {
    it('Should allow admin to pause contract', async () => {
      await expect(await sosh.pause())
        .to.emit(sosh, 'Paused')
    });

    it('Should revert, if non admin tries to pause contract', async () => {
      await expect(sosh.connect(addr1).pause()).to.be.revertedWith("Sosh: caller does not have the Admin role")

    });

    it("should revert, if non admin tries to unpause contract", async () => {

      await sosh.pause();
      await expect(sosh.connect(addr1).unpause()).to.be.revertedWith("Sosh: caller does not have the Admin role")
    })

    it('Should revert, contract is paused mintWithRoyalty function is used', async () => {
      await sosh.pause();
      await expect(
        sosh.connect(owner).mintWithRoyalty(addr1.address, 'https://tokenURI')
      ).to.be.revertedWithCustomError(sosh, 'EnforcedPause');
    });



    it(' contract is unpaused mintWithRoyty function is used', async () => {
      await sosh.pause();
      const val1 = await ethers.provider.getBalance(addr1.address);
      await expect(sosh.connect(addr1).mintWithRoyalty(addr1.address, 'https://tokenURI')).to.be.revertedWithCustomError(sosh, 'EnforcedPause');

      await sosh.unpause();
      expect(await sosh.connect(addr1).mintWithRoyalty(addr1.address, 'https://tokenURI', { value: _mintFee }));
      const val2 = await ethers.provider.getBalance(addr1.address);
    });

    it('should emit event when mintWithRoyalty function is used', async () => {

      await expect(sosh.connect(addr1).mintWithRoyalty(addr1.address, 'https://tokenURI', { value: _mintFee }))
        .to.emit(sosh, "Minted")
    })


    it('should revert , mintWithRoyalty function if Insufficient mintFee ', async () => {

      await expect(sosh.connect(addr1).mintWithRoyalty(addr1.address, 'https://tokenURI', { value: ethers.parseEther("0.9") }))
        .to.be.revertedWith("Insufficient mintFee");
    })



    // it('should allow admin  to update SoshTreasury ', async () => {
    //   await sosh.connect(owner).adminUpdateSoshTreasury(addr2.address);
    //   expect(await sosh.treasuryContractAddress()).to.equal(addr2.address);
    // })

    it('should revert , if non admin tries to update treasury address ', async () => {
      await expect(sosh.connect(addr1).adminUpdateSoshTreasury(addr2.address)).to.be.revertedWith("Sosh: caller does not have the Admin role")
    });

    it('should allow admin  to update adminUpdateSoshMarket ', async () => {
      await sosh.connect(owner).adminUpdateSoshMarket(addr2.address);
      expect(await sosh.marketContractAddress()).to.equal(addr2.address);
    })

    it('should revert , if non admin tries to update SoshMarket address', async () => {
      await expect(sosh.connect(addr1).adminUpdateSoshMarket(addr2.address)).to.be.revertedWith("Sosh: caller does not have the Admin role")
    })

    it("should allow admin to update fee ", async function () {
      await sosh.connect(owner).adminUpdateFeeConfig(ethers.parseEther("0.02"), 600);
      expect(await sosh.mintFee()).to.equal(ethers.parseEther("0.02"));
      expect(await sosh.royaltyFee()).to.equal(600);
    });

    it("should revert if non-admin tries to update fee ", async function () {
      await expect(sosh.connect(addr1).adminUpdateFeeConfig(ethers.parseEther("0.02"), 600)).to.be.revertedWith("Sosh: caller does not have the Admin role");
    });

    it('should allow admin to update baseurl', async function () {
      await sosh.adminUpdateBaseUri("http://abc");
      expect(await sosh.baseURI()).to.be.equal("http://abc");

    });

    it("should revert , if non admin update baseuri", async function () {

      await expect(sosh.connect(addr1).adminUpdateBaseUri("http://abc")).to.be.revertedWith("Sosh: caller does not have the Admin role");
    });

    it('if base url length 0', async function () {
      await expect(sosh.adminUpdateBaseUri("")).to.be.revertedWith("Invalid base uri")

    })


  });





});
