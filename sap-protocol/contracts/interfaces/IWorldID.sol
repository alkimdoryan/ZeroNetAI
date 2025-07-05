// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IWorldID
 * @dev Interface for WorldID verification
 * This is a simplified version for SAP Protocol integration
 */
interface IWorldID {
    /// @notice Verifies a WorldID proof
    /// @param root The root of the Merkle tree
    /// @param groupId The group identifier for the proof
    /// @param signalHash The signal hash for the proof
    /// @param nullifierHash The nullifier hash for the proof
    /// @param externalNullifierHash The external nullifier hash for the proof
    /// @param proof The zero-knowledge proof
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
} 