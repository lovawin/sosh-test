const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { latest, increase, advanceTimeAndBlock } = require('../utilities/time');
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const zero_address = "0x0000000000000000000000000000000000000000"
async function getCurrentTimestamp() {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const timestampBefore = blockBefore.timestamp;
  return timestampBefore;
}
describe('Sosh Marketplace smart contract UTC', function () {
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

    await market.connect(owner).adminUpdateSoshNftNode(sosh.target);

  });

  describe("PrimaryFee and secondaryFee", async function () {

    it("primary fee", async () => {
      await expect(sosh.connect(addr0).mintWithRoyalty(addr0.address, 'https://tokenURI', { value: _mintFee }))
        .to.emit(sosh, "Minted")


      const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
      const endTime = startTime + 7200;


      await expect(market.connect(addr0).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
        .to.emit(market, "SaleCreated");


      await helpers.time.increaseTo(startTime);

      const prevBal = await ethers.provider.getBalance(treasury.target);
      console.log("ffddddddddddddddddd", prevBal);

      await market.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") });
      const finalReceiverBalance = await ethers.provider.getBalance(treasury.target);
      console.log("ffffffffffffffffff", finalReceiverBalance);

      const primaryFee = ethers.parseEther("0.05"); //5% (500 bsi mintFee);
      expect(await finalReceiverBalance).to.be.equal(primaryFee + prevBal);

    });


    it("secondary fee", async () => {
      await expect(sosh.connect(addr0).mintWithRoyalty(addr0.address, 'https://tokenURI', { value: _mintFee }))
        .to.emit(sosh, "Minted")

      const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
      const endTime = startTime + 7200;

      await expect(market.connect(addr0).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
        .to.emit(market, "SaleCreated");


      //sale started
      await helpers.time.increaseTo(startTime);
      const prevBal = await ethers.provider.getBalance(treasury.target);

      // buyer-1 buy nft
      await market.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") });
      const primaryFee = ethers.parseEther("0.05"); //5% (500 bsi mintFee);
      //buyer-1 reSale the nft
      const startTime1 = startTime + 25 * 60 * 60;
      const endTime1 = startTime1 + 7200
      await sosh.connect(addr1).approve(market.target, 1);

      await expect(market.connect(addr1).createSale(1, 1, ethers.parseEther("1"), startTime1, endTime1))
        .to.emit(market, "SaleCreated");

      //sale started
      await helpers.time.increaseTo(startTime1 + 3600);
      // buyer-2 buy nft
      await market.connect(addr2).buyNFT(2, { value: ethers.parseEther("1") });


      const treasuryBalance2 = await ethers.provider.getBalance(treasury.target);
      console.log("ffffffffffffffffff", treasuryBalance2);

      const secondaryFee = ethers.parseEther("0.04"); //4% (400 bsi mintFee);
      const royaltyFee = ethers.parseEther("0.05") //5 %

      const finalTreasuryBalance = await ethers.provider.getBalance(treasury.target);
      expect(await finalTreasuryBalance).to.be.equal(secondaryFee + royaltyFee + prevBal + primaryFee);



    });

  });






  describe("test the sale Create functions", async () => {

    it("should emit SaleCreated event when a sale is created", async function () {
      await expect(sosh.connect(addr0).mintWithRoyalty(addr0.address, 'https://tokenURI', { value: _mintFee }))
        .to.emit(sosh, "Minted")


      const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
      const endTime = startTime + 7200;
      await expect(market.connect(addr0).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
        .to.emit(market, "SaleCreated");
    });

  })

  describe("test the sale Update functions", async () => {

    it("should emit SaleUpdate event when a sale is updated", async function () {
      await expect(sosh.connect(addr0).mintWithRoyalty(addr0.address, 'https://tokenURI', { value: _mintFee }))
        .to.emit(sosh, "Minted")


      const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
      const endTime = startTime + 7200;
      await expect(market.connect(addr0).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
        .to.emit(market, "SaleCreated");


      const newAskPrice = ethers.parseEther("2");
      const newStartTime = startTime + 1 * 60 * 60;

      await expect(market.connect(addr0).updateSale(1, newAskPrice, newStartTime, endTime))
        .to.emit(market, "SaleUpdated");

    });

  })
  describe("Should revert, if sellet try to update after start time", async () => {

    it("should emit You can only update the sale Not started", async function () {
      await expect(sosh.connect(addr0).mintWithRoyalty(addr0.address, 'https://tokenURI', { value: _mintFee }))
        .to.emit(sosh, "Minted")


      const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
      const endTime = startTime + 7200;
      await expect(market.connect(addr0).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
        .to.emit(market, "SaleCreated");

      await helpers.time.increaseTo(startTime);
      const newAskPrice = ethers.parseEther("2");
      const newStartTime = startTime + 1 * 60 * 60;


      await expect(market.connect(addr0).updateSale(1, newAskPrice, newStartTime, endTime)).to.be.revertedWith("You can only update the sale Not started")

  });

})

describe("test the NFT Buy functions", async () => {
  it("should revert, when a user try buy an NFT before start time", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    await expect(market.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") })).to.be.revertedWith("Sosh: Sale not started")
  });


  it("should revert, when a user try to buy an nft after endTime ", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    let newTimestamp = 7200;
    await helpers.time.increaseTo(endTime + newTimestamp);

    await expect(market.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") })).to.be.revertedWith("Sosh: Sale ended")
  });


  it("should revert, when a user try to buy an nft below the ask prices ", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    await helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).buyNFT(1, { value: ethers.parseEther("0.5") })).to.be.revertedWith("Sosh: Ask price mismatch")
  });


  it("should allow a user to buy an NFT", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    await helpers.time.increaseTo(startTime);
    expect(await market.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") })).to.be.emit(market, "SaleClosed");
  });



})

describe("test the NFT Bid functions ", async () => {

  it("should allow a user to bid an NFT", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced");

  });

  it("next user must be bid above the price of same NFT", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced").withArgs(1, addr1.address, ethers.parseEther("1"), endTime);
    await expect(market.connect(addr2).placeBid(1, { value: ethers.parseEther("2") })).to.be.emit(market, "ReserveAuctionBidPlaced").withArgs(1, addr2.address, ethers.parseEther("2"), endTime);

  });


  it("should be revert, if next user try to  bid below the price of same NFT", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced").withArgs(1, addr1.address, ethers.parseEther("1"), endTime);
    await expect(market.connect(addr2).placeBid(1, { value: ethers.parseEther("0.5") })).to.be.revertedWith("NFTMarketReserveAuction: Bid amount too low");
  });


  it("should revert, when a user try bid an NFT before start time", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.revertedWith("Sosh: Sale not started")
  });

  it("should revert, when a user try to bid an nft below the ask prices ", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("0.5") })).to.be.revertedWith("Sosh: Bid must be at least the ask price")
  });


  it("should extension duration (15 minutes), when next user try to bid an nft before the auction endtime ", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");


    let newTimestamp = 5400;

    await helpers.time.increaseTo(startTime + newTimestamp);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced").withArgs(1, addr1.address, ethers.parseEther("1"), await getCurrentTimestamp() + 1800);

  });

  it("should revert, when a user try to bid an nft after endTime ", async function () {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    let newTimestamp = 7200;

    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    await helpers.time.increaseTo(startTime + endTime + newTimestamp);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.revertedWith("Sosh: Sale ended")
  });


})



