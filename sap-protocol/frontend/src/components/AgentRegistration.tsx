import { useState } from 'react';
import { IDKitWidget, type ISuccessResult, type IErrorState, VerificationLevel } from '@worldcoin/idkit';
import { useAccount } from 'wagmi';
import { 
  WORLDID_APP_ID, 
  WORLDID_ACTION_REGISTER,
  WORLDID_ERRORS,
  getWorldIDErrorMessage 
} from '../config/contracts';

export function AgentRegistration() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zkVMEndpoint: '',
  });

  const handleWorldIDSuccess = (result: ISuccessResult) => {
    console.log('WorldID verification başarılı:', result);
    setError('');
    setIsPending(true);

    // Here we would call the smart contract
    // writeContract({
    //   address: getContractAddress(chainId, 'agentRegistry'),
    //   abi: agentRegistryABI,
    //   functionName: 'registerAgent',
    //   args: [
    //     formData.name,
    //     formData.description,
    //     formData.zkVMEndpoint,
    //     result.proof,
    //     result.merkle_root,
    //     result.nullifier_hash
    //   ]
    // })

    // Simulate successful registration for demo
    setTimeout(() => {
      setIsPending(false);
      alert(`Agent "${formData.name}" başarıyla kaydedildi!`);
    }, 2000);
  };

  const handleWorldIDError = (error: IErrorState) => {
    console.error('WorldID verification hatası:', error);
    setError(getWorldIDErrorMessage(error.message || 'Bilinmeyen hata'));
    setIsPending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Form validation burada yapılacak
  };

  const isFormValid = formData.name.trim() && formData.description.trim() && formData.zkVMEndpoint.trim();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Agent Kayıt Et</h2>
            <p className="text-lg text-gray-600">
              Yeni bir AI agent'ı sisteme kaydetmek için gerekli bilgileri girin
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Agent Adı
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Örnek: Sentiment Analysis Bot"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Agent'ın ne yaptığını detaylı bir şekilde açıklayın..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="zkVMEndpoint"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  zkVM Endpoint
                </label>
                <input
                  type="url"
                  id="zkVMEndpoint"
                  value={formData.zkVMEndpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, zkVMEndpoint: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://your-zkvm-node.com/api"
                  required
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-white/20 pt-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-6">
                    Agent'ı kaydetmek için WorldID doğrulaması gereklidir
                  </p>

                  <IDKitWidget
                    app_id={WORLDID_APP_ID}
                    action={WORLDID_ACTION_REGISTER}
                    signal={address}
                    verification_level={VerificationLevel.Device}
                    handleVerify={handleWorldIDSuccess}
                    onSuccess={() => console.log('WorldID verification completed')}
                    onError={handleWorldIDError}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={open}
                        disabled={isPending || !isFormValid || !address}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto"
                      >
                        {isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">🌍</span>
                            <span>WorldID ile Doğrula ve Kaydet</span>
                          </>
                        )}
                      </button>
                    )}
                  </IDKitWidget>

                  {!address && (
                    <p className="text-sm text-orange-600 mt-4">
                      ⚠️ Önce cüzdanınızı bağlamanız gerekiyor
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Prerequisites */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gereksinimler
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">•</span>
                <span>Geçerli bir WorldID hesabı</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">•</span>
                <span>Çalışan zkVM endpoint'i</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">•</span>
                <span>Benzersiz agent adı</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">•</span>
                <span>Bağlı Web3 cüzdanı</span>
              </li>
            </ul>
          </div>

          {/* WorldID Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                🌍
              </div>
              <h3 className="text-lg font-semibold text-blue-800">
                WorldID Doğrulama
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-blue-700">
              <li className="flex items-start space-x-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>Telefon uygulaması ile QR kod tarayın</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>Yalnızca bir kez doğrulama gerekir</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>Kimlik bilgileriniz gizli kalır</span>
              </li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                ⚠️
              </div>
              <h3 className="text-lg font-semibold text-yellow-800">
                Önemli Bilgiler
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-yellow-700">
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Her kişi yalnızca bir agent kaydedebilir</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>WorldID doğrulaması geri alınamaz</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Agent bilgileri blokzincirde kalıcı olarak saklanır</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white">
                💬
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Yardıma mı ihtiyacınız var?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Agent kaydetme konusunda sorularınız varsa bize ulaşın.
            </p>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm">
              Destek Ekibi ile İletişime Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
