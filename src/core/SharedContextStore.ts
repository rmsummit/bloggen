/**
 * Shared Context Store
 * 모든 에이전트가 접근 가능한 중앙 저장소
 */

import type {
  SharedContext,
  ContentMetadata,
  DataCollection,
  KeywordAnalysis,
  StyleGuide,
  ContentVersions,
  ImageCollection,
  SEOData,
  FeedbackData,
  AnalyticsData,
} from '../types/index.js';

export class SharedContextStore {
  private context: SharedContext;
  private subscribers: Map<string, Set<ContextSubscriber>>;
  private history: ContextSnapshot[];

  constructor(metadata: ContentMetadata) {
    this.context = this.initializeContext(metadata);
    this.subscribers = new Map();
    this.history = [];
  }

  private initializeContext(metadata: ContentMetadata): SharedContext {
    return {
      metadata,
      data: {
        sources: [],
        rawData: new Map(),
        cleanedData: new Map(),
        collectedAt: new Date(),
        qualityScore: 0,
      },
      keywords: {
        primary: [],
        secondary: [],
        longTail: [],
        competitors: [],
        confidence: 0,
        analyzedBy: [],
        consensusScore: 0,
      },
      style: {
        tone: 'professional',
        voice: 'third-person',
        formality: 0.7,
        technicalLevel: 0.5,
        preferredStructure: [],
        examplePhrases: [],
      },
      content: {
        current: '',
        versions: [],
        metadata: {
          title: '',
          outline: [],
          sections: [],
        },
      },
      images: {
        thumbnail: [],
        bodyImages: [],
        infographics: [],
        selected: new Map(),
      },
      seo: {
        metaTitle: '',
        metaDescription: '',
        schema: {},
        openGraph: {
          title: '',
          description: '',
          image: '',
          type: 'article',
          url: '',
        },
        internalLinks: [],
        externalLinks: [],
        score: 0,
      },
      feedback: {
        reviews: [],
        improvements: [],
        appliedFixes: [],
      },
      analytics: {
        views: 0,
        engagementRate: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        conversions: 0,
        performanceByTime: new Map(),
        insights: [],
      },
    };
  }

  // ==================== 데이터 접근 메서드 ====================

  getContext(): Readonly<SharedContext> {
    return Object.freeze(structuredClone(this.context));
  }

  getMetadata(): Readonly<ContentMetadata> {
    return Object.freeze(structuredClone(this.context.metadata));
  }

  getData(): Readonly<DataCollection> {
    return Object.freeze(structuredClone(this.context.data));
  }

  getKeywords(): Readonly<KeywordAnalysis> {
    return Object.freeze(structuredClone(this.context.keywords));
  }

  getStyle(): Readonly<StyleGuide> {
    return Object.freeze(structuredClone(this.context.style));
  }

  getContent(): Readonly<ContentVersions> {
    return Object.freeze(structuredClone(this.context.content));
  }

  getImages(): Readonly<ImageCollection> {
    return Object.freeze(structuredClone(this.context.images));
  }

  getSEO(): Readonly<SEOData> {
    return Object.freeze(structuredClone(this.context.seo));
  }

  getFeedback(): Readonly<FeedbackData> {
    return Object.freeze(structuredClone(this.context.feedback));
  }

  getAnalytics(): Readonly<AnalyticsData> {
    return Object.freeze(structuredClone(this.context.analytics));
  }

  // ==================== 데이터 업데이트 메서드 ====================

  updateData(update: Partial<DataCollection>): void {
    this.createSnapshot();
    this.context.data = { ...this.context.data, ...update };
    this.notify('data');
  }

  updateKeywords(update: Partial<KeywordAnalysis>): void {
    this.createSnapshot();
    this.context.keywords = { ...this.context.keywords, ...update };
    this.notify('keywords');
  }

  updateStyle(update: Partial<StyleGuide>): void {
    this.createSnapshot();
    this.context.style = { ...this.context.style, ...update };
    this.notify('style');
  }

