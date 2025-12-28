#!/usr/bin/env node
/**
 * Multi-Agent Blog Automation System
 * Entry Point
 */

import { MasterOrchestrator } from './core/MasterOrchestrator.js';
import { ConfigLoader } from './utils/ConfigLoader.js';
import type { ContentMetadata } from './types/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Multi-Agent Blog Automation Workflow System v1.0       ║');
  console.log('║   Advanced AI-Powered Content Creation Pipeline          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // 설정 로드
  const configPath = join(__dirname, '../config/workflow.yaml');
  let config;

  try {
    config = ConfigLoader.loadFromYaml(configPath);
    console.log('✅ Configuration loaded from:', configPath);
  } catch (error) {
    console.log('⚠️  Configuration file not found, using default config');
    config = ConfigLoader.getDefaultConfig();
  }

  // 콘텐츠 메타데이터 생성 (예제)
  const metadata: ContentMetadata = {
    id: `blog-${Date.now()}`,
    topic: '리테일 AI 활용',
    targetAudience: '스타트업 CEO 및 마케터',
    targetQuality: 'premium',
    category: 'technology',
    targetLength: 2000,
    urgent: false,
    requiresFactCheck: true,
    platforms: ['tistory', 'naver', 'wordpress'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('');
  console.log('📋 Content Metadata:');
  console.log(`   Topic: ${metadata.topic}`);
  console.log(`   Target Audience: ${metadata.targetAudience}`);
  console.log(`   Quality Level: ${metadata.targetQuality}`);
  console.log(`   Target Length: ${metadata.targetLength} words`);
  console.log(`   Platforms: ${metadata.platforms.join(', ')}`);
  console.log('');

  // Orchestrator 생성 및 실행
  const orchestrator = new MasterOrchestrator(metadata, config);

  try {
    await orchestrator.execute();

    console.log('\n🎉 Success! Blog post has been created and published.');
    console.log('');

    // 최종 컨텍스트 정보 출력
    const finalContext = orchestrator.getContextStore().getContext();

    console.log('📄 Final Content Preview:');
    console.log('-'.repeat(60));
    const preview = finalContext.content.current.substring(0, 200);
    console.log(preview + '...');
    console.log('-'.repeat(60));

    console.log('');
    console.log('🔗 Published URLs:');
    // 실제 구현에서는 발행 결과에서 URL 추출
    console.log('   - Tistory: https://yourblog.tistory.com/123');
    console.log('   - Naver: https://blog.naver.com/yourid/123456');
    console.log('   - WordPress: https://yourblog.com/post/slug');

    console.log('');
    console.log('✨ Done!');
  } catch (error) {
    console.error('\n❌ Error during execution:', error);
    process.exit(1);
  }
}

// CLI 인자 파싱 (향후 확장)
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: bloggen [options]

Options:
  --topic <topic>           Blog topic
  --audience <audience>     Target audience
  --quality <level>         Quality level (basic|standard|premium)
  --config <path>           Path to config file
  --help, -h                Show help

Examples:
  bloggen --topic "AI in Retail" --audience "Marketers" --quality premium
  bloggen --config ./my-config.yaml
  `);
  process.exit(0);
}

// 실행
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { MasterOrchestrator, ConfigLoader };
