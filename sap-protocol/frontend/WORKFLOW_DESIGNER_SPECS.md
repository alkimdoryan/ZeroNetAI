# SAP Protocol Workflow Designer - Tasarım Dokümanı

## Genel Bakış

SAP Protocol Workflow Designer, kullanıcıların sürükle-bırak ile karmaşık iş akışları tasarlayabileceği profesyonel bir sistemdir. n8n tarzı arayüzü ile kullanıcılar, ön tanımlı node'ları kullanarak veya kendi custom node'larını oluşturarak workflow'lar oluşturabilirler.

## Sistem Mimarisi

### Mevcut Altyapı
- **React Flow**: Profesyonel workflow editörü
- **Zustand**: State management
- **Design System**: WCAG AA uyumlu, modern tasarım sistemi
- **TypeScript**: Tam tür güvenliği
- **Modüler Yapı**: Genişletilebilir node sistemi

### Kategoriler
1. **Triggers** (Tetikleyiciler): Workflow başlatma
2. **Agents** (Agentler): AI/ML görevleri
3. **Logic** (Mantık): Karar verme ve kontrol
4. **Connectors** (Bağlayıcılar): Harici sistemler
5. **Utility** (Yardımcı): Genel amaçlı işlemler
6. **Custom** (Özel): Kullanıcı tanımlı node'lar

## Node Tanımları

### 1. HTTP Request Node
**Kategori**: Connectors  
**Açıklama**: Harici API'lere HTTP istekleri göndermeyi sağlar.

#### Parametreler
- **URL** (string): Hedef API endpoint'i
- **Method** (enum): GET, POST, PUT, DELETE, PATCH
- **Headers** (key-value array): HTTP başlıkları
- **Query Parameters** (key-value array): URL parametreleri
- **Body** (JSON/text): İstek gövdesi
- **Authentication** (object):
  - Type: None, Bearer Token, Basic Auth, API Key
  - Credentials: Token/key değerleri
- **Timeout** (number): İstek zaman aşımı (ms)
- **Retry** (object):
  - Count: Yeniden deneme sayısı
  - Delay: Denemeler arası bekleme (ms)

#### Örnek Kullanım
```json
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{token}}"
  },
  "body": {
    "name": "{{user.name}}",
    "email": "{{user.email}}"
  }
}
```

### 2. Database Query Node
**Kategori**: Connectors  
**Açıklama**: SQL tabanlı veritabanı işlemleri yapar.

#### Parametreler
- **Connection** (select): Önceden tanımlı bağlantı seçimi
- **Query Type** (enum): SELECT, INSERT, UPDATE, DELETE, CUSTOM
- **SQL Query** (text): SQL sorgusu
- **Parameters** (key-value array): Prepared statement parametreleri
- **Result Format** (enum): Array, Object, Single Value
- **Transaction** (boolean): İşlem içinde çalıştır
- **Timeout** (number): Sorgu zaman aşımı

#### Örnek Kullanım
```sql
SELECT * FROM users 
WHERE status = $1 AND created_at > $2
ORDER BY created_at DESC
LIMIT $3
```

### 3. Email Send Node
**Kategori**: Connectors  
**Açıklama**: E-posta gönderimi için kullanılır.

#### Parametreler
- **SMTP Configuration** (object):
  - Host, Port, Username, Password
  - Security: None, TLS, SSL
- **Recipients** (array):
  - To: Ana alıcılar
  - CC: Kopyada
  - BCC: Gizli kopya
- **Message** (object):
  - Subject: Konu
  - Body: HTML/Text içerik
  - Template: Şablon seçimi
- **Attachments** (array): Dosya ekleri
- **Priority** (enum): Low, Normal, High
- **Tracking** (boolean): Açılma takibi

#### Örnek Kullanım
```json
{
  "to": ["user@example.com"],
  "subject": "Sipariş Onayı - {{order.id}}",
  "template": "order_confirmation",
  "data": {
    "order": "{{workflow.order}}",
    "user": "{{workflow.user}}"
  }
}
```

### 4. Condition (If/Else) Node
**Kategori**: Logic  
**Açıklama**: Akışta dallanma sağlar.

