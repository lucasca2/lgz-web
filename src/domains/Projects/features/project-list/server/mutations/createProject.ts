import "server-only";

import { addProject } from "../store";
import type { CreateProjectInput } from "../../schemas/projectSchemas";

export function createProject(input: CreateProjectInput) {
  return addProject(input);
}
