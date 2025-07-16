// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import "../Interfaces/ISoshRoleManager.sol";
import "./utils/SoshMarketFee.sol";
import "./utils/SoshDebugger.sol";

/**
 * @title A market to buy or sell NFTs.
 */
contract SoshMarketplace is
    Initializable,
    ContextUpgradeable,
    UUPSUpgradeable,
    ERC721HolderUpgradeable,
    SoshMarketFee,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    SoshDebugger
{
    enum SaleType {
        Auction,
        Direct
    }

    enum SaleStatus {
        Closed,
        Open,
        Cancel
    }

    /**
     * @notice structure to be used for update sale items
     */
    struct UpdateSale {
        uint256 saleId;
    }

    struct ReserveSale {
        address payable seller;
        address payable buyer;
        uint256 askPrice;
        uint256 receivedPrice;
        uint256 tokenId;
        SaleType saleType;
        SaleStatus status;
        uint256 startTime;
        uint256 endTime;
        // Added to prevent front-running
        uint256 minBidIncrement;
    }

    mapping(uint256 => ReserveSale) public reserveSale;
    uint256 public saleIdTracker;
    uint256 public maxSaleDuration;
    uint256 public minSaleDuration;
    uint256 public minTimeDifference;
    uint256 public minSaleUpdateDuration;
    uint256 public extensionDuration;
    uint256 public defaultMinBidIncrement;
    address payable public treasuryContractAddress;
    address public nftContractAddress;

    // Events
    event SaleCreated(
        uint256 indexed saleId, 
        address indexed seller, 
        uint256 indexed tokenId, 
        uint256 askPrice, 
        uint256 startTime, 
        uint256 endTime, 
        SaleType saleType
    );
    event SaleUpdated(
        uint256 indexed saleId, 
        uint256 newAskPrice, 
        uint256 newStartTime, 
        uint256 newEndTime
    );
    event SaleClosed(
        uint256 indexed saleId, 
        address indexed buyer, 
        address indexed seller, 
        uint256 finalPrice
    );
    event ReserveAuctionBidPlaced(
        uint256 indexed auctionId, 
        address indexed bidder, 
        uint256 amount, 
        uint256 endTime
    );
    event ReserveSaleCanceledByAdmin(
        uint256 indexed auctionId, 
        string reason
    );
    event TimeConfigsUpdated(
        uint256 maxSaleDuration,
        uint256 minSaleDuration,
        uint256 minTimeDifference,
        uint256 extensionDuration,
        uint256 minSaleUpdateDuration
    );
    event SoshNftNodeUpdated(address newNftAddress);
    event SoshTreasuryNodeUpdated(address newTreasuryAddress);
    event EmergencyWithdrawal(address receiver, uint256[] tokenIds, uint256 ethAmount);
    event SaleTransferFailed(uint256 indexed saleId, string reason);
    event ContractPaused(address admin);
    event ContractUnpaused(address admin);

    modifier validateInputs(uint256 startTime, uint256 endTime) {
        require(
            (minTimeDifference + _getCurrentTimestamp()) <= startTime,
            "Sosh: Start time less than minimum time difference"
        );
        require(
            (endTime - startTime) <= maxSaleDuration && (endTime - startTime) >= minSaleDuration,
            "Sosh: sale Duration not allowed"
        );
        _;
    }

    modifier onlySeller(uint256 saleId) {
        require(reserveSale[saleId].seller == _msgSender(), "Sosh: not seller");
        _;
    }

    modifier onlyAdmin() {
        require(
            ISoshRoleManager(treasuryContractAddress).isAdmin(_msgSender()), "Sosh: caller does not have the Admin role"
        );
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Called once to configure the contract after the initial deployment.
     * @dev This farms the initialize call out to inherited contracts as needed.
     */
    function initialize(
        address _soshNFT,
        address payable _soshTreasury,
        uint256 primarySaleFee,
        uint256 secondarySaleFee,
        uint256 uppercapPrimarySaleFee,
        uint256 uppercapSecondarySaleFee
    ) external initializer {
        __Context_init();
        __UUPSUpgradeable_init();
        __ERC721Holder_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __SoshDebugger_init();
        _SoshMarketFee_initialize(primarySaleFee, secondarySaleFee, uppercapPrimarySaleFee, uppercapSecondarySaleFee);
        
        treasuryContractAddress = _soshTreasury;
        nftContractAddress = _soshNFT;
        maxSaleDuration = 20 days;
        minTimeDifference = 30 minutes;
        minSaleDuration = 60 minutes;
        extensionDuration = 15 minutes;
        minSaleUpdateDuration = 1 days;
        defaultMinBidIncrement = 1 wei; // Minimum bid increment to prevent front-running
        
        log("SoshMarketplace initialized");
    }

    // Fallback function to receive Ether
    receive() external payable {}

    /**
     * @notice Allows admin to pause the contract in case of emergency
     */
    function pause() external onlyAdmin {
        _pause();
        emit ContractPaused(_msgSender());
        log("Contract paused by admin", _msgSender());
    }

    /**
     * @notice Allows admin to unpause the contract
     */
    function unpause() external onlyAdmin {
        _unpause();
        emit ContractUnpaused(_msgSender());
        log("Contract unpaused by admin", _msgSender());
    }

    /**
     * @notice Override the toggleDebugging function from SoshDebugger to add admin access control
     */
    function toggleDebugging(bool _enabled) external override onlyAdmin {
        debuggingEnabled = _enabled;
        emit DebuggingToggled(_enabled);
        log("Debugging toggled", _enabled);
    }

    function adminUpdateTimeConfigs(
        uint256 _maxSaleDuration,
        uint256 _minSaleDuration,
        uint256 _minTimeDifference,
        uint256 _extensionDuration,
        uint256 _minSaleUpdateDuration
    ) external onlyAdmin {
        maxSaleDuration = _maxSaleDuration;
        minTimeDifference = _minTimeDifference;
        minSaleDuration = _minSaleDuration;
        extensionDuration = _extensionDuration;
        minSaleUpdateDuration = _minSaleUpdateDuration;
        
        emit TimeConfigsUpdated(
            _maxSaleDuration,
            _minSaleDuration,
            _minTimeDifference,
            _extensionDuration,
            _minSaleUpdateDuration
        );
        
        log("Time configs updated by admin", _msgSender());
    }

    /**
     * @notice allows Admin for Emergency withdrawal of assets.
     */
    function adminEmergencyWithdrawal(uint256[] memory tokenIds, address payable receiver) external onlyAdmin {
        _adminEmergencyWithdrawal(tokenIds, receiver);
    }

    /**
     * @notice allows admin to update sosh NFT smart contract address
     */
    function adminUpdateSoshNftNode(address _soshNft) external onlyAdmin {
        nftContractAddress = _soshNft;
        emit SoshNftNodeUpdated(_soshNft);
        log("NFT node updated to", _soshNft);
    }

    /**
     * @notice allows admin to update sosh Treasury smart contract address
     */
    function adminUpdateSoshTreasuryNode(address payable _soshTreasury) external onlyAdmin {
        treasuryContractAddress = _soshTreasury;
        emit SoshTreasuryNodeUpdated(_soshTreasury);
        log("Treasury node updated to", _soshTreasury);
    }

    function adminUpdateSoshMarketFees(uint256 _primarySoshFeeBasisPoints, uint256 _secondarySoshFeeBasisPoints)
        external
        onlyAdmin
    {
        _updateMarketFees(_primarySoshFeeBasisPoints, _secondarySoshFeeBasisPoints);
        log("Market fees updated by admin", _msgSender());
    }

    /**
     * @notice Creates a sale for the given NFTs.
     * The NFTs are held in escrow until the sale is finalized or bought by buyers.
     */
    function createSale(SaleType saleType, uint256 tokenId, uint256 askPrice, uint256 startTime, uint256 endTime)
        external
        validateInputs(startTime, endTime)
        whenNotPaused
    {
        uint256 saleId = incrementId();
        reserveSale[saleId].saleType = saleType;
        reserveSale[saleId].status = SaleStatus.Open;
        reserveSale[saleId].seller = payable(_msgSender());
        reserveSale[saleId].tokenId = tokenId;
        reserveSale[saleId].askPrice = askPrice;
        reserveSale[saleId].startTime = startTime;
        reserveSale[saleId].endTime = endTime;
        reserveSale[saleId].minBidIncrement = defaultMinBidIncrement;
        
        IERC721(nftContractAddress).safeTransferFrom(_msgSender(), address(this), tokenId);

        emit SaleCreated(saleId, _msgSender(), tokenId, askPrice, startTime, endTime, saleType);
        log("Sale created", saleId);
    }

    function updateSale(
        uint256 saleId,
        uint256 newAskPrice,
        uint256 newStartTime,
        uint256 newEndTime
    ) external onlySeller(saleId) whenNotPaused {
        require(reserveSale[saleId].status == SaleStatus.Open, "Sale is not open");
        require(
            block.timestamp + minSaleUpdateDuration < reserveSale[saleId].startTime,
            "You can only update the sale Not started"
        );
        
        // Added validation for new start and end times
        require(
            (minTimeDifference + _getCurrentTimestamp()) <= newStartTime,
            "Sosh: New start time less than minimum time difference"
        );
        require(
            (newEndTime - newStartTime) <= maxSaleDuration && (newEndTime - newStartTime) >= minSaleDuration,
            "Sosh: New sale duration not allowed"
        );

        // Update the sale with new details
        reserveSale[saleId].askPrice = newAskPrice;
        reserveSale[saleId].startTime = newStartTime;
        reserveSale[saleId].endTime = newEndTime;

        emit SaleUpdated(saleId, newAskPrice, newStartTime, newEndTime);
        log("Sale updated", saleId);
    }

    /**
     * @notice users can buy NFT once a sale starts,
     * Transfers sosh platform fee to treasury
     * Transfers owner revenue to seller
     * Transfers royalty fee to treasury
     */
    function buyNFT(uint256 saleId) external payable nonReentrant whenNotPaused {
        ReserveSale storage directSale = reserveSale[saleId];
        require(directSale.status == SaleStatus.Open, "Sosh: Sale not open");
        require(directSale.saleType == SaleType.Direct, "Sosh : Only direct sale");
        require(directSale.startTime <= _getCurrentTimestamp(), "Sosh: Sale not started");
        require(directSale.endTime >= _getCurrentTimestamp(), "Sosh: Sale ended");
        require(directSale.askPrice == msg.value, "Sosh: Ask price mismatch");

        finalizeSale(directSale.tokenId, directSale.seller, payable(_msgSender()), directSale.askPrice);

        directSale.buyer = payable(_msgSender());
        directSale.receivedPrice = msg.value;
        directSale.status = SaleStatus.Closed;
        
        emit SaleClosed(saleId, _msgSender(), directSale.seller, msg.value);
        log("NFT bought", saleId);
    }

    /**
     * @notice Place bid on an Auction.
     * If this is the first bid on the auction, than the bid amount can be greater than or equal to ask price.
     * If there is already an outstanding bid, the previous bidder will be refunded at this time
     * and if the bid is placed in the final moment of the auction, the countdown will be extended.
     */
    function placeBid(uint256 saleId) external payable nonReentrant whenNotPaused {
        ReserveSale storage auction = reserveSale[saleId];
        require(auction.status == SaleStatus.Open, "Sosh: Sale not open");
        require(auction.saleType == SaleType.Auction, "Sosh : Only for Auction");
        require(auction.startTime <= _getCurrentTimestamp(), "Sosh: Sale not started");
        require(auction.endTime >= _getCurrentTimestamp(), "Sosh: Sale ended");

        if (auction.buyer == address(0)) {
            require(auction.askPrice <= msg.value, "Sosh: Bid must be at least the ask price");
        } else {
            address payable buyer = auction.buyer;
            require(buyer != _msgSender(), "NFTMarketReserveAuction: You already have an outstanding bid");

            // Front-running protection: require minimum bid increment
            require(
                msg.value >= auction.receivedPrice + auction.minBidIncrement, 
                "NFTMarketReserveAuction: Bid amount too low"
            );
            
            transferNative(buyer, auction.receivedPrice);
        }
        
        auction.receivedPrice = msg.value;
        auction.buyer = payable(_msgSender());

        // When a bid outbids another, check to see if a time extension should apply.
        if (auction.endTime - _getCurrentTimestamp() < extensionDuration) {
            auction.endTime = _getCurrentTimestamp() + extensionDuration;
        }
        
        emit ReserveAuctionBidPlaced(saleId, _msgSender(), msg.value, auction.endTime);
        log("Bid placed", saleId);
    }

    /**
     * @notice Once the Auction is expired.
     * This will send the NFT to buyer and funds to seller.
     */
    function finalizeAuction(uint256 saleId) external nonReentrant whenNotPaused {
        ReserveSale storage auction = reserveSale[saleId];
        require(auction.status == SaleStatus.Open, "Sosh: Sale not open");
        require(auction.saleType == SaleType.Auction, "Sosh : Only for Auction");
        require(auction.endTime < _getCurrentTimestamp(), "Sosh: Sale is not over");
        
        if (auction.buyer != address(0)) {
            finalizeSale(auction.tokenId, auction.seller, auction.buyer, auction.receivedPrice);
            auction.status = SaleStatus.Closed;
            emit SaleClosed(saleId, auction.buyer, auction.seller, auction.receivedPrice);
            log("Auction finalized with buyer", saleId);
        } else {
            // No bids were placed, return NFT to seller
            try IERC721(nftContractAddress).safeTransferFrom(address(this), auction.seller, auction.tokenId) {
                auction.status = SaleStatus.Closed;
                emit SaleClosed(saleId, address(0), auction.seller, 0);
                log("Auction finalized with no buyer", saleId);
            } catch Error(string memory reason) {
                auction.status = SaleStatus.Closed;
                emit SaleTransferFailed(saleId, reason);
                log("Auction finalization failed", reason);
            } catch {
                auction.status = SaleStatus.Closed;
                emit SaleTransferFailed(saleId, "unknown error");
                log("Auction finalization failed with unknown error");
            }
        }
    }

    /**
     * @notice helper function to calculate sosh platform fee and
     * seller revenue for each token id to be bought from the sale
     * then return total calculated seller revenue and
     * total calculated sosh platform fee of all token ids
     */
    function finalizeSale(uint256 tokenId, address payable seller, address buyer, uint256 amount) internal {
        (uint256 totalFee, uint256 ownerRevenue) = _getFees(nftContractAddress, tokenId, seller, amount);
        transferNative(treasuryContractAddress, totalFee);
        transferNative(seller, ownerRevenue);
        
        try IERC721(nftContractAddress).safeTransferFrom(address(this), buyer, tokenId) {
            log("NFT transferred to buyer", buyer);
        } catch Error(string memory reason) {
            emit SaleTransferFailed(tokenId, reason);
            log("NFT transfer failed", reason);
            revert(string(abi.encodePacked("NFT transfer failed: ", reason)));
        } catch {
            emit SaleTransferFailed(tokenId, "unknown error");
            log("NFT transfer failed with unknown error");
            revert("NFT transfer failed with unknown error");
        }
    }

    /**
     * @notice helper function that allows admin to emrgency withdraw
     */
    function _adminEmergencyWithdrawal(uint256[] memory tokenIds, address payable receiver) internal {
        require(tokenIds.length > 0, "Sosh: tokenids lenght is 0");
        require(receiver != address(0), "Sosh: receiver is zero");

        uint256 ethAmount = address(this).balance;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            try IERC721(nftContractAddress).safeTransferFrom(address(this), receiver, tokenIds[i]) {
                log("Emergency withdrawal: NFT transferred", tokenIds[i]);
            } catch Error(string memory reason) {
                log("Emergency withdrawal: NFT transfer failed", reason);
                // Continue with other transfers even if one fails
            } catch {
                log("Emergency withdrawal: NFT transfer failed with unknown error");
                // Continue with other transfers even if one fails
            }
        }

        (bool success,) = receiver.call{value: ethAmount}("");
        require(success, "Emergency Withdraw: Transfer failed");
        
        emit EmergencyWithdrawal(receiver, tokenIds, ethAmount);
        log("Emergency withdrawal completed", receiver);
    }

    /**
     * @notice Allows Sosh Admin to cancel an auction, refunding the funds and returning the NFT to the seller.
     * This should only be used for extreme cases such as DMCA takedown requests. The reason should always be provided.
     */
    function adminCancelReserveSale(uint256 saleId, string memory reason) external onlyAdmin {
        require(bytes(reason).length > 0, "Sosh: Include a reason for this cancellation");
        ReserveSale storage saleInfo = reserveSale[saleId];
        require(saleInfo.status == SaleStatus.Open, "Sosh: Sale not open");

        try IERC721(nftContractAddress).safeTransferFrom(address(this), saleInfo.seller, saleInfo.tokenId) {
            log("Admin canceled sale: NFT returned to seller", saleId);
        } catch Error(string memory errorReason) {
            log("Admin canceled sale: NFT transfer failed", errorReason);
            // Continue with cancellation even if transfer fails
        } catch {
            log("Admin canceled sale: NFT transfer failed with unknown error");
            // Continue with cancellation even if transfer fails
        }
        
        if (saleInfo.saleType == SaleType.Auction && saleInfo.buyer != address(0)) {
            transferNative(saleInfo.buyer, saleInfo.receivedPrice);
            log("Admin canceled sale: Funds returned to buyer", saleInfo.buyer);
        }
        
        saleInfo.status = SaleStatus.Cancel;
        emit ReserveSaleCanceledByAdmin(saleId, reason);
        log("Admin canceled sale", reason);
    }

    /**
     * @notice Internal function to close a sale and handle NFT transfer if needed.
     * If there's no buyer and the NFT is still in the marketplace, it returns the NFT to the seller.
     */
    function _closeSale(uint256 saleId) internal {
        ReserveSale storage sale = reserveSale[saleId];
        
        // If there's no buyer and the NFT is still in the marketplace, return it to seller
        if (sale.buyer == address(0)) {
            try IERC721(nftContractAddress).ownerOf(sale.tokenId) returns (address owner) {
                if (owner == address(this)) {
                    try IERC721(nftContractAddress).safeTransferFrom(address(this), sale.seller, sale.tokenId) {
                        log("Sale closed: NFT returned to seller", saleId);
                    } catch Error(string memory reason) {
                        emit SaleTransferFailed(saleId, reason);
                        log("Sale closed: NFT transfer failed", reason);
                    } catch {
                        emit SaleTransferFailed(saleId, "unknown error");
                        log("Sale closed: NFT transfer failed with unknown error");
                    }
                }
            } catch Error(string memory reason) {
                emit SaleTransferFailed(saleId, reason);
                log("Sale closed: NFT ownership check failed", reason);
            } catch {
                emit SaleTransferFailed(saleId, "unknown error");
                log("Sale closed: NFT ownership check failed with unknown error");
            }
        }
        
        sale.status = SaleStatus.Closed;
        emit SaleClosed(saleId, sale.buyer, sale.seller, sale.receivedPrice);
    }

    /**
     * @notice Finalizes expired sale and transfers the NFTs back to the seller if no buyer is found.
     * Only open sales that have passed their end time are considered for finalization.
     * For auction sales, the NFT is transferred to the highest bidder if there is one,
     * otherwise, it is returned to the seller.
     * For direct sales, if the NFT was not bought, it is returned to the seller.
     */
    function finalizeExpiredSale(uint256 saleId) external nonReentrant whenNotPaused {
        ReserveSale storage sale = reserveSale[saleId];
        require(sale.status == SaleStatus.Open, "Sosh: Sale not open");
        require(sale.endTime < _getCurrentTimestamp(), "Sosh: Sale is still active");
        
        if (sale.buyer != address(0) && sale.saleType == SaleType.Auction) {
            // Auction with a bid - finalize it
            finalizeSale(sale.tokenId, sale.seller, sale.buyer, sale.receivedPrice);
            sale.status = SaleStatus.Closed;
            emit SaleClosed(saleId, sale.buyer, sale.seller, sale.receivedPrice);
            log("Expired auction finalized with buyer", saleId);
        } else {
            // No buyer or direct sale - return NFT to seller
            try IERC721(nftContractAddress).safeTransferFrom(address(this), sale.seller, sale.tokenId) {
                sale.status = SaleStatus.Closed;
                emit SaleClosed(saleId, address(0), sale.seller, 0);
                log("Expired sale finalized with no buyer", saleId);
            } catch Error(string memory reason) {
                sale.status = SaleStatus.Closed;
                emit SaleTransferFailed(saleId, reason);
                log("Expired sale finalization failed", reason);
            } catch {
                sale.status = SaleStatus.Closed;
                emit SaleTransferFailed(saleId, "unknown error");
                log("Expired sale finalization failed with unknown error");
            }
        }
    }

    /**
     * @notice Batch process expired sales to clean them up.
     * This function allows for efficient cleanup of multiple expired sales in a single transaction.
     * Only open sales that have passed their end time and have no buyer are processed.
     */
    function cleanupExpiredSales(uint256[] calldata saleIds) external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < saleIds.length; i++) {
            uint256 saleId = saleIds[i];
            ReserveSale storage sale = reserveSale[saleId];
            
            if (sale.status == SaleStatus.Open && 
                sale.endTime < _getCurrentTimestamp()) {
                
                if (sale.buyer != address(0) && sale.saleType == SaleType.Auction) {
                    // Auction with a bid - finalize it
                    try IERC721(nftContractAddress).safeTransferFrom(address(this), sale.buyer, sale.tokenId) {
                        // Transfer funds to seller
                        (uint256 totalFee, uint256 ownerRevenue) = _getFees(nftContractAddress, sale.tokenId, sale.seller, sale.receivedPrice);
                        transferNative(treasuryContractAddress, totalFee);
                        transferNative(sale.seller, ownerRevenue);
                        
                        sale.status = SaleStatus.Closed;
                        emit SaleClosed(saleId, sale.buyer, sale.seller, sale.receivedPrice);
                        log("Batch cleanup: Auction finalized with buyer", saleId);
                    } catch Error(string memory reason) {
                        sale.status = SaleStatus.Closed;
                        emit SaleTransferFailed(saleId, reason);
                        log("Batch cleanup: Auction finalization failed", reason);
                    } catch {
                        sale.status = SaleStatus.Closed;
                        emit SaleTransferFailed(saleId, "unknown error");
                        log("Batch cleanup: Auction finalization failed with unknown error");
                    }
                } else {
                    // No buyer or direct sale - return NFT to seller
                    try IERC721(nftContractAddress).ownerOf(sale.tokenId) returns (address owner) {
                        if (owner == address(this)) {
                            try IERC721(nftContractAddress).safeTransferFrom(address(this), sale.seller, sale.tokenId) {
                                sale.status = SaleStatus.Closed;
                                emit SaleClosed(saleId, address(0), sale.seller, 0);
                                log("Batch cleanup: Sale finalized with no buyer", saleId);
                            } catch Error(string memory reason) {
                                sale.status = SaleStatus.Closed;
                                emit SaleTransferFailed(saleId, reason);
                                log("Batch cleanup: NFT transfer failed", reason);
                            } catch {
                                sale.status = SaleStatus.Closed;
                                emit SaleTransferFailed(saleId, "unknown error");
                                log("Batch cleanup: NFT transfer failed with unknown error");
                            }
                        } else {
                            // NFT is not in the marketplace anymore
                            sale.status = SaleStatus.Closed;
                            emit SaleClosed(saleId, address(0), sale.seller, 0);
                            log("Batch cleanup: NFT not in marketplace", saleId);
                        }
                    } catch {
                        // If ownerOf reverts, the token might not exist anymore or have been burned
                        sale.status = SaleStatus.Closed;
                        emit SaleTransferFailed(saleId, "Token does not exist");
                        log("Batch cleanup: Token does not exist", saleId);
                    }
                }
            }
        }
    }

    function transferNative(address payable receiver, uint256 amount) internal {
        (bool success,) = receiver.call{value: amount}("");
        require(success, "Sosh: Transfer failed");
    }

    function _getCurrentTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    function incrementId() internal returns (uint256) {
        return ++saleIdTracker;
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override onlyAdmin {
        log("Contract upgrade authorized", newImplementation);
    }
}
