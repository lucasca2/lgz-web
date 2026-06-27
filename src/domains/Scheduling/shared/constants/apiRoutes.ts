// Paths /api/... do agendador, centralizados (consumidos pelos hooks do cliente).
export const schedulingApiRoutes = {
  config: "/api/scheduling/config",
  slots: "/api/scheduling/slots",
  links: "/api/scheduling/links",
  linkSlots: (id: string) => `/api/scheduling/links/${id}/slots`,
  book: (id: string) => `/api/scheduling/links/${id}/book`,
  candidateInvite: (candidateId: string) =>
    `/api/scheduling/candidate-invite?candidateId=${encodeURIComponent(candidateId)}`,
} as const;
