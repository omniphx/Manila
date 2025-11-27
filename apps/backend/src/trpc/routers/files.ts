import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc.js';
import { files } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true });

export const filesRouter = router({
  upload: protectedProcedure
    .input(z.object({
      filename: z.string(),
      mimeType: z.string(),
      size: z.number(),
      data: z.instanceof(Buffer),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate unique filename to avoid collisions
      const fileExtension = input.filename.split('.').pop() || '';
      const uniqueFilename = `${randomUUID()}.${fileExtension}`;
      const filePath = join(UPLOAD_DIR, uniqueFilename);

      try {
        // Write file to disk
        await fs.writeFile(filePath, input.data);

        // Create database entry
        const [newFile] = await ctx.db
          .insert(files)
          .values({
            userId: ctx.user.userId,
            filename: uniqueFilename,
            originalFilename: input.filename,
            mimeType: input.mimeType,
            size: input.size.toString(),
            path: filePath,
          })
          .returning();

        return {
          id: newFile.id,
          filename: newFile.filename,
          originalFilename: newFile.originalFilename,
          mimeType: newFile.mimeType,
          size: newFile.size,
          createdAt: newFile.createdAt,
        };
      } catch (error) {
        // Clean up file if database insert fails
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          // Ignore cleanup errors
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload file',
        });
      }
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          id: files.id,
          filename: files.filename,
          originalFilename: files.originalFilename,
          mimeType: files.mimeType,
          size: files.size,
          createdAt: files.createdAt,
        })
        .from(files)
        .where(eq(files.userId, ctx.user.userId))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(files.createdAt);

      return results;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [file] = await ctx.db
        .select()
        .from(files)
        .where(eq(files.id, input.id))
        .limit(1);

      if (!file || file.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      return {
        id: file.id,
        filename: file.filename,
        originalFilename: file.originalFilename,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdAt,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [file] = await ctx.db
        .select()
        .from(files)
        .where(eq(files.id, input.id))
        .limit(1);

      if (!file || file.userId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(file.path);
      } catch (error) {
        // Log error but continue with database deletion
        console.error('Failed to delete file from filesystem:', error);
      }

      // Delete from database
      await ctx.db.delete(files).where(eq(files.id, input.id));

      return {
        success: true,
        id: input.id,
      };
    }),
});
