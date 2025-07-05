import { useAccount } from 'wagmi';
import { useState } from 'react';

interface AgentData {
  name: string;
  description: string;
  zkVMEndpoint: string;
  owner: string;
  registeredAt: number;
  taskCount: number;
  completedTasks: number;
  score: number;
  totalEarned: bigint;
  isActive: boolean;
}

export function AgentProfile() {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for now - replace with actual contract calls
  const mockAgentData: AgentData = {
    name: 'Sentiment Analysis Bot',
    description:
      'AI agent that performs Twitter sentiment analysis. Provides positive/negative/neutral sentiment scores.',
    zkVMEndpoint: 'https://zkvm-api.example.com/sentiment',
    owner: address || '0x0000000000000000000000000000000000000000',
    registeredAt: Date.now() - 86400000 * 7, // 7 days ago
    taskCount: 15,
    completedTasks: 12,
    score: 4.2,
    totalEarned: BigInt('24500000000000000000'), // 24.5 tokens
    isActive: true,
  };

  const completionRate =
    mockAgentData.taskCount > 0
      ? (
          (mockAgentData.completedTasks / mockAgentData.taskCount) *
          100
        ).toFixed(1)
      : '0';

  const handleUpdateAgent = () => {
    console.log('Updating agent information...');
    // Here we would call the smart contract
    setIsEditing(false);
  };

  const handleDeactivateAgent = () => {
    console.log('Deactivating agent...');
    // Here we would call the smart contract
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              👤
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Agent Profile</h2>
              <p className="text-lg text-gray-600">
                View your agent information and performance metrics
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 text-sm font-semibold text-blue-600 bg-blue-50/80 backdrop-blur-sm rounded-xl hover:bg-blue-100/80 transition-all duration-200"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={handleDeactivateAgent}
              className="px-6 py-3 text-sm font-semibold text-red-600 bg-red-50/80 backdrop-blur-sm rounded-xl hover:bg-red-100/80 transition-all duration-200"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Agent Info */}
        <div className="xl:col-span-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Agent Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue={mockAgentData.name}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{mockAgentData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    defaultValue={mockAgentData.description}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed">{mockAgentData.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  zkVM Endpoint
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    defaultValue={mockAgentData.zkVMEndpoint}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 break-all font-mono text-sm bg-gray-50/80 backdrop-blur-sm p-3 rounded-xl">
                    {mockAgentData.zkVMEndpoint}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration Date
                </label>
                <p className="text-gray-900">
                  {new Date(mockAgentData.registeredAt).toLocaleString('en-US')}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 pt-6 border-t border-white/20">
                <button
                  onClick={handleUpdateAgent}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white">
                  ●
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Status</h4>
                  <p className="text-sm text-gray-600">Agent status</p>
                </div>
              </div>
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  mockAgentData.isActive
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                    : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                }`}
              >
                {mockAgentData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Task Stats */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white">
                📊
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Task Statistics</h4>
                <p className="text-sm text-gray-600">Performance summary</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <span className="text-lg font-semibold text-gray-900">
                  {mockAgentData.taskCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-lg font-semibold text-green-600">
                  {mockAgentData.completedTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-semibold text-blue-600">
                  {completionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center text-white">
                ⭐
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Rating</h4>
                <p className="text-sm text-gray-600">Community feedback</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {mockAgentData.score.toFixed(1)}
              </div>
              <div className="flex justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= mockAgentData.score
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">Out of 5 stars</p>
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white">
                💰
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Earnings</h4>
                <p className="text-sm text-gray-600">Total rewards earned</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {(Number(mockAgentData.totalEarned) / 1e18).toFixed(2)} Tokens
              </div>
              <p className="text-xs text-gray-500">All-time earnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white">
            📈
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Recent Activities</h3>
            <p className="text-gray-600">Recent task activities</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { task: 'Sentiment analysis: "Bitcoin is rising"', result: 'Positive (0.85)', time: '2 hours ago', status: 'completed' },
            { task: 'Text summarization: Blockchain technology', result: 'Summary completed', time: '5 hours ago', status: 'completed' },
            { task: 'Image analysis: Category identification', result: 'Pending', time: '1 day ago', status: 'pending' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
              <div className={`w-3 h-3 rounded-full ${activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.task}</p>
                <p className="text-sm text-gray-600">{activity.result}</p>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
