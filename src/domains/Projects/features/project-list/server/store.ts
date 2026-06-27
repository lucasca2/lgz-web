import "server-only";

import type { ProjectDTO } from "../types";
import type { CreateProjectInput } from "../schemas/projectSchemas";

// MOCK: store em memória (sem banco). Persiste enquanto o processo do server vive.
// Trocar por Prisma depois = mexer só aqui; queries/mutations e a borda HTTP não mudam.
const SEED_DATE = "2026-06-27T12:00:00.000Z";

const projects: ProjectDTO[] = [
  {
    id: "seed-proj-app-algar",
    name: "App Algar",
    expectation:
      "App mobile B2C de alto tráfego. Pede experiência com React Native, performance e observabilidade. Atenção a acessibilidade e fluxos de pagamento.",
    createdAt: SEED_DATE,
  },
  {
    id: "seed-proj-b2b-algar",
    name: "B2B Algar",
    expectation:
      "Portal B2B com regras de negócio complexas e integrações. Valoriza experiência com dashboards, controle de acesso e domínios corporativos.",
    createdAt: SEED_DATE,
  },
  {
    id: "seed-proj-telecall",
    name: "Telecall",
    expectation:
      "Plataforma de telecom com forte volume de dados em tempo real. Pede familiaridade com WebSockets, filas e resiliência.",
    createdAt: SEED_DATE,
  },
  {
    id: "seed-proj-tim",
    name: "Tim",
    expectation:
      "Conta enterprise com SLAs rígidos. Valoriza experiência prévia em telecom, internacionalização e processos de release controlados.",
    createdAt: SEED_DATE,
  },
];

export function listProjects(): ProjectDTO[] {
  return [...projects];
}

export function addProject(input: CreateProjectInput): ProjectDTO {
  const project: ProjectDTO = {
    id: crypto.randomUUID(),
    name: input.name,
    expectation: input.expectation,
    createdAt: new Date().toISOString(),
  };
  projects.unshift(project);
  return project;
}
