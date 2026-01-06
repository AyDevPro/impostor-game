import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Trouver le dossier racine du projet (là où se trouve package.json)
// En dev: __dirname = server/src/config, en prod: __dirname = server/dist/config
// On remonte jusqu'à server/ puis on va dans data/
const serverRoot = join(__dirname, '../..');
const dataDir = join(serverRoot, 'data');

// Créer le dossier data s'il n'existe pas
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Créer la connexion à la base de données
const dbPath = join(dataDir, 'among-legends.db');
console.log('Database path:', dbPath);
export const db = new Database(dbPath);

// Activer les foreign keys
db.pragma('foreign_keys = ON');

// Initialiser le schéma
export function initDatabase() {
  // En dev: server/src/models/schema.sql, en prod: server/src/models/schema.sql (depuis dist)
  // On cherche le schema.sql dans le dossier src/ qui est toujours présent
  const srcModelsPath = join(serverRoot, 'src/models/schema.sql');

  if (!existsSync(srcModelsPath)) {
    console.error('Schema file not found at:', srcModelsPath);
    throw new Error('Schema file not found');
  }

  const schema = readFileSync(srcModelsPath, 'utf-8');
  db.exec(schema);
  console.log('Database initialized successfully at:', dbPath);
}
