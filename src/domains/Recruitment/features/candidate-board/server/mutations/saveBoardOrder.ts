import "server-only";

import { setBoardOrder } from "../store";
import type { BoardOrderInput } from "../../schemas/boardSchemas";

export function saveBoardOrder(input: BoardOrderInput) {
  return setBoardOrder(input.order);
}
