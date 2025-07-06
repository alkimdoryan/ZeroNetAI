# Yerel LLM Kurulumu ve Yapılandırması

Bu kılavuz, SAP Protocol chatbot'u ile yerel LLM API'nizi nasıl entegre edeceğinizi göstermektedir.

## Desteklenen Yerel LLM Platformları

### 1. Ollama
En popüler yerel LLM platformu. Kolay kurulum ve kullanım.

**Kurulum:**
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# https://ollama.ai/download adresinden indirin
```

**Model İndirme:**
```bash
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

**Çalıştırma:**
```bash
ollama serve
```

### 2. LM Studio
Grafiksel arayüz ile yerel LLM yönetimi.

**Kurulum:**
- https://lmstudio.ai adresinden indirin
- Uygulamayı çalıştırın
- Model seçin ve indirin
- Local Server'ı başlatın

### 3. OpenAI-Compatible APIs
Text Generation WebUI, FastChat, vb.

## Yapılandırma

### .env.local Dosyası Oluşturma

`sap-protocol/frontend/.env.local` dosyasını oluşturun:

```env
# Yerel LLM'i etkinleştir
VITE_LOCAL_LLM_ENABLED=true

# Ollama Yapılandırması
VITE_LOCAL_LLM_ENDPOINT=http://localhost:11434/api/generate
VITE_LOCAL_LLM_MODEL=llama2

# LM Studio Yapılandırması (Alternatif)
# VITE_LOCAL_LLM_ENDPOINT=http://localhost:1234/v1/chat/completions
# VITE_LOCAL_LLM_MODEL=your-model-name

# OpenAI-Compatible API (Alternatif)
# VITE_LOCAL_LLM_ENDPOINT=http://localhost:5000/v1/chat/completions
# VITE_LOCAL_LLM_API_KEY=your-api-key
# VITE_LOCAL_LLM_MODEL=your-model-name

# Development ayarları
VITE_DEBUG_MODE=true
```

### Ollama ile Kullanım

1. **Ollama'yı başlatın:**
```bash
ollama serve
```

2. **Model çalıştırın:**
```bash
ollama run llama2
```

3. **Chatbot'u başlatın:**
```bash
cd sap-protocol/frontend
npm run dev
```

4. **Chatbot'a gidin:**
   - Browser'da http://localhost:5173 adresini açın
   - Dashboard > zkVM Chat sekmesine gidin
   - Yerel LLM'iniz ile sohbet edin!

### LM Studio ile Kullanım

1. **LM Studio'yu açın**
2. **Model indirin ve yükleyin**
3. **Local Server'ı başlatın:**
   - "Local Server" sekmesine gidin
   - Port'u 1234 olarak ayarlayın
   - "Start Server" butonuna tıklayın

4. **.env.local dosyasını güncelleyin:**
```env
VITE_LOCAL_LLM_ENABLED=true
VITE_LOCAL_LLM_ENDPOINT=http://localhost:1234/v1/chat/completions
VITE_LOCAL_LLM_MODEL=your-model-name
```

## Desteklenen Modeller

### Ollama Modelleri
- `llama2` - Llama 2 7B (Genel amaçlı)
- `llama2:13b` - Llama 2 13B (Daha güçlü)
- `mistral` - Mistral 7B (Hızlı ve etkili)
- `codellama` - Code Llama 7B (Kod için özelleştirilmiş)
- `neural-chat` - Neural Chat 7B (Konuşma için)
- `phi` - Phi-2 2.7B (Küçük ve hızlı)

### Model Seçimi
Modelinizi `.env.local` dosyasında belirtin:
```env
VITE_LOCAL_LLM_MODEL=mistral
```

## Yapılandırma Seçenekleri

### Temel Ayarlar
```env
# Yerel LLM'i etkinleştir/devre dışı bırak
VITE_LOCAL_LLM_ENABLED=true

# Ana endpoint
VITE_LOCAL_LLM_ENDPOINT=http://localhost:11434/api/generate

# Kullanılacak model
VITE_LOCAL_LLM_MODEL=llama2

# API anahtarı (gerekirse)
VITE_LOCAL_LLM_API_KEY=your-api-key
```

### Gelişmiş Ayarlar
```env
# Streaming endpoint
VITE_LOCAL_LLM_STREAMING_ENDPOINT=http://localhost:11434/api/generate

# Chat endpoint
VITE_LOCAL_LLM_CHAT_ENDPOINT=http://localhost:11434/api/chat

# Embedding endpoint
VITE_LOCAL_LLM_EMBEDDING_ENDPOINT=http://localhost:11434/api/embeddings
```

## Sorun Giderme

### Yaygın Sorunlar

1. **Bağlantı Hatası**
   - Yerel LLM servisinin çalıştığından emin olun
   - Port numarasını kontrol edin
   - Firewall ayarlarını kontrol edin

2. **Model Bulunamadı**
   - Model adının doğru olduğundan emin olun
   - Ollama için: `ollama list` ile mevcut modelleri kontrol edin

3. **Yavaş Yanıt**
   - Daha küçük bir model kullanın (örn: `phi` yerine `llama2`)
   - GPU acceleration'ı etkinleştirin
   - RAM miktarını kontrol edin

### Debug Modu

Debug modunu etkinleştirmek için:
```env
VITE_DEBUG_MODE=true
```

Browser console'da detaylı logları görebilirsiniz.

## Performans Optimizasyonu

### Sistem Gereksinimleri
- **RAM:** En az 8GB (16GB önerilen)
- **CPU:** Modern multi-core işlemci
- **GPU:** CUDA/Metal desteği (opsiyonel ama önerilen)

### Model Boyutları
- **2-3B parametreli modeller:** 4-8GB RAM
- **7B parametreli modeller:** 8-16GB RAM
- **13B parametreli modeller:** 16-32GB RAM

### Hızlandırma İpuçları
1. **GPU kullanın** (CUDA/Metal)
2. **Küçük modeller** ile başlayın
3. **SSD kullanın** model depolama için
4. **Batch size'ı** ayarlayın

## Güvenlik

### Yerel Ağ Erişimi
Yerel LLM'inizi ağ üzerinden erişilebilir yapmak için:

```bash
# Ollama için
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

⚠️ **Dikkat:** Bu, LLM'inizi yerel ağdaki tüm cihazlara açar.

### API Key Güvenliği
Eğer API key kullanıyorsanız:
- `.env.local` dosyasını git'e commit etmeyin
- Güçlü API anahtarları kullanın
- Düzenli olarak anahtarları yenileyin

## Daha Fazla Yardım

Sorunlarınız devam ederse:
1. Ollama docs: https://ollama.ai/docs
2. LM Studio docs: https://lmstudio.ai/docs
3. SAP Protocol GitHub issues 