// Storage Service for SAP Protocol
// Handles persistence of agents, workflows, and other data

export interface Agent {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  specialties: string[];
  createdAt: string;
  worldIdVerified: boolean;
  worldIdProof?: string;
  nullifierHash?: string;
  merkleRoot?: string;
  verificationLevel?: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
  agentId?: string;
  worldIdVerified: boolean;
  worldIdProof?: string;
  nullifierHash?: string;
  merkleRoot?: string;
  verificationLevel?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  modelConfig?: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

const STORAGE_KEYS = {
  AGENTS: 'sap_protocol_agents',
  WORKFLOWS: 'sap_protocol_workflows',
  CHAT_SESSIONS: 'sap_protocol_chat_sessions',
  USER_PREFERENCES: 'sap_protocol_user_preferences',
  LAST_ACTIVE: 'sap_protocol_last_active',
} as const;

class StorageService {
  private readonly AGENTS_KEY = 'sap_protocol_agents';
  private readonly WORKFLOWS_KEY = 'sap_protocol_workflows';
  private readonly CHAT_SESSIONS_KEY = 'sap_protocol_chat_sessions';

  private isAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  private getStorageData<T>(key: string): T[] {
    if (!this.isAvailable()) return [];
    
    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return [];
    }
  }

  private setStorageData<T>(key: string, data: T[]): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.updateLastActive();
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  private updateLastActive(): void {
    if (this.isAvailable()) {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Agent Management
  saveAgent(agent: Agent): void {
    const agents = this.getAllAgents();
    const existingIndex = agents.findIndex(a => a.id === agent.id);
    
    if (existingIndex >= 0) {
      agents[existingIndex] = agent;
    } else {
      agents.push(agent);
    }
    
    localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
  }

  updateAgent(agentId: string, updates: Partial<Agent>): void {
    const agents = this.getAllAgents();
    const index = agents.findIndex(a => a.id === agentId);
    
    if (index >= 0) {
      agents[index] = { ...agents[index], ...updates };
      localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
    }
  }

  getAgent(agentId: string): Agent | null {
    const agents = this.getAllAgents();
    return agents.find(a => a.id === agentId) || null;
  }

  getAllAgents(): Agent[] {
    try {
      const stored = localStorage.getItem(this.AGENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading agents:', error);
      return [];
    }
  }

  deleteAgent(agentId: string): void {
    const agents = this.getAllAgents();
    const filtered = agents.filter(a => a.id !== agentId);
    localStorage.setItem(this.AGENTS_KEY, JSON.stringify(filtered));
  }

  // Workflow Management
  saveWorkflow(workflow: WorkflowData): void {
    const workflows = this.getAllWorkflows();
    const existingIndex = workflows.findIndex(w => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = { ...workflow, updatedAt: new Date().toISOString() };
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(workflows));
  }

  updateWorkflow(workflowId: string, updates: Partial<WorkflowData>): void {
    const workflows = this.getAllWorkflows();
    const index = workflows.findIndex(w => w.id === workflowId);
    
    if (index >= 0) {
      workflows[index] = { ...workflows[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(workflows));
    }
  }

  getWorkflow(workflowId: string): WorkflowData | null {
    const workflows = this.getAllWorkflows();
    return workflows.find(w => w.id === workflowId) || null;
  }

  getAllWorkflows(): WorkflowData[] {
    try {
      const stored = localStorage.getItem(this.WORKFLOWS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading workflows:', error);
      return [];
    }
  }

  deleteWorkflow(workflowId: string): void {
    const workflows = this.getAllWorkflows();
    const filtered = workflows.filter(w => w.id !== workflowId);
    localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(filtered));
  }

  // Chat Session Management
  saveChatSession(session: ChatSession): void {
    const sessions = this.getAllChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  }

  updateChatSession(sessionId: string, updates: Partial<ChatSession>): void {
    const sessions = this.getAllChatSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index >= 0) {
      sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  getChatSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllChatSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  getAllChatSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.CHAT_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  deleteChatSession(sessionId: string): void {
    const sessions = this.getAllChatSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(filtered));
  }

  // User Preferences
  saveUserPreferences(preferences: Record<string, any>): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      this.updateLastActive();
      console.log('✅ User preferences saved:', preferences);
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  getUserPreferences(): Record<string, any> {
    if (!this.isAvailable()) return {};
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return {};
    }
  }

  // Data Export/Import
  exportData(): string {
    const data = {
      agents: this.getAllAgents(),
      workflows: this.getAllWorkflows(),
      chatSessions: this.getAllChatSessions(),
      userPreferences: this.getUserPreferences(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.agents) {
        localStorage.setItem(this.AGENTS_KEY, JSON.stringify(data.agents));
      }
      
      if (data.workflows) {
        localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(data.workflows));
      }
      
      if (data.chatSessions) {
        localStorage.setItem(this.CHAT_SESSIONS_KEY, JSON.stringify(data.chatSessions));
      }
      
      if (data.userPreferences) {
        this.saveUserPreferences(data.userPreferences);
      }
      
      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.AGENTS_KEY);
    localStorage.removeItem(this.WORKFLOWS_KEY);
    localStorage.removeItem(this.CHAT_SESSIONS_KEY);
  }

  // Get storage statistics
  getStorageStats(): {
    agentCount: number;
    workflowCount: number;
    chatSessionCount: number;
    totalStorageSize: number;
  } {
    const agents = this.getAllAgents();
    const workflows = this.getAllWorkflows();
    const chatSessions = this.getAllChatSessions();
    
    // Approximate storage size in bytes
    const totalSize = 
      JSON.stringify(agents).length +
      JSON.stringify(workflows).length +
      JSON.stringify(chatSessions).length;
    
    return {
      agentCount: agents.length,
      workflowCount: workflows.length,
      chatSessionCount: chatSessions.length,
      totalStorageSize: totalSize
    };
  }

  // localStorage kullanılabilir mi kontrol et
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create and export singleton instance
export const storageService = new StorageService();

// Export helper functions
export const createAgent = (data: Agent) => {
  storageService.saveAgent(data);
};

export const createWorkflow = (data: WorkflowData) => {
  storageService.saveWorkflow(data);
};

export const createChatSession = (data: ChatSession) => {
  storageService.saveChatSession(data);
};

export default storageService; 