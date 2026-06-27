import type { BoardStage } from "../constants/stages";

export type BoardCardDTO = {
  id: string; // id do processo seletivo (mock)
  candidateName: string;
  project: string; // ex.: "App Algar"
  position: string; // ex.: "Mobile Developer"
  stage: BoardStage; // coluna atual
};
