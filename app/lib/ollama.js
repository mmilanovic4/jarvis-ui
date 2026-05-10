import { Ollama } from "ollama";

const OLLAMA_URL = "http://localhost:11434";

const ollama = new Ollama({ host: OLLAMA_URL });

export async function checkStatus() {
  try {
    await fetch(OLLAMA_URL);
    return true;
  } catch {
    return false;
  }
}

export async function getModels() {
  const { models } = await ollama.list();
  return models.map((model) => model.name);
}

export async function chat(model, messages) {
  const response = await ollama.chat({ model, messages });
  return response.message.content;
}
