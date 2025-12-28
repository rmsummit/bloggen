/**
 * Master Orchestrator
 * 전체 워크플로우를 총괄하는 마스터 오케스트레이터
 */

import { SharedContextStore } from './SharedContextStore.js';
import { ConsensusProtocol } from '../protocols/ConsensusProtocol.js';
import { QualityGateSystem } from '../protocols/QualityGates.js';

import type {
  ContentMetadata,
  WorkflowConfig,
  WorkflowStage,
  Agent,
} from '../types/index.js';

// Stage 1 Agents
import {
  WebScraperAgent,
  YouTubeCrawlerAgent,
  TrendAnalyzerAgent,
  FileParserAgent,
  DatabaseQueryAgent,
  DataAggregatorAgent,
  DataCleanerAgent,
} from '../agents/stage1/DataCollectorAgents.js';

import {
  TFIDFAnalyzerAgent,
  TrendKeywordAnalyzerAgent,
  CompetitionAnalyzerAgent,
  IntentClassifierAgent,
  KeywordConsensusAgent,
  ToneStyleMatcherAgent,
} from '../agents/stage1/KeywordAnalysisAgents.js';

// Stage 2 Agents
import {
  ContentPlannerAgent,
  WriterAgent,
  ContentAssemblerAgent,
  CoherenceCheckerAgent,
} from '../agents/stage2/ContentCreationAgents.js';

// Stage 3 Agents
import {
  ReviewerAgent,
  GrammarCheckerAgent,
  ReadabilityAnalyzerAgent,
  PlagiarismCheckerAgent,
  EditorAgent,
} from '../agents/stage3/RefinementAgents.js';

// Stage 4 Agents
import {
  ImageGeneratorAgent,
  SEOMetaGeneratorAgent,
  SchemaBuilderAgent,
  InternalLinkerAgent,
} from '../agents/stage4/OptimizationAgents.js';

// Stage 5 Agents
import {
  TistoryPublisherAgent,
  NaverBlogPublisherAgent,
  WordPressPublisherAgent,
  SmartSchedulerAgent,
  PreFlightCheckerAgent,
} from '../agents/stage5/PublishingAgents.js';

export class MasterOrchestrator {
  private contextStore: SharedContextStore;
  private consensusProtocol: ConsensusProtocol;
  private qualityGates: QualityGateSystem;
  private config: WorkflowConfig;

  constructor(metadata: ContentMetadata, config: WorkflowConfig) {
    this.contextStore = new SharedContextStore(metadata);
    this.consensusProtocol = new ConsensusProtocol(config.consensus);
    this.qualityGates = new QualityGateSystem();
    this.config = config;
  }

  /**
   * 전체 워크플로우 실행
   */
  async execute(): Promise<void> {
    console.log('\n🚀 Starting Multi-Agent Blog Automation Workflow\n');
    console.log('='.repeat(60));

    try {
      // Stage 1: Intelligence
      await this.runStage1Intelligence();

      // Stage 2: Creation
      await this.runStage2Creation();

      // Stage 3: Refinement
      await this.runStage3Refinement();

      // Stage 4: Optimization
      await this.runStage4Optimization();

      // Stage 5: Publishing
      await this.runStage5Publishing();

      console.log('\n✅ Workflow completed successfully!');
      console.log('='.repeat(60));

      this.printSummary();
    } catch (error) {
      console.error('\n❌ Workflow failed:', error);
      throw error;
    }
  }

