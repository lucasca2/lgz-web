const LINKEDIN_API_URL =
  process.env.LINKEDIN_API_URL ?? "http://localhost:5001";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  try {
    const res = await fetch(
      `${LINKEDIN_API_URL}/api/profile/${encodeURIComponent(username)}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { error: "LinkedIn service unavailable" },
      { status: 503 },
    );
  }
}
