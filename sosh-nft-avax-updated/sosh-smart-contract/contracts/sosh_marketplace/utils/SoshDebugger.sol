// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title SoshDebugger
 * @notice A utility contract that provides conditional debugging capabilities
 * @dev Automatically disables logging on mainnet unless explicitly enabled by admin
 */
abstract contract SoshDebugger is Initializable {
    // Mainnet Chain IDs
    uint256 private constant AVALANCHE_MAINNET_CHAIN_ID = 43114;
    
    // Debug state
    bool public debuggingEnabled;
    
    // Events
    event DebuggingToggled(bool enabled);
    
    /**
     * @notice Initializes the debugger
     * @dev Sets debugging to disabled by default
     */
    function __SoshDebugger_init() internal onlyInitializing {
        debuggingEnabled = false;
    }
    
    /**
     * @notice Allows admin to toggle debugging on/off
     * @param _enabled Whether debugging should be enabled
     */
    function toggleDebugging(bool _enabled) external virtual {
        // This will be overridden by the main contract to add access control
        debuggingEnabled = _enabled;
        emit DebuggingToggled(_enabled);
    }
    
    /**
     * @notice Checks if debugging is currently enabled
     * @return True if debugging is enabled for the current network
     */
    function isDebuggingEnabled() public view returns (bool) {
        // Enable debugging on testnets automatically, or if explicitly enabled by admin
        return (block.chainid != AVALANCHE_MAINNET_CHAIN_ID) || debuggingEnabled;
    }
    
    /**
     * @notice Logs a message if debugging is enabled
     * @param message The message to log
     */
    function log(string memory message) internal view {
        if (isDebuggingEnabled()) {
            console.log(message);
        }
    }
    
    /**
     * @notice Logs a message with an address if debugging is enabled
     * @param message The message to log
     * @param addr The address to log
     */
    function log(string memory message, address addr) internal view {
        if (isDebuggingEnabled()) {
            console.log(message, addr);
        }
    }
    
    /**
     * @notice Logs a message with a uint if debugging is enabled
     * @param message The message to log
     * @param val The uint to log
     */
    function log(string memory message, uint val) internal view {
        if (isDebuggingEnabled()) {
            console.log(message, val);
        }
    }
    
    /**
     * @notice Logs a message with a string if debugging is enabled
     * @param message The message to log
     * @param val The string to log
     */
    function log(string memory message, string memory val) internal view {
        if (isDebuggingEnabled()) {
            console.log(message, val);
        }
    }
    
    /**
     * @notice Logs a message with a bool if debugging is enabled
     * @param message The message to log
     * @param val The bool to log
     */
    function log(string memory message, bool val) internal view {
        if (isDebuggingEnabled()) {
            console.log(message, val);
        }
    }
    
    // Reserved storage gap for future upgrades
    uint256[50] private __gap;
}
