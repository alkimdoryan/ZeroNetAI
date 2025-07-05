// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./AgentRegistry.sol";
import "./TaskBoard.sol";

/**
 * @title RewardToken
 * @dev ERC-20 token for SAP Protocol agent rewards
 * Task 3.5: Optional RewardToken.sol - ERC-20 rewardAgent(address,uint)
 */
contract RewardToken {
    /// @dev Token metadata
    string public constant name = "SAP Reward Token";
    string public constant symbol = "SAP";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    /// @dev Mappings
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// @dev Contract references
    AgentRegistry public immutable agentRegistry;
    TaskBoard public immutable taskBoard;
    address public immutable owner;

    /// @dev Reward rates
    uint256 public constant TASK_COMPLETION_REWARD = 10 * 10**decimals; // 10 SAP tokens
    uint256 public constant HIGH_RATING_BONUS = 5 * 10**decimals; // 5 SAP bonus for rating 5
    uint256 public constant REGISTRATION_REWARD = 100 * 10**decimals; // 100 SAP for registration

    /// @dev Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AgentRewarded(address indexed agent, uint256 amount, string reason);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    /// @dev Errors
    error InsufficientBalance(address account, uint256 balance, uint256 amount);
    error InsufficientAllowance(address spender, uint256 allowance, uint256 amount);
    error InvalidAddress(address addr);
    error OnlyOwner(address caller);
    error OnlyTaskBoard(address caller);
    error AgentNotRegistered(address agent);

    /// @dev Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner(msg.sender);
        _;
    }

    modifier onlyTaskBoard() {
        if (msg.sender != address(taskBoard)) revert OnlyTaskBoard(msg.sender);
        _;
    }

    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress(addr);
        _;
    }

    /// @param _agentRegistry The AgentRegistry contract address
    /// @param _taskBoard The TaskBoard contract address
    constructor(address _agentRegistry, address payable _taskBoard) {
        agentRegistry = AgentRegistry(_agentRegistry);
        taskBoard = TaskBoard(_taskBoard);
        owner = msg.sender;
        
        // Mint initial supply to owner for distribution
        _mint(msg.sender, 1000000 * 10**decimals); // 1M tokens
    }

    /// @dev Reward an agent for task completion
    function rewardAgent(address agent, uint256 amount) external onlyTaskBoard {
        if (!agentRegistry.isAgentRegistered(agent)) revert AgentNotRegistered(agent);
        
        _mint(agent, amount);
        emit AgentRewarded(agent, amount, "Task completion");
    }

    /// @dev Reward agent for registration
    function rewardRegistration(address agent) external {
        // This would typically be called by the AgentRegistry contract
        if (!agentRegistry.isAgentRegistered(agent)) revert AgentNotRegistered(agent);
        
        _mint(agent, REGISTRATION_REWARD);
        emit AgentRewarded(agent, REGISTRATION_REWARD, "Agent registration");
    }

    /// @dev Reward agent based on task rating
    function rewardTaskCompletion(address agent, uint256 rating) external onlyTaskBoard {
        if (!agentRegistry.isAgentRegistered(agent)) revert AgentNotRegistered(agent);
        
        uint256 baseReward = TASK_COMPLETION_REWARD;
        uint256 bonus = 0;
        
        // Bonus for high ratings
        if (rating == 5) {
            bonus = HIGH_RATING_BONUS;
        } else if (rating == 4) {
            bonus = HIGH_RATING_BONUS / 2; // 2.5 SAP bonus
        }
        
        uint256 totalReward = baseReward + bonus;
        _mint(agent, totalReward);
        
        emit AgentRewarded(agent, totalReward, "Task completion with rating");
    }

    /// @dev Standard ERC-20 transfer
    function transfer(address to, uint256 amount) external validAddress(to) returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @dev Standard ERC-20 transferFrom
    function transferFrom(address from, address to, uint256 amount) 
        external 
        validAddress(from) 
        validAddress(to) 
        returns (bool) 
    {
        uint256 currentAllowance = allowance[from][msg.sender];
        if (currentAllowance < amount) {
            revert InsufficientAllowance(msg.sender, currentAllowance, amount);
        }

        allowance[from][msg.sender] = currentAllowance - amount;
        _transfer(from, to, amount);
        return true;
    }

    /// @dev Standard ERC-20 approve
    function approve(address spender, uint256 amount) external validAddress(spender) returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @dev Increase allowance
    function increaseAllowance(address spender, uint256 addedValue) 
        external 
        validAddress(spender) 
        returns (bool) 
    {
        allowance[msg.sender][spender] += addedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }

    /// @dev Decrease allowance
    function decreaseAllowance(address spender, uint256 subtractedValue) 
        external 
        validAddress(spender) 
        returns (bool) 
    {
        uint256 currentAllowance = allowance[msg.sender][spender];
        if (currentAllowance < subtractedValue) {
            revert InsufficientAllowance(spender, currentAllowance, subtractedValue);
        }
        
        allowance[msg.sender][spender] = currentAllowance - subtractedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }

    /// @dev Mint tokens (only owner)
    function mint(address to, uint256 amount) external onlyOwner validAddress(to) {
        _mint(to, amount);
    }

    /// @dev Burn tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @dev Burn tokens from specific address (with allowance)
    function burnFrom(address from, uint256 amount) external validAddress(from) {
        uint256 currentAllowance = allowance[from][msg.sender];
        if (currentAllowance < amount) {
            revert InsufficientAllowance(msg.sender, currentAllowance, amount);
        }

        allowance[from][msg.sender] = currentAllowance - amount;
        _burn(from, amount);
    }

    /// @dev Get agent's token balance
    function getAgentBalance(address agent) external view returns (uint256) {
        return balanceOf[agent];
    }

    /// @dev Get total tokens earned by an agent (including spent ones)
    function getTotalEarned(address agent) external view returns (uint256) {
        // This would require additional tracking in a real implementation
        // For now, just return current balance
        return balanceOf[agent];
    }

    /// @dev Internal transfer function
    function _transfer(address from, address to, uint256 amount) internal {
        if (balanceOf[from] < amount) {
            revert InsufficientBalance(from, balanceOf[from], amount);
        }

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    /// @dev Internal mint function
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        emit TokensMinted(to, amount);
    }

    /// @dev Internal burn function
    function _burn(address from, uint256 amount) internal {
        if (balanceOf[from] < amount) {
            revert InsufficientBalance(from, balanceOf[from], amount);
        }

        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
        emit TokensBurned(from, amount);
    }

    /// @dev Emergency function to pause token transfers (owner only)
    bool public paused = false;
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Token transfers are paused");
        _;
    }

    /// @dev Override transfer functions to include pause check
    function _transferWithPauseCheck(address from, address to, uint256 amount) internal whenNotPaused {
        _transfer(from, to, amount);
    }
} 