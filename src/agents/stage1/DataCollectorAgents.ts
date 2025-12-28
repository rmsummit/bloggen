/**
 * Stage 1: Data Collection Agents
 * 다양한 소스에서 데이터 수집
 */

import { BaseAgent } from '../../core/BaseAgent.js';
import type { SharedContext, AgentResult, DataSource } from '../../types/index.js';

/**
 * Web Scraper Agent
 */
export class WebScraperAgent extends BaseAgent {
  constructor() {
    super('web-scraper', 'Web Scraper', 'data-collector');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Starting web scraping...');

    const topic = context.metadata.topic;
    const sources: DataSource[] = [];

    // 시뮬레이션: 실제로는 웹 스크래핑 API 호출
    const mockUrls = [
      `https://blog.example.com/search?q=${encodeURIComponent(topic)}`,
      `https://news.example.com/tech/${encodeURIComponent(topic)}`,
      `https://medium.com/search?q=${encodeURIComponent(topic)}`,
    ];

    for (const url of mockUrls) {
      sources.push({
        type: 'web',
        url,
        content: `Sample content about ${topic} from ${url}`,
        metadata: {
          title: `Article about ${topic}`,
          publishedAt: new Date().toISOString(),
          author: 'Sample Author',
        },
        reliability: 0.8 + Math.random() * 0.2,
        collectedAt: new Date(),
      });
    }

    return {
      success: true,
      data: sources,
      metrics: {
        sources_collected: sources.length,
        avg_reliability: sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length,
      },
      executionTime: 0,
    };
  }
}

/**
 * YouTube Crawler Agent
 */
export class YouTubeCrawlerAgent extends BaseAgent {
  constructor() {
    super('youtube-crawler', 'YouTube Crawler', 'data-collector');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Crawling YouTube...');

    const topic = context.metadata.topic;
    const sources: DataSource[] = [];

    // 시뮬레이션: 유튜브 API 호출
    sources.push({
      type: 'youtube',
      url: `https://youtube.com/watch?v=example1`,
      content: `Video transcript about ${topic}. This is a detailed explanation...`,
      metadata: {
        title: `How to ${topic}`,
        views: 150000,
        likes: 5000,
        comments: 300,
      },
      reliability: 0.75,
      collectedAt: new Date(),
    });

    return {
      success: true,
      data: sources,
      metrics: {
        videos_found: sources.length,
      },
      executionTime: 0,
    };
  }
}

/**
 * Trend Analyzer Agent
 */
export class TrendAnalyzerAgent extends BaseAgent {
  constructor() {
    super('trend-analyzer', 'Trend Analyzer', 'data-collector');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Analyzing trends...');

    const topic = context.metadata.topic;

    // 시뮬레이션: Google Trends, Naver Trends API
    const trendData = {
      keyword: topic,
      searchVolume: Math.floor(10000 + Math.random() * 90000),
      trendDirection: Math.random() > 0.5 ? 'rising' : 'stable',
      relatedQueries: [
        `${topic} 사용법`,
        `${topic} 비교`,
        `${topic} 추천`,
        `${topic} 가격`,
      ],
      regionalInterest: {
        서울: 100,
        경기: 85,
        부산: 65,
      },
    };

    const source: DataSource = {
      type: 'trend',
      content: JSON.stringify(trendData),
      metadata: trendData,
      reliability: 0.95,
      collectedAt: new Date(),
    };

    return {
      success: true,
      data: [source],
      metrics: {
        search_volume: trendData.searchVolume,
      },
      executionTime: 0,
    };
  }
}

/**
 * File Parser Agent
 */
export class FileParserAgent extends BaseAgent {
  constructor() {
    super('file-parser', 'File Parser', 'data-collector');
  }