describe("testing finalizeAuction functions", async () => {
  it("should allow any seller can finalize Auction", async function () {

    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")

    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;


    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    await helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced");

    await helpers.time.increaseTo(startTime + 7300);
    await expect(market.finalizeAuction(1)).to.emit(market, "SaleClosed").withArgs(1);

  });

  it("should allow finalizeAuction", async () => {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    let newTimestamp = 7200;
    await helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced");

    // await helpers.time.increaseTo(endTime);

    await expect(market.finalizeAuction(1)).to.be.revertedWith("Sosh: Sale is not over")

  });


})

describe("admin update functions", async () => {

  it("adminUpdateTimeConfigs", async () => {

    const maxSaleDuration = 20 * 24 * 60;
    const minTimeDifference = 1 * 24 * 60;
    const minSaleDuration = 60;
    const extensionDuration = 15 * 60;
    const minSaleUpdateDuration = 24 * 60;
    await market.adminUpdateTimeConfigs(maxSaleDuration, minSaleDuration, minTimeDifference, extensionDuration, minSaleUpdateDuration);
    expect(await market.maxSaleDuration()).to.equal(maxSaleDuration);
    expect(await market.minTimeDifference()).to.equal(minTimeDifference);
    expect(await market.minSaleDuration()).to.equal(minSaleDuration);
    expect(await market.extensionDuration()).to.equal(extensionDuration);

  })
  it("upddate adminUpdateSoshNftNode ", async () => {
    await market.adminUpdateSoshNftNode(addr1.address);
    expect(await market.nftContractAddress()).to.equal(addr1.address);

  })

  it("should revert , if non admin upddate adminUpdateSoshNftNode ", async () => {

    await expect(market.connect(addr2).adminUpdateSoshNftNode(addr1.address)).to.be.revertedWith("Sosh: caller does not have the Admin role");

  })

  it("upddate adminUpdateSoshTreasuryNode ", async () => {
    await market.adminUpdateSoshTreasuryNode(addr1.address);
    expect(await market.treasuryContractAddress()).to.equal(addr1.address);

  })

  it("should revert , if non admin upddate adminUpdateSoshNftNode ", async () => {

    await expect(market.connect(addr2).adminUpdateSoshTreasuryNode(addr1.address)).to.be.revertedWith("Sosh: caller does not have the Admin role");

  })
})

