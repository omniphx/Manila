import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc.js";
import { folders, files } from "../../db/schema.js";
import { eq, and, isNull, inArray } from "drizzle-orm";

export const foldersRouter = router({
  /**
   * Create a new folder
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        parentId: z.string().uuid().optional(),
        color: z.string().max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If parentId is provided, verify it exists and belongs to the user
      if (input.parentId) {
        const [parentFolder] = await ctx.db
          .select()
          .from(folders)
          .where(
            and(
              eq(folders.id, input.parentId),
              eq(folders.userId, ctx.user.userId),
            ),
          )
          .limit(1);

        if (!parentFolder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent folder not found",
          });
        }
      }

      // Create the folder
      const [newFolder] = await ctx.db
        .insert(folders)
        .values({
          userId: ctx.user.userId,
          name: input.name,
          parentId: input.parentId || null,
          color: input.color || null,
        })
        .returning();

      return {
        id: newFolder.id,
        name: newFolder.name,
        parentId: newFolder.parentId,
        color: newFolder.color,
        createdAt: newFolder.createdAt,
        updatedAt: newFolder.updatedAt,
      };
    }),

  /**
   * List all folders for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        parentId: z.string().uuid().optional().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build the where clause
      const whereClause =
        input.parentId === undefined
          ? eq(folders.userId, ctx.user.userId)
          : input.parentId === null
            ? and(eq(folders.userId, ctx.user.userId), isNull(folders.parentId))
            : and(
                eq(folders.userId, ctx.user.userId),
                eq(folders.parentId, input.parentId),
              );

      const results = await ctx.db
        .select({
          id: folders.id,
          name: folders.name,
          parentId: folders.parentId,
          color: folders.color,
          createdAt: folders.createdAt,
          updatedAt: folders.updatedAt,
        })
        .from(folders)
        .where(whereClause)
        .orderBy(folders.name);

      return results;
    }),

  /**
   * Get a specific folder by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [folder] = await ctx.db
        .select()
        .from(folders)
        .where(
          and(eq(folders.id, input.id), eq(folders.userId, ctx.user.userId)),
        )
        .limit(1);

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      return {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        color: folder.color,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      };
    }),

  /**
   * Update a folder (rename, change color, or move)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        color: z.string().max(50).optional().nullable(),
        parentId: z.string().uuid().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify folder exists and belongs to user
      const [folder] = await ctx.db
        .select()
        .from(folders)
        .where(
          and(eq(folders.id, input.id), eq(folders.userId, ctx.user.userId)),
        )
        .limit(1);

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      // If moving to a new parent, verify parent exists and belongs to user
      if (input.parentId !== undefined && input.parentId !== null) {
        const [parentFolder] = await ctx.db
          .select()
          .from(folders)
          .where(
            and(
              eq(folders.id, input.parentId),
              eq(folders.userId, ctx.user.userId),
            ),
          )
          .limit(1);

        if (!parentFolder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent folder not found",
          });
        }

        // Prevent moving a folder into itself or its descendants
        if (input.parentId === input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot move a folder into itself",
          });
        }
      }

      // Build update object
      const updateData: {
        name?: string;
        color?: string | null;
        parentId?: string | null;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.parentId !== undefined) updateData.parentId = input.parentId;

      const [updatedFolder] = await ctx.db
        .update(folders)
        .set(updateData)
        .where(eq(folders.id, input.id))
        .returning();

      return {
        id: updatedFolder.id,
        name: updatedFolder.name,
        parentId: updatedFolder.parentId,
        color: updatedFolder.color,
        createdAt: updatedFolder.createdAt,
        updatedAt: updatedFolder.updatedAt,
      };
    }),

  /**
   * Delete a folder
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [folder] = await ctx.db
        .select()
        .from(folders)
        .where(
          and(eq(folders.id, input.id), eq(folders.userId, ctx.user.userId)),
        )
        .limit(1);

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      // TODO: Handle nested folders - either prevent deletion or cascade delete
      // For now, we'll just delete the folder
      await ctx.db.delete(folders).where(eq(folders.id, input.id));

      return {
        success: true,
        id: input.id,
      };
    }),

  /**
   * Get all files in a folder recursively (including subfolders)
   */
  getFilesInFolder: protectedProcedure
    .input(z.object({ folderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify folder exists and belongs to user
      const [folder] = await ctx.db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, input.folderId),
            eq(folders.userId, ctx.user.userId),
          ),
        )
        .limit(1);

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      // Recursively get all folder IDs (including the root folder)
      const getAllFolderIds = async (
        parentIds: string[],
      ): Promise<string[]> => {
        if (parentIds.length === 0) return [];

        const childFolders = await ctx.db
          .select({ id: folders.id })
          .from(folders)
          .where(
            and(
              eq(folders.userId, ctx.user.userId),
              inArray(folders.parentId, parentIds),
            ),
          );

        const childIds = childFolders.map((f) => f.id);
        const descendantIds = await getAllFolderIds(childIds);

        return [...childIds, ...descendantIds];
      };

      // Get all folder IDs including the root folder and all descendants
      const allFolderIds = [
        input.folderId,
        ...(await getAllFolderIds([input.folderId])),
      ];

      // Get all files in these folders
      const folderFiles = await ctx.db
        .select({
          id: files.id,
          folderId: files.folderId,
          filename: files.filename,
          originalFilename: files.originalFilename,
          mimeType: files.mimeType,
          size: files.size,
          createdAt: files.createdAt,
          processingStatus: files.processingStatus,
        })
        .from(files)
        .where(
          and(
            eq(files.userId, ctx.user.userId),
            inArray(files.folderId, allFolderIds),
          ),
        )
        .orderBy(files.originalFilename);

      return {
        folder: {
          id: folder.id,
          name: folder.name,
        },
        files: folderFiles,
        totalFiles: folderFiles.length,
      };
    }),
});
