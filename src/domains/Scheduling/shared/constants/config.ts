// Parâmetros fixos do agendador (porte do config.json documentado).
// Fuso fixo America/Sao_Paulo (UTC-3, sem horário de verão) — offset constante
// independente do fuso da máquina.
export const schedulingConfig = {
  eventTitle: "Reunião Bemobi",
  defaultDurationMin: 30,
  businessStartHour: 9, // início da janela comercial
  businessEndHour: 18, // fim da janela comercial
  stepMin: 15, // granularidade dos horários de início
  timeZone: "America/Sao_Paulo",
  tzOffset: "-03:00",
  // Lista padrão de pessoas exibida na tela do recrutador (editável na UI).
  employees: [
    { email: "beatriz.pierotti@bemobi.com", required: true },
    { email: "gabriel.souza@bemobi.com", required: false },
  ],
} as const;
