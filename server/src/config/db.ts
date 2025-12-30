import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Créer la connexion à la base de données
const dbPath = join(__dirname, '../../data/among-legends.db');
export const db = new Database(dbPath);

// Activer les foreign keys
db.pragma('foreign_keys = ON');

// Initialiser le schéma
export function initDatabase() {
  const schemaPath = join(__dirname, '../models/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database initialized successfully');
}
