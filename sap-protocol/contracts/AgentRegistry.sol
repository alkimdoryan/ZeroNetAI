// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IWorldID} from "./interfaces/IWorldID.sol";

/**
 * @title AgentRegistry
 * @dev Registry for SAP Protocol agents with WorldID proof verification
 * Task 3.3: AgentRegistry.sol with WorldID proof → registerAgent(...) → mapping(address → Agent)
 */
contract AgentRegistry {
    using ByteHasher for bytes;

    /// @notice Thrown when attempting to reuse a nullifier
    error DuplicateNullifier(uint256 nullifierHash);

    /// @notice Thrown when the World ID proof is invalid
    error InvalidWorldIdProof();

    /// @notice Thrown when the agent is already registered
    error AgentAlreadyRegistered(address agent);

    /// @notice Thrown when the agent is not registered
    error AgentNotRegistered(address agent);

    /// @notice Thrown when caller is not the agent owner
    error NotAgentOwner(address caller, address agent);

    /// @dev The World ID instance that will be used for verifying proofs
    IWorldID internal immutable worldId;

    /// @dev The contract's external nullifier hash
    uint256 internal immutable externalNullifier;

    /// @dev The World ID group ID (1 for orb-verified accounts)
    uint256 internal immutable groupId = 1;

    /// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
    mapping(uint256 => bool) internal nullifierHashes;

    /// @dev Agent information structure
    struct Agent {
        address owner;
        string name;
        string description;
        string zkVMEndpoint;
        uint256 registrationTime;
        uint256 taskCount;
        uint256 score;
        bool isActive;
    }

    /// @dev Mapping from agent address to agent information
    mapping(address => Agent) public agents;

    /// @dev Mapping from owner address to agent address
    mapping(address => address) public ownerToAgent;

    /// @dev Array of all registered agent addresses
    address[] public agentAddresses;

    /// @dev Events
    event AgentRegistered(
        address indexed agent,
        address indexed owner,
        string name,
        uint256 timestamp
    );

    event AgentUpdated(
        address indexed agent,
        string name,
        string description,
        string zkVMEndpoint
    );

    event AgentDeactivated(address indexed agent, uint256 timestamp);

    event AgentScoreUpdated(address indexed agent, uint256 newScore);

    event AgentTaskCompleted(address indexed agent, uint256 taskId);

    /// @param _worldId The WorldID instance that will verify the proofs
    /// @param _appId The World ID app ID
    /// @param _actionId The World ID action ID
    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId
    ) {
        worldId = _worldId;
        externalNullifier = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
            .hashToField();
    }

    /// @param root The root of the Merkle tree (returned by the JS widget).
    /// @param nullifierHash The nullifier hash for this proof, preventing double signaling (returned by the JS widget).
    /// @param proof The zero-knowledge proof that demonstrates the claimer is registered with World ID (returned by the JS widget).
    /// @param agentAddress The address where the agent smart contract will be deployed
    /// @param name The name of the agent
    /// @param description The description of the agent
    /// @param zkVMEndpoint The zkVM endpoint URL for the agent
    function registerAgent(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        address agentAddress,
        string memory name,
        string memory description,
        string memory zkVMEndpoint
    ) public {
        // First, we make sure this person hasn't done this before
        if (nullifierHashes[nullifierHash]) revert DuplicateNullifier(nullifierHash);

        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(msg.sender).hashToField(),
            nullifierHash,
            externalNullifier,
            proof
        );

        // We now record the user has done this, so they can't do it again (proof of uniqueness)
        nullifierHashes[nullifierHash] = true;

        // Check if agent is already registered
        if (agents[agentAddress].owner != address(0)) {
            revert AgentAlreadyRegistered(agentAddress);
        }

        // Check if owner already has an agent
        if (ownerToAgent[msg.sender] != address(0)) {
            revert AgentAlreadyRegistered(ownerToAgent[msg.sender]);
        }

        // Register the agent
        agents[agentAddress] = Agent({
            owner: msg.sender,
            name: name,
            description: description,
            zkVMEndpoint: zkVMEndpoint,
            registrationTime: block.timestamp,
            taskCount: 0,
            score: 100, // Starting score
            isActive: true
        });

        // Update mappings
        ownerToAgent[msg.sender] = agentAddress;
        agentAddresses.push(agentAddress);

        emit AgentRegistered(agentAddress, msg.sender, name, block.timestamp);
    }

    /// @dev Update agent information (only by owner)
    function updateAgent(
        address agentAddress,
        string memory name,
        string memory description,
        string memory zkVMEndpoint
    ) public {
        if (agents[agentAddress].owner != msg.sender) {
            revert NotAgentOwner(msg.sender, agentAddress);
        }

        agents[agentAddress].name = name;
        agents[agentAddress].description = description;
        agents[agentAddress].zkVMEndpoint = zkVMEndpoint;

        emit AgentUpdated(agentAddress, name, description, zkVMEndpoint);
    }

    /// @dev Deactivate an agent (only by owner)
    function deactivateAgent(address agentAddress) public {
        if (agents[agentAddress].owner != msg.sender) {
            revert NotAgentOwner(msg.sender, agentAddress);
        }

        agents[agentAddress].isActive = false;
        emit AgentDeactivated(agentAddress, block.timestamp);
    }

    /// @dev Update agent score (only by TaskBoard contract)
    function updateAgentScore(address agentAddress, uint256 newScore) external {
        // In a real implementation, this would have access control
        // For now, we'll allow anyone to update (should be restricted to TaskBoard)
        if (agents[agentAddress].owner == address(0)) {
            revert AgentNotRegistered(agentAddress);
        }

        agents[agentAddress].score = newScore;
        emit AgentScoreUpdated(agentAddress, newScore);
    }

    /// @dev Record task completion (only by TaskBoard contract)
    function recordTaskCompletion(address agentAddress, uint256 taskId) external {
        // In a real implementation, this would have access control
        // For now, we'll allow anyone to update (should be restricted to TaskBoard)
        if (agents[agentAddress].owner == address(0)) {
            revert AgentNotRegistered(agentAddress);
        }

        agents[agentAddress].taskCount++;
        emit AgentTaskCompleted(agentAddress, taskId);
    }

    /// @dev Get agent information
    function getAgent(address agentAddress) public view returns (Agent memory) {
        return agents[agentAddress];
    }

    /// @dev Get agent by owner
    function getAgentByOwner(address owner) public view returns (address) {
        return ownerToAgent[owner];
    }

    /// @dev Get all agent addresses
    function getAllAgents() public view returns (address[] memory) {
        return agentAddresses;
    }

    /// @dev Get total number of registered agents
    function getTotalAgents() public view returns (uint256) {
        return agentAddresses.length;
    }

    /// @dev Check if an agent is registered
    function isAgentRegistered(address agentAddress) public view returns (bool) {
        return agents[agentAddress].owner != address(0);
    }

    /// @dev Check if an agent is active
    function isAgentActive(address agentAddress) public view returns (bool) {
        return agents[agentAddress].isActive;
    }
}

/// @title ByteHasher
/// @author Worldcoin
/// @notice Library to hash arbitrary bytes using the Poseidon hash function
library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(value)) >> 8;
    }
} 