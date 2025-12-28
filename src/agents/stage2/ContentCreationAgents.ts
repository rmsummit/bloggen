/**
 * Stage 2: Content Creation Agents
 * 콘텐츠 생성 및 조립
 */

import { BaseAgent } from '../../core/BaseAgent.js';
import type { SharedContext, AgentResult, Section } from '../../types/index.js';

/**
 * Content Planner
 */
export class ContentPlannerAgent extends BaseAgent {
  constructor() {
    super('content-planner', 'Content Planner', 'planner');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Planning content structure...');

    const { topic, targetLength = 2000 } = context.metadata;
    const keywords = context.keywords.primary;
    const style = context.style;

    // 구조 설계
    const title = this.generateTitle(topic, keywords);
    const outline = style.preferredStructure || ['서론', '본론', '결론'];
    const sections = this.createSections(outline, targetLength);

    return {
      success: true,
      data: {
        title,
        outline,
        sections,
      },
      metrics: {
        sections_count: sections.length,
        estimated_length: targetLength,
      },
      executionTime: 0,
    };
  }

  private generateTitle(topic: string, keywords: any[]): string {
    const mainKeyword = keywords[0]?.term || topic;
    return `${mainKeyword}: 완벽 가이드`;
  }

  private createSections(outline: string[], targetLength: number): Section[] {
    const wordsPerSection = Math.floor(targetLength / outline.length);

    return outline.map((title, idx) => ({
      id: `section-${idx}`,
      title,
      content: '',
      status: 'pending' as const,
    }));
  }
}

/**
 * Multi-Writer Agent
 */
export class WriterAgent extends BaseAgent {
  constructor(writerId: string) {
    super(`writer-${writerId}`, `Writer ${writerId}`, 'writer');
  }

  async execute(
    context: SharedContext,
    params?: { section: Section }
  ): Promise<AgentResult> {
    this.log(`Writing section: ${params?.section?.title}`);

    const section = params?.section;
    if (!section) {
      return {
        success: false,
        data: null,
        errors: ['No section provided'],
        metrics: {},
        executionTime: 0,
      };
    }

    // 시뮬레이션: AI 글쓰기
    const content = this.generateContent(section, context);

    return {
      success: true,
      data: {
        ...section,
        content,
        status: 'completed',
      },
      metrics: {
        word_count: content.split(' ').length,
        coherence_score: 0.85 + Math.random() * 0.15,
      },
      executionTime: 0,
    };
  }

  private generateContent(section: Section, context: SharedContext): string {
    const { topic } = context.metadata;
    const keywords = context.keywords.primary.slice(0, 3).map((k) => k.term);

    return `
# ${section.title}

${topic}에 대한 ${section.title} 내용입니다.
이 섹션에서는 ${keywords.join(', ')}에 대해 다룹니다.

[실제 구현에서는 여기에 AI가 생성한 고품질 콘텐츠가 들어갑니다]

주요 포인트:
- 포인트 1
- 포인트 2
- 포인트 3

이를 통해 독자들은 ${topic}에 대한 깊은 이해를 얻을 수 있습니다.
    `.trim();
  }
}

/**
 * Content Assembler
 */
export class ContentAssemblerAgent extends BaseAgent {
  constructor() {
    super('content-assembler', 'Content Assembler', 'assembler');
  }

  async execute(
    context: SharedContext,
    params?: { sections: Section[] }
  ): Promise<AgentResult> {
    this.log('Assembling content sections...');

    const sections = params?.sections || [];
    const title = context.content.metadata.title;

    // 섹션 조립
    const assembledContent = this.assemble(title, sections);

    return {
      success: true,
      data: assembledContent,
      metrics: {
        total_length: assembledContent.length,
        sections_assembled: sections.length,
      },
      executionTime: 0,
    };
  }

  private assemble(title: string, sections: Section[]): string {
    let content = `# ${title}\n\n`;

    sections.forEach((section) => {
      content += section.content + '\n\n';
    });

    return content.trim();
  }
}

/**
 * Coherence Checker
 */
export class CoherenceCheckerAgent extends BaseAgent {
  constructor() {
    super('coherence-checker', 'Coherence Checker', 'checker');
  }

  async execute(
    context: SharedContext,
    params?: { content: string }
  ): Promise<AgentResult> {
    this.log('Checking content coherence...');

    const content = params?.content || context.content.current;

    // 일관성 점수 계산
    const coherenceScore = this.calculateCoherence(content);
    const issues = coherenceScore < 0.85 ? this.findIssues(content) : [];

    return {
      success: true,
      data: {
        coherenceScore,
        issues,
        needsBridging: issues.length > 0,
      },
      metrics: {
        coherence_score: coherenceScore,
        issues_found: issues.length,
      },
      executionTime: 0,
    };
  }

  private calculateCoherence(content: string): number {
    // 간단한 휴리스틱: 섹션 간 연결성 체크
    const sections = content.split('\n\n');

    // 시뮬레이션
    return 0.85 + Math.random() * 0.10;
  }

  private findIssues(content: string): string[] {
    return [
      '섹션 2와 3 사이 전환이 부자연스러움',
      '서론에서 약속한 내용이 본론에서 누락됨',
    ];
  }
}
