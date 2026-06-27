// Embrulha a justificativa gerada pela IA num modelo de devolutiva (PT-BR).
export function buildRejectionMessage(
  justificativa: string,
  candidateName: string,
): string {
  const nome = candidateName?.trim() || "tudo bem";
  return `Olá, ${nome}!

Agradecemos muito o seu tempo e a conversa ao longo do nosso processo seletivo.

${justificativa.trim()}

Seguiremos com o seu perfil em nosso banco de talentos e, surgindo uma oportunidade aderente, entraremos em contato.

Desejamos sucesso na sua jornada!
Equipe Wave`;
}
