import "server-only";

import type { DirectoryPerson } from "@/domains/Scheduling/shared/types";

const SEARCH_ENDPOINT =
  "https://people.googleapis.com/v1/people:searchDirectoryPeople";

type PeoplePhoto = { url?: string; default?: boolean };
type PeopleName = { displayName?: string };
type PeopleEmail = { value?: string };

type PersonResult = {
  names?: PeopleName[];
  emailAddresses?: PeopleEmail[];
  photos?: PeoplePhoto[];
};

type SearchResponse = { people?: PersonResult[] };

// Busca pessoas no diretório do Workspace via People API (searchDirectoryPeople).
// Usa o access_token do recrutador. Em falha, lança erro com `.status` para o
// route handler distinguir relogin (401) de indisponível (403: People API
// desligada no GCP ou diretório bloqueado pelo admin).
export async function searchDirectoryPeople(
  accessToken: string,
  query: string,
): Promise<DirectoryPerson[]> {
  const params = new URLSearchParams({
    query,
    readMask: "names,emailAddresses,photos",
    pageSize: "20",
  });
  params.append("sources", "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE");

  const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`directory_search_failed (${res.status}): ${detail}`),
      { status: res.status },
    );
  }

  const data = (await res.json()) as SearchResponse;
  const people = data.people ?? [];

  const mapped: DirectoryPerson[] = [];
  const seen = new Set<string>();
  for (const person of people) {
    const rawEmail = person.emailAddresses?.[0]?.value;
    if (!rawEmail) continue;
    const email = rawEmail.toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);

    const name = person.names?.[0]?.displayName?.trim() || email;
    // Prefere uma foto "real" (não a default genérica do Google).
    const photo =
      person.photos?.find((p) => !p.default)?.url ??
      person.photos?.[0]?.url ??
      null;

    mapped.push({ name, email, photo });
  }
  return mapped;
}
