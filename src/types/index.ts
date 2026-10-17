export type AuthArchitectureMode = 'monolith' | 'extracted';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  themeColor: string;
  stars: number;
  badges: string[];
  favoriteAnimal: string;
  secretColorPattern: string[]; // e.g. ['red', 'blue', 'green']
}

export interface ParentUser {
  id: string;
  email: string;
  parentName: string;
  pin: string; // 4-digit PIN
  children: ChildProfile[];
  role: 'parent' | 'admin';
}

export interface DecodedToken {
  header: {
    alg: string;
    typ: string;
    kid?: string;
  };
  payload: {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    tenant_id: string;
    role: 'child' | 'parent';
    user_id: string;
    user_name: string;
    avatar?: string;
    age?: number;
    family_id: string;
    scope: string;
    auth_provider: 'monolith_legacy' | 'azure_aks_auth_v2';
    vault_key_version?: string;
  };
}

export interface NetworkLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  latencyMs: number;
  handledBy: 'monolith' | 'aks-auth-service' | 'apim-gateway';
  authType: 'Session-Cookie' | 'Bearer-JWT' | 'Anonymous';
  requestHeaders: Record<string, string>;
  responseSnippet: string;
  decodedToken?: DecodedToken['payload'];
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  interactiveItem?: {
    type: 'star' | 'key' | 'gem';
    label: string;
  };
}

export interface StoryBook {
  id: string;
  title: string;
  tagline: string;
  coverColor: string;
  iconName: string;
  pages: StoryPage[];
  readCount: number;
  starsReward: number;
}

export interface MathQuestion {
  id: string;
  question: string;
  operandA: number;
  operandB: number;
  operator: '+' | '-' | '×';
  correctAnswer: number;
  options: number[];
  visualItems: string; // Emoji representing visual count
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  criteria: string;
  category: 'reading' | 'math' | 'art' | 'explorer';
}

export interface LabTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  actionHint: string;
  completed: boolean;
  verifyEndpoint?: string;
}
