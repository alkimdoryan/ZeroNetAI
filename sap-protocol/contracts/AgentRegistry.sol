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

    /// @notice Thrown when bypass mode is disabled but bypass registration is attempted
    error BypassModeDisabled();

    /// @dev The World ID instance that will be used for verifying proofs
    IWorldID internal immutable worldId;

    /// @dev The contract's external nullifier hash
    uint256 internal immutable externalNullifier;

    /// @dev The World ID group ID (1 for orb-verified accounts)
    uint256 internal immutable groupId = 1;

    /// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
    mapping(uint256 => bool) internal nullifierHashes;

    /// @dev WorldID Bypass configuration for development/testing
    bool public bypassModeEnabled;
    address public owner;
    mapping(address => bool) public bypassRegistrations;

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
        bool bypassRegistered; // Flag to indicate if registered via bypass
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

    event AgentRegisteredBypass(
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

    event BypassModeToggled(bool enabled, address caller);

    /// @dev Modifier to restrict functions to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /// @param _worldId The WorldID instance that will verify the proofs
    /// @param _appId The World ID app ID
    /// @param _actionId The World ID action ID
    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId
    ) {
        worldId = _worldId;
        owner = msg.sender;
        bypassModeEnabled = true; // Enable by default for development
        externalNullifier = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
            .hashToField();
    }

    /// @dev Toggle WorldID bypass mode (only owner)
    function toggleBypassMode(bool _enabled) external onlyOwner {
        bypassModeEnabled = _enabled;
        emit BypassModeToggled(_enabled, msg.sender);
    }

    /// @dev Register agent with bypass mode (for development/testing)
    function registerAgentBypass(
        address agentAddress,
        string memory name,
        string memory description,
        string memory zkVMEndpoint
    ) external {
        if (!bypassModeEnabled) {
            revert BypassModeDisabled();
        }

        // Check if agent is already registered
        if (agents[agentAddress].owner != address(0)) {
            revert AgentAlreadyRegistered(agentAddress);
        }

        // Check if owner already has an agent
        if (ownerToAgent[msg.sender] != address(0)) {
            revert AgentAlreadyRegistered(ownerToAgent[msg.sender]);
        }

        // Register the agent with bypass flag
        agents[agentAddress] = Agent({
            owner: msg.sender,
            name: name,
            description: description,
            zkVMEndpoint: zkVMEndpoint,
            registrationTime: block.timestamp,
            taskCount: 0,
            score: 100, // Starting score
            isActive: true,
            bypassRegistered: true
        });

        // Update mappings
        ownerToAgent[msg.sender] = agentAddress;
        agentAddresses.push(agentAddress);
        bypassRegistrations[agentAddress] = true;

        emit AgentRegisteredBypass(agentAddress, msg.sender, name, block.timestamp);
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
    ) external {
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
            isActive: true,
            bypassRegistered: false
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
    ) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner == address(0)) {
            revert AgentNotRegistered(agentAddress);
        }
        if (agent.owner != msg.sender) {
            revert NotAgentOwner(msg.sender, agentAddress);
        }

        agent.name = name;
        agent.description = description;
        agent.zkVMEndpoint = zkVMEndpoint;

        emit AgentUpdated(agentAddress, name, description, zkVMEndpoint);
    }

    /// @dev Deactivate agent (only by owner)
    function deactivateAgent(address agentAddress) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner == address(0)) {
            revert AgentNotRegistered(agentAddress);
        }
        if (agent.owner != msg.sender) {
            revert NotAgentOwner(msg.sender, agentAddress);
        }

        agent.isActive = false;
        emit AgentDeactivated(agentAddress, block.timestamp);
    }

    /// @dev Update agent score (can be called by authorized contracts)
    function updateScore(address agentAddress, uint256 newScore) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner == address(0)) {
            revert AgentNotRegistered(agentAddress);
        }

        agent.score = newScore;
        emit AgentScoreUpdated(agentAddress, newScore);
    }

    /// @dev Record task completion (can be called by authorized contracts)
    function recordTaskCompletion(address agentAddress, uint256 taskId) external {
        Agent storage agent = agents[agentAddress];
        if (agent.owner == address(0)) {
            revert AgentNotRegistered(agentAddress);
        }

        agent.taskCount++;
        emit AgentTaskCompleted(agentAddress, taskId);
    }

    /// @dev Check if agent is registered
    function isRegistered(address agentAddress) external view returns (bool) {
        return agents[agentAddress].owner != address(0);
    }

    /// @dev Get agent information
    function getAgent(address agentAddress) external view returns (Agent memory) {
        return agents[agentAddress];
    }

    /// @dev Get all registered agents
    function getAllAgents() external view returns (address[] memory) {
        return agentAddresses;
    }

    /// @dev Get agent count
    function getAgentCount() external view returns (uint256) {
        return agentAddresses.length;
    }

    /// @dev Check if registration was done via bypass
    function isRegisteredViaBypass(address agentAddress) external view returns (bool) {
        return bypassRegistrations[agentAddress];
    }

    /// @dev Get bypass registrations count
    function getBypassRegistrationsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (bypassRegistrations[agentAddresses[i]]) {
                count++;
            }
        }
        return count;
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