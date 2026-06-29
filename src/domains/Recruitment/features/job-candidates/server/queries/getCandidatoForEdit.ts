import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type { Origem } from "../../schemas/candidatoSchemas";
import type { CandidatoEditDTO } from "../../types";

// Colunas editáveis do candidato.
const EDIT_SELECT = {
  id: true,
  nome: true,
  linkedin_url: true,
  email: true,
  telefone: true,
  origem: true,
  pretensao_salarial: true,
  dados_extraidos: true,
} as const;

// Mapeia a linha do banco para o DTO de edição: desempacota `dados_extraidos`
// (JSON `{ texto }`) para texto puro e converte `pretensao_salarial` (Decimal).
function toCandidatoEditDTO(row: {
  id: string;
  nome: string;
  linkedin_url: string;
  email: string | null;
  telefone: string | null;
  origem: Origem | null;
  pretensao_salarial: unknown;
  dados_extraidos: unknown;
}): CandidatoEditDTO {
  let dadosExtraidos: string | null = null;
  const raw = row.dados_extraidos;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const texto = (raw as Record<string, unknown>).texto;
    if (typeof texto === "string") dadosExtraidos = texto;
  }

  return {
    id: row.id,
    nome: row.nome,
    linkedinUrl: row.linkedin_url,
    email: row.email,
    telefone: row.telefone,
    origem: row.origem ?? null,
    pretensaoSalarial:
      row.pretensao_salarial != null ? Number(row.pretensao_salarial) : null,
    dadosExtraidos,
  };
}

// Server-only: carrega os dados editáveis de um candidato pelo id (prefill da
// edição). Ignora removidos. Retorna null se não achar.
export async function getCandidatoForEdit(
  id: string,
): Promise<CandidatoEditDTO | null> {
  const row = await prisma.candidatos.findFirst({
    where: { id, deleted_at: null },
    select: EDIT_SELECT,
  });
  return row ? toCandidatoEditDTO(row) : null;
}

// Server-only: busca um candidato pelo linkedin_url EXATO (ignora removidos).
// Usado para detectar duplicidade no cadastro e pré-preencher o formulário.
export async function getCandidatoByLinkedin(
  linkedinUrl: string,
): Promise<CandidatoEditDTO | null> {
  const url = linkedinUrl.trim();
  if (!url) return null;

  const row = await prisma.candidatos.findFirst({
    where: { linkedin_url: url, deleted_at: null },
    select: EDIT_SELECT,
  });
  return row ? toCandidatoEditDTO(row) : null;
}
