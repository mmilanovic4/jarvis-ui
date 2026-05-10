import path from "path";
import Database from "better-sqlite3";
import { uuid } from "./uuid";

const db = new Database(path.join(process.cwd(), "jarvis.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );
`);

export function getConversations() {
  return db
    .prepare("SELECT * FROM conversations ORDER BY created_at DESC")
    .all();
}

export function getConversation(id) {
  return db.prepare("SELECT * FROM conversations WHERE id = ?").get(id);
}

export function createConversation(model, title, id) {
  db.prepare(
    "INSERT INTO conversations (id, model, title) VALUES (?, ?, ?)",
  ).run(id, model, title);
  return id;
}

export function getMessages(conversationId) {
  return db
    .prepare(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    )
    .all(conversationId);
}

export function createMessage(conversationId, role, content) {
  const id = uuid();
  db.prepare(
    "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
  ).run(id, conversationId, role, content);
  return id;
}
