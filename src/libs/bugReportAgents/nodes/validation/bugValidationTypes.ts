export interface BugValidationResponse {
  evaluation: Evaluation;
}

export interface Evaluation {
  explanation: number;
  observation: number;
  replication: number;
  expectationClarification: string;
  observationClarification: string;
  replicationClarification: string;
}