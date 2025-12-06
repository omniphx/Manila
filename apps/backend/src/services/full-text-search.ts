import { db } from '../lib/db.js';
import { files } from '../db/schema.js';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

/**
 * Search filters for document search
 */
export interface SearchFilters {
  // Reserved for future filtering options
}

/**
 * Search result with snippet and ranking
 */
export interface SearchResult {
  id: string;
  filename: string;
  snippet: string;
  rank: number;
  headline: string; // Highlighted snippet with matched terms
}

/**
 * Paginated search results
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Full document content for retrieval
 */
export interface DocumentContent {
  id: string;
  filename: string;
  mimeType: string;
  size: string;
  content: string;
  createdAt: Date;
}

/**
 * Search documents using PostgreSQL full-text search
 *
 * @param userId - User ID to scope search
 * @param query - Search query string
 * @param filters - Optional filters (type, year, date range)
 * @param page - Page number (default: 1)
 * @param pageSize - Results per page (default: 10, max: 50)
 */
export async function searchDocuments(
  userId: string,
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResponse> {
  console.log('[Search] Starting search with:', { userId, query, filters, page, pageSize });

  // Validate pagination
  const validPageSize = Math.min(Math.max(1, pageSize), 50);
  const offset = (page - 1) * validPageSize;

  // Convert query to tsquery format
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => `${term}:*`)
    .join(' & ');

  console.log('[Search] Generated tsQuery:', tsQuery);

  // Build WHERE conditions
  const conditions: any[] = [eq(files.userId, userId)];

  // Add full-text search condition
  if (tsQuery) {
    conditions.push(sql`${files.searchVector} @@ to_tsquery('english', ${tsQuery})`);
  }

  // Execute search with ranking and snippets
  const results = await db
    .select({
      id: files.id,
      filename: files.originalFilename,
      snippet: sql<string>`LEFT(${files.extractedContent}, 500)`,
      rank: sql<number>`ts_rank(${files.searchVector}, to_tsquery('english', ${tsQuery}))`,
      headline: sql<string>`ts_headline('english', ${files.extractedContent}, to_tsquery('english', ${tsQuery}), 'MaxWords=50, MinWords=25, ShortWord=3, HighlightAll=FALSE, MaxFragments=3, FragmentDelimiter=" ... "')`,
    })
    .from(files)
    .where(and(...conditions))
    .orderBy(sql`ts_rank(${files.searchVector}, to_tsquery('english', ${tsQuery})) DESC`)
    .limit(validPageSize + 1) // Fetch one extra to check if there are more
    .offset(offset);

  // Check if there are more results
  const hasMore = results.length > validPageSize;
  const paginatedResults = results.slice(0, validPageSize);

  // Get total count for this search
  const [countResult] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(files)
    .where(and(...conditions));

  console.log('[Search] Results count:', results.length, 'Total:', countResult?.count);
  console.log('[Search] First result:', results[0]);

  return {
    results: paginatedResults.map((r) => ({
      id: r.id,
      filename: r.filename,
      snippet: r.snippet || '',
      rank: r.rank,
      headline: r.headline || r.snippet || '',
    })),
    total: countResult?.count || 0,
    page,
    pageSize: validPageSize,
    hasMore,
  };
}

/**
 * Get full content of a specific document by ID
 *
 * @param userId - User ID for access control
 * @param documentId - Document ID to retrieve
 * @param maxLength - Maximum content length to return (default: 50000 chars)
 */
export async function getDocument(
  userId: string,
  documentId: string,
  maxLength: number = 50000
): Promise<DocumentContent | null> {
  const [document] = await db
    .select({
      id: files.id,
      filename: files.originalFilename,
      mimeType: files.mimeType,
      size: files.size,
      content: files.extractedContent,
      createdAt: files.createdAt,
    })
    .from(files)
    .where(and(eq(files.id, documentId), eq(files.userId, userId)))
    .limit(1);

  if (!document) {
    return null;
  }

  // Truncate content if needed
  let content = document.content || '';
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '\n\n[Content truncated...]';
  }

  return {
    id: document.id,
    filename: document.filename,
    mimeType: document.mimeType,
    size: document.size,
    content,
    createdAt: document.createdAt,
  };
}