  async execute(context: SharedContext, params?: { files?: string[] }): Promise<AgentResult> {
    this.log('Parsing files...');

    const sources: DataSource[] = [];
    const files = params?.files || [];

    // 시뮬레이션: PDF, DOCX 파싱
    for (const file of files) {
      sources.push({
        type: 'file',
        url: file,
        content: `Parsed content from ${file}`,
        metadata: {
          filename: file,
          pages: Math.floor(10 + Math.random() * 20),
        },
        reliability: 0.9,
        collectedAt: new Date(),
      });
    }

    return {
      success: true,
      data: sources,
      metrics: {
        files_parsed: sources.length,
      },
      executionTime: 0,
    };
  }
}

/**
 * Database Query Agent
 */
export class DatabaseQueryAgent extends BaseAgent {
  constructor() {
    super('database-query', 'Database Query', 'data-collector');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Querying database for existing content...');

    const topic = context.metadata.topic;
    const sources: DataSource[] = [];

    // 시뮬레이션: 기존 콘텐츠 DB 쿼리
    sources.push({
      type: 'database',
      content: `Previous articles about ${topic} from our database`,
      metadata: {
        count: 15,
        avgPerformance: 0.75,
      },
      reliability: 1.0,
      collectedAt: new Date(),
    });

    return {
      success: true,
      data: sources,
      metrics: {
        existing_content_found: 15,
      },
      executionTime: 0,
    };
  }
}

/**
 * Data Aggregator
 * 여러 소스의 데이터를 통합
 */
export class DataAggregatorAgent extends BaseAgent {
  constructor() {
    super('data-aggregator', 'Data Aggregator', 'aggregator');
  }

  async execute(context: SharedContext, params?: { sources: DataSource[] }): Promise<AgentResult> {
    this.log('Aggregating data from multiple sources...');

    const allSources = params?.sources || [];

    // 중복 제거
    const uniqueSources = this.deduplicateSources(allSources);

    // 신뢰도 기준으로 정렬
    const sortedSources = uniqueSources.sort((a, b) => b.reliability - a.reliability);

    // 품질 점수 계산
    const qualityScore = this.calculateQualityScore(sortedSources);

    return {
      success: true,
      data: {
        sources: sortedSources,
        qualityScore,
      },
      metrics: {
        total_sources: sortedSources.length,
        quality_score: qualityScore,
        avg_reliability:
          sortedSources.reduce((sum, s) => sum + s.reliability, 0) / sortedSources.length,
      },
      executionTime: 0,
    };
  }

  private deduplicateSources(sources: DataSource[]): DataSource[] {
    const seen = new Set<string>();
    return sources.filter((source) => {
      const key = source.url || source.content.substring(0, 100);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateQualityScore(sources: DataSource[]): number {
    if (sources.length === 0) return 0;

    const avgReliability =
      sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length;
    const diversityScore = new Set(sources.map((s) => s.type)).size / 5; // 최대 5개 타입

    return (avgReliability * 0.7 + diversityScore * 0.3);
  }
}

/**
 * Data Cleaner
 * 데이터 정제 및 중복 제거
 */
export class DataCleanerAgent extends BaseAgent {
  constructor() {
    super('data-cleaner', 'Data Cleaner', 'cleaner');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Cleaning and filtering data...');

    const rawSources = context.data.sources;

    // 노이즈 제거
    const cleanedSources = rawSources.filter((s) => {
      // 신뢰도가 낮은 소스 제거
      if (s.reliability < 0.5) return false;

      // 너무 짧은 콘텐츠 제거
      if (s.content.length < 50) return false;

      return true;
    });

    // 텍스트 정규화
    const normalizedSources = cleanedSources.map((source) => ({
      ...source,
      content: this.normalizeText(source.content),
    }));

    return {
      success: true,
      data: normalizedSources,
      metrics: {
        original_count: rawSources.length,
        cleaned_count: normalizedSources.length,
        removal_rate: (rawSources.length - normalizedSources.length) / rawSources.length,
      },
      executionTime: 0,
    };
  }

  private normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }
}
