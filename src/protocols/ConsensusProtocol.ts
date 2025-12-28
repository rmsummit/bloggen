/**
 * Consensus Protocol
 * 여러 에이전트의 의견을 합의하는 프로토콜
 */

import type {
  Agent,
  SharedContext,
  ConsensusConfig,
  ConsensusResult,
  ParticipantResult,
} from '../types/index.js';

export class ConsensusProtocol {
  private config: ConsensusConfig;

  constructor(config: Partial<ConsensusConfig> = {}) {
    this.config = {
      threshold: config.threshold || 0.7,
      maxRounds: config.maxRounds || 3,
      mediator: config.mediator || 'claude-sonnet-4',
      votingWeights: config.votingWeights || new Map(),
    };
  }

  /**
   * 합의 도출
   */
  async reachConsensus<T>(
    agents: Agent[],
    context: SharedContext,
    task: any,
    extractor: (result: any) => T
  ): Promise<ConsensusResult<T>> {
    let round = 0;
    let deliberationContext: any = null;
    let results: any[] = [];

    while (round < this.config.maxRounds) {
      round++;
      console.log(`\n=== Consensus Round ${round} ===`);

      // 1단계: 모든 에이전트 병렬 실행
      results = await this.parallelExecute(
        agents,
        context,
        deliberationContext
      );

      // 2단계: 결과 추출 및 분석
      const participantResults: ParticipantResult<T>[] = results.map(
        (r) => ({
          agentId: r.agentId,
          result: extractor(r.data),
          confidence: r.confidence || 0.8,
          reasoning: r.reasoning,
        })
      );

      // 3단계: 합의 점수 계산
      const agreementScore = this.calculateAgreement(
        participantResults
      );

      console.log(`Agreement Score: ${agreementScore.toFixed(2)}`);

      // 합의 성공
      if (agreementScore >= this.config.threshold) {
        return {
          agreed: true,
          result: this.mergeResults(participantResults),
          agreementScore,
          participantResults,
          rounds: round,
        };
      }

      // 마지막 라운드
      if (round >= this.config.maxRounds) {
        break;
      }

      // 4단계: 토론 컨텍스트 준비
      deliberationContext = {
        round,
        previousResults: participantResults,
        disagreementPoints: this.findDisagreements(
          participantResults
        ),
      };
    }

    // 합의 실패 -> 중재자 결정
    console.log('Consensus failed, invoking mediator...');
    const mediatorDecision = await this.mediatorDecision(
      agents.map((a, i) => ({
        agentId: a.id,
        result: extractor(results[i].data),
        confidence: results[i].confidence || 0.8,
      }))
    );

    return {
      agreed: false,
      result: mediatorDecision,
      agreementScore: 0,
      participantResults: [],
      rounds: round,
    };
  }

  /**
   * 병렬 실행
   */
  private async parallelExecute(
    agents: Agent[],
    context: SharedContext,
    deliberationContext: any
  ): Promise<any[]> {
    const promises = agents.map((agent) =>
      agent.execute(context, { deliberationContext }).then((result) => ({
        agentId: agent.id,
        ...result,
      }))
    );

    return Promise.all(promises);
  }

  /**
   * 합의 점수 계산
   */
  private calculateAgreement<T>(
    results: ParticipantResult<T>[]
  ): number {
    if (results.length === 0) return 0;
    if (results.length === 1) return 1;

    // 간단한 구현: 결과를 JSON 문자열로 변환하여 비교
    const resultStrings = results.map((r) =>
      JSON.stringify(r.result)
    );

    // 가장 많이 나온 결과의 빈도 계산
    const frequency = new Map<string, number>();
    resultStrings.forEach((str) => {
      frequency.set(str, (frequency.get(str) || 0) + 1);
    });

    const maxFrequency = Math.max(...frequency.values());

    // 가중치 적용
    if (this.config.votingWeights && this.config.votingWeights.size > 0) {
      return this.calculateWeightedAgreement(results);
    }

    return maxFrequency / results.length;
  }

  /**
   * 가중치 적용 합의 점수
   */
  private calculateWeightedAgreement<T>(
    results: ParticipantResult<T>[]
  ): number {
    const weights = this.config.votingWeights!;
    const resultGroups = new Map<string, number>();

    results.forEach((r) => {
      const key = JSON.stringify(r.result);
      const weight = weights.get(r.agentId) || 1;
      resultGroups.set(key, (resultGroups.get(key) || 0) + weight);
    });

    const totalWeight = Array.from(weights.values()).reduce(
      (sum, w) => sum + w,
      0
    );
    const maxGroupWeight = Math.max(...resultGroups.values());

    return maxGroupWeight / totalWeight;
  }

  /**
   * 결과 병합
   */
  private mergeResults<T>(
    results: ParticipantResult<T>[]
  ): T {
    // 가장 높은 confidence를 가진 결과 선택
    const sorted = [...results].sort(
      (a, b) => b.confidence - a.confidence
    );
    return sorted[0].result;
  }

  /**
   * 불일치 포인트 찾기
   */
  private findDisagreements<T>(
    results: ParticipantResult<T>[]
  ): string[] {
    const disagreements: string[] = [];

    // 간단한 구현: 서로 다른 결과들을 나열
    const uniqueResults = new Set(
      results.map((r) => JSON.stringify(r.result))
    );

    if (uniqueResults.size > 1) {
      disagreements.push(
        `Found ${uniqueResults.size} different opinions`
      );
    }

    return disagreements;
  }

  /**
   * 중재자 결정
   */
  private async mediatorDecision<T>(
    results: ParticipantResult<T>[]
  ): Promise<T> {
    // TODO: 실제 중재자 AI 호출
    // 현재는 가장 높은 confidence 선택
    const sorted = [...results].sort(
      (a, b) => b.confidence - a.confidence
    );
    return sorted[0].result;
  }
}

/**
 * 투표 기반 합의
 */
export class VotingConsensus {
  /**
   * 다수결 투표
   */
  static majorityVote<T>(
    votes: Array<{ value: T; weight?: number }>
  ): T | null {
    const voteCount = new Map<string, { value: T; weight: number }>();

    votes.forEach(({ value, weight = 1 }) => {
      const key = JSON.stringify(value);
      const existing = voteCount.get(key);
      if (existing) {
        existing.weight += weight;
      } else {
        voteCount.set(key, { value, weight });
      }
    });

    let maxWeight = 0;
    let winner: T | null = null;

    voteCount.forEach(({ value, weight }) => {
      if (weight > maxWeight) {
        maxWeight = weight;
        winner = value;
      }
    });

    return winner;
  }

  /**
   * 신뢰도 기반 투표
   */
  static confidenceVote<T>(
    votes: Array<{ value: T; confidence: number }>
  ): T | null {
    const scoreMap = new Map<string, { value: T; totalConf: number }>();

    votes.forEach(({ value, confidence }) => {
      const key = JSON.stringify(value);
      const existing = scoreMap.get(key);
      if (existing) {
        existing.totalConf += confidence;
      } else {
        scoreMap.set(key, { value, totalConf: confidence });
      }
    });

    let maxConf = 0;
    let winner: T | null = null;

    scoreMap.forEach(({ value, totalConf }) => {
      if (totalConf > maxConf) {
        maxConf = totalConf;
        winner = value;
      }
    });

    return winner;
  }
}
