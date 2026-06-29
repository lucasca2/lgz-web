import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { UpdateCandidatoInput } from "../../schemas/candidatoSchemas";
import type { CandidatoEditDTO } from "../../types";
import { getCandidatoForEdit } from "../queries/getCandidatoForEdit";

// Conflito de unicidade ao editar: linkedin_url ou email já pertencem a outro
// candidato (índices parciais uq_candidatos_linkedin / uq_candidatos_email).
export class CandidatoConflictError extends Error {
  constructor(public readonly field: "linkedin" | "email") {
    super("CANDIDATO_CONFLICT");
    this.name = "CandidatoConflictError";
  }
}

// Atualiza os dados de um candidato (a pessoa, compartilhada entre vagas).
// `dados_extraidos` é re-empacotado como JSON `{ texto }` (ou limpo com null).
// P2025 (não encontrado) → null (vira 404 na rota); P2002 → CandidatoConflictError.
export async function updateCandidato(
  id: string,
  input: UpdateCandidatoInput,
): Promise<CandidatoEditDTO | null> {
  let result;
  try {
    // updateMany (não update) para escopar por `deleted_at: null` de forma
    // atômica — um candidato removido não pode ser editado e o 404 fica honesto.
    result = await prisma.candidatos.updateMany({
      where: { id, deleted_at: null },
      data: {
        nome: input.nome,
        linkedin_url: input.linkedin_url,
        email: input.email ?? null,
        telefone: input.telefone ?? null,
        origem: input.origem ?? null,
        pretensao_salarial: input.pretensao_salarial ?? null,
        dados_extraidos: input.dados_extraidos
          ? { texto: input.dados_extraidos }
          : Prisma.DbNull,
        // `updated_at` não tem @updatedAt no schema — bump manual.
        updated_at: new Date(),
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code?: string }).code;
      if (code === "P2002") {
        const target = (err as { meta?: { target?: unknown } }).meta?.target;
        const fields = Array.isArray(target)
          ? target.join(",")
          : String(target ?? "");
        throw new CandidatoConflictError(
          fields.includes("email") ? "email" : "linkedin",
        );
      }
    }
    throw err;
  }

  if (result.count === 0) return null;
  return getCandidatoForEdit(id);
}
