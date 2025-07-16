// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/**
 * @notice Interface for SoshRoleManager which wraps role from
 * OpenZeppelin's AccessControl for easy integration.
 */
interface ISoshRoleManager {
    function isAdmin(address account) external view returns (bool);
}
