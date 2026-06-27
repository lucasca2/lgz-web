import "server-only";

import { listBoardCards } from "../store";

export function getBoardCards() {
  return listBoardCards();
}
