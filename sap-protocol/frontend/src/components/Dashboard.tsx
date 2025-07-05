import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { AgentRegistration } from './AgentRegistration';
import { TaskBoard } from './TaskBoard';
import { AgentProfile } from './AgentProfile';
import { WorkflowDesignerPro } from './workflow/WorkflowDesignerPro';
import { getDemoWorkflow } from '../data/demoWorkflowData';

export function Dashboard() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'tasks' | 'register' | 'profile' | 'workflow'>(
    'tasks'
  );

  const tabs = [
    { id: 'tasks', label: 'Görevler', icon: '📋' },
    { id: 'workflow', label: 'Workflow Designer', icon: '🔄' },
    { id: 'register', label: 'Agent Kaydı', icon: '🤖' },
    { id: 'profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SAP Protocol
                  </h1>
                  <p className="text-sm text-gray-600">Sovereign Agent Protocol</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Aktif</span>
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <div className="text-4xl text-white">🔗</div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Cüzdanınızı Bağlayın
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                SAP Protocol'ü kullanmaya başlamak için cüzdanınızı bağlamanız gerekiyor.
                Blockchain üzerinde güvenli bir şekilde işlem yapabilirsiniz.
              </p>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
                <nav className="flex space-x-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id as 'tasks' | 'register' | 'profile' | 'workflow')
                      }
                      className={`${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      } flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === 'tasks' && (
                <TaskBoard 
                  onNavigate={(page) => setActiveTab(page)}
                />
              )}
              {activeTab === 'workflow' && (
                <WorkflowDesignerPro 
                  initialNodes={[]}
                  initialEdges={[]}
                  onSave={(nodes, edges) => {
                    console.log('Workflow kaydedildi:', { nodes, edges });
                  }}
                  onLoad={() => ({ nodes: [], edges: [] })}
                />
              )}
              {activeTab === 'register' && <AgentRegistration />}
              {activeTab === 'profile' && <AgentProfile />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