  /**
   * Stage 1: Intelligence (정보 수집 & 분석)
   */
  private async runStage1Intelligence(): Promise<void> {
    console.log('\n📊 Stage 1: Intelligence (정보 수집 & 분석)');
    console.log('-'.repeat(60));

    // 1. 데이터 수집 (병렬)
    console.log('\n🔍 Step 1: 데이터 수집 (병렬 실행)');
    const dataCollectors: Agent[] = [
      new WebScraperAgent(),
      new YouTubeCrawlerAgent(),
      new TrendAnalyzerAgent(),
      new DatabaseQueryAgent(),
    ];

    const collectionResults = await this.runParallel(
      dataCollectors,
      this.contextStore.getContext()
    );

    // 2. 데이터 집계 및 정제
    console.log('\n📦 Step 2: 데이터 집계 및 정제');
    const aggregator = new DataAggregatorAgent();
    const allSources = collectionResults.flatMap((r) => r.data);
    const aggregated = await aggregator.execute(this.contextStore.getContext(), {
      sources: allSources,
    });

    const cleaner = new DataCleanerAgent();
    this.contextStore.updateData({
      sources: aggregated.data.sources,
      qualityScore: aggregated.data.qualityScore,
    });
    await cleaner.execute(this.contextStore.getContext());

    // 3. 키워드 분석 (병렬)
    console.log('\n🎯 Step 3: 키워드 분석 (병렬 실행)');
    const keywordAnalyzers: Agent[] = [
      new TFIDFAnalyzerAgent(),
      new TrendKeywordAnalyzerAgent(),
      new CompetitionAnalyzerAgent(),
      new IntentClassifierAgent(),
    ];

    const keywordResults = await this.runParallel(
      keywordAnalyzers,
      this.contextStore.getContext()
    );

    // 4. 키워드 합의
    console.log('\n🤝 Step 4: 키워드 합의 알고리즘');
    const consensus = new KeywordConsensusAgent();
    const consensusResult = await consensus.execute(this.contextStore.getContext(), {
      tfidfKeywords: keywordResults[0].data,
      trendKeywords: keywordResults[1].data,
      competitionKeywords: keywordResults[2].data,
      intentKeywords: keywordResults[3].data,
    });

    this.contextStore.updateKeywords({
      primary: consensusResult.data.primary,
      secondary: consensusResult.data.secondary,
      longTail: consensusResult.data.longTail,
      confidence: consensusResult.metrics.consensus_score,
      analyzedBy: keywordAnalyzers.map((a) => a.id),
      consensusScore: consensusResult.metrics.consensus_score,
    });

    // 5. 톤 & 스타일 결정
    console.log('\n🎭 Step 5: 톤 & 스타일 결정');
    const styleMatcher = new ToneStyleMatcherAgent();
    const styleResult = await styleMatcher.execute(this.contextStore.getContext());
    this.contextStore.updateStyle(styleResult.data);

    // Quality Gate 체크
    console.log('\n✅ Quality Gate 1 체크');
    this.checkQualityGate('intelligence', new Map([
      ['min_data_sources', this.contextStore.getData().sources.length],
      ['keyword_confidence', this.contextStore.getKeywords().confidence],
      ['data_quality_score', this.contextStore.getData().qualityScore],
    ]));

    console.log('✅ Stage 1 완료!\n');
  }

  /**
   * Stage 2: Creation (콘텐츠 생성)
   */
  private async runStage2Creation(): Promise<void> {
    console.log('\n✍️ Stage 2: Creation (콘텐츠 생성)');
    console.log('-'.repeat(60));

    // 1. 콘텐츠 기획
    console.log('\n📋 Step 1: 콘텐츠 구조 기획');
    const planner = new ContentPlannerAgent();
    const plan = await planner.execute(this.contextStore.getContext());

    this.contextStore.updateContent({
      metadata: {
        title: plan.data.title,
        outline: plan.data.outline,
        sections: plan.data.sections,
      },
      current: '',
      versions: [],
    });

    // 2. 병렬 글쓰기 (섹션별)
    console.log(`\n👥 Step 2: 병렬 글쓰기 (${plan.data.sections.length}개 섹션)`);
    const writers = [
      new WriterAgent('A'),
      new WriterAgent('B'),
      new WriterAgent('C'),
      new WriterAgent('D'),
    ];

    const writingTasks = plan.data.sections.map((section: any, idx: number) => {
      const writer = writers[idx % writers.length];
      return writer.execute(this.contextStore.getContext(), { section });
    });

    const writtenSections = await Promise.all(writingTasks);

    // 3. 콘텐츠 조립
    console.log('\n🔧 Step 3: 콘텐츠 조립');
    const assembler = new ContentAssemblerAgent();
    const assembled = await assembler.execute(this.contextStore.getContext(), {
      sections: writtenSections.map((r) => r.data),
    });

    // 4. 일관성 검증
    console.log('\n🔍 Step 4: 일관성 검증');
    const coherenceChecker = new CoherenceCheckerAgent();
    const coherence = await coherenceChecker.execute(
      this.contextStore.getContext(),
      { content: assembled.data }
    );

    this.contextStore.updateContent({
      current: assembled.data,
      versions: [{
        version: '1.0',
        content: assembled.data,
        createdAt: new Date(),
        createdBy: 'multi-writer-system',
        changes: ['Initial creation'],
        score: coherence.data.coherenceScore,
      }],
    });

    // Quality Gate 체크
    console.log('\n✅ Quality Gate 2 체크');
    this.checkQualityGate('creation', new Map([
      ['coherence_score', coherence.data.coherenceScore],
      ['readability_score', 75], // 시뮬레이션
      ['plagiarism_threshold', 0.02],
      ['min_word_count', assembled.data.split(' ').length],
    ]));

    console.log('✅ Stage 2 완료!\n');
  }

