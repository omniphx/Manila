import { pgTable, uuid, varchar, timestamp, text, customType } from 'drizzle-orm/pg-core';

// Custom tsvector type for PostgreSQL full-text search
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
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
  contentHash: varchar('content_hash', { length: 64 }), // SHA-256 hash of file content for deduplication
  extractedContent: text('extracted_content'),
  processingStatus: varchar('processing_status', { length: 50 }).notNull().default('pending'), // pending, processing, completed, failed
  processingError: text('processing_error'),
  // Full-text search columns
  documentType: varchar('document_type', { length: 100 }), // e.g., 'pdf', 'tax_form', 'invoice', 'contract'
  documentYear: varchar('document_year', { length: 4 }), // Year for tax documents, reports, etc.
  documentDate: timestamp('document_date'), // Document date if available
  searchVector: tsvector('search_vector'), // tsvector for full-text search, computed from content + title
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

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
