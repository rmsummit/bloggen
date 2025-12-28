# 🏛️ 시스템 아키텍처

## 설계 철학

### 핵심 원칙

1. **병렬 처리 (Parallelization)**
   - 독립적인 작업은 동시 실행
   - 의존성이 있는 작업만 순차 실행
   - 전체 실행 시간 69% 단축

2. **다층 검증 (Multi-Layer Validation)**
   - 자동 검증 → AI 리뷰 → 최종 검수
   - 각 층에서 다른 관점으로 품질 확인
   - False positive 최소화

3. **합의 알고리즘 (Consensus Algorithm)**
   - 여러 에이전트의 독립적 판단
   - 가중치 기반 투표
   - 신뢰도 임계값 이상만 채택

4. **피드백 루프 (Feedback Loop)**
   - 발행 후 성과 데이터 수집
   - 패턴 분석 및 인사이트 도출
   - 시스템 파라미터 자동 조정

5. **컨텍스트 공유 (Context Sharing)**
   - 중앙 저장소로 모든 정보 공유
   - 에이전트 간 중복 작업 방지
   - 버전 관리 및 롤백 가능

6. **점진적 개선 (Progressive Enhancement)**
   - 각 Stage마다 품질 향상
   - Quality Gate로 품질 보장
   - 실패 시 자동 재시도

## 컴포넌트 상세

### 1. Master Orchestrator

**역할**: 전체 워크플로우 총괄

```typescript
class MasterOrchestrator {
  - contextStore: SharedContextStore
  - consensusProtocol: ConsensusProtocol
  - qualityGates: QualityGateSystem
  - config: WorkflowConfig

  + execute(): Promise<void>
  + runStage1Intelligence(): Promise<void>
  + runStage2Creation(): Promise<void>
  + runStage3Refinement(): Promise<void>
  + runStage4Optimization(): Promise<void>
  + runStage5Publishing(): Promise<void>
}
```

**책임**:
- 각 Stage 순차 실행
- Quality Gate 체크
- 에러 처리 및 재시도
- 최종 결과 취합

### 2. Shared Context Store

**역할**: 모든 에이전트가 접근하는 중앙 데이터 저장소

```typescript
class SharedContextStore {
  - context: SharedContext
  - subscribers: Map<string, Set<ContextSubscriber>>
  - history: ContextSnapshot[]

  + getContext(): Readonly<SharedContext>
  + updateData(update: Partial<DataCollection>): void
  + updateKeywords(update: Partial<KeywordAnalysis>): void
  + subscribe(key: string, subscriber: ContextSubscriber): void
  + rollback(steps: number): boolean
}
```

**기능**:
- 데이터 읽기/쓰기
- 구독/알림 시스템
- 히스토리 관리 (최대 50개)
- 롤백 지원
- 동시성 제어

**데이터 구조**:
```
SharedContext
├── metadata (콘텐츠 메타정보)
├── data (수집된 데이터)
├── keywords (키워드 분석 결과)
├── style (스타일 가이드)
├── content (콘텐츠 버전들)
├── images (생성된 이미지들)
├── seo (SEO 데이터)
├── feedback (피드백 데이터)
└── analytics (분석 데이터)
```

### 3. Consensus Protocol

**역할**: 여러 에이전트의 의견 합의

```typescript
class ConsensusProtocol {
  - config: ConsensusConfig

  + reachConsensus<T>(
      agents: Agent[],
      context: SharedContext,
      task: any,
      extractor: (result: any) => T
    ): Promise<ConsensusResult<T>>

  - calculateAgreement<T>(results: ParticipantResult<T>[]): number
  - deliberationRound(...): Promise<any>
  - mediatorDecision<T>(...): Promise<T>
}
```

**알고리즘**:

