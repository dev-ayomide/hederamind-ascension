// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice Minimal ERC-8004–style registry for verifying autonomous agents on Hedera
 * @dev Stores owner, role, metadata, and hashed public key so off-chain services can prove identity.
 */
contract AgentRegistry {
    struct Agent {
        address owner;
        string role;
        string metadataURI;
        bytes32 publicKeyHash;
        uint64 registeredAt;
        bool active;
    }

    mapping(bytes32 => Agent) private agents;

    event AgentRegistered(bytes32 indexed agentKey, address indexed owner, string role, string metadataURI);
    event AgentUpdated(bytes32 indexed agentKey, string metadataURI);
    event AgentStatusChanged(bytes32 indexed agentKey, bool active);

    /**
     * @notice Deterministically derive the agent key from its human-readable identifier
     */
    function agentKey(string calldata agentId) public pure returns (bytes32) {
        return keccak256(bytes(agentId));
    }

    /**
     * @notice Register a new agent on-chain
     * @param agentId Human-readable identifier ("truth-agent", "badge-agent", etc.)
     * @param role Short description of agent responsibilities
     * @param metadataURI Pointer to JSON metadata or API endpoint
     * @param publicKey Raw public key bytes for verification
     */
    function registerAgent(
        string calldata agentId,
        string calldata role,
        string calldata metadataURI,
        bytes calldata publicKey
    ) external returns (bytes32) {
        bytes32 key = agentKey(agentId);
        require(agents[key].owner == address(0), "Agent already registered");

        agents[key] = Agent({
            owner: msg.sender,
            role: role,
            metadataURI: metadataURI,
            publicKeyHash: keccak256(publicKey),
            registeredAt: uint64(block.timestamp),
            active: true
        });

        emit AgentRegistered(key, msg.sender, role, metadataURI);
        return key;
    }

    /**
     * @notice Update metadata URI for an existing agent
     */
    function updateMetadata(string calldata agentId, string calldata metadataURI) external {
        bytes32 key = agentKey(agentId);
        Agent storage agent = agents[key];
        require(agent.owner == msg.sender, "Not agent owner");
        agent.metadataURI = metadataURI;
        emit AgentUpdated(key, metadataURI);
    }

    /**
     * @notice Toggle agent availability without removing its historical record
     */
    function setAgentActive(string calldata agentId, bool active) external {
        bytes32 key = agentKey(agentId);
        Agent storage agent = agents[key];
        require(agent.owner == msg.sender, "Not agent owner");
        agent.active = active;
        emit AgentStatusChanged(key, active);
    }

    /**
     * @notice Verify the raw public key presented by an off-chain service
     */
    function verifyPublicKey(string calldata agentId, bytes calldata publicKey) external view returns (bool) {
        bytes32 key = agentKey(agentId);
        Agent memory agent = agents[key];
        if (agent.owner == address(0) || !agent.active) {
            return false;
        }
        return agent.publicKeyHash == keccak256(publicKey);
    }

    /**
     * @notice Read all metadata for a registered agent
     */
    function getAgent(
        string calldata agentId
    )
        external
        view
        returns (
            address owner,
            string memory role,
            string memory metadataURI,
            bytes32 publicKeyHash,
            uint64 registeredAt,
            bool active
        )
    {
        bytes32 key = agentKey(agentId);
        Agent memory agent = agents[key];
        require(agent.owner != address(0), "Agent not registered");

        return (
            agent.owner,
            agent.role,
            agent.metadataURI,
            agent.publicKeyHash,
            agent.registeredAt,
            agent.active
        );
    }
}

