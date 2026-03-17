// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";
import { PipelineRegistry } from "./PipelineRegistry.sol";

/// @title ActionExecutor
/// @notice Somnia Reactivity handler — invoked by validators when watched events fire.
///         Scans active pipelines matching the emitter+topic and executes their actions.
contract ActionExecutor is SomniaEventHandler {
    PipelineRegistry public immutable registry;

    event PipelineExecuted(
        uint256 indexed pipelineId,
        address indexed triggerContract,
        address indexed actionContract,
        bytes4 actionSelector,
        bool success
    );

    constructor(address _registry) {
        registry = PipelineRegistry(_registry);
    }

    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata /*data*/
    ) internal override {
        bytes32 topic = eventTopics.length > 0 ? eventTopics[0] : bytes32(0);
        uint256 total = registry.pipelineCount();

        for (uint256 i = 0; i < total; i++) {
            PipelineRegistry.Pipeline memory p = registry.getPipeline(i);
            if (!p.isActive) continue;
            if (p.triggerContract != emitter) continue;
            if (p.eventTopic != bytes32(0) && p.eventTopic != topic) continue;

            (bool success, ) = p.actionContract.call(abi.encodeWithSelector(p.actionSelector));
            registry.recordExecution(i);

            emit PipelineExecuted(i, emitter, p.actionContract, p.actionSelector, success);
        }
    }
}
