import React, { useState } from 'react';
import { 
  Play, 
  Timer, 
  Zap, 
  Bot, 
  GitBranch, 
  Database, 
  Mail, 
  Globe, 
  MessageSquare, 
  Settings,
  // Yeni node iconları
  RefreshCw,
  Clock,
  Shuffle,
  AlertTriangle,
  Code,
  Bell,
  Search,
  Filter,
  Plus,
  Layers,
  X
} from 'lucide-react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';

interface NodeType {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  gradient: string;
  isNew?: boolean;
  isCustom?: boolean;
}

const nodeTypes: NodeType[] = [
  // Triggers
  {
    id: 'manual-trigger',
    type: 'trigger',
    label: 'Manuel Başlatma',
    description: 'Workflow\'u manuel olarak başlatır',
    icon: <Play className="w-5 h-5" />,
    category: 'triggers',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'timer-trigger',
    type: 'trigger',
    label: 'Zamanlayıcı',
    description: 'Belirli aralıklarla workflow\'u çalıştırır',
    icon: <Timer className="w-5 h-5" />,
    category: 'triggers',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'webhook-trigger',
    type: 'trigger',
    label: 'Webhook',
    description: 'HTTP istekleri ile workflow\'u tetikler',
    icon: <Zap className="w-5 h-5" />,
    category: 'triggers',
    gradient: 'from-purple-500 to-purple-600'
  },

  // Agents
  {
    id: 'agent-task',
    type: 'agent',
    label: 'Agent Görevi',
    description: 'BitNet LLM agent ile görev işler',
    icon: <Bot className="w-5 h-5" />,
    category: 'agents',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'sentiment-agent',
    type: 'agent',
    label: 'Duygu Analizi',
    description: 'Metin duygu analizi yapar',
    icon: <Bot className="w-5 h-5" />,
    category: 'agents',
    gradient: 'from-pink-500 to-rose-600'
  },

  // Logic - Güncellenmiş ve genişletilmiş
  {
    id: 'condition',
    type: 'condition',
    label: 'Koşul (If/Else)',
    description: 'Akışı koşullu olarak yönlendirir',
    icon: <GitBranch className="w-5 h-5" />,
    category: 'logic',
    gradient: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'loop',
    type: 'loop',
    label: 'Döngü',
    description: 'Koleksiyon üzerinde yineleme yapar',
    icon: <RefreshCw className="w-5 h-5" />,
    category: 'logic',
    gradient: 'from-indigo-500 to-purple-600',
    isNew: true
  },

  // Connectors - Genişletilmiş
  {
    id: 'http-request',
    type: 'http-request',
    label: 'HTTP İsteği',
    description: 'Harici API\'lere HTTP istekleri gönderir',
    icon: <Globe className="w-5 h-5" />,
    category: 'connectors',
    gradient: 'from-slate-500 to-gray-600'
  },
  {
    id: 'database-query',
    type: 'database-query',
    label: 'Veritabanı Sorgusu',
    description: 'SQL tabanlı veritabanı işlemleri yapar',
    icon: <Database className="w-5 h-5" />,
    category: 'connectors',
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'email-send',
    type: 'email-send',
    label: 'E-posta Gönder',
    description: 'E-posta gönderir ve alır',
    icon: <Mail className="w-5 h-5" />,
    category: 'connectors',
    gradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'notification',
    type: 'notification',
    label: 'Bildirim',
    description: 'Çoklu kanal bildirim gönderir',
    icon: <Bell className="w-5 h-5" />,
    category: 'connectors',
    gradient: 'from-purple-500 to-indigo-600',
    isNew: true
  },

  // Utility - Yeni kategori
  {
    id: 'delay',
    type: 'delay',
    label: 'Bekleme',
    description: 'Akışı belirli süre bekletir',
    icon: <Clock className="w-5 h-5" />,
    category: 'utility',
    gradient: 'from-emerald-500 to-teal-600',
    isNew: true
  },
  {
    id: 'transform',
    type: 'transform',
    label: 'Veri Dönüşümü',
    description: 'Veriyi dönüştürür ve haritalandırır',
    icon: <Shuffle className="w-5 h-5" />,
    category: 'utility',
    gradient: 'from-cyan-500 to-blue-600',
    isNew: true
  },
  {
    id: 'error-handler',
    type: 'error-handler',
    label: 'Hata Yöneticisi',
    description: 'Hata durumlarını yönetir ve alternatif akış sağlar',
    icon: <AlertTriangle className="w-5 h-5" />,
    category: 'utility',
    gradient: 'from-red-500 to-orange-600',
    isNew: true
  },
  {
    id: 'custom-function',
    type: 'custom-function',
    label: 'Özel Fonksiyon',
    description: 'Kullanıcı tanımlı JavaScript kodu çalıştırır',
    icon: <Code className="w-5 h-5" />,
    category: 'utility',
    gradient: 'from-violet-500 to-purple-600',
    isNew: true
  }
];

const categories = [
  { id: 'triggers', label: 'Tetikleyiciler', icon: <Play className="w-4 h-4" />, description: 'Workflow başlatan node\'lar' },
  { id: 'agents', label: 'Agent\'lar', icon: <Bot className="w-4 h-4" />, description: 'AI/ML görevleri' },
  { id: 'logic', label: 'Mantık', icon: <GitBranch className="w-4 h-4" />, description: 'Karar verme ve kontrol' },
  { id: 'connectors', label: 'Bağlayıcılar', icon: <Settings className="w-4 h-4" />, description: 'Harici sistemler' },
  { id: 'utility', label: 'Yardımcı', icon: <Layers className="w-4 h-4" />, description: 'Genel amaçlı işlemler' },
  { id: 'custom', label: 'Özel', icon: <Plus className="w-4 h-4" />, description: 'Kullanıcı tanımlı' }
];

