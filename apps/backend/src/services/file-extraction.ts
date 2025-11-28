import { generateText } from 'ai';
import { promises as fs } from 'fs';
import { PDFParse } from 'pdf-parse';
import { getModel } from '../lib/ai-config.js';

export interface ExtractionResult {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Extract text content from a file using LLM
 */
export async function extractFileContent(
  filePath: string,
  mimeType: string,
  originalFilename: string
): Promise<ExtractionResult> {
  try {
    // Determine extraction strategy based on file type
    if (isTextFile(mimeType)) {
      return await extractTextFile(filePath);
    } else if (isPDF(mimeType)) {
      return await extractPDF(filePath);
    } else if (isImage(mimeType)) {
      return await extractImage(filePath);
    } else {
      // Fallback: try vision model for unknown types
      return await extractWithVision(filePath, mimeType);
    }
  } catch (error) {
    console.error('Extraction error:', error);
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if file is a text file (can be read directly)
 */
function isTextFile(mimeType: string): boolean {
  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/javascript' ||
    mimeType === 'application/xml'
  );
}

/**
 * Check if file is a PDF
 */
function isPDF(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if file is an image
 */
function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Extract content from plain text files
 */
async function extractTextFile(filePath: string): Promise<ExtractionResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // For simple text files, optionally use LLM to clean/structure
    // For now, just return the raw content
    // You can enhance this to use getModel('extraction-text') for processing

    return {
      success: true,
      content,
    };
  } catch (error) {
    throw new Error(`Failed to read text file: ${error}`);
  }
}

/**
 * Extract content from PDF
 *
 * Strategy:
 * 1. First attempt: Try extracting text directly using pdf-parse (fast, free)
 * 2. If successful (>100 chars): Return the text
 * 3. If failed (<100 chars): Fall back to vision model (slower, costs money)
 *
 * Why the 100 character threshold?
 * - Scanned PDFs return empty/minimal text → Need OCR via vision model
 * - Image-based PDFs return garbage characters → Need vision model
 * - Text-based PDFs return full content (usually 500+ chars) → Use direct extraction
 *
 * The threshold helps avoid paying for vision model API calls when simple extraction works.
 */
async function extractPDF(filePath: string): Promise<ExtractionResult> {
  try {
    // STEP 1: Attempt fast text extraction for text-based PDFs
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    // STEP 2: Check if we got meaningful text content
    // If PDF has >100 characters of extractable text, it's likely a proper text-based PDF
    // This catches scanned PDFs (0 chars) and malformed PDFs (<100 chars)
    if (data.text && data.text.trim().length > 100) {
      return {
        success: true,
        content: data.text,
      };
    }

    // STEP 3: Fall back to vision model for scanned/image-based PDFs
    // This uses OCR to extract text from PDF images (slower and costs API credits)
    const base64 = buffer.toString('base64');
    const model = getModel('extraction-vision');

    const result = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text content from this PDF document. Preserve the structure and formatting as much as possible. Return only the extracted text without any additional commentary.',
            },
            {
              type: 'image',
              image: base64,
            },
          ],
        },
      ],
    });

    return {
      success: true,
      content: result.text,
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF: ${error}`);
  }
}

/**
 * Extract content from images using vision model
 */
async function extractImage(filePath: string): Promise<ExtractionResult> {
  try {
    const buffer = await fs.readFile(filePath);
    const base64 = buffer.toString('base64');
    const model = getModel('extraction-vision');

    const result = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all visible text from this image. If there are tables, preserve their structure. If there are diagrams or charts, describe them. Return the content in a clear, structured format.',
            },
            {
              type: 'image',
              image: base64,
            },
          ],
        },
      ],
    });

    return {
      success: true,
      content: result.text,
    };
  } catch (error) {
    throw new Error(`Failed to extract image: ${error}`);
  }
}

/**
 * Extract content from unknown file types using vision model
 */
async function extractWithVision(
  filePath: string,
  _mimeType: string
): Promise<ExtractionResult> {
  try {
    const buffer = await fs.readFile(filePath);
    const base64 = buffer.toString('base64');
    const model = getModel('extraction-vision');

    const result = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this file and extract any meaningful text content. Describe the structure and content as clearly as possible.',
            },
            {
              type: 'image',
              image: base64,
            },
          ],
        },
      ],
    });

    return {
      success: true,
      content: result.text,
    };
  } catch (error) {
    throw new Error(`Failed to extract with vision model: ${error}`);
  }
}
