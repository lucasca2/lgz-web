export const apiRoutes = {
  assessments: "/api/avaliacoes",
  settings: "/api/avaliacoes/settings",
  analyze: "/api/avaliacoes/analyze",
  byId: (id: string) => `/api/avaliacoes/${encodeURIComponent(id)}`,
  recommend: (id: string) =>
    `/api/avaliacoes/${encodeURIComponent(id)}/recommend`,
  summary: (id: string) => `/api/avaliacoes/${encodeURIComponent(id)}/summary`,
  rejectionTemplate: (id: string) =>
    `/api/avaliacoes/${encodeURIComponent(id)}/rejection-template`,
} as const;