1. **Round 1**: 모든 에이전트 독립 실행
2. **합의 점수 계산**:
   ```
   agreement_score = 동일한 결과의 최대 빈도 / 전체 에이전트 수

   가중치 적용 시:
   agreement_score = 동일 결과의 가중치 합 / 전체 가중치 합
   ```
3. **임계값 체크**: score >= threshold이면 합의 성공
4. **Round 2~N**: 토론 컨텍스트 공유 후 재실행
5. **최종**: 합의 실패 시 중재자(Mediator) 결정

**예시**:
```typescript
// 키워드 합의
const result = await consensus.reachConsensus(
  [tfidfAnalyzer, trendAnalyzer, competitionAnalyzer],
  context,
  task,
  (r) => r.keywords  // extractor
);

if (result.agreed) {
  // result.result 사용
  // result.agreementScore로 신뢰도 확인
}
```

### 4. Quality Gate System

**역할**: 각 Stage의 품질 기준 검증

```typescript
class QualityGateSystem {
  - gates: Map<WorkflowStage, QualityGateConfig>

  + check(stage: WorkflowStage, metrics: Map<string, number>): QualityGateResult
  + updateGate(stage: WorkflowStage, config: Partial<QualityGateConfig>): void
  + addRequirement(stage: WorkflowStage, metric: string, threshold: number): void
}
```

**기본 Gate 설정**:

```yaml
Stage 1 (Intelligence):
  min_data_sources: 3
  keyword_confidence: 0.7
  data_quality_score: 0.8

Stage 2 (Creation):
  coherence_score: 0.85
  readability_score: 70
  plagiarism_threshold: 0.05  # 5% 미만
  min_word_count: 500

Stage 3 (Refinement):
  review_consensus: 0.67  # 2/3
  final_score: 85
  grammar_errors: 0
  fact_check_pass: 1.0

Stage 4 (Optimization):
  seo_score: 80
  image_quality: 0.8
  mobile_score: 90
  page_speed: 3  # 초

Stage 5 (Publishing):
  checklist_pass_rate: 1.0  # 100%
  all_platforms_ready: 1.0
  backup_completed: 1.0
```

**Strict Mode**:
- `true`: 모든 요구사항 필수 통과
- `false`: 80% 이상 통과로 완화

### 5. Base Agent

**역할**: 모든 에이전트의 기본 클래스

```typescript
abstract class BaseAgent implements Agent {
  + id: string
  + name: string
  + type: string
  + status: AgentStatus
  # config: AgentConfig

  + abstract execute(context: SharedContext, params?: any): Promise<AgentResult>
  + run(context: SharedContext, params?: any): Promise<AgentResult>
  # sleep(ms: number): Promise<void>
  # log(message: string, data?: any): void
}
```

**기능**:
- 타임아웃 처리
- 자동 재시도 (지수 백오프)
- 로깅
- 에러 핸들링

**구현 예시**:
```typescript
class MyAgent extends BaseAgent {
  constructor() {
    super('my-agent', 'My Agent', 'custom');
  }

  async execute(context: SharedContext): Promise<AgentResult> {
    // 로직
    return {
      success: true,
      data: { ... },
      metrics: { ... },
      executionTime: 0,
    };
  }
}
```

## 데이터 흐름

### Stage 1 → Stage 2

```
[Stage 1 Output]
  ↓
data.sources (수집된 데이터)
data.qualityScore (품질 점수)
keywords.primary (주요 키워드)
keywords.secondary (보조 키워드)
style.tone (톤)
style.formality (격식)
  ↓
[Stage 2 Input]
  ↓
Content Planner가 구조 설계
Writers가 섹션별 작성
```

### Stage 2 → Stage 3

```
[Stage 2 Output]
  ↓
content.current (현재 콘텐츠)
content.metadata.sections (섹션들)
  ↓
[Stage 3 Input]
  ↓
Reviewers가 평가
Editor가 수정
```

### Stage 3 → Stage 4

