/**
 * Base Agent Class
 * 모든 에이전트의 기본 클래스
 */

import type {
  Agent,
  AgentResult,
  AgentStatus,
  AgentConfig,
  SharedContext,
} from '../types/index.js';

export abstract class BaseAgent implements Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public status: AgentStatus;
  protected config: AgentConfig;

  constructor(
    id: string,
    name: string,
    type: string,
    config: AgentConfig = {}
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.status = 'idle';
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000,
      retries: 3,
      ...config,
    };
  }

  /**
   * 에이전트 실행 (추상 메서드)
   */
  abstract execute(
    context: SharedContext,
    params?: any
  ): Promise<AgentResult>;

  /**
   * 에이전트 실행 래퍼 (에러 처리, 재시도 로직 포함)
   */
  async run(context: SharedContext, params?: any): Promise<AgentResult> {
    this.status = 'running';
    const startTime = Date.now();

    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.config.retries!) {
      try {
        const result = await this.executeWithTimeout(context, params);
        this.status = 'completed';
        return {
          ...result,
          executionTime: Date.now() - startTime,
        };
      } catch (error) {
        attempts++;
        lastError = error as Error;
        console.warn(
          `[${this.name}] Attempt ${attempts}/${this.config.retries} failed:`,
          error
        );

        if (attempts < this.config.retries!) {
          await this.sleep(1000 * attempts); // 지수 백오프
        }
      }
    }

    this.status = 'failed';
    return {
      success: false,
      data: null,
      errors: [
        `Failed after ${attempts} attempts: ${lastError?.message}`,
      ],
      metrics: {},
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * 타임아웃이 포함된 실행
   */
  private async executeWithTimeout(
    context: SharedContext,
    params?: any
  ): Promise<AgentResult> {
    return Promise.race([
      this.execute(context, params),
      this.timeout(this.config.timeout!),
    ]);
  }

  /**
   * 타임아웃 프로미스
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout after ${ms}ms`)),
        ms
      )
    );
  }

  /**
   * Sleep 유틸리티
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 로깅 유틸리티
   */
  protected log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] ${message}`, data || '');
  }

  /**
   * 에이전트 상태 리셋
   */
  reset(): void {
    this.status = 'idle';
  }

  /**
   * 에이전트 정보
   */
  getInfo(): {
    id: string;
    name: string;
    type: string;
    status: AgentStatus;
  } {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
    };
  }
}
