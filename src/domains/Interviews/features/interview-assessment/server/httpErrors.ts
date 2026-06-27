import "server-only";

import { MissingAnthropicKeyError } from "@/shared/lib/anthropic";
import { AssessmentNotFoundError, MissingAnalysisError } from "./errors";

// Mapeia erros conhecidos do pipeline de IA para respostas HTTP.
// Relança erros desconhecidos (→ 500 do Next).
export function aiErrorResponse(err: unknown): Response {
  if (err instanceof MissingAnthropicKeyError) {
    return Response.json({ error: "AI_NOT_CONFIGURED" }, { status: 503 });
  }
  if (err instanceof AssessmentNotFoundError) {
    return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (err instanceof MissingAnalysisError) {
    return Response.json({ error: "MISSING_ANALYSIS" }, { status: 409 });
  }
  // Saída do modelo não era JSON válido.
  if (err instanceof SyntaxError) {
    return Response.json({ error: "AI_BAD_OUTPUT" }, { status: 502 });
  }
  throw err;
}
