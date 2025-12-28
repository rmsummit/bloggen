#!/usr/bin/env node
/**
 * Multi-Agent Blog Automation System
 * 경매 초보자 주제 블로그 생성
 */

import { MasterOrchestrator } from './src/core/MasterOrchestrator.js';
import { ConfigLoader } from './src/utils/ConfigLoader.js';
import type { ContentMetadata } from './src/types/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Multi-Agent Blog Automation Workflow System v1.0       ║');
  console.log('║   경매 초보자 가이드 자동 생성                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // 설정 로드
  const configPath = join(__dirname, 'config/workflow.yaml');
  let config;

  try {
    config = ConfigLoader.loadFromYaml(configPath);
    console.log('✅ Configuration loaded from:', configPath);
  } catch (error) {
    console.log('⚠️  Configuration file not found, using default config');
    config = ConfigLoader.getDefaultConfig();
  }

  // 콘텐츠 메타데이터 생성
  const metadata: ContentMetadata = {
    id: `blog-auction-${Date.now()}`,
    topic: '경매 초보자가 피해야 하는 것',
    targetAudience: '부동산 경매 입문자, 재테크 초보자',
    targetQuality: 'premium',
    category: 'real-estate',
    targetLength: 2500,
    urgent: false,
    requiresFactCheck: true,
    platforms: ['tistory', 'naver', 'velog'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('');
  console.log('📋 콘텐츠 설정:');
  console.log(`   주제: ${metadata.topic}`);
  console.log(`   타겟 독자: ${metadata.targetAudience}`);
  console.log(`   품질 레벨: ${metadata.targetQuality}`);
  console.log(`   목표 길이: ${metadata.targetLength} 단어`);
  console.log(`   발행 플랫폼: ${metadata.platforms.join(', ')}`);
  console.log('');

  // Orchestrator 생성 및 실행
  const orchestrator = new MasterOrchestrator(metadata, config);

  try {
    await orchestrator.execute();

    console.log('\n🎉 성공! 블로그 포스트가 생성되고 발행 준비되었습니다.');
    console.log('');

    // 최종 컨텍스트 정보 출력
    const finalContext = orchestrator.getContextStore().getContext();

    console.log('📄 생성된 콘텐츠 전체:');
    console.log('='.repeat(70));
    console.log(finalContext.content.current);
    console.log('='.repeat(70));

    console.log('');
    console.log('🔑 키워드 분석 결과:');
    console.log(`   Primary 키워드: ${finalContext.keywords.primary.map(k => k.term).join(', ')}`);
    if (finalContext.keywords.secondary.length > 0) {
      console.log(`   Secondary 키워드: ${finalContext.keywords.secondary.slice(0, 5).map(k => k.term).join(', ')}`);
    }

    console.log('');
    console.log('🎨 이미지:');
    console.log(`   Thumbnail: ${finalContext.images.thumbnail.length}개`);
    console.log(`   Body Images: ${finalContext.images.bodyImages.length}개`);
    console.log(`   Infographics: ${finalContext.images.infographics.length}개`);

    console.log('');
    console.log('📊 SEO 정보:');
    console.log(`   Title: ${finalContext.seo.metaTitle}`);
    console.log(`   Description: ${finalContext.seo.metaDescription}`);
    console.log(`   SEO Score: ${finalContext.seo.score}점`);

    console.log('');
    console.log('🔗 발행 예정 URL:');
    console.log('   - Tistory: https://yourblog.tistory.com/[post-id]');
    console.log('   - Naver: https://blog.naver.com/yourid/[post-id]');
    console.log('   - Velog: https://velog.io/@yourid/[post-slug]');

    console.log('');
    console.log('✨ 완료!');
  } catch (error) {
    console.error('\n❌ 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { MasterOrchestrator, ConfigLoader };