#### Parametreler
- **Condition Type** (enum): JavaScript, Rule Builder, Template
- **Expression** (text): Koşul ifadesi
- **Rules** (array): Görsel kural tanımlayıcı
  - Field: Değişken adı
  - Operator: =, !=, >, <, >=, <=, contains, startsWith
  - Value: Karşılaştırma değeri
  - Logic: AND, OR
- **Output Ports** (object):
  - True: Koşul doğru çıkışı
  - False: Koşul yanlış çıkışı
  - Error: Hata durumu çıkışı

#### Örnek Kullanım
```javascript
// JavaScript Expression
{{response.statusCode}} === 200 && {{response.data.length}} > 0

// Rule Builder
response.statusCode equals 200 AND
response.data.length greater than 0
```

### 5. Loop Node
**Kategori**: Logic  
**Açıklama**: Koleksiyon üzerinde yineleme yapar.

#### Parametreler
- **Loop Type** (enum): For Each, While, For Range
- **Input Data** (expression): Döngü verisi
- **Iterator Variable** (string): Mevcut öğe değişkeni
- **Index Variable** (string): İndeks değişkeni
- **Condition** (expression): While için koşul
- **Range** (object): For Range için başlangıç/bitiş
- **Batch Size** (number): Toplu işlem boyutu
- **Max Iterations** (number): Maksimum iterasyon sayısı
- **Parallel Processing** (boolean): Paralel çalıştırma

#### Örnek Kullanım
```json
{
  "type": "forEach",
  "input": "{{products}}",
  "iterator": "product",
  "index": "index",
  "batchSize": 10,
  "maxIterations": 1000
}
```

### 6. Delay Node
**Kategori**: Utility  
**Açıklama**: Akışı belirli süre bekletir.

#### Parametreler
- **Duration** (number): Bekleme süresi
- **Unit** (enum): Milliseconds, Seconds, Minutes, Hours
- **Dynamic Duration** (expression): Dinamik süre hesaplama
- **Jitter** (number): Rastgele sapma yüzdesi
- **Scheduling** (object):
  - Type: Fixed, Exponential Backoff, Custom
  - Parameters: Algoritma parametreleri

#### Örnek Kullanım
```json
{
  "duration": 30,
  "unit": "seconds",
  "jitter": 10,
  "dynamicDuration": "{{Math.random() * 60}}"
}
```

### 7. Transform Node
**Kategori**: Utility  
**Açıklama**: Veri dönüşümü ve haritalama yapar.

#### Parametreler
- **Transform Type** (enum): JavaScript, JSONata, Template, Mapping
- **Input Schema** (JSON Schema): Girdi veri yapısı
- **Output Schema** (JSON Schema): Çıktı veri yapısı
- **Transformation** (object):
  - Code: JavaScript kodu
  - Expression: JSONata ifadesi
  - Template: Şablon metni
  - Mapping: Alan eşleştirme
- **Validation** (boolean): Şema doğrulaması
- **Error Handling** (enum): Throw, Skip, Default Value

#### Örnek Kullanım
```javascript
// JavaScript Transform
{
  id: input.userId,
  fullName: `${input.firstName} ${input.lastName}`,
  email: input.email.toLowerCase(),
  createdAt: new Date().toISOString(),
  metadata: {
    source: 'api',
    processed: true
  }
}
```

### 8. Error Handler Node
**Kategori**: Utility  
**Açıklama**: Hata durumlarını yönetir.

#### Parametreler
- **Error Types** (multi-select): Yakalanacak hata türleri
- **Retry Policy** (object):
  - Max Retries: Maksimum deneme sayısı
  - Delay: Denemeler arası bekleme
  - Backoff: Üstel artış
- **Fallback Action** (enum): Continue, Stop, Alternative Path
- **Logging** (object):
  - Level: Error, Warning, Info
  - Include Stack Trace: Boolean
  - Custom Message: String template
- **Notifications** (array): Hata bildirimleri
- **Recovery** (object): Kurtarma stratejisi

#### Örnek Kullanım
```json
{
  "errorTypes": ["HttpError", "TimeoutError"],
  "retryPolicy": {
    "maxRetries": 3,
    "delay": 1000,
    "backoff": "exponential"
  },
  "fallbackAction": "alternativePath",
  "logging": {
    "level": "error",
    "message": "API call failed for {{input.userId}}"
  }
}
```

