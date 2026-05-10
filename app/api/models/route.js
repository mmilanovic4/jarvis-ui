import { getModels } from "@/app/lib/ollama";

export async function GET() {
  const models = await getModels();
  return Response.json({ models });
}
