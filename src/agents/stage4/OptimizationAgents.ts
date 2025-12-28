/**
 * Stage 4: Optimization Agents
 * SEO 및 이미지 최적화
 */

import { BaseAgent } from '../../core/BaseAgent.js';
import type { SharedContext, AgentResult, GeneratedImage, SEOData } from '../../types/index.js';

/**
 * Image Generator
 */
export class ImageGeneratorAgent extends BaseAgent {
  constructor(generatorId: string) {
    super(`image-gen-${generatorId}`, `Image Generator ${generatorId}`, 'image-generator');
  }

  async execute(
    context: SharedContext,
    params?: { type: 'thumbnail' | 'body' | 'infographic'; prompt: string }
  ): Promise<AgentResult> {
    this.log(`Generating ${params?.type} image...`);

    const type = params?.type || 'thumbnail';
    const prompt = params?.prompt || `Image for ${context.metadata.topic}`;

    const image: GeneratedImage = {
      id: `img-${Date.now()}-${Math.random()}`,
      url: `https://example.com/generated/${type}/${Date.now()}.jpg`,
      type,
      prompt,
      style: 'modern',
      score: 0.8 + Math.random() * 0.2,
      optimized: false,
      alt: prompt,
      width: type === 'thumbnail' ? 1200 : 800,
      height: type === 'thumbnail' ? 630 : 600,
    };

    return {
      success: true,
      data: image,
      metrics: {
        quality_score: image.score,
      },
      executionTime: 0,
    };
  }
}

/**
 * SEO Meta Generator
 */
export class SEOMetaGeneratorAgent extends BaseAgent {
  constructor() {
    super('seo-meta-generator', 'SEO Meta Generator', 'seo');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Generating SEO meta tags...');

    const { topic } = context.metadata;
    const primaryKeyword = context.keywords.primary[0]?.term || topic;

    const metaTitle = this.generateMetaTitle(topic, primaryKeyword);
    const metaDescription = this.generateMetaDescription(topic, context);

    return {
      success: true,
      data: {
        metaTitle,
        metaDescription,
      },
      metrics: {
        title_length: metaTitle.length,
        description_length: metaDescription.length,
      },
      executionTime: 0,
    };
  }

  private generateMetaTitle(topic: string, keyword: string): string {
    return `${keyword}: 완벽 가이드 | 2024년 최신`;
  }

  private generateMetaDescription(topic: string, context: SharedContext): string {
    const keywords = context.keywords.primary.slice(0, 3).map((k) => k.term).join(', ');
    return `${topic}에 대한 완벽한 가이드. ${keywords}를 포함한 모든 것을 알아보세요.`;
  }
}

/**
 * Schema Builder
 */
export class SchemaBuilderAgent extends BaseAgent {
  constructor() {
    super('schema-builder', 'Schema Builder', 'seo');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Building structured data schema...');

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: context.content.metadata.title,
      description: context.seo.metaDescription,
      author: {
        '@type': 'Organization',
        name: 'Your Blog Name',
      },
      datePublished: new Date().toISOString(),
      image: context.images.selected.get('thumbnail') || '',
    };

    return {
      success: true,
      data: schema,
      metrics: {},
      executionTime: 0,
    };
  }
}

/**
 * Internal Linker
 */
export class InternalLinkerAgent extends BaseAgent {
  constructor() {
    super('internal-linker', 'Internal Linker', 'seo');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Finding internal link opportunities...');

    const content = context.content.current;
    const links = this.findInternalLinks(content, context);

    return {
      success: true,
      data: links,
      metrics: {
        links_found: links.length,
      },
      executionTime: 0,
    };
  }

  private findInternalLinks(content: string, context: SharedContext): string[] {
    // 시뮬레이션: 관련 내부 링크 찾기
    const topic = context.metadata.topic;
    return [
      `/blog/${topic}-basics`,
      `/blog/${topic}-advanced`,
      `/blog/related-topic`,
    ];
  }
}
