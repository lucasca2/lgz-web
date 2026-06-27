import {
  getAiSettings,
  saveAiSettings,
  AI_DEFAULTS,
} from "@/domains/Interviews/shared/server/aiSettings";
import { AVAILABLE_MODELS } from "@/domains/Interviews/shared/constants/aiModels";
import { settingsSchema } from "@/domains/Interviews/features/interview-assessment/schemas/assessmentSchemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getAiSettings();
  return Response.json({
    settings,
    defaults: AI_DEFAULTS,
    availableModels: AVAILABLE_MODELS,
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await saveAiSettings(parsed.data);
  return Response.json({
    settings,
    defaults: AI_DEFAULTS,
    availableModels: AVAILABLE_MODELS,
  });
}