```
[Stage 3 Output]
  ↓
content.current (최종 콘텐츠)
feedback.reviews (리뷰 결과)
  ↓
[Stage 4 Input]
  ↓
Image Generators가 이미지 생성
SEO Optimizers가 메타 태그 생성
```

### Stage 4 → Stage 5

```
[Stage 4 Output]
  ↓
images.selected (선택된 이미지)
seo.metaTitle (메타 제목)
seo.metaDescription (메타 설명)
seo.schema (구조화 데이터)
  ↓
[Stage 5 Input]
  ↓
Pre-Flight Checker가 검증
Publishers가 발행
```

## 확장성

### 새 Stage 추가

```typescript
// 1. Orchestrator에 메서드 추가
private async runStage6Analytics(): Promise<void> {
  // 로직
}

// 2. execute()에서 호출
async execute(): Promise<void> {
  await this.runStage1Intelligence();
  // ...
  await this.runStage6Analytics();
}

// 3. Quality Gate 추가
qualityGates.set('analytics', {
  stage: 'analytics',
  requirements: new Map([...]),
  strictMode: true,
});
```

### 새 에이전트 타입 추가

```typescript
// 1. 에이전트 구현
export class NewAgent extends BaseAgent {
  // ...
}

// 2. Stage에서 사용
const newAgent = new NewAgent();
const result = await newAgent.execute(context);

// 3. Consensus에 포함 (필요시)
await consensus.reachConsensus(
  [...existingAgents, newAgent],
  context,
  task,
  extractor
);
```

## 성능 고려사항

### 병렬 처리 제한

```typescript
parallelExecution: {
  enabled: true,
  maxWorkers: 10,      // 동시 실행 최대 개수
  timeout: 300000      // 5분
}
```

### 캐싱 전략

```typescript
class IntelligentCache {
  cache_rules = {
    'keyword_analysis': {
      ttl: 3600 * 24,  // 24시간
      invalidate_on: ['new_trend_data']
    },
    'scraped_content': {
      ttl: 3600 * 6,   // 6시간
    }
  }
}
```

### 리소스 할당

```typescript
priorities = {
  'content_writer': 0.3,    // 30% 리소스
  'reviewer': 0.2,          // 20% 리소스
  'data_collector': 0.15,   // 15% 리소스
  // ...
}
```

## 에러 처리

### 재시도 전략

```typescript
// BaseAgent의 run() 메서드
while (attempts < this.config.retries) {
  try {
    return await this.execute(context, params);
  } catch (error) {
    attempts++;
    if (attempts < retries) {
      await this.sleep(1000 * attempts);  // 지수 백오프
    }
  }
}
```

### Quality Gate 실패

```typescript
if (!gateResult.passed) {
  if (config.qualityGates.autoRetry) {
    // 자동 재시도
  } else if (config.qualityGates.strictMode) {
    throw new Error(...);  // 즉시 중단
  } else {
    // 경고만 출력하고 계속
  }
}
```

## 모니터링

### 메트릭 수집

각 에이전트는 실행 메트릭 반환:

```typescript
interface AgentResult {
  success: boolean;
  data: any;
  errors?: string[];
  metrics: Record<string, number>;  // ← 메트릭
  executionTime: number;             // ← 실행 시간
}
```

### 로깅

```typescript
// BaseAgent의 log() 메서드
[2024-01-15T10:30:45.123Z] [Web Scraper] Starting web scraping...
[2024-01-15T10:30:47.456Z] [Web Scraper] Collected 5 sources
```

### 컨텍스트 통계

```typescript
const stats = contextStore.getStats();
// {
//   dataSourcesCount: 15,
//   primaryKeywordsCount: 5,
//   contentVersionsCount: 3,
//   imagesCount: 7,
//   reviewsCount: 3,
//   historySize: 12
// }
```

---

**이 아키텍처는 확장 가능하고, 유지보수 가능하며, 고품질 콘텐츠를 자동 생성하도록 설계되었습니다.**