### 9. Custom Function Node
**Kategori**: Utility  
**Açıklama**: Kullanıcı tanımlı JavaScript kodu çalıştırır.

#### Parametreler
- **Code Editor** (code): JavaScript kod editörü
- **Input Schema** (JSON Schema): Girdi parametreleri
- **Output Schema** (JSON Schema): Çıktı parametreleri
- **Dependencies** (array): NPM paket bağımlılıkları
- **Timeout** (number): Çalışma zaman aşımı
- **Memory Limit** (number): Bellek sınırı
- **Security** (object):
  - Sandbox: Güvenlik sandbox'ı
  - Allowed APIs: İzin verilen API'ler
- **Testing** (object): Test case'leri

#### Örnek Kullanım
```javascript
// Custom Function
async function execute(input, context) {
  const { data, config } = input;
  
  // Özel iş mantığı
  const processedData = data.map(item => {
    return {
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    };
  });
  
  // Harici API çağrısı
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(processedData)
  });
  
  return {
    success: response.ok,
    data: await response.json(),
    processedCount: processedData.length
  };
}
```

### 10. Notification Node
**Kategori**: Connectors  
**Açıklama**: Çoklu kanal bildirim gönderir.

#### Parametreler
- **Channels** (multi-select): Slack, Discord, Teams, SMS, Push
- **Channel Config** (object):
  - Slack: Webhook URL, Channel, Username
  - Discord: Webhook URL, Username, Avatar
  - Teams: Webhook URL, Theme Color
  - SMS: Provider, Phone Numbers
  - Push: Service, Device Tokens
- **Message** (object):
  - Title: Bildirim başlığı
  - Body: Mesaj içeriği
  - Template: Şablon seçimi
  - Formatting: Markdown, HTML, Plain
- **Targeting** (object):
  - Recipients: Alıcı listesi
  - Conditions: Gönderim koşulları
- **Scheduling** (object):
  - Immediate: Anında gönderim
  - Delayed: Gecikmeli gönderim
  - Recurring: Tekrarlayan gönderim

#### Örnek Kullanım
```json
{
  "channels": ["slack", "email"],
  "slack": {
    "webhook": "https://hooks.slack.com/...",
    "channel": "#alerts",
    "username": "Workflow Bot"
  },
  "message": {
    "title": "Workflow Completed",
    "body": "Workflow {{workflow.name}} completed successfully",
    "template": "success_notification"
  }
}
```

## Custom Node Sistemi

### Custom Node Şablonu
Kullanıcılar kendi node'larını oluşturabilirler:

#### Node Tanımı
```json
{
  "id": "custom-node-{{uuid}}",
  "name": "My Custom Node",
  "description": "Kullanıcı tanımlı özel node",
  "category": "custom",
  "icon": "🔧",
  "version": "1.0.0",
  "author": "{{user.name}}",
  "inputs": [
    {
      "name": "input",
      "type": "object",
      "required": true,
      "schema": {...}
    }
  ],
  "outputs": [
    {
      "name": "output",
      "type": "object",
      "schema": {...}
    }
  ],
  "properties": [
    {
      "name": "apiKey",
      "type": "string",
      "required": true,
      "secure": true,
      "description": "API anahtarınız"
    },
    {
      "name": "timeout",
      "type": "number",
      "default": 5000,
      "description": "Zaman aşımı (ms)"
    }
  ],
  "code": "// Node implementation code"
}
```

### Custom Node Editörü
1. **Temel Bilgiler**: Ad, açıklama, kategori, ikon
2. **Girdi/Çıktı Tanımları**: JSON Schema ile
3. **Özellikler**: Yapılandırma parametreleri
4. **Kod Editörü**: JavaScript implementation
5. **Test Ortamı**: Canlı test ve debug
6. **Versiyon Yönetimi**: Değişiklik takibi
7. **Paylaşım**: Diğer kullanıcılarla paylaşma

### My Nodes Paneli
- **Kişisel Kütüphane**: Kullanıcının node'ları
- **Paylaşılan Node'lar**: Topluluk katkıları
- **Favori Node'lar**: Sık kullanılanlar
- **Versiyon Geçmişi**: Node versiyonları
- **İstatistikler**: Kullanım metrikleri

