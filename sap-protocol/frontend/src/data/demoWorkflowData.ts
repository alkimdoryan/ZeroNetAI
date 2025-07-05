import { Play, Bot, GitBranch, Zap, Database, Mail } from 'lucide-react';

export const demoNodes = [
  // Boş başlatıyoruz - kullanıcı kendi workflow'unu oluşturacak
];

export const demoEdges = [
  // Boş başlatıyoruz - kullanıcı kendi bağlantılarını oluşturacak
];

export const getDemoWorkflow = () => ({
  nodes: demoNodes,
  edges: demoEdges,
}); 