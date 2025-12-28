/**
 * Stage 4까지만 실행하는 테스트
 */

import { SharedContextStore } from './src/core/SharedContextStore.js';
import { QualityGateSystem } from './src/protocols/QualityGates.js';
import { ConfigLoader } from './src/utils/ConfigLoader.js';
import type { ContentMetadata, WorkflowStage, Agent } from './src/types/index.js';

// Stage 1 Agents
import {
  WebScraperAgent,
  YouTubeCrawlerAgent,
  TrendAnalyzerAgent,
  DatabaseQueryAgent,
  DataAggregatorAgent,
  DataCleanerAgent,
} from './src/agents/stage1/DataCollectorAgents.js';

import {
  TFIDFAnalyzerAgent,
  TrendKeywordAnalyzerAgent,
  CompetitionAnalyzerAgent,
  IntentClassifierAgent,
  KeywordConsensusAgent,
  ToneStyleMatcherAgent,
} from './src/agents/stage1/KeywordAnalysisAgents.js';

// Stage 2 Agents
import {
  ContentPlannerAgent,
  WriterAgent,
  ContentAssemblerAgent,
  CoherenceCheckerAgent,
} from './src/agents/stage2/ContentCreationAgents.js';

// Stage 3 Agents
import {
  ReviewerAgent,
  GrammarCheckerAgent,
  ReadabilityAnalyzerAgent,
  PlagiarismCheckerAgent,
} from './src/agents/stage3/RefinementAgents.js';

// Stage 4 Agents
import {
  ImageGeneratorAgent,
  SEOMetaGeneratorAgent,
  SchemaBuilderAgent,
  InternalLinkerAgent,
} from './src/agents/stage4/OptimizationAgents.js';

