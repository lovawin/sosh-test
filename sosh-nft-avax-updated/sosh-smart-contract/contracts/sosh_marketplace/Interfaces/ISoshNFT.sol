// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface ISoshNFT {
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view returns (address, uint256);

    function getTokenCreator(uint256 tokenId) external view returns (address);
}
