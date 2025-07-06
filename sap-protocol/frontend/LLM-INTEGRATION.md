# LLM Chatbot Integration - SAP Protocol

## 🤖 zkVM-Powered LLM Assistant

SAP Protocol artık zkVM altyapısı üzerinde çalışan gelişmiş bir LLM asistanı ile donatılmıştır. Bu entegrasyon, kullanıcılara kriptografik olarak doğrulanmış AI yanıtları sunar.

## 🚀 Özellikler

### 1. zkVM LLM Service (`src/services/llmApi.ts`)
- **BitNet Model Desteği**: B1.58, 1B, ve 3B parametreli modeller
- **Kanıt Oluşturma**: Her yanıt için zero-knowledge proof
- **Akış Desteği**: Gerçek zamanlı yanıt akışı
- **Geliştirme Modu**: Mock yanıtlar ile test imkanı
- **Hata Yönetimi**: Kapsamlı hata işleme ve retry mekanizması

### 2. zkVM Konfigürasyonu (`src/config/zkvm.ts`)
- **Esnek Ayarlar**: Model, sıcaklık, token limiti ayarları
- **Sistem Promptları**: Workflow, agent, teknik destek için özelleştirilmiş promptlar
- **Performans Metrikleri**: Gaz kullanımı, hesaplama süresi takibi
- **UI Teması**: SAP Protocol tasarım sistemi ile uyumlu

### 3. Chatbot UI (`src/components/LLMChatbot.tsx`)
- **Modern Arayüz**: Gradient arka planlar ve cam efekti
- **Konuşma Geçmişi**: Session tabanlı mesaj yönetimi
- **zkVM Göstergeleri**: Kanıt durumu ve bağlantı göstergesi
- **Ayarlar Paneli**: Model seçimi, sıcaklık ayarı, endpoint konfigürasyonu
- **Dışa Aktarma**: Chat geçmişini JSON formatında kaydetme

## 🎨 Tasarım Sistemi Uyumluluğu

```typescript
// Renk paleti aynı SAP Protocol teması
const theme = {
  primaryColor: '#3b82f6',    // Mavi
  secondaryColor: '#8b5cf6',  // Mor  
  accentColor: '#f59e0b',     // Turuncu
  successColor: '#22c55e',    // Yeşil
  errorColor: '#ef4444',      // Kırmızı
}
```

## 🔧 Kurulum ve Kullanım

### Environment Variables
```bash
# .env.local dosyasına ekleyin
VITE_ZKVM_ENDPOINT=http://localhost:8080/api/llm
VITE_ZKVM_API_KEY=your_api_key_here
VITE_ZKVM_MODEL=bitnet-b1.58-large
VITE_ZKVM_ENABLE_PROOF=true
VITE_ENABLE_MOCK_RESPONSES=true  # Development için
```

### Dashboard Entegrasyonu
Chatbot, Dashboard'da "zkVM Chat" sekmesi olarak entegre edilmiştir:

```typescript
const tabs = [
  { id: 'tasks', label: 'Tasks', icon: '📋' },
  { id: 'workflow', label: 'Workflow Designer', icon: '🔄' },
  { id: 'chatbot', label: 'zkVM Chat', icon: '🤖' },  // ← YENİ
  { id: 'register', label: 'Agent Registration', icon: '👨‍💼' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];
```

## 🛠️ API Kullanımı

### Basit Mesaj Gönderme
```typescript
import { llmApi } from '../services/llmApi';

const response = await llmApi.sendMessage(
  "SAP Protocol hakkında bilgi ver",
  "conversation-id",
  { model: 'bitnet-b1.58-large', temperature: 0.7 }
);

console.log(response.message.content);
console.log('zkVM Proof:', response.proof);
```

### Akış Tabanlı Yanıt
```typescript
for await (const chunk of llmApi.streamMessage(message)) {
  if (chunk.finished) {
    console.log('Proof:', chunk.proof);
  } else {
    console.log('Chunk:', chunk.content);
  }
}
```

## 🔒 Güvenlik ve Kanıt Doğrulama

Her LLM yanıtı aşağıdaki güvenlik özellikleri ile korunur:

1. **zkVM Proof**: Hesaplamanın doğruluğunu kanıtlar
2. **Gas Tracking**: Hesaplama maliyetini izler
3. **Timeout Protection**: Uzun işlemleri engeller
4. **Error Handling**: Ağ ve API hatalarını yönetir

## 🧪 Test ve Geliştirme

### Mock Responses
Geliştirme modunda otomatik mock yanıtlar:
```typescript
// Context-aware responses
if (content.includes('workflow')) {
  return 'Workflow tasarımında size yardımcı olabilirim...';
}
```

### Connection Testing
```typescript
const status = await llmApi.validateEndpoint();
console.log('Connected:', status.isConnected);
console.log('Latency:', status.latency);
```

## 📱 Kullanıcı Deneyimi

### Chatbot Özellikleri
- **Typing Indicator**: Gerçek zamanlı yazma göstergesi
- **Message Status**: Gönderiliyor/Gönderildi/Hata durumları
- **Copy Messages**: Mesajları kopyalama özelliği
- **Export Chat**: Konuşma geçmişini dışa aktarma
- **Session Management**: Çoklu konuşma desteği

### UI Components
```typescript
// Message bubble with zkVM proof indicator
{message.zkProof && (
  <div className="flex items-center space-x-1 text-xs opacity-75">
    <Shield className="w-3 h-3" />
    <span>zkVM Verified</span>
  </div>
)}
```

## 🚀 Production Readiness

### Performance
- **Lazy Loading**: Büyük dosyalar için tembel yükleme
- **Error Boundaries**: Hata sınırları ile stabilite
- **Memory Management**: Otomatik bellek temizleme
- **Rate Limiting**: İstek sınırlandırması

### Monitoring
- **Connection Status**: Anlık bağlantı durumu
- **Response Times**: Yanıt süresi ölçümü
- **Gas Usage**: zkVM gaz tüketimi
- **Error Tracking**: Hata loglama

## 🎯 Gelecek Geliştirmeler

1. **Voice Integration**: Sesli komut desteği
2. **File Upload**: Dosya analizi özelliği
3. **Custom Agents**: Özelleştirilebilir AI agents
4. **Multi-language**: Çoklu dil desteği
5. **Workflow Integration**: Workflow'a direkt entegrasyon

## 🔗 Bağlantılar

- **Frontend**: http://localhost:5173
- **Chatbot Tab**: Dashboard > zkVM Chat
- **Settings**: Chatbot içindeki ⚙️ ikonu
- **Export**: Chat sağ üst köşe 📥 ikonu

---

*Bu entegrasyon SAP Protocol'ün zkVM altyapısı ile tamamen uyumlu çalışır ve kullanıcılara güvenli, doğrulanabilir AI deneyimi sunar.* 