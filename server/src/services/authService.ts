import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { config } from '../config/env.js';
import { User } from '../types/index.js';

export class AuthService {
  async register(username: string, email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Vérifier si l'email existe déjà
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      throw new Error('Cet email est deja utilise');
    }

    // Vérifier si le username existe déjà
    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      throw new Error('Ce nom d\'utilisateur est deja pris');
    }

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run(username, email, password_hash);

    const user = db.prepare('SELECT id, username, email, created_at, games_played, games_won, total_points FROM users WHERE id = ?').get(result.lastInsertRowid) as Omit<User, 'password_hash'>;

    // Générer le token
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Trouver l'utilisateur
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password_hash!);
    if (!isValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer le token
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    // Retourner l'utilisateur sans le password_hash
    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  getUser(userId: number): Omit<User, 'password_hash'> | null {
    const user = db.prepare(
      'SELECT id, username, email, created_at, games_played, games_won, total_points FROM users WHERE id = ?'
    ).get(userId) as Omit<User, 'password_hash'> | undefined;

    return user || null;
  }
}

export const authService = new AuthService();
