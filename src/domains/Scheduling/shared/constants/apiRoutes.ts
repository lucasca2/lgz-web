// Paths /api/... do agendador, centralizados (consumidos pelos hooks do cliente).
export const schedulingApiRoutes = {
  config: "/api/scheduling/config",
  slots: "/api/scheduling/slots",
  directory: (q: string) =>
    `/api/scheduling/directory?q=${encodeURIComponent(q)}`,
  recommendations: (position: string) =>
    `/api/scheduling/recommendations?position=${encodeURIComponent(position)}`,
  links: "/api/scheduling/links",
  linkSlots: (id: string) => `/api/scheduling/links/${id}/slots`,
  book: (id: string) => `/api/scheduling/links/${id}/book`,
  candidateInvite: (candidateId: string) =>
    `/api/scheduling/candidate-invite?candidateId=${encodeURIComponent(candidateId)}`,
} as const;
