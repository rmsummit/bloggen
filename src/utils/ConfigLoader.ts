/**
 * Configuration Loader
 * YAML 설정 파일 로드 및 파싱
 */

import { readFileSync } from 'fs';
import YAML from 'yaml';
import type { WorkflowConfig } from '../types/index.js';

export class ConfigLoader {
  /**
   * YAML 파일에서 설정 로드
   */
  static loadFromYaml(filePath: string): WorkflowConfig {
    const fileContent = readFileSync(filePath, 'utf-8');
    const raw = YAML.parse(fileContent);

    return this.parseConfig(raw.workflow);
  }

  /**
   * 기본 설정 반환
   */
  static getDefaultConfig(): WorkflowConfig {
    return {
      qualityLevel: 'standard',
      parallelExecution: {
        enabled: true,
        maxWorkers: 10,
        timeout: 300000,
      },
      consensus: {
        threshold: 0.7,
        maxRounds: 3,
        mediator: 'claude-sonnet-4',
        votingWeights: new Map(),
      },
      qualityGates: {
        strictMode: true,
        autoRetry: true,
        maxRetries: 3,
      },
      stages: {
        intelligence: {
          dataSources: 5,
          keywordAnalyzers: 4,
          minConfidence: 0.7,
        },
        creation: {
          writers: 4,
          styleGuide: 'professional',
          coherenceThreshold: 0.85,
        },
        refinement: {
          reviewers: 3,
          consensusRequired: 0.67,
          autoFix: true,
        },
        optimization: {
          imageGenerators: 3,
          seoModules: 4,
          abTest: true,
        },
        publishing: {
          platforms: ['tistory', 'naver', 'wordpress'],
          smartScheduling: true,
          parallelPublish: true,
        },
      },
      learning: {
        enabled: true,
        feedbackLoop: true,
        modelUpdateInterval: 7,
      },
    };
  }

  /**
   * Raw config 파싱
   */
  private static parseConfig(raw: any): WorkflowConfig {
    const defaultConfig = this.getDefaultConfig();

    // Voting weights를 Map으로 변환
    const votingWeights = new Map<string, number>();
    if (raw.consensus?.voting_weights) {
      Object.entries(raw.consensus.voting_weights).forEach(([key, value]) => {
        votingWeights.set(key, value as number);
      });
    }

    return {
      qualityLevel: raw.quality_level || defaultConfig.qualityLevel,
      parallelExecution: {
        enabled: raw.parallel_execution?.enabled ?? defaultConfig.parallelExecution.enabled,
        maxWorkers: raw.parallel_execution?.max_workers || defaultConfig.parallelExecution.maxWorkers,
        timeout: raw.parallel_execution?.timeout || defaultConfig.parallelExecution.timeout,
      },
      consensus: {
        threshold: raw.consensus?.threshold || defaultConfig.consensus.threshold,
        maxRounds: raw.consensus?.max_rounds || defaultConfig.consensus.maxRounds,
        mediator: raw.consensus?.mediator || defaultConfig.consensus.mediator,
        votingWeights: votingWeights.size > 0 ? votingWeights : defaultConfig.consensus.votingWeights,
      },
      qualityGates: {
        strictMode: raw.quality_gates?.strict_mode ?? defaultConfig.qualityGates.strictMode,
        autoRetry: raw.quality_gates?.auto_retry ?? defaultConfig.qualityGates.autoRetry,
        maxRetries: raw.quality_gates?.max_retries || defaultConfig.qualityGates.maxRetries,
      },
      stages: {
        intelligence: {
          dataSources: raw.stages?.intelligence?.data_sources || defaultConfig.stages.intelligence.dataSources,
          keywordAnalyzers: raw.stages?.intelligence?.keyword_analyzers || defaultConfig.stages.intelligence.keywordAnalyzers,
          minConfidence: raw.stages?.intelligence?.min_confidence || defaultConfig.stages.intelligence.minConfidence,
        },
        creation: {
          writers: raw.stages?.creation?.writers || defaultConfig.stages.creation.writers,
          styleGuide: raw.stages?.creation?.style_guide || defaultConfig.stages.creation.styleGuide,
          coherenceThreshold: raw.stages?.creation?.coherence_threshold || defaultConfig.stages.creation.coherenceThreshold,
        },
        refinement: {
          reviewers: raw.stages?.refinement?.reviewers || defaultConfig.stages.refinement.reviewers,
          consensusRequired: raw.stages?.refinement?.consensus_required || defaultConfig.stages.refinement.consensusRequired,
          autoFix: raw.stages?.refinement?.auto_fix ?? defaultConfig.stages.refinement.autoFix,
        },
        optimization: {
          imageGenerators: raw.stages?.optimization?.image_generators || defaultConfig.stages.optimization.imageGenerators,
          seoModules: raw.stages?.optimization?.seo_modules || defaultConfig.stages.optimization.seoModules,
          abTest: raw.stages?.optimization?.ab_test ?? defaultConfig.stages.optimization.abTest,
        },
        publishing: {
          platforms: raw.stages?.publishing?.platforms || defaultConfig.stages.publishing.platforms,
          smartScheduling: raw.stages?.publishing?.smart_scheduling ?? defaultConfig.stages.publishing.smartScheduling,
          parallelPublish: raw.stages?.publishing?.parallel_publish ?? defaultConfig.stages.publishing.parallelPublish,
        },
      },
      learning: {
        enabled: raw.learning?.enabled ?? defaultConfig.learning.enabled,
        feedbackLoop: raw.learning?.feedback_loop ?? defaultConfig.learning.feedbackLoop,
        modelUpdateInterval: raw.learning?.model_update_interval || defaultConfig.learning.modelUpdateInterval,
      },
    };
  }
}
