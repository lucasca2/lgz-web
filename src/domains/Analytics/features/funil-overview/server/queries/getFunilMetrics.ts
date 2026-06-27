import "server-only";

import type { FunilMetrics } from "../../types";

export async function getFunilMetrics(): Promise<FunilMetrics> {
  return {
    kpis: {
      totalCandidatos: 184,
      candidatosAtivos: 47,
      taxaConversaoGeral: 7.6,
      slaMedioDias: 18,
      vagasAbertas: 12,
    },
    etapasFunil: [
      { etapa: "Entrevista People", candidatos: 184, conversao: 100 },
      { etapa: "Entrevista Técnica", candidatos: 112, conversao: 61 }, // 112/184
      { etapa: "Teste Técnico", candidatos: 62, conversao: 55 },       // 62/112
      { etapa: "Liderança", candidatos: 31, conversao: 50 },           // 31/62
      { etapa: "Proposta", candidatos: 14, conversao: 45 },            // 14/31
    ],
    statusBreakdown: [
      { status: "Em_andamento", count: 47 },
      { status: "Aprovado", count: 22 },
      { status: "Reprovado", count: 115 },
    ],
    origemBreakdown: [
      { origem: "Hunting", count: 62 },
      { origem: "Gupy", count: 48 },
      { origem: "Indicacao", count: 31 },
      { origem: "LinkedIn", count: 28 },
      { origem: "Outro", count: 15 },
    ],
    motivosReprovacao: [
      { motivo: "Fit cultural insuficiente", count: 34 },
      { motivo: "Expectativa salarial acima do budget", count: 21 },
      { motivo: "Habilidades técnicas abaixo do esperado", count: 19 },
      { motivo: "Desistiu do processo", count: 14 },
      { motivo: "Perfil não aderente à vaga", count: 10 },
    ],
    slaEtapas: [
      { etapa: "Entrevista People", mediaDias: 3 },
      { etapa: "Entrevista Técnica", mediaDias: 5 },
      { etapa: "Teste Técnico", mediaDias: 7 },
      { etapa: "Liderança", mediaDias: 6 },
      { etapa: "Proposta", mediaDias: 4 },
    ],
    transicoes: [
      // Entrevista People → (184 total)
      { from: "Entrevista People", to: "Entrevista Técnica", count: 112 },
      { from: "Entrevista People", to: "Reprovado", count: 72 },
      // Entrevista Técnica → (112 total; 10 pulam Teste Técnico e vão direto para Liderança)
      { from: "Entrevista Técnica", to: "Teste Técnico", count: 62 },
      { from: "Entrevista Técnica", to: "Liderança", count: 10 },
      { from: "Entrevista Técnica", to: "Reprovado", count: 40 },
      // Teste Técnico → (62 total)
      { from: "Teste Técnico", to: "Liderança", count: 31 },
      { from: "Teste Técnico", to: "Reprovado", count: 31 },
      // Liderança → (41 total: 31 do Teste Técnico + 10 bypass)
      { from: "Liderança", to: "Proposta", count: 14 },
      { from: "Liderança", to: "Reprovado", count: 27 },
      // Proposta → (14 total)
      { from: "Proposta", to: "Aprovado", count: 7 },
      { from: "Proposta", to: "Reprovado", count: 7 },
    ],
    vagasAbertas: [
      {
        id: "v1",
        titulo: "Engenheiro de Software Backend Sênior",
        projeto: "Tim",
        status: "Aberta",
        candidatos: 18,
        diasAberta: 42,
      },
      {
        id: "v2",
        titulo: "Analista de Dados Pleno",
        projeto: "Sabesp",
        status: "Aberta",
        candidatos: 11,
        diasAberta: 28,
      },
      {
        id: "v3",
        titulo: "Tech Lead Full Stack",
        projeto: "Tim",
        status: "Stand_by",
        candidatos: 6,
        diasAberta: 67,
      },
      {
        id: "v4",
        titulo: "Product Manager",
        projeto: "Algar",
        status: "Aberta",
        candidatos: 14,
        diasAberta: 19,
      },
      {
        id: "v5",
        titulo: "Engenheiro de Software Frontend Pleno",
        projeto: "Telcel",
        status: "Aberta",
        candidatos: 9,
        diasAberta: 35,
      },
      {
        id: "v6",
        titulo: "DevOps Engineer",
        projeto: "Tim",
        status: "Aberta",
        candidatos: 7,
        diasAberta: 51,
      },
      {
        id: "v7",
        titulo: "Analista de QA Sênior",
        projeto: "Sabesp",
        status: "Aberta",
        candidatos: 5,
        diasAberta: 22,
      },
      {
        id: "v8",
        titulo: "Staff Engineer",
        projeto: "Algar",
        status: "Stand_by",
        candidatos: 3,
        diasAberta: 88,
      },
      {
        id: "v9",
        titulo: "Engenheiro de Software Mobile Júnior",
        projeto: "Telcel",
        status: "Aberta",
        candidatos: 21,
        diasAberta: 14,
      },
      {
        id: "v10",
        titulo: "Scrum Master",
        projeto: "Tim",
        status: "Aberta",
        candidatos: 8,
        diasAberta: 30,
      },
      {
        id: "v11",
        titulo: "Data Engineer Pleno",
        projeto: "Sabesp",
        status: "Aberta",
        candidatos: 10,
        diasAberta: 25,
      },
      {
        id: "v12",
        titulo: "Engenheiro de Segurança",
        projeto: "Algar",
        status: "Aberta",
        candidatos: 4,
        diasAberta: 46,
      },
    ],
  };
}
