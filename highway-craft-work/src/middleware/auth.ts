import type { NextFunction, Request, Response } from 'express';
import { getAdminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import type { DbUser } from '../db/schema.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string | null;
    name: string | null;
    dbUser: DbUser;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in with Google.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Invalid authentication token.' });
    return;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const dbUser = await getOrCreateUser({
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: typeof decoded.name === 'string' ? decoded.name : null,
    });

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: typeof decoded.name === 'string' ? decoded.name : null,
      dbUser,
    };
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Token verification failed:', err);
    res.status(401).json({ error: 'Authentication session expired or invalid. Please sign in again.' });
  }
}