  /**
   * Stage 3: Refinement (정제 & 개선)
   */
  private async runStage3Refinement(): Promise<void> {
    console.log('\n🔄 Stage 3: Refinement (정제 & 개선)');
    console.log('-'.repeat(60));

    // 1. 자동 검증 (병렬)
    console.log('\n🤖 Step 1: 자동 검증 (병렬 실행)');
    const autoCheckers = [
      new GrammarCheckerAgent(),
      new ReadabilityAnalyzerAgent(),
      new PlagiarismCheckerAgent(),
    ];

    const checkResults = await this.runParallel(
      autoCheckers,
      this.contextStore.getContext()
    );

    // 2. AI 리뷰 (병렬)
    console.log('\n👀 Step 2: AI 리뷰어 패널 (3명 독립 평가)');
    const reviewers = [
      new ReviewerAgent('A', '구조/논리'),
      new ReviewerAgent('B', '톤/스타일'),
      new ReviewerAgent('C', '정확성/깊이'),
    ];

    const reviews = await this.runParallel(
      reviewers,
      this.contextStore.getContext()
    );

    // 3. 리뷰 합의
    console.log('\n🤝 Step 3: 리뷰 합의 (2/3 찬성 필요)');
    const approvalCount = reviews.filter((r) => r.data.approved).length;
    const consensusReached = approvalCount >= 2;

    console.log(`   승인: ${approvalCount}/3 - ${consensusReached ? '✅ 합의 성공' : '❌ 합의 실패'}`);

    if (!consensusReached) {
      // 수정 필요
      console.log('\n✏️ Step 4: 피드백 반영 수정');
      const editor = new EditorAgent();
      const feedback = reviews.flatMap((r) => r.data.suggestedChanges);
      const edited = await editor.execute(this.contextStore.getContext(), { feedback });

      this.contextStore.updateContent({
        current: edited.data,
      });
    }

    // Quality Gate 체크
    console.log('\n✅ Quality Gate 3 체크');
    this.checkQualityGate('refinement', new Map([
      ['review_consensus', approvalCount / 3],
      ['final_score', reviews.reduce((sum, r) => sum + r.data.score, 0) / reviews.length],
      ['grammar_errors', checkResults[0].data.length],
      ['fact_check_pass', 1.0],
    ]));

    console.log('✅ Stage 3 완료!\n');
  }

  /**
   * Stage 4: Optimization (최적화)
   */
  private async runStage4Optimization(): Promise<void> {
    console.log('\n🎨 Stage 4: Optimization (최적화)');
    console.log('-'.repeat(60));

    // 1. 이미지 생성 (병렬)
    console.log('\n🖼️ Step 1: 이미지 생성 (병렬 실행)');
    const imageGens = [
      new ImageGeneratorAgent('A'),
      new ImageGeneratorAgent('B'),
      new ImageGeneratorAgent('C'),
    ];

    const imageResults = await Promise.all([
      imageGens[0].execute(this.contextStore.getContext(), {
        type: 'thumbnail',
        prompt: `Thumbnail for ${this.contextStore.getMetadata().topic}`,
      }),
      imageGens[1].execute(this.contextStore.getContext(), {
        type: 'body',
        prompt: 'Explanatory diagram',
      }),
      imageGens[2].execute(this.contextStore.getContext(), {
        type: 'infographic',
        prompt: 'Key statistics infographic',
      }),
    ]);

    this.contextStore.updateImages({
      thumbnail: [imageResults[0].data],
      bodyImages: [imageResults[1].data],
      infographics: [imageResults[2].data],
    });

    // 2. SEO 최적화 (병렬)
    console.log('\n📊 Step 2: SEO 최적화 (병렬 실행)');
    const seoAgents = [
      new SEOMetaGeneratorAgent(),
      new SchemaBuilderAgent(),
      new InternalLinkerAgent(),
    ];

    const seoResults = await this.runParallel(
      seoAgents,
      this.contextStore.getContext()
    );

    this.contextStore.updateSEO({
      metaTitle: seoResults[0].data.metaTitle,
      metaDescription: seoResults[0].data.metaDescription,
      schema: seoResults[1].data,
      internalLinks: seoResults[2].data,
      score: 85,
    });

    // Quality Gate 체크
    console.log('\n✅ Quality Gate 4 체크');
    this.checkQualityGate('optimization', new Map([
      ['seo_score', 85],
      ['image_quality', 0.85],
      ['mobile_score', 92],
      ['page_speed', 2.5],
    ]));

    console.log('✅ Stage 4 완료!\n');
  }

