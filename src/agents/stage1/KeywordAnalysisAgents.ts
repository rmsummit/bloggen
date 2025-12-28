/**
 * Stage 1: Keyword Analysis Agents
 * 키워드 분석 및 추출
 */

import { BaseAgent } from '../../core/BaseAgent.js';
import type { SharedContext, AgentResult, Keyword } from '../../types/index.js';

/**
 * TF-IDF Analyzer
 */
export class TFIDFAnalyzerAgent extends BaseAgent {
  constructor() {
    super('tfidf-analyzer', 'TF-IDF Analyzer', 'keyword-analyzer');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Analyzing keywords using TF-IDF...');

    const sources = context.data.sources;
    const allText = sources.map((s) => s.content).join(' ');

    // 간단한 TF-IDF 시뮬레이션
    const keywords = this.extractKeywords(allText);

    return {
      success: true,
      data: keywords,
      metrics: {
        keywords_found: keywords.length,
        avg_score: keywords.reduce((sum, k) => sum + k.score, 0) / keywords.length,
      },
      executionTime: 0,
    };
  }

  private extractKeywords(text: string): Keyword[] {
    // 간단한 단어 빈도 분석
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);

    const frequency = new Map<string, number>();
    words.forEach((word) => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // 상위 키워드 추출
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    return sorted.map(([term, freq]) => ({
      term,
      score: Math.min(freq / words.length * 100, 1.0),
      tfidfScore: Math.random() * 0.5 + 0.5,
    }));
  }
}

/**
 * Trend Keyword Analyzer
 */
export class TrendKeywordAnalyzerAgent extends BaseAgent {
  constructor() {
    super('trend-keyword-analyzer', 'Trend Keyword Analyzer', 'keyword-analyzer');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Analyzing trending keywords...');

    const topic = context.metadata.topic;

    // 시뮬레이션: 검색량 기반 키워드
    const keywords: Keyword[] = [
      {
        term: topic,
        score: 0.95,
        searchVolume: 50000,
        competition: 0.7,
      },
      {
        term: `${topic} 사용법`,
        score: 0.85,
        searchVolume: 30000,
        competition: 0.5,
      },
      {
        term: `${topic} 추천`,
        score: 0.80,
        searchVolume: 25000,
        competition: 0.6,
      },
      {
        term: `${topic} 비교`,
        score: 0.75,
        searchVolume: 20000,
        competition: 0.4,
      },
    ];

    return {
      success: true,
      data: keywords,
      metrics: {
        keywords_found: keywords.length,
        avg_search_volume:
          keywords.reduce((sum, k) => sum + (k.searchVolume || 0), 0) / keywords.length,
      },
      executionTime: 0,
    };
  }
}

/**
 * Competition Analyzer
 */
export class CompetitionAnalyzerAgent extends BaseAgent {
  constructor() {
    super('competition-analyzer', 'Competition Analyzer', 'keyword-analyzer');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Analyzing keyword competition...');

    const topic = context.metadata.topic;

    // 시뮬레이션: 경쟁도 분석
    const keywords: Keyword[] = [
      {
        term: topic,
        score: 0.90,
        competition: 0.8, // 높은 경쟁도
      },
      {
        term: `${topic} 가이드`,
        score: 0.75,
        competition: 0.6,
      },
      {
        term: `${topic} 초보`,
        score: 0.70,
        competition: 0.3, // 낮은 경쟁도 (블루오션)
      },
    ];

    return {
      success: true,
      data: keywords,
      metrics: {
        keywords_found: keywords.length,
        avg_competition:
          keywords.reduce((sum, k) => sum + (k.competition || 0), 0) / keywords.length,
        blue_ocean_count: keywords.filter((k) => (k.competition || 0) < 0.4).length,
      },
      executionTime: 0,
    };
  }
}

/**
 * Intent Classifier
 */
export class IntentClassifierAgent extends BaseAgent {
  constructor() {
    super('intent-classifier', 'Intent Classifier', 'keyword-analyzer');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Classifying keyword intent...');

    const topic = context.metadata.topic;

    // 시뮬레이션: 의도 분류
    const keywords: Keyword[] = [
      {
        term: topic,
        score: 0.95,
        intent: 'informational',
      },
      {
        term: `${topic} 구매`,
        score: 0.85,
        intent: 'transactional',
      },
      {
        term: `${topic} 사이트`,
        score: 0.75,
        intent: 'navigational',
      },
      {
        term: `${topic} 방법`,
        score: 0.90,
        intent: 'informational',
      },
    ];

    return {
      success: true,
      data: keywords,
      metrics: {
        keywords_found: keywords.length,
        informational_count: keywords.filter((k) => k.intent === 'informational').length,
        transactional_count: keywords.filter((k) => k.intent === 'transactional').length,
        navigational_count: keywords.filter((k) => k.intent === 'navigational').length,
      },
      executionTime: 0,
    };
  }
}

/**
 * Keyword Consensus Agent
 * 여러 분석 결과를 합의하여 최종 키워드 선정
 */
