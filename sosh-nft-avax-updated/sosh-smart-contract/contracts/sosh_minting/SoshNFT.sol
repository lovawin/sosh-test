// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "../Interfaces/ISoshRoleManager.sol";

/**
 * @title Sosh NFTs implemented using the ERC-721 standard and ERC-2981 Standard for roaylty .
 * @dev This version restricts transfers to only be allowed through the Sosh marketplace.
 */

contract SoshNFT is
    Initializable,
    UUPSUpgradeable,
    ERC721Upgradeable,
    PausableUpgradeable,
    ERC721RoyaltyUpgradeable,
    ERC721URIStorageUpgradeable
{
    mapping(uint256 => address) private tokenIdToCreator;

    uint96 public royaltyFee;
    uint96 public maxRoyalityFee;
    uint256 public mintFee;
    string public baseURI;
    uint56 public tokenIdTracker;
    address payable public treasuryContractAddress;
    address public marketContractAddress;

    event Minted(uint256 tokenId, address creator, uint256 amount);
    event MarketplaceRestrictionToggled(bool restricted);

    // Flag to enable/disable marketplace restriction
    bool public marketplaceRestricted;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Called once to configure the contract after the initial deployment.
     * @dev This farms the initialize call out to inherited contracts as needed.
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        address payable _soshTreasury,
        address _soshMarket,
        string memory _baseUri,
        uint96 _royaltyFee,
        uint96 _maxRoyalityFee,
        uint256 _mintFee
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __ERC721Royalty_init();
        __Pausable_init();
        __ERC721URIStorage_init();
        __UUPSUpgradeable_init();
        mintFee = _mintFee;
        baseURI = _baseUri;
        royaltyFee = _royaltyFee;
        maxRoyalityFee = _maxRoyalityFee;
        treasuryContractAddress = _soshTreasury;
        marketContractAddress = _soshMarket;
        marketplaceRestricted = true; // Enable marketplace restriction by default
    }

    modifier onlyAdmin() {
        require(
            ISoshRoleManager(treasuryContractAddress).isAdmin(_msgSender()),
            "Sosh: caller does not have the Admin role"
        );
        _;
    }

    /**
     * @notice Returns the creator's address for a given tokenId.
     */
    function getTokenCreator(uint256 tokenId) external view returns (address) {
        return tokenIdToCreator[tokenId];
    }

    /**
     * @notice Allows admin to pause transfer of NFTs
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @notice Allows admin to unpause transfer of NFTs
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @notice Allows admin to toggle marketplace restriction
     */
    function adminToggleMarketplaceRestriction(bool _restricted) external onlyAdmin {
        marketplaceRestricted = _restricted;
        emit MarketplaceRestrictionToggled(_restricted);
    }

    /**
     * @notice allows admin to update sosh Treasury smart contract address
     */
    function adminUpdateSoshTreasury(
        address payable _soshTreasury
    ) external onlyAdmin {
        treasuryContractAddress = _soshTreasury;
    }

    /**
     * @notice allows admin to update sosh Market smart contract address
     */
    function adminUpdateSoshMarket(address _soshMarket) external onlyAdmin {
        marketContractAddress = _soshMarket;
    }

    /**
     * @notice allows admin to update royalty Fee and mint Fee
     */
    function adminUpdateFeeConfig(
        uint256 _mintFee,
        uint96 _royaltyFee
    ) external onlyAdmin {
        require(_royaltyFee <= maxRoyalityFee);
        royaltyFee = _royaltyFee;
        mintFee = _mintFee;
    }

    /**
     * @notice allows admin to update baseUri
     */
    function adminUpdateBaseUri(string memory _baseUri) external onlyAdmin {
        require(bytes(_baseUri).length > 0, "Invalid base uri");
        baseURI = _baseUri;
    }

    /**
     * @notice Allows a creator to mint unique NFT and
     *  have creator revenue/royalties sent to an alternate address.
     */
    function mintWithRoyalty(
        address to,
        string memory tokenUri
    ) external payable whenNotPaused {
        require(bytes(tokenUri).length > 0, "Token URI can't be empty");
        require(msg.value == mintFee, "Insufficient mintFee");
        uint256 tokenId = incrementId();
        _mint(to, tokenId, tokenUri);
    }

    /**
     * @notice helper function to create given amount of NFT with creators revenue/roylaties info
     */
    function _mint(
        address to,
        uint256 tokenId,
        string memory tokenUri
    ) internal {
        tokenIdToCreator[tokenId] = _msgSender();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        (bool success, ) = treasuryContractAddress.call{value: msg.value}("");
        require(success, "Mint Fee: Treasury transfer failed");
        _setTokenRoyalty(tokenId, treasuryContractAddress, royaltyFee);
        approve(marketContractAddress, tokenId);
        emit Minted(tokenId, _msgSender(), msg.value);
    }

    // Override approve to restrict approvals to only the marketplace
    function approve(
        address to, 
        uint256 tokenId
    ) public virtual override(ERC721Upgradeable, IERC721) whenNotPaused {
        if (marketplaceRestricted && to != address(0)) {
            // Only allow approvals to the marketplace contract
            // Zero address is allowed for revoking approvals
            require(
                to == marketContractAddress,
                "SoshNFT: approvals only allowed for Sosh marketplace"
            );
        }
        
        super.approve(to, tokenId);
    }

    // Override setApprovalForAll to prevent approving all tokens to other marketplaces
    function setApprovalForAll(
        address operator, 
        bool approved
    ) public virtual override(ERC721Upgradeable, IERC721) whenNotPaused {
        if (marketplaceRestricted && approved) {
            require(
                operator == marketContractAddress,
                "SoshNFT: approvals only allowed for Sosh marketplace"
            );
        }
        
        super.setApprovalForAll(operator, approved);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _baseURI()
        internal
        view
        virtual
        override(ERC721Upgradeable)
        returns (string memory)
    {
        return baseURI;
    }

    /**
     * @dev Explicit override to address compile errors.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            ERC721Upgradeable,
            ERC721URIStorageUpgradeable,
            ERC721RoyaltyUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function incrementId() internal returns (uint256) {
        return ++tokenIdTracker;
    }

    /**
     * @dev Explicit override to address compile errors.
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyAdmin {}
}
