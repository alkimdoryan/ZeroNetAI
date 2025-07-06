import { useState } from 'react';
import { IDKitWidget, type ISuccessResult, type IErrorState, VerificationLevel } from '@worldcoin/idkit';
import { useAccount } from 'wagmi';
import { 
  WORLDID_APP_ID, 
  WORLDID_ACTION_REGISTER,
  WORLDID_ERRORS,
  getWorldIDErrorMessage,
  isWorldIDBypassEnabled,
  simulateWorldIDSuccess
} from '../config/contracts';
import { storageService } from '../services/storageService';

export function AgentRegistration() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialties: [] as string[],
  });

  const handleWorldIDSuccess = (result: ISuccessResult) => {
    console.log('✅ WorldID verification başarılı:', result);
    console.log('✅ Proof:', result.proof);
    console.log('✅ Merkle root:', result.merkle_root);
    console.log('✅ Nullifier hash:', result.nullifier_hash);
    setError('');
    setIsPending(true);

    // Save agent to localStorage
    setTimeout(() => {
      try {
        const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        storageService.saveAgent({
          id: agentId,
          name: formData.name,
          description: formData.description,
          specialties: formData.specialties,
          walletAddress: address || '',
          createdAt: new Date().toISOString(),
          worldIdVerified: true,
          worldIdProof: result.proof,
          merkleRoot: result.merkle_root,
          nullifierHash: result.nullifier_hash,
          verificationLevel: VerificationLevel.Orb,
        });

        setIsPending(false);
        alert(`Agent "${formData.name}" başarıyla kaydedildi!\nAgent ID: ${agentId}`);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          specialties: [],
        });
      } catch (error) {
        console.error('Agent kaydetme hatası:', error);
        setError('Agent kaydedilirken bir hata oluştu.');
        setIsPending(false);
      }
    }, 1000);
  };

  const handleWorldIDError = (error: IErrorState) => {
    console.error('❌ WorldID verification hatası:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Address:', address);
    console.error('❌ Form valid:', isFormValid);
    
    // More detailed error handling
    let errorMessage = 'Unknown error';
    if (error.message) {
      errorMessage = getWorldIDErrorMessage(error.message);
    } else if (error.code) {
      errorMessage = getWorldIDErrorMessage(error.code);
    }
    
    setError(errorMessage);
    setIsPending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // If WorldID bypass is enabled, simulate success directly
    if (isWorldIDBypassEnabled('register-agent')) {
      console.log('🚀 WorldID bypass enabled for agent registration');
      simulateWorldIDSuccess(handleWorldIDSuccess, 500);
      return;
    }
    
    // Normal form validation will be done here
  };

  const isFormValid = formData.name.trim() && formData.description.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Agent Registration
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Register your AI agent with SAP Protocol network
          </p>
          
          {/* Bypass Indicator */}
          {isWorldIDBypassEnabled('register-agent') && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <span className="text-yellow-800 text-sm font-medium">
                🚀 WorldID Bypass Mode Active - Development Only
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h3 className="text-red-800 font-semibold">Verification Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your agent name (e.g., SentimentAnalyzer)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Describe what your agent does and its capabilities"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="specialties" className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialties
                  </label>
                  <input
                    type="text"
                    id="specialties"
                    value={formData.specialties.join(', ')}
                    onChange={(e) => setFormData({...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter specialties separated by commas (e.g., NLP, Computer Vision, Trading)"
                  />
                </div>
              </div>

              <div className="border-t border-white/20 pt-8">
                <div className="text-center">
                  {!isWorldIDBypassEnabled('register-agent') && (
                    <p className="text-sm text-gray-600 mb-6">
                      WorldID verification is required to register the agent
                    </p>
                  )}

                  {isWorldIDBypassEnabled('register-agent') ? (
                    // Bypass Mode - Direct Submit Button
                    <button
                      type="submit"
                      disabled={isPending || !isFormValid || !address}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto"
                    >
                      {isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🚀</span>
                          <span>Register Agent (Bypass Mode)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    // Normal WorldID Flow
                    <IDKitWidget
                      app_id={WORLDID_APP_ID}
                      action={WORLDID_ACTION_REGISTER}
                      signal={address || 'test-signal'}
                      verification_level={VerificationLevel.Device}
                      handleVerify={handleWorldIDSuccess}
                      onSuccess={() => console.log('✅ WorldID verification completed')}
                      onError={handleWorldIDError}
                      autoClose={false}
                    >
                      {({ open }: { open: () => void }) => (
                        <button
                          type="button"
                          onClick={open}
                          disabled={isPending || !isFormValid || !address}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto"
                        >
                          {isPending ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Registering...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xl">🌍</span>
                              <span>Verify with WorldID and Register</span>
                            </>
                          )}
                        </button>
                      )}
                    </IDKitWidget>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Agent Requirements */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                  ✓
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Agent Requirements
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-green-700">
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Valid wallet address</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">•</span>
                  <span>zkVM endpoint running</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Unique agent name</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Clear description</span>
                </li>
              </ul>
            </div>

            {/* WorldID Info */}
            {!isWorldIDBypassEnabled('register-agent') && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                    🌍
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    WorldID Verification
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-blue-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Scan QR code with your phone app</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Verification is only required once</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Your identity information remains private</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Bypass Mode Info */}
            {isWorldIDBypassEnabled('register-agent') && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                    🚀
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Bypass Mode Active
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-yellow-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>WorldID verification is disabled</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Using mock verification data</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>For development and testing only</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Warning */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center text-white">
                  ⚠️
                </div>
                <h3 className="text-lg font-semibold text-red-800">
                  Important Notes
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-red-700">
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Each wallet can only register one agent</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span>zkVM endpoint must be accessible</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span>WorldID verification is irreversible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
