/**
 * Quality Gates
 * 각 단계마다 품질 기준을 통과해야 다음으로 진행
 */

import type {
  WorkflowStage,
  QualityGateConfig,
  QualityGateResult,
} from '../types/index.js';

export class QualityGateSystem {
  private gates: Map<WorkflowStage, QualityGateConfig>;

  constructor() {
    this.gates = new Map();
    this.initializeDefaultGates();
  }

  /**
   * 기본 게이트 초기화
   */
  private initializeDefaultGates(): void {
    // Stage 1: Intelligence
    this.gates.set('intelligence', {
      stage: 'intelligence',
      requirements: new Map([
        ['min_data_sources', 3],
        ['keyword_confidence', 0.7],
        ['data_quality_score', 0.8],
      ]),
      strictMode: true,
    });

    // Stage 2: Creation
    this.gates.set('creation', {
      stage: 'creation',
      requirements: new Map([
        ['coherence_score', 0.85],
        ['readability_score', 70],
        ['plagiarism_threshold', 0.05], // 5% 미만
        ['min_word_count', 100], // 시뮬레이션용 낮춤
      ]),
      strictMode: true,
    });

    // Stage 3: Refinement
    this.gates.set('refinement', {
      stage: 'refinement',
      requirements: new Map([
        ['review_consensus', 0.67], // 2/3
        ['final_score', 85],
        ['grammar_errors', 0],
        ['fact_check_pass', 1.0],
      ]),
      strictMode: true,
    });

    // Stage 4: Optimization
    this.gates.set('optimization', {
      stage: 'optimization',
      requirements: new Map([
        ['seo_score', 80],
        ['image_quality', 0.8],
        ['mobile_score', 90],
        ['page_speed', 3], // 3초 이내
      ]),
      strictMode: true,
    });

    // Stage 5: Publishing
    this.gates.set('publishing', {
      stage: 'publishing',
      requirements: new Map([
        ['checklist_pass_rate', 1.0], // 100%
        ['all_platforms_ready', 1.0],
        ['backup_completed', 1.0],
      ]),
      strictMode: true,
    });
  }

  /**
   * 게이트 체크
   */
  check(
    stage: WorkflowStage,
    metrics: Map<string, number>
  ): QualityGateResult {
    const gateConfig = this.gates.get(stage);

    if (!gateConfig) {
      throw new Error(`No quality gate defined for stage: ${stage}`);
    }

    const requirements = gateConfig.requirements;
    const failedChecks: Array<{
      metric: string;
      required: number;
      actual: number;
    }> = [];

    // 모든 요구사항 검증
    for (const [metric, threshold] of requirements) {
      const actualValue = metrics.get(metric);

      if (actualValue === undefined) {
        failedChecks.push({
          metric,
          required: threshold,
          actual: 0,
        });
        continue;
      }

      // 역방향 체크 (plagiarism, page_speed 등)
      const isReverse = this.isReverseMetric(metric);

      const passed = isReverse
        ? actualValue <= threshold
        : actualValue >= threshold;

      if (!passed) {
        failedChecks.push({
          metric,
          required: threshold,
          actual: actualValue,
        });
      }
    }

    // strict mode: 모든 요구사항 통과 필요
    if (gateConfig.strictMode && failedChecks.length > 0) {
      const firstFail = failedChecks[0];
      return {
        passed: false,
        failedMetric: firstFail.metric,
        required: firstFail.required,
        actual: firstFail.actual,
        allMetrics: metrics,
      };
    }

    // non-strict mode: 일부 실패 허용 가능
    if (!gateConfig.strictMode) {
      const passRate =
        (requirements.size - failedChecks.length) / requirements.size;
      if (passRate < 0.8) {
        // 80% 이상 통과 필요
        return {
          passed: false,
          failedMetric: `Pass rate too low: ${passRate.toFixed(2)}`,
          allMetrics: metrics,
        };
      }
    }

    return {
      passed: true,
      allMetrics: metrics,
    };
  }

  /**
   * 역방향 메트릭 판단 (낮을수록 좋은 메트릭)
   */
  private isReverseMetric(metric: string): boolean {
    const reverseMetrics = [
      'plagiarism_threshold',
      'page_speed',
      'grammar_errors',
      'bounce_rate',
    ];
    return reverseMetrics.includes(metric);
  }

  /**
   * 게이트 설정 업데이트
   */
  updateGate(stage: WorkflowStage, config: Partial<QualityGateConfig>): void {
    const existing = this.gates.get(stage);
    if (!existing) {
      throw new Error(`Gate not found for stage: ${stage}`);
    }

    this.gates.set(stage, {
      ...existing,
      ...config,
      requirements: config.requirements || existing.requirements,
    });
  }

  /**
   * 요구사항 추가
   */
  addRequirement(
    stage: WorkflowStage,
    metric: string,
    threshold: number
  ): void {
    const gate = this.gates.get(stage);
    if (!gate) {
      throw new Error(`Gate not found for stage: ${stage}`);
    }

    gate.requirements.set(metric, threshold);
  }

