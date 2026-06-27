// Erros de domínio da avaliação — mapeados para status HTTP nos route handlers.

export class AssessmentNotFoundError extends Error {
  constructor() {
    super("ASSESSMENT_NOT_FOUND");
    this.name = "AssessmentNotFoundError";
  }
}

export class MissingAnalysisError extends Error {
  constructor() {
    super("MISSING_ANALYSIS");
    this.name = "MissingAnalysisError";
  }
}
