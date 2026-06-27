import { z } from "zod";

const LINKEDIN_API_URL =
  process.env.LINKEDIN_API_URL ?? "http://localhost:5001";

const searchSchema = z.object({
  keywords: z.string().min(1, "keywords is required"),
  location: z.string().optional(),
  page: z.coerce.number().int().min(0).optional().default(0),
  network: z.string().optional(),
  current_company: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const upstream = new URLSearchParams();
  upstream.set("keywords", parsed.data.keywords);
  upstream.set("page", String(parsed.data.page));
  if (parsed.data.location) upstream.set("location", parsed.data.location);
  if (parsed.data.network) upstream.set("network", parsed.data.network);
  if (parsed.data.current_company)
    upstream.set("current_company", parsed.data.current_company);

  try {
    const res = await fetch(
      `${LINKEDIN_API_URL}/api/search?${upstream.toString()}`,
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
