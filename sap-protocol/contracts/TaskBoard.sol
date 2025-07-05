// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./AgentRegistry.sol";

/**
 * @title TaskBoard
 * @dev Decentralized task management system for SAP Protocol
 * Task 3.4: TaskBoard.sol with createTask(string), submitResult(uint256,string)
 */
contract TaskBoard {
    /// @dev Task status enumeration
    enum TaskStatus {
        Open,
        InProgress,
        Completed,
        Cancelled
    }

    /// @dev Task priority enumeration
    enum TaskPriority {
        Low,
        Medium,
        High,
        Critical
    }

    /// @dev Task structure
    struct Task {
        uint256 id;
        address creator;
        string description;
        string requirements;
        TaskPriority priority;
        uint256 reward;
        uint256 deadline;
        TaskStatus status;
        address assignedAgent;
        string result;
        uint256 createdAt;
        uint256 completedAt;
        uint256 rating;
    }

    /// @dev Task result structure
    struct TaskResult {
        uint256 taskId;
        address agent;
        string result;
        uint256 submittedAt;
        bool verified;
    }

    /// @dev Events
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        string description,
        uint256 reward,
        uint256 deadline
    );

    event TaskAssigned(
        uint256 indexed taskId,
        address indexed agent,
        uint256 timestamp
    );

    event TaskResultSubmitted(
        uint256 indexed taskId,
        address indexed agent,
        string result,
        uint256 timestamp
    );

    event TaskCompleted(
        uint256 indexed taskId,
        address indexed agent,
        uint256 reward,
        uint256 timestamp
    );

    event TaskCancelled(
        uint256 indexed taskId,
        address indexed creator,
        uint256 timestamp
    );

    event TaskRated(
        uint256 indexed taskId,
        address indexed creator,
        uint256 rating,
        uint256 timestamp
    );

    /// @dev Errors
    error TaskNotFound(uint256 taskId);
    error TaskNotOpen(uint256 taskId);
    error TaskNotInProgress(uint256 taskId);
    error TaskNotCompleted(uint256 taskId);
    error NotTaskCreator(address caller, uint256 taskId);
    error NotAssignedAgent(address caller, uint256 taskId);
    error AgentNotRegistered(address agent);
    error AgentNotActive(address agent);
    error TaskDeadlinePassed(uint256 taskId);
    error InsufficientReward(uint256 provided, uint256 required);
    error InvalidRating(uint256 rating);

    /// @dev State variables
    AgentRegistry public immutable agentRegistry;
    uint256 public nextTaskId;
    uint256 public totalTasks;
    uint256 public totalRewardPool;

    /// @dev Mappings
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => TaskResult) public taskResults;
    mapping(address => uint256[]) public creatorTasks;
    mapping(address => uint256[]) public agentTasks;
    mapping(address => uint256) public agentRewards;

    /// @dev Arrays
    uint256[] public openTasks;
    uint256[] public completedTasks;

    /// @dev Minimum reward per task
    uint256 public constant MIN_REWARD = 0.001 ether;

    /// @param _agentRegistry The AgentRegistry contract address
    constructor(address _agentRegistry) {
        agentRegistry = AgentRegistry(_agentRegistry);
        nextTaskId = 1;
    }

    /// @dev Create a new task
    function createTask(
        string memory description,
        string memory requirements,
        TaskPriority priority,
        uint256 deadline
    ) external payable returns (uint256) {
        if (msg.value < MIN_REWARD) {
            revert InsufficientReward(msg.value, MIN_REWARD);
        }

        uint256 taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            id: taskId,
            creator: msg.sender,
            description: description,
            requirements: requirements,
            priority: priority,
            reward: msg.value,
            deadline: deadline,
            status: TaskStatus.Open,
            assignedAgent: address(0),
            result: "",
            createdAt: block.timestamp,
            completedAt: 0,
            rating: 0
        });

        // Update state
        totalTasks++;
        totalRewardPool += msg.value;
        creatorTasks[msg.sender].push(taskId);
        openTasks.push(taskId);

        emit TaskCreated(taskId, msg.sender, description, msg.value, deadline);
        return taskId;
    }

    /// @dev Simple task creation with just description
    function createSimpleTask(string memory description) external payable returns (uint256) {
        return this.createTask{value: msg.value}(
            description,
            "",
            TaskPriority.Medium,
            block.timestamp + 7 days
        );
    }

    /// @dev Assign a task to an agent
    function assignTask(uint256 taskId, address agent) external {
        Task storage task = tasks[taskId];
        
        if (task.id == 0) revert TaskNotFound(taskId);
        if (task.status != TaskStatus.Open) revert TaskNotOpen(taskId);
        if (block.timestamp > task.deadline) revert TaskDeadlinePassed(taskId);
        if (!agentRegistry.isAgentRegistered(agent)) revert AgentNotRegistered(agent);
        if (!agentRegistry.isAgentActive(agent)) revert AgentNotActive(agent);

        // Update task status
        task.status = TaskStatus.InProgress;
        task.assignedAgent = agent;

        // Update agent tasks
        agentTasks[agent].push(taskId);

        // Remove from open tasks
        _removeFromOpenTasks(taskId);

        emit TaskAssigned(taskId, agent, block.timestamp);
    }

    /// @dev Submit task result
    function submitResult(uint256 taskId, string memory result) external {
        Task storage task = tasks[taskId];
        
        if (task.id == 0) revert TaskNotFound(taskId);
        if (task.status != TaskStatus.InProgress) revert TaskNotInProgress(taskId);
        if (msg.sender != task.assignedAgent) revert NotAssignedAgent(msg.sender, taskId);

        // Store result
        taskResults[taskId] = TaskResult({
            taskId: taskId,
            agent: msg.sender,
            result: result,
            submittedAt: block.timestamp,
            verified: false
        });

        // Update task
        task.result = result;
        task.status = TaskStatus.Completed;
        task.completedAt = block.timestamp;

        // Record task completion in agent registry
        agentRegistry.recordTaskCompletion(msg.sender, taskId);

        // Pay agent reward
        agentRewards[msg.sender] += task.reward;
        totalRewardPool -= task.reward;

        // Add to completed tasks
        completedTasks.push(taskId);

        emit TaskResultSubmitted(taskId, msg.sender, result, block.timestamp);
        emit TaskCompleted(taskId, msg.sender, task.reward, block.timestamp);
    }

    /// @dev Cancel a task (only by creator)
    function cancelTask(uint256 taskId) external {
        Task storage task = tasks[taskId];
        
        if (task.id == 0) revert TaskNotFound(taskId);
        if (msg.sender != task.creator) revert NotTaskCreator(msg.sender, taskId);
        if (task.status != TaskStatus.Open) revert TaskNotOpen(taskId);

        // Update task status
        task.status = TaskStatus.Cancelled;

        // Refund creator
        totalRewardPool -= task.reward;
        payable(task.creator).transfer(task.reward);

        // Remove from open tasks
        _removeFromOpenTasks(taskId);

        emit TaskCancelled(taskId, msg.sender, block.timestamp);
    }

    /// @dev Rate a completed task (only by creator)
    function rateTask(uint256 taskId, uint256 rating) external {
        Task storage task = tasks[taskId];
        
        if (task.id == 0) revert TaskNotFound(taskId);
        if (msg.sender != task.creator) revert NotTaskCreator(msg.sender, taskId);
        if (task.status != TaskStatus.Completed) revert TaskNotCompleted(taskId);
        if (rating < 1 || rating > 5) revert InvalidRating(rating);

        // Update task rating
        task.rating = rating;

        // Update agent score based on rating
        AgentRegistry.Agent memory agent = agentRegistry.getAgent(task.assignedAgent);
        uint256 newScore = _calculateNewScore(agent.score, rating);
        agentRegistry.updateAgentScore(task.assignedAgent, newScore);

        emit TaskRated(taskId, msg.sender, rating, block.timestamp);
    }

    /// @dev Withdraw rewards (only by agent)
    function withdrawRewards() external {
        uint256 amount = agentRewards[msg.sender];
        require(amount > 0, "No rewards to withdraw");

        agentRewards[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /// @dev Get task information
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    /// @dev Get task result
    function getTaskResult(uint256 taskId) external view returns (TaskResult memory) {
        return taskResults[taskId];
    }

    /// @dev Get all open tasks
    function getOpenTasks() external view returns (uint256[] memory) {
        return openTasks;
    }

    /// @dev Get all completed tasks
    function getCompletedTasks() external view returns (uint256[] memory) {
        return completedTasks;
    }

    /// @dev Get tasks created by a specific address
    function getTasksByCreator(address creator) external view returns (uint256[] memory) {
        return creatorTasks[creator];
    }

    /// @dev Get tasks assigned to a specific agent
    function getTasksByAgent(address agent) external view returns (uint256[] memory) {
        return agentTasks[agent];
    }

    /// @dev Get agent rewards
    function getAgentRewards(address agent) external view returns (uint256) {
        return agentRewards[agent];
    }

    /// @dev Get total number of tasks
    function getTotalTasks() external view returns (uint256) {
        return totalTasks;
    }

    /// @dev Get total reward pool
    function getTotalRewardPool() external view returns (uint256) {
        return totalRewardPool;
    }

    /// @dev Internal function to remove task from open tasks array
    function _removeFromOpenTasks(uint256 taskId) internal {
        for (uint256 i = 0; i < openTasks.length; i++) {
            if (openTasks[i] == taskId) {
                openTasks[i] = openTasks[openTasks.length - 1];
                openTasks.pop();
                break;
            }
        }
    }

    /// @dev Internal function to calculate new agent score based on rating
    function _calculateNewScore(uint256 currentScore, uint256 rating) internal pure returns (uint256) {
        // Simple scoring algorithm: 
        // Rating 5 = +5 points
        // Rating 4 = +2 points
        // Rating 3 = no change
        // Rating 2 = -2 points
        // Rating 1 = -5 points
        
        if (rating == 5) {
            return currentScore + 5;
        } else if (rating == 4) {
            return currentScore + 2;
        } else if (rating == 3) {
            return currentScore; // No change
        } else if (rating == 2) {
            return currentScore >= 2 ? currentScore - 2 : 0;
        } else { // rating == 1
            return currentScore >= 5 ? currentScore - 5 : 0;
        }
    }

    /// @dev Fallback function to receive ETH
    receive() external payable {
        totalRewardPool += msg.value;
    }
} 