export class KeywordConsensusAgent extends BaseAgent {
  constructor() {
    super('keyword-consensus', 'Keyword Consensus', 'consensus');
  }

  async execute(
    context: SharedContext,
    params?: {
      tfidfKeywords: Keyword[];
      trendKeywords: Keyword[];
      competitionKeywords: Keyword[];
      intentKeywords: Keyword[];
    }
  ): Promise<AgentResult> {
    this.log('Creating keyword consensus...');

    const { tfidfKeywords = [], trendKeywords = [], competitionKeywords = [], intentKeywords = [] } =
      params || {};

    // 가중치 투표
    const weights = {
      tfidf: 0.3,
      trend: 0.25,
      competition: 0.25,
      intent: 0.2,
    };

    const scores = new Map<string, number>();

    // TF-IDF 키워드
    tfidfKeywords.forEach((kw) => {
      scores.set(kw.term, (scores.get(kw.term) || 0) + kw.score * weights.tfidf);
    });

    // Trend 키워드
    trendKeywords.forEach((kw) => {
      scores.set(kw.term, (scores.get(kw.term) || 0) + kw.score * weights.trend);
    });

    // Competition 키워드
    competitionKeywords.forEach((kw) => {
      scores.set(kw.term, (scores.get(kw.term) || 0) + kw.score * weights.competition);
    });

    // Intent 키워드
    intentKeywords.forEach((kw) => {
      scores.set(kw.term, (scores.get(kw.term) || 0) + kw.score * weights.intent);
    });

    // 신뢰도 70% 이상 키워드만 선택
    const threshold = 0.7;
    const finalKeywords: Keyword[] = [];

    scores.forEach((score, term) => {
      if (score >= threshold) {
        // 추가 정보 병합
        const tfidf = tfidfKeywords.find((k) => k.term === term);
        const trend = trendKeywords.find((k) => k.term === term);
        const competition = competitionKeywords.find((k) => k.term === term);
        const intent = intentKeywords.find((k) => k.term === term);

        finalKeywords.push({
          term,
          score,
          searchVolume: trend?.searchVolume,
          competition: competition?.competition,
          intent: intent?.intent,
          tfidfScore: tfidf?.tfidfScore,
        });
      }
    });

    // 점수 기준 정렬
    finalKeywords.sort((a, b) => b.score - a.score);

    // Primary, Secondary, Long-tail 분류
    const primary = finalKeywords.slice(0, 5);
    const secondary = finalKeywords.slice(5, 15);
    const longTail = finalKeywords.slice(15);

    const consensusScore = finalKeywords.length / scores.size;

    return {
      success: true,
      data: {
        primary,
        secondary,
        longTail,
        consensusScore,
      },
      metrics: {
        total_candidates: scores.size,
        final_keywords: finalKeywords.length,
        consensus_score: consensusScore,
        primary_count: primary.length,
        secondary_count: secondary.length,
        longtail_count: longTail.length,
      },
      executionTime: 0,
    };
  }
}

/**
 * Tone & Style Matcher
 * 타겟 독자에 맞는 톤과 스타일 결정
 */
export class ToneStyleMatcherAgent extends BaseAgent {
  constructor() {
    super('tone-style-matcher', 'Tone & Style Matcher', 'style-analyzer');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Determining tone and style...');

    const { targetAudience, category } = context.metadata;

    // 타겟 독자 기반 스타일 결정
    const styleGuide = this.determineStyle(targetAudience, category);

    return {
      success: true,
      data: styleGuide,
      metrics: {
        formality: styleGuide.formality,
        technical_level: styleGuide.technicalLevel,
      },
      executionTime: 0,
    };
  }

  private determineStyle(audience: string, category: string): any {
    // 간단한 규칙 기반 스타일 결정
    if (audience.includes('전문가') || audience.includes('개발자')) {
      return {
        tone: 'professional',
        voice: 'third-person',
        formality: 0.8,
        technicalLevel: 0.9,
        preferredStructure: ['서론', '기술 배경', '심화 내용', '사례 연구', '결론'],
        examplePhrases: [
          '~할 수 있습니다',
          '~를 고려해야 합니다',
          '~의 관점에서',
        ],
      };
    } else if (audience.includes('초보') || audience.includes('일반')) {
      return {
        tone: 'conversational',
        voice: 'second-person',
        formality: 0.5,
        technicalLevel: 0.3,
        preferredStructure: ['서론', '기본 개념', '쉬운 예제', '팁', '마무리'],
        examplePhrases: [
          '~해보세요',
          '~하면 됩니다',
          '~라고 생각하시면 돼요',
        ],
      };
    }

    // 기본 스타일
    return {
      tone: 'professional',
      voice: 'third-person',
      formality: 0.7,
      technicalLevel: 0.5,
      preferredStructure: ['서론', '본론', '예시', '결론'],
      examplePhrases: ['~입니다', '~할 수 있습니다'],
    };
  }
}