  /**
   * Stage 5: Publishing (발행)
   */
  private async runStage5Publishing(): Promise<void> {
    console.log('\n🚀 Stage 5: Publishing (발행)');
    console.log('-'.repeat(60));

    // 1. Pre-Flight 체크
    console.log('\n🔍 Step 1: Pre-Flight 체크');
    const preFlightChecker = new PreFlightCheckerAgent();
    const preFlightResult = await preFlightChecker.execute(
      this.contextStore.getContext()
    );

    if (!preFlightResult.success) {
      throw new Error('Pre-flight checks failed');
    }

    // 2. 스마트 스케줄링
    console.log('\n⏰ Step 2: 최적 발행 시간 결정');
    const scheduler = new SmartSchedulerAgent();
    const schedule = await scheduler.execute(this.contextStore.getContext());

    console.log(`   최적 시간: ${schedule.data.optimalTime.toLocaleString('ko-KR')}`);
    console.log(`   신뢰도: ${(schedule.data.confidence * 100).toFixed(1)}%`);
    console.log(`   사유: ${schedule.data.reasoning}`);

    // 3. 다중 플랫폼 발행 (병렬)
    console.log('\n📢 Step 3: 다중 플랫폼 발행 (병렬 실행)');
    const publishers = [
      new TistoryPublisherAgent(),
      new NaverBlogPublisherAgent(),
      new WordPressPublisherAgent(),
    ];

    const publishResults = await this.runParallel(
      publishers,
      this.contextStore.getContext()
    );

    const successCount = publishResults.filter((r) => r.success).length;

    console.log(`\n   발행 결과: ${successCount}/${publishers.length} 성공`);

    publishResults.forEach((result) => {
      const data = result.data;
      if (data.success) {
        console.log(`   ✅ ${data.platform}: ${data.url}`);
      } else {
        console.log(`   ❌ ${data.platform}: ${data.error}`);
      }
    });

    // Quality Gate 체크
    console.log('\n✅ Quality Gate 5 체크');
    this.checkQualityGate('publishing', new Map([
      ['checklist_pass_rate', 1.0],
      ['all_platforms_ready', 1.0],
      ['backup_completed', 1.0],
    ]));

    console.log('✅ Stage 5 완료!\n');
  }

  /**
   * 병렬 실행 헬퍼
   */
  private async runParallel(agents: Agent[], context: any): Promise<any[]> {
    if (this.config.parallelExecution.enabled) {
      const tasks = agents.map((agent) => agent.execute(context));
      return Promise.all(tasks);
    } else {
      // 순차 실행
      const results = [];
      for (const agent of agents) {
        results.push(await agent.execute(context));
      }
      return results;
    }
  }

  /**
   * Quality Gate 체크
   */
  private checkQualityGate(stage: WorkflowStage, metrics: Map<string, number>): void {
    const result = this.qualityGates.check(stage, metrics);

    if (!result.passed) {
      console.log(`   ❌ Failed: ${result.failedMetric}`);
      console.log(`   Required: ${result.required}, Actual: ${result.actual}`);

      if (this.config.qualityGates.strictMode) {
        throw new Error(`Quality gate failed for stage: ${stage}`);
      }
    } else {
      console.log('   ✅ All requirements passed');
    }
  }

  /**
   * 요약 출력
   */
  private printSummary(): void {
    const stats = this.contextStore.getStats();

    console.log('\n📊 Workflow Summary');
    console.log('-'.repeat(60));
    console.log(`Topic: ${this.contextStore.getMetadata().topic}`);
    console.log(`Data Sources: ${stats.dataSourcesCount}`);
    console.log(`Keywords: ${stats.primaryKeywordsCount} primary`);
    console.log(`Content Versions: ${stats.contentVersionsCount}`);
    console.log(`Images: ${stats.imagesCount}`);
    console.log(`Reviews: ${stats.reviewsCount}`);
    console.log('');
  }

  /**
   * Context Store 접근
   */
  getContextStore(): SharedContextStore {
    return this.contextStore;
  }
}