  updateContent(update: Partial<ContentVersions>): void {
    this.createSnapshot();
    this.context.content = { ...this.context.content, ...update };
    this.notify('content');
  }

  updateImages(update: Partial<ImageCollection>): void {
    this.createSnapshot();
    this.context.images = { ...this.context.images, ...update };
    this.notify('images');
  }

  updateSEO(update: Partial<SEOData>): void {
    this.createSnapshot();
    this.context.seo = { ...this.context.seo, ...update };
    this.notify('seo');
  }

  updateFeedback(update: Partial<FeedbackData>): void {
    this.createSnapshot();
    this.context.feedback = { ...this.context.feedback, ...update };
    this.notify('feedback');
  }

  updateAnalytics(update: Partial<AnalyticsData>): void {
    this.createSnapshot();
    this.context.analytics = { ...this.context.analytics, ...update };
    this.notify('analytics');
  }

  // ==================== 구독/알림 시스템 ====================

  subscribe(key: string, subscriber: ContextSubscriber): void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(subscriber);
  }

  unsubscribe(key: string, subscriber: ContextSubscriber): void {
    this.subscribers.get(key)?.delete(subscriber);
  }

  private notify(key: string): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      const data = this.getPartialContext(key);
      subscribers.forEach((sub) => sub.onUpdate(key, data));
    }
  }

  private getPartialContext(key: string): any {
    switch (key) {
      case 'data':
        return this.getData();
      case 'keywords':
        return this.getKeywords();
      case 'style':
        return this.getStyle();
      case 'content':
        return this.getContent();
      case 'images':
        return this.getImages();
      case 'seo':
        return this.getSEO();
      case 'feedback':
        return this.getFeedback();
      case 'analytics':
        return this.getAnalytics();
      default:
        return null;
    }
  }

  // ==================== 히스토리 관리 ====================

  private createSnapshot(): void {
    const snapshot: ContextSnapshot = {
      timestamp: new Date(),
      context: structuredClone(this.context),
    };
    this.history.push(snapshot);

    // 히스토리 크기 제한 (최대 50개)
    if (this.history.length > 50) {
      this.history.shift();
    }
  }

  getHistory(): ContextSnapshot[] {
    return structuredClone(this.history);
  }

  rollback(steps: number = 1): boolean {
    if (steps > this.history.length) {
      return false;
    }

    const targetSnapshot = this.history[this.history.length - steps];
    this.context = structuredClone(targetSnapshot.context);
    this.history = this.history.slice(0, -steps);

    // 모든 구독자에게 알림
    this.subscribers.forEach((_, key) => this.notify(key));

    return true;
  }

  // ==================== 유틸리티 메서드 ====================

  export(): SharedContext {
    return structuredClone(this.context);
  }

  import(context: SharedContext): void {
    this.createSnapshot();
    this.context = structuredClone(context);
    this.subscribers.forEach((_, key) => this.notify(key));
  }

  reset(): void {
    this.createSnapshot();
    const metadata = this.context.metadata;
    this.context = this.initializeContext(metadata);
    this.subscribers.forEach((_, key) => this.notify(key));
  }

  getStats(): ContextStats {
    return {
      dataSourcesCount: this.context.data.sources.length,
      primaryKeywordsCount: this.context.keywords.primary.length,
      contentVersionsCount: this.context.content.versions.length,
      imagesCount:
        this.context.images.thumbnail.length +
        this.context.images.bodyImages.length +
        this.context.images.infographics.length,
      reviewsCount: this.context.feedback.reviews.length,
      historySize: this.history.length,
    };
  }
}

// ==================== 인터페이스 정의 ====================

export interface ContextSubscriber {
  onUpdate(key: string, data: any): void;
}

export interface ContextSnapshot {
  timestamp: Date;
  context: SharedContext;
}

export interface ContextStats {
  dataSourcesCount: number;
  primaryKeywordsCount: number;
  contentVersionsCount: number;
  imagesCount: number;
  reviewsCount: number;
  historySize: number;
}
