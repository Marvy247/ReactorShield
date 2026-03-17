// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title ActionLogger
/// @notice A meaningful action contract — pipelines call this to log reactions on-chain.
///         Each log entry is permanently recorded and queryable.
contract ActionLogger {
    struct LogEntry {
        uint256 timestamp;
        address caller;
        uint256 count;
    }

    LogEntry[] public logs;

    event ActionTriggered(address indexed caller, uint256 count, uint256 timestamp);

    function execute() external {
        uint256 count = logs.length + 1;
        logs.push(LogEntry({ timestamp: block.timestamp, caller: msg.sender, count: count }));
        emit ActionTriggered(msg.sender, count, block.timestamp);
    }

    function getLogCount() external view returns (uint256) {
        return logs.length;
    }

    function getLatestLog() external view returns (LogEntry memory) {
        require(logs.length > 0, "No logs yet");
        return logs[logs.length - 1];
    }
}
