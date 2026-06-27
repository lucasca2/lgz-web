import "server-only";

import { listProjects } from "../store";

export function getProjects() {
  return listProjects();
}
