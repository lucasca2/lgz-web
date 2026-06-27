import type { BoardStage } from "../constants/stages";

export type BoardInterview = {
  dataHora: string | null; // ISO da entrevista agendada (null se sem data ainda)
  status: string; // entrevista_status (ex.: "Confirmada")
};

export type BoardCardDTO = {
  id: string; // id do processo seletivo
  candidateName: string;
  project: string; // ex.: "App Algar"
  position: string; // ex.: "Mobile Developer"
  stage: BoardStage; // coluna atual = status_atual do processo
  score: number | null; // score_fit_cultural (null até a IA avaliar)
  interview?: BoardInterview | null; // entrevista mais recente, se houver
};
