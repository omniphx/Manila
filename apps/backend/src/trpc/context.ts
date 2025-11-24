import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../lib/db.js';
import { verifyAccessToken } from '../lib/auth.js';

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  db: typeof db;
  user: {
    userId: string;
    email: string;
  } | null;
}

export async function createContext({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}): Promise<Context> {
  let user = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = verifyAccessToken(token);
      user = payload;
    } catch (error) {
      // Token is invalid or expired, user remains null
    }
  }

  return {
    req,
    res,
    db,
    user,
  };
}