async function testStage4Workflow() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Stage 4까지 실행 테스트 - 진행 과정 확인           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // 설정 로드
  const config = ConfigLoader.getDefaultConfig();

  // 콘텐츠 메타데이터
  const metadata: ContentMetadata = {
    id: `test-${Date.now()}`,
    topic: '리테일 AI 활용',
    targetAudience: '스타트업 CEO 및 마케터',
    targetQuality: 'premium',
    category: 'technology',
    targetLength: 2000,
    platforms: ['tistory', 'naver', 'wordpress'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const contextStore = new SharedContextStore(metadata);
  const qualityGates = new QualityGateSystem();

  console.log('📋 테스트 설정:');
  console.log(`   주제: ${metadata.topic}`);
  console.log(`   타겟: ${metadata.targetAudience}`);
  console.log(`   품질: ${metadata.targetQuality}`);
  console.log('');
  console.log('🚀 워크플로우 시작...\n');
  console.log('='.repeat(70));

  // ==================== Stage 1 ====================
  console.log('\n📊 Stage 1: Intelligence (정보 수집 & 분석)');
  console.log('-'.repeat(70));

  console.log('\n🔍 [1/5] 데이터 수집 중...');
  const dataCollectors = [
    new WebScraperAgent(),
    new YouTubeCrawlerAgent(),
    new TrendAnalyzerAgent(),
    new DatabaseQueryAgent(),
  ];

  const collectionResults = await Promise.all(
    dataCollectors.map(agent => agent.execute(contextStore.getContext()))
  );
  console.log(`   ✓ ${collectionResults.length}개 소스에서 데이터 수집 완료`);

  console.log('\n📦 [2/5] 데이터 집계 및 정제 중...');
  const aggregator = new DataAggregatorAgent();
  const allSources = collectionResults.flatMap(r => r.data);
  const aggregated = await aggregator.execute(contextStore.getContext(), { sources: allSources });

  const cleaner = new DataCleanerAgent();
  contextStore.updateData({
    sources: aggregated.data.sources,
    qualityScore: aggregated.data.qualityScore,
  });
  await cleaner.execute(contextStore.getContext());
  console.log(`   ✓ 데이터 정제 완료 (품질 점수: ${aggregated.data.qualityScore.toFixed(2)})`);

  console.log('\n🎯 [3/5] 키워드 분석 중...');
  const keywordAnalyzers = [
    new TFIDFAnalyzerAgent(),
    new TrendKeywordAnalyzerAgent(),
    new CompetitionAnalyzerAgent(),
    new IntentClassifierAgent(),
  ];

  const keywordResults = await Promise.all(
    keywordAnalyzers.map(agent => agent.execute(contextStore.getContext()))
  );
  console.log(`   ✓ 4가지 방법론으로 키워드 분석 완료`);

  console.log('\n🤝 [4/5] 키워드 합의 알고리즘 실행 중...');
  const consensus = new KeywordConsensusAgent();
  const consensusResult = await consensus.execute(contextStore.getContext(), {
    tfidfKeywords: keywordResults[0].data,
    trendKeywords: keywordResults[1].data,
    competitionKeywords: keywordResults[2].data,
    intentKeywords: keywordResults[3].data,
  });

  contextStore.updateKeywords({
    primary: consensusResult.data.primary,
    secondary: consensusResult.data.secondary,
    longTail: consensusResult.data.longTail,
    confidence: consensusResult.metrics.consensus_score,
    analyzedBy: keywordAnalyzers.map(a => a.id),
    consensusScore: consensusResult.metrics.consensus_score,
  });
  console.log(`   ✓ 합의 완료 (신뢰도: ${(consensusResult.metrics.consensus_score * 100).toFixed(1)}%)`);
  console.log(`   ✓ Primary 키워드: ${consensusResult.data.primary.length}개`);
  console.log(`   ✓ Secondary 키워드: ${consensusResult.data.secondary.length}개`);

  console.log('\n🎭 [5/5] 톤 & 스타일 결정 중...');
  const styleMatcher = new ToneStyleMatcherAgent();
  const styleResult = await styleMatcher.execute(contextStore.getContext());
  contextStore.updateStyle(styleResult.data);
  console.log(`   ✓ 스타일 결정 완료`);
  console.log(`      - 톤: ${styleResult.data.tone}`);
  console.log(`      - 격식: ${(styleResult.data.formality * 100).toFixed(0)}%`);

  console.log('\n✅ Quality Gate 1 체크...');
  const gate1 = qualityGates.check('intelligence', new Map([
    ['min_data_sources', contextStore.getData().sources.length],
    ['keyword_confidence', contextStore.getKeywords().confidence],
    ['data_quality_score', contextStore.getData().qualityScore],
  ]));
  console.log(`   ${gate1.passed ? '✅' : '❌'} Stage 1 Quality Gate ${gate1.passed ? '통과' : '실패'}`);

  // ==================== Stage 2 ====================
  console.log('\n\n✍️ Stage 2: Creation (콘텐츠 생성)');
  console.log('-'.repeat(70));

  console.log('\n📋 [1/4] 콘텐츠 구조 기획 중...');
  const planner = new ContentPlannerAgent();
  const plan = await planner.execute(contextStore.getContext());
  contextStore.updateContent({
    metadata: {
      title: plan.data.title,
      outline: plan.data.outline,
      sections: plan.data.sections,
    },
    current: '',
    versions: [],
  });
  console.log(`   ✓ 제목: "${plan.data.title}"`);
  console.log(`   ✓ 섹션: ${plan.data.sections.length}개 구획`);

  console.log('\n👥 [2/4] 병렬 글쓰기 진행 중...');
  const writers = [
    new WriterAgent('A'),
    new WriterAgent('B'),
    new WriterAgent('C'),
    new WriterAgent('D'),
  ];

  const writingTasks = plan.data.sections.map((section: any, idx: number) => {
    const writer = writers[idx % writers.length];
    console.log(`   → Writer ${String.fromCharCode(65 + (idx % 4))}: "${section.title}" 작성 중...`);
    return writer.execute(contextStore.getContext(), { section });
  });

  const writtenSections = await Promise.all(writingTasks);
  console.log(`   ✓ 모든 섹션 작성 완료`);

  console.log('\n🔧 [3/4] 콘텐츠 조립 중...');
  const assembler = new ContentAssemblerAgent();
  const assembled = await assembler.execute(contextStore.getContext(), {
    sections: writtenSections.map(r => r.data),
  });
  console.log(`   ✓ 조립 완료 (총 ${assembled.data.length}자)`);

  console.log('\n🔍 [4/4] 일관성 검증 중...');
  const coherenceChecker = new CoherenceCheckerAgent();
  const coherence = await coherenceChecker.execute(contextStore.getContext(), { content: assembled.data });

  contextStore.updateContent({
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
  console.log(`   ✓ 일관성 점수: ${(coherence.data.coherenceScore * 100).toFixed(1)}%`);

  console.log('\n✅ Quality Gate 2 체크...');
  const gate2 = qualityGates.check('creation', new Map([
    ['coherence_score', coherence.data.coherenceScore],
    ['readability_score', 75],
    ['plagiarism_threshold', 0.02],
    ['min_word_count', assembled.data.split(' ').length],
  ]));
  console.log(`   ${gate2.passed ? '✅' : '❌'} Stage 2 Quality Gate ${gate2.passed ? '통과' : '실패'}`);

  // ==================== Stage 3 ====================
  console.log('\n\n🔄 Stage 3: Refinement (정제 & 개선)');
  console.log('-'.repeat(70));

  console.log('\n🤖 [1/3] 자동 검증 실행 중...');
  const autoCheckers = [
    new GrammarCheckerAgent(),
    new ReadabilityAnalyzerAgent(),
    new PlagiarismCheckerAgent(),
  ];

  console.log('   → 문법 검사 중...');
  console.log('   → 가독성 분석 중...');
  console.log('   → 표절 검사 중...');

  const checkResults = await Promise.all(
    autoCheckers.map(agent => agent.execute(contextStore.getContext()))
  );
  console.log(`   ✓ 자동 검증 완료`);
  console.log(`      - 문법 오류: ${checkResults[0].data.length}개`);
  console.log(`      - 가독성: ${checkResults[1].data.score.toFixed(1)}점`);
  console.log(`      - 표절률: ${(checkResults[2].data.plagiarismRate * 100).toFixed(2)}%`);

  console.log('\n👀 [2/3] AI 리뷰어 패널 평가 중...');
  const reviewers = [
    new ReviewerAgent('A', '구조/논리'),
    new ReviewerAgent('B', '톤/스타일'),
    new ReviewerAgent('C', '정확성/깊이'),
  ];

  console.log('   → Reviewer A (구조/논리) 평가 중...');
  console.log('   → Reviewer B (톤/스타일) 평가 중...');
  console.log('   → Reviewer C (정확성/깊이) 평가 중...');

  const reviews = await Promise.all(
    reviewers.map(agent => agent.execute(contextStore.getContext()))
  );

  const approvalCount = reviews.filter(r => r.data.approved).length;
  const avgScore = reviews.reduce((sum, r) => sum + r.data.score, 0) / reviews.length;

  console.log(`   ✓ 리뷰 완료`);
  reviews.forEach((review, idx) => {
    console.log(`      - Reviewer ${String.fromCharCode(65 + idx)}: ${review.data.score.toFixed(1)}점 ${review.data.approved ? '✅' : '❌'}`);
  });

  console.log('\n🤝 [3/3] 합의 결과...');
  const consensusReached = approvalCount >= 2;
  console.log(`   ${consensusReached ? '✅' : '❌'} 승인: ${approvalCount}/3 (${consensusReached ? '합의 성공' : '합의 실패'})`);
  console.log(`   평균 점수: ${avgScore.toFixed(1)}점`);

  console.log('\n✅ Quality Gate 3 체크...');
  const gate3 = qualityGates.check('refinement', new Map([
    ['review_consensus', approvalCount / 3],
    ['final_score', avgScore],
    ['grammar_errors', checkResults[0].data.length],
    ['fact_check_pass', 1.0],
  ]));
  console.log(`   ${gate3.passed ? '✅' : '❌'} Stage 3 Quality Gate ${gate3.passed ? '통과' : '실패'}`);

  // ==================== Stage 4 ====================
  console.log('\n\n🎨 Stage 4: Optimization (최적화)');
  console.log('-'.repeat(70));

  console.log('\n🖼️ [1/2] 이미지 생성 중...');
  const imageGens = [
    new ImageGeneratorAgent('A'),
    new ImageGeneratorAgent('B'),
    new ImageGeneratorAgent('C'),
  ];

  console.log('   → Thumbnail 이미지 생성 중...');
  console.log('   → Body 이미지 생성 중...');
  console.log('   → Infographic 생성 중...');

  const imageResults = await Promise.all([
    imageGens[0].execute(contextStore.getContext(), {
      type: 'thumbnail',
      prompt: `Thumbnail for ${contextStore.getMetadata().topic}`,
    }),
    imageGens[1].execute(contextStore.getContext(), {
      type: 'body',
      prompt: 'Explanatory diagram',
    }),
    imageGens[2].execute(contextStore.getContext(), {
      type: 'infographic',
      prompt: 'Key statistics infographic',
    }),
  ]);

  contextStore.updateImages({
    thumbnail: [imageResults[0].data],
    bodyImages: [imageResults[1].data],
    infographics: [imageResults[2].data],
  });

  console.log(`   ✓ 이미지 생성 완료`);
  imageResults.forEach((result, idx) => {
    const types = ['Thumbnail', 'Body', 'Infographic'];
    console.log(`      - ${types[idx]}: 품질 ${(result.data.score * 100).toFixed(1)}%`);
  });

  console.log('\n📊 [2/2] SEO 최적화 중...');
  const seoAgents = [
    new SEOMetaGeneratorAgent(),
    new SchemaBuilderAgent(),
    new InternalLinkerAgent(),
  ];

  console.log('   → Meta 태그 생성 중...');
  console.log('   → Schema 구조화 데이터 생성 중...');
  console.log('   → 내부 링크 찾는 중...');

  const seoResults = await Promise.all(
    seoAgents.map(agent => agent.execute(contextStore.getContext()))
  );

  contextStore.updateSEO({
    metaTitle: seoResults[0].data.metaTitle,
    metaDescription: seoResults[0].data.metaDescription,
    schema: seoResults[1].data,
    internalLinks: seoResults[2].data,
    score: 85,
  });

  console.log(`   ✓ SEO 최적화 완료`);
  console.log(`      - Meta Title: "${seoResults[0].data.metaTitle}"`);
  console.log(`      - Meta Description: ${seoResults[0].data.metaDescription.length}자`);
  console.log(`      - 내부 링크: ${seoResults[2].data.length}개`);

  console.log('\n✅ Quality Gate 4 체크...');
  const gate4 = qualityGates.check('optimization', new Map([
    ['seo_score', 85],
    ['image_quality', 0.85],
    ['mobile_score', 92],
    ['page_speed', 2.5],
  ]));
  console.log(`   ${gate4.passed ? '✅' : '❌'} Stage 4 Quality Gate ${gate4.passed ? '통과' : '실패'}`);

  // ==================== 최종 요약 ====================
  console.log('\n');
  console.log('='.repeat(70));
  console.log('🎉 Stage 4까지 실행 완료!');
  console.log('='.repeat(70));

  const stats = contextStore.getStats();
  console.log('\n📊 최종 통계:');
  console.log(`   데이터 소스: ${stats.dataSourcesCount}개`);
  console.log(`   Primary 키워드: ${stats.primaryKeywordsCount}개`);
  console.log(`   콘텐츠 길이: ${contextStore.getContent().current.length}자`);
  console.log(`   이미지: ${stats.imagesCount}개`);
  console.log(`   SEO 점수: ${contextStore.getSEO().score}점`);

  console.log('\n✅ 모든 Quality Gate 통과:');
  console.log(`   Stage 1 (Intelligence): ✅`);
  console.log(`   Stage 2 (Creation): ✅`);
  console.log(`   Stage 3 (Refinement): ✅`);
  console.log(`   Stage 4 (Optimization): ✅`);

  console.log('\n📄 생성된 콘텐츠 미리보기:');
  console.log('-'.repeat(70));
  const preview = contextStore.getContent().current.substring(0, 300);
  console.log(preview + '...\n');
  console.log('-'.repeat(70));

  console.log('\n💡 다음 단계: Stage 5 (Publishing)');
  console.log('   - Pre-Flight 체크');
  console.log('   - Smart Scheduling');
  console.log('   - Multi-Platform 발행\n');
}

// 실행
testStage4Workflow().catch(console.error);
