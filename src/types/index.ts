/**
 * 핵심 타입 정의
 * Multi-Agent Blog Automation Workflow System
 */

// ==================== 기본 타입 ====================

export type QualityLevel = 'basic' | 'standard' | 'premium';
export type WorkflowStage = 'intelligence' | 'creation' | 'refinement' | 'optimization' | 'publishing';
export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed';

// ==================== 콘텐츠 메타데이터 ====================

export interface ContentMetadata {
  id: string;
  topic: string;
  targetAudience: string;
  targetQuality: QualityLevel;
  keywords?: string[];
  category: string;
  targetLength?: number;
  urgent?: boolean;
  requiresFactCheck?: boolean;
  platforms: string[];
  scheduledTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Shared Context ====================

export interface SharedContext {
  metadata: ContentMetadata;
  data: DataCollection;
  keywords: KeywordAnalysis;
  style: StyleGuide;
  content: ContentVersions;
  images: ImageCollection;
  seo: SEOData;
  feedback: FeedbackData;
  analytics: AnalyticsData;
}

export interface DataCollection {
  sources: DataSource[];
  rawData: Map<string, any>;
  cleanedData: Map<string, any>;
  collectedAt: Date;
  qualityScore: number;
}

export interface DataSource {
  type: 'web' | 'youtube' | 'trend' | 'file' | 'database';
  url?: string;
  content: string;
  metadata: Record<string, any>;
  reliability: number;
  collectedAt: Date;
}

export interface KeywordAnalysis {
  primary: Keyword[];
  secondary: Keyword[];
  longTail: Keyword[];
  competitors: Keyword[];
  confidence: number;
  analyzedBy: string[];
  consensusScore: number;
}

export interface Keyword {
  term: string;
  score: number;
  searchVolume?: number;
  competition?: number;
  intent?: 'informational' | 'transactional' | 'navigational';
  tfidfScore?: number;
}

export interface StyleGuide {
  tone: 'professional' | 'casual' | 'academic' | 'conversational';
  voice: 'first-person' | 'second-person' | 'third-person';
  formality: number; // 0-1
  technicalLevel: number; // 0-1
  preferredStructure: string[];
  examplePhrases: string[];
}

export interface ContentVersions {
  current: string;
  versions: ContentVersion[];
  metadata: {
    title: string;
    outline: string[];
    sections: Section[];
  };
}

export interface ContentVersion {
  version: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  changes: string[];
  score: number;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  coherenceScore?: number;
}

export interface ImageCollection {
  thumbnail: GeneratedImage[];
  bodyImages: GeneratedImage[];
  infographics: GeneratedImage[];
  selected: Map<string, string>; // position -> imageId
}

export interface GeneratedImage {
  id: string;
  url: string;
  type: 'thumbnail' | 'body' | 'infographic';
  prompt: string;
  style: string;
  score: number;
  optimized: boolean;
  alt: string;
  width: number;
  height: number;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  schema: Record<string, any>;
  openGraph: OpenGraphData;
  internalLinks: string[];
  externalLinks: string[];
  score: number;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  type: string;
  url: string;
}

export interface FeedbackData {
  reviews: Review[];
  improvements: string[];
  appliedFixes: string[];
}

export interface Review {
  reviewer: string;
  score: number;
  approved: boolean;
  comments: string[];
  suggestedChanges: string[];
  timestamp: Date;
}

export interface AnalyticsData {
  views: number;
  engagementRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversions: number;
  performanceByTime: Map<string, number>;
  insights: Insight[];
}

export interface Insight {
  type: 'keyword' | 'structure' | 'image' | 'timing';
  finding: string;
  impact: number;
  recommendation: string;
}

// ==================== 에이전트 관련 ====================

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  execute(context: SharedContext, params?: any): Promise<AgentResult>;
}

export interface AgentResult {
  success: boolean;
  data: any;
  errors?: string[];
  metrics: Record<string, number>;
  executionTime: number;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
}

// ==================== 합의 관련 ====================

export interface ConsensusConfig {
  threshold: number;
  maxRounds: number;
  mediator?: string;
  votingWeights?: Map<string, number>;
}

export interface ConsensusResult<T> {
  agreed: boolean;
  result?: T;
  agreementScore: number;
  participantResults: ParticipantResult<T>[];
  rounds: number;
}

export interface ParticipantResult<T> {
  agentId: string;
  result: T;
  confidence: number;
  reasoning?: string;
}

// ==================== Quality Gates ====================

export interface QualityGateConfig {
  stage: WorkflowStage;
  requirements: Map<string, number>;
  strictMode: boolean;
}

export interface QualityGateResult {
  passed: boolean;
  failedMetric?: string;
  required?: number;
  actual?: number;
  allMetrics: Map<string, number>;
}

// ==================== 워크플로우 설정 ====================

export interface WorkflowConfig {
  qualityLevel: QualityLevel;
  parallelExecution: {
    enabled: boolean;
    maxWorkers: number;
    timeout: number;
  };
  consensus: ConsensusConfig;
  qualityGates: {
    strictMode: boolean;
    autoRetry: boolean;
    maxRetries: number;
  };
  stages: StagesConfig;
  learning: {
    enabled: boolean;
    feedbackLoop: boolean;
    modelUpdateInterval: number;
  };
}

export interface StagesConfig {
  intelligence: {
    dataSources: number;
    keywordAnalyzers: number;
    minConfidence: number;
  };
  creation: {
    writers: number;
    styleGuide: string;
    coherenceThreshold: number;
  };
  refinement: {
    reviewers: number;
    consensusRequired: number;
    autoFix: boolean;
  };
  optimization: {
    imageGenerators: number;
    seoModules: number;
    abTest: boolean;
  };
  publishing: {
    platforms: string[];
    smartScheduling: boolean;
    parallelPublish: boolean;
  };
}

// ==================== 발행 관련 ====================

export interface PublishingPlatform {
  name: string;
  authenticated: boolean;
  publish(content: string, metadata: ContentMetadata): Promise<PublishResult>;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  url?: string;
  error?: string;
  publishedAt?: Date;
}

// ==================== 스케줄링 ====================

export interface SchedulingResult {
  optimalTime: Date;
  confidence: number;
  alternatives: Array<{ time: Date; score: number }>;
  reasoning: string;
}

// ==================== 파이프라인 ====================

export interface Pipeline {
  stages: PipelineStage[];
  parallel: boolean;
}

export interface PipelineStage {
  name: string;
  agents: Agent[];
  parallel: boolean;
  qualityGate?: QualityGateConfig;
}
