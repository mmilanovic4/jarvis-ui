import { checkStatus } from "@/app/lib/ollama";

export async function GET() {
  const status = await checkStatus();
  return Response.json({ status });
}