## Teknik Implementasyon

### Node Kayıt Sistemi
```typescript
interface NodeDefinition {
  id: string;
  name: string;
  description: string;
  category: NodeCategory;
  icon: string | ReactNode;
  version: string;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  properties: PropertyDefinition[];
  handler: NodeHandler;
  validation?: ValidationSchema;
  documentation?: string;
}

interface NodeHandler {
  execute(input: any, context: NodeContext): Promise<any>;
  validate?(config: any): ValidationResult;
  test?(config: any, testData: any): Promise<TestResult>;
}
```

### Workflow Execution Engine
```typescript
interface WorkflowEngine {
  execute(workflow: Workflow, input?: any): Promise<ExecutionResult>;
  validate(workflow: Workflow): ValidationResult;
  debug(workflow: Workflow, breakpoints: string[]): Promise<DebugSession>;
  schedule(workflow: Workflow, cron: string): ScheduledJob;
}
```

## Kullanıcı Deneyimi

### Drag & Drop Sistemi
1. **Node Palette**: Kategorilere göre düzenlenmiş node'lar
2. **Canvas**: Sürükle-bırak ile node yerleştirme
3. **Bağlantı Çizimi**: Otomatik bağlantı önerileri
4. **Çoklu Seçim**: Grup operasyonları
5. **Kopyala/Yapıştır**: Node'ları kopyalama

### Properties Panel
1. **Dinamik Form**: Node türüne göre form alanları
2. **Validation**: Gerçek zamanlı doğrulama
3. **Önizleme**: Yapılandırma önizlemesi
4. **Şablon Desteği**: Önceden tanımlı şablonlar
5. **Yardım**: Inline dokümantasyon

### Workflow Designer Özellikleri
1. **Auto-save**: Otomatik kayıt
2. **Undo/Redo**: Geri alma/yineleme
3. **Keyboard Shortcuts**: Klavye kısayolları
4. **Layout Algoritmaları**: Otomatik düzenleme
5. **Zoom/Pan**: Büyütme/kaydırma
6. **Minimap**: Küçük harita görünümü

## Performans ve Ölçeklenebilirlik

### Optimizasyon Stratejileri
1. **Lazy Loading**: Node'ları ihtiyaç halinde yükleme
2. **Virtual Scrolling**: Büyük workflow'lar için
3. **Caching**: Execution sonuçlarını önbellekleme
4. **Batch Processing**: Toplu işlem desteği
5. **Parallel Execution**: Paralel node çalıştırma

### Monitoring ve Logging
1. **Execution Metrics**: Çalışma metrikleri
2. **Error Tracking**: Hata takibi
3. **Performance Monitoring**: Performans izleme
4. **Audit Logs**: Denetim kayıtları
5. **Real-time Status**: Canlı durum takibi

## Güvenlik

### Security Considerations
1. **Code Sandbox**: Güvenli kod çalıştırma
2. **Input Validation**: Girdi doğrulaması
3. **Access Control**: Erişim kontrolü
4. **Secure Storage**: Güvenli depolama
5. **Audit Trail**: İşlem kayıtları

### Data Protection
1. **Encryption**: Veri şifreleme
2. **Secrets Management**: Gizli bilgi yönetimi
3. **Data Masking**: Veri maskeleme
4. **Compliance**: Uyumluluk standartları
5. **Privacy Controls**: Gizlilik kontrolleri

## Sonuç

Bu tasarım dokümanı, SAP Protocol Workflow Designer'ın kapsamlı ve ölçeklenebilir bir sistem olmasını sağlar. 10 temel node türü ile başlayarak, kullanıcıların kendi node'larını oluşturabildiği esnek bir platform sunmaktadır. Sistem modern web teknolojileri kullanarak profesyonel, güvenli ve performanslı bir çözüm sunar.

### Geliştirme Sırası
1. **Mevcut node'ları genişletme** (HTTP, Database, Email, Notification)
2. **Yeni utility node'ları** (Loop, Delay, Transform, Error Handler)
3. **Custom Function node'u** (JavaScript execution)
4. **Custom Node editörü** (Node creation system)
5. **My Nodes paneli** (Personal node library)
6. **Advanced features** (Templates, sharing, versioning) 