export function NodePalette() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isWorldIDVerified, setIsWorldIDVerified] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    name: '',
    description: '',
    category: 'custom',
    parameters: []
  });

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTypes.filter(node => {
    const matchesCategory = activeCategory === 'all' || node.category === activeCategory;
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Node Kütüphanesi</h2>
        <p className="text-sm text-gray-600">Sürükleyip canvas'a bırakın</p>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Eklemek istediğiniz node'u arayın..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Kategori Filtreleri */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Kategoriler</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Arama Sonuç Bilgisi */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">"{searchQuery}"</span> için {filteredNodes.length} node bulundu.
            {filteredNodes.length > 0 ? ' Workflow\'unuza eklemek için sürükleyip bırakın.' : ' Farklı anahtar kelimeler deneyin.'}
          </p>
        </div>
      )}

      {/* Node Listesi */}
      <div className="space-y-4">
        {activeCategory === 'all' ? (
          // Tüm kategoriler için gruplu gösterim
          categories.map((category) => {
            const categoryNodes = filteredNodes.filter(node => node.category === category.id);
            if (categoryNodes.length === 0) return null;
            
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                  {category.icon}
                  <span>{category.label}</span>
                  <span className="text-xs text-gray-500">({categoryNodes.length})</span>
                </div>
                
                <div className="space-y-2">
                  {categoryNodes.map((node) => (
                    <NodeCard key={node.id} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Tek kategori için düz liste
          <div className="space-y-2">
            {filteredNodes.map((node) => (
              <NodeCard key={node.id} node={node} onDragStart={onDragStart} />
            ))}
          </div>
        )}
      </div>

      {/* Özel Node Oluştur */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-300 transition-colors group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-purple-900">Özel Node Oluştur</h3>
              <p className="text-sm text-purple-600">Kendi node'unuzu tasarlayın</p>
            </div>
          </div>
        </button>
      </div>

      {/* Hazır Şablonlar */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <Layers className="w-4 h-4" />
          <span>Hazır Şablonlar</span>
        </h3>
        <div className="space-y-2">
          {[
            { name: 'API → Database', desc: 'HTTP → Transform → Database', nodes: 3 },
            { name: 'Duygu Analizi', desc: 'Webhook → Agent → Notification', nodes: 3 },
            { name: 'Veri Pipeline', desc: 'Timer → Loop → Transform → Email', nodes: 4 },
            { name: 'Hata Yönetimi', desc: 'HTTP → Error Handler → Retry', nodes: 3 }
          ].map((template, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-blue-900">{template.name}</div>
                  <div className="text-xs text-blue-600 mt-1">{template.desc}</div>
                </div>
                <div className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
                  {template.nodes} node
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Node Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Özel Node Oluştur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!isWorldIDVerified ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Kimlik Doğrulama Gerekli
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Özel node oluşturmak için WorldID ile kimlik doğrulaması yapmanız gerekiyor.
                  </p>
                </div>
                
                <IDKitWidget
                  app_id="app_staging_123456789" // Replace with your actual app ID
                  action="create-custom-node"
                  verification_level={VerificationLevel.Device}
                  handleVerify={(proof) => {
                    console.log('WorldID verification successful:', proof);
                    setIsWorldIDVerified(true);
                  }}
                  onSuccess={() => {
                    console.log('WorldID verification completed');
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={open}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      WorldID ile Doğrula
                    </button>
                  )}
                </IDKitWidget>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                  <p className="text-sm text-green-600 mb-6">Kimlik doğrulaması başarılı!</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Node Adı
                    </label>
                    <input
                      type="text"
                      value={newNodeData.name}
                      onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Örn: Özel API Handler"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={newNodeData.description}
                      onChange={(e) => setNewNodeData({...newNodeData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Node'unuzun ne yaptığını açıklayın..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={newNodeData.category}
                      onChange={(e) => setNewNodeData({...newNodeData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="custom">Özel</option>
                      <option value="connectors">Bağlayıcılar</option>
                      <option value="logic">Mantık</option>
                      <option value="utility">Yardımcı</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsWorldIDVerified(false);
                      setNewNodeData({name: '', description: '', category: 'custom', parameters: []});
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => {
                      if (newNodeData.name.trim() && newNodeData.description.trim()) {
                        console.log('Creating custom node:', newNodeData);
                        // Here you would save the custom node
                        setShowCreateModal(false);
                        setIsWorldIDVerified(false);
                        setNewNodeData({name: '', description: '', category: 'custom', parameters: []});
                        alert('Özel node başarıyla oluşturuldu!');
                      } else {
                        alert('Lütfen tüm alanları doldurun.');
                      }
                    }}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Node Oluştur
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Node Card Component
function NodeCard({ node, onDragStart }: { node: NodeType; onDragStart: (event: React.DragEvent, nodeType: string) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 cursor-move hover:shadow-lg transition-all duration-200 hover:scale-105"
    >
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.gradient} flex items-center justify-center text-white shadow-md`}>
          {node.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {node.label}
            </h3>
            {node.isNew && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                YENİ
              </span>
            )}
            {node.isCustom && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                ÖZEL
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>
      
      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
    </div>
  );
} 