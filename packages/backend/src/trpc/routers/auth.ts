import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { users, refreshTokens } from '../../db/schema.js';
import { hashPassword, verifyPassword, generateTokenPair, verifyRefreshToken } from '../../lib/auth.js';
import { eq } from 'drizzle-orm';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          name: input.name,
        })
        .returning();

      const tokens = generateTokenPair({
        userId: newUser.id,
        email: newUser.email,
      });

      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      await ctx.db.insert(refreshTokens).values({
        userId: newUser.id,
        token: tokens.refreshToken,
        expiresAt: refreshTokenExpiry,
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        ...tokens,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const isValidPassword = await verifyPassword(input.password, user.passwordHash);

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      await ctx.db.insert(refreshTokens).values({
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: refreshTokenExpiry,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      };
    }),

  refresh: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let payload;
      try {
        payload = verifyRefreshToken(input.refreshToken);
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }

      const [storedToken] = await ctx.db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, input.refreshToken))
        .limit(1);

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }

      await ctx.db.delete(refreshTokens).where(eq(refreshTokens.token, input.refreshToken));

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      await ctx.db.insert(refreshTokens).values({
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: refreshTokenExpiry,
      });

      return {
        ...tokens,
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }),
});
