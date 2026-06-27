export type LinkedInAuthStatus =
  | "ready"
  | "login_required"
  | "login_in_progress";

export interface LinkedInAuthStatusResponse {
  authenticated: boolean;
  status: LinkedInAuthStatus;
}

export interface LinkedInLoginResponse {
  status:
    | "already_authenticated"
    | "login_started"
    | "login_in_progress";
  message?: string;
}

export interface ParsedCandidate {
  name: string;
  headline: string;
  location: string;
  current_company: string;
  current_role: string;
  years_experience: string;
  education: string;
  top_skills: string;
  summary: string;
  linkedin_url: string;
}

export interface LinkedInSearchResponse {
  usernames: string[];
  total: number;
  page: number;
  raw: unknown;
}

export interface LinkedInProfileResponse {
  parsed: ParsedCandidate;
  raw: unknown;
}
