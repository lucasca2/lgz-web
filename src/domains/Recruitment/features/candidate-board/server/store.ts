import "server-only";

import type { BoardStage } from "../constants/stages";
import type { BoardCardDTO } from "../types";

// MOCK: store em memória (sem banco). Persiste enquanto o processo do server vive.
// Trocar por Prisma depois = mexer só aqui; queries/mutations e a borda HTTP não mudam.
const cards: BoardCardDTO[] = [
  {
    id: "seed-card-1",
    candidateName: "Mariana Silva",
    project: "App Algar",
    position: "Mobile Developer",
    stage: "Triagem",
  },
  {
    id: "seed-card-2",
    candidateName: "Rafael Oliveira",
    project: "Telecall",
    position: "Senior Backend Developer",
    stage: "Triagem",
  },
  {
    id: "seed-card-3",
    candidateName: "Beatriz Costa",
    project: "Tim",
    position: "Data Engineer",
    stage: "Triagem",
  },
  {
    id: "seed-card-4",
    candidateName: "Lucas Pereira",
    project: "App Algar",
    position: "Frontend Pleno",
    stage: "Fit Cultural",
  },
  {
    id: "seed-card-5",
    candidateName: "Camila Souza",
    project: "Sabesp",
    position: "QA Engineer",
    stage: "Fit Cultural",
  },
  {
    id: "seed-card-6",
    candidateName: "Pedro Almeida",
    project: "Telecall",
    position: "DevOps Engineer",
    stage: "People",
  },
  {
    id: "seed-card-7",
    candidateName: "Juliana Rocha",
    project: "Tim",
    position: "UX Designer",
    stage: "People",
  },
  {
    id: "seed-card-8",
    candidateName: "Gabriel Lima",
    project: "App Algar",
    position: "Senior Backend Developer",
    stage: "Entrevista Técnica",
  },
  {
    id: "seed-card-9",
    candidateName: "Fernanda Martins",
    project: "Sabesp",
    position: "Mobile Developer",
    stage: "Entrevista Técnica",
  },
  {
    id: "seed-card-10",
    candidateName: "Thiago Carvalho",
    project: "Tim",
    position: "Tech Lead",
    stage: "Entrevista Cultural",
  },
  {
    id: "seed-card-11",
    candidateName: "Aline Ribeiro",
    project: "Telecall",
    position: "Frontend Pleno",
    stage: "Proposta",
  },
  {
    id: "seed-card-12",
    candidateName: "Bruno Fernandes",
    project: "App Algar",
    position: "Data Engineer",
    stage: "Contratação",
  },
  {
    id: "seed-card-13",
    candidateName: "Larissa Gomes",
    project: "Sabesp",
    position: "DevOps Engineer",
    stage: "Contratação",
  },
  {
    id: "seed-card-14",
    candidateName: "Eduardo Nunes",
    project: "Tim",
    position: "QA Engineer",
    stage: "Rejeição",
  },
  {
    id: "seed-card-15",
    candidateName: "Patrícia Dias",
    project: "Telecall",
    position: "UX Designer",
    stage: "Rejeição",
  },
];

export function listBoardCards(): BoardCardDTO[] {
  return [...cards];
}

// Reescreve ordem + etapa de cada card a partir do layout enviado pelo board.
// A posição no array é a ordem de exibição (as colunas filtram por stage).
export function setBoardOrder(
  order: { id: string; stage: BoardStage }[],
): BoardCardDTO[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const reordered: BoardCardDTO[] = [];

  for (const { id, stage } of order) {
    const card = byId.get(id);
    if (!card) continue;
    card.stage = stage;
    reordered.push(card);
    byId.delete(id);
  }

  // Mantém eventuais cards não citados no payload (segurança) ao final.
  for (const leftover of byId.values()) reordered.push(leftover);

  cards.splice(0, cards.length, ...reordered);
  return [...cards];
}
