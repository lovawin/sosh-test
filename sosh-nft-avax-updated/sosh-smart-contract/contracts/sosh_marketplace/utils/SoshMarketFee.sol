// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../Interfaces/ISoshNFT.sol";

/**
 * @notice A mixin to distribute funds when an NFT is sold.
 */
import "hardhat/console.sol";

abstract contract SoshMarketFee is Initializable {
    uint256 internal constant BASIS_POINTS = 10000;
    uint256 private _primarySoshFeeBasisPoints;
    uint256 private _secondarySoshFeeBasisPoints;

    uint256 private _upperCapPrimaryFeeBasisPoints;
    uint256 private _upperCapSecondaryFeeBasisPoints;
    event MarketFeesUpdated(
        uint256 primarySoshFeeBasisPoints,
        uint256 secondarySoshFeeBasisPoints
    );

    function _SoshMarketFee_initialize(
        uint256 primarySoshFeeBasisPoints,
        uint256 secondarySoshFeeBasisPoints,
        uint256 upperCapPrimaryFeeBasisPoints,
        uint256 upperCapSecondaryFeeBasisPoints
    ) internal initializer {
        require(
            primarySoshFeeBasisPoints <= upperCapPrimaryFeeBasisPoints &&
                secondarySoshFeeBasisPoints <= upperCapSecondaryFeeBasisPoints,
            "SoshMarketFee: exceeds uppercap"
        );
        _primarySoshFeeBasisPoints = primarySoshFeeBasisPoints;
        _secondarySoshFeeBasisPoints = secondarySoshFeeBasisPoints;
        _upperCapPrimaryFeeBasisPoints = upperCapPrimaryFeeBasisPoints;
        _upperCapSecondaryFeeBasisPoints = upperCapSecondaryFeeBasisPoints;
    }

    /**
     * @notice Returns the current fee configuration in basis points.
     */
    function getFeeConfig()
        external
        view
        returns (
            uint256 primarySoshFeeBasisPoints,
            uint256 secondarySoshFeeBasisPoints
        )
    {
        return (_primarySoshFeeBasisPoints, _secondarySoshFeeBasisPoints);
    }

    /**
     * @notice Returns the current fee uppercap configuration in basis points.
     */
    function getMaxUppercapForFee()
        external
        view
        returns (
            uint256 upperCapPrimaryFeeBasisPoints,
            uint256 upperCapSecondaryFeeBasisPoints
        )
    {
        return (
            _upperCapPrimaryFeeBasisPoints,
            _upperCapSecondaryFeeBasisPoints
        );
    }

    /**
     * @dev A helper that determines if this is a primary sale given the current seller.
     * This is a minor optimization to use the seller if already known instead of making a redundant lookup call.
     */
    function _getIsPrimary(
        address creator,
        address seller
    ) private pure returns (bool) {
        return creator == seller;
    }

    /**
     * @dev Calculates how funds should be distributed for the given sale details.
     */
    function _getFees(
        address nftContractAddress,
        uint256 tokenId,
        address payable seller,
        uint256 price
    ) internal view returns (uint256 totalFee, uint256 ownerRevenue) {
        address creator = ISoshNFT(nftContractAddress).getTokenCreator(tokenId);

        uint256 soshFeeBasisPoint;
        uint256 royaltyFee;
        if (_getIsPrimary(creator, seller)) {
            soshFeeBasisPoint = _primarySoshFeeBasisPoints;
        } else {
            (, royaltyFee) = ISoshNFT(nftContractAddress).royaltyInfo(
                tokenId,
                price
            );
            soshFeeBasisPoint = _secondarySoshFeeBasisPoints;
        }

        uint256 soshFee = (price * soshFeeBasisPoint) / BASIS_POINTS;
        totalFee = soshFee + royaltyFee;
        ownerRevenue = price - totalFee;
    }

    /**
     * @notice Allows sosh to change the market fees.
     */
    function _updateMarketFees(
        uint256 primarySoshFeeBasisPoints,
        uint256 secondarySoshFeeBasisPoints
    ) internal {
        require(
            primarySoshFeeBasisPoints < _upperCapPrimaryFeeBasisPoints,
            "SoshMarketFee: Fees exceeds uppercap"
        );
        require(
            secondarySoshFeeBasisPoints < _upperCapSecondaryFeeBasisPoints,
            "SoshMarketFee: Fees exceeds uppercap"
        );
        _primarySoshFeeBasisPoints = primarySoshFeeBasisPoints;
        _secondarySoshFeeBasisPoints = secondarySoshFeeBasisPoints;

        emit MarketFeesUpdated(
            primarySoshFeeBasisPoints,
            secondarySoshFeeBasisPoints
        );
    }

    // `______gap` is added to each mixin to allow adding new data slots or additional mixins in an upgrade-safe way.
    uint256[2000] private __gap;
}