describe("admin can withdraw emergencyfund and cancel reserver ", async function () {

  it(" should allow admin to admin cancel reserver sale", async () => {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");


    await helpers.time.increaseTo(startTime);

    await expect(market.connect(owner).adminCancelReserveSale(1, "hello_world")).to.be.emit(market, "ReserveSaleCanceledByAdmin");
  })

  it(" should revert, non-admin try cancel reserver sale", async () => {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");


    await helpers.time.increaseTo(startTime);

    await expect(market.connect(addr2).adminCancelReserveSale(1, "hello_world")).to.be.revertedWith("Sosh: caller does not have the Admin role");
  })

  it(" should revert, if try to cancel reserver sale without reason", async () => {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");


    await helpers.time.increaseTo(startTime);

    await expect(market.connect(owner).adminCancelReserveSale(1, "")).to.be.revertedWith("Sosh: Include a reason for this cancellation");
  })

  it("should allow admin for EmergencyWithdrawal", async () => {
    await expect(sosh.connect(addr2).mintWithRoyalty(addr2.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(addr2).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    helpers.time.increaseTo(startTime);

    expect(await sosh.balanceOf(market.target)).to.be.equal(1);
    await market.connect(owner).adminEmergencyWithdrawal([1], addr1.address);
    expect(await sosh.balanceOf(market.target)).to.be.equal(0);
    expect(await sosh.balanceOf(addr1.address)).to.be.equal(1);


  });
  it("should revert ,  non - admin try to withdrawal Emergency funds", async () => {
    await expect(sosh.connect(addr2).mintWithRoyalty(addr2.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    const startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    const endTime = startTime + 7200;

    await expect(market.connect(addr2).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    helpers.time.increaseTo(startTime);

    expect(await sosh.balanceOf(market.target)).to.be.equal(1);
    await expect(market.connect(addr0).adminEmergencyWithdrawal([1], addr1.address)).to.revertedWith("Sosh: caller does not have the Admin role");

  });

})

describe("finalizeExpiredSale", async function () {
  let startTime
  let endTime
  this.beforeEach(async () => {
    await expect(sosh.connect(owner).mintWithRoyalty(owner.address, 'https://tokenURI', { value: _mintFee }))
      .to.emit(sosh, "Minted")
    startTime = await getCurrentTimestamp() + 25 * 60 * 60;
    endTime = startTime + 7200;

  });

  it("transferred back to the seller if no one purchases it by the end of the auction or sale,", async () => {
    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    await helpers.time.increaseTo(startTime + startTime);

    await expect(market.finalizeExpiredSale(1)).to.emit(market, "SaleClosed");
  })


  it("should revert , if sale is actived", async () => {

    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime)).to.emit(market, "SaleCreated")
    await helpers.time.increaseTo(startTime + 1000);
    await expect(market.finalizeExpiredSale(1)).to.be.revertedWith("Sosh: Sale is still active");

  })


  it("should revert , if sale is closed", async () => {
    await expect(market.connect(owner).createSale(1, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");

    await helpers.time.increaseTo(startTime);

    await expect(market.connect(addr1).buyNFT(1, { value: ethers.parseEther("1") })).to.be.emit(market, "SaleClosed");
    await expect(market.finalizeExpiredSale(1)).to.be.revertedWith("Sosh: Sale not open");
  })


  it("should revert , if Sale has a buyer", async () => {
    await expect(market.connect(owner).createSale(0, 1, ethers.parseEther("1"), startTime, endTime))
      .to.emit(market, "SaleCreated");
    await helpers.time.increaseTo(startTime);
    await expect(market.connect(addr1).placeBid(1, { value: ethers.parseEther("1") })).to.be.emit(market, "ReserveAuctionBidPlaced");
    await helpers.time.increaseTo(endTime + 1000);
    await expect(market.finalizeExpiredSale(1)).to.be.revertedWith("Sosh: Sale has a buyer");

  })


})


});
