export const linkedInApiRoutes = {
  authStatus: "/api/linkedin/auth/status",
  authLogin: "/api/linkedin/auth/login",
  search: "/api/linkedin/search",
  profile: (username: string) =>
    `/api/linkedin/profile/${encodeURIComponent(username)}`,
} as const;
