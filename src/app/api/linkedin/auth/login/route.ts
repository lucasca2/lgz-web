const LINKEDIN_API_URL =
  process.env.LINKEDIN_API_URL ?? "http://localhost:5001";

export async function POST() {
  try {
    const res = await fetch(`${LINKEDIN_API_URL}/api/auth/login?mode=url`, {
      method: "POST",
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { error: "LinkedIn service unavailable" },
      { status: 503 },
    );
  }
}
