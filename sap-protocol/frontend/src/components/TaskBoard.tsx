import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Task {
  id: number;
  description: string;
  creator: string;
  assignee: string;
  status: number; // 0: Open, 1: InProgress, 2: Completed, 3: Cancelled
  reward: bigint;
  createdAt: number;
  result: string;
  solutionMethod?: 'agent' | 'workflow';
  usedModel?: string;
  outputFormat?: string;
}

interface TaskBoardProps {
  onNavigate?: (page: 'register' | 'workflow') => void;
}

export function TaskBoard({ onNavigate }: TaskBoardProps = {}) {
  const { address } = useAccount();
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [solution, setSolution] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');
  const [showSolveOptions, setShowSolveOptions] = useState<number | null>(null);
  const [solveMethod, setSolveMethod] = useState<'agent' | 'workflow' | null>(null);
  const [outputFormat, setOutputFormat] = useState('json');
  const [usedModel, setUsedModel] = useState('');

  // Close solve options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.solve-dropdown')) {
        setShowSolveOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data for now - replace with actual contract calls
  const mockTasks: Task[] = [
    {
      id: 1,
      description:
        "Bu tweet'in sentiment analizini yapın: 'Bitcoin yeniden yükselişe geçti! 🚀'",
      creator: '0x1234...5678',
      assignee: '0x0000000000000000000000000000000000000000',
      status: 0,
      reward: BigInt('1000000000000000000'), // 1 token
      createdAt: Date.now() - 3600000,
      result: '',
    },
    {
      id: 2,
      description:
        "Aşağıdaki metni özetleyin: 'Blockchain teknolojisi, merkezi olmayan sistemler...'",
      creator: '0x8765...4321',
      assignee: '0x0000000000000000000000000000000000000000',
      status: 0,
      reward: BigInt('2000000000000000000'), // 2 tokens
      createdAt: Date.now() - 7200000,
      result: '',
    },
    {
      id: 3,
      description: 'Bu resmin içeriğini analiz edin ve kategorileyiin',
      creator: '0x9999...1111',
      assignee: address || '0x0000000000000000000000000000000000000000',
      status: 1,
      reward: BigInt('1500000000000000000'), // 1.5 tokens
      createdAt: Date.now() - 10800000,
      result: '',
    },
  ];

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full shadow-lg">
            Açık
          </span>
        );
      case 1:
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full shadow-lg">
            Devam Ediyor
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full shadow-lg">
            Tamamlandı
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full shadow-lg">
            İptal Edildi
          </span>
        );
      default:
        return null;
    }
  };

  const handleSolveTask = async (taskId: number) => {
    if (!solution.trim()) return;

    console.log('Görev çözümü gönderiliyor:', { 
      taskId, 
      solution, 
      solveMethod, 
      outputFormat, 
      usedModel 
    });

    // Here we would call the smart contract
    // writeContract({
    //   address: getContractAddress(chainId, 'taskBoard'),
    //   abi: taskBoardABI,
    //   functionName: 'submitResult',
    //   args: [taskId, solution, outputFormat, usedModel]
    // })

    // BitNet execution simulation for agents
    if (solveMethod === 'agent') {
      console.log('BitNet Agent çalıştırılıyor:', {
        prompt: `Görev: ${mockTasks.find(t => t.id === taskId)?.description}\nÇözüm metodu: ${usedModel}\nBeklenen format: ${outputFormat}`,
        maxTokens: 1000,
        temperature: 0.7
      });
    }

    // Workflow execution simulation 
    if (solveMethod === 'workflow') {
      console.log('Workflow çalıştırılıyor:', {
        workflowName: usedModel,
        inputData: mockTasks.find(t => t.id === taskId)?.description,
        outputFormat: outputFormat
      });
    }

    alert(`Görev çözümü başarıyla gönderildi! ${solveMethod === 'agent' ? 'Agent' : 'Workflow'} ile çözüm işlendi.`);

    setSelectedTask(null);
    setSolution('');
    setSolveMethod(null);
    setUsedModel('');
    setOutputFormat('json');
  };

  const handleCreateTask = async () => {
    if (!newTaskDescription.trim() || !newTaskReward.trim()) return;

    console.log('Yeni görev oluşturuluyor:', { 
      description: newTaskDescription, 
      reward: newTaskReward 
    });

    // Here we would call the smart contract
    // writeContract({
    //   address: getContractAddress(chainId, 'taskBoard'),
    //   abi: taskBoardABI,
    //   functionName: 'createTask',
    //   args: [newTaskDescription, parseEther(newTaskReward)]
    // })

    setShowCreateModal(false);
    setNewTaskDescription('');
    setNewTaskReward('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
              📋
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Görev Panosu</h2>
              <p className="text-gray-600">Açık görevleri görüntüleyin ve çözün</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <span className="text-sm font-medium text-gray-700">
                Toplam: {mockTasks.length} görev
              </span>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              + Yeni Görev Oluştur
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-6">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 relative"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Görev #{task.id}
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-relaxed">
                    {task.description}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                        👤
                      </div>
                      <span>
                        {task.creator.slice(0, 6)}...{task.creator.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs">
                        💰
                      </div>
                      <span className="font-semibold">
                        {(Number(task.reward) / 1e18).toFixed(2)} Token
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                        🕒
                      </div>
                      <span>
                        {new Date(task.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 relative">
                  {task.status === 0 && (
                    <div className="relative solve-dropdown">
                      <button
                        onClick={() => setShowSolveOptions(showSolveOptions === task.id ? null : task.id)}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        Çöz
                      </button>
                      
                      {showSolveOptions === task.id && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-max max-w-xs z-[60] transform origin-top-right">
                          <div className="px-2">
                            <button
                              onClick={() => {
                                setSolveMethod('agent');
                                setSelectedTask(task.id);
                                setShowSolveOptions(null);
                                // Navigate to agent registration page
                                onNavigate?.('register');
                              }}
                              className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm">🤖</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">Agent Oluştur</div>
                                <div className="text-xs text-gray-600 whitespace-nowrap">AI agent ile çöz</div>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setSolveMethod('workflow');
                                setSelectedTask(task.id);
                                setShowSolveOptions(null);
                                // Navigate to workflow designer page
                                onNavigate?.('workflow');
                              }}
                              className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm">⚡</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">Workflow Design</div>
                                <div className="text-xs text-gray-600 whitespace-nowrap">Workflow ile çöz</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {task.status === 1 && task.assignee === address && (
                    <button
                      onClick={() => setSelectedTask(task.id)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Sonucu Gönder
                    </button>
                  )}
                </div>
              </div>

              {selectedTask === task.id && (
                <div className="border-t border-white/20 pt-6">
                  <div className="space-y-6">
                    {/* Çözüm Yöntemi Bilgisi */}
                    {solveMethod && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            solveMethod === 'agent' 
                              ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            <span className="text-white text-lg">
                              {solveMethod === 'agent' ? '🤖' : '⚡'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-blue-900">
                              {solveMethod === 'agent' ? 'Agent ile Çözüm' : 'Workflow ile Çözüm'}
                            </div>
                            <div className="text-xs text-blue-700">
                              {solveMethod === 'agent' ? 'AI agent kullanarak çözüm üretiliyor' : 'Workflow tasarımı ile çözüm üretiliyor'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Çıktı Formatı */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Çıktı Formatı
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="text">Text</option>
                        <option value="csv">CSV</option>
                        <option value="markdown">Markdown</option>
                      </select>
                    </div>
                    
                    {/* Kullanılan Model/Design */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kullanılan Model/Design
                      </label>
                      <input
                        type="text"
                        value={usedModel}
                        onChange={(e) => setUsedModel(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder={solveMethod === 'agent' ? 'Örn: BitNet-LLM-v2' : 'Örn: Sentiment-Analysis-Workflow'}
                      />
                    </div>
                    
                    {/* Çözüm */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Çözümünüz
                      </label>
                      <textarea
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Görev çözümünüzü detaylı bir şekilde buraya yazın..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedTask(null);
                          setSolveMethod(null);
                          setUsedModel('');
                          setOutputFormat('json');
                        }}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-200"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleSolveTask(task.id)}
                        className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        Sonucu Gönder
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {mockTasks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl">
            📋
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz görev yok
          </h3>
          <p className="text-gray-600 mb-6">
            İlk görevi oluşturmak için yukarıdaki butona tıklayın
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            + Yeni Görev Oluştur
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Yeni Görev Oluştur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Görev Açıklaması
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Görev açıklamasını detaylı bir şekilde buraya yazın..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ödül Miktarı (Token)
                </label>
                <input
                  type="number"
                  value={newTaskReward}
                  onChange={(e) => setNewTaskReward(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Örn: 1.5"
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Görevi Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
