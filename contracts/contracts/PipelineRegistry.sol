// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title PipelineRegistry
/// @notice Stores user-created reactive automation pipelines
contract PipelineRegistry {
    struct Pipeline {
        address owner;
        address triggerContract;
        bytes32 eventTopic;
        address actionContract;
        bytes4 actionSelector;
        string label;
        bool isActive;
        uint256 executionCount;
        uint256 lastExecutedAt;
    }

    uint256 public pipelineCount;
    mapping(uint256 => Pipeline) public pipelines;
    mapping(address => uint256[]) public ownerPipelines;

    event PipelineCreated(uint256 indexed id, address indexed owner, address triggerContract, bytes32 eventTopic, address actionContract);
    event PipelineToggled(uint256 indexed id, bool isActive);
    event PipelineExecutionRecorded(uint256 indexed id, uint256 executionCount);

    function createPipeline(
        address triggerContract,
        bytes32 eventTopic,
        address actionContract,
        bytes4 actionSelector,
        string calldata label
    ) external returns (uint256 id) {
        id = pipelineCount++;
        pipelines[id] = Pipeline({
            owner: msg.sender,
            triggerContract: triggerContract,
            eventTopic: eventTopic,
            actionContract: actionContract,
            actionSelector: actionSelector,
            label: label,
            isActive: true,
            executionCount: 0,
            lastExecutedAt: 0
        });
        ownerPipelines[msg.sender].push(id);
        emit PipelineCreated(id, msg.sender, triggerContract, eventTopic, actionContract);
    }

    function togglePipeline(uint256 id) external {
        require(pipelines[id].owner == msg.sender, "Not owner");
        pipelines[id].isActive = !pipelines[id].isActive;
        emit PipelineToggled(id, pipelines[id].isActive);
    }

    /// @notice Called by ActionExecutor to record an execution
    function recordExecution(uint256 id) external {
        Pipeline storage p = pipelines[id];
        p.executionCount++;
        p.lastExecutedAt = block.timestamp;
        emit PipelineExecutionRecorded(id, p.executionCount);
    }

    function getOwnerPipelines(address owner) external view returns (uint256[] memory) {
        return ownerPipelines[owner];
    }

    function getPipeline(uint256 id) external view returns (Pipeline memory) {
        return pipelines[id];
    }
}