  /**
   * 요구사항 제거
   */
  removeRequirement(stage: WorkflowStage, metric: string): void {
    const gate = this.gates.get(stage);
    if (!gate) {
      throw new Error(`Gate not found for stage: ${stage}`);
    }

    gate.requirements.delete(metric);
  }

  /**
   * 게이트 정보 조회
   */
  getGate(stage: WorkflowStage): QualityGateConfig | undefined {
    return this.gates.get(stage);
  }

  /**
   * 모든 게이트 조회
   */
  getAllGates(): Map<WorkflowStage, QualityGateConfig> {
    return new Map(this.gates);
  }
}

/**
 * Quality Checklist
 */
export class QualityChecklist {
  private items: Map<string, ChecklistItem>;

  constructor() {
    this.items = new Map();
    this.initializeChecklist();
  }

  /**
   * 체크리스트 초기화
   */
  private initializeChecklist(): void {
    // Content Quality
    this.addItem('readability_70', '가독성 점수 70 이상', 'content');
    this.addItem('plagiarism_5', '표절률 5% 미만', 'content');
    this.addItem('fact_check', '사실 검증 완료', 'content');
    this.addItem('review_approval', '2명 이상 리뷰어 승인', 'content');
    this.addItem('keyword_density', '키워드 밀도 1-3%', 'content');
    this.addItem('grammar', '문법/맞춤법 오류 0개', 'content');

    // SEO Quality
    this.addItem('meta_title', '메타 제목 50-60자', 'seo');
    this.addItem('meta_desc', '메타 설명 150-160자', 'seo');
    this.addItem('h1_tag', 'H1 태그 1개', 'seo');
    this.addItem('h2_tags', 'H2 태그 3개 이상', 'seo');
    this.addItem('img_alt', '이미지 Alt 텍스트 모두 설정', 'seo');
    this.addItem('internal_links', '내부 링크 3개 이상', 'seo');
    this.addItem('structured_data', '구조화 데이터 적용', 'seo');

    // Technical Quality
    this.addItem('links_valid', '모든 링크 유효', 'technical');
    this.addItem('images_load', '이미지 로딩 정상', 'technical');
    this.addItem('mobile_responsive', '모바일 반응형 확인', 'technical');
    this.addItem('page_speed', '페이지 로딩 속도 3초 이내', 'technical');
    this.addItem('accessibility', 'WCAG 접근성 기준 충족', 'technical');

    // Visual Quality
    this.addItem('thumbnail', '썸네일 이미지 최적 크기', 'visual');
    this.addItem('image_compression', '이미지 압축 완료', 'visual');
    this.addItem('layout', '레이아웃 깨짐 없음', 'visual');
    this.addItem('font_consistency', '폰트 일관성', 'visual');
    this.addItem('color_contrast', '색상 대비 충분', 'visual');

    // Platform Ready
    this.addItem('api_auth', 'API 인증 완료', 'platform');
    this.addItem('publish_permission', '발행 권한 확인', 'platform');
    this.addItem('backup', '백업 완료', 'platform');
    this.addItem('rollback_plan', '롤백 계획 수립', 'platform');
  }

  /**
   * 체크리스트 항목 추가
   */
  addItem(id: string, description: string, category: string): void {
    this.items.set(id, {
      id,
      description,
      category,
      checked: false,
    });
  }

  /**
   * 항목 체크
   */
  check(id: string): void {
    const item = this.items.get(id);
    if (item) {
      item.checked = true;
    }
  }

  /**
   * 항목 체크 해제
   */
  uncheck(id: string): void {
    const item = this.items.get(id);
    if (item) {
      item.checked = false;
    }
  }

  /**
   * 통과율 계산
   */
  getPassRate(category?: string): number {
    const items = category
      ? Array.from(this.items.values()).filter(
          (item) => item.category === category
        )
      : Array.from(this.items.values());

    if (items.length === 0) return 0;

    const checkedCount = items.filter((item) => item.checked).length;
    return checkedCount / items.length;
  }

  /**
   * 모든 항목 통과 확인
   */
  allPassed(): boolean {
    return this.getPassRate() === 1.0;
  }

  /**
   * 미통과 항목 조회
   */
  getFailedItems(): ChecklistItem[] {
    return Array.from(this.items.values()).filter((item) => !item.checked);
  }

  /**
   * 리셋
   */
  reset(): void {
    this.items.forEach((item) => {
      item.checked = false;
    });
  }

  /**
   * 체크리스트 요약
   */
  getSummary(): ChecklistSummary {
    const total = this.items.size;
    const checked = Array.from(this.items.values()).filter(
      (item) => item.checked
    ).length;

    return {
      total,
      checked,
      passRate: checked / total,
      failedItems: this.getFailedItems(),
    };
  }
}

// ==================== 인터페이스 ====================

interface ChecklistItem {
  id: string;
  description: string;
  category: string;
  checked: boolean;
}

interface ChecklistSummary {
  total: number;
  checked: number;
  passRate: number;
  failedItems: ChecklistItem[];
}
