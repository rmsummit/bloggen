/**
 * 사용 예제
 */

import { MasterOrchestrator } from '../src/core/MasterOrchestrator.js';
import { ConfigLoader } from '../src/utils/ConfigLoader.js';
import type { ContentMetadata } from '../src/types/index.js';

async function example1_Basic() {
  console.log('=== Example 1: Basic Usage ===\n');

  // 기본 설정 사용
  const config = ConfigLoader.getDefaultConfig();

  // 콘텐츠 메타데이터
  const metadata: ContentMetadata = {
    id: 'blog-001',
    topic: 'TypeScript 고급 기법',
    targetAudience: '중급 개발자',
    targetQuality: 'standard',
    category: 'programming',
    targetLength: 1500,
    platforms: ['tistory', 'velog'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Orchestrator 생성 및 실행
  const orchestrator = new MasterOrchestrator(metadata, config);
  await orchestrator.execute();

  console.log('\n✅ Example 1 completed!');
}

async function example2_PremiumQuality() {
  console.log('=== Example 2: Premium Quality ===\n');

  // 프리미엄 설정
  const config = ConfigLoader.getDefaultConfig();
  config.qualityLevel = 'premium';
  config.stages.creation.writers = 6; // 더 많은 writer
  config.stages.refinement.reviewers = 5; // 더 많은 reviewer

  const metadata: ContentMetadata = {
    id: 'blog-002',
    topic: 'AI 기반 마케팅 자동화',
    targetAudience: '마케팅 디렉터',
    targetQuality: 'premium',
    category: 'marketing',
    targetLength: 3000,
    requiresFactCheck: true,
    platforms: ['wordpress', 'medium'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orchestrator = new MasterOrchestrator(metadata, config);
  await orchestrator.execute();

  // 결과 확인
  const context = orchestrator.getContextStore().getContext();
  console.log('\n📊 Final Stats:');
  console.log(`  Keywords: ${context.keywords.primary.length} primary`);
  console.log(`  Content Length: ${context.content.current.length} chars`);
  console.log(`  SEO Score: ${context.seo.score}`);

  console.log('\n✅ Example 2 completed!');
}

async function example3_CustomConfig() {
  console.log('=== Example 3: Custom Configuration ===\n');

  // 커스텀 설정
  const config = ConfigLoader.getDefaultConfig();

  // 병렬 처리 비활성화 (순차 실행)
  config.parallelExecution.enabled = false;

  // Quality Gate 완화
  config.qualityGates.strictMode = false;

  // Consensus 임계값 낮춤
  config.consensus.threshold = 0.6;

  const metadata: ContentMetadata = {
    id: 'blog-003',
    topic: '초보자를 위한 React 가이드',
    targetAudience: '프로그래밍 초보자',
    targetQuality: 'basic',
    category: 'tutorial',
    targetLength: 1000,
    platforms: ['tistory'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orchestrator = new MasterOrchestrator(metadata, config);
  await orchestrator.execute();

  console.log('\n✅ Example 3 completed!');
}

async function example4_ContextInspection() {
  console.log('=== Example 4: Context Inspection ===\n');

  const config = ConfigLoader.getDefaultConfig();
  const metadata: ContentMetadata = {
    id: 'blog-004',
    topic: 'Node.js 성능 최적화',
    targetAudience: '백엔드 개발자',
    targetQuality: 'standard',
    category: 'backend',
    platforms: ['dev.to'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orchestrator = new MasterOrchestrator(metadata, config);
  const contextStore = orchestrator.getContextStore();

  // 컨텍스트 변경 구독
  contextStore.subscribe('keywords', {
    onUpdate(key, data) {
      console.log(`\n🔔 ${key} updated!`);
      console.log(`  Primary Keywords: ${data.primary.length}`);
    },
  });

  contextStore.subscribe('content', {
    onUpdate(key, data) {
      console.log(`\n🔔 ${key} updated!`);
      console.log(`  Content Length: ${data.current.length} chars`);
      console.log(`  Versions: ${data.versions.length}`);
    },
  });

  await orchestrator.execute();

  // 최종 통계
  const stats = contextStore.getStats();
  console.log('\n📊 Final Context Stats:');
  console.log(JSON.stringify(stats, null, 2));

  console.log('\n✅ Example 4 completed!');
}

async function example5_ErrorHandling() {
  console.log('=== Example 5: Error Handling ===\n');

  const config = ConfigLoader.getDefaultConfig();

  // 재시도 설정
  config.qualityGates.autoRetry = true;
  config.qualityGates.maxRetries = 3;

  const metadata: ContentMetadata = {
    id: 'blog-005',
    topic: 'Kubernetes 배포 전략',
    targetAudience: 'DevOps 엔지니어',
    targetQuality: 'premium',
    category: 'devops',
    requiresFactCheck: true,
    platforms: ['hashnode', 'dev.to'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orchestrator = new MasterOrchestrator(metadata, config);

  try {
    await orchestrator.execute();
    console.log('\n✅ Success!');
  } catch (error) {
    console.error('\n❌ Error occurred:', error);

    // 롤백
    const contextStore = orchestrator.getContextStore();
    const rollbackSuccess = contextStore.rollback(1);

    if (rollbackSuccess) {
      console.log('✅ Rolled back to previous state');
    }
  }

  console.log('\n✅ Example 5 completed!');
}

// 실행
async function runExamples() {
  console.log('🚀 Running Examples...\n');

  // 원하는 예제 선택
  // await example1_Basic();
  // await example2_PremiumQuality();
  // await example3_CustomConfig();
  // await example4_ContextInspection();
  // await example5_ErrorHandling();

  console.log('\n🎉 All examples completed!');
}

// CLI에서 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export {
  example1_Basic,
  example2_PremiumQuality,
  example3_CustomConfig,
  example4_ContextInspection,
  example5_ErrorHandling,
};
