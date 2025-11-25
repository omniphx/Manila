import { FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { db } from '../lib/db.js';

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  db: typeof db;
  user: {
    userId: string;
  } | null;
}

export async function createContext({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}): Promise<Context> {
  const auth = getAuth(req);
  let user = null;

  if (auth.userId) {
    user = {
      userId: auth.userId,
    };
  }

  return {
    req,
    res,
    db,
    user,
  };
}
