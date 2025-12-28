/**
 * Stage 3: Refinement Agents
 * 콘텐츠 정제 및 개선
 */

import { BaseAgent } from '../../core/BaseAgent.js';
import type { SharedContext, AgentResult, Review } from '../../types/index.js';

/**
 * AI Reviewer Agent
 */
export class ReviewerAgent extends BaseAgent {
  constructor(reviewerId: string, focus: string) {
    super(`reviewer-${reviewerId}`, `Reviewer ${reviewerId} (${focus})`, 'reviewer');
    this.config.temperature = 0.3; // 낮은 temperature for consistent reviews
  }

  async execute(
    context: SharedContext,
    params?: { content: string }
  ): Promise<AgentResult> {
    this.log('Reviewing content...');

    const content = params?.content || context.content.current;

    // 리뷰 수행
    const review = this.performReview(content, context);

    return {
      success: true,
      data: review,
      metrics: {
        score: review.score,
        approved: review.approved ? 1 : 0,
      },
      executionTime: 0,
    };
  }

  private performReview(content: string, context: SharedContext): Review {
    const score = 85 + Math.random() * 10;
    const approved = score >= 85;

    return {
      reviewer: this.id,
      score,
      approved,
      comments: approved
        ? ['구조가 논리적입니다', '키워드가 적절하게 배치되었습니다']
        : ['일부 섹션의 논리적 흐름 개선 필요', '예시 추가가 필요합니다'],
      suggestedChanges: approved
        ? []
        : ['3번 섹션에 사례 연구 추가', '결론 부분 강화'],
      timestamp: new Date(),
    };
  }
}

/**
 * Grammar Checker
 */
export class GrammarCheckerAgent extends BaseAgent {
  constructor() {
    super('grammar-checker', 'Grammar Checker', 'checker');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Checking grammar and spelling...');

    const content = context.content.current;
    const errors = this.findGrammarErrors(content);

    return {
      success: true,
      data: errors,
      metrics: {
        error_count: errors.length,
        error_density: errors.length / content.length,
      },
      executionTime: 0,
    };
  }

  private findGrammarErrors(content: string): any[] {
    // 시뮬레이션
    return Math.random() > 0.9
      ? [{ position: 120, message: '띄어쓰기 오류', suggestion: '수정안' }]
      : [];
  }
}

/**
 * Readability Analyzer
 */
export class ReadabilityAnalyzerAgent extends BaseAgent {
  constructor() {
    super('readability-analyzer', 'Readability Analyzer', 'analyzer');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Analyzing readability...');

    const content = context.content.current;
    const score = this.calculateReadability(content);

    return {
      success: true,
      data: { score },
      metrics: {
        readability_score: score,
      },
      executionTime: 0,
    };
  }

  private calculateReadability(content: string): number {
    // Flesch Reading Ease 스타일 점수
    return 70 + Math.random() * 20;
  }
}

/**
 * Plagiarism Checker
 */
export class PlagiarismCheckerAgent extends BaseAgent {
  constructor() {
    super('plagiarism-checker', 'Plagiarism Checker', 'checker');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    this.log('Checking for plagiarism...');

    const content = context.content.current;
    const plagiarismRate = this.checkPlagiarism(content);

    return {
      success: true,
      data: { plagiarismRate },
      metrics: {
        plagiarism_rate: plagiarismRate,
      },
      executionTime: 0,
    };
  }

  private checkPlagiarism(content: string): number {
    // 시뮬레이션: 대부분 낮은 표절률
    return Math.random() * 0.03; // 0-3%
  }
}

/**
 * Editor Agent
 * 피드백을 반영하여 콘텐츠 수정
 */
export class EditorAgent extends BaseAgent {
  constructor() {
    super('editor', 'Editor', 'editor');
  }

  async execute(
    context: SharedContext,
    params?: { feedback: string[] }
  ): Promise<AgentResult> {
    this.log('Editing content based on feedback...');

    const content = context.content.current;
    const feedback = params?.feedback || [];

    // 피드백 반영
    const editedContent = this.applyFeedback(content, feedback);

    return {
      success: true,
      data: editedContent,
      metrics: {
        changes_applied: feedback.length,
      },
      executionTime: 0,
    };
  }

  private applyFeedback(content: string, feedback: string[]): string {
    // 시뮬레이션: 피드백 반영
    let edited = content;

    feedback.forEach((fb) => {
      // 실제로는 AI가 피드백을 이해하고 수정
      edited += `\n\n[${fb}에 대한 수정 적용됨]`;
    });

    return edited;
  }
}
