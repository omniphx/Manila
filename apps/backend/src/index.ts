import { clerkPlugin, getAuth } from "@clerk/fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import { env } from "./lib/env.js";
import { db } from "./lib/db.js";
import { files } from "./db/schema.js";
import { createContext } from "./trpc/context.js";
import { appRouter, type AppRouter } from "./trpc/router.js";
import { sql, eq } from "drizzle-orm";
import { extractFileContent } from "./services/file-extraction.js";
import { generateEmbeddings } from "./services/embeddings.js";

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true });

// Allowed MIME types - images and documents only
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Documents
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  'text/rtf',
  'application/rtf',
  'application/vnd.oasis.opendocument.text', // .odt
];

/**
 * Check if a MIME type is allowed for upload
 */
function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Process file extraction asynchronously
 */
async function processFileExtraction(
  fileId: string,
  filePath: string,
  mimeType: string,
  originalFilename: string
): Promise<void> {
  try {
    // Update status to processing
    await db
      .update(files)
      .set({ processingStatus: 'processing' })
      .where(eq(files.id, fileId));

    // Extract content
    const result = await extractFileContent(filePath, mimeType, originalFilename);

    if (result.success) {
      // Update with extracted content
      await db
        .update(files)
        .set({
          extractedContent: result.content,
          processingStatus: 'completed',
          processingError: null,
        })
        .where(eq(files.id, fileId));

      // Generate embeddings from extracted content
      // Get userId from file record
      const [file] = await db
        .select({ userId: files.userId })
        .from(files)
        .where(eq(files.id, fileId))
        .limit(1);

      if (file) {
        const embeddingResult = await generateEmbeddings(
          fileId,
          file.userId,
          result.content
        );

        if (!embeddingResult.success) {
          server.log.warn(
            { fileId, error: embeddingResult.error },
            'Failed to generate embeddings'
          );
        } else {
          server.log.info(
            { fileId, embeddingCount: embeddingResult.embeddingIds.length },
            'Generated embeddings successfully'
          );
        }
      }
    } else {
      // Update with error
      await db
        .update(files)
        .set({
          processingStatus: 'failed',
          processingError: result.error || 'Unknown error',
        })
        .where(eq(files.id, fileId));
    }
  } catch (error) {
    // Handle unexpected errors
    await db
      .update(files)
      .set({
        processingStatus: 'failed',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(files.id, fileId));
    throw error;
  }
}

const server = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
  disableRequestLogging: false,
  requestIdLogLabel: "reqId",
});

async function main() {
  try {
    await server.register(helmet, {
      contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    });

    await server.register(cors, {
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    });

    await server.register(rateLimit, {
      max: parseInt(env.RATE_LIMIT_MAX, 10),
      timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    });

    await server.register(clerkPlugin as any, {
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
    });

    await server.register(multipart, {
      limits: {
        fileSize: 200 * 1024 * 1024, // 200MB max file size
      },
    });

    await server.register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      trpcOptions: {
        router: appRouter,
        createContext,
        onError({ path, error }) {
          server.log.error({ err: error, path }, `Error in tRPC handler on path '${path}'`);
        },
      } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
    });

    // File download endpoint
    server.get("/files/:id", async (request, reply) => {
      try {
        const { id } = request.params as { id: string };

        // Check authentication
        const auth = getAuth(request as any);
        if (!auth.userId) {
          return reply.code(401).send({
            error: {
              message: "Unauthorized",
              statusCode: 401,
            },
          });
        }

        // Get file from database
        const [file] = await db
          .select()
          .from(files)
          .where(sql`${files.id} = ${id}`)
          .limit(1);

        if (!file || file.userId !== auth.userId) {
          return reply.code(404).send({
            error: {
              message: "File not found",
              statusCode: 404,
            },
          });
        }

        // Read and send file
        const fileBuffer = await fs.readFile(file.path);
        return reply
          .header('Content-Type', file.mimeType)
          .header('Content-Disposition', `attachment; filename="${file.originalFilename}"`)
          .send(fileBuffer);
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          error: {
            message: "Failed to download file",
            statusCode: 500,
          },
        });
      }
    });

    // File upload endpoint
    server.post("/upload", async (request, reply) => {
      try {
        // Check authentication
        const auth = getAuth(request as any);
        if (!auth.userId) {
          return reply.code(401).send({
            error: {
              message: "Unauthorized",
              statusCode: 401,
            },
          });
        }

        // Get the uploaded file
        const data = await request.file();

        if (!data) {
          return reply.code(400).send({
            error: {
              message: "No file uploaded",
              statusCode: 400,
            },
          });
        }

        // Get folderId from form fields if provided
        server.log.info({ fields: data.fields }, 'Upload fields received');
        const folderId = data.fields.folderId ? String((data.fields.folderId as any).value) : null;
        server.log.info({ folderId }, 'Parsed folderId');

        // Validate file type
        if (!isAllowedMimeType(data.mimetype)) {
          return reply.code(400).send({
            error: {
              message: `File type "${data.mimetype}" is not allowed. Please upload images or documents only (PDF, DOC, DOCX, TXT, RTF, ODT).`,
              statusCode: 400,
            },
          });
        }

        // Read file buffer
        const buffer = await data.toBuffer();

        // Generate unique filename
        const fileExtension = data.filename.split('.').pop() || '';
        const uniqueFilename = `${randomUUID()}.${fileExtension}`;
        const filePath = join(UPLOAD_DIR, uniqueFilename);

        // Write file to disk
        await fs.writeFile(filePath, buffer);

        // Create database entry
        const [newFile] = await db
          .insert(files)
          .values({
            userId: auth.userId,
            folderId: folderId || null,
            filename: uniqueFilename,
            originalFilename: data.filename,
            mimeType: data.mimetype,
            size: buffer.length.toString(),
            path: filePath,
            processingStatus: 'pending',
          })
          .returning();

        // Trigger async extraction (non-blocking)
        processFileExtraction(newFile.id, filePath, data.mimetype, data.filename).catch((err) => {
          server.log.error({ err, fileId: newFile.id }, 'Failed to process file extraction');
        });

        return {
          id: newFile.id,
          filename: newFile.filename,
          originalFilename: newFile.originalFilename,
          mimeType: newFile.mimeType,
          size: newFile.size,
          createdAt: newFile.createdAt,
          processingStatus: newFile.processingStatus,
        };
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({
          error: {
            message: "Failed to upload file",
            statusCode: 500,
          },
        });
      }
    });

    server.get("/", async () => {
      return {
        name: "File RAG Scanner API",
        version: "0.0.0",
        endpoints: {
          health: "/health",
          trpc: "/trpc",
          upload: "/upload",
        },
        documentation: "See README.md for API documentation",
      };
    });

    server.get("/health", async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });

    server.setErrorHandler((error: any, _request, reply) => {
      server.log.error(error);
      reply.status(error.statusCode || 500).send({
        error: {
          message: error.message || "Internal Server Error",
          statusCode: error.statusCode || 500,
        },
      });
    });

    const port = parseInt(env.PORT, 10);
    await server.listen({ port, host: env.HOST });

    server.log.info(`Server listening at http://${env.HOST}:${port}`);
    server.log.info(`tRPC endpoint: http://${env.HOST}:${port}/trpc`);
    server.log.info(`Health check: http://${env.HOST}:${port}/health`);
    server.log.info(`File upload: http://${env.HOST}:${port}/upload`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
