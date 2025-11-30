import { pgTable, uuid, varchar, timestamp, text, vector } from 'drizzle-orm/pg-core';

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID (e.g., user_xxxxx)
  fileId: uuid('file_id'), // References files.id - null if embedding is not from a file
  content: text('content').notNull(), // The text chunk that was embedded
  contentHash: varchar('content_hash', { length: 64 }), // SHA-256 hash for deduplication
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  embeddingModel: varchar('embedding_model', { length: 100 }).notNull(), // e.g., 'text-embedding-3-small'
  metadata: text('metadata'), // JSON string: { chunkIndex: number, totalChunks: number, startPos: number, endPos: number }
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID (e.g., user_xxxxx)
  name: varchar('name', { length: 255 }).notNull(),
  parentId: uuid('parent_id'), // References folders.id for nested folders
  color: varchar('color', { length: 50 }), // Optional color for folder icon
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID (e.g., user_xxxxx)
  folderId: uuid('folder_id'), // References folders.id
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 127 }).notNull(),
  size: varchar('size', { length: 50 }).notNull(),
  path: text('path').notNull(),
  extractedContent: text('extracted_content'),
  processingStatus: varchar('processing_status', { length: 50 }).notNull().default('pending'), // pending, processing, completed, failed
  processingError: text('processing_error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID (e.g., user_xxxxx)
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON string for citations, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
